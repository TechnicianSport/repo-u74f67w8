import { create } from "zustand";

export interface CategoryConfig {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  glowColor: string;
  edgeColor: string;
  shape: string;
  enabled: boolean;
}

export interface CityClockConfig {
  id: string;
  name: string;
  timezone: string;
  short: string;
  enabled: boolean;
}

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: "geopolitical", label: "Geopolitical", shortLabel: "GEO", color: "#1A0A2E", glowColor: "#8844FF", edgeColor: "#AA66FF", shape: "icosahedron", enabled: true },
  { id: "military", label: "Military", shortLabel: "MIL", color: "#2A0000", glowColor: "#FF2020", edgeColor: "#FF5555", shape: "cylinder", enabled: true },
  { id: "economy", label: "Economy", shortLabel: "ECO", color: "#0A1A00", glowColor: "#00FF88", edgeColor: "#44FFB0", shape: "box", enabled: true },
  { id: "financial", label: "Financial", shortLabel: "FIN", color: "#1A1A00", glowColor: "#FFD700", edgeColor: "#FFE44D", shape: "octahedron", enabled: true },
  { id: "technology", label: "Technology", shortLabel: "TECH", color: "#000A2A", glowColor: "#0088FF", edgeColor: "#44BBFF", shape: "octahedron", enabled: true },
  { id: "health", label: "Health", shortLabel: "HEALTH", color: "#001A0A", glowColor: "#00FF66", edgeColor: "#88FFAA", shape: "sphere", enabled: true },
  { id: "climate", label: "Climate", shortLabel: "CLIMATE", color: "#001A1A", glowColor: "#00CCFF", edgeColor: "#88DDFF", shape: "sphere", enabled: true },
  { id: "social", label: "Social", shortLabel: "SOC", color: "#1A0A00", glowColor: "#FF8800", edgeColor: "#FFAA44", shape: "sphere", enabled: true },
  { id: "security", label: "Security", shortLabel: "SEC", color: "#1A1A00", glowColor: "#FFEE00", edgeColor: "#FFFF66", shape: "cone", enabled: true },
  { id: "diplomacy", label: "Diplomacy", shortLabel: "DIP", color: "#001A1A", glowColor: "#00FFCC", edgeColor: "#66FFE0", shape: "icosahedron", enabled: true },
  { id: "sport", label: "Sport", shortLabel: "SPORT", color: "#0A0A1A", glowColor: "#FF6600", edgeColor: "#FF8844", shape: "sphere", enabled: true },
  { id: "weather", label: "Weather", shortLabel: "WTHR", color: "#000A1A", glowColor: "#66CCFF", edgeColor: "#99DDFF", shape: "sphere", enabled: true },
  { id: "other", label: "Other", shortLabel: "OTHER", color: "#0A0A0A", glowColor: "#888888", edgeColor: "#AAAAAA", shape: "sphere", enabled: true },
];

export const ALL_CLOCK_CITIES: CityClockConfig[] = [
  { id: "london", name: "London", timezone: "Europe/London", short: "LON", enabled: true },
  { id: "paris", name: "Paris", timezone: "Europe/Paris", short: "PAR", enabled: true },
  { id: "moscow", name: "Moscow", timezone: "Europe/Moscow", short: "MOW", enabled: true },
  { id: "dubai", name: "Dubai", timezone: "Asia/Dubai", short: "DXB", enabled: true },
  { id: "los_angeles", name: "Los Angeles", timezone: "America/Los_Angeles", short: "LAX", enabled: false },
  { id: "toronto", name: "Toronto", timezone: "America/Toronto", short: "YTO", enabled: false },
  { id: "vancouver", name: "Vancouver", timezone: "America/Vancouver", short: "YVR", enabled: false },
  { id: "dallas", name: "Dallas", timezone: "America/Chicago", short: "DFW", enabled: false },
  { id: "washington", name: "Washington", timezone: "America/New_York", short: "WAS", enabled: true },
  { id: "tehran", name: "Tehran", timezone: "Asia/Tehran", short: "THR", enabled: true },
  { id: "istanbul", name: "Istanbul", timezone: "Europe/Istanbul", short: "IST", enabled: false },
  { id: "tel_aviv", name: "Tel Aviv", timezone: "Asia/Jerusalem", short: "TLV", enabled: false },
  { id: "sydney", name: "Sydney", timezone: "Australia/Sydney", short: "SYD", enabled: true },
  { id: "tokyo", name: "Tokyo", timezone: "Asia/Tokyo", short: "TYO", enabled: true },
  { id: "beijing", name: "Beijing", timezone: "Asia/Shanghai", short: "PEK", enabled: false },
  { id: "berlin", name: "Berlin", timezone: "Europe/Berlin", short: "BER", enabled: false },
  { id: "rome", name: "Rome", timezone: "Europe/Rome", short: "ROM", enabled: false },
  { id: "new_york", name: "New York", timezone: "America/New_York", short: "NYC", enabled: false },
  { id: "cairo", name: "Cairo", timezone: "Africa/Cairo", short: "CAI", enabled: false },
  { id: "nairobi", name: "Nairobi", timezone: "Africa/Nairobi", short: "NBO", enabled: false },
  { id: "new_delhi", name: "New Delhi", timezone: "Asia/Kolkata", short: "DEL", enabled: false },
  { id: "seoul", name: "Seoul", timezone: "Asia/Seoul", short: "SEL", enabled: false },
];

