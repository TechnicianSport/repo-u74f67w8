import type { NewsCategory } from "../types/news.types";

export interface CategoryVisual {
  baseColor: string;
  glow: string;
  edge: string;
  pulseShape: string;
  icon: string;
  elevationMult: number;
}

export const CATEGORY_VISUALS: Record<NewsCategory, CategoryVisual> = {
  geopolitical: {
    baseColor: "#1A0A2E",
    glow: "#8844FF",
    edge: "#AA66FF",
    pulseShape: "ring",
    icon: "globe",
    elevationMult: 1.3,
  },
  military: {
    baseColor: "#2A0000",
    glow: "#FF2020",
    edge: "#FF5555",
    pulseShape: "spike",
    icon: "target",
    elevationMult: 1.5,
  },
  economy: {
    baseColor: "#0A1A00",
    glow: "#00FF88",
    edge: "#44FFB0",
    pulseShape: "smooth",
    icon: "chart",
    elevationMult: 1.2,
  },
  technology: {
    baseColor: "#000A2A",
    glow: "#0088FF",
    edge: "#44BBFF",
    pulseShape: "hex",
    icon: "circuit",
    elevationMult: 1.1,
  },
  health: {
    baseColor: "#001A0A",
    glow: "#00FF66",
    edge: "#88FFAA",
    pulseShape: "organic",
    icon: "cross",
    elevationMult: 1.0,
  },
  climate: {
    baseColor: "#001A1A",
    glow: "#00CCFF",
    edge: "#88DDFF",
    pulseShape: "wave",
    icon: "leaf",
    elevationMult: 0.9,
  },
  social: {
    baseColor: "#1A0A00",
    glow: "#FF8800",
    edge: "#FFAA44",
    pulseShape: "bubble",
    icon: "people",
    elevationMult: 0.8,
  },
  security: {
    baseColor: "#1A1A00",
    glow: "#FFEE00",
    edge: "#FFFF66",
    pulseShape: "flash",
    icon: "shield",
    elevationMult: 1.3,
  },
  diplomacy: {
    baseColor: "#001A1A",
    glow: "#00FFCC",
    edge: "#66FFE0",
    pulseShape: "orbit",
    icon: "handshake",
    elevationMult: 1.1,
  },
  other: {
    baseColor: "#0A0A0A",
    glow: "#888888",
    edge: "#AAAAAA",
    pulseShape: "ring",
    icon: "dot",
    elevationMult: 0.7,
  },
};

export const CATEGORY_SHORT_LABELS: Record<NewsCategory, string> = {
  geopolitical: "GEO",
  military: "MIL",
  economy: "ECO",
  technology: "TECH",
  health: "HEALTH",
  climate: "CLIMATE",
  social: "SOC",
  security: "SEC",
  diplomacy: "DIP",
  other: "OTHER",
};

export const ALL_CATEGORIES: NewsCategory[] = [
  "geopolitical",
  "military",
  "economy",
  "technology",
  "health",
  "climate",
  "social",
  "security",
  "diplomacy",
  "other",
];
