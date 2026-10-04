"""
SalinO-Crop — Advisory Routes

POST /api/advisory/generate
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.database import get_db
from app.db.models import Advisory, District, Plot, SalinityForecast, SalinityPrediction
from app.schemas.schemas import AdvisoryOut, AdvisoryRequest
from app.services.advisory_service import AdvisoryService
from app.services.llm_service import get_llm_provider

router = APIRouter(prefix="/api/advisory", tags=["advisory"])
settings = get_settings()


@router.post("/generate", response_model=AdvisoryOut)
async def generate_advisory(
    request: AdvisoryRequest,
    db: AsyncSession = Depends(get_db),
) -> AdvisoryOut:
    """
    Generate a Bengali advisory for a plot.

    Pipeline:
    1. Fetch plot, forecast, and recommendations from DB
    2. Build structured facts (NO LLM involvement here)
    3. Call LLM with facts only
    4. Return Bengali advisory

    The LLM NEVER invents data — all numbers come from the scientific engine.
    """
    # 1. Fetch plot
    plot_result = await db.execute(select(Plot).where(Plot.id == request.plot_id))
    plot = plot_result.scalar_one_or_none()
    if not plot:
        raise HTTPException(status_code=404, detail=f"Plot '{request.plot_id}' not found")

    # 2. Fetch district
    district_result = await db.execute(
        select(District).where(District.id == plot.district_id)
    )
    district = district_result.scalar_one_or_none()
    district_name = district.name if district else "Unknown"
    district_name_bn = district.name_bn if district else "অজানা"

    # 3. Fetch latest salinity prediction
    sal_result = await db.execute(
        select(SalinityPrediction)
        .where(SalinityPrediction.plot_id == request.plot_id)
        .order_by(SalinityPrediction.predicted_at.desc())
        .limit(1)
    )
    sal = sal_result.scalar_one_or_none()
    ec_current = sal.ec_ds_m if sal else None
    quality_flag = sal.quality_flag.value if sal else "missing"
    model_mode = "DEMO" if (not sal or sal.is_demo) else "BASELINE"

    # 4. Fetch latest forecast
    fc_result = await db.execute(
        select(SalinityForecast)
        .where(SalinityForecast.plot_id == request.plot_id)
        .order_by(SalinityForecast.generated_at.desc())
        .limit(1)
    )
    fc = fc_result.scalar_one_or_none()

    ec_30d = fc.ec_30d if fc else None
    ec_60d = fc.ec_60d if fc else None
    ec_90d = fc.ec_90d if fc else None
    confidence_30d = fc.confidence_30d if fc else None
    risk_level = fc.risk_30d.value if fc and hasattr(fc.risk_30d, "value") else "unknown"

    # 5. Build crop summary (top 3)
    recommended_crops = []
    if fc:
        from app.db.models import CropVariety
        from app.ml.models.forecast import BaselineForecastModel
        from app.ml.interfaces.base import ForecastInputs
        from app.services.crop_recommendation import CropRecommendationService, CropVarietyData

        cv_result = await db.execute(select(CropVariety).where(CropVariety.is_active == True))
        all_crops_db = cv_result.scalars().all()
        all_crops = [
            CropVarietyData(
                id=c.id, crop_name=c.crop_name, crop_name_bn=c.crop_name_bn,
                variety=c.variety, variety_bn=c.variety_bn or "",
                max_ec_ds_m=c.max_ec_ds_m, tolerance_category=c.tolerance_category.value,
                season=c.season.value, water_requirement=c.water_requirement or "",
                notes=c.notes or "", notes_bn=c.notes_bn or "",
                source_reference=c.source_reference or "", is_halophyte=c.is_halophyte,
            )
            for c in all_crops_db
        ]
        service = CropRecommendationService()
        recs = service.recommend(
            plot_id=str(request.plot_id),
            ec_30d=ec_30d or 3.5,
            ec_60d=ec_60d or 4.0,
            ec_90d=ec_90d or 4.5,
            risk_level=risk_level,
            available_crops=all_crops,
            confidence_30d=confidence_30d or 0.6,
        )
        recommended_crops = [
            {
                "crop": r.crop_name,
                "crop_name_bn": r.crop_name_bn,
                "variety": r.variety,
                "max_ec_ds_m": r.max_ec_ds_m,
                "score": r.score,
                "reason_codes": r.reason_codes,
            }
            for r in recs.recommended[:3]
        ]

    warning = None
    if not sal:
        warning = "No recent satellite observation available. Advisory based on missing EC data."
    elif ec_current and ec_current > 8.0:
        warning = "Very high salinity detected. Consult extension officer before planting."

    # 6. Generate advisory via LLM
    llm = get_llm_provider()
    advisory_service = AdvisoryService(llm)
    response = await advisory_service.generate(
        plot_id=str(request.plot_id),
        district_name=district_name,
        district_name_bn=district_name_bn,
        ec_current=ec_current,
        ec_30d=ec_30d,
        ec_60d=ec_60d,
        ec_90d=ec_90d,
        risk_level=risk_level,
        confidence_30d=confidence_30d,
        recommended_crops=recommended_crops,
        quality_flag=quality_flag,
        model_mode=model_mode,
        farmer_name=plot.farmer_name,
        warning=warning,
    )

    # 7. Persist advisory
    advisory = Advisory(
        plot_id=request.plot_id,
        advisory_bn=response.advisory_bn,
        sms_text_bn=response.sms_text_bn,
        voice_script_bn=response.voice_script_bn,
        officer_summary_en=response.officer_summary_en,
        llm_provider=response.provider,
        llm_model=response.model,
        structured_facts={
            "ec_current": ec_current,
            "ec_30d": ec_30d,
            "ec_60d": ec_60d,
            "ec_90d": ec_90d,
            "risk_level": risk_level,
            "quality_flag": quality_flag,
            "model_mode": model_mode,
        },
        is_demo=settings.demo_mode,
    )
    db.add(advisory)
    await db.flush()

    return AdvisoryOut(
        plot_id=request.plot_id,
        advisory_bn=response.advisory_bn,
        sms_text_bn=response.sms_text_bn,
        voice_script_bn=response.voice_script_bn,
        officer_summary_en=response.officer_summary_en,
        audio_url=None,  # Voice generated separately via /api/voice/generate
        llm_provider=response.provider,
        llm_model=response.model,
        generated_at=datetime.now(timezone.utc),
        is_demo=settings.demo_mode,
        warning=warning,
    )
