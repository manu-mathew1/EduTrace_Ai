"""
EduTrace AI — Forensic Submissions & Step Divergence Router (Pod P4: Stage 3)
Analyzes student answer steps against canonical rubrics, pinpoints exact divergence leaks,
classifies errors using cognitive taxonomy, and provides Socratic chat with course citations.
"""

import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.database import get_db
from backend.db.models import SubmissionModel, CourseModel
from backend.schemas.contracts import (
    StepDivergenceResult,
    SocraticChatRequest,
    SocraticChatResponse,
    ErrorFingerprintResponse,
    ErrorFrequency,
    ErrorTaxonomy,
    StepStatus,
)
from ai.forensics.step_parser import parse_and_diff_steps, generate_deterministic_diff
from ai.forensics.divergence_detector import divergence_detector
from ai.forensics.taxonomy_classifier import taxonomy_classifier
from ai.forensics.socratic_copilot import socratic_copilot
from rag.retrieval.citation_engine import citation_retriever
from backend.api.fingerprint import get_cognitive_error_fingerprint

router = APIRouter()
MOCKS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mocks"


@router.get("/forensics", response_model=StepDivergenceResult)
async def get_forensics_diff(
    submission_id: str = Query("sub_math_9042"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the step-by-step forensic divergence analysis for a submission.
    Falls back gracefully to mock_forensic_diff.json if database has not recorded this ID yet.
    """
    # Check database first
    query = select(SubmissionModel).where(SubmissionModel.id == submission_id)
    res = await db.execute(query)
    record = res.scalars().first()

    if record:
        steps_data = json.loads(record.steps_json)
        return StepDivergenceResult(
            submission_id=record.id,
            question_id=record.question_id,
            steps=steps_data,
            first_divergence_step=record.first_divergence_step,
            primary_error_type=ErrorTaxonomy(record.primary_error_type) if record.primary_error_type else None,
            estimated_marks_obtained=record.estimated_marks_obtained,
            total_possible_marks=record.total_possible_marks,
            forensic_summary=record.forensic_summary or "Divergence localized.",
            course_citations=[
                {
                    "title": "Prof Kapoor Lecture Notes - Module 2",
                    "slide_number": 19,
                    "quote": "Pitfall Alert: When repeating integration by parts, always enclose the entire second iteration in brackets before distributing the outer minus sign.",
                }
            ],
        )

    # Fallback to mock fixture
    mock_file = MOCKS_DIR / "mock_forensic_diff.json"
    if mock_file.exists():
        with open(mock_file, "r") as f:
            return StepDivergenceResult(**json.load(f))

    # Algorithmic synthetic fallback
    return generate_deterministic_diff(
        submission_id=submission_id,
        question_id="q3_integration_by_parts",
        submitted_text="u=x^2, dv=cos(x)dx\n= x^2 sin(x) - \\int 2x sin(x) dx\n= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]\n= x^2 sin(x) + 2x cos(x) - 2sin(x)",
        rubric_steps=[
            "Identify parts u and dv correctly: u = x^2, dv = cos(x)dx",
            "Apply integration by parts formula: uv - \\int v du",
            "Perform second iteration with outer minus distributed",
            "Final simplified antiderivative with constant + C",
        ],
    )


@router.post("/diff", response_model=StepDivergenceResult)
@router.post("/analyze", response_model=StepDivergenceResult)
async def analyze_submission(
    submission_id: str = Body("sub_live_01"),
    course_id: str = Body("course_calc_301"),
    question_id: str = Body("q3_integration_by_parts"),
    submitted_work: str = Body(...),
    rubric_steps: Optional[List[str]] = Body(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Submits student work for live forensic divergence detection and cognitive error classification.
    Persists result in SQLite database.
    """
    default_rubric = [
        "Identify parts u and dv correctly: u = x^2, dv = cos(x)dx",
        "Apply integration by parts formula: uv - \\int v du",
        "Perform second iteration: u = 2x, dv = sin(x)dx => v = -cos(x). Apply uv - \\int v du with outer negative.",
        "Final simplified antiderivative with constant: x^2 sin(x) + 2x cos(x) - 2sin(x) + C",
    ]
    rubrics = rubric_steps or default_rubric

    # Ensure course exists in DB to satisfy foreign key
    course_res = await db.execute(select(CourseModel).where(CourseModel.id == course_id))
    if not course_res.scalars().first():
        db_course = CourseModel(
            id=course_id,
            title="Calculus III: Multivariable & Advanced Integration",
            current_baseline=50,
            target_exam_date="2026-10-28",
        )
        db.add(db_course)
        await db.commit()

    diff_result = await divergence_detector.detect_divergence(
        submission_id=submission_id,
        question_id=question_id,
        submitted_work=submitted_work,
        rubric_steps=rubrics,
    )

    # Attach live citations from P2 RAG Retriever for detected divergence
    if diff_result.first_divergence_step is not None:
        div_idx = diff_result.first_divergence_step
        diverged_step = next((s for s in diff_result.steps if s.step_index == div_idx), None)
        diverged_text = diverged_step.submitted_work if diverged_step else submitted_work
        expected_text = diverged_step.expected_rubric_step if diverged_step else "canonical step"
        
        citations = citation_retriever.retrieve_for_divergence(
            course_id=course_id,
            diverged_step_text=diverged_text,
            expected_step_text=expected_text,
            error_type=diff_result.primary_error_type.value if diff_result.primary_error_type else "procedural_calculation",
            limit=2,
        )
        if citations:
            diff_result.course_citations = [
                {
                    "title": c.title,
                    "slide_number": c.slide_number,
                    "page_number": c.page_number,
                    "quote": c.quote,
                    "remediation_tip": c.pedagogical_remediation_tip,
                    "matched_trap": c.matched_trap,
                }
                for c in citations
            ]
            if diverged_step:
                diverged_step.cited_source_title = citations[0].title
                diverged_step.cited_page_or_slide = citations[0].slide_number or 19

    # Persist or update submission model (idempotent upsert)
    existing_sub = await db.execute(select(SubmissionModel).where(SubmissionModel.id == submission_id))
    sub_record = existing_sub.scalars().first()
    if sub_record:
        sub_record.submitted_work = submitted_work
        sub_record.steps_json = json.dumps([s.model_dump() for s in diff_result.steps])
        sub_record.first_divergence_step = diff_result.first_divergence_step
        sub_record.primary_error_type = diff_result.primary_error_type.value if diff_result.primary_error_type else None
        sub_record.estimated_marks_obtained = diff_result.estimated_marks_obtained
        sub_record.total_possible_marks = diff_result.total_possible_marks
        sub_record.forensic_summary = diff_result.forensic_summary
    else:
        db_sub = SubmissionModel(
            id=submission_id,
            course_id=course_id,
            question_id=question_id,
            submitted_work=submitted_work,
            steps_json=json.dumps([s.model_dump() for s in diff_result.steps]),
            first_divergence_step=diff_result.first_divergence_step,
            primary_error_type=diff_result.primary_error_type.value if diff_result.primary_error_type else None,
            estimated_marks_obtained=diff_result.estimated_marks_obtained,
            total_possible_marks=diff_result.total_possible_marks,
            forensic_summary=diff_result.forensic_summary,
        )
        db.add(db_sub)
    await db.commit()

    return diff_result


@router.post("/socratic-chat", response_model=SocraticChatResponse)
async def socratic_chat(
    req: SocraticChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Socratic Co-Pilot endpoint: explains step divergences using pedagogical questioning
    and direct citations to lecture note slides retrieved from RAG Citation Engine (Task 3.3).
    """
    step_num = req.selected_step_index or 3
    query_text = (req.user_query or req.user_question or "").strip()
    if not query_text:
        query_text = f"Why did my Step {step_num} diverge?"

    # Context extraction from DB or mock fixture
    step_context = {}
    try:
        sub_res = await db.execute(select(SubmissionModel).where(SubmissionModel.id == req.submission_id))
        sub_rec = sub_res.scalars().first()
        if sub_rec and sub_rec.steps_json:
            for s in json.loads(sub_rec.steps_json):
                if s.get("step_index") == step_num:
                    step_context = {
                        "submitted_work": s.get("submitted_work", ""),
                        "expected_rubric_step": s.get("expected_rubric_step", ""),
                        "error_type": s.get("error_type", sub_rec.primary_error_type or "procedural_calculation"),
                        "divergence_reason": s.get("divergence_reason", sub_rec.forensic_summary or ""),
                    }
                    break
        elif (MOCKS_DIR / "mock_forensic_diff.json").exists():
            with open(MOCKS_DIR / "mock_forensic_diff.json") as f:
                mock_data = json.load(f)
                if mock_data.get("submission_id") == req.submission_id or req.submission_id == "sub_math_9042":
                    for s in mock_data.get("steps", []):
                        if s.get("step_index") == step_num:
                            step_context = {
                                "submitted_work": s.get("submitted_work", ""),
                                "expected_rubric_step": s.get("expected_rubric_step", ""),
                                "error_type": s.get("error_type", "procedural_calculation"),
                                "divergence_reason": s.get("divergence_reason", ""),
                            }
                            break
    except Exception as e:
        logger.warning(f"Error fetching submission context for Socratic chat: {e}")

    return await socratic_copilot.generate_response(
        submission_id=req.submission_id,
        selected_step_index=step_num,
        user_query=query_text,
        course_id="course_calc_301",
        step_context=step_context,
    )


@router.get("/fingerprint", response_model=ErrorFingerprintResponse)
async def get_error_fingerprint(
    course_id: str = Query("course_calc_301"),
    db: AsyncSession = Depends(get_db),
):
    """
    Aggregated Cognitive Error Fingerprint breakdown across past submissions from SQLite.
    """
    return await get_cognitive_error_fingerprint(course_id=course_id, db=db)
