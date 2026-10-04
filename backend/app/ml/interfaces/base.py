"""
SalinO-Crop — ML Interfaces (Abstract Base Classes)

These interfaces decouple the API layer from specific ML implementations.
Replace the implementation without touching the API.

STATUS: INTERFACES = REAL (production-ready contracts)
        IMPLEMENTATIONS = see individual model files
"""
from __future__ import annotations

import abc
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

import numpy as np


# ─── Salinity Mapper Interface ────────────────────────────────────────────────


@dataclass
class SpectralFeatures:
    """Sentinel-2 spectral features for one plot."""
    B3: float    # Green (10m)
    B4: float    # Red (10m)
    B8: float    # NIR (10m)
    B11: float   # SWIR1 (20m, resampled to 10m)
    B12: float   # SWIR2 (20m, resampled to 10m)
    ndvi: Optional[float] = None   # (B8-B4)/(B8+B4)
    ndsi: Optional[float] = None   # (B11-B12)/(B11+B12)
    ndwi: Optional[float] = None   # (B3-B8)/(B3+B8)
    acquisition_date: Optional[datetime] = None
    cloud_cover_pct: Optional[float] = None
    temporal_features: dict = field(default_factory=dict)

    def compute_indices(self) -> "SpectralFeatures":
        """Compute NDVI, NDSI, NDWI from raw bands."""
        denom_ndvi = self.B8 + self.B4
        self.ndvi = (self.B8 - self.B4) / denom_ndvi if denom_ndvi != 0 else 0.0

        denom_ndsi = self.B11 + self.B12
        self.ndsi = (self.B11 - self.B12) / denom_ndsi if denom_ndsi != 0 else 0.0

        denom_ndwi = self.B3 + self.B8
        self.ndwi = (self.B3 - self.B8) / denom_ndwi if denom_ndwi != 0 else 0.0

        return self

    def to_feature_vector(self) -> np.ndarray:
        """Returns feature array in expected model input order."""
        return np.array([
            self.B3, self.B4, self.B8, self.B11, self.B12,
            self.ndvi or 0.0,
            self.ndsi or 0.0,
            self.ndwi or 0.0,
        ], dtype=np.float32)


@dataclass
class SalinityMap:
    """
    Output of SalinityMapper.predict()
    STATUS: Schema is REAL. Values are DEMO/MOCK until real training data available.
    """
    plot_id: str
    ec_ds_m: float           # Estimated topsoil EC in dS/m
    ndsi: float
    confidence: float        # 0.0 – 1.0
    risk_level: str          # low | moderate | high | very_high
    model_version: str
    model_mode: str          # REAL | DEMO | BASELINE | EXPERIMENTAL
    quality_flag: str        # good | suspect | low_confidence | missing
    predicted_at: datetime = field(default_factory=datetime.utcnow)
    spectral_features: Optional[dict] = None
    warning: Optional[str] = None


class SalinityMapper(abc.ABC):
    """
    Abstract interface for topsoil salinity mapping from spectral features.

    Implementations:
      - RandomForestSalinityMapper   [BASELINE / MVP]
      - UNetSalinityMapper           [FUTURE / EXPERIMENTAL]
    """

    @abc.abstractmethod
    def predict(self, features: SpectralFeatures, plot_id: str) -> SalinityMap:
        """
        Generate a topsoil salinity estimate for a single plot.
        Must never fabricate data — return quality_flag=missing if inputs invalid.
        """
        ...

    @abc.abstractmethod
    def get_model_version(self) -> str:
        """Return model version string e.g. 'salinity_rf_v1'"""
        ...

    @abc.abstractmethod
    def get_model_mode(self) -> str:
        """Return operational mode: REAL | DEMO | BASELINE | EXPERIMENTAL"""
        ...


# ─── Forecast Model Interface ─────────────────────────────────────────────────


@dataclass
class ForecastInputs:
    """
    All inputs required for 30/60/90-day root-zone salinity forecasting.
    """
    plot_id: str
    current_ec: float                     # Current topsoil EC (dS/m)
    historical_ec: list[float] = field(default_factory=list)  # Past readings
    rainfall_forecast_mm: float = 0.0
    tide_height_m: float = 0.0
    groundwater_depth_m: Optional[float] = None
    soil_clay_pct: Optional[float] = None
    soil_organic_pct: Optional[float] = None
    district_code: Optional[str] = None
    reference_date: Optional[datetime] = None

    def is_valid(self) -> bool:
        return self.current_ec >= 0.0


