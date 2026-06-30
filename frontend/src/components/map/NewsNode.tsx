import React, { memo, useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { GeoProjection } from "d3-geo";
import type { Storyline, NewsCategory } from "../../types/news.types";
import { latLonToXZ } from "../../utils/geoProjection";
import { CATEGORY_VISUALS } from "../../constants/categoryVisuals";
import { NODE_CONFIG } from "../../constants/mapConfig";
import { useMapStore } from "../../store/useMapStore";
import { useNewsStore } from "../../store/useNewsStore";

interface NewsNodeProps {
  storyline: Storyline;
  projection: GeoProjection;
}

function getGeometry(iconKey: string): React.JSX.Element {
  switch (iconKey) {
    case "globe":
      return <icosahedronGeometry args={[0.18, 1]} />;
    case "target":
      return <cylinderGeometry args={[0.15, 0.15, 0.06, 16]} />;
    case "chart":
      return <boxGeometry args={[0.1, 0.3, 0.1]} />;
    case "circuit":
      return <octahedronGeometry args={[0.16, 0]} />;
    case "cross":
      return <boxGeometry args={[0.08, 0.24, 0.08]} />;
    case "leaf":
      return <sphereGeometry args={[0.15, 16, 12]} />;
    case "shield":
      return <coneGeometry args={[0.16, 0.22, 6]} />;
    case "handshake":
      return <icosahedronGeometry args={[0.15, 1]} />;
    case "dot":
    default:
      return <sphereGeometry args={[0.12, 16, 16]} />;
  }
}

const _tempEmissive = new THREE.Color();

export const NewsNode = memo(function NewsNode({
  storyline,
  projection,
}: NewsNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const hoveredNodeId = useMapStore((s) => s.hoveredNodeId);
  const selectedNodeId = useMapStore((s) => s.selectedNodeId);
  const setHovered = useMapStore((s) => s.setHovered);
  const setSelected = useMapStore((s) => s.setSelected);
  const setCameraMode = useMapStore((s) => s.setCameraMode);
  const setFocusTarget = useMapStore((s) => s.setFocusTarget);
  const selectStoryline = useNewsStore((s) => s.selectStoryline);

  const isHovered = hoveredNodeId === storyline.id;
  const isSelected = selectedNodeId === storyline.id;

  const [xz, catVisual, baseScale, iconKey] = useMemo(() => {
    const pos = latLonToXZ(
      storyline.coordinates.lat,
      storyline.coordinates.lon,
      projection
    );
    const cv = CATEGORY_VISUALS[storyline.category as NewsCategory] ?? CATEGORY_VISUALS.other;
    const base =
      0.12 + storyline.importance_peak * 0.18;
    const storylineScale = 1.0 + Math.min(storyline.total_count - 1, 5) * 0.08;
    const ik = cv.icon;
    return [pos, cv, Math.min(base * storylineScale, NODE_CONFIG.maxScale * 0.12), ik];
  }, [storyline, projection]);

  const phaseOffset = useMemo(
    () => storyline.id.charCodeAt(0) + storyline.id.charCodeAt(1),
    [storyline.id]
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;

    const floatY =
      NODE_CONFIG.baseY +
      Math.sin(t * NODE_CONFIG.floatSpeed + phaseOffset) * NODE_CONFIG.floatAmplitude;
    meshRef.current.position.y = floatY;

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
    _tempEmissive
      .set(catVisual.glow)
      .multiplyScalar(fresnelIntensity * (0.5 + pulse * 0.5));
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
      setFocusTarget([xz[0], 0, xz[1]]);
      useMapStore.getState().touchInteraction();
    },
    [setSelected, selectStoryline, setCameraMode, setFocusTarget, storyline.id, xz]
  );

  return (
    <group position={[xz[0], 0, xz[1]]}>
      <mesh
        ref={meshRef}
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
          position={[0, 0.45, 0]}
          center
          style={{ pointerEvents: "none" }}
          zIndexRange={[10, 0]}
        >
          <div
            style={{
              color: catVisual.glow,
              fontSize: "10px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: "bold",
              textShadow: `0 0 6px ${catVisual.glow}`,
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            {isHovered
              ? `${storyline.city_en} · ${storyline.category}`
              : `×${storyline.total_count}`}
          </div>
        </Html>
      )}

      {isHovered && (
        <Html
          position={[0, 0.6, 0]}
          center
          style={{ pointerEvents: "none" }}
          zIndexRange={[10, 0]}
        >
          <div
            style={{
              background: "rgba(5,13,26,0.92)",
              border: `1px solid ${catVisual.glow}40`,
              padding: "6px 10px",
              borderRadius: "2px",
              maxWidth: "200px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              color: "#E0EEFF",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              userSelect: "none",
              boxShadow: `0 0 12px ${catVisual.glow}30`,
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
