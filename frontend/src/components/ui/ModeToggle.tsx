import { memo, useCallback, useState } from "react";
import { useModeStore } from "../../store/useModeStore";
import { useNewsStore } from "../../store/useNewsStore";
import { useArchiveFetch } from "../../hooks/useArchiveFetch";
import { ArchiveDatePicker } from "./ArchiveDatePicker";

export const ModeToggle = memo(function ModeToggle() {
  const mode = useModeStore((s) => s.mode);
  const setLiveMode = useModeStore((s) => s.setLiveMode);
  const setArchiveMode = useModeStore((s) => s.setArchiveMode);
  const clearPackages = useNewsStore((s) => s.clearPackages);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { fetchDate } = useArchiveFetch();

  const handleLive = useCallback(() => {
    clearPackages();
    setLiveMode();
    setShowDatePicker(false);
  }, [clearPackages, setLiveMode]);

  const handleArchiveClick = useCallback(() => {
    setShowDatePicker((prev) => !prev);
  }, []);

  const handleDateSelect = useCallback(
    (date: string) => {
      clearPackages();
      setArchiveMode(date);
      fetchDate(date);
      setShowDatePicker(false);
    },
    [clearPackages, setArchiveMode, fetchDate]
  );

  return (
    <div className="relative flex flex-col items-center">
      <div className="flex gap-0">
        <button
          onClick={handleLive}
          className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
            mode === "live"
              ? "bg-green-900/30 border-green-500/50 text-green-400 shadow-[0_0_12px_rgba(0,255,100,0.15)]"
              : "bg-transparent border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500"
          }`}
          style={{ borderRadius: "2px 0 0 2px", fontFamily: "'Rajdhani', sans-serif" }}
        >
          {mode === "live" && (
            <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse" />
          )}
          LIVE
        </button>
        <button
          onClick={handleArchiveClick}
          className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-y border-r transition-all duration-200 ${
            mode === "archive"
              ? "bg-amber-900/20 border-amber-500/50 text-amber-400"
              : "bg-transparent border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500"
          }`}
          style={{ borderRadius: "0 2px 2px 0", fontFamily: "'Rajdhani', sans-serif" }}
        >
          ARCHIVE
        </button>
      </div>

      {showDatePicker && (
        <div className="absolute top-full mt-2 z-50">
          <ArchiveDatePicker onDateSelect={handleDateSelect} />
        </div>
      )}
    </div>
  );
});
