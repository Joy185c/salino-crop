"""
SalinO-Crop — Pydantic API Schemas

All request/response models for the FastAPI layer.
These are separate from SQLAlchemy ORM models.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ─── Common ───────────────────────────────────────────────────────────────────

class APIResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None


class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list


# ─── Districts / Upazilas ─────────────────────────────────────────────────────

class DistrictOut(BaseModel):
    id: int
    name: str
    name_bn: str
    code: str
    division: str
    is_coastal: bool

    model_config = {"from_attributes": True}


class UpazilaOut(BaseModel):
    id: int
    name: str
    name_bn: str
    code: str
    district_id: int

    model_config = {"from_attributes": True}


# ─── Plots ────────────────────────────────────────────────────────────────────

class PlotOut(BaseModel):
    id: uuid.UUID
    name: str
    district_id: int
    upazila_id: Optional[int]
    area_ha: Optional[float]
    farmer_name: Optional[str]
    is_demo: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PlotCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    district_id: int
    upazila_id: Optional[int] = None
    area_ha: Optional[float] = Field(None, ge=0.01, le=10000)
    farmer_name: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=20.0, le=27.0)
    longitude: Optional[float] = Field(None, ge=88.0, le=93.0)
    is_demo: bool = False


# ─── Salinity ─────────────────────────────────────────────────────────────────

class SalinityOut(BaseModel):
    plot_id: uuid.UUID
    ec_ds_m: Optional[float]
    ndsi: Optional[float]
    confidence: Optional[float]
    risk_level: str
    model_version: str
    model_mode: str
    quality_flag: str
    predicted_at: datetime
    warning: Optional[str] = None
    is_demo: bool = False


class ForecastOut(BaseModel):
    plot_id: uuid.UUID
    ec_30d: Optional[float]
    ec_60d: Optional[float]
    ec_90d: Optional[float]
    confidence_30d: Optional[float]
    confidence_60d: Optional[float]
    confidence_90d: Optional[float]
    risk_30d: str
    risk_60d: str
    risk_90d: str
    model_version: str
    model_mode: str
    quality_flag: str
    generated_at: datetime
    warning: Optional[str] = None
    is_demo: bool = False


# ─── Recommendations ──────────────────────────────────────────────────────────

class CropRankOut(BaseModel):
    crop_variety_id: int
    crop_name: str
    crop_name_bn: str
    variety: str
    variety_bn: str
    max_ec_ds_m: float
    tolerance_category: str
    season: str
    score: float
    reason_codes: list[str]
    is_halophyte: bool


class RecommendationOut(BaseModel):
    plot_id: uuid.UUID
    risk_level: str
    predicted_ec_30d: Optional[float]
    predicted_ec_60d: Optional[float]
    predicted_ec_90d: Optional[float]
    season: Optional[str]
    recommended: list[CropRankOut]
    warning: Optional[str] = None


# ─── Advisory ─────────────────────────────────────────────────────────────────

class AdvisoryRequest(BaseModel):
    plot_id: uuid.UUID

    model_config = {"from_attributes": True}


class AdvisoryOut(BaseModel):
    plot_id: uuid.UUID
    advisory_bn: str
    sms_text_bn: str
    voice_script_bn: str
    officer_summary_en: str
    audio_url: Optional[str] = None
    llm_provider: str
    llm_model: str
    generated_at: datetime
    is_demo: bool = False
    warning: Optional[str] = None


# ─── Voice ────────────────────────────────────────────────────────────────────

class VoiceRequest(BaseModel):
    text_bn: str = Field(..., min_length=1, max_length=2000)
    voice_name: str = "bn-BD-Standard-A"
    speaking_rate: float = Field(0.9, ge=0.5, le=2.0)


class VoiceOut(BaseModel):
    audio_url: str
    duration_seconds: Optional[float]
    provider: str


# ─── Ground Validation ────────────────────────────────────────────────────────

class GroundMeasurementCreate(BaseModel):
    plot_id: Optional[uuid.UUID] = None
    measured_at: datetime
    latitude: float = Field(..., ge=20.0, le=27.0)
    longitude: float = Field(..., ge=88.0, le=93.0)
    ec_ds_m: float = Field(..., ge=0.0, le=100.0)
    soil_depth_cm: Optional[int] = Field(None, ge=1, le=200)
    measurement_method: Optional[str] = None
    notes: Optional[str] = None
    officer_name: Optional[str] = None
    officer_id_number: Optional[str] = None

    @field_validator("ec_ds_m")
    @classmethod
    def validate_ec(cls, v: float) -> float:
        if v > 50:
            raise ValueError("EC value above 50 dS/m is highly suspect — please verify.")
        return v


class GroundMeasurementOut(BaseModel):
    id: uuid.UUID
    plot_id: Optional[uuid.UUID]
    measured_at: datetime
    submitted_at: datetime
    latitude: float
    longitude: float
    ec_ds_m: float
    soil_depth_cm: Optional[int]
    officer_name: Optional[str]
    quality_reviewed: bool
    approved_for_calibration: bool

    model_config = {"from_attributes": True}


# ─── Health ───────────────────────────────────────────────────────────────────

class HealthOut(BaseModel):
    status: str
    version: str
    app_env: str
    demo_mode: bool
    database: str
    timestamp: datetime
    components: dict[str, str]
