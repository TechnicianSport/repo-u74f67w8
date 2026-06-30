from datetime import date, datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from storage.models import NewsPackageModel, StorylineModel


async def check_duplicate(session: AsyncSession, package_id: str) -> bool:
    result = await session.execute(
        select(NewsPackageModel.id).where(
            NewsPackageModel.id == UUID(package_id)
        )
    )
    return result.scalar_one_or_none() is not None


async def insert_package(
    session: AsyncSession, package_data: dict, raw_json: dict
) -> NewsPackageModel:
    model = NewsPackageModel(
        id=UUID(package_data["id"]),
        source_id=package_data["source_id"],
        pipeline_version=package_data["pipeline_version"],
        published_at=package_data["published_at"],
        ingested_at=package_data["ingested_at"],
        delivered_at=package_data["delivered_at"],
        city=package_data["geo"]["city"],
        city_en=package_data["geo"]["city_en"],
        country=package_data["geo"]["country"],
        country_en=package_data["geo"]["country_en"],
        country_iso2=package_data["geo"]["country_iso2"],
        country_iso3=package_data["geo"]["country_iso3"],
        region=package_data["geo"].get("region"),
        lat=package_data["geo"]["coordinates"]["lat"],
        lon=package_data["geo"]["coordinates"]["lon"],
        location_confidence=package_data["geo"]["location_confidence"],
        category=package_data["classification"]["category"],
        subcategory=package_data["classification"].get("subcategory"),
        tags=package_data["classification"].get("tags", []),
        is_breaking=package_data["classification"].get("is_breaking", False),
        is_developing=package_data["classification"].get("is_developing", False),
        importance=package_data["scores"]["importance"],
        sentiment=package_data["scores"]["sentiment"],
        sentiment_label=package_data["scores"]["sentiment_label"],
        urgency=package_data["scores"]["urgency"],
        confidence=package_data["scores"]["confidence"],
        reach=package_data["scores"]["reach"],
        related_countries=package_data["relations"].get("related_countries", []),
        related_package_ids=package_data["relations"].get(
            "related_package_ids", []
        ),
        story_thread_id=package_data["relations"].get("story_thread_id"),
        raw_json=raw_json,
    )
    session.add(model)
    return model


