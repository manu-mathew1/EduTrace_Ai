"""
EduTrace AI — Multimodal Intervention Studio Router (Pod P5: Stage 6)
Serves dynamic multimodal intervention packages: Visual Mermaid Flowcharts,
Spot-the-Bug micro-drills, Real-World Analogies, and 60-Second Audio Deconstructions.
"""

import json
import logging
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from backend.db.database import get_db
from backend.schemas.contracts import MultimodalStudioContent
from ai.intervention.studio_engine import studio_engine

logger = logging.getLogger("edutrace.interventions")
router = APIRouter()
MOCKS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mocks"


class InterventionGenerateRequest(BaseModel):
    skill_id: str
    skill_name: Optional[str] = None
    error_type: Optional[str] = None
    divergence_context: Optional[str] = None


@router.get("/studio", response_model=MultimodalStudioContent)
@router.get("/{skill_id}", response_model=MultimodalStudioContent)
async def get_intervention_studio(
    skill_id: str = "skill_parts_sign_expansion",
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the complete 4-tab Multimodal Studio content for a prioritized skill.
    Uses dynamic AI studio engine with domain fallback.
    """
    # Normalize skill id
    normalized_id = "skill_parts_sign" if "parts" in skill_id and "sign" in skill_id else skill_id

    try:
        content = await studio_engine.build_studio_content(
            skill_id=normalized_id,
        )
        return content
    except Exception as e:
        logger.warning(f"Studio generation fallback: {e}")

    # Fallback to mock fixture
    mock_file = MOCKS_DIR / "mock_intervention.json"
    if mock_file.exists():
        with open(mock_file, "r") as f:
            data = json.load(f)
            return MultimodalStudioContent(**data)

    return await studio_engine.build_studio_content(skill_id="skill_parts_sign")


@router.post("/generate", response_model=MultimodalStudioContent)
async def generate_custom_intervention(
    req: InterventionGenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Dynamically generates a custom 4-tab multimodal intervention package for any topic.
    """
    return await studio_engine.build_studio_content(
        skill_id=req.skill_id,
        skill_name=req.skill_name,
        error_type=req.error_type,
        divergence_context=req.divergence_context,
    )
