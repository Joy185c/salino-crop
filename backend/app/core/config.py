"""
SalinO-Crop Backend — Application Configuration
"""
from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────────────────────────────
    app_name: str = "SalinO-Crop API"
    app_version: str = "0.1.0"
    app_env: Literal["development", "staging", "production"] = "development"
    demo_mode: bool = True  # Safe default: uses sample data, no external APIs

    # ── Security ────────────────────────────────────────────────────────────────
    secret_key: str = "CHANGE_ME_IN_PRODUCTION_USE_RANDOM_32_BYTE_HEX"
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # ── Database ────────────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://salino:salino@localhost:5432/salinodb"

    # ── LLM ────────────────────────────────────────────────────────────────────
    llm_provider: Literal["groq", "gemini"] = "groq"
    groq_api_key: str = ""
    gemini_api_key: str = ""

    # ── Google Cloud TTS ────────────────────────────────────────────────────────
    google_cloud_tts_api_key: str = ""
    google_application_credentials: str = ""

    # ── Copernicus / Sentinel ───────────────────────────────────────────────────
    copernicus_client_id: str = ""
    copernicus_client_secret: str = ""

    # ── Weather ─────────────────────────────────────────────────────────────────
    weather_api_key: str = ""
    weather_api_provider: Literal["openweathermap", "bmd"] = "openweathermap"

    # ── Tide ────────────────────────────────────────────────────────────────────
    tide_api_key: str = ""

    # ── Redis (optional caching) ─────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"
    cache_ttl_seconds: int = 3600  # 1 hour default

    # ── Object Storage ───────────────────────────────────────────────────────────
    s3_bucket: str = ""
    s3_endpoint_url: str = ""
    s3_access_key: str = ""
    s3_secret_key: str = ""

    # ── Logging ──────────────────────────────────────────────────────────────────
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def is_demo(self) -> bool:
        return self.demo_mode


@lru_cache
def get_settings() -> Settings:
    return Settings()
