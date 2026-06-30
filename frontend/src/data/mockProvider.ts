import type { NewsPackage, NewsCategory } from "../types/news.types";
import { CATEGORY_VISUALS } from "../constants/categoryVisuals";
import { v4 as uuid } from "uuid";

const MOCK_LOCATIONS = [
  { city: "Tehran", city_en: "Tehran", country: "Iran", country_en: "Iran", iso2: "IR", iso3: "IRN", lat: 35.6892, lon: 51.389 },
  { city: "Washington D.C.", city_en: "Washington D.C.", country: "United States", country_en: "United States", iso2: "US", iso3: "USA", lat: 38.9072, lon: -77.0369 },
  { city: "London", city_en: "London", country: "United Kingdom", country_en: "United Kingdom", iso2: "GB", iso3: "GBR", lat: 51.5074, lon: -0.1278 },
  { city: "Beijing", city_en: "Beijing", country: "China", country_en: "China", iso2: "CN", iso3: "CHN", lat: 39.9042, lon: 116.4074 },
  { city: "Moscow", city_en: "Moscow", country: "Russia", country_en: "Russia", iso2: "RU", iso3: "RUS", lat: 55.7558, lon: 37.6173 },
  { city: "Berlin", city_en: "Berlin", country: "Germany", country_en: "Germany", iso2: "DE", iso3: "DEU", lat: 52.52, lon: 13.405 },
  { city: "Tokyo", city_en: "Tokyo", country: "Japan", country_en: "Japan", iso2: "JP", iso3: "JPN", lat: 35.6762, lon: 139.6503 },
  { city: "Brasilia", city_en: "Brasilia", country: "Brazil", country_en: "Brazil", iso2: "BR", iso3: "BRA", lat: -15.7975, lon: -47.8919 },
  { city: "New Delhi", city_en: "New Delhi", country: "India", country_en: "India", iso2: "IN", iso3: "IND", lat: 28.6139, lon: 77.209 },
  { city: "Cairo", city_en: "Cairo", country: "Egypt", country_en: "Egypt", iso2: "EG", iso3: "EGY", lat: 30.0444, lon: 31.2357 },
  { city: "Nairobi", city_en: "Nairobi", country: "Kenya", country_en: "Kenya", iso2: "KE", iso3: "KEN", lat: -1.2921, lon: 36.8219 },
  { city: "Sydney", city_en: "Sydney", country: "Australia", country_en: "Australia", iso2: "AU", iso3: "AUS", lat: -33.8688, lon: 151.2093 },
  { city: "Paris", city_en: "Paris", country: "France", country_en: "France", iso2: "FR", iso3: "FRA", lat: 48.8566, lon: 2.3522 },
  { city: "Seoul", city_en: "Seoul", country: "South Korea", country_en: "South Korea", iso2: "KR", iso3: "KOR", lat: 37.5665, lon: 126.978 },
  { city: "Riyadh", city_en: "Riyadh", country: "Saudi Arabia", country_en: "Saudi Arabia", iso2: "SA", iso3: "SAU", lat: 24.7136, lon: 46.6753 },
];

const CATEGORIES: NewsCategory[] = [
  "geopolitical", "military", "economy", "technology", "health",
  "climate", "social", "security", "diplomacy", "other",
];

