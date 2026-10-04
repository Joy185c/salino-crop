"""
SalinO-Crop — Database ORM Models
PostGIS-enabled PostgreSQL schema.

STATUS: REAL — these map directly to the production database schema.
"""
import enum
import uuid
from datetime import datetime, timezone


from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ─── Enumerations ────────────────────────────────────────────────────────────


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"
    UNKNOWN = "unknown"


class DataQualityFlag(str, enum.Enum):
    GOOD = "good"
    SUSPECT = "suspect"
    LOW_CONFIDENCE = "low_confidence"
    MISSING = "missing"


class UserRole(str, enum.Enum):
    FARMER = "farmer"
    EXTENSION_OFFICER = "extension_officer"
    DISTRICT_ADMIN = "district_admin"
    SYSTEM_ADMIN = "system_admin"


class ModelStatus(str, enum.Enum):
    TRAINING = "training"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    EXPERIMENTAL = "experimental"


class SeasonType(str, enum.Enum):
    AMAN = "aman"       # Jun–Nov
    BORO = "boro"       # Nov–May
    AUS = "aus"         # Mar–Aug
    RABI = "rabi"       # Oct–Mar
    YEAR_ROUND = "year_round"


class ToleranceCategory(str, enum.Enum):
    SENSITIVE = "sensitive"       # EC < 2 dS/m
    MODERATE = "moderate"         # EC 2–4 dS/m
    TOLERANT = "tolerant"         # EC 4–8 dS/m
    HIGHLY_TOLERANT = "highly_tolerant"  # EC > 8 dS/m


# ─── Geography ───────────────────────────────────────────────────────────────


class District(Base):
    __tablename__ = "districts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    name_bn: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    division: Mapped[str] = mapped_column(String(100), nullable=False)
    is_coastal: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    upazilas: Mapped[list["Upazila"]] = relationship("Upazila", back_populates="district")
    plots: Mapped[list["Plot"]] = relationship("Plot", back_populates="district")


class Upazila(Base):
    __tablename__ = "upazilas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    name_bn: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    district_id: Mapped[int] = mapped_column(ForeignKey("districts.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    district: Mapped[District] = relationship("District", back_populates="upazilas")
    plots: Mapped[list["Plot"]] = relationship("Plot", back_populates="upazila")


# ─── Users ───────────────────────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name_bn: Mapped[str | None] = mapped_column(String(500), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.EXTENSION_OFFICER, nullable=False
    )
    district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    ground_measurements: Mapped[list["GroundMeasurement"]] = relationship(
        "GroundMeasurement", back_populates="officer"
    )


# ─── Plots ───────────────────────────────────────────────────────────────────


class Plot(Base):
    """
    A plot represents a monitored agricultural parcel.
    Geometry stored as PostGIS polygon (WGS84 / EPSG:4326).
    """
    __tablename__ = "plots"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    district_id: Mapped[int] = mapped_column(ForeignKey("districts.id"), nullable=False)
    upazila_id: Mapped[int | None] = mapped_column(ForeignKey("upazilas.id"), nullable=True)
    area_ha: Mapped[float | None] = mapped_column(Float, nullable=True)
    farmer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    district: Mapped[District] = relationship("District", back_populates="plots")
    upazila: Mapped[Upazila | None] = relationship("Upazila", back_populates="plots")
    salinity_predictions: Mapped[list["SalinityPrediction"]] = relationship(
        "SalinityPrediction", back_populates="plot"
    )
    salinity_forecasts: Mapped[list["SalinityForecast"]] = relationship(
        "SalinityForecast", back_populates="plot"
    )
    recommendations: Mapped[list["Recommendation"]] = relationship(
        "Recommendation", back_populates="plot"
    )
    ground_measurements: Mapped[list["GroundMeasurement"]] = relationship(
        "GroundMeasurement", back_populates="plot"
    )
    advisories: Mapped[list["Advisory"]] = relationship(
        "Advisory", back_populates="plot"
    )


# ─── Satellite Observations ──────────────────────────────────────────────────


class SatelliteObservation(Base):
    """
    Metadata record for a processed satellite scene.
    Large raster files stored in object storage; path stored here.
    STATUS: REAL schema, MOCK data in demo mode.
    """
    __tablename__ = "satellite_observations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    satellite: Mapped[str] = mapped_column(String(50), nullable=False)  # "sentinel-2" | "sentinel-1"
    scene_id: Mapped[str] = mapped_column(String(255), nullable=False)
    acquisition_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    district_code: Mapped[str | None] = mapped_column(String(10), nullable=True)
    cloud_cover_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    raster_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)  # object storage key
    bands_available: Mapped[list | None] = mapped_column(JSON, nullable=True)
    quality_flag: Mapped[DataQualityFlag] = mapped_column(
        Enum(DataQualityFlag), default=DataQualityFlag.GOOD
    )
    processing_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