interface SettingsState {
  showDayNight: boolean;
  showClouds: boolean;
  showBorders: boolean;
  showCountryLabels: boolean;
  showGrid: boolean;
  showAtmosphere: boolean;
  showBloom: boolean;
  showOcean: boolean;
  showClocks: boolean;
  showBumpMap: boolean;
  settingsOpen: boolean;

  dataSource: "mock" | "websocket" | "rest";
  wsUrl: string;
  restUrl: string;

  categories: CategoryConfig[];
  clockCities: CityClockConfig[];

  toggleSetting: (key: keyof SettingsState) => void;
  setSettingsOpen: (open: boolean) => void;
  setDataSource: (src: "mock" | "websocket" | "rest") => void;
  setWsUrl: (url: string) => void;
  setRestUrl: (url: string) => void;
  updateCategory: (id: string, patch: Partial<CategoryConfig>) => void;
  toggleClockCity: (id: string) => void;
  resetCategories: () => void;
}

function loadPersisted<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}

function persist(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch { /* ignore */ }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  showDayNight: loadPersisted("lnm_dayNight", true),
  showClouds: loadPersisted("lnm_clouds", true),
  showBorders: loadPersisted("lnm_borders", true),
  showCountryLabels: loadPersisted("lnm_labels", false),
  showGrid: loadPersisted("lnm_grid", false),
  showAtmosphere: loadPersisted("lnm_atmosphere", true),
  showBloom: loadPersisted("lnm_bloom", true),
  showOcean: true,
  showClocks: loadPersisted("lnm_clocks", true),
  showBumpMap: loadPersisted("lnm_bump", true),
  settingsOpen: false,

  dataSource: loadPersisted("lnm_dataSource", "mock"),
  wsUrl: loadPersisted("lnm_wsUrl", "ws://localhost:8000/ws"),
  restUrl: loadPersisted("lnm_restUrl", "http://localhost:8000"),

  categories: loadPersisted("lnm_categories", DEFAULT_CATEGORIES),
  clockCities: loadPersisted("lnm_clockCities", ALL_CLOCK_CITIES),

  toggleSetting: (key) =>
    set((s) => {
      const val = !s[key as keyof typeof s];
      persist(`lnm_${key.replace("show", "").toLowerCase()}`, val);
      return { [key]: val } as Partial<SettingsState>;
    }),

  setSettingsOpen: (open) => set({ settingsOpen: open }),

  setDataSource: (src) => {
    persist("lnm_dataSource", src);
    set({ dataSource: src });
  },

  setWsUrl: (url) => {
    persist("lnm_wsUrl", url);
    set({ wsUrl: url });
  },

  setRestUrl: (url) => {
    persist("lnm_restUrl", url);
    set({ restUrl: url });
  },

  updateCategory: (id, patch) =>
    set((s) => {
      const cats = s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c));
      persist("lnm_categories", cats);
      return { categories: cats };
    }),

  toggleClockCity: (id) =>
    set((s) => {
      const cities = s.clockCities.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      );
      persist("lnm_clockCities", cities);
      return { clockCities: cities };
    }),

  resetCategories: () => {
    persist("lnm_categories", DEFAULT_CATEGORIES);
    set({ categories: DEFAULT_CATEGORIES });
  },
}));
