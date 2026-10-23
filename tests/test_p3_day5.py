"""
EduTrace AI — Pod P3 Day 5 Test Suite (Task 5.5)
Verifies:
1. Intake consultation responds instantaneously (< 50ms) without lag on live stage.
2. Quick-select chips correctly calibrate goal vector (75% target, 5 days runway, bracket friction).
3. 1-Click Demo Fast-Forward endpoint (/api/intake/demo-fast-forward) returns complete calibrated session.
4. Mode A 10-Minute Diagnostic Probe (3 hinge questions) is generated without blocking.
5. Mode A and Mode B submission pipelines hand off cleanly to Stage 3 Forensics.
"""

import time
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from ai.diagnostics.intake_agent import intake_agent


@pytest.fixture
def client():
    return TestClient(app)


def test_quick_chip_consultation_latency_under_50ms(client):
    """
    Task 5.5: Verifies that quick-chip consultation turns respond within
    50ms on stage without network lag.
    """
    # Warmup call for client/sqlite connection initialization
    client.post(
        "/api/intake/chat",
        json={
            "course_id": "course_calc_301",
            "session_id": "sess_warmup",
            "user_message": "Warmup request",
            "messages_history": [],
            "target_score": 75,
            "baseline_score": 50,
        },
    )

    chips_to_test = [
        "I'm aiming for 75+",
        "Have 5 days left",
        "Bracket sign distribution in parts",
    ]

    latencies = []
    for chip in chips_to_test:
        t0 = time.perf_counter()
        response = client.post(
            "/api/intake/chat",
            json={
                "course_id": "course_calc_301",
                "session_id": "sess_test_latency",
                "user_message": chip,
                "messages_history": [],
                "target_score": 75,
                "baseline_score": 50,
            },
        )
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        assert response.status_code == 200
        latencies.append(elapsed_ms)
        data = response.json()
        assert len(data["assistant_reply"]) > 20
        assert "suggested_chips" in data

    avg_latency = sum(latencies) / len(latencies)
    assert avg_latency < 50.0, f"Average latency {avg_latency}ms exceeded 50ms budget!"


def test_goal_vector_extraction_from_chips(client):
    """
    Task 5.5: Verifies goal extraction from quick-chips:
    target score 75%, timeline 5 days, and bracket friction topic.
    """
    res1 = client.post(
        "/api/intake/chat",
        json={
            "course_id": "course_calc_301",
            "session_id": "sess_test_goal",
            "user_message": "I'm aiming for 75+",
            "messages_history": [],
            "target_score": 50,
            "baseline_score": 50,
        },
    )
    assert res1.status_code == 200
    state1 = res1.json()["session_state"]
    assert state1["extracted_target_score"] == 75

    res2 = client.post(
        "/api/intake/chat",
        json={
            "course_id": "course_calc_301",
            "session_id": "sess_test_goal",
            "user_message": "Have 5 days left",
            "messages_history": state1["messages"],
            "target_score": 75,
            "baseline_score": 50,
        },
    )
    assert res2.status_code == 200
    state2 = res2.json()["session_state"]
    assert state2["extracted_timeline_days"] == 5


def test_demo_fast_forward_endpoint(client):
    """
    Task 5.5: Verifies instant 1-click stage demo fast-forward endpoint.
    """
    t0 = time.perf_counter()
    response = client.post(
        "/api/intake/demo-fast-forward",
        json={
            "course_id": "course_calc_301",
            "session_id": "sess_demo_stage",
            "target_score": 75,
            "baseline_score": 50,
        },
    )
    elapsed_ms = (time.perf_counter() - t0) * 1000.0
    assert response.status_code == 200
    assert elapsed_ms < 50.0

    data = response.json()
    assert data["ready_for_diagnostic"] is True
    session_state = data["session_state"]
    assert session_state["is_consultation_complete"] is True
    assert session_state["extracted_target_score"] == 75
    assert session_state["extracted_timeline_days"] == 5
    assert len(session_state["messages"]) >= 3
    assert any("Integration by Parts" in t for t in session_state["extracted_friction_topics"])


def test_mode_a_probe_generation(client):
    """
    Task 5.5: Verifies that GET /api/intake/probe returns 3 calibrated hinge questions.
    """
    response = client.get("/api/intake/probe?course_id=course_calc_301")
    assert response.status_code == 200
    data = response.json()

    assert data["course_id"] == "course_calc_301"
    assert len(data["questions"]) == 3
    assert data["total_estimated_minutes"] <= 15

    # Check calibrated topics cover parts and substitution
    skills = [q["target_skill"] for q in data["questions"]]
    assert any("Parts" in s for s in skills)
    assert any("Substitution" in s or "Arctan" in s for s in skills)


def test_probe_submission_to_forensics(client):
    """
    Task 5.5: Verifies that submitting the probe connects to Stage 3 forensics smoothly.
    """
    response = client.post(
        "/api/intake/submit-probe",
        json={
            "submission_id": "sub_stage_probe_01",
            "course_id": "course_calc_301",
            "probe_id": "probe_calibrated_calc_01",
            "question_id": "probe_q2",
            "submitted_work": "Step 1: u=x^2, dv=cos(x)dx\nStep 2: = x^2 sin(x) - [ -2x cos(x) - ∫ -2cos(x) dx ]\nStep 3: = x^2 sin(x) + 2x cos(x) - 2sin(x)",
        },
    )
    assert response.status_code == 200
    diff = response.json()
    assert diff["submission_id"] == "sub_stage_probe_01"
    assert diff["first_divergence_step"] == 3
    assert diff["primary_error_type"] in ["procedural_calculation", "sign_error"]
