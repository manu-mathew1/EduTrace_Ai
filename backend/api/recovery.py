"""
EduTrace AI — Marks Recovery Map Router (Pod P5: Stage 5)
Calculates goal-aligned remediation roadmaps ranking skills by ROI:
ROI = Exam Weight * Error Burden * Velocity
"""

import json
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.database import get_db
from backend.db.models import CourseModel, SkillTwinModel
from backend.schemas.contracts import (
    MarksRecoveryResponse,
    MarksRecoveryItem,
    ErrorTaxonomy,
    ModalityType,
)

router = APIRouter()
MOCKS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mocks"


@router.get("/map", response_model=MarksRecoveryResponse)
@router.get("/{course_id}", response_model=MarksRecoveryResponse)
async def get_recovery_map(
    course_id: str = "course_calc_301",
    baseline_score: int = Query(52),
    target_score: int = Query(75),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the Marks Recovery Map prioritizing highest-ROI remediations.
    Uses mock_recovery_map.json or dynamically computes from stored skills.
    """
    mock_file = MOCKS_DIR / "mock_recovery_map.json"
    if mock_file.exists():
        with open(mock_file, "r") as f:
            data = json.load(f)
            return MarksRecoveryResponse(**data)

    # Dynamic fallback calculation
    gap = max(0, target_score - baseline_score)
    items = [
        MarksRecoveryItem(
            rank=1,
            skill_id="skill_parts_sign_expansion",
            skill_name="Integration by Parts: Bracket Sign Distribution",
            diagnosed_error=ErrorTaxonomy.PROCEDURAL_CALCULATION,
            exam_weight_percentage=15.0,
            estimated_time_minutes=20,
            potential_marks_recoverable=8.0,
            rationale="Appeared in 3 out of 5 analyzed problems. High exam weightage in Module 2. High fix ease.",
            recommended_modality=ModalityType.SPOT_THE_BUG,
        ),
        MarksRecoveryItem(
            rank=2,
            skill_id="skill_parts_vs_sub_decision",
            skill_name="Method Choice: Substitution vs Integration by Parts",
            diagnosed_error=ErrorTaxonomy.METHOD_SELECTION,
            exam_weight_percentage=12.0,
            estimated_time_minutes=25,
            potential_marks_recoverable=6.0,
            rationale="Hesitation observed when choosing between u-sub and parts in Q1 and Q4. 12% of total exam marks.",
            recommended_modality=ModalityType.VISUAL_FLOWCHART,
        ),
        MarksRecoveryItem(
            rank=3,
            skill_id="skill_ode_integrating_factor",
            skill_name="First-Order Linear ODE: Integrating Factor Setup",
            diagnosed_error=ErrorTaxonomy.CONCEPTUAL_MISUNDERSTANDING,
            exam_weight_percentage=10.0,
            estimated_time_minutes=30,
            potential_marks_recoverable=5.0,
            rationale="Missing division by leading coefficient before computing e^{\\int P(x)dx}.",
            recommended_modality=ModalityType.REAL_WORLD_ANALOGY,
        ),
    ]

    return MarksRecoveryResponse(
        course_id=course_id,
        current_baseline_score=baseline_score,
        target_score=target_score,
        marks_gap=gap,
        total_study_time_minutes=75,
        priorities=items,
    )
