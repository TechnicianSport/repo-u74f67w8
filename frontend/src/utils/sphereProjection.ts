import * as THREE from "three";

export const GLOBE_RADIUS = 5;

export function latLonToSphere(
  lat: number,
  lon: number,
  radius: number = GLOBE_RADIUS
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function latLonToSphereXYZ(
  lat: number,
  lon: number,
  radius: number = GLOBE_RADIUS
): [number, number, number] {
  const v = latLonToSphere(lat, lon, radius);
  return [v.x, v.y, v.z];
}

export function surfaceNormal(lat: number, lon: number): THREE.Vector3 {
  return latLonToSphere(lat, lon, 1).normalize();
}
