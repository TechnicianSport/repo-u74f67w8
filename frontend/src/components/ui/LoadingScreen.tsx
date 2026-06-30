import { memo, useState, useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen = memo(function LoadingScreen({
  onComplete,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = [
    "INITIALIZING SYSTEM...",
    "LOADING WORLD GEOMETRY...",
    "GENERATING OCEAN SURFACE...",
    "ACTIVATING GRID OVERLAY...",
    "CALIBRATING POST-PROCESSING...",
    "CONNECTING TO LIVE FEED...",
    "SYSTEM READY",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 8 + 2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return 100;
        }
        setPhase(Math.min(Math.floor(next / 15), phases.length - 1));
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete, phases.length]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#020408] flex flex-col items-center justify-center transition-opacity duration-500">
      <div className="relative mb-12">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full border border-[#001833]" style={{
            backgroundImage: "linear-gradient(rgba(0,24,51,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,24,51,0.3) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />
        </div>
        <h1
          className="text-2xl tracking-[0.3em] text-[#7799BB] relative"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          // LIVE NEWS MAP
        </h1>
      </div>

      <div className="w-[400px]">
        <div className="flex justify-between mb-2">
          <span
            className="text-[10px] text-[#7799BB] uppercase tracking-wider"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {phases[phase]}
          </span>
          <span
            className="text-[10px] text-[#334455]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {Math.floor(progress)}%
          </span>
        </div>
        <div className="h-1 bg-[#0A1628] overflow-hidden" style={{ borderRadius: "1px" }}>
          <div
            className="h-full bg-[#0088FF] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-8 text-[9px] text-[#334455]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        v1.0.0 &middot; REAL-TIME INTELLIGENCE VISUALIZATION
      </div>
    </div>
  );
});
