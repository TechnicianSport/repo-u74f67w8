import { memo, useMemo } from "react";
import { Html } from "@react-three/drei";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import worldData from "../../data/world-110m.json";
import { latLonToSphereXYZ, GLOBE_RADIUS } from "../../utils/sphereProjection";

interface CountryLabel {
  iso3: string;
  name: string;
  position: [number, number, number];
}

const LABEL_RADIUS = GLOBE_RADIUS + 0.15;

export const CountryLabels = memo(function CountryLabels() {
  const labels = useMemo(() => {
    const topology = worldData as unknown as Topology;
    const geoKey = Object.keys(topology.objects)[0];
    const geojson = feature(
      topology,
      topology.objects[geoKey] as GeometryCollection
    ) as FeatureCollection<Geometry, GeoJsonProperties>;

    const result: CountryLabel[] = [];

    for (const feat of geojson.features) {
      const props = feat.properties;
      if (!props) continue;
      const iso3 = (props.ISO_A3 ?? props.iso_a3 ?? props.ADM0_A3 ?? props.id ?? "") as string;
      const name = (props.NAME ?? props.name ?? props.ADMIN ?? iso3) as string;
      if (!iso3 || iso3 === "-99" || !name) continue;

      const geom = feat.geometry;
      let allCoords: number[][] = [];

      if (geom.type === "Polygon") {
        allCoords = geom.coordinates[0];
      } else if (geom.type === "MultiPolygon") {
        let largest: number[][] = [];
        let maxLen = 0;
        for (const poly of geom.coordinates) {
          if (poly[0].length > maxLen) {
            maxLen = poly[0].length;
            largest = poly[0];
          }
        }
        allCoords = largest;
      }

      if (allCoords.length === 0) continue;

      let latSum = 0;
      let lonSum = 0;
      for (const c of allCoords) {
        lonSum += c[0];
        latSum += c[1];
      }
      const centerLat = latSum / allCoords.length;
      const centerLon = lonSum / allCoords.length;

      const pos = latLonToSphereXYZ(centerLat, centerLon, LABEL_RADIUS);
      result.push({ iso3, name, position: pos });
    }

    return result;
  }, []);

  return (
    <group>
      {labels.map((label) => (
        <Html
          key={label.iso3}
          position={label.position}
          center
          style={{ pointerEvents: "none" }}
          zIndexRange={[5, 0]}
          distanceFactor={12}
          occlude={false}
        >
          <div
            style={{
              color: "rgba(160, 200, 240, 0.7)",
              fontSize: "8px",
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              textShadow: "0 0 4px rgba(0,30,60,0.9)",
              userSelect: "none",
            }}
          >
            {label.name}
          </div>
        </Html>
      ))}
    </group>
  );
});
