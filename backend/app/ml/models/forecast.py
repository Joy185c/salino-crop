"""
SalinO-Crop — Baseline Forecast Model (30/60/90-day EC)

STATUS: BASELINE
- Uses a physics-informed trend model based on current EC + environmental factors
- Interface matches ForecastModel ABC — LSTM/PINN can plug in without API changes

IMPORTANT: Clearly labeled BASELINE mode. Do NOT present as LSTM/PINN results.
The PINN+LSTM upgrade path is via the same ForecastModel interface.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

import numpy as np

from app.ml.interfaces.base import ForecastInputs, ForecastModel, ForecastOutput

logger = logging.getLogger(__name__)

# Risk thresholds (dS/m)
EC_RISK = {
    "low": 2.0,
    "moderate": 4.0,
    "high": 8.0,
}


def _risk(ec: float) -> str:
    if ec < EC_RISK["low"]:
        return "low"
    elif ec < EC_RISK["moderate"]:
        return "moderate"
    elif ec < EC_RISK["high"]:
        return "high"
    return "very_high"


class BaselineForecastModel(ForecastModel):
    """
    Baseline root-zone salinity forecast.

    Physics rationale (simplified):
    - Rainfall dilutes surface salinity → reduces EC over time if sustained
    - Tidal intrusion pushes salt higher → increases EC
    - Root-zone salt builds more slowly than surface; exponential lag applied
    - Uncertainty grows with forecast horizon

    This is a deterministic rule-based model, NOT a trained ML model.
    It is explicitly labeled BASELINE in all outputs.
    """

    MODEL_VERSION = "forecast_baseline_v1"

    # Empirical coefficients (calibrated against SRDI district averages)
    # These will be replaced by LSTM model weights in Phase 4
    RAINFALL_DILUTION_COEFF = -0.018    # EC reduction per mm of rain
    TIDE_AMPLIFICATION_COEFF = 0.12    # EC increase per metre of tidal height
    ROOT_ZONE_LAG = 0.7                 # Fraction of surface change reaching root zone
    SEASONAL_DECAY = 0.92              # Month-over-month dampening

    def forecast(self, inputs: ForecastInputs) -> ForecastOutput:
        if not inputs.is_valid():
            logger.warning(f"Invalid forecast inputs for plot {inputs.plot_id}")
            return self._missing_output(inputs.plot_id, "Invalid or missing EC input")

        ec0 = inputs.current_ec
        rain = inputs.rainfall_forecast_mm
        tide = inputs.tide_height_m

        # Monthly EC delta (surface level)
        delta_surface = (
            rain * self.RAINFALL_DILUTION_COEFF
            + tide * self.TIDE_AMPLIFICATION_COEFF
        )

        # Root-zone responds more slowly
        delta_root = delta_surface * self.ROOT_ZONE_LAG

        # Project forward
        ec_30d = max(0.1, ec0 + delta_root)
        ec_60d = max(0.1, ec_30d + delta_root * self.SEASONAL_DECAY)
        ec_90d = max(0.1, ec_60d + delta_root * (self.SEASONAL_DECAY ** 2))

        # Confidence degrades with horizon and with missing inputs
        base_confidence = 0.65 if inputs.groundwater_depth_m is None else 0.72
        if not inputs.historical_ec:
            base_confidence *= 0.85  # Less confident without history

        c_30d = round(base_confidence, 3)
        c_60d = round(base_confidence * 0.82, 3)
        c_90d = round(base_confidence * 0.65, 3)

        warning = None
        if base_confidence < 0.5:
            warning = "Low confidence — additional ground validation recommended."
        if not inputs.historical_ec:
            warning = (warning or "") + " No historical EC data available for this plot."

        return ForecastOutput(
            plot_id=inputs.plot_id,
            ec_30d=round(ec_30d, 3),
            ec_60d=round(ec_60d, 3),
            ec_90d=round(ec_90d, 3),
            confidence_30d=c_30d,
            confidence_60d=c_60d,
            confidence_90d=c_90d,
            risk_30d=_risk(ec_30d),
            risk_60d=_risk(ec_60d),
            risk_90d=_risk(ec_90d),
            model_version=self.MODEL_VERSION,
            model_mode="BASELINE",
            quality_flag="good" if c_30d >= 0.6 else "low_confidence",
            generated_at=datetime.now(timezone.utc),
            warning=warning,
        )

    def _missing_output(self, plot_id: str, reason: str) -> ForecastOutput:
        return ForecastOutput(
            plot_id=plot_id,
            ec_30d=0.0, ec_60d=0.0, ec_90d=0.0,
            confidence_30d=0.0, confidence_60d=0.0, confidence_90d=0.0,
            risk_30d="unknown", risk_60d="unknown", risk_90d="unknown",
            model_version=self.MODEL_VERSION,
            model_mode="BASELINE",
            quality_flag="missing",
            generated_at=datetime.now(timezone.utc),
            warning=f"DATA_UNAVAILABLE: {reason}",
        )

    def get_model_version(self) -> str:
        return self.MODEL_VERSION

    def get_model_mode(self) -> str:
        return "BASELINE"


class LSTMForecastModel(ForecastModel):
    """
    LSTM-based salinity forecast stub.

    STATUS: EXPERIMENTAL — interface implemented, model not yet trained.
    Will be populated in Phase 4 with PyTorch LSTM weights.

    Raises NotImplementedError until a trained model is loaded.
    """

    MODEL_VERSION = "forecast_lstm_v1"

    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        if model_path:
            logger.warning(
                "LSTMForecastModel: model_path provided but LSTM is not yet trained. "
                "Falling back to EXPERIMENTAL stub."
            )

    def forecast(self, inputs: ForecastInputs) -> ForecastOutput:
        raise NotImplementedError(
            "LSTM forecast model is EXPERIMENTAL and not yet trained. "
            "Use BaselineForecastModel for current predictions. "
            "This interface is reserved for Phase 4 LSTM implementation."
        )

    def get_model_version(self) -> str:
        return self.MODEL_VERSION

    def get_model_mode(self) -> str:
        return "EXPERIMENTAL"
