import { memo, useCallback, useMemo, useState, useRef } from "react";
import { FixedSizeList, type ListChildComponentProps } from "react-window";
import { useNewsStore } from "../../store/useNewsStore";
import { useMapStore } from "../../store/useMapStore";
import { useModeStore } from "../../store/useModeStore";
import { CATEGORY_VISUALS, ALL_CATEGORIES, CATEGORY_SHORT_LABELS } from "../../constants/categoryVisuals";
import type { NewsCategory, Storyline } from "../../types/news.types";
import dayjs from "dayjs";

const COUNTRY_FLAGS: Record<string, string> = {};
function getFlag(iso2: string): string {
  if (COUNTRY_FLAGS[iso2]) return COUNTRY_FLAGS[iso2];
  const flag = iso2
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join("");
  COUNTRY_FLAGS[iso2] = flag;
  return flag;
}

interface NewsCardProps {
  storyline: Storyline;
  style: React.CSSProperties;
}

const NewsCard = memo(function NewsCard({ storyline, style }: NewsCardProps) {
  const setSelected = useMapStore((s) => s.setSelected);
  const setCameraMode = useMapStore((s) => s.setCameraMode);
  const setFocusTarget = useMapStore((s) => s.setFocusTarget);
  const selectStoryline = useNewsStore((s) => s.selectStoryline);

  const catVis = CATEGORY_VISUALS[storyline.category as NewsCategory] ?? CATEGORY_VISUALS.other;
  const pkg = storyline.latest_package;

  const handleClick = useCallback(() => {
    setSelected(storyline.id);
    selectStoryline(storyline.id);
    setCameraMode("focus");
    setFocusTarget([0, 0, 0]);
    useMapStore.getState().touchInteraction();
  }, [setSelected, selectStoryline, setCameraMode, setFocusTarget, storyline.id]);

  return (
    <div style={style} className="px-2 py-1">
      <button
        onClick={handleClick}
        className="w-full text-left p-3 bg-[#050D1A]/80 hover:bg-[#0A1628] border border-[#0D2137] hover:border-[#1A4A7A]/40 transition-all duration-200 hover:translate-x-1 group"
        style={{
          borderRadius: "2px",
          borderLeftWidth: "3px",
          borderLeftColor: catVis.glow,
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm">{getFlag(pkg.geo.country_iso2)}</span>
          <span
            className="text-[10px] text-[#7799BB]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {storyline.city_en}, {storyline.country_en}
          </span>
        </div>
        <div
          className="text-xs text-[#E0EEFF] line-clamp-2 mb-1.5 leading-relaxed"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {pkg.content.headline_en}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#334455]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          <span>{dayjs(pkg.published_at).format("HH:mm")}</span>
          <span>·</span>
          <span>{pkg.content.source_name}</span>
          <span className="ml-auto flex items-center gap-1">
            <div className="w-12 h-1 bg-[#0A1628] overflow-hidden" style={{ borderRadius: "1px" }}>
              <div
                className="h-full"
                style={{
                  width: `${pkg.scores.importance * 100}%`,
                  backgroundColor: catVis.glow,
                }}
              />
            </div>
          </span>
          {pkg.media.has_media && <span className="text-[#7799BB]">&#9881;</span>}
          {pkg.classification.is_breaking && (
            <span className="text-red-400 animate-pulse font-bold">BREAKING</span>
          )}
        </div>
      </button>
    </div>
  );
});

export const NewsFeed = memo(function NewsFeed() {
  const storylines = useNewsStore((s) => s.storylines);
  const mode = useModeStore((s) => s.mode);
  const selectedDate = useModeStore((s) => s.selectedDate);
  const [activeCategory, setActiveCategory] = useState<NewsCategory | "all">("all");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const sortedStorylines = useMemo(() => {
    let entries = Array.from(storylines.values());
    if (activeCategory !== "all") {
      entries = entries.filter((s) => s.category === activeCategory);
    }
    return entries.sort(
      (a, b) =>
        new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    );
  }, [storylines, activeCategory]);

  const handleCategoryClick = useCallback((cat: NewsCategory | "all") => {
    setActiveCategory(cat);
  }, []);

  if (isCollapsed) {
    return (
      <div className="fixed left-0 top-12 bottom-0 z-40 w-8">
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-8 h-full bg-[#050D1A]/90 border-r border-[#0D2137] flex items-center justify-center text-[#7799BB] hover:text-white transition-colors"
        >
          <span className="text-xs" style={{ writingMode: "vertical-lr" }}>
            FEED
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed left-0 top-12 bottom-0 z-40 w-[300px] bg-[#020408]/90 backdrop-blur-md border-r border-[#0D2137] flex flex-col"
      style={{ pointerEvents: "auto" }}
    >
      <div className="flex items-center justify-between p-3 border-b border-[#0D2137]">
        <div
          className="text-xs uppercase tracking-wider text-[#7799BB]"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          {mode === "live" ? "ACTIVE FEEDS" : `ARCHIVE FEED — ${selectedDate}`}
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-[#334455] hover:text-[#7799BB] text-sm"
        >
          &#x2190;
        </button>
      </div>

      <div className="flex flex-wrap gap-0.5 p-2 border-b border-[#0D2137]">
        <button
          onClick={() => handleCategoryClick("all")}
          className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border transition-all ${
            activeCategory === "all"
              ? "bg-[#0A1628] border-[#1A4A7A] text-[#E0EEFF]"
              : "bg-transparent border-transparent text-[#334455] hover:text-[#7799BB]"
          }`}
          style={{ borderRadius: "2px", fontFamily: "'Rajdhani', sans-serif" }}
        >
          ALL
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border transition-all ${
              activeCategory === cat
                ? "border-current text-current"
                : "bg-transparent border-transparent text-[#334455] hover:text-[#7799BB]"
            }`}
            style={{
              borderRadius: "2px",
              fontFamily: "'Rajdhani', sans-serif",
              color: activeCategory === cat ? CATEGORY_VISUALS[cat].glow : undefined,
            }}
          >
            {CATEGORY_SHORT_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden" ref={listRef}>
        {sortedStorylines.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334455] text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            No events
          </div>
        ) : (
          <FixedSizeList
            height={typeof window !== "undefined" ? window.innerHeight - 130 : 600}
            width={300}
            itemCount={sortedStorylines.length}
            itemSize={110}
          >
            {({ index, style }: ListChildComponentProps) => (
              <NewsCard
                key={sortedStorylines[index].id}
                storyline={sortedStorylines[index]}
                style={style}
              />
            )}
          </FixedSizeList>
        )}
      </div>

      <div className="p-2 border-t border-[#0D2137] text-center">
        <span className="text-[10px] text-[#334455]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {sortedStorylines.length} storylines
        </span>
      </div>
    </div>
  );
});
