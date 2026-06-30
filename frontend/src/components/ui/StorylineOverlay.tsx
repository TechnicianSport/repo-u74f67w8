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
    <div className="relative">
      <div
        className={`bg-[#0A1628]/60 border border-[#0D2137] p-4 transition-all duration-300 ${
          index % 2 === 0 ? "ml-0 mr-4" : "ml-4 mr-0"
        }`}
        style={{
          borderRadius: "2px",
          borderLeftWidth: "3px",
          borderLeftColor: catVis.glow,
          animationDelay: `${index * 0.1}s`,
        }}
      >
        {isLatest && (
          <div
            className="absolute -top-2 right-4 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold"
            style={{
              background: catVis.glow,
              color: "#000",
              borderRadius: "2px",
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            LATEST
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span
            className="px-2 py-0.5 bg-[#050D1A] border border-[#0D2137] text-[10px] text-[#7799BB]"
            style={{ borderRadius: "2px", fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {dayjs(pkg.published_at).format("HH:mm")} UTC
          </span>
          <span
            className="text-[9px] uppercase px-1.5 py-0.5 border"
            style={{
              color: catVis.glow,
              borderColor: `${catVis.glow}40`,
              borderRadius: "2px",
              fontFamily: "'Rajdhani', sans-serif",
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
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
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
                className="text-[10px] px-1.5 py-0.5 bg-[#050D1A] border border-[#0D2137] text-[#7799BB]"
                style={{ borderRadius: "2px", fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {ent.type === "person" ? "&#128100;" : ent.type === "organization" ? "&#127970;" : ""}{" "}
                {ent.name_en}
                {ent.role && (
                  <span className="text-[#334455]"> ({ent.role})</span>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-2 text-[10px] text-[#334455]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          <span>{pkg.content.source_name}</span>
          <a
            href={pkg.content.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7799BB] hover:text-[#E0EEFF]"
          >
            &#x2197; Open article
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
          className="absolute right-2 top-0 bottom-0 w-0.5"
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
            style={{ backgroundColor: `${catVis.glow}30` }}
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
    return CATEGORY_VISUALS[storyline.category as NewsCategory] ?? CATEGORY_VISUALS.other;
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
      className="fixed right-0 top-12 bottom-0 w-[480px] z-50 bg-[#020408]/95 backdrop-blur-md border-l border-[#0D2137] flex flex-col animate-slide-in-right overflow-hidden"
      style={{ pointerEvents: "auto" }}
    >
      <div className="p-4 border-b border-[#0D2137]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getFlag(pkg0.geo.country_iso2)}
            </span>
            <div>
              <div className="text-sm text-[#E0EEFF]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                {storyline.city_en}, {storyline.country_en}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#334455] hover:text-white text-xl px-2"
          >
            &times;
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 text-[10px] uppercase border"
            style={{
              color: catVis.glow,
              borderColor: `${catVis.glow}40`,
              borderRadius: "2px",
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            {storyline.category}
          </span>
          <span className="text-[10px] text-[#7799BB]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {storyline.total_count > 1
              ? `STORYLINE \u00b7 ${storyline.total_count} events`
              : "SINGLE EVENT"}
          </span>
          {storyline.is_breaking && (
            <span
              className="text-[10px] text-red-400 animate-pulse font-bold"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              &#9889; BREAKING
            </span>
          )}
        </div>
      </div>

      <div className="p-4 border-b border-[#0D2137] grid grid-cols-4 gap-3">
        <div>
          <div className="text-[9px] uppercase text-[#334455] mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            Importance
          </div>
          <div className="h-1.5 bg-[#0A1628] overflow-hidden" style={{ borderRadius: "1px" }}>
            <div
              className="h-full"
              style={{
                width: `${storyline.importance_peak * 100}%`,
                backgroundColor: catVis.glow,
              }}
            />
          </div>
          <div className="text-[10px] text-[#7799BB] mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {storyline.importance_peak.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase text-[#334455] mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            Sentiment
          </div>
          <div className="h-1.5 bg-[#0A1628] overflow-hidden relative" style={{ borderRadius: "1px" }}>
            <div
              className="absolute top-0 bottom-0 w-1"
              style={{
                left: `${((storyline.dominant_sentiment + 1) / 2) * 100}%`,
                backgroundColor: storyline.dominant_sentiment > 0 ? "#00FF88" : "#FF2020",
              }}
            />
          </div>
          <div className="text-[10px] text-[#7799BB] mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {storyline.dominant_sentiment.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase text-[#334455] mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            Events
          </div>
          <div className="text-sm text-[#E0EEFF]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {storyline.total_count}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase text-[#334455] mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            Media
          </div>
          <div className="text-sm text-[#E0EEFF]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {storyline.packages.reduce((sum, p) => sum + p.media.media_count, 0)}
          </div>
        </div>
      </div>

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

      {storyline.packages.some(
        (p) => p.relations.related_countries.length > 0
      ) && (
        <div className="p-3 border-t border-[#0D2137]">
          <div className="text-[9px] uppercase text-[#334455] mb-1.5" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
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
                className="px-1.5 py-0.5 text-[10px] bg-[#0A1628] border border-[#0D2137] text-[#7799BB]"
                style={{ borderRadius: "2px", fontFamily: "'IBM Plex Mono', monospace" }}
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
