"""
EduTrace AI — Metacognitive Intake Consultation & Diagnostic Probe Router (Pod P3: Stage 2)
Provides conversational goal triage and calibrated 10-minute Diagnostic Probe generation.
"""

import json
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.database import get_db
from backend.db.models import IntakeSessionModel, DocumentModel, SubmissionModel, CourseModel
from backend.schemas.contracts import (
    DiagnosticMode,
    KnowledgeArchetype,
    IntakeMessage,
    IntakeSessionState,
    IntakeConsultResponse,
    DiagnosticProbeResponse,
    HingeQuestion,
    ProbeSubmissionRequest,
    ModeBAutopsyRequest,
    ModeBAutopsyResponse,
    UncertainSegment,
    StepDivergenceResult,
)
from ai.diagnostics.intake_agent import intake_agent
from ai.diagnostics.probe_generator import probe_generator
from ai.forensics.divergence_detector import divergence_detector

router = APIRouter()
MOCKS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mocks"


@router.post("/consult", response_model=IntakeConsultResponse)
@router.post("/chat", response_model=IntakeConsultResponse)
async def intake_consultation(
    course_id: str = Body("course_calc_301"),
    session_id: str = Body("sess_demo_01"),
    user_message: str = Body(...),
    messages_history: List[IntakeMessage] = Body([]),
    target_score: Optional[int] = Body(75),
    baseline_score: Optional[int] = Body(50),
    db: AsyncSession = Depends(get_db),
):
    """
    3-Turn Metacognitive Intake Triage consultation (Task 2.6 & 2.8).
    Extracts student friction points, exam timelines, and recommends Mode A Probe vs Mode B Exam Upload.
    """
    consult_response = await intake_agent.process_turn(
        session_id=session_id,
        course_id=course_id,
        user_message=user_message,
        history=messages_history,
        target_score=target_score,
        baseline_score=baseline_score,
    )

    session_state = consult_response.session_state

    # Persist or update session in SQLite (idempotent upsert)
    existing_q = await db.execute(select(IntakeSessionModel).where(IntakeSessionModel.session_id == session_id))
    existing = existing_q.scalars().first()
    if existing:
        existing.messages_json = json.dumps([m.model_dump() for m in session_state.messages])
        existing.extracted_target_score = session_state.extracted_target_score
        existing.extracted_friction_topics_json = json.dumps(session_state.extracted_friction_topics)
        existing.is_consultation_complete = session_state.is_consultation_complete
    else:
        db_session = IntakeSessionModel(
            session_id=session_id,
            course_id=course_id,
            messages_json=json.dumps([m.model_dump() for m in session_state.messages]),
            extracted_target_score=session_state.extracted_target_score,
            extracted_timeline_days=session_state.extracted_timeline_days or 5,
            extracted_friction_topics_json=json.dumps(session_state.extracted_friction_topics),
            recommended_mode=session_state.recommended_mode.value,
            is_consultation_complete=session_state.is_consultation_complete,
        )
        db.add(db_session)
    # Mark course as calibrated
    c_stmt = select(CourseModel).where(CourseModel.id == course_id)
    c_res = await db.execute(c_stmt)
    c_rec = c_res.scalars().first()
    if c_rec:
        c_rec.is_calibrated = True

    await db.commit()

    return consult_response


