"""
EduTrace AI — Pod P5 (Recovery, Studio & Reassessment) Day 4 Unit & Integration Tests
Validates Tasks 4.8 – 4.12:
- Task 4.8: 60-Second Audio Deconstruction Generator with timestamps, Web Speech SSML, and waveform data.
- Task 4.9: Spot-the-Bug Interactive Micro-Drill & Isomorphic Reassessment Question Generators.
- Task 4.10: Live Reassessment Verification API (POST /api/reassessment/verify) calling Learning Twin update.
- Task 4.11: Stage 7 Reassessment Page, question delivery, and TwinCelebrationModal.
- Task 4.12: Ground-truth Benchmark Evaluation across all 15 annotated cases (Macro-F1 >= 0.85, Localization >= 0.90).
"""

import pytest
import asyncio
from fastapi.testclient import TestClient

from backend.main import app
from backend.db.database import AsyncSessionLocal, init_db
from backend.db.models import SkillTwinModel
from ai.intervention.audio_generator import audio_generator, AudioDeconstructionGenerator
from ai.intervention.bug_drill_generator import bug_drill_generator, BugDrillGenerator
from ai.intervention.reassessment_generator import reassessment_generator, ReassessmentGenerator
from evaluation.runner import benchmark_runner


@pytest.fixture(autouse=True)
def setup_database():
    """Ensure database schema exists before running tests."""
    asyncio.run(init_db())


def test_audio_deconstruction_generator():
    """Task 4.8: Audio deconstruction generator synthesizes 60s timed script and waveform."""
    res = asyncio.run(
        audio_generator.generate_script(
            skill_id="skill_parts_sign",
            skill_name="Integration by Parts: Bracket Sign Distribution",
            lecture_quote="When repeating integration by parts, always enclose the entire second iteration in brackets before distributing the outer minus sign.",
            divergence_context="Outer minus sign was distributed without enclosing inner formula",
        )
    )

    assert res.duration_seconds == 60
    assert len(res.timestamps) == 4
    phases = [t.phase for t in res.timestamps]
    assert "Hook" in phases
    assert "The Trap" in phases
    assert "Professor's Golden Rule" in phases
    assert "Actionable Takeaway" in phases
    assert len(res.waveform_amplitudes) >= 24
    assert all(0.0 <= amp <= 1.0 for amp in res.waveform_amplitudes)
    assert "<speak>" in res.web_speech_ssml

    # Test live endpoint
    with TestClient(app) as client:
        api_res = client.post(
            "/api/interventions/audio",
            json={
                "skill_id": "skill_parts_sign",
                "skill_name": "Integration by Parts: Bracket Sign Distribution",
                "divergence_context": "Sign distribution error",
            },
        )
        assert api_res.status_code == 200, api_res.text
        data = api_res.json()
        assert data["duration_seconds"] == 60
        assert len(data["timestamps"]) == 4
        assert len(data["waveform_amplitudes"]) > 0


def test_spot_the_bug_and_isomorphic_generators():
    """Task 4.9: Bug drill and Isomorphic question generators create complete remediation challenges."""
    # 1. Bug Drill Generator
    drill = bug_drill_generator.generate_drill(
        skill_id="skill_parts_sign",
        lecture_tip="Always enclose the second iteration in brackets.",
    )
    assert drill.skill_id == "skill_parts_sign"
    assert len(drill.steps) >= 3
    assert drill.bug_index in [s.step_num for s in drill.steps]
    assert len(drill.explanation) > 0
    assert drill.remediation_tip is not None

    # 2. Isomorphic Reassessment Generator
    q = reassessment_generator.generate_question("skill_parts_sign")
    assert q.skill_id == "skill_parts_sign"
    assert "reassess_" in q.reassessment_id
    assert len(q.question_text) > 0
    assert len(q.rubric_steps) >= 3
    assert q.maximum_marks == 10


def test_reassessment_api_endpoints_and_twin_update():
    """Task 4.10: GET /question and POST /verify endpoints update Bayesian Learning Twin."""
    with TestClient(app) as client:
        # 1. GET question
        get_res = client.get("/api/reassessment/question?skill_id=skill_parts_sign")
        assert get_res.status_code == 200, get_res.text
        q_data = get_res.json()
        assert q_data["skill_id"] == "skill_parts_sign"
        assert len(q_data["rubric_steps"]) > 0

        # 2. POST verify solution
        verify_payload = {
            "reassessment_id": q_data["reassessment_id"],
            "student_id": "std_rahul_99",
            "course_id": "course_calc_301",
            "skill_id": "skill_parts_sign",
            "submitted_work": (
                "u = x, dv = cos(2x)dx => du = dx, v = (1/2)sin(2x)\n"
                "= (1/2)x sin(2x) - \\int (1/2)sin(2x) dx\n"
                "= (1/2)x sin(2x) - [ -(1/4)cos(2x) ] + C\n"
                "= (1/2)x sin(2x) + (1/4)cos(2x) + C"
            ),
        }
        post_res = client.post("/api/reassessment/verify", json=verify_payload)
        assert post_res.status_code == 200, post_res.text
        res_data = post_res.json()

        assert res_data["is_improved"] is True
        assert res_data["marks_awarded"] >= 8.0
        assert res_data["marks_recovered_secured"] > 0
        assert res_data["new_mastery_estimate"] > res_data["previous_mastery_estimate"]
        assert len(res_data["uncertainty_interval"]) == 2

        # 3. Verify SQLite persistence of updated Bayesian twin
        async def verify_twin_in_db():
            async with AsyncSessionLocal() as session:
                from sqlalchemy import select
                stmt = select(SkillTwinModel).where(SkillTwinModel.student_id == "std_rahul_99")
                res = await session.execute(stmt)
                twins = res.scalars().all()
                assert len(twins) > 0

        asyncio.run(verify_twin_in_db())


def test_15_case_benchmark_runner_accuracy_and_f1():
    """Task 4.12: 15-case gold benchmark achieves localization accuracy >= 0.90 and Macro-F1 >= 0.85."""
    res = asyncio.run(benchmark_runner.run_evaluation())

    assert res["status"] == "success"
    assert res["total_cases_evaluated"] == 15, f"Expected 15 cases, got {res['total_cases_evaluated']}"
    assert res["divergence_localization_accuracy"] >= 0.90, (
        f"Localization accuracy {res['divergence_localization_accuracy']} < 0.90"
    )
    assert res["taxonomy_macro_f1"] >= 0.85, (
        f"Taxonomy Macro-F1 {res['taxonomy_macro_f1']} < 0.85"
    )
    assert res["target_thresholds_met"] is True
