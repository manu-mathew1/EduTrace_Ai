"""
EduTrace AI — Socratic Forensics Chat Router (Pod P4: Stage 3, Task 3.8)
Provides interactive Socratic dialogue for localized step divergences,
grounded in professor lecture citations retrieved via P2 RAG Engine.
"""

import logging
import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.database import get_db
from backend.db.models import SubmissionModel
from backend.schemas.contracts import (
    SocraticChatRequest,
    SocraticChatResponse,
)
from ai.forensics.socratic_copilot import socratic_copilot

logger = logging.getLogger("edutrace.forensics.chat")
router = APIRouter()
MOCKS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mocks"


@router.post("", response_model=SocraticChatResponse)
@router.post("/", response_model=SocraticChatResponse)
@router.post("/chat", response_model=SocraticChatResponse)
@router.post("/socratic-chat", response_model=SocraticChatResponse)
async def socratic_chat_endpoint(
    req: SocraticChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Socratic Co-Pilot dialogue endpoint:
    Explains mathematical errors through pedagogical inquiry and grounded citations.
    """
    step_num = req.selected_step_index or 3
    user_query = (req.user_query or req.user_question or "").strip()
    if not user_query:
        user_query = f"Can you explain why my Step {step_num} diverged?"

    # Attempt to retrieve submission context from DB or mock fixture
    step_context = {}
    try:
        query = select(SubmissionModel).where(SubmissionModel.id == req.submission_id)
        res = await db.execute(query)
        record = res.scalars().first()

        if record and record.steps_json:
            steps_list = json.loads(record.steps_json)
            for s in steps_list:
                if s.get("step_index") == step_num:
                    step_context = {
                        "submitted_work": s.get("submitted_work", ""),
                        "expected_rubric_step": s.get("expected_rubric_step", ""),
                        "error_type": s.get("error_type", record.primary_error_type or "procedural_calculation"),
                        "divergence_reason": s.get("divergence_reason", record.forensic_summary or ""),
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
        logger.warning(f"Could not load submission context from DB: {e}")

    # Generate grounded Socratic response
    response = await socratic_copilot.generate_response(
        submission_id=req.submission_id,
        selected_step_index=step_num,
        user_query=user_query,
        course_id="course_calc_301",
        step_context=step_context,
    )

    return response
