"""
SalinO-Crop — FastAPI Application Entry Point
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.routes import advisory, geography, health, map_data, plots, validation, voice, assistant
from app.core.config import get_settings
from app.core.logging import configure_logging

configure_logging()
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info(f"Starting SalinO-Crop API v{settings.app_version}")
    logger.info(f"Environment: {settings.app_env} | Demo mode: {settings.demo_mode}")
    logger.info(f"LLM provider: {settings.llm_provider}")
    yield
    logger.info("SalinO-Crop API shutting down.")


app = FastAPI(
    title="SalinO-Crop API",
    description=(
        "AI-driven root-zone salinity forecasting for coastal Bangladesh farmers. "
        "Converts satellite data into plot-level Bengali planting advice. "
        f"**Mode: {'DEMO' if settings.demo_mode else 'LIVE'}**"
    ),
    version=settings.app_version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ─── Middleware ────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

if settings.is_production:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# ─── Routes ───────────────────────────────────────────────────────────────────

app.include_router(health.router)
app.include_router(geography.router)
app.include_router(plots.router)
app.include_router(advisory.router)
app.include_router(voice.router)
app.include_router(validation.router)
app.include_router(map_data.router)
app.include_router(assistant.router)


@app.get("/")
async def root():
    return {
        "service": "SalinO-Crop API",
        "version": settings.app_version,
        "mode": "DEMO" if settings.demo_mode else "LIVE",
        "docs": "/api/docs",
        "health": "/api/health",
    }
