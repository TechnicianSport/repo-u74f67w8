import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OCEAN } from "../../constants/mapConfig";

export const OceanPlane = memo(function OceanPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#000B1A") },
      uColor2: { value: new THREE.Color("#001E3C") },
      uWaveHeight: { value: 0.04 },
      uWaveFreq: { value: 2.0 },
      uWaveSpeed: { value: 0.8 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, OCEAN.yPosition, 0]}
    >
      <planeGeometry args={[200, 200, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        vertexShader={`
          uniform float uTime;
          uniform float uWaveHeight;
          uniform float uWaveFreq;
          uniform float uWaveSpeed;
          varying vec2 vUv;
          varying float vHeight;

          void main() {
            vUv = uv;
            vec3 pos = position;
            float w1 = sin(pos.x * uWaveFreq + uTime * uWaveSpeed) * uWaveHeight;
            float w2 = sin(pos.y * uWaveFreq * 0.7 + uTime * uWaveSpeed * 1.3) * uWaveHeight * 0.6;
            pos.z += w1 + w2;
            vHeight = pos.z;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform float uTime;
          varying vec2 vUv;
          varying float vHeight;

          void main() {
            float t = smoothstep(-0.04, 0.04, vHeight);
            vec3 color = mix(uColor1, uColor2, t);
            float foam = smoothstep(0.03, 0.04, vHeight) * 0.15;
            color += vec3(foam);
            gl_FragColor = vec4(color, 0.6);
          }
        `}
      />
    </mesh>
  );
});
