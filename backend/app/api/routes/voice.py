"""
SalinO-Crop — Voice Routes

POST /api/voice/generate
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.ml.interfaces.base import TTSRequest
from app.schemas.schemas import VoiceOut, VoiceRequest
from app.services.voice_service import get_voice_provider

router = APIRouter(prefix="/api/voice", tags=["voice"])


@router.post("/generate", response_model=VoiceOut)
async def generate_voice(request: VoiceRequest) -> VoiceOut:
    """
    Synthesize Bengali text to speech.
    Uses Google Cloud TTS (bn-BD) in live mode, mock in demo mode.
    """
    voice_provider = get_voice_provider()
    try:
        tts_request = TTSRequest(
            text_bn=request.text_bn,
            voice_name=request.voice_name,
            speaking_rate=request.speaking_rate,
        )
        response = await voice_provider.synthesize(tts_request)
        return VoiceOut(
            audio_url=response.audio_url,
            duration_seconds=response.duration_seconds,
            provider=response.provider,
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Voice synthesis failed: {str(e)}. Check provider configuration.",
        )