@dataclass
class ForecastOutput:
    """
    30/60/90 day root-zone EC forecast.
    STATUS: BASELINE in MVP. PINN+LSTM upgrade path via same interface.
    """
    plot_id: str
    ec_30d: float
    ec_60d: float
    ec_90d: float
    confidence_30d: float   # 0–1
    confidence_60d: float
    confidence_90d: float
    risk_30d: str
    risk_60d: str
    risk_90d: str
    model_version: str
    model_mode: str          # BASELINE | LSTM | PINN+LSTM
    quality_flag: str
    generated_at: datetime = field(default_factory=datetime.utcnow)
    warning: Optional[str] = None


class ForecastModel(abc.ABC):
    """
    Abstract interface for root-zone salinity forecasting.

    Implementations:
      - BaselineForecastModel    [MVP — BASELINE mode]
      - LSTMForecastModel        [Phase 4 interface stub — EXPERIMENTAL]
      - PINNLSTMForecastModel    [Future — EXPERIMENTAL]
    """

    @abc.abstractmethod
    def forecast(self, inputs: ForecastInputs) -> ForecastOutput:
        """
        Generate 30/60/90-day EC forecasts.
        Must label output with correct model_mode.
        Must never claim more confidence than inputs support.
        """
        ...

    @abc.abstractmethod
    def get_model_version(self) -> str:
        ...

    @abc.abstractmethod
    def get_model_mode(self) -> str:
        ...


# ─── Satellite Data Interface ─────────────────────────────────────────────────


@dataclass
class SceneRequest:
    district_code: str
    start_date: datetime
    end_date: datetime
    max_cloud_cover_pct: float = 20.0
    bands: list[str] = field(default_factory=lambda: ["B03", "B04", "B08", "B11", "B12"])


@dataclass
class SceneMetadata:
    scene_id: str
    satellite: str
    acquisition_date: datetime
    cloud_cover_pct: float
    raster_path: Optional[str]
    bands_available: list[str]
    is_demo: bool = False


class SatelliteDataProvider(abc.ABC):
    """
    Abstract interface for satellite data retrieval.

    Implementations:
      - CopernicusProvider     [REAL — requires API keys]
      - DemoSatelliteProvider  [DEMO — returns bundled sample data]
    """

    @abc.abstractmethod
    async def search_scenes(self, request: SceneRequest) -> list[SceneMetadata]:
        ...

    @abc.abstractmethod
    async def download_scene(self, scene_id: str, output_dir: str) -> str:
        """Returns local path to downloaded raster."""
        ...

    @abc.abstractmethod
    def get_provider_name(self) -> str:
        ...


# ─── LLM Provider Interface ───────────────────────────────────────────────────


@dataclass
class LLMRequest:
    """Structured facts passed to LLM. LLM must not invent any of these."""
    plot_id: str
    district_name: str
    district_name_bn: str
    ec_current: Optional[float]
    ec_30d: Optional[float]
    ec_60d: Optional[float]
    ec_90d: Optional[float]
    risk_level: str
    confidence_30d: Optional[float]
    recommended_crops: list[dict]      # [{crop, variety, score, reason_codes}]
    quality_flag: str
    model_mode: str
    warning: Optional[str] = None
    farmer_name: Optional[str] = None


@dataclass
class LLMResponse:
    advisory_bn: str           # Full Bengali advisory
    sms_text_bn: str           # Short SMS (<160 chars)
    voice_script_bn: str       # Voice-friendly script
    officer_summary_en: str    # Technical English for officers
    provider: str
    model: str


class LLMProvider(abc.ABC):
    """
    Abstract LLM provider for Bengali advisory generation.

    Implementations:
      - GroqProvider    [Groq API, llama-3-70b-8192]
      - GeminiProvider  [Google Gemini API, gemini-1.5-flash]
    """

    @abc.abstractmethod
    async def generate_advisory(self, request: LLMRequest) -> LLMResponse:
        """
        Generate Bengali advisory from structured facts only.
        The LLM must not invent salinity values, crop tolerance, or weather.
        """
        ...

    @abc.abstractmethod
    def get_provider_name(self) -> str:
        ...


# ─── Voice / TTS Interface ────────────────────────────────────────────────────


@dataclass
class TTSRequest:
    text_bn: str
    voice_name: str = "bn-BD-Standard-A"
    speaking_rate: float = 0.9


@dataclass
class TTSResponse:
    audio_url: str
    duration_seconds: Optional[float]
    provider: str


class VoiceProvider(abc.ABC):
    """
    Abstract TTS provider for Bengali voice advisory.

    Implementations:
      - GoogleTTSProvider  [REAL — requires Google Cloud credentials]
    """

    @abc.abstractmethod
    async def synthesize(self, request: TTSRequest) -> TTSResponse:
        ...

    @abc.abstractmethod
    def get_provider_name(self) -> str:
        ...
