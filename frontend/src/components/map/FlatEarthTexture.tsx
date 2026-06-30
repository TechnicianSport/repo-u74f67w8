import { memo, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

const MAP_WIDTH = 30;
const MAP_HEIGHT = 20;

export const FlatEarthTexture = memo(function FlatEarthTexture() {
  const dayTex = useLoader(THREE.TextureLoader, "/textures/earth-day.jpg");

  useMemo(() => {
    dayTex.colorSpace = THREE.SRGBColorSpace;
    dayTex.minFilter = THREE.LinearMipmapLinearFilter;
    dayTex.magFilter = THREE.LinearFilter;
    dayTex.anisotropy = 8;
    dayTex.wrapS = THREE.ClampToEdgeWrapping;
    dayTex.wrapT = THREE.ClampToEdgeWrapping;
  }, [dayTex]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
      <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
      <meshStandardMaterial
        map={dayTex}
        roughness={0.85}
        metalness={0.1}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
});
