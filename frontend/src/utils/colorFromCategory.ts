import { CATEGORY_VISUALS } from "../constants/categoryVisuals";
import type { NewsCategory } from "../types/news.types";

export function glowColorFromCategory(category: NewsCategory): string {
  return CATEGORY_VISUALS[category]?.glow ?? "#888888";
}

export function baseColorFromCategory(category: NewsCategory): string {
  return CATEGORY_VISUALS[category]?.baseColor ?? "#0A0A0A";
}

export function edgeColorFromCategory(category: NewsCategory): string {
  return CATEGORY_VISUALS[category]?.edge ?? "#AAAAAA";
}

export function iconFromCategory(category: NewsCategory): string {
  return CATEGORY_VISUALS[category]?.icon ?? "dot";
}
