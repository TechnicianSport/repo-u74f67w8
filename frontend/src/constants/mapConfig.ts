export const MAP_SCALE = 120;

export const MAP_WIDTH = 30;
export const MAP_HEIGHT = 20;

export const CAMERA_OVERVIEW = {
  position: [0, 18, 24] as const,
  target: [0, 0, 0] as const,
  fov: 45,
};

export const CAMERA_FOCUS = {
  yOffset: 10,
  zOffset: 6,
  fov: 35,
};

export const CAMERA_LIMITS = {
  minDistance: 4,
  maxDistance: 45,
  minPolarAngle: (10 * Math.PI) / 180,
  maxPolarAngle: (80 * Math.PI) / 180,
};

export const COUNTRY_EXTRUDE = {
  depth: 0.08,
  bevelEnabled: true,
  bevelThickness: 0.012,
  bevelSize: 0.008,
  bevelSegments: 3,
};

export const NODE_CONFIG = {
  baseY: 0.15,
  floatAmplitude: 0.04,
  floatSpeed: 1.2,
  hoverScaleMultiplier: 1.3,
  selectedScaleMultiplier: 1.5,
  maxScale: 2.5,
  maxVisibleNodes: 500,
  clusterDistance: 0.5,
};

export const RING_CONFIG = {
  maxRings: 60,
  maxScale: 3.5,
};

export const CONNECTION_CONFIG = {
  maxConnections: 60,
  baseRadius: 0.01,
  importanceRadiusMultiplier: 0.04,
  arcHeightFactor: 0.25,
  segments: 64,
  fadeInDuration: 1.0,
  fadeOutDuration: 0.5,
};

export const LIGHTING = {
  ambient: { intensity: 0.6, color: "#CCCCDD" },
  directional: { intensity: 1.2, position: [50, 80, 30] as const, shadowMapSize: 4096 },
  point: { intensity: 0.3, color: "#0033FF", position: [0, -5, 0] as const },
};

export const FLOOR = {
  color: "#050510",
  resolution: 1024,
  blur: [400, 100] as [number, number],
  mixStrength: 0.8,
  roughness: 0.9,
};

export const OCEAN = {
  color: "#000B1A",
  scale: 4,
  reflectivity: 0.4,
  yPosition: -0.01,
};

export const GRID = {
  lineColor: "#001833",
  cellSize: 1,
  minOpacity: 0.05,
  maxOpacity: 0.2,
  yPosition: 0.01,
};

export const ATMOSPHERE = {
  radius: 80,
  backgroundGradient: { inner: "#000005", outer: "#050015" },
  starCount: 3000,
};

export const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const VITE_WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";
export const VITE_MOCK_NEWS = import.meta.env.VITE_MOCK_NEWS === "true";
