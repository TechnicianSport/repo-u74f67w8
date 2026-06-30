import { create } from "zustand";
import type { NewsPackage, Storyline } from "../types/news.types";
import { groupPackagesIntoStorylines } from "../utils/storylineGrouper";

interface NewsState {
  packages: NewsPackage[];
  storylines: Map<string, Storyline>;
  selectedStorylineId: string | null;
  breakingQueue: NewsPackage[];

  addPackage: (p: NewsPackage) => void;
  addPackages: (p: NewsPackage[]) => void;
  clearPackages: () => void;
  selectStoryline: (id: string | null) => void;
  getStoryline: (id: string) => Storyline | undefined;
  getPackagesByDate: (date: string) => NewsPackage[];
  pushBreaking: (p: NewsPackage) => void;
  popBreaking: () => NewsPackage | undefined;
}

export const useNewsStore = create<NewsState>((set, get) => ({
  packages: [],
  storylines: new Map(),
  selectedStorylineId: null,
  breakingQueue: [],

  addPackage: (p) => {
    set((state) => {
      const newPackages = [...state.packages, p];
      return {
        packages: newPackages,
        storylines: groupPackagesIntoStorylines(newPackages),
      };
    });
  },

  addPackages: (p) => {
    set((state) => {
      const newPackages = [...state.packages, ...p];
      return {
        packages: newPackages,
        storylines: groupPackagesIntoStorylines(newPackages),
      };
    });
  },

  clearPackages: () => {
    set({
      packages: [],
      storylines: new Map(),
      selectedStorylineId: null,
    });
  },

  selectStoryline: (id) => {
    set({ selectedStorylineId: id });
  },

  getStoryline: (id) => {
    return get().storylines.get(id);
  },

  getPackagesByDate: (date) => {
    return get().packages.filter((p) => p.published_at.startsWith(date));
  },

  pushBreaking: (p) => {
    set((state) => ({
      breakingQueue: [...state.breakingQueue, p],
    }));
  },

  popBreaking: () => {
    const state = get();
    if (state.breakingQueue.length === 0) return undefined;
    const [first, ...rest] = state.breakingQueue;
    set({ breakingQueue: rest });
    return first;
  },
}));
