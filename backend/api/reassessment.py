"""
EduTrace AI — Reassessment & Mastery Verification Router (Pod P5: Stage 7)
Serves fresh isomorphic verification problems and triggers Bayesian Twin mastery updates.
"""

from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, Body, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.database import get_db
from backend.db.models import SkillTwinModel
from backend.schemas.contracts import (
    ReassessmentQuestion,
    ReassessmentSubmission,
    ReassessmentResult,
)
from backend.services.twin_service import record_reassessment_outcome
from ai.intervention.reassessment_generator import reassessment_generator

router = APIRouter()


@router.get("/question", response_model=ReassessmentQuestion)
async def get_reassessment_question(
    skill_id: str = Query("skill_parts_sign_expansion"),
):
    """
    Returns a fresh, isomorphic problem to verify skill remediation.
    """
    return reassessment_generator.generate_question(skill_id=skill_id)


@router.post("/verify", response_model=ReassessmentResult)
async def verify_reassessment(
    submission: ReassessmentSubmission = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Evaluates the student's solution to the isomorphic question,
    calculates the Bayesian Learning Twin update, and persists the result.
    """
    student_id = submission.student_id or "std_rahul_99"
    course_id = submission.course_id or "course_calc_301"
    skill_id = submission.skill_id or "skill_parts_sign_expansion"

    # Fetch stored skill twin record to use real prior alpha & beta
    curr_alpha = 4.0
    curr_beta = 5.0
    skill_name = "Integration by Parts: Bracket Sign Distribution"

    stmt = select(SkillTwinModel).where(
        SkillTwinModel.student_id == student_id,
        SkillTwinModel.course_id == course_id,
        SkillTwinModel.skill_id == skill_id,
    )
    res = await db.execute(stmt)
    twin_record = res.scalar_one_or_none()
    if twin_record:
        curr_alpha = twin_record.alpha
        curr_beta = twin_record.beta
        skill_name = twin_record.skill_name

    # Deterministic evaluation for verification demo
    work_clean = submission.submitted_work.lower()
    is_correct = ("+" in work_clean and "cos" in work_clean) or ("(1/4)" in work_clean) or ("-(-" in work_clean)
    marks_awarded = 9.5 if is_correct else 4.0

    result = await record_reassessment_outcome(
        reassessment_id=submission.reassessment_id,
        student_id=student_id,
        course_id=course_id,
        skill_id=skill_id,
        skill_name=skill_name,
        marks_awarded=marks_awarded,
        marks_possible=10.0,
        potential_recoverable=8.0,
        current_alpha=curr_alpha,
        current_beta=curr_beta,
        db_session=db,
    )

    return result
