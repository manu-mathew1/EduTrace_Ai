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
from backend.db.models import IntakeSessionModel
from backend.schemas.contracts import (
    DiagnosticMode,
    KnowledgeArchetype,
    IntakeMessage,
    IntakeSessionState,
    IntakeConsultResponse,
    DiagnosticProbeResponse,
    HingeQuestion,
)

router = APIRouter()
MOCKS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mocks"


@router.post("/consult", response_model=IntakeConsultResponse)
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
    3-Turn Metacognitive Intake Triage consultation.
    Extracts student friction points, exam timelines, and recommends Mode A Probe vs Mode B Exam Upload.
    """
    turn_count = len(messages_history) // 2 + 1
    msg_lower = user_message.lower()

    friction_topics = []
    if "parts" in msg_lower or "integration" in msg_lower:
        friction_topics.append("Integration by Parts: Minus Sign Distribution")
    if "differential" in msg_lower or "ode" in msg_lower:
        friction_topics.append("First-Order Linear ODEs: Integrating Factor")
    if "vector" in msg_lower or "surface" in msg_lower:
        friction_topics.append("Vector Calculus & Surface Integrals")

    if turn_count == 1:
        reply = (
            f"Welcome Rahul! I see your goal is to bridge from {baseline_score}% to {target_score}% in MATH 301 before your exam on Oct 28. "
            "When working through exam-level problems, where do you feel the biggest cognitive friction: choosing which method to apply, or algebraic errors during execution?"
        )
        is_complete = False
    elif turn_count == 2:
        reply = (
            "That makes complete sense. Many students lose marks in procedural calculus when signs distribute across nested brackets. "
            "To pinpoint your exact marks leaks without you having to re-solve an entire 3-hour exam, I have prepared a Mode A '10-Minute Diagnostic Probe' consisting of 3 calibrated hinge questions. Shall we launch the probe?"
        )
        is_complete = True
    else:
        reply = "Diagnostic probe calibrated! Launching the 3 hinge questions now."
        is_complete = True

    updated_messages = list(messages_history)
    updated_messages.append(IntakeMessage(role="user", content=user_message))
    updated_messages.append(IntakeMessage(role="assistant", content=reply))

    session_state = IntakeSessionState(
        session_id=session_id,
        course_id=course_id,
        messages=updated_messages,
        extracted_target_score=target_score,
        extracted_timeline_days=6,
        extracted_friction_topics=friction_topics or ["Integration Techniques", "Differential Equations"],
        recommended_mode=DiagnosticMode.PROBE,
        is_consultation_complete=is_complete,
    )

    # Persist session to SQLite
    db_session = IntakeSessionModel(
        session_id=session_id,
        course_id=course_id,
        messages_json=json.dumps([m.model_dump() for m in updated_messages]),
        extracted_target_score=target_score,
        extracted_timeline_days=6,
        extracted_friction_topics_json=json.dumps(session_state.extracted_friction_topics),
        recommended_mode=DiagnosticMode.PROBE.value,
        is_consultation_complete=is_complete,
    )
    db.add(db_session)
    await db.commit()

    return IntakeConsultResponse(
        assistant_reply=reply,
        session_state=session_state,
        ready_for_diagnostic=is_complete,
    )


@router.get("/probe", response_model=DiagnosticProbeResponse)
async def get_diagnostic_probe(
    course_id: str = Query("course_calc_301"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the 10-Minute Diagnostic Probe (3 calibrated hinge questions).
    """
    mock_file = MOCKS_DIR / "mock_probe.json"
    if mock_file.exists():
        with open(mock_file, "r") as f:
            return DiagnosticProbeResponse(**json.load(f))

    # Synthetic fallback
    q1 = HingeQuestion(
        question_id="probe_q1",
        question_text=r"Evaluate \int \frac{x}{1+x^2} dx \text{ vs } \int \frac{1}{1+x^2} dx",
        target_skill="Method Selection: Substitution vs Arctan Standard Form",
        cognitive_trap_tested="Impulsive u-substitution without inspecting polynomial degree",
        estimated_minutes=3,
        maximum_marks=5,
        rubric_steps=["Identify degree difference", "Apply u=1+x^2", "Identify arctan form"],
    )
    return DiagnosticProbeResponse(
        probe_id="probe_synth_01",
        course_id=course_id,
        subject_archetype=KnowledgeArchetype.PROCEDURAL,
        total_estimated_minutes=10,
        questions=[q1],
    )
