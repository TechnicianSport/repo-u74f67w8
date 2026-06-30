import { memo, useMemo } from "react";
import type { GeoProjection } from "d3-geo";
import type { Storyline } from "../../types/news.types";
import { latLonToXZ } from "../../utils/geoProjection";
import { ConnectionLine } from "../effects/ConnectionLine";
import { CATEGORY_VISUALS } from "../../constants/categoryVisuals";
import type { NewsCategory } from "../../types/news.types";
import { CONNECTION_CONFIG } from "../../constants/mapConfig";

interface ConnectionsManagerProps {
  storylines: Map<string, Storyline>;
  projection: GeoProjection;
}

interface Connection {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  importance: number;
}

export const ConnectionsManager = memo(function ConnectionsManager({
  storylines,
  projection,
}: ConnectionsManagerProps) {
  const connections = useMemo(() => {
    const result: Connection[] = [];
    const entries = Array.from(storylines.values());
    const storyThreadMap = new Map<string, Storyline[]>();

    for (const sl of entries) {
      for (const pkg of sl.packages) {
        if (pkg.relations.story_thread_id) {
          const existing = storyThreadMap.get(pkg.relations.story_thread_id) ?? [];
          if (!existing.includes(sl)) {
            existing.push(sl);
            storyThreadMap.set(pkg.relations.story_thread_id, existing);
          }
        }
      }
    }

    for (const [, connected] of storyThreadMap) {
      for (let i = 0; i < connected.length - 1 && result.length < CONNECTION_CONFIG.maxConnections; i++) {
        const a = connected[i];
        const b = connected[i + 1];
        const [ax, az] = latLonToXZ(a.coordinates.lat, a.coordinates.lon, projection);
        const [bx, bz] = latLonToXZ(b.coordinates.lat, b.coordinates.lon, projection);
        const catVis = CATEGORY_VISUALS[a.category as NewsCategory] ?? CATEGORY_VISUALS.other;

        result.push({
          id: `${a.id}-${b.id}`,
          start: [ax, 0.15, az],
          end: [bx, 0.15, bz],
          color: catVis.glow,
          importance: Math.max(a.importance_peak, b.importance_peak),
        });
      }
    }

    return result.slice(0, CONNECTION_CONFIG.maxConnections);
  }, [storylines, projection]);

  return (
    <group>
      {connections.map((conn) => (
        <ConnectionLine
          key={conn.id}
          start={conn.start}
          end={conn.end}
          color={conn.color}
          importance={conn.importance}
        />
      ))}
    </group>
  );
});
