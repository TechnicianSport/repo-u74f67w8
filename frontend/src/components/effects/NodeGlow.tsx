import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NodeGlowProps {
  position: [number, number, number];
  color: string;
  intensity: number;
}

export const NodeGlow = memo(function NodeGlow({
  position,
  color,
  intensity,
}: NodeGlowProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    }),
    [color, intensity]
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.8, 0.8]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          uniform float uIntensity;
          varying vec2 vUv;

          void main() {
            float dist = length(vUv - 0.5) * 2.0;
            float glow = 1.0 - smoothstep(0.0, 1.0, dist);
            glow = pow(glow, 2.0);
            float pulse = 0.8 + 0.2 * sin(uTime * 2.0);
            gl_FragColor = vec4(uColor * glow * uIntensity * pulse, glow * 0.4);
          }
        `}
      />
    </mesh>
  );
});
