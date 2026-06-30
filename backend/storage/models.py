import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class NewsPackageModel(Base):
    __tablename__ = "news_packages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(String(255))
    pipeline_version = Column(String(50))
    published_at = Column(DateTime(timezone=True), nullable=False)
    ingested_at = Column(DateTime(timezone=True), nullable=False)
    delivered_at = Column(DateTime(timezone=True), nullable=False)

    # geo (flattened)
    city = Column(String(255))
    city_en = Column(String(255), nullable=False)
    country = Column(String(255))
    country_en = Column(String(255), nullable=False)
    country_iso2 = Column(String(2), nullable=False)
    country_iso3 = Column(String(3), nullable=False)
    region = Column(String(255))
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    location_confidence = Column(Float)

    # classification
    category = Column(String(50), nullable=False)
    subcategory = Column(String(100))
    tags = Column(ARRAY(Text), default=[])
    is_breaking = Column(Boolean, default=False)
    is_developing = Column(Boolean, default=False)

    # scores
    importance = Column(Float, nullable=False)
    sentiment = Column(Float, nullable=False)
    sentiment_label = Column(String(20))
    urgency = Column(Float)
    confidence = Column(Float)
    reach = Column(Float)

    # relations
    related_countries = Column(ARRAY(Text), default=[])
    related_package_ids = Column(ARRAY(Text), default=[])
    story_thread_id = Column(String(255))

    # full JSON
    raw_json = Column(JSONB, nullable=False)

    # metadata
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        Index("ix_published_at", "published_at"),
        Index("ix_storyline_group", "city_en", "country_iso3", "category"),
        Index("ix_story_thread", "story_thread_id"),
        Index("ix_is_breaking", "is_breaking"),
        Index("ix_country_iso3", "country_iso3"),
    )


class StorylineModel(Base):
    __tablename__ = "storylines"

    id = Column(String(500), primary_key=True)
    city_en = Column(String(255))
    country_iso3 = Column(String(3))
    country_en = Column(String(255))
    category = Column(String(50))
    lat = Column(Float)
    lon = Column(Float)
    package_ids = Column(ARRAY(Text), default=[])
    package_count = Column(Integer, default=0)
    importance_peak = Column(Float, default=0.0)
    dominant_sentiment = Column(Float, default=0.0)
    is_breaking = Column(Boolean, default=False)
    has_media = Column(Boolean, default=False)
    first_at = Column(DateTime(timezone=True))
    last_at = Column(DateTime(timezone=True))
    published_date = Column(Date, nullable=False)

    __table_args__ = (Index("ix_storyline_date", "published_date"),)
