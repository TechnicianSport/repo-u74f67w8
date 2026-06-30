import { memo } from "react";

export const CountryFloor = memo(function CountryFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial
        color="#020408"
        roughness={0.95}
        metalness={0.0}
      />
    </mesh>
  );
});
