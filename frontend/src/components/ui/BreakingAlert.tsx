import { memo, useState, useEffect, useCallback, useRef } from "react";
import { useNewsStore } from "../../store/useNewsStore";
import { useMapStore } from "../../store/useMapStore";
import type { NewsPackage } from "../../types/news.types";
import dayjs from "dayjs";

export const BreakingAlert = memo(function BreakingAlert() {
  const [currentAlert, setCurrentAlert] = useState<NewsPackage | null>(null);
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popBreaking = useNewsStore((s) => s.popBreaking);
  const selectStoryline = useNewsStore((s) => s.selectStoryline);
  const setSelected = useMapStore((s) => s.setSelected);
  const breakingPackage = useMapStore((s) => s.breakingPackage);
  const triggerBreaking = useMapStore((s) => s.triggerBreaking);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => {
      setCurrentAlert(null);
      const next = popBreaking();
      if (next) {
        setTimeout(() => {
          useMapStore.getState().triggerBreaking(next);
        }, 300);
      }
    }, 300);
  }, [popBreaking]);

  useEffect(() => {
    if (breakingPackage && !currentAlert) {
      setCurrentAlert(breakingPackage);
      setVisible(true);
      setCountdown(10);
      triggerBreaking(null);
    }
  }, [breakingPackage, currentAlert, triggerBreaking]);

  useEffect(() => {
    if (!visible) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          dismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, dismiss]);

  const handleView = useCallback(() => {
    if (!currentAlert) return;
    const slId = `${currentAlert.geo.city_en}_${currentAlert.geo.country_iso3}_${currentAlert.classification.category}`
      .toLowerCase()
      .replace(/\s+/g, "_");
    setSelected(slId);
    selectStoryline(slId);
    dismiss();
  }, [currentAlert, setSelected, selectStoryline, dismiss]);

  if (!currentAlert || !visible) return null;

  return (
    <div
      className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-drop-in"
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="w-[600px] bg-[#1A0000]/95 backdrop-blur-md border border-red-900/50 px-4 py-3 flex items-center gap-3 shadow-[0_0_30px_rgba(255,32,32,0.15)]"
        style={{ borderRadius: "2px", borderLeftWidth: "3px", borderLeftColor: "#FF2020" }}
        onClick={handleView}
        role="button"
        tabIndex={0}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-400 text-xs font-bold animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              &#9889; BREAKING
            </span>
          </div>
          <div
            className="text-sm text-[#E0EEFF] truncate"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {currentAlert.content.headline_en.slice(0, 80)}
          </div>
          <div className="text-[10px] text-[#7799BB] mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {currentAlert.geo.city_en}, {currentAlert.geo.country_en} &middot;{" "}
            {currentAlert.content.source_name} &middot;{" "}
            {dayjs(currentAlert.published_at).format("HH:mm")} UTC
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleView();
          }}
          className="px-3 py-1 text-[10px] uppercase tracking-wider text-red-400 border border-red-900/50 hover:bg-red-900/20 transition-colors whitespace-nowrap"
          style={{ borderRadius: "2px", fontFamily: "'Rajdhani', sans-serif" }}
        >
          VIEW &rarr;
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          className="text-[#334455] hover:text-red-400 transition-colors text-sm"
        >
          &times;
        </button>
      </div>

      <div className="w-[600px] h-0.5 bg-[#1A0000]">
        <div
          className="h-full bg-red-500/50 transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown / 10) * 100}%` }}
        />
      </div>
    </div>
  );
});