const HEADLINES: Record<NewsCategory, string[]> = {
  geopolitical: [
    "New sanctions imposed amid escalating tensions",
    "UN Security Council holds emergency session on regional conflict",
    "Election results disputed, international observers weigh in",
    "Border dispute intensifies between neighboring nations",
    "Alliance expansion talks enter critical phase",
  ],
  military: [
    "Naval exercises begin in contested waters",
    "Missile defense system deployment announced",
    "Joint military operations launched in border region",
    "Air force scrambles interceptors near sovereign airspace",
    "Troop movements detected near demilitarized zone",
  ],
  economy: [
    "Central bank raises interest rates to combat inflation",
    "Trade deficit hits record levels amid supply chain disruption",
    "Major tech company announces global layoffs",
    "Stock markets plunge on geopolitical uncertainty",
    "Oil prices surge after production cuts announced",
  ],
  technology: [
    "AI regulation framework proposed by government",
    "Cybersecurity breach exposes millions of records",
    "Space agency launches next-generation satellite constellation",
    "Quantum computing breakthrough achieved in research lab",
    "Social media platform faces global ban threats",
  ],
  health: [
    "New variant of concern detected by health officials",
    "Vaccine rollout expands to underserved communities",
    "Hospital system overwhelmed as infections surge",
    "WHO declares health emergency in affected region",
    "Drug shortage crisis deepens across multiple countries",
  ],
  climate: [
    "Record temperatures shatter historical data",
    "Wildfire devastation reaches unprecedented scale",
    "Flooding displaces thousands in coastal communities",
    "Carbon emissions treaty negotiations stall",
    "Glacier retreat accelerating beyond predictions",
  ],
  social: [
    "Mass protests erupt over proposed legislation",
    "Refugee crisis intensifies at international borders",
    "Education reform sparks nationwide debate",
    "Cultural heritage site threatened by development plans",
    "Food insecurity rising in conflict-affected areas",
  ],
  security: [
    "Cybersecurity agency issues critical infrastructure alert",
    "Espionage charges filed against foreign nationals",
    "Terrorist threat level raised following intelligence reports",
    "Border security enhanced with new surveillance technology",
    "Critical infrastructure attack thwarted by authorities",
  ],
  diplomacy: [
    "Peace talks resume after months of stalemate",
    "Embassy recalled amid diplomatic standoff",
    "International summit produces breakthrough agreement",
    "Diplomatic immunity waived in unprecedented move",
    "Treaty ratification moves forward despite opposition",
  ],
  other: [
    "Unexpected archaeological discovery changes historical narrative",
    "Major sporting event relocated due to safety concerns",
    "Scientific expedition returns with unprecedented findings",
    "Space tourism company announces commercial flights",
    "Maritime rescue operation saves hundreds at sea",
  ],
};

const SOURCES = [
  "Reuters", "BBC", "Al Jazeera", "CNN", "Associated Press",
  "Bloomberg", "The Guardian", "AFP", "DW", "Xinhua",
];

function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePackage(
  index: number,
  dateStr: string,
  locationOverride?: typeof MOCK_LOCATIONS[0],
  categoryOverride?: NewsCategory
): NewsPackage {
  const loc = locationOverride ?? randomElement(MOCK_LOCATIONS);
  const category = categoryOverride ?? randomElement(CATEGORIES);
  const catVis = CATEGORY_VISUALS[category];
  const importance = randomFloat(0.1, 0.95);
  const sentiment = randomFloat(-1, 1);
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  const headlines = HEADLINES[category];
  const headline = randomElement(headlines);
  const isBreaking = importance > 0.85 && Math.random() > 0.7;

  const threadId = index < 10 ? `thread_${Math.floor(index / 3)}` : null;

  return {
    id: uuid(),
    source_id: `src_${index}`,
    pipeline_version: "1.0.0",
    published_at: `${dateStr}T${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00Z`,
    ingested_at: `${dateStr}T${hour.toString().padStart(2, "0")}:${(minute + 1).toString().padStart(2, "0")}:00Z`,
    delivered_at: `${dateStr}T${hour.toString().padStart(2, "0")}:${(minute + 2).toString().padStart(2, "0")}:00Z`,
    geo: {
      city: loc.city,
      city_en: loc.city_en,
      country: loc.country,
      country_en: loc.country_en,
      country_iso2: loc.iso2,
      country_iso3: loc.iso3,
      region: null,
      coordinates: { lat: loc.lat, lon: loc.lon },
      location_confidence: randomFloat(0.7, 1.0),
    },
    content: {
      headline,
      headline_en: headline,
      summary: `${headline}. Reports indicate significant developments in the region as officials respond to the evolving situation. Sources close to the matter suggest further developments are expected.`,
      summary_en: `${headline}. Reports indicate significant developments in the region as officials respond to the evolving situation. Sources close to the matter suggest further developments are expected.`,
      body: null,
      language: "en",
      source_name: randomElement(SOURCES),
      source_url: `https://example.com/article/${index}`,
      author: Math.random() > 0.5 ? "Staff Reporter" : null,
    },
    classification: {
      category,
      subcategory: null,
      tags: [category, loc.country_en.toLowerCase()],
      is_breaking: isBreaking,
      is_developing: Math.random() > 0.6,
    },
    scores: {
      importance,
      sentiment,
      sentiment_label: sentiment < -0.6 ? "very_negative" : sentiment < -0.2 ? "negative" : sentiment < 0.2 ? "neutral" : sentiment < 0.6 ? "positive" : "very_positive",
      urgency: randomFloat(0, 1),
      confidence: randomFloat(0.6, 1),
      reach: randomFloat(0.1, 1),
    },
    relations: {
      related_countries: index < 10 ? [randomElement(MOCK_LOCATIONS).iso3] : [],
      related_package_ids: [],
      story_thread_id: threadId,
      entities: importance > 0.5
        ? [
            {
              name: "Official",
              name_en: "Government Official",
              type: "person",
              role: "spokesperson",
            },
          ]
        : [],
    },
    media: {
      images: [],
      videos: [],
      has_media: false,
      media_count: 0,
    },
    visual: {
      primary_color: catVis.baseColor,
      glow_color: catVis.glow,
      elevation_boost: importance * 0.5,
      pulse_intensity: importance,
      pulse_speed: 1.5 + importance,
      node_scale: 1.0 + importance * 1.5,
      particle_effect: isBreaking ? "shockwave" : importance > 0.75 ? "sparks" : "none",
      connection_weight: importance * 0.8,
      icon_key: catVis.icon,
    },
  };
}

