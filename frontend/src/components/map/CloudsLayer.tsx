import { memo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLOBE_RADIUS } from "../../utils/sphereProjection";

export const CloudsLayer = memo(function CloudsLayer() {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudTex = useLoader(THREE.TextureLoader, "/textures/earth-clouds.png");

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.00005;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0, -Math.PI / 2, 0]}>
      <sphereGeometry args={[GLOBE_RADIUS + 0.04, 96, 48]} />
      <meshPhongMaterial
        map={cloudTex}
        transparent
        opacity={0.35}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
});
