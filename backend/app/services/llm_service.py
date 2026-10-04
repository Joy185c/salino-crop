"""
SalinO-Crop — LLM Service (provider-agnostic Bengali advisory)

STATUS:
  GroqProvider   — REAL (requires GROQ_API_KEY)
  GeminiProvider — REAL (requires GEMINI_API_KEY)
  MockProvider   — DEMO (returns placeholder Bengali text)

CRITICAL: The LLM receives ONLY structured facts computed by the scientific engine.
It must NEVER invent EC values, crop tolerances, or weather data.
All prompts include explicit anti-hallucination instructions.
"""
from __future__ import annotations

import logging
from typing import Optional

from app.core.config import get_settings
from app.ml.interfaces.base import LLMProvider, LLMRequest, LLMResponse

logger = logging.getLogger(__name__)
settings = get_settings()


ANTI_HALLUCINATION_SYSTEM_PROMPT = """
You are SalinO-Crop's Bengali advisory engine.

STRICT RULES — violation makes the system scientifically unreliable:
1. Use ONLY the structured data provided in the user message. Do not invent any numbers.
2. Do NOT invent EC values, crop tolerances, weather data, or satellite observations.
3. Do NOT claim certainty when confidence is below 0.6.
4. If quality_flag is 'missing' or 'low_confidence', clearly tell the farmer that more data is needed.
5. If model_mode is 'DEMO' or 'BASELINE', mention that this is a model estimate, not a field measurement.
6. Use simple, farmer-friendly Bangla. Avoid technical jargon.
7. All numbers (EC values, dates, crop names) must come from the data provided.

OUTPUT FORMAT (return JSON):
{
  "advisory_bn": "<Full Bengali advisory, 3-6 sentences>",
  "sms_text_bn": "<Short Bengali SMS under 160 characters>",
  "voice_script_bn": "<Voice-friendly Bengali script, natural spoken language>",
  "officer_summary_en": "<Technical English summary for extension officer>"
}
"""


def _build_user_message(req: LLMRequest) -> str:
    crops_formatted = "\n".join(
        f"  - {c.get('crop_name_bn', c.get('crop', 'Unknown'))} ({c.get('variety', '')}): "
        f"সর্বোচ্চ EC {c.get('max_ec_ds_m', '?')} dS/m, স্কোর {c.get('score', '?'):.2f}"
        for c in req.recommended_crops[:5]
    )

    confidence_note = ""
    if req.confidence_30d is not None and req.confidence_30d < 0.6:
        confidence_note = f"⚠ নিম্ন আস্থা ({req.confidence_30d:.0%}) — আরও মাঠ পরিমাপ প্রয়োজন।"

    warning_note = f"\nসতর্কতা: {req.warning}" if req.warning else ""

    return f"""
জমির তথ্য:
- অবস্থান: {req.district_name_bn} ({req.district_name})
- Plot ID: {req.plot_id}
- কৃষকের নাম: {req.farmer_name or 'অজানা'}

লবণাক্ততার পূর্বাভাস:
- বর্তমান EC: {req.ec_current or 'DATA_UNAVAILABLE'} dS/m
- ৩০ দিনের EC পূর্বাভাস: {req.ec_30d or 'DATA_UNAVAILABLE'} dS/m
- ৬০ দিনের EC পূর্বাভাস: {req.ec_60d or 'DATA_UNAVAILABLE'} dS/m
- ৯০ দিনের EC পূর্বাভাস: {req.ec_90d or 'DATA_UNAVAILABLE'} dS/m
- ঝুঁকি মাত্রা: {req.risk_level}
- মডেল মোড: {req.model_mode}
- ডেটা মান: {req.quality_flag}
{confidence_note}
{warning_note}

প্রস্তাবিত ফসল:
{crops_formatted if crops_formatted else '  কোনো উপযুক্ত ফসল পাওয়া যায়নি।'}

উপরের তথ্য ব্যবহার করে কৃষকের জন্য বাংলায় পরামর্শ তৈরি করুন।
""".strip()


# ─── Groq Provider ────────────────────────────────────────────────────────────