export function generateMockPackages(count: number = 50): NewsPackage[] {
  const today = new Date().toISOString().split("T")[0];
  const packages: NewsPackage[] = [];

  // Create storylines: same city + country + category for groups
  // Tehran + geopolitical storyline (3 packages)
  for (let i = 0; i < 3; i++) {
    packages.push(generatePackage(packages.length, today, MOCK_LOCATIONS[0], "geopolitical"));
  }
  // Washington + military storyline (3 packages)
  for (let i = 0; i < 3; i++) {
    packages.push(generatePackage(packages.length, today, MOCK_LOCATIONS[1], "military"));
  }
  // London + economy storyline (2 packages)
  for (let i = 0; i < 2; i++) {
    packages.push(generatePackage(packages.length, today, MOCK_LOCATIONS[2], "economy"));
  }

  // One explicit breaking
  const breakingPkg = generatePackage(packages.length, today, MOCK_LOCATIONS[4], "security");
  breakingPkg.classification.is_breaking = true;
  breakingPkg.scores.importance = 0.92;
  breakingPkg.visual.particle_effect = "shockwave";
  packages.push(breakingPkg);

  // Related packages
  if (packages.length >= 2) {
    packages[0].relations.related_package_ids = [packages[1].id];
    packages[1].relations.related_package_ids = [packages[0].id];
  }

  // Fill rest with random packages
  while (packages.length < count) {
    packages.push(generatePackage(packages.length, today));
  }

  return packages;
}

export function generateMockPackagesForDate(date: string): NewsPackage[] {
  const count = 30 + Math.floor(Math.random() * 120);
  const packages: NewsPackage[] = [];
  for (let i = 0; i < count; i++) {
    packages.push(generatePackage(i, date));
  }
  return packages;
}

export function createMockLiveSimulator(
  addPackage: (p: NewsPackage) => void,
  pushBreaking: (p: NewsPackage) => void
): { start: () => void; stop: () => void } {
  let interval: ReturnType<typeof setInterval> | null = null;
  let breakingInterval: ReturnType<typeof setInterval> | null = null;
  let counter = 100;

  const start = () => {
    const today = new Date().toISOString().split("T")[0];

    interval = setInterval(() => {
      const delay = 200 + Math.random() * 600;
      setTimeout(() => {
        const pkg = generatePackage(counter++, today);
        addPackage(pkg);
      }, delay);
    }, 8000);

    breakingInterval = setInterval(() => {
      const pkg = generatePackage(counter++, today, randomElement(MOCK_LOCATIONS), "military");
      pkg.classification.is_breaking = true;
      pkg.scores.importance = 0.93;
      pkg.visual.particle_effect = "shockwave";
      addPackage(pkg);
      pushBreaking(pkg);
    }, 60000);
  };

  const stop = () => {
    if (interval) clearInterval(interval);
    if (breakingInterval) clearInterval(breakingInterval);
  };

  return { start, stop };
}
