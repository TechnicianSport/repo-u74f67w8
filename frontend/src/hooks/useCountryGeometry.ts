import { useMemo } from "react";
import * as THREE from "three";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import type { GeoProjection } from "d3-geo";
import { createProjection } from "../utils/geoProjection";
import { COUNTRY_EXTRUDE } from "../constants/mapConfig";
import worldData from "../data/world-110m.json";

interface CountryGeometryResult {
  geometries: Map<string, THREE.BufferGeometry>;
  centroids: Map<string, [number, number]>;
  projection: GeoProjection;
  names: Map<string, string>;
}

function projectCoords(
  coords: number[][],
  projection: GeoProjection,
  scale: number
): THREE.Vector2[] {
  return coords
    .map((c) => {
      const p = projection([c[0], c[1]]);
      if (!p) return null;
      return new THREE.Vector2(p[0] / scale, -p[1] / scale);
    })
    .filter((v): v is THREE.Vector2 => v !== null);
}

function createShapeFromPolygon(
  rings: number[][][],
  projection: GeoProjection,
  scale: number
): THREE.Shape | null {
  if (rings.length === 0) return null;
  const outerPoints = projectCoords(rings[0], projection, scale);
  if (outerPoints.length < 3) return null;

  const shape = new THREE.Shape(outerPoints);

  for (let i = 1; i < rings.length; i++) {
    const holePoints = projectCoords(rings[i], projection, scale);
    if (holePoints.length >= 3) {
      shape.holes.push(new THREE.Path(holePoints));
    }
  }

  return shape;
}

export function useCountryGeometry(): CountryGeometryResult {
  return useMemo(() => {
    const projection = createProjection();
    const scale = 120;
    const geometries = new Map<string, THREE.BufferGeometry>();
    const centroids = new Map<string, [number, number]>();
    const names = new Map<string, string>();

    const topology = worldData as unknown as Topology;
    const geoKey = Object.keys(topology.objects)[0];
    const geojson = feature(
      topology,
      topology.objects[geoKey] as GeometryCollection
    ) as FeatureCollection<Geometry, GeoJsonProperties>;

    for (const feat of geojson.features) {
      const props = feat.properties;
      if (!props) continue;

      const iso3 = (props.ISO_A3 ?? props.iso_a3 ?? props.ADM0_A3 ?? props.id ?? "") as string;
      const name = (props.NAME ?? props.name ?? props.ADMIN ?? iso3) as string;

      if (!iso3 || iso3 === "-99") continue;

      const shapes: THREE.Shape[] = [];

      if (feat.geometry.type === "Polygon") {
        const shape = createShapeFromPolygon(
          feat.geometry.coordinates,
          projection,
          scale
        );
        if (shape) shapes.push(shape);
      } else if (feat.geometry.type === "MultiPolygon") {
        let largestArea = 0;
        let largestShape: THREE.Shape | null = null;

        for (const polygon of feat.geometry.coordinates) {
          const shape = createShapeFromPolygon(polygon, projection, scale);
          if (shape) {
            const area = THREE.ShapeUtils.area(shape.getPoints());
            const absArea = Math.abs(area);
            if (absArea > largestArea) {
              largestArea = absArea;
              largestShape = shape;
            }
            shapes.push(shape);
          }
        }

        if (largestShape) {
          const centroidPts = largestShape.getPoints();
          let cx = 0, cy = 0;
          for (const pt of centroidPts) {
            cx += pt.x;
            cy += pt.y;
          }
          cx /= centroidPts.length;
          cy /= centroidPts.length;
          centroids.set(iso3, [cx, cy]);
        }
      }

      if (shapes.length === 0) continue;

      const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: COUNTRY_EXTRUDE.depth,
        bevelEnabled: COUNTRY_EXTRUDE.bevelEnabled,
        bevelThickness: COUNTRY_EXTRUDE.bevelThickness,
        bevelSize: COUNTRY_EXTRUDE.bevelSize,
        bevelSegments: COUNTRY_EXTRUDE.bevelSegments,
      };

      const geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
      geometry.rotateX(-Math.PI / 2);
      geometry.computeVertexNormals();

      geometries.set(iso3, geometry);
      names.set(iso3, name);

      if (!centroids.has(iso3) && shapes.length > 0) {
        const pts = shapes[0].getPoints();
        let cx = 0, cy = 0;
        for (const pt of pts) {
          cx += pt.x;
          cy += pt.y;
        }
        cx /= pts.length;
        cy /= pts.length;
        centroids.set(iso3, [cx, cy]);
      }
    }

    return { geometries, centroids, projection, names };
  }, []);
}