class GroqProvider(LLMProvider):
    """
    Groq API provider using LLaMA-3 70B.
    STATUS: REAL (requires GROQ_API_KEY)
    """
    MODEL = "llama-3.1-70b-versatile"

    def __init__(self):
        import groq
        self.client = groq.AsyncGroq(api_key=settings.groq_api_key)

    async def generate_advisory(self, request: LLMRequest) -> LLMResponse:
        import json

        user_msg = _build_user_message(request)
        response = await self.client.chat.completions.create(
            model=self.MODEL,
            messages=[
                {"role": "system", "content": ANTI_HALLUCINATION_SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content
        data = json.loads(raw)

        return LLMResponse(
            advisory_bn=data.get("advisory_bn", ""),
            sms_text_bn=data.get("sms_text_bn", ""),
            voice_script_bn=data.get("voice_script_bn", ""),
            officer_summary_en=data.get("officer_summary_en", ""),
            provider="groq",
            model=self.MODEL,
        )

    def get_provider_name(self) -> str:
        return "groq"


# ─── Gemini Provider ──────────────────────────────────────────────────────────

class GeminiProvider(LLMProvider):
    """
    Google Gemini provider.
    STATUS: REAL (requires GEMINI_API_KEY)
    """
    MODEL = "gemini-1.5-flash"

    def __init__(self):
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(
            model_name=self.MODEL,
            system_instruction=ANTI_HALLUCINATION_SYSTEM_PROMPT,
            generation_config={"response_mime_type": "application/json", "temperature": 0.3},
        )

    async def generate_advisory(self, request: LLMRequest) -> LLMResponse:
        import json

        user_msg = _build_user_message(request)
        response = await self.model.generate_content_async(user_msg)
        data = json.loads(response.text)

        return LLMResponse(
            advisory_bn=data.get("advisory_bn", ""),
            sms_text_bn=data.get("sms_text_bn", ""),
            voice_script_bn=data.get("voice_script_bn", ""),
            officer_summary_en=data.get("officer_summary_en", ""),
            provider="gemini",
            model=self.MODEL,
        )

    def get_provider_name(self) -> str:
        return "gemini"


# ─── Mock Provider (Demo Mode) ────────────────────────────────────────────────

class MockLLMProvider(LLMProvider):
    """
    DEMO mode LLM provider — returns static Bengali advisory without external API.
    STATUS: DEMO — clearly labeled, no real ML.
    """

    async def generate_advisory(self, request: LLMRequest) -> LLMResponse:
        risk_map = {
            "low": "কম",
            "moderate": "মাঝারি",
            "high": "উচ্চ",
            "very_high": "অত্যন্ত উচ্চ",
            "unknown": "অজানা",
        }
        risk_bn = risk_map.get(request.risk_level, request.risk_level)
        ec_30 = request.ec_30d or "?"
        crop_name = (
            request.recommended_crops[0].get("crop_name_bn", "লবণসহিষ্ণু জাত")
            if request.recommended_crops else "লবণসহিষ্ণু জাত"
        )

        advisory_bn = (
            f"[ডেমো পরামর্শ] আপনার জমিতে আগামী ৩০ দিনে লবণাক্ততা প্রায় {ec_30} dS/m হতে পারে। "
            f"ঝুঁকির মাত্রা: {risk_bn}। "
            f"প্রস্তাবিত ফসল: {crop_name}। "
            f"এটি একটি নমুনা পূর্বাভাস। প্রকৃত মাঠ পরিমাপের জন্য সম্প্রসারণ কর্মকর্তার সাথে যোগাযোগ করুন।"
        )

        return LLMResponse(
            advisory_bn=advisory_bn,
            sms_text_bn=f"[ডেমো] ৩০দ EC:{ec_30} dS/m ঝুঁকি:{risk_bn} ফসল:{crop_name}",
            voice_script_bn=advisory_bn,
            officer_summary_en=(
                f"[DEMO] Plot {request.plot_id}: 30d EC forecast={ec_30} dS/m, "
                f"Risk={request.risk_level}. Top crop: {crop_name}. "
                "This is mock advisory output."
            ),
            provider="mock",
            model="none",
        )

    def get_provider_name(self) -> str:
        return "mock"


# ─── Factory ──────────────────────────────────────────────────────────────────

def get_llm_provider() -> LLMProvider:
    """
    Returns the configured LLM provider.
    Falls back to MockProvider if keys are missing or demo mode is active.
    """
    if settings.is_demo:
        logger.info("LLMService: DEMO mode — using MockLLMProvider")
        return MockLLMProvider()

    provider = settings.llm_provider
    if provider == "groq":
        if not settings.groq_api_key:
            logger.warning("GROQ_API_KEY not set — falling back to MockLLMProvider")
            return MockLLMProvider()
        return GroqProvider()
    elif provider == "gemini":
        if not settings.gemini_api_key:
            logger.warning("GEMINI_API_KEY not set — falling back to MockLLMProvider")
            return MockLLMProvider()
        return GeminiProvider()
    else:
        logger.warning(f"Unknown LLM provider '{provider}' — using MockLLMProvider")
        return MockLLMProvider()
