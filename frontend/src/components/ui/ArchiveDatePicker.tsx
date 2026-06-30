import { memo, useMemo, useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { VITE_API_URL, VITE_MOCK_NEWS } from "../../constants/mapConfig";

interface DateInfo {
  date: string;
  count: number;
  has_breaking: boolean;
  label: string;
}

interface ArchiveDatePickerProps {
  onDateSelect: (date: string) => void;
}

export const ArchiveDatePicker = memo(function ArchiveDatePicker({
  onDateSelect,
}: ArchiveDatePickerProps) {
  const [availableDates, setAvailableDates] = useState<DateInfo[]>([]);

  const fallbackDates = useMemo(() => {
    const dates: DateInfo[] = [];
    for (let i = 1; i <= 6; i++) {
      const d = dayjs().subtract(i, "day");
      dates.push({
        date: d.format("YYYY-MM-DD"),
        count: Math.floor(Math.random() * 300) + 50,
        has_breaking: Math.random() > 0.5,
        label: d.format("dddd, MMMM D"),
      });
    }
    return dates;
  }, []);

  useEffect(() => {
    if (VITE_MOCK_NEWS) {
      setAvailableDates(fallbackDates);
      return;
    }

    fetch(`${VITE_API_URL}/api/available-dates`)
      .then((res) => res.json())
      .then((data) => {
        if (data.dates && data.dates.length > 0) {
          setAvailableDates(
            data.dates.map((d: { date: string; count: number; has_breaking: boolean }) => ({
              ...d,
              label: dayjs(d.date).format("dddd, MMMM D"),
            }))
          );
        } else {
          setAvailableDates(fallbackDates);
        }
      })
      .catch(() => {
        setAvailableDates(fallbackDates);
      });
  }, [fallbackDates]);

  const maxCount = useMemo(
    () => Math.max(...availableDates.map((d) => d.count), 1),
    [availableDates]
  );

  const handleSelect = useCallback(
    (date: string) => {
      onDateSelect(date);
    },
    [onDateSelect]
  );

  return (
    <div
      className="bg-[#050D1A]/95 backdrop-blur-md border border-[#0D2137] p-3 min-w-[280px]"
      style={{ borderRadius: "2px" }}
    >
      <div
        className="text-[10px] text-[#7799BB] mb-2 uppercase tracking-wider"
        style={{ fontFamily: "'Rajdhani', sans-serif" }}
      >
        Select archive date
      </div>
      <div className="flex flex-col gap-1">
        {availableDates.map((d) => (
          <button
            key={d.date}
            onClick={() => handleSelect(d.date)}
            className="flex items-center gap-2 px-3 py-2 text-left hover:bg-[#0A1628] transition-colors border border-transparent hover:border-[#1A4A7A]/30 group"
            style={{ borderRadius: "2px" }}
          >
            <div className="flex-1">
              <div
                className="text-xs text-[#E0EEFF] group-hover:text-white"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {d.label}
              </div>
              <div className="text-[10px] text-[#7799BB]">
                {d.count} events
                {d.has_breaking && (
                  <span className="text-red-400 ml-2">BREAKING</span>
                )}
              </div>
            </div>
            <div className="w-16 h-1.5 bg-[#0A1628] overflow-hidden" style={{ borderRadius: "1px" }}>
              <div
                className="h-full bg-[#1A4A7A]"
                style={{ width: `${(d.count / maxCount) * 100}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
