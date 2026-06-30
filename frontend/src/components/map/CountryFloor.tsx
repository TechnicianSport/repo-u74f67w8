import { memo } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import { FLOOR } from "../../constants/mapConfig";

export const CountryFloor = memo(function CountryFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <MeshReflectorMaterial
        mirror={0}
        resolution={FLOOR.resolution}
        blur={FLOOR.blur}
        mixBlur={1}
        mixStrength={FLOOR.mixStrength}
        roughness={FLOOR.roughness}
        depthScale={0}
        color={FLOOR.color}
        metalness={0.5}
      />
    </mesh>
  );
});
