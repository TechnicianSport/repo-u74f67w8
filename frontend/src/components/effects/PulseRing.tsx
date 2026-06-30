import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMapStore } from "../../store/useMapStore";
import { CATEGORY_VISUALS } from "../../constants/categoryVisuals";
import type { NewsCategory } from "../../types/news.types";

const RING_DURATIONS: Record<string, { count: number; duration: number }> = {
  military: { count: 3, duration: 0.8 },
  economy: { count: 1, duration: 2.5 },
  technology: { count: 1, duration: 1.8 },
  health: { count: 1, duration: 2.0 },
  climate: { count: 1, duration: 2.2 },
  geopolitical: { count: 2, duration: 1.5 },
  security: { count: 1, duration: 0.6 },
  diplomacy: { count: 2, duration: 2.0 },
  social: { count: 1, duration: 1.5 },
  other: { count: 1, duration: 1.5 },
};

export const PulseRing = memo(function PulseRing() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const pulseRings = useMapStore((s) => s.pulseRings);
  const removePulseRing = useMapStore((s) => s.removePulseRing);

  const maxRings = 60;
  const geometry = useMemo(() => new THREE.RingGeometry(0.1, 0.15, 32), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  );

  const _matrix = useMemo(() => new THREE.Matrix4(), []);
  const _color = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const now = clock.elapsedTime;
    let visibleCount = 0;

    for (const ring of pulseRings) {
      const elapsed = now - ring.startTime;
      const cfg = RING_DURATIONS[ring.category] ?? RING_DURATIONS.other;
      const catVis = CATEGORY_VISUALS[ring.category as NewsCategory] ?? CATEGORY_VISUALS.other;

      if (elapsed > cfg.duration) {
        removePulseRing(ring.id);
        continue;
      }

      const progress = elapsed / cfg.duration;
      const scale = progress * 3.5;
      _matrix.makeScale(scale, scale, 1);
      _matrix.setPosition(
        ring.position[0],
        ring.position[1] + 0.05,
        ring.position[2]
      );

      const rotMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
      _matrix.multiply(rotMatrix);

      mesh.setMatrixAt(visibleCount, _matrix);
      _color.set(catVis.glow);
      mesh.setColorAt(visibleCount, _color);

      visibleCount++;
      if (visibleCount >= maxRings) break;
    }

    mesh.count = visibleCount;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    material.opacity = 0.6;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, maxRings]}
      frustumCulled={false}
    />
  );
});