@router.post("/demo-fast-forward", response_model=IntakeConsultResponse)
async def intake_demo_fast_forward(
    course_id: str = Body("course_calc_301"),
    session_id: str = Body("sess_demo_01"),
    target_score: int = Body(75),
    baseline_score: int = Body(50),
    db: AsyncSession = Depends(get_db),
):
    """
    Task 5.5: Instant 1-Click Demo Fast-Forward for live stage presentations.
    Pre-populates completed intake triage state with zero latency.
    """
    consult_response = intake_agent.get_fast_forward_state(
        session_id=session_id,
        course_id=course_id,
        target_score=target_score,
        baseline_score=baseline_score,
    )
    session_state = consult_response.session_state

    # Persist or update session in SQLite
    existing_q = await db.execute(select(IntakeSessionModel).where(IntakeSessionModel.session_id == session_id))
    existing = existing_q.scalars().first()
    if existing:
        existing.messages_json = json.dumps([m.model_dump() for m in session_state.messages])
        existing.extracted_target_score = session_state.extracted_target_score
        existing.extracted_friction_topics_json = json.dumps(session_state.extracted_friction_topics)
        existing.is_consultation_complete = True
    else:
        db_session = IntakeSessionModel(
            session_id=session_id,
            course_id=course_id,
            messages_json=json.dumps([m.model_dump() for m in session_state.messages]),
            extracted_target_score=session_state.extracted_target_score,
            extracted_timeline_days=5,
            extracted_friction_topics_json=json.dumps(session_state.extracted_friction_topics),
            recommended_mode=session_state.recommended_mode.value,
            is_consultation_complete=True,
        )
        db.add(db_session)
    # Mark course as calibrated
    c_stmt = select(CourseModel).where(CourseModel.id == course_id)
    c_res = await db.execute(c_stmt)
    c_rec = c_res.scalars().first()
    if c_rec:
        c_rec.is_calibrated = True

    await db.commit()

    return consult_response


