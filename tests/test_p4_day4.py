"""
EduTrace AI — Pod P4 (Forensics & Error Fingerprint) Day 4 Unit & Integration Tests
Validates Tasks 4.6 & 4.7:
- Task 4.6: Dry runs on messy handwriting crops; ensure uncertainty badges trigger reliably (confidence < 0.80, needs_human_review = True).
- Task 4.6: POST /api/submissions/confirm-crop resolves uncertainty and updates divergence records in SQLite.
- Task 4.7: Socratic chat drawer citation pill click-throughs and grounded slide references.
"""

import pytest
import asyncio
from fastapi.testclient import TestClient

from backend.main import app
from backend.db.database import AsyncSessionLocal, init_db
from backend.db.models import SubmissionModel
from ai.forensics.step_parser import StepParser
from backend.schemas.contracts import (
    StepDivergenceResult,
    ErrorTaxonomy,
    ConfirmCropRequest,
)


@pytest.fixture(autouse=True)
def setup_database():
    """Ensure database schema exists before running tests."""
    asyncio.run(init_db())


def test_messy_handwriting_crop_dry_run_triggers_uncertainty():
    """Task 4.6: Messy handwriting tokens trigger uncertain segment and needs_human_review."""
    messy_work = (
        "Step 1: u = x^2, dv = cos(x)dx => du = 2x dx, v = sin(x)\n"
        "Step 2: = x^2 sin(x) - \\int 2x sin(x) dx\n"
        "Step 3: = x^2 sin(x) - [ ?~-2x cos(x) - \\int -2cos(x) dx ] (ambiguous messy crop)\n"
        "Step 4: = x^2 sin(x) + 2x cos(x) - 2sin(x)"
    )

    steps, uncertain_segments, needs_review = StepParser.parse_derivation_steps(messy_work)

    assert len(steps) >= 4
    assert needs_review is True, "Messy handwriting must set needs_human_review to True"
    assert len(uncertain_segments) > 0, "Messy handwriting must produce uncertain segments"

    seg = uncertain_segments[0]
    assert seg.step_index == 3
    assert seg.confidence < 0.80, f"Confidence should be < 0.80, got {seg.confidence}"
    assert seg.confirmed_value is None
    assert len(seg.suggested_alternatives) >= 2


def test_clean_handwriting_derivation_has_high_confidence():
    """Task 4.6: Clean handwriting derivation has no uncertainty and needs_human_review is False."""
    clean_work = (
        "u = x^2, dv = cos(x)dx\n"
        "= x^2 sin(x) - \\int 2x sin(x) dx\n"
        "= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]\n"
        "= x^2 sin(x) + 2x cos(x) - 2sin(x)"
    )

    steps, uncertain_segments, needs_review = StepParser.parse_derivation_steps(clean_work)

    assert len(steps) >= 4
    assert needs_review is False, "Clean work without messy tokens should not require human review"
    assert len(uncertain_segments) == 0


def test_confirm_crop_endpoint_resolves_uncertainty():
    """Task 4.6: POST /api/submissions/confirm-crop updates database and clears needs_human_review."""
    with TestClient(app) as client:
        # 1. First analyze a messy derivation to generate a stored submission
        analyze_payload = {
            "submission_id": "sub_messy_test_01",
            "course_id": "course_calc_301",
            "question_id": "q3_integration_by_parts",
            "submitted_work": (
                "u = x^2, dv = cos(x)dx => du = 2x dx, v = sin(x)\n"
                "= x^2 sin(x) - \\int 2x sin(x) dx\n"
                "= x^2 sin(x) - [ ?~-2x cos(x) - \\int -2cos(x) dx ] (ambiguous messy crop)\n"
                "= x^2 sin(x) + 2x cos(x) - 2sin(x)"
            ),
        }
        res_analyze = client.post("/api/submissions/analyze", json=analyze_payload)
        assert res_analyze.status_code == 200, res_analyze.text
        diff_data = res_analyze.json()
        assert diff_data["needs_human_review"] is True
        assert len(diff_data["uncertain_segments"]) > 0

        # 2. Call POST /api/submissions/confirm-crop
        confirm_payload = {
            "submission_id": "sub_messy_test_01",
            "crop_id": "crop_q3_step3_line2",
            "confirmed_value": "-2x cos(x)",
        }
        res_confirm = client.post("/api/submissions/confirm-crop", json=confirm_payload)
        assert res_confirm.status_code == 200, res_confirm.text
        confirmed_data = res_confirm.json()

        assert confirmed_data["submission_id"] == "sub_messy_test_01"
        assert confirmed_data["needs_human_review"] is False, "Confirming crop should clear needs_human_review"

        # Check step 3 text is updated with the confirmed value
        step3 = next(s for s in confirmed_data["steps"] if s["step_index"] == 3)
        assert "-2x cos(x)" in step3["submitted_work"]

        # Check uncertain segments are marked confirmed with confidence 1.0
        assert len(confirmed_data["uncertain_segments"]) > 0
        for seg in confirmed_data["uncertain_segments"]:
            assert seg["confirmed_value"] == "-2x cos(x)"
            assert seg["confidence"] == 1.0

        # 3. Verify SQLite persistence
        async def verify_persisted_submission():
            async with AsyncSessionLocal() as session:
                sub_record = await session.get(SubmissionModel, "sub_messy_test_01")
                assert sub_record is not None
                assert sub_record.needs_human_review is False

        asyncio.run(verify_persisted_submission())


def test_socratic_chat_drawer_and_citations():
    """Task 4.7: Socratic chat returns lecture citations for interactive drawer and citation pills."""
    with TestClient(app) as client:
        chat_payload = {
            "submission_id": "sub_messy_test_01",
            "user_query": "Why did my Step 3 fail? Does Slide 19 mention bracket rules?",
            "selected_step_index": 3,
        }
        res_chat = client.post("/api/submissions/socratic-chat", json=chat_payload)
        assert res_chat.status_code == 200, res_chat.text
        chat_data = res_chat.json()

        assert "reply" in chat_data
        assert len(chat_data["reply"]) > 0
        assert "cited_lecture_title" in chat_data
        assert "cited_page_or_slide" in chat_data
        assert chat_data["cited_page_or_slide"] == 19
        assert "brackets" in chat_data["reply"].lower() or "minus" in chat_data["reply"].lower() or "slide" in chat_data["reply"].lower()
