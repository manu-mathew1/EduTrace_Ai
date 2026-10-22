"""
EduTrace AI — Pod P3 Day 4 Test Suite (Task 4.5)
Verifies:
1. Intake conversational agent parsing of target score chips ("I'm aiming for 75+", "Need 85+").
2. Intake conversational agent parsing of timeline chips ("Have 5 days left", "in 48 hours").
3. Contextual quick-select suggestion chips returned in IntakeConsultResponse.
4. Live FastAPI /api/intake/chat endpoint processing and SQLite session synchronization.
"""

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from ai.diagnostics.intake_agent import intake_agent
from backend.schemas.contracts import IntakeMessage, DiagnosticMode


@pytest.mark.anyio
async def test_intake_agent_quick_select_chip_parsing():
    """
    Task 4.5: Verifies that quick-select suggestion chips correctly extract
    target scores and timeline days in the 3-turn triage agent.
    """
    # 1. Turn 1 with Target Score chip "I'm aiming for 75+"
    res1 = await intake_agent.process_turn(
        session_id="sess_day4_test_01",
        course_id="course_calc_301",
        user_message="I'm aiming for 75+ in my calculus exam.",
        history=[],
        target_score=50,
        baseline_score=50,
    )
    assert res1.session_state.extracted_target_score == 75
    assert res1.suggested_chips is not None
    assert any("75+" in c or "Bracket" in c for c in res1.suggested_chips)

    # 2. Turn 2 with Timeline chip "Have 5 days left" and friction point
    history_after_turn1 = res1.session_state.messages
    res2 = await intake_agent.process_turn(
        session_id="sess_day4_test_01",
        course_id="course_calc_301",
        user_message="Have 5 days left. I often lose minus signs in nested brackets during integration by parts.",
        history=history_after_turn1,
        target_score=75,
        baseline_score=50,
    )
    assert res2.session_state.extracted_timeline_days == 5
    assert any("parts" in t.lower() or "bracket" in t.lower() for t in res2.session_state.extracted_friction_topics)
    assert res2.ready_for_diagnostic is True
    assert res2.session_state.recommended_mode == DiagnosticMode.PROBE


@pytest.mark.anyio
async def test_intake_agent_timeline_variations_parsing():
    """
    Task 4.5: Tests flexible extraction of hours, days, and weeks.
    """
    # 48 hours -> 2 days
    res_hours = await intake_agent.process_turn(
        session_id="sess_day4_hours",
        course_id="course_calc_301",
        user_message="Exam in 48 hours, need 85% score!",
        history=[],
    )
    assert res_hours.session_state.extracted_timeline_days == 2
    assert res_hours.session_state.extracted_target_score == 85

    # 2 weeks -> 14 days
    res_weeks = await intake_agent.process_turn(
        session_id="sess_day4_weeks",
        course_id="course_calc_301",
        user_message="Have 2 weeks to prepare",
        history=[],
    )
    assert res_weeks.session_state.extracted_timeline_days == 14


def test_live_intake_chat_quick_chips_endpoint():
    """
    Task 4.5: Tests live FastAPI endpoint /api/intake/chat returning quick-select chips.
    """
    with TestClient(app) as client:
        payload = {
            "course_id": "course_calc_301",
            "session_id": "sess_live_chips_demo",
            "user_message": "I'm aiming for 75+",
            "messages_history": [],
            "target_score": 70,
            "baseline_score": 50,
        }
        resp = client.post("/api/intake/chat", json=payload)
        assert resp.status_code == 200, resp.text
        data = resp.json()

        assert "assistant_reply" in data
        assert data["session_state"]["extracted_target_score"] == 75
        assert "suggested_chips" in data
        assert len(data["suggested_chips"]) >= 3
        assert any("75+" in c or "Bracket" in c for c in data["suggested_chips"])
