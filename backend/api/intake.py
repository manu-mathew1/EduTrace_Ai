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
from backend.db.models import IntakeSessionModel, DocumentModel
from backend.schemas.contracts import (
    DiagnosticMode,
    KnowledgeArchetype,
    IntakeMessage,
    IntakeSessionState,
    IntakeConsultResponse,
    DiagnosticProbeResponse,
    HingeQuestion,
)
from ai.diagnostics.intake_agent import intake_agent
from ai.diagnostics.probe_generator import probe_generator

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
