import { memo, useMemo } from "react";
import type { Storyline } from "../../types/news.types";
import { GlobeNewsNode } from "./GlobeNewsNode";

interface GlobeStorylineClusterProps {
  storylines: Map<string, Storyline>;
}

export const GlobeStorylineCluster = memo(function GlobeStorylineCluster({
  storylines,
}: GlobeStorylineClusterProps) {
  const entries = useMemo(() => Array.from(storylines.values()), [storylines]);

  return (
    <group>
      {entries.map((storyline) => (
        <GlobeNewsNode key={storyline.id} storyline={storyline} />
      ))}
    </group>
  );
});
