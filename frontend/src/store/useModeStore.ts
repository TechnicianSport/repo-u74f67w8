import { create } from "zustand";

interface ModeState {
  mode: "live" | "archive";
  selectedDate: string | null;
  isLoading: boolean;
  lastLiveUpdate: number | null;
  isPaused: boolean;

  setLiveMode: () => void;
  setArchiveMode: (date: string) => void;
  setLoading: (b: boolean) => void;
  setLastUpdate: (ts: number) => void;
  togglePause: () => void;
}

export const useModeStore = create<ModeState>((set) => ({
  mode: "live",
  selectedDate: null,
  isLoading: false,
  lastLiveUpdate: null,
  isPaused: false,

  setLiveMode: () => {
    set({
      mode: "live",
      selectedDate: null,
      isPaused: false,
    });
  },

  setArchiveMode: (date: string) => {
    set({
      mode: "archive",
      selectedDate: date,
      isPaused: false,
    });
  },

  setLoading: (b: boolean) => {
    set({ isLoading: b });
  },

  setLastUpdate: (ts: number) => {
    set({ lastLiveUpdate: ts });
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },
}));
