"""
EduTrace AI — Reassessment & Mastery Verification Router (Pod P5: Stage 7)
Serves fresh isomorphic verification problems and triggers Bayesian Twin mastery updates.
"""

from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, Body, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.database import get_db
from backend.schemas.contracts import (
    ReassessmentQuestion,
    ReassessmentSubmission,
    ReassessmentResult,
)
from backend.services.twin_service import record_reassessment_outcome

router = APIRouter()


@router.get("/question", response_model=ReassessmentQuestion)
async def get_reassessment_question(
    skill_id: str = Query("skill_parts_sign_expansion"),
):
    """
    Returns a fresh, isomorphic problem to verify skill remediation.
    """
    return ReassessmentQuestion(
        reassessment_id="reassess_calc_01",
        skill_id=skill_id,
        question_text=r"Evaluate using Integration by Parts: \int x \cos(2x) \, dx",
        difficulty_level="comparable",
        maximum_marks=10,
        rubric_steps=[
            "Set u = x, dv = cos(2x)dx => du = dx, v = (1/2)sin(2x)",
            "Apply uv - \\int v du: (1/2)x sin(2x) - \\int (1/2)sin(2x) dx",
            "Integrate: (1/2)x sin(2x) - [-(1/4)cos(2x)] + C",
            "Final simplified form: (1/2)x sin(2x) + (1/4)cos(2x) + C",
        ],
    )


@router.post("/verify", response_model=ReassessmentResult)
async def verify_reassessment(
    submission: ReassessmentSubmission = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Evaluates the student's solution to the isomorphic question,
    calculates the Bayesian Learning Twin update, and persists the result.
    """
    # Deterministic evaluation for verification demo
    is_correct = "+" in submission.submitted_work and "cos" in submission.submitted_work
    marks_awarded = 9.0 if is_correct else 4.0

    result = await record_reassessment_outcome(
        reassessment_id=submission.reassessment_id,
        student_id="default_student",
        course_id="course_calc_301",
        skill_id="skill_parts_sign_expansion",
        skill_name="Integration by Parts: Bracket Sign Distribution",
        marks_awarded=marks_awarded,
        marks_possible=10.0,
        potential_recoverable=8.0,
        current_alpha=3.0,
        current_beta=3.0,
        db_session=db,
    )

    return result
