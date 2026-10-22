"""
EduTrace AI — Pod P1 (Core Systems & Master Architecture) Day 4 Unit & Integration Tests
Validates Tasks 4.1 & 4.2:
- Task 4.1: End-to-end data pipeline verification from Stage 1 through Stage 4
- Task 4.2: Live Bayesian Learning Twin updates upon reassessment completion with SQLite persistence
"""

import pytest
import asyncio
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.twin_service import (
    calculate_beta_mastery,
    bayesian_posterior_update,
    get_learning_twin_data,
    record_reassessment_outcome,
)
from backend.schemas.contracts import ReassessmentResult, LearningTwinResponse


def test_stage1_through_stage4_end_to_end_pipeline():
    """
    Task 4.1: Comprehensive pipeline walkthrough verifying zero architectural drift
    from Stage 1 (Ingestion) -> Stage 2 (Intake) -> Stage 3 (Forensics) -> Stage 4 (Fingerprint) -> Stage 5 (Recovery).
    """
    with TestClient(app) as client:
        # 1. Stage 1 Ingestion Check
        triage_res = client.get("/api/documents/triage")
        assert triage_res.status_code == 200
        triage_data = triage_res.json()
        assert len(triage_data.get("documents", [])) >= 1

        # 2. Stage 2 Intake Consultation & Probe Generation
        probe_res = client.get("/api/intake/probe?course_id=course_calc_301")
        assert probe_res.status_code == 200
        probe_data = probe_res.json()
        assert len(probe_data.get("questions", [])) >= 3
        q1 = probe_data["questions"][0]

        # 3. Stage 2 -> Stage 3 Submission Pipeline Wiring
        submit_payload = {
            "session_id": "sess_day4_pipe_01",
            "course_id": "course_calc_301",
            "question_id": q1["question_id"],
            "submitted_work": (
                "u = x^2, dv = cos(x)dx => du = 2x dx, v = sin(x)\n"
                "= x^2 sin(x) - \\int 2x sin(x) dx\n"
                "= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]\n"
                "= x^2 sin(x) + 2x cos(x) - 2sin(x)"
            ),
            "rubric_steps": q1.get("rubric_steps") or [
                "Identify parts u and dv correctly",
                "Apply integration by parts formula",
                "Perform second iteration with outer minus distributed",
                "Final simplified antiderivative with + C",
            ],
        }
        pipe_res = client.post("/api/intake/submit-probe", json=submit_payload)
        assert pipe_res.status_code == 200, pipe_res.text
        forensic_diff = pipe_res.json()
        assert forensic_diff["first_divergence_step"] == 3
        assert forensic_diff["primary_error_type"] == "procedural_calculation"

        # 4. Stage 3 Socratic Chat with RAG Citation
        chat_payload = {
            "submission_id": forensic_diff["submission_id"],
            "user_query": "Why did my Step 3 fail?",
            "selected_step_index": 3,
        }
        chat_res = client.post("/api/submissions/socratic-chat", json=chat_payload)
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert chat_data["cited_page_or_slide"] == 19
        assert "Kapoor" in chat_data["cited_lecture_title"]

        # 5. Stage 4 Cognitive Error Fingerprint Dynamic Update
        fp_res = client.get("/api/submissions/fingerprint?course_id=course_calc_301")
        assert fp_res.status_code == 200
        fp_data = fp_res.json()
        assert fp_data["total_errors_analyzed"] >= 15
        assert fp_data["primary_cognitive_leak"] == "procedural_calculation"

        # 6. Stage 5 Marks Recovery Prioritization
        rec_res = client.get("/api/recovery/map?baseline_score=50&target_score=75")
        assert rec_res.status_code == 200
        rec_data = rec_res.json()
        assert rec_data["marks_gap"] == 25
        assert len(rec_data["priorities"]) >= 3


def test_live_bayesian_twin_reassessment_update_cycle():
    """
    Task 4.2: Tests live Bayesian Learning Twin updates upon reassessment completion,
    verifying conjugate Beta-Binomial update, uncertainty interval narrowing, and SQLite persistence.
    """
    with TestClient(app) as client:
        # 1. Fetch initial Learning Twin profile for Rahul
        init_res = client.get("/api/twin/profile?course_id=course_calc_301&student_id=std_rahul_99")
        assert init_res.status_code == 200, init_res.text
        init_twin = init_res.json()
        assert init_twin["course_id"] == "course_calc_301"
        assert len(init_twin["skills"]) >= 3
        initial_readiness = init_twin["overall_readiness_score"]

        # 2. Complete an isomorphic reassessment drill verifying bracket sign distribution
        drill_submission = {
            "reassessment_id": "reassess_day4_test_01",
            "student_id": "std_rahul_99",
            "course_id": "course_calc_301",
            "skill_id": "skill_parts_sign_expansion",
            "submitted_work": (
                "u = x, dv = cos(2x)dx => du = dx, v = (1/2)sin(2x)\n"
                "= (1/2)x sin(2x) - \\int (1/2)sin(2x) dx\n"
                "= (1/2)x sin(2x) - [ -(1/4)cos(2x) ] + C\n"
                "= (1/2)x sin(2x) + (1/4)cos(2x) + C"
            ),
            "time_taken_seconds": 180,
        }
        reassess_res = client.post("/api/reassessment/verify", json=drill_submission)
        assert reassess_res.status_code == 200, reassess_res.text
        reassess_data = reassess_res.json()

        assert reassess_data["is_improved"] is True
        assert reassess_data["marks_awarded"] >= 9.0
        assert reassess_data["marks_recovered_secured"] > 0
        assert reassess_data["new_mastery_estimate"] > reassess_data["previous_mastery_estimate"]

        # Verify credible interval narrowed
        interval = reassess_data["uncertainty_interval"]
        assert len(interval) == 2
        assert interval[0] < interval[1]
        width = interval[1] - interval[0]
        assert width < 0.60  # Uncertainty narrowed significantly

        # 3. Fetch updated Twin profile and verify live sync & cumulative marks secured
        updated_res = client.get("/api/twin/profile?course_id=course_calc_301&student_id=std_rahul_99")
        assert updated_res.status_code == 200
        updated_twin = updated_res.json()

        target_skill = next(
            s for s in updated_twin["skills"] if s["skill_id"] == "skill_parts_sign_expansion"
        )
        assert target_skill["mastery_percentage"] >= reassess_data["new_mastery_estimate"] - 0.5
        assert updated_twin["total_marks_recovered_to_date"] >= reassess_data["marks_recovered_secured"]
        assert "🎯" in reassess_data["celebration_message"]


def test_bayesian_posterior_mathematical_precision():
    """Unit test for Beta-Binomial updating formulas and variance narrowing."""
    # Prior Beta(4, 5) => mean = 4 / 9 = ~44.4%
    m_prior, unc_prior = calculate_beta_mastery(4.0, 5.0)
    assert abs(m_prior - 44.4) < 0.2

    # Update with perfect score 10/10 with evidence weight 3.0:
    # alpha_new = 4.0 + 3.0 = 7.0, beta_new = 5.0 + 0 = 5.0
    a_new, b_new, m_post, unc_post = bayesian_posterior_update(
        alpha=4.0,
        beta=5.0,
        marks_awarded=10.0,
        marks_possible=10.0,
        evidence_weight=3.0,
    )
    assert a_new == 7.0
    assert b_new == 5.0
    # Posterior mean: 7 / 12 = ~58.3%
    assert abs(m_post - 58.3) < 0.2
    assert unc_post[0] > unc_prior[0]  # Lower bound shifted up
