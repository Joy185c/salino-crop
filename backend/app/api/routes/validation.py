"""
SalinO-Crop — Ground Validation Routes

POST /api/validation/measurements
GET  /api/validation/measurements
GET  /api/validation/measurements/{id}
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import GroundMeasurement
from app.schemas.schemas import GroundMeasurementCreate, GroundMeasurementOut

router = APIRouter(prefix="/api/validation", tags=["validation"])


@router.post("/measurements", response_model=GroundMeasurementOut, status_code=201)
async def submit_measurement(
    data: GroundMeasurementCreate,
    db: AsyncSession = Depends(get_db),
) -> GroundMeasurementOut:
    """
    Submit a ground-truth EC measurement from an extension officer.

    IMPORTANT: This does NOT trigger automatic model retraining.
    Data enters a controlled calibration workflow:
    - quality_reviewed = False (pending review)
    - approved_for_calibration = False (requires admin approval)
    """
    measurement = GroundMeasurement(
        plot_id=data.plot_id,
        measured_at=data.measured_at,
        latitude=data.latitude,
        longitude=data.longitude,
        ec_ds_m=data.ec_ds_m,
        soil_depth_cm=data.soil_depth_cm,
        measurement_method=data.measurement_method,
        notes=data.notes,
        officer_name=data.officer_name,
        officer_id_number=data.officer_id_number,
        quality_reviewed=False,
        approved_for_calibration=False,
    )
    db.add(measurement)
    await db.flush()
    await db.refresh(measurement)
    return GroundMeasurementOut.model_validate(measurement)


@router.get("/measurements", response_model=list[GroundMeasurementOut])
async def list_measurements(
    plot_id: Optional[uuid.UUID] = None,
    reviewed_only: bool = False,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
) -> list[GroundMeasurementOut]:
    stmt = select(GroundMeasurement)
    if plot_id:
        stmt = stmt.where(GroundMeasurement.plot_id == plot_id)
    if reviewed_only:
        stmt = stmt.where(GroundMeasurement.quality_reviewed == True)
    stmt = stmt.order_by(GroundMeasurement.submitted_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return [GroundMeasurementOut.model_validate(m) for m in result.scalars().all()]


@router.get("/measurements/{measurement_id}", response_model=GroundMeasurementOut)
async def get_measurement(
    measurement_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> GroundMeasurementOut:
    result = await db.execute(
        select(GroundMeasurement).where(GroundMeasurement.id == measurement_id)
    )
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Measurement not found")
    return GroundMeasurementOut.model_validate(m)
