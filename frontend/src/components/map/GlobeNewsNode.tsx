import React, { memo, useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Storyline, NewsCategory } from "../../types/news.types";
import { latLonToSphere, GLOBE_RADIUS } from "../../utils/sphereProjection";
import { CATEGORY_VISUALS } from "../../constants/categoryVisuals";
import { NODE_CONFIG } from "../../constants/mapConfig";
import { useMapStore } from "../../store/useMapStore";
import { useNewsStore } from "../../store/useNewsStore";

interface GlobeNewsNodeProps {
  storyline: Storyline;
}

function getGeometry(iconKey: string): React.JSX.Element {
  switch (iconKey) {
    case "globe":
      return <icosahedronGeometry args={[0.12, 1]} />;
    case "target":
      return <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />;
    case "chart":
      return <boxGeometry args={[0.07, 0.2, 0.07]} />;
    case "circuit":
      return <octahedronGeometry args={[0.11, 0]} />;
    case "cross":
      return <boxGeometry args={[0.06, 0.16, 0.06]} />;
    case "leaf":
      return <sphereGeometry args={[0.1, 16, 12]} />;
    case "shield":
      return <coneGeometry args={[0.11, 0.15, 6]} />;
    case "handshake":
      return <icosahedronGeometry args={[0.1, 1]} />;
    case "dot":
    default:
      return <sphereGeometry args={[0.08, 16, 16]} />;
  }
}

const _tempEmissive = new THREE.Color();
const NODE_HEIGHT = 0.2;

export const GlobeNewsNode = memo(function GlobeNewsNode({
  storyline,
}: GlobeNewsNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const hoveredNodeId = useMapStore((s) => s.hoveredNodeId);
  const selectedNodeId = useMapStore((s) => s.selectedNodeId);
  const setHovered = useMapStore((s) => s.setHovered);
  const setSelected = useMapStore((s) => s.setSelected);
  const setCameraMode = useMapStore((s) => s.setCameraMode);
  const setFocusTarget = useMapStore((s) => s.setFocusTarget);
  const selectStoryline = useNewsStore((s) => s.selectStoryline);

  const isHovered = hoveredNodeId === storyline.id;
  const isSelected = selectedNodeId === storyline.id;

  const [surfacePos, surfaceNormal, catVisual, baseScale, iconKey] = useMemo(() => {
    const pos = latLonToSphere(
      storyline.coordinates.lat,
      storyline.coordinates.lon,
      GLOBE_RADIUS + NODE_HEIGHT
    );
    const norm = pos.clone().normalize();
    const cv = CATEGORY_VISUALS[storyline.category as NewsCategory] ?? CATEGORY_VISUALS.other;
    const base = 0.08 + storyline.importance_peak * 0.12;
    const storylineScale = 1.0 + Math.min(storyline.total_count - 1, 5) * 0.06;
    return [pos, norm, cv, Math.min(base * storylineScale, NODE_CONFIG.maxScale * 0.08), cv.icon];
  }, [storyline]);

  const phaseOffset = useMemo(
    () => storyline.id.charCodeAt(0) + storyline.id.charCodeAt(1),
    [storyline.id]
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    const floatOffset = Math.sin(t * NODE_CONFIG.floatSpeed + phaseOffset) * 0.02;
    const floatPos = surfacePos.clone().add(surfaceNormal.clone().multiplyScalar(floatOffset));
    meshRef.current.position.copy(floatPos);

    let scale = baseScale;
    if (isHovered) scale *= NODE_CONFIG.hoverScaleMultiplier;
    if (isSelected) scale *= NODE_CONFIG.selectedScaleMultiplier;
    if (storyline.is_breaking) {
      scale *= 1.0 + Math.sin(t * 4) * 0.15;
    }
    meshRef.current.scale.setScalar(scale / baseScale);

    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const fresnelIntensity = isHovered ? 1.5 : isSelected ? 2.0 : 0.5;
    const pulse = 0.5 + 0.5 * Math.sin(t * 2);
    _tempEmissive.set(catVisual.glow).multiplyScalar(fresnelIntensity * (0.5 + pulse * 0.5));
    mat.emissive.copy(_tempEmissive);
    mat.emissiveIntensity = fresnelIntensity;
  });

  const handlePointerOver = useCallback(
    (e: THREE.Event) => {
      (e as unknown as { stopPropagation: () => void }).stopPropagation();
      setHovered(storyline.id);
      document.body.style.cursor = "pointer";
    },
    [setHovered, storyline.id]
  );

  const handlePointerOut = useCallback(() => {
    setHovered(null);
    document.body.style.cursor = "auto";
  }, [setHovered]);

  const handleClick = useCallback(
    (e: THREE.Event) => {
      (e as unknown as { stopPropagation: () => void }).stopPropagation();
      setSelected(storyline.id);
      selectStoryline(storyline.id);
      setCameraMode("focus");
      setFocusTarget([surfacePos.x, surfacePos.y, surfacePos.z]);
      useMapStore.getState().touchInteraction();
    },
    [setSelected, selectStoryline, setCameraMode, setFocusTarget, storyline.id, surfacePos]
  );

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        position={surfacePos}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        castShadow
      >
        {getGeometry(iconKey)}
        <meshStandardMaterial
          color={catVisual.glow}
          metalness={0.3}
          roughness={0.6}
          emissive={catVisual.glow}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {storyline.total_count > 1 && (
        <Html
          position={surfacePos.clone().add(surfaceNormal.clone().multiplyScalar(0.3)).toArray()}
          center
          style={{ pointerEvents: "none" }}
          zIndexRange={[10, 0]}
        >
          <div
            style={{
              color: catVisual.glow,
              fontSize: "9px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: "bold",
              textShadow: `0 0 6px ${catVisual.glow}`,
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            {isHovered
              ? `${storyline.city_en} \u00b7 ${storyline.category}`
              : `\u00d7${storyline.total_count}`}
          </div>
        </Html>
      )}

      {isHovered && (
        <Html
          position={surfacePos.clone().add(surfaceNormal.clone().multiplyScalar(0.5)).toArray()}
          center
          style={{ pointerEvents: "none" }}
          zIndexRange={[10, 0]}
        >
          <div
            style={{
              background: "rgba(5,13,26,0.92)",
              border: `1px solid ${catVisual.glow}40`,
              padding: "6px 10px",
              borderRadius: "4px",
              maxWidth: "200px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              color: "#E0EEFF",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              userSelect: "none",
              boxShadow: `0 0 12px ${catVisual.glow}30`,
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ color: catVisual.glow, fontSize: "9px", marginBottom: "2px" }}>
              {storyline.city_en}, {storyline.country_en}
            </div>
            {storyline.latest_package.content.headline_en.slice(0, 80)}
          </div>
        </Html>
      )}
    </group>
  );
});
