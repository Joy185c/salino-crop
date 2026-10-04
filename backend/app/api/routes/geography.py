"""
SalinO-Crop — Districts & Upazilas Routes

GET /api/districts
GET /api/districts/{code}
GET /api/districts/{code}/upazilas
GET /api/upazilas
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import District, Upazila
from app.schemas.schemas import DistrictOut, UpazilaOut

router = APIRouter(prefix="/api", tags=["geography"])


@router.get("/districts", response_model=list[DistrictOut])
async def list_districts(
    coastal_only: bool = False,
    db: AsyncSession = Depends(get_db),
) -> list[DistrictOut]:
    stmt = select(District)
    if coastal_only:
        stmt = stmt.where(District.is_coastal == True)
    stmt = stmt.order_by(District.name)
    result = await db.execute(stmt)
    districts = result.scalars().all()
    return [DistrictOut.model_validate(d) for d in districts]


@router.get("/districts/{code}", response_model=DistrictOut)
async def get_district(code: str, db: AsyncSession = Depends(get_db)) -> DistrictOut:
    result = await db.execute(select(District).where(District.code == code))
    district = result.scalar_one_or_none()
    if not district:
        raise HTTPException(status_code=404, detail=f"District '{code}' not found")
    return DistrictOut.model_validate(district)


@router.get("/districts/{code}/upazilas", response_model=list[UpazilaOut])
async def list_upazilas_by_district(
    code: str, db: AsyncSession = Depends(get_db)
) -> list[UpazilaOut]:
    district_result = await db.execute(select(District).where(District.code == code))
    district = district_result.scalar_one_or_none()
    if not district:
        raise HTTPException(status_code=404, detail=f"District '{code}' not found")

    result = await db.execute(
        select(Upazila).where(Upazila.district_id == district.id).order_by(Upazila.name)
    )
    return [UpazilaOut.model_validate(u) for u in result.scalars().all()]


@router.get("/upazilas", response_model=list[UpazilaOut])
async def list_upazilas(db: AsyncSession = Depends(get_db)) -> list[UpazilaOut]:
    result = await db.execute(select(Upazila).order_by(Upazila.name))
    return [UpazilaOut.model_validate(u) for u in result.scalars().all()]
