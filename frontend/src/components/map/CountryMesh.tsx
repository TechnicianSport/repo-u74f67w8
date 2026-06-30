import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CountryMeshProps {
  iso3: string;
  geometry: THREE.BufferGeometry;
}

const _color = new THREE.Color();

export const CountryMesh = memo(function CountryMesh({
  geometry,
}: CountryMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const t = clock.elapsedTime;
    const rimPulse = 0.02 + Math.sin(t * 0.3 + timeOffset) * 0.01;
    _color.set("#0A1520").addScalar(rimPulse);
    mat.emissive.copy(_color);
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, 0.02, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color="#0D1B2A"
        metalness={0.4}
        roughness={0.7}
        emissive="#0A1520"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
});
