"""
EduTrace AI — Course Management & Database Persistence Router (Pod P1: Task 3.2)
Provides full CRUD persistence for academic courses and handles default course seeding.
"""

from typing import List, Optional
from datetime import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from backend.db.database import get_db
from backend.db.models import CourseModel
from backend.schemas.contracts import (
    CourseCreate,
    CourseResponse,
    CourseUpdate,
    KnowledgeArchetype,
)

router = APIRouter()


async def seed_default_courses(db: AsyncSession) -> List[CourseModel]:
    """
    Seeds initial benchmark courses into SQLite database if not present.
    """
    default_courses = [
        CourseModel(
            id="course_calc_301",
            title="Calculus III: Multivariable & Advanced Integration",
            subject_archetype="procedural",
            target_score=75,
            current_baseline=50,
            target_exam_date="2026-10-28",
        ),
        CourseModel(
            id="course_cs_210",
            title="CS 210: Data Structures & Algorithms",
            subject_archetype="procedural",
            target_score=85,
            current_baseline=60,
            target_exam_date="2026-11-04",
        ),
    ]

    seeded = []
    for c in default_courses:
        existing = await db.execute(select(CourseModel).where(CourseModel.id == c.id))
        record = existing.scalars().first()
        if not record:
            db.add(c)
            seeded.append(c)
        else:
            seeded.append(record)
    await db.commit()
    return seeded


@router.get("", response_model=List[CourseResponse])
@router.get("/", response_model=List[CourseResponse])
async def list_courses(db: AsyncSession = Depends(get_db)):
    """
    Lists all academic courses stored in SQLite database.
    Ensures default benchmark courses are seeded.
    """
    await seed_default_courses(db)
    res = await db.execute(select(CourseModel).order_by(CourseModel.created_at.asc()))
    courses = res.scalars().all()

    return [
        CourseResponse(
            course_id=c.id,
            title=c.title,
            subject_archetype=KnowledgeArchetype(c.subject_archetype),
            target_score=c.target_score,
            current_baseline=c.current_baseline,
            target_exam_date=c.target_exam_date,
            created_at=c.created_at.isoformat() if hasattr(c.created_at, "isoformat") else str(c.created_at),
        )
        for c in courses
    ]


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course: CourseCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a new academic course record with persistent database storage.
    """
    slug = course.title.lower().replace(":", "").replace(" ", "_")[:24]
    course_id = f"course_{slug}_{uuid.uuid4().hex[:6]}"

    db_course = CourseModel(
        id=course_id,
        title=course.title,
        subject_archetype=course.subject_archetype.value,
        target_score=course.target_score,
        current_baseline=course.current_baseline or 50,
        target_exam_date=course.target_exam_date,
    )
    db.add(db_course)
    await db.commit()
    await db.refresh(db_course)

    return CourseResponse(
        course_id=db_course.id,
        title=db_course.title,
        subject_archetype=KnowledgeArchetype(db_course.subject_archetype),
        target_score=db_course.target_score,
        current_baseline=db_course.current_baseline,
        target_exam_date=db_course.target_exam_date,
        created_at=db_course.created_at.isoformat(),
    )


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves course details by ID.
    """
    res = await db.execute(select(CourseModel).where(CourseModel.id == course_id))
    course = res.scalars().first()
    if not course:
        # Check if requested course is a default course and seed if needed
        if course_id in ["course_calc_301", "course_cs_210"]:
            await seed_default_courses(db)
            res2 = await db.execute(select(CourseModel).where(CourseModel.id == course_id))
            course = res2.scalars().first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID '{course_id}' not found.",
        )

    return CourseResponse(
        course_id=course.id,
        title=course.title,
        subject_archetype=KnowledgeArchetype(course.subject_archetype),
        target_score=course.target_score,
        current_baseline=course.current_baseline,
        target_exam_date=course.target_exam_date,
        created_at=course.created_at.isoformat(),
    )


@router.put("/{course_id}", response_model=CourseResponse)
@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    updates: CourseUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Updates course attributes such as target_score, current_baseline, title, or exam date.
    """
    res = await db.execute(select(CourseModel).where(CourseModel.id == course_id))
    course = res.scalars().first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID '{course_id}' not found.",
        )

    if updates.title is not None:
        course.title = updates.title
    if updates.subject_archetype is not None:
        course.subject_archetype = updates.subject_archetype.value
    if updates.target_score is not None:
        course.target_score = updates.target_score
    if updates.current_baseline is not None:
        course.current_baseline = updates.current_baseline
    if updates.target_exam_date is not None:
        course.target_exam_date = updates.target_exam_date

    await db.commit()
    await db.refresh(course)

    return CourseResponse(
        course_id=course.id,
        title=course.title,
        subject_archetype=KnowledgeArchetype(course.subject_archetype),
        target_score=course.target_score,
        current_baseline=course.current_baseline,
        target_exam_date=course.target_exam_date,
        created_at=course.created_at.isoformat(),
    )


@router.delete("/{course_id}", status_code=status.HTTP_200_OK)
async def delete_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Deletes course record and cascaded entities from SQLite database.
    """
    res = await db.execute(select(CourseModel).where(CourseModel.id == course_id))
    course = res.scalars().first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID '{course_id}' not found.",
        )

    await db.delete(course)
    await db.commit()
    return {"status": "deleted", "course_id": course_id}
