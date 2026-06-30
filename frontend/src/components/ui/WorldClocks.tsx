import { memo, useState, useEffect, useMemo } from "react";
import { useSettingsStore } from "../../store/useSettingsStore";

function getTimeInTimezone(tz: string): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0");
  const s = parseInt(parts.find((p) => p.type === "second")?.value ?? "0");
  return { hours: h, minutes: m, seconds: s, formatted: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` };
}

interface MiniClockProps {
  name: string;
  short: string;
  timezone: string;
}

const MiniClock = memo(function MiniClock({ name, short, timezone }: MiniClockProps) {
  const [time, setTime] = useState(() => getTimeInTimezone(timezone));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeInTimezone(timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  const hourDeg = (time.hours % 12) * 30 + time.minutes * 0.5;
  const minuteDeg = time.minutes * 6;
  const secondDeg = time.seconds * 6;
  const isNight = time.hours >= 20 || time.hours < 6;

  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      <div
        className="relative w-10 h-10 rounded-full border"
        style={{
          borderColor: isNight ? "#1A3A5A" : "#2A5A8A",
          background: isNight
            ? "radial-gradient(circle, #050D1A 60%, #0A1628 100%)"
            : "radial-gradient(circle, #0A1628 60%, #0D2137 100%)",
          boxShadow: `0 0 8px ${isNight ? "rgba(0,30,80,0.4)" : "rgba(0,80,180,0.3)"}`,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: i % 3 === 0 ? "2px" : "1px",
              height: i % 3 === 0 ? "3px" : "2px",
              background: "#3A6A9A",
              top: "2px",
              left: "50%",
              transformOrigin: `0 18px`,
              transform: `translateX(-50%) rotate(${i * 30}deg)`,
            }}
          />
        ))}
        <div
          className="absolute"
          style={{
            width: "1.5px",
            height: "10px",
            background: "#7799BB",
            top: "10px",
            left: "50%",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${hourDeg}deg)`,
            borderRadius: "1px",
          }}
        />
        <div
          className="absolute"
          style={{
            width: "1px",
            height: "13px",
            background: "#AAC0DD",
            top: "7px",
            left: "50%",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${minuteDeg}deg)`,
            borderRadius: "1px",
          }}
        />
        <div
          className="absolute"
          style={{
            width: "0.5px",
            height: "14px",
            background: "#0088FF",
            top: "6px",
            left: "50%",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${secondDeg}deg)`,
          }}
        />
        <div
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: "#0088FF",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      <div className="text-center">
        <div
          className="text-[8px] tracking-wider text-[#7799BB] uppercase"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
          title={name}
        >
          {short}
        </div>
        <div
          className="text-[9px] text-[#AAC0DD] tabular-nums"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {time.formatted}
        </div>
      </div>
    </div>
  );
});

export const WorldClocks = memo(function WorldClocks() {
  const showClocks = useSettingsStore((s) => s.showClocks);
  const clockCities = useSettingsStore((s) => s.clockCities);

  const enabledCities = useMemo(
    () => clockCities.filter((c) => c.enabled),
    [clockCities]
  );

  if (!showClocks || enabledCities.length === 0) return null;

  return (
    <div
      className="fixed bottom-3 right-3 z-40 flex gap-2.5 px-3 py-2 bg-[#020408]/80 backdrop-blur-md border border-[#0D2137] rounded"
      style={{ pointerEvents: "auto" }}
    >
      {enabledCities.map((city) => (
        <MiniClock
          key={city.id}
          name={city.name}
          short={city.short}
          timezone={city.timezone}
        />
      ))}
    </div>
  );
});