# ─── Weather & Tide ──────────────────────────────────────────────────────────


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    district_code: Mapped[str] = mapped_column(String(10), nullable=False)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    rainfall_mm: Mapped[float | None] = mapped_column(Float, nullable=True)
    temperature_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    humidity_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    raw_response: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (
        UniqueConstraint("district_code", "observed_at", "source", name="uq_weather_obs"),
    )


class TideObservation(Base):
    __tablename__ = "tide_observations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    station_id: Mapped[str] = mapped_column(String(100), nullable=False)
    district_code: Mapped[str] = mapped_column(String(10), nullable=False)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    tide_height_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_forecast: Mapped[bool] = mapped_column(Boolean, default=False)
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


# ─── Salinity Predictions ─────────────────────────────────────────────────────


class SalinityPrediction(Base):
    """
    Topsoil salinity estimate from satellite imagery.
    STATUS: BASELINE in MVP (Random Forest). Interface ready for U-Net upgrade.
    """
    __tablename__ = "salinity_predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    plot_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("plots.id"), nullable=False)
    model_version_id: Mapped[int | None] = mapped_column(
        ForeignKey("model_versions.id"), nullable=True
    )
    predicted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    satellite_obs_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("satellite_observations.id"), nullable=True
    )

    # Core outputs
    ec_ds_m: Mapped[float | None] = mapped_column(Float, nullable=True)  # dS/m
    ndsi: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)  # 0–1
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), default=RiskLevel.UNKNOWN)
    quality_flag: Mapped[DataQualityFlag] = mapped_column(
        Enum(DataQualityFlag), default=DataQualityFlag.GOOD
    )
    spectral_features: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    plot: Mapped[Plot] = relationship("Plot", back_populates="salinity_predictions")
    model_version: Mapped["ModelVersion | None"] = relationship("ModelVersion")


class SalinityForecast(Base):
    """
    30/60/90-day root-zone salinity forecast.
    STATUS: BASELINE (simple extrapolation in MVP). LSTM interface implemented.
    """
    __tablename__ = "salinity_forecasts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    plot_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("plots.id"), nullable=False)
    model_version_id: Mapped[int | None] = mapped_column(
        ForeignKey("model_versions.id"), nullable=True
    )
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Inputs used
    baseline_ec: Mapped[float | None] = mapped_column(Float, nullable=True)
    rainfall_forecast_mm: Mapped[float | None] = mapped_column(Float, nullable=True)
    tide_height_m: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Outputs
    ec_30d: Mapped[float | None] = mapped_column(Float, nullable=True)
    ec_60d: Mapped[float | None] = mapped_column(Float, nullable=True)
    ec_90d: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence_30d: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence_60d: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence_90d: Mapped[float | None] = mapped_column(Float, nullable=True)
    risk_30d: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), default=RiskLevel.UNKNOWN)
    risk_60d: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), default=RiskLevel.UNKNOWN)
    risk_90d: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), default=RiskLevel.UNKNOWN)
    quality_flag: Mapped[DataQualityFlag] = mapped_column(
        Enum(DataQualityFlag), default=DataQualityFlag.GOOD
    )
    model_mode: Mapped[str] = mapped_column(
        String(50), default="BASELINE"
    )  # BASELINE | LSTM | PINN+LSTM
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    plot: Mapped[Plot] = relationship("Plot", back_populates="salinity_forecasts")
    model_version: Mapped["ModelVersion | None"] = relationship("ModelVersion")


# ─── Crop Varieties ──────────────────────────────────────────────────────────


class CropVariety(Base):
    """
    Structured crop database. NOT generated by LLM.
    Sources: BRRI, BARI, SRDI publications.
    STATUS: REAL (seeded from data/crops/varieties.json)
    """
    __tablename__ = "crop_varieties"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    crop_name: Mapped[str] = mapped_column(String(100), nullable=False)
    crop_name_bn: Mapped[str] = mapped_column(String(200), nullable=False)
    variety: Mapped[str] = mapped_column(String(100), nullable=False)
    variety_bn: Mapped[str | None] = mapped_column(String(200), nullable=True)
    max_ec_ds_m: Mapped[float] = mapped_column(Float, nullable=False)
    tolerance_category: Mapped[ToleranceCategory] = mapped_column(Enum(ToleranceCategory))
    season: Mapped[SeasonType] = mapped_column(Enum(SeasonType))
    water_requirement: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes_bn: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_reference: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_halophyte: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    recommendations: Mapped[list["RecommendationItem"]] = relationship(
        "RecommendationItem", back_populates="crop_variety"
    )


