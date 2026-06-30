import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ATMOSPHERE } from "../../constants/mapConfig";

export const AtmosphereLayer = memo(function AtmosphereLayer() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uInnerColor: { value: new THREE.Color(ATMOSPHERE.backgroundGradient.inner) },
      uOuterColor: { value: new THREE.Color(ATMOSPHERE.backgroundGradient.outer) },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[ATMOSPHERE.radius, 64, 32]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        vertexShader={`
          varying vec3 vWorldPosition;
          varying vec3 vNormal;
          void main() {
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uInnerColor;
          uniform vec3 uOuterColor;
          varying vec3 vWorldPosition;
          varying vec3 vNormal;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }

          void main() {
            float y = normalize(vWorldPosition).y;
            float t = smoothstep(-0.3, 0.8, y);
            vec3 color = mix(uOuterColor, uInnerColor, t);

            // Stars
            vec2 starUV = vWorldPosition.xz * 0.5 + vWorldPosition.xy * 0.3;
            float star = hash(floor(starUV * 100.0));
            star = step(0.998, star);
            float twinkle = 0.5 + 0.5 * sin(uTime * 2.0 + hash(floor(starUV * 100.0)) * 6.28);
            color += vec3(star * twinkle * 0.6);

            // Nebula patches
            float nebula = hash(floor(vWorldPosition.xz * 0.1));
            nebula = smoothstep(0.7, 0.9, nebula) * 0.03;
            color += vec3(nebula * 0.2, nebula * 0.1, nebula * 0.4);

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
});
