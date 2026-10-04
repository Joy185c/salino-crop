"""
SalinO-Crop — Advisory Service

Orchestrates: scientific output → structured facts → LLM → Bengali advisory.
The LLM is called last and receives only structured data.
"""
from __future__ import annotations

import logging

from app.ml.interfaces.base import LLMRequest, LLMResponse
from app.services.llm_service import LLMProvider

logger = logging.getLogger(__name__)


class AdvisoryService:
    def __init__(self, llm_provider: LLMProvider):
        self.llm = llm_provider

    async def generate(
        self,
        plot_id: str,
        district_name: str,
        district_name_bn: str,
        ec_current: float | None,
        ec_30d: float | None,
        ec_60d: float | None,
        ec_90d: float | None,
        risk_level: str,
        confidence_30d: float | None,
        recommended_crops: list[dict],
        quality_flag: str,
        model_mode: str,
        farmer_name: str | None = None,
        warning: str | None = None,
    ) -> LLMResponse:
        """
        Build structured fact payload and call LLM provider.
        All numbers come from the scientific engine — none invented here.
        """
        request = LLMRequest(
            plot_id=plot_id,
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
            farmer_name=farmer_name,
            warning=warning,
        )

        logger.info(f"Generating advisory for plot {plot_id} via {self.llm.get_provider_name()}")
        return await self.llm.generate_advisory(request)
