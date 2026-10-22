"""
EduTrace AI — Stage 5 Marks Recovery & Evaluation Benchmark Test Suite
Verifies Marks Recovery ROI ranking algorithm, live router, and ground-truth annotated cases.
"""

import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from ai.diagnostics.recovery_ranker import (
    MarksRecoveryRanker,
    SkillCandidate,
    recovery_ranker,
)
from backend.schemas.contracts import ErrorTaxonomy, ModalityType, MarksRecoveryResponse


client = TestClient(app)


def test_recovery_velocity_and_roi_calculation():
    """
    Tests the mathematical formula for Marks Recovery ROI:
        ROI = Normalized Exam Weight * Observed Error Burden * Remediation Velocity
    """
    # High-velocity skill (20 mins to fix, 15% exam weight, 0.8 error burden)
    cand_high = SkillCandidate(
        skill_id="test_high",
        skill_name="Bracket Expansion",
        diagnosed_error=ErrorTaxonomy.PROCEDURAL_CALCULATION,
        exam_weight_percentage=15.0,
        error_burden=0.80,
        remediation_time_minutes=20,
        potential_marks_recoverable=8.0,
        rationale="High frequency test skill",
    )
    # Velocity = 60 / 20 = 3.0
    # ROI = 0.15 * 0.80 * 3.0 = 0.36
    roi_high = MarksRecoveryRanker.calculate_roi_score(cand_high)
    assert abs(roi_high - 0.36) < 1e-4

    # Low-velocity skill (60 mins to fix, 10% exam weight, 0.5 error burden)
    cand_low = SkillCandidate(
        skill_id="test_low",
        skill_name="Multi-page Proof",
        diagnosed_error=ErrorTaxonomy.CONCEPTUAL_MISUNDERSTANDING,
        exam_weight_percentage=10.0,
        error_burden=0.50,
        remediation_time_minutes=60,
        potential_marks_recoverable=5.0,
        rationale="Low frequency test skill",
    )
    # Velocity = 60 / 60 = 1.0
    # ROI = 0.10 * 0.50 * 1.0 = 0.05
    roi_low = MarksRecoveryRanker.calculate_roi_score(cand_low)
    assert abs(roi_low - 0.05) < 1e-4

    assert roi_high > roi_low


def test_recovery_ranker_ranking_order():
    """
    Verifies that rank_skills sorts candidates strictly descending by ROI.
    """
    res = recovery_ranker.rank_skills(
        course_id="course_calc_301",
        baseline_score=48,
        target_score=75,
    )
    assert isinstance(res, MarksRecoveryResponse)
    assert res.marks_gap == 27
    assert len(res.priorities) >= 3

    # Check rank ordering
    for i in range(len(res.priorities)):
        assert res.priorities[i].rank == i + 1

    # First item must be the highest ROI opportunity (bracket sign distribution)
    assert res.priorities[0].skill_id == "skill_parts_sign_expansion"
    assert res.priorities[0].recommended_modality in [ModalityType.SPOT_THE_BUG, ModalityType.VISUAL_FLOWCHART]


def test_live_recovery_map_endpoint():
    """
    Tests live GET /api/recovery/map and GET /api/recovery/{course_id} endpoints.
    """
    resp = client.get("/api/recovery/map?baseline_score=50&target_score=80")
    assert resp.status_code == 200
    data = resp.json()
    assert data["course_id"] == "course_calc_301"
    assert data["current_baseline_score"] == 50
    assert data["target_score"] == 80
    assert data["marks_gap"] == 30
    assert len(data["priorities"]) >= 3
    assert data["total_study_time_minutes"] > 0

    # Path parameter variant
    resp2 = client.get("/api/recovery/course_calc_301?baseline_score=55&target_score=70")
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["marks_gap"] == 15


def test_annotated_benchmark_cases_integrity():
    """
    Verifies the integrity of the first 5 ground-truth benchmark cases in evaluation/data/annotated_cases.json.
    """
    annotated_file = Path(__file__).resolve().parent.parent / "evaluation" / "data" / "annotated_cases.json"
    assert annotated_file.exists(), "annotated_cases.json must exist"

    with open(annotated_file, "r") as f:
        payload = json.load(f)

    assert payload["annotated_cases_count"] == 5
    cases = payload["cases"]
    assert len(cases) == 5

    case_ids = [c["case_id"] for c in cases]
    assert case_ids == ["case_calc_01", "case_calc_02", "case_calc_03", "case_calc_04", "case_calc_05"]

    for case in cases:
      assert "ground_truth_divergence_step" in case
      assert "ground_truth_error_taxonomy" in case
      assert "forensic_leak_analysis" in case
      assert "recovery_recommendation" in case
      rec = case["recovery_recommendation"]
      assert "recommended_modality" in rec
      assert "roi_score" in rec
      assert "potential_marks_recoverable" in rec
