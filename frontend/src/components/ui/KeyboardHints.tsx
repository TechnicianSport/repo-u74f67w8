import { memo } from "react";

interface KeyboardHintsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "Escape", desc: "Deselect / close overlay / overview camera" },
  { key: "F", desc: "Focus on selected node" },
  { key: "L", desc: "Switch to LIVE mode" },
  { key: "A", desc: "Switch to ARCHIVE mode" },
  { key: "G", desc: "Toggle grid" },
  { key: "O", desc: "Toggle ocean" },
  { key: "B", desc: "Toggle bloom" },
  { key: "Space", desc: "Pause/resume live updates" },
  { key: "Tab", desc: "Cycle through high-importance nodes" },
  { key: "1-9, 0", desc: "Filter by category" },
  { key: "Ctrl+E", desc: "Toggle editor mode" },
  { key: "Ctrl+Z", desc: "Undo (editor)" },
  { key: "Ctrl+Y", desc: "Redo (editor)" },
  { key: "?", desc: "Toggle this help" },
];

export const KeyboardHints = memo(function KeyboardHints({
  isOpen,
  onClose,
}: KeyboardHintsProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="bg-[#050D1A]/95 border border-[#0D2137] p-6 max-w-md w-full"
        style={{ borderRadius: "2px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-sm uppercase tracking-wider text-[#7799BB]"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            Keyboard shortcuts
          </span>
          <button onClick={onClose} className="text-[#334455] hover:text-white text-lg">
            &times;
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span
                className="px-2 py-0.5 bg-[#0A1628] border border-[#0D2137] text-[#E0EEFF] text-xs"
                style={{
                  borderRadius: "2px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  minWidth: "70px",
                  textAlign: "center",
                }}
              >
                {s.key}
              </span>
              <span
                className="text-xs text-[#7799BB] flex-1 ml-4"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {s.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
