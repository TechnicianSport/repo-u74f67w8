export interface AssetEntity {
  id: string;
  model: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  country: string;
  linked_news: string[];
  behavior: string;
}

export type CameraMode = "overview" | "focus" | "autotour";

export type TransformMode = "translate" | "rotate" | "scale";

export interface EffectsConfig {
  bloom: boolean;
  ssao: boolean;
  grid: boolean;
  ocean: boolean;
  atmosphere: boolean;
  connections: boolean;
}

export interface EditorHistoryAction {
  type: "transform" | "material" | "visibility" | "add" | "delete";
  objectId: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}
