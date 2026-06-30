import { memo, useMemo } from "react";
import { Html } from "@react-three/drei";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import worldData from "../../data/world-110m.json";
import { createProjection } from "../../utils/geoProjection";
import { MAP_SCALE } from "../../constants/mapConfig";

interface LabelData {
  iso3: string;
  name: string;
  position: [number, number, number];
}

export const FlatCountryLabels = memo(function FlatCountryLabels() {
  const labels = useMemo(() => {
    const projection = createProjection();
    const scale = MAP_SCALE;
    const topology = worldData as unknown as Topology;
    const geoKey = Object.keys(topology.objects)[0];
    const geojson = feature(
      topology,
      topology.objects[geoKey] as GeometryCollection
    ) as FeatureCollection<Geometry, GeoJsonProperties>;

    const result: LabelData[] = [];

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

      let lonSum = 0;
      let latSum = 0;
      for (const c of allCoords) {
        lonSum += c[0];
        latSum += c[1];
      }
      const centerLon = lonSum / allCoords.length;
      const centerLat = latSum / allCoords.length;

      const projected = projection([centerLon, centerLat]);
      if (!projected) continue;

      const x = projected[0] / scale;
      const z = -projected[1] / scale;
      result.push({ iso3, name, position: [x, 0.1, z] });
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
        >
          <div
            style={{
              color: "rgba(160, 200, 240, 0.6)",
              fontSize: "7px",
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
