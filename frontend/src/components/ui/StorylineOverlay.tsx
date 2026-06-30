import { memo, useCallback, useMemo, lazy, Suspense } from "react";
import { useNewsStore } from "../../store/useNewsStore";
import { useMapStore } from "../../store/useMapStore";
import { CATEGORY_VISUALS } from "../../constants/categoryVisuals";
import type { NewsCategory, NewsPackage } from "../../types/news.types";
import dayjs from "dayjs";

const MediaGallery = lazy(() =>
  import("./MediaGallery").then((m) => ({ default: m.MediaGallery }))
);
const MediaPlayer = lazy(() =>
  import("./MediaPlayer").then((m) => ({ default: m.MediaPlayer }))
);

function getFlag(iso2: string): string {
  return iso2
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join("");
}

const NewsCardItem = memo(function NewsCardItem({
  pkg,
  index,
  isLatest,
  catVis,
  isLast,
}: {
  pkg: NewsPackage;
  index: number;
  isLatest: boolean;
  catVis: { glow: string; edge: string };
  isLast: boolean;
}) {
  return (
    <div className="relative" style={{ animationDelay: `${index * 80}ms` }}>
      <div
        className="relative p-4 transition-all duration-300"
        style={{
          background: "rgba(8, 18, 38, 0.6)",
          backdropFilter: "blur(12px)",
          border: `1px solid rgba(100, 180, 255, 0.08)`,
          borderLeft: `3px solid ${catVis.glow}`,
          borderRadius: "4px",
          boxShadow: `
            0 4px 24px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(100, 180, 255, 0.04),
            0 0 0 1px rgba(100, 180, 255, 0.02)
          `,
          marginLeft: index % 2 === 0 ? 0 : "12px",
          marginRight: index % 2 === 0 ? "12px" : 0,
        }}
      >
        {isLatest && (
          <div
            className="absolute -top-2 right-4 px-3 py-0.5 text-[9px] uppercase tracking-widest font-bold"
            style={{
              background: `linear-gradient(135deg, ${catVis.glow}, ${catVis.edge})`,
              color: "#000",
              borderRadius: "2px",
              fontFamily: "'Rajdhani', sans-serif",
              boxShadow: `0 0 12px ${catVis.glow}60`,
            }}
          >
            LATEST
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <span
            className="px-2 py-0.5 text-[10px] text-[#7799BB]"
            style={{
              background: "rgba(5, 13, 26, 0.6)",
              border: "1px solid rgba(100, 180, 255, 0.08)",
              borderRadius: "3px",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {dayjs(pkg.published_at).format("HH:mm")} UTC
          </span>
          <span
            className="text-[9px] uppercase px-2 py-0.5"
            style={{
              color: catVis.glow,
              border: `1px solid ${catVis.glow}30`,
              borderRadius: "3px",
              fontFamily: "'Rajdhani', sans-serif",
              textShadow: `0 0 8px ${catVis.glow}40`,
            }}
          >
            {pkg.classification.category}
          </span>
        </div>

        <h3
          className="text-sm text-[#E0EEFF] mb-2 leading-relaxed"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {pkg.content.headline_en}
        </h3>

        <p
          className="text-xs text-[#7799BB] mb-3 leading-relaxed"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            lineHeight: "1.6",
          }}
        >
          {pkg.content.summary_en}
        </p>

        {pkg.media.images.length > 0 && (
          <Suspense fallback={null}>
            <MediaGallery images={pkg.media.images} />
          </Suspense>
        )}

        {pkg.media.videos.length > 0 && (
          <Suspense fallback={null}>
            <MediaPlayer videos={pkg.media.videos} />
          </Suspense>
        )}

        {pkg.relations.entities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 mb-2">
            {pkg.relations.entities.map((ent, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 text-[#7799BB]"
                style={{
                  background: "rgba(5, 13, 26, 0.6)",
                  border: "1px solid rgba(100, 180, 255, 0.08)",
                  borderRadius: "3px",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {ent.type === "person"
                  ? "\u{1F464}"
                  : ent.type === "organization"
                    ? "\u{1F3E2}"
                    : ""}{" "}
                {ent.name_en}
                {ent.role && <span className="text-[#334455]"> ({ent.role})</span>}
              </span>
            ))}
          </div>
        )}

        <div
          className="flex items-center gap-2 mt-3 text-[10px] text-[#334455]"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          <span>{pkg.content.source_name}</span>
          <a
            href={pkg.content.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7799BB] hover:text-[#E0EEFF] transition-colors"
          >
            &#x2197; Source
          </a>
        </div>

        {pkg.classification.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {pkg.classification.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] text-[#334455]"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div
          className="absolute right-0 top-0 bottom-0 w-0.5"
          style={{
            background: `linear-gradient(to bottom, transparent, ${catVis.glow}${Math.round(
              pkg.scores.importance * 255
            )
              .toString(16)
              .padStart(2, "0")}, transparent)`,
          }}
        />
      </div>

      {!isLast && (
        <div className="flex justify-center py-2">
          <div
            className="w-px h-6"
            style={{ backgroundColor: `${catVis.glow}20` }}
          />
        </div>
      )}
    </div>
  );
});

export const StorylineOverlay = memo(function StorylineOverlay() {
  const selectedStorylineId = useNewsStore((s) => s.selectedStorylineId);
  const storylines = useNewsStore((s) => s.storylines);
  const selectStoryline = useNewsStore((s) => s.selectStoryline);
  const setSelected = useMapStore((s) => s.setSelected);
  const setCameraMode = useMapStore((s) => s.setCameraMode);

  const storyline = selectedStorylineId
    ? storylines.get(selectedStorylineId)
    : null;

  const catVis = useMemo(() => {
    if (!storyline) return CATEGORY_VISUALS.other;
    return (
      CATEGORY_VISUALS[storyline.category as NewsCategory] ??
      CATEGORY_VISUALS.other
    );
  }, [storyline]);

  const handleClose = useCallback(() => {
    selectStoryline(null);
    setSelected(null);
    setCameraMode("overview");
  }, [selectStoryline, setSelected, setCameraMode]);

  if (!storyline) return null;

  const pkg0 = storyline.packages[0];

  return (
    <div
      className="fixed right-0 top-12 bottom-0 w-[480px] z-50 flex flex-col overflow-hidden"
      style={{
        pointerEvents: "auto",
        background: "rgba(2, 4, 8, 0.75)",
        backdropFilter: "blur(24px) saturate(1.2)",
        borderLeft: "1px solid rgba(100, 180, 255, 0.06)",
        boxShadow:
          "-4px 0 40px rgba(0, 0, 0, 0.6), inset 1px 0 0 rgba(100, 180, 255, 0.03)",
        animation: "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Header */}
      <div
        className="p-5 relative"
        style={{
          background:
            "linear-gradient(180deg, rgba(10, 22, 40, 0.6) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(100, 180, 255, 0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">{getFlag(pkg0.geo.country_iso2)}</span>
            <div>
              <div
                className="text-sm text-[#E0EEFF] tracking-wide"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                {storyline.city_en}, {storyline.country_en}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-[#334455] hover:text-white transition-colors"
            style={{
              background: "rgba(100, 180, 255, 0.04)",
              border: "1px solid rgba(100, 180, 255, 0.08)",
              borderRadius: "4px",
            }}
          >
            &times;
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 text-[10px] uppercase"
            style={{
              color: catVis.glow,
              border: `1px solid ${catVis.glow}30`,
              borderRadius: "3px",
              fontFamily: "'Rajdhani', sans-serif",
              textShadow: `0 0 12px ${catVis.glow}40`,
            }}
          >
            {storyline.category}
          </span>
          <span
            className="text-[10px] text-[#7799BB]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {storyline.total_count > 1
              ? `STORYLINE \u00b7 ${storyline.total_count} events`
              : "SINGLE EVENT"}
          </span>
          {storyline.is_breaking && (
            <span
              className="text-[10px] text-red-400 animate-pulse font-bold tracking-wider"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              &#9889; BREAKING
            </span>
          )}
        </div>

        {/* Angular corner decorations */}
        <div
          className="absolute top-0 left-0 w-6 h-px"
          style={{ background: `${catVis.glow}40` }}
        />
        <div
          className="absolute top-0 left-0 w-px h-6"
          style={{ background: `${catVis.glow}40` }}
        />
        <div
          className="absolute bottom-0 right-0 w-6 h-px"
          style={{ background: `${catVis.glow}20` }}
        />
        <div
          className="absolute bottom-0 right-0 w-px h-6"
          style={{ background: `${catVis.glow}20` }}
        />
      </div>

      {/* Stats */}
      <div
        className="p-4 grid grid-cols-4 gap-3"
        style={{
          background: "rgba(5, 13, 26, 0.4)",
          borderBottom: "1px solid rgba(100, 180, 255, 0.06)",
        }}
      >
        <div>
          <div
            className="text-[9px] uppercase text-[#334455] mb-1"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            Importance
          </div>
          <div
            className="h-1.5 overflow-hidden"
            style={{
              background: "rgba(10, 22, 40, 0.8)",
              borderRadius: "2px",
            }}
          >
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${storyline.importance_peak * 100}%`,
                background: `linear-gradient(90deg, ${catVis.glow}80, ${catVis.glow})`,
                boxShadow: `0 0 8px ${catVis.glow}40`,
              }}
            />
          </div>
          <div
            className="text-[10px] text-[#7799BB] mt-0.5"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {storyline.importance_peak.toFixed(2)}
          </div>
        </div>
        <div>
          <div
            className="text-[9px] uppercase text-[#334455] mb-1"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            Sentiment
          </div>
          <div
            className="h-1.5 overflow-hidden relative"
            style={{
              background: "rgba(10, 22, 40, 0.8)",
              borderRadius: "2px",
            }}
          >
            <div
              className="absolute top-0 bottom-0 w-1"
              style={{
                left: `${((storyline.dominant_sentiment + 1) / 2) * 100}%`,
                backgroundColor:
                  storyline.dominant_sentiment > 0 ? "#00FF88" : "#FF2020",
                boxShadow: `0 0 6px ${storyline.dominant_sentiment > 0 ? "#00FF88" : "#FF2020"}40`,
              }}
            />
          </div>
          <div
            className="text-[10px] text-[#7799BB] mt-0.5"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {storyline.dominant_sentiment.toFixed(2)}
          </div>
        </div>
        <div>
          <div
            className="text-[9px] uppercase text-[#334455] mb-1"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            Events
          </div>
          <div
            className="text-sm text-[#E0EEFF]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {storyline.total_count}
          </div>
        </div>
        <div>
          <div
            className="text-[9px] uppercase text-[#334455] mb-1"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            Media
          </div>
          <div
            className="text-sm text-[#E0EEFF]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {storyline.packages.reduce(
              (sum, p) => sum + p.media.media_count,
              0
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0 scrollbar-thin">
        {storyline.packages.map((pkg, index) => (
          <NewsCardItem
            key={pkg.id}
            pkg={pkg}
            index={index}
            isLatest={index === storyline.packages.length - 1}
            catVis={catVis}
            isLast={index === storyline.packages.length - 1}
          />
        ))}
      </div>

      {/* Connected countries footer */}
      {storyline.packages.some(
        (p) => p.relations.related_countries.length > 0
      ) && (
        <div
          className="p-3"
          style={{
            background: "rgba(5, 13, 26, 0.4)",
            borderTop: "1px solid rgba(100, 180, 255, 0.06)",
          }}
        >
          <div
            className="text-[9px] uppercase text-[#334455] mb-1.5"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            Connected to:
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from(
              new Set(
                storyline.packages.flatMap(
                  (p) => p.relations.related_countries
                )
              )
            ).map((iso3) => (
              <span
                key={iso3}
                className="px-2 py-0.5 text-[10px] text-[#7799BB]"
                style={{
                  background: "rgba(10, 22, 40, 0.6)",
                  border: "1px solid rgba(100, 180, 255, 0.08)",
                  borderRadius: "3px",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                {iso3}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
