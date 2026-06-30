import { memo, useMemo } from "react";
import * as THREE from "three";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import worldData from "../../data/world-110m.json";
import { latLonToSphere, GLOBE_RADIUS } from "../../utils/sphereProjection";

export const CountryBorders = memo(function CountryBorders() {
  const geometry = useMemo(() => {
    const topology = worldData as unknown as Topology;
    const geoKey = Object.keys(topology.objects)[0];
    const geojson = feature(
      topology,
      topology.objects[geoKey] as GeometryCollection
    ) as FeatureCollection<Geometry, GeoJsonProperties>;

    const positions: number[] = [];
    const borderRadius = GLOBE_RADIUS + 0.02;

    function addRing(coords: number[][]) {
      for (let i = 0; i < coords.length - 1; i++) {
        const a = latLonToSphere(coords[i][1], coords[i][0], borderRadius);
        const b = latLonToSphere(coords[i + 1][1], coords[i + 1][0], borderRadius);
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    for (const feat of geojson.features) {
      const geom = feat.geometry;
      if (geom.type === "Polygon") {
        for (const ring of geom.coordinates) {
          addRing(ring);
        }
      } else if (geom.type === "MultiPolygon") {
        for (const polygon of geom.coordinates) {
          for (const ring of polygon) {
            addRing(ring);
          }
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
        color="#2A5A8A"
        transparent
        opacity={0.4}
        depthWrite={false}
        linewidth={1}
      />
    </lineSegments>
  );
});
