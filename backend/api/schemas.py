from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


class GeoCoordinates(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)


class GeoData(BaseModel):
    city: str
    city_en: str
    country: str
    country_en: str
    country_iso2: str = Field(..., min_length=2, max_length=2)
    country_iso3: str = Field(..., min_length=3, max_length=3)
    region: Optional[str] = None
    coordinates: GeoCoordinates
    location_confidence: float = Field(..., ge=0.0, le=1.0)


class ContentData(BaseModel):
    headline: str = Field(..., max_length=120)
    headline_en: str
    summary: str
    summary_en: str
    body: Optional[str] = None
    language: str
    source_name: str
    source_url: str
    author: Optional[str] = None


class ClassificationData(BaseModel):
    category: Literal[
        "geopolitical",
        "military",
        "economy",
        "technology",
        "health",
        "climate",
        "social",
        "security",
        "diplomacy",
        "other",
    ]
    subcategory: Optional[str] = None
    tags: list[str] = []
    is_breaking: bool = False
    is_developing: bool = False


class ScoresData(BaseModel):
    importance: float = Field(..., ge=0.0, le=1.0)
    sentiment: float = Field(..., ge=-1.0, le=1.0)
    sentiment_label: Literal[
        "very_negative", "negative", "neutral", "positive", "very_positive"
    ]
    urgency: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    reach: float = Field(..., ge=0.0, le=1.0)


class Entity(BaseModel):
    name: str
    name_en: str
    type: Literal["person", "organization", "location", "event", "other"]
    role: Optional[str] = None


class RelationsData(BaseModel):
    related_countries: list[str] = []
    related_package_ids: list[str] = []
    story_thread_id: Optional[str] = None
    entities: list[Entity] = []


class ImageMedia(BaseModel):
    id: str
    url: str
    thumbnail_url: str
    caption: Optional[str] = None
    caption_en: Optional[str] = None
    credit: Optional[str] = None
    width: int
    height: int
    taken_at: Optional[datetime] = None


class VideoMedia(BaseModel):
    id: str
    url: str
    stream_url: Optional[str] = None
    thumbnail_url: str
    caption: Optional[str] = None
    caption_en: Optional[str] = None
    credit: Optional[str] = None
    duration_seconds: int
    width: int
    height: int
    recorded_at: Optional[datetime] = None


class MediaData(BaseModel):
    images: list[ImageMedia] = []
    videos: list[VideoMedia] = []
    has_media: bool = False
    media_count: int = 0

    @model_validator(mode="after")
    def compute_media_fields(self) -> "MediaData":
        self.media_count = len(self.images) + len(self.videos)
        self.has_media = self.media_count > 0
        return self


class VisualParams(BaseModel):
    primary_color: str
    glow_color: str
    elevation_boost: float = Field(..., ge=0.0, le=1.0)
    pulse_intensity: float = Field(..., ge=0.0, le=1.0)
    pulse_speed: float
    node_scale: float = Field(1.0, ge=0.5, le=2.5)
    particle_effect: Literal["shockwave", "sparks", "ripple", "none"]
    connection_weight: float = Field(..., ge=0.0, le=1.0)
    icon_key: str


class NewsPackage(BaseModel):
    id: str
    source_id: str
    pipeline_version: str
    published_at: datetime
    ingested_at: datetime
    delivered_at: datetime
    geo: GeoData
    content: ContentData
    classification: ClassificationData
    scores: ScoresData
    relations: RelationsData
    media: MediaData
    visual: VisualParams


class BatchIngestRequest(BaseModel):
    packages: list[NewsPackage] = Field(..., max_length=100)


class IngestResponse(BaseModel):
    received: int
    inserted: int
    duplicates: int


class PackagesResponse(BaseModel):
    packages: list[dict]
    total: int
    date: str
    mode: str


class StorylineResponse(BaseModel):
    id: str
    city_en: str
    country_iso3: str
    country_en: str
    category: str
    lat: float
    lon: float
    package_count: int
    importance_peak: float
    dominant_sentiment: float
    is_breaking: bool
    has_media: bool
    first_at: datetime
    last_at: datetime


class StorylinesListResponse(BaseModel):
    storylines: list[StorylineResponse]
    date: str
    total: int


class StorylineDetailResponse(BaseModel):
    storyline: StorylineResponse
    packages: list[dict]


class AvailableDateInfo(BaseModel):
    date: str
    count: int
    has_breaking: bool


class AvailableDatesResponse(BaseModel):
    dates: list[AvailableDateInfo]


class HealthResponse(BaseModel):
    status: str
    db: str
    redis: str
    mode: str
