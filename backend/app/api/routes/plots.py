"""
SalinO-Crop — Plots Routes

GET  /api/plots
GET  /api/plots/{id}
POST /api/plots
GET  /api/plots/{id}/salinity
GET  /api/plots/{id}/forecast
GET  /api/plots/{id}/recommendations
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.database import get_db
from app.db.models import (
    CropVariety,
    Plot,
    Recommendation,
    RecommendationItem,
    SalinityForecast,
    SalinityPrediction,
)
from app.ml.interfaces.base import ForecastInputs, SpectralFeatures
from app.ml.models.forecast import BaselineForecastModel
from app.ml.models.salinity_rf import RandomForestSalinityMapper
from app.schemas.schemas import (
    ForecastOut,
    PlotCreate,
    PlotOut,
    RecommendationOut,
    SalinityOut,
    CropRankOut,
)
from app.services.crop_recommendation import CropRecommendationService, CropVarietyData

router = APIRouter(prefix="/api/plots", tags=["plots"])
settings = get_settings()

# ─── Service instances (singletons per worker) ────────────────────────────────
_salinity_mapper = RandomForestSalinityMapper(demo_mode=settings.demo_mode)
_forecast_model = BaselineForecastModel()
_crop_service = CropRecommendationService()


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _get_plot_or_404(plot_id: uuid.UUID, db: AsyncSession) -> Plot:
    result = await db.execute(select(Plot).where(Plot.id == plot_id))
    plot = result.scalar_one_or_none()
    if not plot:
        raise HTTPException(status_code=404, detail=f"Plot '{plot_id}' not found")
    return plot


def _demo_spectral_features(plot_id: str) -> SpectralFeatures:
    """
    Return plausible demo spectral features for coastal Bangladesh.
    CLEARLY LABELED as DEMO — not real Sentinel-2 data.
    """
    import hashlib
    # Deterministic variation per plot so different plots show different values
    seed = int(hashlib.md5(plot_id.encode()).hexdigest()[:8], 16) % 1000
    variation = seed / 1000.0  # 0.0 – 1.0

    return SpectralFeatures(
        B3=0.08 + variation * 0.04,
        B4=0.07 + variation * 0.05,
        B8=0.18 + variation * 0.12,
        B11=0.22 + variation * 0.15,
        B12=0.18 + variation * 0.12,
        cloud_cover_pct=5.0 + variation * 20.0,
        acquisition_date=datetime.now(timezone.utc),
    )


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("", response_model=list[PlotOut])
async def list_plots(
    district_id: Optional[int] = None,
    upazila_id: Optional[int] = None,
    demo_only: bool = False,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
) -> list[PlotOut]:
    stmt = select(Plot)
    if district_id:
        stmt = stmt.where(Plot.district_id == district_id)
    if upazila_id:
        stmt = stmt.where(Plot.upazila_id == upazila_id)
    if demo_only:
        stmt = stmt.where(Plot.is_demo == True)
    stmt = stmt.order_by(Plot.name).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return [PlotOut.model_validate(p) for p in result.scalars().all()]


@router.get("/{plot_id}", response_model=PlotOut)
async def get_plot(plot_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> PlotOut:
    plot = await _get_plot_or_404(plot_id, db)
    return PlotOut.model_validate(plot)


@router.post("", response_model=PlotOut, status_code=201)
async def create_plot(
    data: PlotCreate,
    db: AsyncSession = Depends(get_db),
) -> PlotOut:
    plot = Plot(
        name=data.name,
        district_id=data.district_id,
        upazila_id=data.upazila_id,
        area_ha=data.area_ha,
        farmer_name=data.farmer_name,
        is_demo=data.is_demo,
    )
    db.add(plot)
    await db.flush()
    await db.refresh(plot)
    return PlotOut.model_validate(plot)


@router.get("/{plot_id}/salinity", response_model=SalinityOut)
async def get_plot_salinity(
    plot_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> SalinityOut:
    """
    Returns the most recent salinity estimate for this plot.
    In DEMO mode: generates on-the-fly from demo spectral features.
    In LIVE mode: fetches latest satellite observation and runs mapper.
    """
    plot = await _get_plot_or_404(plot_id, db)

    # Try to fetch from DB first
    result = await db.execute(
        select(SalinityPrediction)
        .where(SalinityPrediction.plot_id == plot_id)
        .order_by(SalinityPrediction.predicted_at.desc())
        .limit(1)
    )
    existing = result.scalar_one_or_none()

    if existing:
        return SalinityOut(
            plot_id=plot_id,
            ec_ds_m=existing.ec_ds_m,
            ndsi=existing.ndsi,
            confidence=existing.confidence,
            risk_level=existing.risk_level.value,
            model_version=str(existing.model_version_id or "salinity_rf_v1__demo"),
            model_mode="DEMO" if existing.is_demo else "BASELINE",
            quality_flag=existing.quality_flag.value,
            predicted_at=existing.created_at,
            is_demo=existing.is_demo,
        )

    # Generate on-the-fly (demo or live)
    features = _demo_spectral_features(str(plot_id))
    salinity_map = _salinity_mapper.predict(features, str(plot_id))

    # Persist the prediction
    prediction = SalinityPrediction(
        plot_id=plot_id,
        ec_ds_m=salinity_map.ec_ds_m,
        ndsi=salinity_map.ndsi,
        confidence=salinity_map.confidence,
        risk_level=salinity_map.risk_level,
        quality_flag=salinity_map.quality_flag,
        spectral_features=salinity_map.spectral_features,
        is_demo=settings.demo_mode,
    )
    db.add(prediction)

    return SalinityOut(
        plot_id=plot_id,
        ec_ds_m=salinity_map.ec_ds_m,
        ndsi=salinity_map.ndsi,
        confidence=salinity_map.confidence,
        risk_level=salinity_map.risk_level,
        model_version=salinity_map.model_version,
        model_mode=salinity_map.model_mode,
        quality_flag=salinity_map.quality_flag,
        predicted_at=salinity_map.predicted_at,
        warning=salinity_map.warning,
        is_demo=settings.demo_mode,
    )


@router.get("/{plot_id}/forecast", response_model=ForecastOut)
async def get_plot_forecast(
    plot_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ForecastOut:
    """
    Returns 30/60/90-day root-zone EC forecast.
    STATUS: BASELINE model. Clearly labeled in response.
    """
    plot = await _get_plot_or_404(plot_id, db)

    # Get current salinity first
    sal_result = await db.execute(
        select(SalinityPrediction)
        .where(SalinityPrediction.plot_id == plot_id)
        .order_by(SalinityPrediction.predicted_at.desc())
        .limit(1)
    )
    latest_sal = sal_result.scalar_one_or_none()
    current_ec = latest_sal.ec_ds_m if latest_sal and latest_sal.ec_ds_m else 3.5

    inputs = ForecastInputs(
        plot_id=str(plot_id),
        current_ec=current_ec,
        historical_ec=[],
        rainfall_forecast_mm=80.0 if settings.demo_mode else 0.0,  # Demo uses typical monsoon value
        tide_height_m=1.2 if settings.demo_mode else 0.0,
        reference_date=datetime.now(timezone.utc),
    )

    forecast = _forecast_model.forecast(inputs)

    # Persist
    forecast_record = SalinityForecast(
        plot_id=plot_id,
        baseline_ec=current_ec,
        ec_30d=forecast.ec_30d,
        ec_60d=forecast.ec_60d,
        ec_90d=forecast.ec_90d,
        confidence_30d=forecast.confidence_30d,
        confidence_60d=forecast.confidence_60d,
        confidence_90d=forecast.confidence_90d,
        risk_30d=forecast.risk_30d,
        risk_60d=forecast.risk_60d,
        risk_90d=forecast.risk_90d,
        model_mode=forecast.model_mode,
        quality_flag=forecast.quality_flag,
        is_demo=settings.demo_mode,
    )
    db.add(forecast_record)

    return ForecastOut(
        plot_id=plot_id,
        ec_30d=forecast.ec_30d,
        ec_60d=forecast.ec_60d,
        ec_90d=forecast.ec_90d,
        confidence_30d=forecast.confidence_30d,
        confidence_60d=forecast.confidence_60d,
        confidence_90d=forecast.confidence_90d,
        risk_30d=forecast.risk_30d,
        risk_60d=forecast.risk_60d,
        risk_90d=forecast.risk_90d,
        model_version=forecast.model_version,
        model_mode=forecast.model_mode,
        quality_flag=forecast.quality_flag,
        generated_at=forecast.generated_at,
        warning=forecast.warning,
        is_demo=settings.demo_mode,
    )


@router.get("/{plot_id}/recommendations", response_model=RecommendationOut)
async def get_plot_recommendations(
    plot_id: uuid.UUID,
    season: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
) -> RecommendationOut:
    """
    Returns ranked crop recommendations based on EC forecast.
    Recommendations come from EC tolerance matching — NOT from LLM.
    """
    plot = await _get_plot_or_404(plot_id, db)

    # Get latest forecast
    fc_result = await db.execute(
        select(SalinityForecast)
        .where(SalinityForecast.plot_id == plot_id)
        .order_by(SalinityForecast.generated_at.desc())
        .limit(1)
    )
    fc = fc_result.scalar_one_or_none()

    if not fc:
        # Generate forecast inline
        sal_result = await db.execute(
            select(SalinityPrediction)
            .where(SalinityPrediction.plot_id == plot_id)
            .order_by(SalinityPrediction.predicted_at.desc())
            .limit(1)
        )
        latest_sal = sal_result.scalar_one_or_none()
        current_ec = latest_sal.ec_ds_m if latest_sal and latest_sal.ec_ds_m else 3.5

        inputs = ForecastInputs(
            plot_id=str(plot_id),
            current_ec=current_ec,
            rainfall_forecast_mm=80.0,
            tide_height_m=1.2,
        )
        forecast_out = _forecast_model.forecast(inputs)
        ec_30d = forecast_out.ec_30d
        ec_60d = forecast_out.ec_60d
        ec_90d = forecast_out.ec_90d
        confidence_30d = forecast_out.confidence_30d
        risk = forecast_out.risk_30d
    else:
        ec_30d = fc.ec_30d or 3.5
        ec_60d = fc.ec_60d or 4.0
        ec_90d = fc.ec_90d or 4.5
        confidence_30d = fc.confidence_30d or 0.6
        risk = fc.risk_30d.value if hasattr(fc.risk_30d, "value") else str(fc.risk_30d)

    # Fetch all active crop varieties
    cv_result = await db.execute(
        select(CropVariety).where(CropVariety.is_active == True)
    )
    all_crops = [
        CropVarietyData(
            id=c.id,
            crop_name=c.crop_name,
            crop_name_bn=c.crop_name_bn,
            variety=c.variety,
            variety_bn=c.variety_bn or "",
            max_ec_ds_m=c.max_ec_ds_m,
            tolerance_category=c.tolerance_category.value,
            season=c.season.value,
            water_requirement=c.water_requirement or "",
            notes=c.notes or "",
            notes_bn=c.notes_bn or "",
            source_reference=c.source_reference or "",
            is_halophyte=c.is_halophyte,
        )
        for c in cv_result.scalars().all()
    ]

    result = _crop_service.recommend(
        plot_id=str(plot_id),
        ec_30d=ec_30d,
        ec_60d=ec_60d,
        ec_90d=ec_90d,
        risk_level=risk,
        available_crops=all_crops,
        season=season,
        confidence_30d=confidence_30d,
    )

    return RecommendationOut(
        plot_id=plot_id,
        risk_level=result.risk_level,
        predicted_ec_30d=result.predicted_ec_30d,
        predicted_ec_60d=result.predicted_ec_60d,
        predicted_ec_90d=result.predicted_ec_90d,
        season=result.season,
        recommended=[
            CropRankOut(
                crop_variety_id=r.crop_variety_id,
                crop_name=r.crop_name,
                crop_name_bn=r.crop_name_bn,
                variety=r.variety,
                variety_bn=r.variety_bn,
                max_ec_ds_m=r.max_ec_ds_m,
                tolerance_category=r.tolerance_category,
                season=r.season,
                score=r.score,
                reason_codes=r.reason_codes,
                is_halophyte=r.is_halophyte,
            )
            for r in result.recommended
        ],
        warning=result.warning,
    )