# ─── Recommendations ─────────────────────────────────────────────────────────


class Recommendation(Base):
    """
    Crop recommendation result for a plot at a given time.
    Generated by CropRecommendationService — NOT by LLM.
    """
    __tablename__ = "recommendations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    plot_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("plots.id"), nullable=False)
    forecast_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("salinity_forecasts.id"), nullable=True
    )
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel))
    predicted_ec_30d: Mapped[float | None] = mapped_column(Float, nullable=True)
    season: Mapped[SeasonType | None] = mapped_column(Enum(SeasonType), nullable=True)
    items: Mapped[list["RecommendationItem"]] = relationship(
        "RecommendationItem", back_populates="recommendation", cascade="all, delete-orphan"
    )
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)

    plot: Mapped[Plot] = relationship("Plot", back_populates="recommendations")


class RecommendationItem(Base):
    __tablename__ = "recommendation_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    recommendation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("recommendations.id"), nullable=False
    )
    crop_variety_id: Mapped[int] = mapped_column(
        ForeignKey("crop_varieties.id"), nullable=False
    )
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)  # 0–1
    reason_codes: Mapped[list | None] = mapped_column(JSON, nullable=True)

    recommendation: Mapped[Recommendation] = relationship(
        "Recommendation", back_populates="items"
    )
    crop_variety: Mapped[CropVariety] = relationship(
        "CropVariety", back_populates="recommendations"
    )


# ─── Ground Validation ────────────────────────────────────────────────────────


class GroundMeasurement(Base):
    """
    EC measurement submitted by extension officers.
    Used for model validation and controlled calibration — not auto-retraining.
    """
    __tablename__ = "ground_measurements"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    plot_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("plots.id"), nullable=True)
    officer_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Location
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Measurement
    ec_ds_m: Mapped[float] = mapped_column(Float, nullable=False)
    soil_depth_cm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    measurement_method: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Officer notes
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    officer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    officer_id_number: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Calibration workflow
    quality_reviewed: Mapped[bool] = mapped_column(Boolean, default=False)
    approved_for_calibration: Mapped[bool] = mapped_column(Boolean, default=False)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    plot: Mapped[Plot | None] = relationship("Plot", back_populates="ground_measurements")
    officer: Mapped[User | None] = relationship("User", back_populates="ground_measurements")


# ─── Advisories ──────────────────────────────────────────────────────────────


class Advisory(Base):
    """
    Bengali advisory generated by AdvisoryService + LLM.
    The LLM only explains structured data — never invents predictions.
    """
    __tablename__ = "advisories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    plot_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("plots.id"), nullable=False)
    forecast_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("salinity_forecasts.id"), nullable=True
    )
    recommendation_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("recommendations.id"), nullable=True
    )
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Advisory content
    advisory_bn: Mapped[str | None] = mapped_column(Text, nullable=True)  # Full Bengali advisory
    sms_text_bn: Mapped[str | None] = mapped_column(Text, nullable=True)  # Short SMS
    voice_script_bn: Mapped[str | None] = mapped_column(Text, nullable=True)
    officer_summary_en: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Voice
    audio_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    audio_generated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Provenance
    llm_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    llm_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    structured_facts: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)

    plot: Mapped[Plot] = relationship("Plot", back_populates="advisories")


# ─── Model Versioning ─────────────────────────────────────────────────────────


class ModelVersion(Base):
    """
    Every trained model must be recorded here.
    Models are never silently replaced.
    """
    __tablename__ = "model_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    model_type: Mapped[str] = mapped_column(String(100), nullable=False)  # "salinity_mapper" | "forecast"
    algorithm: Mapped[str] = mapped_column(String(100), nullable=False)  # "random_forest" | "lstm" | "pinn_lstm"
    status: Mapped[ModelStatus] = mapped_column(Enum(ModelStatus), default=ModelStatus.ACTIVE)
    training_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    dataset_version: Mapped[str | None] = mapped_column(String(100), nullable=True)
    feature_version: Mapped[str | None] = mapped_column(String(100), nullable=True)
    metrics: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    artifact_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_baseline: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (
        UniqueConstraint("model_name", "version", name="uq_model_version"),
    )


# ─── Audit Log ────────────────────────────────────────────────────────────────


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    resource_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
