"""
SalinO-Crop — Health Check Route
GET /api/health
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.database import get_db
from app.schemas.schemas import HealthOut

router = APIRouter(prefix="/api", tags=["health"])
settings = get_settings()


@router.get("/health", response_model=HealthOut)
async def health_check(db: AsyncSession = Depends(get_db)) -> HealthOut:
    """
    System health check.
    Returns database connectivity, version, and operational mode.
    """
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {e}"

    return HealthOut(
        status="ok" if db_status == "ok" else "degraded",
        version=settings.app_version,
        app_env=settings.app_env,
        demo_mode=settings.demo_mode,
        database=db_status,
        timestamp=datetime.now(timezone.utc),
        components={
            "database": db_status,
            "salinity_model": "baseline_rf_v1",
            "forecast_model": "baseline_v1",
            "llm_provider": settings.llm_provider if not settings.demo_mode else "mock",
            "voice_provider": "google_tts" if not settings.demo_mode else "mock",
            "mode": "DEMO" if settings.demo_mode else "LIVE",
        },
    )
