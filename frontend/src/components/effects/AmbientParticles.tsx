import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 200;

export const AmbientParticles = memo(function AmbientParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const data: { pos: THREE.Vector3; vel: THREE.Vector3; phase: number }[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      data.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 60,
          Math.random() * 15 + 2,
          (Math.random() - 0.5) * 40
        ),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.003
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }
    return data;
  }, []);

  const _matrix = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      p.pos.add(p.vel);
      p.pos.x += Math.sin(t * 0.3 + p.phase) * 0.002;
      p.pos.y += Math.cos(t * 0.2 + p.phase) * 0.001;

      if (Math.abs(p.pos.x) > 30) p.vel.x *= -1;
      if (p.pos.y < 1 || p.pos.y > 20) p.vel.y *= -1;
      if (Math.abs(p.pos.z) > 20) p.vel.z *= -1;

      const scale = 0.02 + Math.sin(t + p.phase) * 0.01;
      _matrix.makeScale(scale, scale, scale);
      _matrix.setPosition(p.pos);
      mesh.setMatrixAt(i, _matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color="#4488CC"
        transparent
        opacity={0.1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
});
