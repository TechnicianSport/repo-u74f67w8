import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLOBE_RADIUS } from "../../utils/sphereProjection";
import { getSunDirection } from "../../utils/sunPosition";

const ATMO_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMO_FRAGMENT = `
  uniform vec3 sunDirection;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vNormal);

    float rim = 1.0 - max(dot(normal, viewDir), 0.0);
    rim = pow(rim, 2.5);

    vec3 sunDir = normalize(sunDirection);
    float sunDot = dot(normal, sunDir);
    float dayFactor = smoothstep(-0.2, 0.3, sunDot);

    vec3 dayAtmo = vec3(0.3, 0.6, 1.0);
    vec3 nightAtmo = vec3(0.02, 0.05, 0.12);
    vec3 sunsetAtmo = vec3(1.0, 0.4, 0.1);

    float sunsetFactor = smoothstep(-0.15, 0.0, sunDot) * smoothstep(0.2, 0.0, sunDot);

    vec3 atmoColor = mix(nightAtmo, dayAtmo, dayFactor);
    atmoColor = mix(atmoColor, sunsetAtmo, sunsetFactor * 0.6);

    float alpha = rim * 0.6;
    alpha *= mix(0.3, 1.0, dayFactor);

    gl_FragColor = vec4(atmoColor, alpha);
  }
`;

export const GlobeAtmosphere = memo(function GlobeAtmosphere() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      sunDirection: { value: getSunDirection() },
    }),
    []
  );

  useFrame(() => {
    if (matRef.current) {
      matRef.current.uniforms.sunDirection.value.copy(getSunDirection());
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS + 0.15, 64, 32]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={ATMO_VERTEX}
        fragmentShader={ATMO_FRAGMENT}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
});
