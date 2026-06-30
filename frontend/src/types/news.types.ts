export interface GeoCoordinates {
  lat: number;
  lon: number;
}

export interface GeoData {
  city: string;
  city_en: string;
  country: string;
  country_en: string;
  country_iso2: string;
  country_iso3: string;
  region: string | null;
  coordinates: GeoCoordinates;
  location_confidence: number;
}

export interface ContentData {
  headline: string;
  headline_en: string;
  summary: string;
  summary_en: string;
  body: string | null;
  language: string;
  source_name: string;
  source_url: string;
  author: string | null;
}

export type NewsCategory =
  | "geopolitical"
  | "military"
  | "economy"
  | "technology"
  | "health"
  | "climate"
  | "social"
  | "security"
  | "diplomacy"
  | "other";

export type SentimentLabel =
  | "very_negative"
  | "negative"
  | "neutral"
  | "positive"
  | "very_positive";

export type ParticleEffect = "shockwave" | "sparks" | "ripple" | "none";

export interface ClassificationData {
  category: NewsCategory;
  subcategory: string | null;
  tags: string[];
  is_breaking: boolean;
  is_developing: boolean;
}

export interface ScoresData {
  importance: number;
  sentiment: number;
  sentiment_label: SentimentLabel;
  urgency: number;
  confidence: number;
  reach: number;
}

export interface Entity {
  name: string;
  name_en: string;
  type: "person" | "organization" | "location" | "event" | "other";
  role: string | null;
}

export interface RelationsData {
  related_countries: string[];
  related_package_ids: string[];
  story_thread_id: string | null;
  entities: Entity[];
}

export interface ImageMedia {
  id: string;
  url: string;
  thumbnail_url: string;
  caption: string | null;
  caption_en: string | null;
  credit: string | null;
  width: number;
  height: number;
  taken_at: string | null;
}

export interface VideoMedia {
  id: string;
  url: string;
  stream_url: string | null;
  thumbnail_url: string;
  caption: string | null;
  caption_en: string | null;
  credit: string | null;
  duration_seconds: number;
  width: number;
  height: number;
  recorded_at: string | null;
}

export interface MediaData {
  images: ImageMedia[];
  videos: VideoMedia[];
  has_media: boolean;
  media_count: number;
}

export interface VisualParams {
  primary_color: string;
  glow_color: string;
  elevation_boost: number;
  pulse_intensity: number;
  pulse_speed: number;
  node_scale: number;
  particle_effect: ParticleEffect;
  connection_weight: number;
  icon_key: string;
}

export interface NewsPackage {
  id: string;
  source_id: string;
  pipeline_version: string;
  published_at: string;
  ingested_at: string;
  delivered_at: string;
  geo: GeoData;
  content: ContentData;
  classification: ClassificationData;
  scores: ScoresData;
  relations: RelationsData;
  media: MediaData;
  visual: VisualParams;
}

export interface Storyline {
  id: string;
  city: string;
  city_en: string;
  country_en: string;
  country_iso3: string;
  category: string;
  coordinates: GeoCoordinates;
  packages: NewsPackage[];
  latest_package: NewsPackage;
  total_count: number;
  importance_peak: number;
  dominant_sentiment: number;
  has_media: boolean;
  last_updated: string;
  is_breaking: boolean;
}
