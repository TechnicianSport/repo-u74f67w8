import { memo, useMemo } from "react";
import type { GeoProjection } from "d3-geo";
import type { Storyline } from "../../types/news.types";
import { NewsNode } from "./NewsNode";

interface StorylineClusterProps {
  storylines: Map<string, Storyline>;
  projection: GeoProjection;
}

export const StorylineCluster = memo(function StorylineCluster({
  storylines,
  projection,
}: StorylineClusterProps) {
  const entries = useMemo(() => Array.from(storylines.values()), [storylines]);

  return (
    <group>
      {entries.map((storyline) => (
        <NewsNode
          key={storyline.id}
          storyline={storyline}
          projection={projection}
        />
      ))}
    </group>
  );
});
