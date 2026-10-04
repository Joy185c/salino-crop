"""
SalinO-Crop — Voice Service (Bengali TTS)

STATUS:
  GoogleTTSProvider — REAL (requires GOOGLE_CLOUD_TTS_API_KEY or credentials)
  MockVoiceProvider — DEMO (returns placeholder URL)
"""
from __future__ import annotations

import base64
import logging
import uuid
from pathlib import Path

from app.core.config import get_settings
from app.ml.interfaces.base import TTSRequest, TTSResponse, VoiceProvider

logger = logging.getLogger(__name__)
settings = get_settings()


class GoogleTTSProvider(VoiceProvider):
    """
    Google Cloud Text-to-Speech with Bangla (bn-BD) voice.
    STATUS: REAL — requires Google Cloud credentials.
    """

    async def synthesize(self, request: TTSRequest) -> TTSResponse:
        from google.cloud import texttospeech_v1 as tts

        client = tts.TextToSpeechAsyncClient()
        synthesis_input = tts.SynthesisInput(text=request.text_bn)
        voice = tts.VoiceSelectionParams(
            language_code="bn-BD",
            name=request.voice_name,
        )
        audio_config = tts.AudioConfig(
            audio_encoding=tts.AudioEncoding.MP3,
            speaking_rate=request.speaking_rate,
        )

        response = await client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config,
        )

        # Save audio to a temp file; in production, upload to object storage
        audio_filename = f"advisory_{uuid.uuid4().hex}.mp3"
        audio_dir = Path("/tmp/salino_audio")
        audio_dir.mkdir(parents=True, exist_ok=True)
        audio_path = audio_dir / audio_filename

        with open(audio_path, "wb") as f:
            f.write(response.audio_content)

        # In production, upload to object storage and return public URL
        audio_url = f"/api/voice/audio/{audio_filename}"

        return TTSResponse(
            audio_url=audio_url,
            duration_seconds=None,
            provider="google_tts",
        )

    def get_provider_name(self) -> str:
        return "google_tts"


class MockVoiceProvider(VoiceProvider):
    """
    DEMO mode TTS — returns a placeholder URL without calling any external API.
    STATUS: DEMO
    """

    async def synthesize(self, request: TTSRequest) -> TTSResponse:
        logger.info("MockVoiceProvider: returning demo audio URL")
        return TTSResponse(
            audio_url="/api/voice/demo-advisory.mp3",
            duration_seconds=30.0,
            provider="mock",
        )

    def get_provider_name(self) -> str:
        return "mock"


def get_voice_provider() -> VoiceProvider:
    if settings.is_demo or not settings.google_cloud_tts_api_key:
        logger.info("VoiceService: using MockVoiceProvider (demo mode or no key)")
        return MockVoiceProvider()
    return GoogleTTSProvider()
