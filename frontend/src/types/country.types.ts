import type { BufferGeometry } from "three";
import type { GeoProjection } from "d3-geo";

export interface CountryData {
  iso3: string;
  name: string;
  geometry: BufferGeometry;
  centroid: [number, number];
}

export interface CountryGeometryResult {
  geometries: Map<string, BufferGeometry>;
  centroids: Map<string, [number, number]>;
  projection: GeoProjection;
}
