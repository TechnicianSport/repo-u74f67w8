from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from api.schemas import BatchIngestRequest, IngestResponse, NewsPackage
from config import settings
from realtime.broadcaster import publish_breaking, publish_package
from storage.database import get_session
from storage.queries import check_duplicate, insert_package, upsert_storyline

router = APIRouter()


async def _verify_api_key(x_api_key: str = Header(...)) -> str:
    if x_api_key != settings.INGEST_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return x_api_key


@router.post(
    "/api/ingest",
    response_model=IngestResponse,
    dependencies=[Depends(_verify_api_key)],
)
async def ingest_packages(
    payload: BatchIngestRequest,
    session: AsyncSession = Depends(get_session),
) -> IngestResponse:
    inserted = 0
    duplicates = 0

    for pkg in payload.packages:
        pkg_dict = pkg.model_dump(mode="json")

        is_dup = await check_duplicate(session, pkg_dict["id"])
        if is_dup:
            duplicates += 1
            continue

        await insert_package(session, pkg_dict, pkg_dict)
        await upsert_storyline(session, pkg_dict)
        inserted += 1

        await publish_package(pkg_dict)
        if pkg.classification.is_breaking:
            await publish_breaking(pkg_dict)

    await session.commit()

    return IngestResponse(
        received=len(payload.packages),
        inserted=inserted,
        duplicates=duplicates,
    )


@router.post(
    "/api/ingest/single",
    response_model=IngestResponse,
    dependencies=[Depends(_verify_api_key)],
)
async def ingest_single(
    pkg: NewsPackage,
    session: AsyncSession = Depends(get_session),
) -> IngestResponse:
    pkg_dict = pkg.model_dump(mode="json")

    is_dup = await check_duplicate(session, pkg_dict["id"])
    if is_dup:
        return IngestResponse(received=1, inserted=0, duplicates=1)

    await insert_package(session, pkg_dict, pkg_dict)
    await upsert_storyline(session, pkg_dict)
    await session.commit()

    await publish_package(pkg_dict)
    if pkg.classification.is_breaking:
        await publish_breaking(pkg_dict)

    return IngestResponse(received=1, inserted=1, duplicates=0)
