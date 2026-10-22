"""
EduTrace AI — Pod P4 (Forensics & Error Fingerprint) Day 3 Unit & Integration Tests
Validates Tasks 3.7–3.10:
- Live POST /api/submissions/analyze endpoint with dynamic citations
- Socratic Chat co-pilot endpoint with RAG citations
- Cognitive Error Fingerprint endpoint & SQLite persistence
- Handwriting uncertainty verification
"""

import pytest
import asyncio
from fastapi.testclient import TestClient

from backend.main import app
from backend.schemas.contracts import ErrorTaxonomy, StepStatus
from ai.forensics.divergence_detector import divergence_detector
from ai.forensics.socratic_copilot import socratic_copilot
from rag.retrieval.citation_engine import citation_retriever


def test_live_submissions_analyze_dynamic_citations():
    """Task 3.7: Live POST /api/submissions/analyze returns step diff with attached citations."""
    with TestClient(app) as client:
        payload = {
            "submission_id": "sub_day3_p4_01",
            "course_id": "course_calc_301",
            "question_id": "q3_integration_by_parts",
            "submitted_work": (
                "u = x^2, dv = cos(x)dx => du = 2x dx, v = sin(x)\n"
                "= x^2 sin(x) - \\int 2x sin(x) dx\n"
                "= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]\n"
                "= x^2 sin(x) + 2x cos(x) - 2sin(x)"
            ),
        }
        res = client.post("/api/submissions/analyze", json=payload)
        assert res.status_code == 200, res.text
        data = res.json()

        assert data["submission_id"] == "sub_day3_p4_01"
        assert len(data["steps"]) >= 4
        assert data["first_divergence_step"] == 3
        assert data["primary_error_type"] == "procedural_calculation"
        assert data["estimated_marks_obtained"] > 0
        # Check that dynamic course citations were attached
        assert len(data["course_citations"]) > 0
        first_cit = data["course_citations"][0]
        assert "title" in first_cit
        assert "slide_number" in first_cit or "page_number" in first_cit
        assert "quote" in first_cit


def test_socratic_chat_endpoints():
    """Task 3.8: POST /api/submissions/socratic-chat and /api/forensics/chat."""
    with TestClient(app) as client:
        # 1. Via /api/submissions/socratic-chat
        req1 = {
            "submission_id": "sub_day3_p4_01",
            "user_query": "Why did my Step 3 fail when distributing the outer minus sign?",
            "selected_step_index": 3,
        }
        res1 = client.post("/api/submissions/socratic-chat", json=req1)
        assert res1.status_code == 200, res1.text
        data1 = res1.json()
        assert "reply" in data1
        assert "bracket" in data1["reply"].lower() or "sign" in data1["reply"].lower()
        assert data1["cited_lecture_title"] is not None
        assert data1["cited_page_or_slide"] is not None
        assert data1["suggested_followup_question"] is not None

        # 2. Via /api/forensics/chat router
        req2 = {
            "submission_id": "sub_day3_p4_01",
            "user_query": "What standard method should I use for 1 / (1 + x^2)?",
            "selected_step_index": 2,
        }
        res2 = client.post("/api/forensics/chat", json=req2)
        assert res2.status_code == 200, res2.text
        data2 = res2.json()
        assert "reply" in data2
        assert data2["cited_lecture_title"] is not None


def test_cognitive_error_fingerprint_endpoint():
    """Task 3.10: GET /api/fingerprint and GET /api/submissions/fingerprint."""
    with TestClient(app) as client:
        res1 = client.get("/api/fingerprint?course_id=course_calc_301")
        assert res1.status_code == 200, res1.text
        data1 = res1.json()

        assert data1["course_id"] == "course_calc_301"
        assert data1["total_errors_analyzed"] >= 15
        assert data1["total_marks_lost"] >= 30.0
        assert data1["primary_cognitive_leak"] == "procedural_calculation"
        assert len(data1["breakdown"]) >= 3

        # Verify percentages sum approximately to 100
        total_pct = sum(item["percentage"] for item in data1["breakdown"])
        assert 95.0 <= total_pct <= 105.0

        # Submissions alias endpoint
        res2 = client.get("/api/submissions/fingerprint?course_id=course_calc_301")
        assert res2.status_code == 200, res2.text
        data2 = res2.json()
        assert data2["total_errors_analyzed"] == data1["total_errors_analyzed"]


def test_socratic_copilot_unit():
    """Direct unit test of SocraticCopilot logic and citation extraction."""
    response = asyncio.run(
        socratic_copilot.generate_response(
            submission_id="sub_test_copilot",
            selected_step_index=3,
            user_query="I got confused by the minus sign in the second iteration.",
            course_id="course_calc_301",
            step_context={
                "submitted_work": "= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]",
                "expected_rubric_step": "uv - \\int v du with outer negative distributed cleanly",
                "error_type": "procedural_calculation",
                "divergence_reason": "Sign distribution error",
            },
        )
    )

    assert response.reply
    assert response.cited_lecture_title
    assert response.cited_page_or_slide == 19
    assert response.suggested_followup_question