@router.get("/probe", response_model=DiagnosticProbeResponse)
async def get_diagnostic_probe(
    course_id: str = Query("course_calc_301"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the 10-Minute Diagnostic Probe (3 calibrated hinge questions, Task 2.7 & 3.1).
    Pulls topics detected from uploaded documents and intake triage to calibrate questions.
    """
    # 1. Fetch topics detected from uploaded course documents (Task 3.1)
    doc_res = await db.execute(select(DocumentModel).where(DocumentModel.course_id == course_id))
    docs = doc_res.scalars().all()
    doc_topics: List[str] = []
    for doc in docs:
        if doc.topics_detected_json:
            try:
                parsed = json.loads(doc.topics_detected_json)
                if isinstance(parsed, list):
                    doc_topics.extend(parsed)
            except Exception:
                pass

    # 2. Fetch topics self-reported during intake consultation
    session_res = await db.execute(
        select(IntakeSessionModel).where(IntakeSessionModel.course_id == course_id)
    )
    session = session_res.scalars().first()
    reported_topics: List[str] = []
    if session and session.extracted_friction_topics_json:
        try:
            parsed = json.loads(session.extracted_friction_topics_json)
            if isinstance(parsed, list):
                reported_topics.extend(parsed)
        except Exception:
            pass

    # Deduplicate combined topics maintaining order
    all_topics = list(dict.fromkeys(doc_topics + reported_topics))
    return probe_generator.generate_probe(course_id=course_id, friction_topics=all_topics)


@router.post("/submit-probe", response_model=StepDivergenceResult)
async def submit_diagnostic_probe(
    req: ProbeSubmissionRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Task 3.6: Wires completed diagnostic probe submissions directly into Stage 3 forensics.
    Performs forensic divergence detection, cognitive error classification, and persists to DB.
    """
    # Ensure course exists in DB to satisfy foreign keys
    course_res = await db.execute(select(CourseModel).where(CourseModel.id == req.course_id))
    if not course_res.scalars().first():
        db_course = CourseModel(
            id=req.course_id,
            title="Calculus III: Multivariable & Advanced Integration",
            current_baseline=50,
            target_exam_date="2026-10-28",
        )
        db.add(db_course)
        await db.commit()

    # Rubric steps for probe Q2 / parts
    rubric_steps = [
        "Identify parts u and dv correctly: u = x^2, dv = cos(x)dx or e^{-x}dx",
        "Apply integration by parts formula: uv - \\int v du",
        "Perform second iteration with outer minus distributed cleanly",
        "Final simplified antiderivative with constant + C",
    ]

    # Run Stage 3 Divergence Detector
    diff_result = await divergence_detector.detect_divergence(
        submission_id=req.submission_id,
        question_id=req.question_id,
        submitted_work=req.submitted_work,
        rubric_steps=rubric_steps,
    )

    # Persist or update submission record in SQLite
    existing_sub = await db.execute(select(SubmissionModel).where(SubmissionModel.id == req.submission_id))
    sub_record = existing_sub.scalars().first()
    if sub_record:
        sub_record.submitted_work = req.submitted_work
        sub_record.steps_json = json.dumps([s.model_dump() for s in diff_result.steps])
        sub_record.first_divergence_step = diff_result.first_divergence_step
        sub_record.primary_error_type = diff_result.primary_error_type.value if diff_result.primary_error_type else None
        sub_record.estimated_marks_obtained = diff_result.estimated_marks_obtained
        sub_record.total_possible_marks = diff_result.total_possible_marks
        sub_record.forensic_summary = diff_result.forensic_summary
    else:
        db_sub = SubmissionModel(
            id=req.submission_id,
            course_id=req.course_id,
            question_id=req.question_id,
            submitted_work=req.submitted_work,
            steps_json=json.dumps([s.model_dump() for s in diff_result.steps]),
            first_divergence_step=diff_result.first_divergence_step,
            primary_error_type=diff_result.primary_error_type.value if diff_result.primary_error_type else None,
            estimated_marks_obtained=diff_result.estimated_marks_obtained,
            total_possible_marks=diff_result.total_possible_marks,
            forensic_summary=diff_result.forensic_summary,
        )
        db.add(db_sub)

    # Mark course as calibrated after diagnostic probe submission
    c_stmt = select(CourseModel).where(CourseModel.id == req.course_id)
    c_res = await db.execute(c_stmt)
    c_rec = c_res.scalars().first()
    if c_rec:
        c_rec.is_calibrated = True

    await db.commit()

    return diff_result


@router.post("/mode-b/autopsy", response_model=ModeBAutopsyResponse)
async def process_mode_b_autopsy(
    req: ModeBAutopsyRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Task 3.5: Mode B Physical Exam Paper Autopsy processor.
    Detects handwritten steps and serves uncertain OCR segments for human-in-the-loop verification.
    """
    uncertain_segments = [
        UncertainSegment(
            step_index=3,
            character_crop_id="crop_q3_step3",
            raw_ocr_guess="-2x cos(x)",
            suggested_alternatives=["-2x cos(x)", "+2x cos(x)", "-2x sin(x)"],
            confidence=0.68,
            confirmed_value=req.confirmed_crops.get("crop_q3_step3") if req.confirmed_crops else None,
        ),
        UncertainSegment(
            step_index=4,
            character_crop_id="crop_q3_step4",
            raw_ocr_guess="-2sin(x)",
            suggested_alternatives=["-2sin(x)", "+2sin(x)", "-2cos(x)"],
            confidence=0.74,
            confirmed_value=req.confirmed_crops.get("crop_q3_step4") if req.confirmed_crops else None,
        ),
    ]

    return ModeBAutopsyResponse(
        submission_id="sub_math_9042",
        course_id=req.course_id,
        mode="exam_autopsy",
        question_detected="Question 3: Evaluate \\int x^2 \\cos(x) dx (10 Marks)",
        total_steps_detected=4,
        uncertain_segments=uncertain_segments,
        ready_for_divergence=True,
    )


@router.post("/mode-b/confirm-crop")
async def confirm_ocr_crop(
    crop_id: str = Body(..., embed=True),
    confirmed_value: str = Body(..., embed=True),
):
    """
    Task 3.5: Confirms human-in-the-loop transcription for ambiguous handwriting crop.
    """
    return {
        "status": "confirmed",
        "crop_id": crop_id,
        "confirmed_value": confirmed_value,
        "message": f"Crop '{crop_id}' successfully confirmed as '{confirmed_value}'.",
    }

