from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from api.schemas import (
    AvailableDatesResponse,
    PackagesResponse,
    StorylineDetailResponse,
    StorylineResponse,
    StorylinesListResponse,
)
from storage.database import get_session
from storage.queries import (
    get_available_dates,
    get_package_by_id,
    get_packages_by_date,
    get_storyline_by_id,
    get_storylines_by_date,
    get_today_count,
)

router = APIRouter()


@router.get("/api/packages", response_model=PackagesResponse)
async def list_packages(
    date: date = Query(default_factory=date.today),
    category: Optional[str] = None,
    country_iso3: Optional[str] = None,
    is_breaking: Optional[bool] = None,
    min_importance: float = 0.0,
    limit: int = Query(200, le=500),
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
) -> PackagesResponse:
    packages, total = await get_packages_by_date(
        session,
        target_date=date,
        category=category,
        country_iso3=country_iso3,
        is_breaking=is_breaking,
        min_importance=min_importance,
        limit=limit,
        offset=offset,
    )
    return PackagesResponse(
        packages=packages,
        total=total,
        date=str(date),
        mode="archive" if date < date.today() else "live",
    )


@router.get("/api/packages/{package_id}")
async def get_package(
    package_id: str,
    session: AsyncSession = Depends(get_session),
) -> dict:
    pkg = await get_package_by_id(session, package_id)
    if not pkg:
        return {"error": "Package not found"}
    return pkg


@router.get("/api/storylines", response_model=StorylinesListResponse)
async def list_storylines(
    date: date = Query(default_factory=date.today),
    category: Optional[str] = None,
    country_iso3: Optional[str] = None,
    min_importance: float = 0.0,
    session: AsyncSession = Depends(get_session),
) -> StorylinesListResponse:
    storylines = await get_storylines_by_date(
        session,
        target_date=date,
        category=category,
        country_iso3=country_iso3,
        min_importance=min_importance,
    )
    items = [
        StorylineResponse(
            id=sl.id,
            city_en=sl.city_en or "",
            country_iso3=sl.country_iso3 or "",
            country_en=sl.country_en or "",
            category=sl.category or "",
            lat=sl.lat or 0.0,
            lon=sl.lon or 0.0,
            package_count=sl.package_count or 0,
            importance_peak=sl.importance_peak or 0.0,
            dominant_sentiment=sl.dominant_sentiment or 0.0,
            is_breaking=sl.is_breaking or False,
            has_media=sl.has_media or False,
            first_at=sl.first_at,
            last_at=sl.last_at,
        )
        for sl in storylines
    ]
    return StorylinesListResponse(
        storylines=items,
        date=str(date),
        total=len(items),
    )


@router.get("/api/storylines/{storyline_id}", response_model=StorylineDetailResponse)
async def get_storyline_detail(
    storyline_id: str,
    session: AsyncSession = Depends(get_session),
) -> StorylineDetailResponse:
    sl = await get_storyline_by_id(session, storyline_id)
    if not sl:
        return StorylineDetailResponse(
            storyline=StorylineResponse(
                id=storyline_id,
                city_en="",
                country_iso3="",
                country_en="",
                category="",
                lat=0,
                lon=0,
                package_count=0,
                importance_peak=0,
                dominant_sentiment=0,
                is_breaking=False,
                has_media=False,
                first_at=None,
                last_at=None,
            ),
            packages=[],
        )

    packages = []
    for pid in sl.package_ids or []:
        pkg = await get_package_by_id(session, pid)
        if pkg:
            packages.append(pkg)

    return StorylineDetailResponse(
        storyline=StorylineResponse(
            id=sl.id,
            city_en=sl.city_en or "",
            country_iso3=sl.country_iso3 or "",
            country_en=sl.country_en or "",
            category=sl.category or "",
            lat=sl.lat or 0.0,
            lon=sl.lon or 0.0,
            package_count=sl.package_count or 0,
            importance_peak=sl.importance_peak or 0.0,
            dominant_sentiment=sl.dominant_sentiment or 0.0,
            is_breaking=sl.is_breaking or False,
            has_media=sl.has_media or False,
            first_at=sl.first_at,
            last_at=sl.last_at,
        ),
        packages=packages,
    )


@router.get("/api/available-dates", response_model=AvailableDatesResponse)
async def available_dates(
    session: AsyncSession = Depends(get_session),
) -> AvailableDatesResponse:
    from api.schemas import AvailableDateInfo

    dates_data = await get_available_dates(session)
    items = [
        AvailableDateInfo(
            date=d["date"],
            count=d["count"],
            has_breaking=d["has_breaking"],
        )
        for d in dates_data
    ]
    return AvailableDatesResponse(dates=items)


@router.get("/api/stats")
async def get_stats(
    session: AsyncSession = Depends(get_session),
) -> dict:
    today_count = await get_today_count(session)
    return {"today_count": today_count}
