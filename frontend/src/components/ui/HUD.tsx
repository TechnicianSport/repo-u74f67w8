import { memo, useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNewsStore } from "../../store/useNewsStore";
import { useMapStore } from "../../store/useMapStore";
import { useModeStore } from "../../store/useModeStore";
import { useEditorStore } from "../../store/useEditorStore";
import { ModeToggle } from "./ModeToggle";
import { NewsFeed } from "./NewsFeed";
import { BreakingAlert } from "./BreakingAlert";
import { KeyboardHints } from "./KeyboardHints";
import { StorylineOverlay } from "./StorylineOverlay";
import { ALL_CATEGORIES } from "../../constants/categoryVisuals";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EditorPanel = lazy(() =>
  import("../editor/EditorPanel").then((m) => ({ default: m.EditorPanel }))
);

export const HUD = memo(function HUD() {
  const packages = useNewsStore((s) => s.packages);
  const mode = useModeStore((s) => s.mode);
  const selectedDate = useModeStore((s) => s.selectedDate);
  const isLoading = useModeStore((s) => s.isLoading);
  const isPaused = useModeStore((s) => s.isPaused);
  const togglePause = useModeStore((s) => s.togglePause);
  const wsConnected = useMapStore((s) => s.wsConnected);
  const isEditorMode = useEditorStore((s) => s.isEditorMode);
  const toggleEditor = useEditorStore((s) => s.toggleEditor);
  const toggleEffect = useMapStore((s) => s.toggleEffect);
  const setCameraMode = useMapStore((s) => s.setCameraMode);
  const setSelected = useMapStore((s) => s.setSelected);
  const selectStoryline = useNewsStore((s) => s.selectStoryline);
  const selectedStorylineId = useNewsStore((s) => s.selectedStorylineId);
  const storylines = useNewsStore((s) => s.storylines);
  const setLiveMode = useModeStore((s) => s.setLiveMode);

  const [showHints, setShowHints] = useState(false);
  const [clock, setClock] = useState(dayjs().utc().format("HH:mm:ss"));

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(dayjs().utc().format("HH:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Escape") {
        if (selectedStorylineId) {
          selectStoryline(null);
          setSelected(null);
        }
        setCameraMode("overview");
      }
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        setShowHints((p) => !p);
      }
      if (e.key === "g" || e.key === "G") toggleEffect("grid");
      if (e.key === "o" || e.key === "O") toggleEffect("ocean");
      if (e.key === "b" || e.key === "B") toggleEffect("bloom");
      if (e.key === "l" || e.key === "L") setLiveMode();
      if (e.key === " ") {
        e.preventDefault();
        togglePause();
      }
      if (e.key === "f" || e.key === "F") setCameraMode("focus");
      if (e.ctrlKey && (e.key === "e" || e.key === "E")) {
        e.preventDefault();
        toggleEditor();
      }

      const numKey = parseInt(e.key);
      if (!isNaN(numKey) && numKey >= 0 && numKey <= 9) {
        const cats = ALL_CATEGORIES;
        const idx = numKey === 0 ? 9 : numKey - 1;
        if (idx < cats.length) {
          // Category filter via keyboard - handled by NewsFeed component
        }
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const entries = Array.from(storylines.values())
          .filter((s) => s.importance_peak > 0.5 || s.is_breaking)
          .sort((a, b) => b.importance_peak - a.importance_peak);
        if (entries.length > 0) {
          const currentIdx = entries.findIndex((s) => s.id === selectedStorylineId);
          const nextIdx = (currentIdx + 1) % entries.length;
          const next = entries[nextIdx];
          setSelected(next.id);
          selectStoryline(next.id);
          setCameraMode("focus");
        }
      }
    },
    [
      selectedStorylineId,
      selectStoryline,
      setSelected,
      setCameraMode,
      toggleEffect,
      setLiveMode,
      togglePause,
      toggleEditor,
      storylines,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-12 bg-[#020408]/80 backdrop-blur-md border-b border-[#0D2137] flex items-center justify-between px-4"
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-sm tracking-widest text-[#7799BB] uppercase"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            // LIVE NEWS MAP
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {mode === "archive" && selectedDate && (
            <span
              className="text-[10px] text-amber-400 uppercase"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              ARCHIVE &mdash; {dayjs(selectedDate).format("dddd, MMM D")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span
            className="text-[10px] text-[#7799BB]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            PACKAGES: {packages.length}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#7799BB]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              WS
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                wsConnected ? "bg-green-400" : "bg-red-500"
              }`}
            />
          </div>
          <span
            className="text-[10px] text-[#334455]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            UTC {clock}
          </span>
          {isPaused && (
            <span className="text-[10px] text-amber-400 animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              PAUSED
            </span>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="absolute top-12 left-0 right-0 h-1 bg-[#0A1628] z-50">
          <div className="h-full bg-[#0088FF] animate-loading-bar" />
        </div>
      )}

      {!isEditorMode && <NewsFeed />}

      <BreakingAlert />

      {!isEditorMode && <StorylineOverlay />}

      <KeyboardHints isOpen={showHints} onClose={() => setShowHints(false)} />

      {isEditorMode && (
        <Suspense fallback={null}>
          <EditorPanel />
        </Suspense>
      )}
    </div>
  );
});
