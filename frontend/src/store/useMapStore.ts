import { create } from "zustand";
import type { CameraMode, EffectsConfig } from "../types/entity.types";
import type { NewsPackage } from "../types/news.types";

interface PulseRingData {
  id: string;
  position: [number, number, number];
  startTime: number;
  category: string;
  duration: number;
}

interface MapState {
  hoveredNodeId: string | null;
  selectedNodeId: string | null;
  cameraMode: CameraMode;
  focusTarget: [number, number, number] | null;
  effectsEnabled: EffectsConfig;
  pulseRings: PulseRingData[];
  breakingPackage: NewsPackage | null;
  wsConnected: boolean;
  lastInteraction: number;

  setHovered: (id: string | null) => void;
  setSelected: (id: string | null) => void;
  setCameraMode: (m: CameraMode) => void;
  setFocusTarget: (t: [number, number, number] | null) => void;
  toggleEffect: (key: keyof EffectsConfig) => void;
  addPulseRing: (ring: PulseRingData) => void;
  removePulseRing: (id: string) => void;
  clearPulseRings: () => void;
  triggerBreaking: (p: NewsPackage | null) => void;
  setWsConnected: (connected: boolean) => void;
  touchInteraction: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  hoveredNodeId: null,
  selectedNodeId: null,
  cameraMode: "overview",
  focusTarget: null,
  effectsEnabled: {
    bloom: true,
    ssao: true,
    grid: true,
    ocean: true,
    atmosphere: true,
    connections: true,
  },
  pulseRings: [],
  breakingPackage: null,
  wsConnected: false,
  lastInteraction: Date.now(),

  setHovered: (id) => set({ hoveredNodeId: id }),
  setSelected: (id) => set({ selectedNodeId: id }),
  setCameraMode: (m) => set({ cameraMode: m }),
  setFocusTarget: (t) => set({ focusTarget: t }),

  toggleEffect: (key) =>
    set((state) => ({
      effectsEnabled: {
        ...state.effectsEnabled,
        [key]: !state.effectsEnabled[key],
      },
    })),

  addPulseRing: (ring) =>
    set((state) => ({
      pulseRings: state.pulseRings.length >= 60
        ? [...state.pulseRings.slice(1), ring]
        : [...state.pulseRings, ring],
    })),

  removePulseRing: (id) =>
    set((state) => ({
      pulseRings: state.pulseRings.filter((r) => r.id !== id),
    })),

  clearPulseRings: () => set({ pulseRings: [] }),

  triggerBreaking: (p) => set({ breakingPackage: p }),
  setWsConnected: (connected) => set({ wsConnected: connected }),
  touchInteraction: () => set({ lastInteraction: Date.now() }),
}));
