import { create } from "zustand";
import type {
  AssetEntity,
  TransformMode,
  EditorHistoryAction,
} from "../types/entity.types";

interface EditorState {
  isEditorMode: boolean;
  selectedObjectId: string | null;
  transformMode: TransformMode;
  assets: AssetEntity[];
  history: EditorHistoryAction[];
  historyIndex: number;
  sceneObjects: { id: string; name: string; visible: boolean }[];

  toggleEditor: () => void;
  setSelectedObject: (id: string | null) => void;
  setTransformMode: (m: TransformMode) => void;
  addAsset: (asset: AssetEntity) => void;
  updateAsset: (id: string, updates: Partial<AssetEntity>) => void;
  removeAsset: (id: string) => void;
  pushHistory: (action: EditorHistoryAction) => void;
  undo: () => void;
  redo: () => void;
  toggleObjectVisibility: (id: string) => void;
}

const MAX_HISTORY = 20;

export const useEditorStore = create<EditorState>((set, get) => ({
  isEditorMode: false,
  selectedObjectId: null,
  transformMode: "translate",
  assets: [],
  history: [],
  historyIndex: -1,
  sceneObjects: [
    { id: "floor", name: "Floor", visible: true },
    { id: "ocean", name: "Ocean", visible: true },
    { id: "map", name: "Map", visible: true },
    { id: "grid", name: "Grid", visible: true },
    { id: "atmosphere", name: "Atmosphere", visible: true },
  ],

  toggleEditor: () => set((s) => ({ isEditorMode: !s.isEditorMode })),

  setSelectedObject: (id) => set({ selectedObjectId: id }),

  setTransformMode: (m) => set({ transformMode: m }),

  addAsset: (asset) =>
    set((state) => ({
      assets: [...state.assets, asset],
      sceneObjects: [
        ...state.sceneObjects,
        { id: asset.id, name: asset.model, visible: true },
      ],
    })),

  updateAsset: (id, updates) =>
    set((state) => ({
      assets: state.assets.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),

  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
      sceneObjects: state.sceneObjects.filter((o) => o.id !== id),
      selectedObjectId:
        state.selectedObjectId === id ? null : state.selectedObjectId,
    })),

  pushHistory: (action) =>
    set((state) => {
      const newHistory = [
        ...state.history.slice(0, state.historyIndex + 1),
        action,
      ].slice(-MAX_HISTORY);
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),

  undo: () => {
    const { historyIndex } = get();
    if (historyIndex < 0) return;
    set({ historyIndex: historyIndex - 1 });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    set({ historyIndex: historyIndex + 1 });
  },

  toggleObjectVisibility: (id) =>
    set((state) => ({
      sceneObjects: state.sceneObjects.map((o) =>
        o.id === id ? { ...o, visible: !o.visible } : o
      ),
    })),
}));
