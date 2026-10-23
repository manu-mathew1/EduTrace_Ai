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
from ai.intervention.audio_generator import audio_generator, AudioDeconstructionResponse

logger = logging.getLogger("edutrace.interventions")
router = APIRouter()
MOCKS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mocks"


class InterventionGenerateRequest(BaseModel):
    skill_id: str
    skill_name: Optional[str] = None
    error_type: Optional[str] = None
    divergence_context: Optional[str] = None
    course_id: Optional[str] = "course_calc_301"


@router.get("/studio", response_model=MultimodalStudioContent)
async def get_intervention_studio_default(
    skill_id: str = Query("skill_parts_sign_expansion", description="Skill identifier"),
    course_id: str = Query("course_calc_301", description="Course identifier"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the complete 4-tab Multimodal Studio content for default prioritized skill,
    grounded directly in lecture slide citations.
    """
    normalized_id = "skill_parts_sign" if "parts" in skill_id and "sign" in skill_id else skill_id

    try:
        content = await studio_engine.build_studio_content(
            skill_id=normalized_id,
            course_id=course_id,
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

    return await studio_engine.build_studio_content(skill_id="skill_parts_sign", course_id=course_id)


@router.get("/{skill_id}", response_model=MultimodalStudioContent)
async def get_intervention_studio_by_skill(
    skill_id: str,
    course_id: str = Query("course_calc_301", description="Course identifier"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the complete 4-tab Multimodal Studio content for a specific skill ID,
    grounded in professor lecture notes.
    """
    normalized_id = "skill_parts_sign" if "parts" in skill_id and "sign" in skill_id else skill_id

    try:
        content = await studio_engine.build_studio_content(
            skill_id=normalized_id,
            course_id=course_id,
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

    return await studio_engine.build_studio_content(skill_id="skill_parts_sign", course_id=course_id)


@router.post("/generate", response_model=MultimodalStudioContent)
async def generate_custom_intervention(
    req: InterventionGenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Dynamically generates a custom 4-tab multimodal intervention package for any topic,
    grounded in lecture note quotes.
    """
    return await studio_engine.build_studio_content(
        skill_id=req.skill_id,
        skill_name=req.skill_name,
        error_type=req.error_type,
        divergence_context=req.divergence_context,
        course_id=req.course_id or "course_calc_301",
    )


@router.post("/audio", response_model=AudioDeconstructionResponse)
async def generate_audio_deconstruction(
    req: InterventionGenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Task 4.8: Generates a 60-second audio deconstruction script with timestamps,
    Web Speech SSML, and audio waveform amplitude data for live visualization.
    """
    return await audio_generator.generate_script(
        skill_id=req.skill_id,
        skill_name=req.skill_name or req.skill_id,
        divergence_context=req.divergence_context,
        error_type=req.error_type,
    )
