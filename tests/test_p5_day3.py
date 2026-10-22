"""
EduTrace AI — Pod P5 (Recovery & Studio) Day 3 Unit & Integration Tests
Validates Tasks 3.11 & 3.12:
- Multimodal Content Generators (Analogy Generator & Mermaid Flowchart Generator)
- Studio Engine assembling 4-tab multimodal interventions
- Live /api/interventions/studio and /api/interventions/generate endpoints
- Gold-standard annotated benchmark cases 6–10 integrity
- Benchmark evaluation runner
"""

import asyncio
from fastapi.testclient import TestClient

from backend.main import app
from ai.intervention.analogy_generator import analogy_generator
from ai.intervention.flowchart_generator import flowchart_generator
from ai.intervention.studio_engine import studio_engine
from evaluation.runner import benchmark_runner


def test_analogy_generator_domain_and_fallback():
    """Task 3.11: Real-world physical analogy generation."""
    # Domain calibrated case: Integration by Parts bracket sign distribution
    res1 = asyncio.run(
        analogy_generator.generate_analogy(
            skill_id="skill_parts_sign",
            skill_name="Bracket Expansion Sign Inversion",
        )
    )
    assert res1.title == "The Nested Suitcase Rule"
    assert "suitcase" in res1.content.lower()
    assert res1.remediation_takeaway

    # Domain calibrated case: U-substitution vs arctan standard form
    res2 = asyncio.run(
        analogy_generator.generate_analogy(
            skill_id="skill_sub_vs_parts",
            skill_name="Substitution vs Inverse Trig",
        )
    )
    assert "Security" in res2.title or "Scanner" in res2.title
    assert "derivative" in res2.content.lower()

    # Universal fallback case
    res3 = asyncio.run(
        analogy_generator.generate_analogy(
            skill_id="skill_custom_topic_xyz",
            skill_name="Custom Topic XYZ",
        )
    )
    assert res3.title
    assert res3.content


def test_flowchart_generator_valid_mermaid():
    """Task 3.11: Mermaid flowchart procedural guardrail generation."""
    res = asyncio.run(
        flowchart_generator.generate_flowchart(
            skill_id="skill_parts_sign",
            skill_name="Integration by Parts Bracket Distribution",
        )
    )
    assert res.title
    assert res.mermaid_code.startswith("graph TD")
    assert "-->" in res.mermaid_code
    assert "STOP" in res.mermaid_code or "Brackets" in res.mermaid_code
    assert res.decision_summary


def test_studio_engine_complete_package():
    """Task 3.11: StudioEngine generates complete 4-tab MultimodalStudioContent."""
    package = asyncio.run(
        studio_engine.build_studio_content(
            skill_id="skill_ode_factor",
            skill_name="Linear Differential Equations Integrating Factor",
        )
    )
    assert package.skill_id == "skill_ode_factor"
    assert package.analogy_title
    assert package.analogy_content
    assert package.flowchart_mermaid_code.startswith("graph TD")
    assert package.audio_summary_script
    assert package.spot_the_bug_question
    assert len(package.spot_the_bug_steps) >= 3
    assert package.bug_step_index in [1, 2, 3]


def test_live_interventions_api_endpoints():
    """Task 3.11: Live API endpoints in backend/api/interventions.py."""
    with TestClient(app) as client:
        # GET /api/interventions/studio
        resp = client.get("/api/interventions/studio?skill_id=skill_parts_sign")
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert "analogy_title" in data
        assert "flowchart_mermaid_code" in data
        assert "spot_the_bug_question" in data
        assert "audio_summary_script" in data

        # POST /api/interventions/generate
        payload = {
            "skill_id": "skill_improper_discontinuity",
            "skill_name": "Improper Integrals and Singularities",
            "error_type": "conceptual_misunderstanding",
        }
        post_resp = client.post("/api/interventions/generate", json=payload)
        assert post_resp.status_code == 200, post_resp.text
        post_data = post_resp.json()
        assert "Canyon" in post_data["analogy_title"] or "Bridge" in post_data["analogy_title"]


def test_benchmark_runner_annotated_cases_6_to_10():
    """Task 3.12: Benchmark evaluation runner across annotated cases 1–10."""
    result = asyncio.run(benchmark_runner.run_evaluation())
    assert result["status"] == "success"
    assert result["total_cases_evaluated"] >= 10
    assert result["divergence_localization_accuracy"] >= 0.80
    assert result["taxonomy_macro_f1"] >= 0.75
    assert result["marks_estimation_mae"] <= 3.0
