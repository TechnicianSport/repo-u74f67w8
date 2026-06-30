import * as THREE from "three";

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function getSunDirection(date: Date = new Date()): THREE.Vector3 {
  const dayOfYear = getDayOfYear(date);
  const declinationDeg = -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
  const decRad = declinationDeg * (Math.PI / 180);

  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const hourAngleDeg = (12 - hours) * 15;
  const haRad = hourAngleDeg * (Math.PI / 180);

  const x = Math.cos(decRad) * Math.sin(haRad);
  const y = Math.sin(decRad);
  const z = Math.cos(decRad) * Math.cos(haRad);

  return new THREE.Vector3(x, y, z).normalize();
}

export function getSubsolarPoint(date: Date = new Date()): { lat: number; lon: number } {
  const dayOfYear = getDayOfYear(date);
  const lat = -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const lon = (12 - hours) * 15;
  return { lat, lon };
}
