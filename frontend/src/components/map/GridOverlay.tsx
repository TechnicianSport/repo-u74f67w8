import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GRID } from "../../constants/mapConfig";

export const GridOverlay = memo(function GridOverlay() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(GRID.lineColor) },
      uCellSize: { value: GRID.cellSize },
      uMinOpacity: { value: GRID.minOpacity },
      uMaxOpacity: { value: GRID.maxOpacity },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GRID.yPosition, 0]}>
      <planeGeometry args={[200, 200, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        vertexShader={`
          varying vec2 vWorldPos;
          void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          uniform float uCellSize;
          uniform float uMinOpacity;
          uniform float uMaxOpacity;
          varying vec2 vWorldPos;

          void main() {
            vec2 grid = abs(fract(vWorldPos / uCellSize - 0.5) - 0.5) / fwidth(vWorldPos / uCellSize);
            float line = min(grid.x, grid.y);
            float gridAlpha = 1.0 - min(line, 1.0);
            float pulse = uMinOpacity + (uMaxOpacity - uMinOpacity) * (0.5 + 0.5 * sin(uTime * 0.5));
            float alpha = gridAlpha * pulse;
            float dist = length(vWorldPos) * 0.02;
            alpha *= max(1.0 - dist, 0.0);
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </mesh>
  );
});
