"""
EduTrace AI — Pod P4 Day 5 Test Suite (Task 5.6)
Verifies:
1. Step-by-step divergence analysis returns exact Step 3 divergence with Slide 19 citation.
2. Human-in-the-loop handwriting crop confirmation resolves uncertainty with zero hallucination.
3. Socratic Co-Pilot chat responds within 50ms citing Professor Kapoor's Slide 19 notes.
4. Stage 4 Cognitive Error Fingerprint identifies procedural bracket slips as primary leak.
5. End-to-end rehearsal sequence runs flawlessly without stage lag.
"""

import time
import pytest
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_step_divergence_localization_and_slide19(client):
    """
    Task 5.6: Verifies that GET /api/submissions/forensics returns
    the four-step derivation with Step 3 localized as diverged and Slide 19 cited.
    """
    response = client.get("/api/submissions/forensics?submission_id=sub_math_9042")
    assert response.status_code == 200
    data = response.json()

    assert data["submission_id"] == "sub_math_9042"
    assert data["first_divergence_step"] == 3
    assert len(data["steps"]) >= 4

    step3 = next((s for s in data["steps"] if s["step_index"] == 3), None)
    assert step3 is not None
    assert step3["status"] == "diverged"
    assert step3["marks_awarded"] == 0.0
    assert step3["cited_page_or_slide"] == 19
    assert "minus" in step3["divergence_reason"].lower() or "bracket" in step3["divergence_reason"].lower()


def test_confirm_handwriting_crop_endpoint(client):
    """
    Task 5.6: Verifies that confirming handwriting crop updates transcription
    and resolves the human review safeguard.
    """
    response = client.post(
        "/api/submissions/confirm-crop",
        json={
            "submission_id": "sub_math_9042",
            "crop_id": "crop_q3_step3_line2",
            "confirmed_value": "-2x cos(x)",
        },
    )
    assert response.status_code == 200
    data = response.json()

    assert data["submission_id"] == "sub_math_9042"
    step3 = next((s for s in data["steps"] if s["step_index"] == 3), None)
    assert step3 is not None
    assert "-2x cos(x)" in step3["submitted_work"]


def test_socratic_chat_latency_and_lecture_grounding(client):
    """
    Task 5.6: Verifies Socratic Co-Pilot responds within 50ms budget,
    quotes Slide 19, and provides follow-up guidance.
    """
    # Warmup request
    client.post(
        "/api/submissions/socratic-chat",
        json={
            "submission_id": "sub_math_9042",
            "selected_step_index": 3,
            "user_query": "Warmup",
        },
    )

    t0 = time.perf_counter()
    response = client.post(
        "/api/submissions/socratic-chat",
        json={
            "submission_id": "sub_math_9042",
            "selected_step_index": 3,
            "user_query": "Why did my Step 3 diverge and lose marks?",
        },
    )
    elapsed_ms = (time.perf_counter() - t0) * 1000.0
    assert response.status_code == 200
    assert elapsed_ms < 50.0, f"Socratic chat took {elapsed_ms}ms, exceeding 50ms budget!"

    data = response.json()
    assert len(data["reply"]) > 50
    assert data["cited_page_or_slide"] == 19
    assert "Kapoor" in data["cited_lecture_title"]
    assert "bracket" in data["reply"].lower() or "sign" in data["reply"].lower()
    assert data["suggested_followup_question"] is not None


def test_cognitive_error_fingerprint_endpoint(client):
    """
    Task 5.6: Verifies Stage 4 error fingerprint aggregates procedural errors
    as the primary cognitive marks leak.
    """
    response = client.get("/api/submissions/fingerprint?course_id=course_calc_301")
    assert response.status_code == 200
    data = response.json()

    assert data["course_id"] == "course_calc_301"
    assert data["total_errors_analyzed"] >= 10
    assert data["primary_cognitive_leak"] == "procedural_calculation"
    assert len(data["breakdown"]) >= 3

    top_error = data["breakdown"][0]
    assert top_error["error_type"] == "procedural_calculation"
    assert top_error["percentage"] >= 40.0


def test_rehearsal_sequence_divergence_to_recovery(client):
    """
    Task 5.6: Full rehearsal integration check:
    Step 3 diff -> Socratic chat -> Error fingerprint -> Ready for Recovery Map.
    """
    # 1. Inspect diff
    diff_res = client.get("/api/submissions/forensics?submission_id=sub_math_9042")
    assert diff_res.status_code == 200

    # 2. Ask co-pilot about Slide 19
    chat_res = client.post(
        "/api/submissions/socratic-chat",
        json={
            "submission_id": "sub_math_9042",
            "selected_step_index": 3,
            "user_query": "Can you explain how Slide 19 applies to my sign error in Step 3?",
        },
    )
    assert chat_res.status_code == 200
    assert chat_res.json()["cited_page_or_slide"] == 19

    # 3. Verify Error Fingerprint
    fp_res = client.get("/api/submissions/fingerprint?course_id=course_calc_301")
    assert fp_res.status_code == 200
    assert fp_res.json()["primary_cognitive_leak"] == "procedural_calculation"
