"""
SalinO-Crop — Baseline Salinity Mapper (Random Forest)

STATUS: BASELINE
- Uses scikit-learn Random Forest
- Trained on synthetic SRDI-calibrated data for MVP
- Interface ready for U-Net replacement without API changes

IMPORTANT: In DEMO mode, returns plausible-range values based on NDSI.
In REAL mode with actual Sentinel data, requires a trained model artifact.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import joblib
import numpy as np

from app.ml.interfaces.base import SalinityMap, SalinityMapper, SpectralFeatures

logger = logging.getLogger(__name__)

# EC thresholds for risk classification (dS/m)
EC_THRESHOLDS = {
    "low": 2.0,
    "moderate": 4.0,
    "high": 8.0,
}


def classify_risk(ec: float) -> str:
    if ec < EC_THRESHOLDS["low"]:
        return "low"
    elif ec < EC_THRESHOLDS["moderate"]:
        return "moderate"
    elif ec < EC_THRESHOLDS["high"]:
        return "high"
    return "very_high"


class RandomForestSalinityMapper(SalinityMapper):
    """
    Random Forest salinity mapper.

    If a trained model artifact exists at model_path, it is loaded.
    If not (cold start / demo), a rule-based fallback is used.

    DO NOT present fallback outputs as scientifically validated measurements.
    """

    MODEL_VERSION = "salinity_rf_v1"

    def __init__(self, model_path: Optional[Path] = None, demo_mode: bool = True):
        self.demo_mode = demo_mode
        self.model = None
        self._mode = "DEMO"

        if model_path and model_path.exists():
            try:
                self.model = joblib.load(model_path)
                self._mode = "BASELINE"
                logger.info(f"Loaded salinity RF model from {model_path}")
            except Exception as e:
                logger.warning(f"Failed to load RF model: {e}. Falling back to DEMO mode.")

        if self.model is None:
            logger.info("RandomForestSalinityMapper: running in DEMO mode (no trained model loaded)")

    def predict(self, features: SpectralFeatures, plot_id: str) -> SalinityMap:
        features.compute_indices()

        if self.model is not None:
            return self._predict_with_model(features, plot_id)
        else:
            return self._demo_predict(features, plot_id)

    def _predict_with_model(self, features: SpectralFeatures, plot_id: str) -> SalinityMap:
        """Predict using trained scikit-learn model."""
        x = features.to_feature_vector().reshape(1, -1)
        ec = float(self.model.predict(x)[0])
        # Confidence via prediction interval approximation (RF std dev of trees)
        all_preds = np.array([t.predict(x)[0] for t in self.model.estimators_])
        std = float(np.std(all_preds))
        confidence = max(0.0, 1.0 - (std / (ec + 1e-6)))

        return SalinityMap(
            plot_id=plot_id,
            ec_ds_m=round(ec, 3),
            ndsi=round(features.ndsi or 0.0, 4),
            confidence=round(min(1.0, confidence), 3),
            risk_level=classify_risk(ec),
            model_version=self.MODEL_VERSION,
            model_mode="BASELINE",
            quality_flag="good",
            predicted_at=datetime.now(timezone.utc),
            spectral_features={
                "B3": features.B3, "B4": features.B4, "B8": features.B8,
                "B11": features.B11, "B12": features.B12,
                "ndvi": features.ndvi, "ndsi": features.ndsi, "ndwi": features.ndwi,
            },
        )

    def _demo_predict(self, features: SpectralFeatures, plot_id: str) -> SalinityMap:
        """
        Rule-based salinity estimate for DEMO mode.
        Uses NDSI as primary proxy for surface salinity.
        Values are plausible but NOT scientifically validated measurements.
        """
        ndsi = features.ndsi or 0.0
        ndvi = features.ndvi or 0.0

        # Higher NDSI → higher salinity; lower NDVI → less vegetation cover (salt stress)
        # These coefficients are tuned from SRDI literature ranges for coastal Bangladesh
        base_ec = 2.5 + (ndsi * 8.0)
        vegetation_penalty = max(0.0, (0.4 - ndvi) * 3.0)
        ec = max(0.1, base_ec + vegetation_penalty)

        # Confidence is lower in demo mode
        confidence = 0.55 if features.cloud_cover_pct is None else max(
            0.2, 0.7 - (features.cloud_cover_pct / 100.0)
        )

        return SalinityMap(
            plot_id=plot_id,
            ec_ds_m=round(ec, 3),
            ndsi=round(ndsi, 4),
            confidence=round(confidence, 3),
            risk_level=classify_risk(ec),
            model_version=f"{self.MODEL_VERSION}__demo",
            model_mode="DEMO",
            quality_flag="suspect",
            predicted_at=datetime.now(timezone.utc),
            spectral_features={
                "B3": features.B3, "B4": features.B4, "B8": features.B8,
                "B11": features.B11, "B12": features.B12,
                "ndvi": ndvi, "ndsi": ndsi, "ndwi": features.ndwi,
            },
            warning="⚠ DEMO MODE: This estimate uses rule-based approximation, not a trained model.",
        )

    def get_model_version(self) -> str:
        return self.MODEL_VERSION

    def get_model_mode(self) -> str:
        return self._mode
