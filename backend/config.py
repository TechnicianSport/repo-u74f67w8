from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://lnm_user:lnm_pass@localhost/living_news_map"
    REDIS_URL: str = "redis://localhost:6379"
    INGEST_API_KEY: str = "change-me-in-production"
    CORS_ORIGINS: str = "http://localhost:5173,https://yourdomain.com"
    MAX_ARCHIVE_DAYS: int = 7

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
