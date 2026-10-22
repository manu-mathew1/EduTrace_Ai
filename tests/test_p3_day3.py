"""
EduTrace AI — Day 3 Pod P3: Metacognitive Intake & Dual-Mode Diagnostic Test Suite
Verifies:
1. Task 3.5: Mode B Physical Exam Paper Autopsy and Human-in-the-Loop OCR verification.
2. Task 3.6: Completed diagnostic probe submissions wired directly into Stage 3 forensics & persistence.
"""

import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from backend.main import app
from backend.db.database import AsyncSessionLocal
from backend.db.models import SubmissionModel, CourseModel


client = TestClient(app)


def test_submit_diagnostic_probe_to_forensics_pipeline():
    """
    Task 3.6: Verifies that submitting answers to the diagnostic probe immediately executes
    Stage 3 divergence detection, classifies the cognitive error, and persists the result.
    """
    submission_id = "sub_test_probe_pipeline_01"
    submitted_work = (
        "u = x^2, dv = cos(x)dx => du = 2x dx, v = sin(x)\n"
        "= x^2 sin(x) - \\int 2x sin(x) dx\n"
        "= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]\n"
        "= x^2 sin(x) + 2x cos(x) - 2sin(x)"
    )

    payload = {
        "submission_id": submission_id,
        "course_id": "course_calc_301",
        "probe_id": "probe_calibrated_calc_01",
        "question_id": "probe_q2",
        "submitted_work": submitted_work,
        "all_answers": {
            "probe_q1": "Part 1: u = 1+x^2. Part 2: arctan(x) + C",
            "probe_q2": submitted_work,
            "probe_q3": "Discontinuous at 0",
        },
    }

    resp = client.post("/api/intake/submit-probe", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # Verify Stage 3 forensic results
    assert data["submission_id"] == submission_id
    assert data["first_divergence_step"] == 3
    assert data["primary_error_type"] == "procedural_calculation"
    assert len(data["steps"]) >= 4
    assert data["estimated_marks_obtained"] < data["total_possible_marks"]
    assert "sign" in data["forensic_summary"].lower() or "divergence" in data["forensic_summary"].lower()


@pytest.mark.anyio
async def test_submitted_probe_is_persisted_in_sqlite():
    """
    Task 3.6: Verifies that the submitted probe result is queryable from SQLite database.
    """
    submission_id = "sub_test_probe_pipeline_01"

    async with AsyncSessionLocal() as session:
        res = await session.execute(select(SubmissionModel).where(SubmissionModel.id == submission_id))
        record = res.scalars().first()
        assert record is not None
        assert record.first_divergence_step == 3
        assert record.primary_error_type == "procedural_calculation"


def test_mode_b_autopsy_and_crop_confirmation():
    """
    Task 3.5: Verifies Mode B physical exam autopsy endpoint and human-in-the-loop
    handwriting crop confirmation.
    """
    # 1. Mode B Autopsy Request
    autopsy_payload = {
        "course_id": "course_calc_301",
        "question_paper_filename": "Midterm_2024_Calc3.pdf",
        "answer_sheet_filename": "Rahul_AnswerSheet_Scan.pdf",
        "confirmed_crops": {
            "crop_q3_step3": "-2x cos(x)",
        },
    }

    autopsy_resp = client.post("/api/intake/mode-b/autopsy", json=autopsy_payload)
    assert autopsy_resp.status_code == 200
    autopsy_data = autopsy_resp.json()

    assert autopsy_data["mode"] == "exam_autopsy"
    assert autopsy_data["total_steps_detected"] == 4
    assert len(autopsy_data["uncertain_segments"]) >= 1

    seg = autopsy_data["uncertain_segments"][0]
    assert seg["character_crop_id"] == "crop_q3_step3"
    assert seg["confidence"] == 0.68
    assert "-2x cos(x)" in seg["suggested_alternatives"]
    assert seg["confirmed_value"] == "-2x cos(x)"

    # 2. Confirm OCR Crop Endpoint
    crop_payload = {
        "crop_id": "crop_q3_step3",
        "confirmed_value": "-2x cos(x)",
    }
    confirm_resp = client.post("/api/intake/mode-b/confirm-crop", json=crop_payload)
    assert confirm_resp.status_code == 200
    confirm_data = confirm_resp.json()
    assert confirm_data["status"] == "confirmed"
    assert confirm_data["crop_id"] == "crop_q3_step3"
    assert confirm_data["confirmed_value"] == "-2x cos(x)"
