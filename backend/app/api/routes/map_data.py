"""
SalinO-Crop — Map Data Routes

GET /api/map/salinity      - district/plot level salinity GeoJSON
GET /api/map/forecast      - 30/60/90-day forecast map data
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.database import get_db
from app.db.models import District, Plot, SalinityPrediction

router = APIRouter(prefix="/api/map", tags=["map"])
settings = get_settings()


@router.get("/salinity")
async def get_salinity_map(
    district_code: str = Query(None, description="Filter by district code"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Returns GeoJSON FeatureCollection with salinity data per plot.
    In demo mode, returns pre-loaded sample data.
    """
    # Fetch plots with their latest salinity predictions
    plots_result = await db.execute(select(Plot).where(Plot.is_demo == settings.demo_mode))
    plots = plots_result.scalars().all()

    features = []
    for plot in plots:
        sal_result = await db.execute(
            select(SalinityPrediction)
            .where(SalinityPrediction.plot_id == plot.id)
            .order_by(SalinityPrediction.predicted_at.desc())
            .limit(1)
        )
        sal = sal_result.scalar_one_or_none()

        feature = {
            "type": "Feature",
            "properties": {
                "plot_id": str(plot.id),
                "name": plot.name,
                "ec_ds_m": sal.ec_ds_m if sal else None,
                "risk_level": sal.risk_level.value if sal else "unknown",
                "confidence": sal.confidence if sal else None,
                "is_demo": settings.demo_mode,
            },
            "geometry": None,  # Geometry populated from PostGIS in production
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "mode": "DEMO" if settings.demo_mode else "LIVE",
            "count": len(features),
        },
    }


@router.get("/forecast")
async def get_forecast_map(
    horizon_days: int = Query(30, description="Forecast horizon: 30, 60, or 90"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Returns GeoJSON with 30/60/90 day EC forecast per plot."""
    from app.db.models import SalinityForecast

    if horizon_days not in (30, 60, 90):
        horizon_days = 30

    plots_result = await db.execute(select(Plot))
    plots = plots_result.scalars().all()

    features = []
    for plot in plots:
        fc_result = await db.execute(
            select(SalinityForecast)
            .where(SalinityForecast.plot_id == plot.id)
            .order_by(SalinityForecast.generated_at.desc())
            .limit(1)
        )
        fc = fc_result.scalar_one_or_none()

        ec_key = f"ec_{horizon_days}d"
        risk_key = f"risk_{horizon_days}d"

        feature = {
            "type": "Feature",
            "properties": {
                "plot_id": str(plot.id),
                "name": plot.name,
                "forecast_ec": getattr(fc, ec_key, None) if fc else None,
                "risk_level": getattr(fc, risk_key, "unknown") if fc else "unknown",
                "horizon_days": horizon_days,
                "model_mode": fc.model_mode if fc else "DEMO",
            },
            "geometry": None,
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "horizon_days": horizon_days,
            "mode": "DEMO" if settings.demo_mode else "LIVE",
        },
    }
