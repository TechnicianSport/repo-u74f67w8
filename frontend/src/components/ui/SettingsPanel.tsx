import { memo, useState, useCallback } from "react";
import { useSettingsStore, DEFAULT_CATEGORIES } from "../../store/useSettingsStore";
import type { CategoryConfig } from "../../store/useSettingsStore";

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: () => void;
}

const ToggleRow = memo(function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between w-full px-3 py-2 hover:bg-[#0A1628]/50 transition-colors"
    >
      <span className="text-xs text-[#AAC0DD]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        {label}
      </span>
      <div
        className="w-8 h-4 rounded-full relative transition-colors"
        style={{ background: value ? "#0066CC" : "#1A2A3A" }}
      >
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform"
          style={{ transform: `translateX(${value ? "16px" : "2px"})` }}
        />
      </div>
    </button>
  );
});

interface CategoryRowProps {
  cat: CategoryConfig;
  onUpdate: (id: string, patch: Partial<CategoryConfig>) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const CategoryRow = memo(function CategoryRow({ cat, onUpdate, isExpanded, onToggleExpand }: CategoryRowProps) {
  return (
    <div className="border-b border-[#0D2137]/50">
      <button
        onClick={onToggleExpand}
        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#0A1628]/50 transition-colors"
      >
        <div className="w-3 h-3 rounded-sm" style={{ background: cat.glowColor }} />
        <span className="text-xs text-[#AAC0DD] flex-1 text-left" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {cat.label} ({cat.shortLabel})
        </span>
        <span className="text-[10px] text-[#334455]">{isExpanded ? "\u25B2" : "\u25BC"}</span>
      </button>
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-[#7799BB] w-16" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              Color
            </label>
            <input
              type="color"
              value={cat.glowColor}
              onChange={(e) => onUpdate(cat.id, { glowColor: e.target.value })}
              className="w-6 h-6 bg-transparent border border-[#0D2137] cursor-pointer"
            />
            <span className="text-[10px] text-[#334455]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {cat.glowColor}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-[#7799BB] w-16" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              Shape
            </label>
            <select
              value={cat.shape}
              onChange={(e) => onUpdate(cat.id, { shape: e.target.value })}
              className="bg-[#050D1A] border border-[#0D2137] text-[10px] text-[#AAC0DD] px-2 py-1"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <option value="sphere">Sphere</option>
              <option value="icosahedron">Icosahedron</option>
              <option value="octahedron">Octahedron</option>
              <option value="cylinder">Cylinder</option>
              <option value="box">Box</option>
              <option value="cone">Cone</option>
              <option value="torus">Torus</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-[#7799BB] w-16" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              Enabled
            </label>
            <button
              onClick={() => onUpdate(cat.id, { enabled: !cat.enabled })}
              className={`text-[10px] px-2 py-0.5 border ${
                cat.enabled
                  ? "border-green-600 text-green-400"
                  : "border-red-900 text-red-400"
              }`}
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              {cat.enabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export const SettingsPanel = memo(function SettingsPanel() {
  const settingsOpen = useSettingsStore((s) => s.settingsOpen);
  const setSettingsOpen = useSettingsStore((s) => s.setSettingsOpen);
  const toggleSetting = useSettingsStore((s) => s.toggleSetting);
  const showDayNight = useSettingsStore((s) => s.showDayNight);
  const showClouds = useSettingsStore((s) => s.showClouds);
  const showBorders = useSettingsStore((s) => s.showBorders);
  const showCountryLabels = useSettingsStore((s) => s.showCountryLabels);
  const showGrid = useSettingsStore((s) => s.showGrid);
  const showAtmosphere = useSettingsStore((s) => s.showAtmosphere);
  const showBloom = useSettingsStore((s) => s.showBloom);
  const showClocks = useSettingsStore((s) => s.showClocks);
  const showBumpMap = useSettingsStore((s) => s.showBumpMap);
  const categories = useSettingsStore((s) => s.categories);
  const updateCategory = useSettingsStore((s) => s.updateCategory);
  const resetCategories = useSettingsStore((s) => s.resetCategories);
  const clockCities = useSettingsStore((s) => s.clockCities);
  const toggleClockCity = useSettingsStore((s) => s.toggleClockCity);
  const dataSource = useSettingsStore((s) => s.dataSource);
  const setDataSource = useSettingsStore((s) => s.setDataSource);
  const wsUrl = useSettingsStore((s) => s.wsUrl);
  const setWsUrl = useSettingsStore((s) => s.setWsUrl);
  const restUrl = useSettingsStore((s) => s.restUrl);
  const setRestUrl = useSettingsStore((s) => s.setRestUrl);

  const [activeTab, setActiveTab] = useState<"visuals" | "categories" | "clocks" | "data" | "dictionary">("visuals");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const handleToggleCat = useCallback(
    (id: string) => setExpandedCat((prev) => (prev === id ? null : id)),
    []
  );

  if (!settingsOpen) return null;

  return (
    <div
      className="fixed right-0 top-12 bottom-0 w-[380px] z-50 bg-[#020408]/95 backdrop-blur-xl border-l border-[#0D2137] flex flex-col animate-slide-in-right"
      style={{ pointerEvents: "auto" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#0D2137]">
        <span className="text-sm uppercase tracking-widest text-[#7799BB]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          Settings
        </span>
        <button
          onClick={() => setSettingsOpen(false)}
          className="text-[#334455] hover:text-white text-xl px-2"
        >
          &times;
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#0D2137]">
        {(["visuals", "categories", "clocks", "data", "dictionary"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[10px] uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? "text-[#0088FF] border-b-2 border-[#0088FF]"
                : "text-[#334455] hover:text-[#7799BB]"
            }`}
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === "visuals" && (
          <div className="divide-y divide-[#0D2137]/50">
            <div className="px-3 py-2">
              <div className="text-[9px] uppercase text-[#334455] mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Globe Effects
              </div>
            </div>
            <ToggleRow label="Day/Night Terminator" value={showDayNight} onChange={() => toggleSetting("showDayNight")} />
            <ToggleRow label="Clouds Layer" value={showClouds} onChange={() => toggleSetting("showClouds")} />
            <ToggleRow label="Bump Map (Terrain)" value={showBumpMap} onChange={() => toggleSetting("showBumpMap")} />
            <ToggleRow label="Country Borders" value={showBorders} onChange={() => toggleSetting("showBorders")} />
            <ToggleRow label="Country Labels" value={showCountryLabels} onChange={() => toggleSetting("showCountryLabels")} />
            <ToggleRow label="Atmosphere Glow" value={showAtmosphere} onChange={() => toggleSetting("showAtmosphere")} />
            <div className="px-3 py-2">
              <div className="text-[9px] uppercase text-[#334455] mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Post-Processing
              </div>
            </div>
            <ToggleRow label="Bloom (Glow)" value={showBloom} onChange={() => toggleSetting("showBloom")} />
            <ToggleRow label="Grid Overlay" value={showGrid} onChange={() => toggleSetting("showGrid")} />
          </div>
        )}

        {activeTab === "categories" && (
          <div>
            <div className="px-3 py-2 flex justify-between items-center border-b border-[#0D2137]/50">
              <span className="text-[9px] uppercase text-[#334455]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                News Categories
              </span>
              <button
                onClick={resetCategories}
                className="text-[9px] text-[#7799BB] hover:text-white px-2 py-0.5 border border-[#0D2137]"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                RESET DEFAULTS
              </button>
            </div>
            {categories.map((cat) => (
              <CategoryRow
                key={cat.id}
                cat={cat}
                onUpdate={updateCategory}
                isExpanded={expandedCat === cat.id}
                onToggleExpand={() => handleToggleCat(cat.id)}
              />
            ))}
          </div>
        )}

        {activeTab === "clocks" && (
          <div>
            <ToggleRow label="Show World Clocks" value={showClocks} onChange={() => toggleSetting("showClocks")} />
            <div className="px-3 py-2 border-t border-[#0D2137]/50">
              <div className="text-[9px] uppercase text-[#334455] mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Select Cities
              </div>
              <div className="space-y-1">
                {clockCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => toggleClockCity(city.id)}
                    className={`flex items-center gap-2 w-full px-2 py-1.5 text-left transition-colors ${
                      city.enabled
                        ? "bg-[#0A1628] text-[#AAC0DD]"
                        : "text-[#334455] hover:text-[#7799BB]"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        city.enabled ? "bg-[#0088FF]" : "bg-[#1A2A3A]"
                      }`}
                    />
                    <span className="text-[11px] flex-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      {city.name}
                    </span>
                    <span className="text-[9px] text-[#334455]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      {city.short}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="p-3 space-y-4">
            <div>
              <div className="text-[9px] uppercase text-[#334455] mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Data Source
              </div>
              <div className="space-y-1">
                {(["mock", "websocket", "rest"] as const).map((src) => (
                  <button
                    key={src}
                    onClick={() => setDataSource(src)}
                    className={`block w-full text-left px-3 py-2 text-xs border transition-colors ${
                      dataSource === src
                        ? "border-[#0088FF] text-[#AAC0DD] bg-[#0A1628]"
                        : "border-[#0D2137] text-[#334455] hover:text-[#7799BB]"
                    }`}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {src === "mock" && "Mock Data (Built-in simulator)"}
                    {src === "websocket" && "WebSocket (Real-time feed)"}
                    {src === "rest" && "REST API (HTTP POST / n8n)"}
                  </button>
                ))}
              </div>
            </div>

            {dataSource === "websocket" && (
              <div>
                <label className="text-[9px] uppercase text-[#334455] block mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  WebSocket URL
                </label>
                <input
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  className="w-full bg-[#050D1A] border border-[#0D2137] px-3 py-2 text-xs text-[#AAC0DD]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  placeholder="ws://localhost:8000/ws"
                />
              </div>
            )}

            {dataSource === "rest" && (
              <div>
                <label className="text-[9px] uppercase text-[#334455] block mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  REST API URL
                </label>
                <input
                  type="text"
                  value={restUrl}
                  onChange={(e) => setRestUrl(e.target.value)}
                  className="w-full bg-[#050D1A] border border-[#0D2137] px-3 py-2 text-xs text-[#AAC0DD]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  placeholder="http://localhost:8000"
                />
                <div className="mt-2 text-[10px] text-[#334455] leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  The app will poll <span className="text-[#7799BB]">{restUrl}/api/packages</span> and accept
                  POST to <span className="text-[#7799BB]">{restUrl}/api/ingest</span>.
                  Compatible with n8n HTTP Request nodes.
                </div>
              </div>
            )}

            <div className="border-t border-[#0D2137] pt-3">
              <div className="text-[9px] uppercase text-[#334455] mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Flexible Deployment
              </div>
              <div className="text-[10px] text-[#334455] leading-relaxed space-y-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <p>This app works in multiple modes:</p>
                <p className="text-[#7799BB]">- Local: Run on your laptop with mock data</p>
                <p className="text-[#7799BB]">- n8n: Connect to local/remote n8n via REST</p>
                <p className="text-[#7799BB]">- Server: Deploy as a web app with WebSocket</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dictionary" && (
          <div className="p-3 space-y-4">
            <div>
              <div className="text-[9px] uppercase text-[#334455] mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Category Dictionary
              </div>
              <div className="text-[10px] text-[#334455] mb-3 leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                These are the accepted category values for JSON news packages.
                Map your JSON <span className="text-[#7799BB]">classification.category</span> field to these keys:
              </div>
              <div className="bg-[#050D1A] border border-[#0D2137] p-3">
                <table className="w-full text-[10px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  <thead>
                    <tr className="text-[#334455] border-b border-[#0D2137]">
                      <th className="text-left py-1 pr-2">Key</th>
                      <th className="text-left py-1 pr-2">Label</th>
                      <th className="text-left py-1">Color</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(categories.length > 0 ? categories : DEFAULT_CATEGORIES).map((cat) => (
                      <tr key={cat.id} className="text-[#7799BB]">
                        <td className="py-0.5 pr-2 text-[#AAC0DD]">{cat.id}</td>
                        <td className="py-0.5 pr-2">{cat.label}</td>
                        <td className="py-0.5">
                          <span style={{ color: cat.glowColor }}>{cat.glowColor}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="text-[9px] uppercase text-[#334455] mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Geo-Location Fields
              </div>
              <div className="bg-[#050D1A] border border-[#0D2137] p-3 text-[10px] text-[#7799BB] leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <pre className="whitespace-pre-wrap">{`{
  "geo": {
    "city": "Tehran",
    "city_en": "Tehran",
    "country": "Iran",
    "country_en": "Iran",
    "country_iso2": "IR",
    "country_iso3": "IRN",
    "region": "Middle East",
    "coordinates": {
      "lat": 35.6892,
      "lon": 51.3890
    },
    "location_confidence": 0.95
  }
}`}</pre>
              </div>
            </div>

            <div>
              <div className="text-[9px] uppercase text-[#334455] mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                Full JSON Package Schema
              </div>
              <div className="bg-[#050D1A] border border-[#0D2137] p-3 text-[10px] text-[#7799BB] leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <pre className="whitespace-pre-wrap">{`{
  "id": "uuid",
  "source_id": "string",
  "published_at": "ISO-8601",
  "geo": { /* see above */ },
  "content": {
    "headline": "string",
    "headline_en": "string",
    "summary": "string",
    "summary_en": "string",
    "body": "string | null",
    "language": "en",
    "source_name": "Reuters",
    "source_url": "https://...",
    "author": "string | null"
  },
  "classification": {
    "category": "geopolitical",
    "subcategory": "string | null",
    "tags": ["string"],
    "is_breaking": false,
    "is_developing": false
  },
  "scores": {
    "importance": 0.0-1.0,
    "sentiment": -1.0-1.0,
    "sentiment_label": "neutral",
    "urgency": 0.0-1.0,
    "confidence": 0.0-1.0,
    "reach": 0.0-1.0
  },
  "relations": {
    "related_countries": ["ISO3"],
    "related_package_ids": [],
    "story_thread_id": "string",
    "entities": [
      { "name": "...",
        "type": "person|org|location",
        "role": "..." }
    ]
  },
  "media": {
    "images": [],
    "videos": [],
    "has_media": false,
    "media_count": 0
  }
}`}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
