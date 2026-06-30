import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONNECTION_CONFIG } from "../../constants/mapConfig";

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  importance: number;
}

export const ConnectionLine = memo(function ConnectionLine({
  start,
  end,
  color,
  importance,
}: ConnectionLineProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { tubeGeometry, uniforms } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const mid = new THREE.Vector3()
      .addVectors(startVec, endVec)
      .multiplyScalar(0.5);
    const dist = startVec.distanceTo(endVec);
    mid.y = dist * CONNECTION_CONFIG.arcHeightFactor;

    const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
    const radius =
      CONNECTION_CONFIG.baseRadius +
      importance * CONNECTION_CONFIG.importanceRadiusMultiplier;
    const geo = new THREE.TubeGeometry(
      curve,
      CONNECTION_CONFIG.segments,
      radius,
      8,
      false
    );

    const u = {
      uTime: { value: 0 },
      uFlowColor: { value: new THREE.Color(color) },
      uFlowSpeed: { value: 0.5 },
      uOpacity: { value: 0 },
    };

    return { tubeGeometry: geo, uniforms: u };
  }, [start, end, color, importance]);

  const birthTime = useRef(0);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    if (birthTime.current === 0) birthTime.current = clock.elapsedTime;

    const age = clock.elapsedTime - birthTime.current;
    const fadeIn = Math.min(age / CONNECTION_CONFIG.fadeInDuration, 1);

    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uOpacity.value = fadeIn * 0.5;
  });

  return (
    <mesh ref={meshRef} geometry={tubeGeometry}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uFlowColor;
          uniform float uFlowSpeed;
          uniform float uOpacity;
          varying vec2 vUv;

          void main() {
            float flow = fract(vUv.x - uTime * uFlowSpeed);
            float particle = smoothstep(0.0, 0.05, flow) * smoothstep(0.1, 0.05, flow);
            vec3 color = uFlowColor * (0.3 + particle * 3.0);
            float alpha = uOpacity + particle * 0.5;
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
});
