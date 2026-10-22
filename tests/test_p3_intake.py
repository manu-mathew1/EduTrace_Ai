"""
EduTrace AI — Pod P3 (Intake & Diagnostic Probe) Unit & Integration Tests (Day 2)
Tests 3-turn intake goal triage agent, 10-minute diagnostic probe generation,
and live /api/intake/chat endpoint.
"""

import asyncio
from fastapi.testclient import TestClient
from backend.main import app
from ai.diagnostics.intake_agent import IntakeAgent
from ai.diagnostics.probe_generator import DiagnosticProbeGenerator
from backend.schemas.contracts import IntakeMessage


def test_intake_agent_triage():
    """Verify turn processing and friction topic extraction."""
    # Turn 1
    resp1 = asyncio.run(
        IntakeAgent.process_turn(
            session_id="sess_p3_test",
            course_id="course_calc_301",
            user_message="I keep losing marks when integrating by parts because of the negative sign in brackets.",
            history=[],
            target_score=80,
            baseline_score=50,
        )
    )
    assert resp1.assistant_reply is not None
    assert "Integration by Parts" in resp1.session_state.extracted_friction_topics
    assert resp1.session_state.extracted_target_score == 80


def test_diagnostic_probe_generation():
    """Verify 3-question calibrated diagnostic probe structure."""
    probe = DiagnosticProbeGenerator.generate_probe(course_id="course_calc_301")
    assert probe.total_estimated_minutes == 10
    assert len(probe.questions) == 3
    q_skills = [q.target_skill for q in probe.questions]
    assert any("Substitution" in s for s in q_skills)
    assert any("Bracket" in s or "Sign" in s or "Parts" in s for s in q_skills)


def test_live_intake_chat_endpoint():
    """Verify POST /api/intake/chat endpoint."""
    with TestClient(app) as client:
        payload = {
            "course_id": "course_calc_301",
            "session_id": "sess_live_chat_01",
            "user_message": "I want to improve my calculus score from 50% to 75%.",
            "messages_history": [],
            "target_score": 75,
            "baseline_score": 50,
        }
        res = client.post("/api/intake/chat", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "assistant_reply" in data
        assert data["session_state"]["extracted_target_score"] == 75
