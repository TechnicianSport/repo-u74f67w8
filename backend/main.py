import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.endpoints.ingest import router as ingest_router
from api.endpoints.packages import router as packages_router
from api.endpoints.websocket import router as ws_router
from api.schemas import HealthResponse
from config import settings
from realtime.broadcaster import get_redis, start_heartbeat_loop
from storage.database import engine
from storage.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    heartbeat_task = asyncio.create_task(start_heartbeat_loop())

    yield

    heartbeat_task.cancel()
    try:
        await heartbeat_task
    except asyncio.CancelledError:
        pass
    await engine.dispose()


app = FastAPI(
    title="Living News Map API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest_router)
app.include_router(packages_router)
app.include_router(ws_router)


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    db_status = "ok"
    redis_status = "ok"
    try:
        from storage.database import async_session

        async with async_session() as session:
            await session.execute("SELECT 1")
    except Exception:
        db_status = "error"

    try:
        redis = await get_redis()
        await redis.ping()
    except Exception:
        redis_status = "error"

    return HealthResponse(
        status="ok" if db_status == "ok" and redis_status == "ok" else "degraded",
        db=db_status,
        redis=redis_status,
        mode="live",
    )
