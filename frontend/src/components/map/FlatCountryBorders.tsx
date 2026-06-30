import { memo, useMemo } from "react";
import * as THREE from "three";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import worldData from "../../data/world-110m.json";
import { createProjection } from "../../utils/geoProjection";
import { MAP_SCALE } from "../../constants/mapConfig";

export const FlatCountryBorders = memo(function FlatCountryBorders() {
  const geometry = useMemo(() => {
    const projection = createProjection();
    const scale = MAP_SCALE;
    const topology = worldData as unknown as Topology;
    const geoKey = Object.keys(topology.objects)[0];
    const geojson = feature(
      topology,
      topology.objects[geoKey] as GeometryCollection
    ) as FeatureCollection<Geometry, GeoJsonProperties>;

    const positions: number[] = [];

    function addRing(coords: number[][]) {
      for (let i = 0; i < coords.length - 1; i++) {
        const a = projection([coords[i][0], coords[i][1]]);
        const b = projection([coords[i + 1][0], coords[i + 1][1]]);
        if (!a || !b) continue;
        positions.push(a[0] / scale, 0.04, -a[1] / scale);
        positions.push(b[0] / scale, 0.04, -b[1] / scale);
      }
    }

    for (const feat of geojson.features) {
      const geom = feat.geometry;
      if (geom.type === "Polygon") {
        for (const ring of geom.coordinates) addRing(ring);
      } else if (geom.type === "MultiPolygon") {
        for (const polygon of geom.coordinates) {
          for (const ring of polygon) addRing(ring);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#3A7ACC"
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </lineSegments>
  );
});
