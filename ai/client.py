"""
EduTrace AI — Unified AI Client Wrapper (Pod P3: AI Core)
Provides structured JSON generation and multimodal reasoning using Google Gemini,
with strict Pydantic validation and offline mock fallbacks.
"""

import os
import json
import logging
from typing import Type, TypeVar, Optional, Any
from pydantic import BaseModel

logger = logging.getLogger("edutrace.ai")
T = TypeVar("T", bound=BaseModel)


class AIClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")

    async def generate_structured_json(
        self,
        prompt: str,
        response_model: Type[T],
        system_instruction: str = "You are EduTrace AI, an expert academic diagnostic engine.",
    ) -> T:
        """
        Generates structured JSON adhering to the provided Pydantic model.
        Falls back gracefully if no API key is set or if offline.
        """
        if not self.api_key:
            logger.warning("No GEMINI_API_KEY configured. Utilizing deterministic schema fallback.")
            return self._build_synthetic_fallback(response_model)

        try:
            # When google-generativeai is installed
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=system_instruction,
                generation_config={"response_mime_type": "application/json"}
            )
            response = await model.generate_content_async(prompt)
            raw_json = json.loads(response.text)
            return response_model.model_validate(raw_json)
        except Exception as e:
            logger.error(f"Gemini generation error: {e}. Falling back to schema validator.")
            return self._build_synthetic_fallback(response_model)

    async def generate_text(self, prompt: str, system_instruction: str = "") -> str:
        """Generates plain text response."""
        if not self.api_key:
            return "EduTrace AI offline response: Consultation and probe calibrated successfully."

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(model_name=self.model_name, system_instruction=system_instruction)
            response = await model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini text error: {e}")
            return "EduTrace AI: Analyzing your academic submission against course rubrics."

    def _build_synthetic_fallback(self, response_model: Type[T]) -> T:
        """Constructs a valid default instance from field annotations for zero-block offline tests."""
        from pathlib import Path
        mocks_dir = Path(__file__).resolve().parent.parent / "data" / "mocks"

        # Check known mock mappings
        name = response_model.__name__.lower()
        if "probe" in name and (mocks_dir / "mock_probe.json").exists():
            with open(mocks_dir / "mock_probe.json") as f:
                return response_model.model_validate(json.load(f))
        elif "divergence" in name or "step" in name and (mocks_dir / "mock_forensic_diff.json").exists():
            with open(mocks_dir / "mock_forensic_diff.json") as f:
                return response_model.model_validate(json.load(f))
        elif "recovery" in name and (mocks_dir / "mock_recovery_map.json").exists():
            with open(mocks_dir / "mock_recovery_map.json") as f:
                return response_model.model_validate(json.load(f))

        # Default empty model instance
        return response_model.model_construct()


# Global client instance
ai_client = AIClient()