async def upsert_storyline(
    session: AsyncSession, package_data: dict
) -> StorylineModel:
    geo = package_data["geo"]
    classification = package_data["classification"]
    scores = package_data["scores"]
    media = package_data.get("media", {})

    city_en = geo["city_en"]
    iso3 = geo["country_iso3"]
    category = classification["category"]
    storyline_id = f"{city_en}_{iso3}_{category}".lower().replace(" ", "_")

    pub_dt = package_data["published_at"]
    if isinstance(pub_dt, str):
        pub_dt = datetime.fromisoformat(pub_dt.replace("Z", "+00:00"))
    pub_date = pub_dt.date() if isinstance(pub_dt, datetime) else pub_dt

    result = await session.execute(
        select(StorylineModel).where(StorylineModel.id == storyline_id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.package_ids = list(existing.package_ids or []) + [
            package_data["id"]
        ]
        existing.package_count = len(existing.package_ids)
        existing.importance_peak = max(
            existing.importance_peak or 0, scores["importance"]
        )
        # Update rolling average sentiment
        if existing.package_count > 1:
            old_total = (existing.dominant_sentiment or 0) * (
                existing.package_count - 1
            )
            existing.dominant_sentiment = (
                old_total + scores["sentiment"]
            ) / existing.package_count
        else:
            existing.dominant_sentiment = scores["sentiment"]
        existing.is_breaking = existing.is_breaking or classification.get(
            "is_breaking", False
        )
        existing.has_media = existing.has_media or media.get("has_media", False)
        existing.last_at = pub_dt
        return existing

    storyline = StorylineModel(
        id=storyline_id,
        city_en=city_en,
        country_iso3=iso3,
        country_en=geo["country_en"],
        category=category,
        lat=geo["coordinates"]["lat"],
        lon=geo["coordinates"]["lon"],
        package_ids=[package_data["id"]],
        package_count=1,
        importance_peak=scores["importance"],
        dominant_sentiment=scores["sentiment"],
        is_breaking=classification.get("is_breaking", False),
        has_media=media.get("has_media", False),
        first_at=pub_dt,
        last_at=pub_dt,
        published_date=pub_date,
    )
    session.add(storyline)
    return storyline


async def get_packages_by_date(
    session: AsyncSession,
    target_date: date,
    category: Optional[str] = None,
    country_iso3: Optional[str] = None,
    is_breaking: Optional[bool] = None,
    min_importance: float = 0.0,
    limit: int = 200,
    offset: int = 0,
) -> tuple[list[dict], int]:
    base_query = select(NewsPackageModel).where(
        func.date(NewsPackageModel.published_at) == target_date,
        NewsPackageModel.importance >= min_importance,
    )

    count_query = select(func.count(NewsPackageModel.id)).where(
        func.date(NewsPackageModel.published_at) == target_date,
        NewsPackageModel.importance >= min_importance,
    )

    if category:
        base_query = base_query.where(NewsPackageModel.category == category)
        count_query = count_query.where(NewsPackageModel.category == category)
    if country_iso3:
        base_query = base_query.where(
            NewsPackageModel.country_iso3 == country_iso3
        )
        count_query = count_query.where(
            NewsPackageModel.country_iso3 == country_iso3
        )
    if is_breaking is not None:
        base_query = base_query.where(
            NewsPackageModel.is_breaking == is_breaking
        )
        count_query = count_query.where(
            NewsPackageModel.is_breaking == is_breaking
        )

    total_result = await session.execute(count_query)
    total = total_result.scalar_one()

    query = (
        base_query.order_by(NewsPackageModel.published_at.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await session.execute(query)
    packages = result.scalars().all()

    return [p.raw_json for p in packages], total


async def get_storylines_by_date(
    session: AsyncSession,
    target_date: date,
    category: Optional[str] = None,
    country_iso3: Optional[str] = None,
    min_importance: float = 0.0,
) -> list[StorylineModel]:
    query = select(StorylineModel).where(
        StorylineModel.published_date == target_date,
        StorylineModel.importance_peak >= min_importance,
    )

    if category:
        query = query.where(StorylineModel.category == category)
    if country_iso3:
        query = query.where(StorylineModel.country_iso3 == country_iso3)

    result = await session.execute(query)
    return list(result.scalars().all())


async def get_storyline_by_id(
    session: AsyncSession, storyline_id: str
) -> Optional[StorylineModel]:
    result = await session.execute(
        select(StorylineModel).where(StorylineModel.id == storyline_id)
    )
    return result.scalar_one_or_none()


async def get_package_by_id(
    session: AsyncSession, package_id: str
) -> Optional[dict]:
    result = await session.execute(
        select(NewsPackageModel.raw_json).where(
            NewsPackageModel.id == UUID(package_id)
        )
    )
    row = result.scalar_one_or_none()
    return row


async def get_available_dates(
    session: AsyncSession, max_days: int = 7
) -> list[dict]:
    cutoff = date.today() - timedelta(days=max_days)

    query = text("""
        SELECT
            DATE(published_at) as pub_date,
            COUNT(*) as cnt,
            BOOL_OR(is_breaking) as has_break
        FROM news_packages
        WHERE DATE(published_at) >= :cutoff
        GROUP BY DATE(published_at)
        ORDER BY pub_date DESC
    """)
    result = await session.execute(query, {"cutoff": cutoff})
    rows = result.fetchall()

    return [
        {
            "date": str(row.pub_date),
            "count": row.cnt,
            "has_breaking": row.has_break,
        }
        for row in rows
    ]


async def get_today_count(session: AsyncSession) -> int:
    today = date.today()
    result = await session.execute(
        select(func.count(NewsPackageModel.id)).where(
            func.date(NewsPackageModel.published_at) == today
        )
    )
    return result.scalar_one()
