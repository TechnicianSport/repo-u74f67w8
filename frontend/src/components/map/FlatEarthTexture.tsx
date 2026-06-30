import { memo, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { createProjection } from "../../utils/geoProjection";
import { MAP_SCALE } from "../../constants/mapConfig";

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

  const { geometry } = useMemo(() => {
    const projection = createProjection();
    const scale = MAP_SCALE;

    const topLeft = projection([-180, 85]);
    const topRight = projection([180, 85]);
    const bottomLeft = projection([-180, -60]);
    const bottomRight = projection([180, -60]);

    if (!topLeft || !topRight || !bottomLeft || !bottomRight) {
      return { geometry: new THREE.PlaneGeometry(30, 20) };
    }

    const left = topLeft[0] / scale;
    const right = topRight[0] / scale;
    const top = -topLeft[1] / scale;
    const bottom = -bottomLeft[1] / scale;

    const width = right - left;
    const height = top - bottom;
    const cx = (left + right) / 2;
    const cz = (top + bottom) / 2;

    const segX = 128;
    const segY = 64;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iy = 0; iy <= segY; iy++) {
      const v = iy / segY;
      const lat = 85 - v * 145;
      for (let ix = 0; ix <= segX; ix++) {
        const u = ix / segX;
        const lon = -180 + u * 360;
        const projected = projection([lon, lat]);
        if (projected) {
          const px = projected[0] / scale - cx;
          const pz = -(projected[1] / scale) - cz;
          positions.push(px, 0, pz);
        } else {
          const px = left + u * width - cx;
          const pz = top - v * height - cz;
          positions.push(px, 0, pz);
        }
        uvs.push(u, 1 - v);
      }
    }

    for (let iy = 0; iy < segY; iy++) {
      for (let ix = 0; ix < segX; ix++) {
        const a = iy * (segX + 1) + ix;
        const b = a + 1;
        const c = a + (segX + 1);
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return { geometry: geo };
  }, []);

  return (
    <mesh geometry={geometry} position={[0, 0.005, 0]} receiveShadow>
      <meshStandardMaterial
        map={dayTex}
        roughness={0.85}
        metalness={0.1}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
});
