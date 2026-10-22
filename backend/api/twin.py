"""
EduTrace AI — Metacognitive Learning Twin Router (P1: Core Systems)
Provides endpoints to fetch the student's Bayesian Learning Twin profile and track mastery updates.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from backend.db.database import get_db
from backend.schemas.contracts import LearningTwinResponse
from backend.services.twin_service import get_learning_twin_data

router = APIRouter(tags=["twin (P1)"])


@router.get("/profile", response_model=LearningTwinResponse)
async def get_twin_profile_default(
    student_id: str = Query("std_rahul_99", description="Student identifier"),
    course_id: str = Query("course_calc_301", description="Course identifier"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the real-time Metacognitive Learning Twin profile for a student (query-specified or default):
    - Beta(alpha, beta) parameters for each diagnosed skill
    - Bayesian credible intervals (uncertainty ranges)
    - Multimodal cognitive affinities (visual, audio, spot-the-bug, etc.)
    - Overall academic readiness score
    """
    return await get_learning_twin_data(student_id=student_id, course_id=course_id, db_session=db)


@router.get("/{student_id}", response_model=LearningTwinResponse)
async def get_twin_profile_by_id(
    student_id: str,
    course_id: str = Query("course_calc_301", description="Course identifier"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the real-time Metacognitive Learning Twin profile for a specific student ID in path.
    """
    return await get_learning_twin_data(student_id=student_id, course_id=course_id, db_session=db)
