import { useMemo } from "react";
import type { NewsPackage, Storyline } from "../types/news.types";
import { groupPackagesIntoStorylines } from "../utils/storylineGrouper";

export function useStorylineBuilder(
  packages: NewsPackage[]
): Map<string, Storyline> {
  return useMemo(() => {
    return groupPackagesIntoStorylines(packages);
  }, [packages]);
}
