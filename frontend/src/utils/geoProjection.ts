import { geoMercator, type GeoProjection } from "d3-geo";
import { MAP_SCALE } from "../constants/mapConfig";

const SCALE_FACTOR = MAP_SCALE;

export function createProjection(): GeoProjection {
  return geoMercator()
    .scale(SCALE_FACTOR)
    .translate([0, 0])
    .center([0, 20]);
}

export function latLonToXZ(
  lat: number,
  lon: number,
  projection: GeoProjection
): [number, number] {
  const projected = projection([lon, lat]);
  if (!projected) return [0, 0];
  const [x, y] = projected;
  return [x / SCALE_FACTOR, -y / SCALE_FACTOR];
}
