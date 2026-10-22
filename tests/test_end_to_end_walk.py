"""
EduTrace AI — End-to-End Walking Skeleton Verification (Pod P1: Task 2.1)
Verifies that all 5 vertical pod routes are mounted, functional, and adhering
to the frozen data contracts across the entire closed-loop diagnostic workflow.
"""

import asyncio
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.db.database import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Ensure SQLite database schema is created before test execution."""
    asyncio.run(init_db())


def test_health_check_all_pods():
    """Verify core health endpoint and pod registration."""
    with TestClient(app) as client:
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "pods" in data
        assert data["pods"]["p1_core"].startswith("active")
        assert "p2_ingestion" in data["pods"]
        assert "p3_intake" in data["pods"]
        assert "p4_forensics" in data["pods"]
        assert "p5_recovery" in data["pods"]


def test_stage1_documents_triage():
    """Verify Pod P2 Ingestion & Triage route."""
    with TestClient(app) as client:
        res = client.get("/api/documents/triage?course_id=course_calc_301")
        assert res.status_code == 200
        data = res.json()
        assert "documents" in data
        assert len(data["documents"]) >= 3
        assert data["ready_for_intake"] is True


def test_stage2_intake_consult_and_probe():
    """Verify Pod P3 Intake consultation & diagnostic probe generation."""
    with TestClient(app) as client:
        consult_payload = {
            "course_id": "course_calc_301",
            "session_id": "sess_test_01",
            "user_message": "I struggle with integration by parts and minus signs",
            "messages_history": [],
            "target_score": 75,
            "baseline_score": 50,
        }
        res = client.post("/api/intake/consult", json=consult_payload)
        assert res.status_code == 200
        data = res.json()
        assert "assistant_reply" in data
        assert "session_state" in data

        probe_res = client.get("/api/intake/probe?course_id=course_calc_301")
        assert probe_res.status_code == 200
        probe_data = probe_res.json()
        assert "questions" in probe_data
        assert len(probe_data["questions"]) >= 1


def test_stage3_forensics_diff_and_chat():
    """Verify Pod P4 Forensic step-diff and Socratic chat co-pilot."""
    with TestClient(app) as client:
        res = client.get("/api/submissions/forensics?submission_id=sub_math_9042")
        assert res.status_code == 200
        diff_data = res.json()
        assert "steps" in diff_data
        assert diff_data["first_divergence_step"] == 3
        assert diff_data["primary_error_type"] == "procedural_calculation"

        chat_payload = {
            "submission_id": "sub_math_9042",
            "user_query": "Why did my Step 3 fail?",
            "selected_step_index": 3,
        }
        chat_res = client.post("/api/submissions/socratic-chat", json=chat_payload)
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert "reply" in chat_data
        assert chat_data["cited_page_or_slide"] == 19


def test_stage5_recovery_map():
    """Verify Pod P5 Marks Recovery ROI roadmap."""
    with TestClient(app) as client:
        res = client.get("/api/recovery/map?course_id=course_calc_301&baseline_score=52&target_score=75")
        assert res.status_code == 200
        rec_data = res.json()
        assert "priorities" in rec_data
        assert len(rec_data["priorities"]) >= 3
        assert rec_data["priorities"][0]["potential_marks_recoverable"] >= 5.0


def test_stage6_intervention_studio():
    """Verify Pod P5 Multimodal Studio player content."""
    with TestClient(app) as client:
        res = client.get("/api/interventions/studio?skill_id=skill_parts_sign_expansion")
        assert res.status_code == 200
        studio_data = res.json()
        assert "flowchart_mermaid_code" in studio_data
        assert "spot_the_bug_question" in studio_data
        assert "analogy_content" in studio_data
        assert "audio_summary_script" in studio_data


def test_stage7_reassessment_and_twin():
    """Verify Pod P5 Reassessment & Pod P1 Bayesian Learning Twin updates."""
    with TestClient(app) as client:
        reassess_payload = {
            "reassessment_id": "reassess_test_01",
            "submitted_work": "u = x, dv = cos(2x)dx => (1/2)x sin(2x) + (1/4)cos(2x) + C",
            "time_taken_seconds": 180,
        }
        res = client.post("/api/reassessment/verify", json=reassess_payload)
        assert res.status_code == 200
        res_data = res.json()
        assert res_data["is_improved"] is True
        assert res_data["marks_recovered_secured"] > 0
        assert "celebration_message" in res_data

        twin_res = client.get("/api/twin/default_student?course_id=course_calc_301")
        assert twin_res.status_code == 200
        twin_data = twin_res.json()
        assert "skills" in twin_data
        assert twin_data["overall_readiness_score"] > 0
