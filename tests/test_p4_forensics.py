"""
EduTrace AI — Pod P4 (Forensics & Error Taxonomy) Unit & Integration Tests (Day 2)
Tests step-divergence detection, cognitive taxonomy classification,
and live /api/submissions/analyze endpoint.
"""

import asyncio
from fastapi.testclient import TestClient
from backend.main import app
from ai.forensics.divergence_detector import DivergenceDetector
from ai.forensics.taxonomy_classifier import ErrorTaxonomyClassifier
from backend.schemas.contracts import ErrorTaxonomy


def test_divergence_detector():
    """Verify localization of first divergence and classification."""
    student_work = (
        "u = x^2, dv = cos(x)dx => du = 2x dx, v = sin(x)\n"
        "= x^2 sin(x) - \\int 2x sin(x) dx\n"
        "= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]\n"
        "= x^2 sin(x) + 2x cos(x) - 2sin(x)"
    )
    rubric = [
        "Identify parts correctly",
        "Apply integration by parts formula",
        "Perform second iteration with outer minus distributed",
        "Final simplified antiderivative with + C",
    ]

    res = asyncio.run(
        DivergenceDetector.detect_divergence(
            submission_id="sub_test_01",
            question_id="q3",
            submitted_work=student_work,
            rubric_steps=rubric,
        )
    )
    assert res.first_divergence_step == 3
    assert res.primary_error_type == ErrorTaxonomy.PROCEDURAL_CALCULATION
    assert res.estimated_marks_obtained > 0


def test_error_taxonomy_classification():
    """Verify taxonomy tagging across error categories."""
    # Procedural sign flip
    tax1, conf1, exp1 = ErrorTaxonomyClassifier.classify_divergence(
        diverged_step_text="= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]",
        expected_rubric_text="Apply uv - \\int v du with outer negative distributed cleanly",
        divergence_context="Minus sign distributed incorrectly across inner brackets",
    )
    assert tax1 == ErrorTaxonomy.PROCEDURAL_CALCULATION
    assert conf1 >= 0.85

    # Conceptual discontinuity
    tax2, conf2, exp2 = ErrorTaxonomyClassifier.classify_divergence(
        diverged_step_text="[-1/x] from -1 to 1 = -2",
        expected_rubric_text="Identify essential infinite discontinuity at x=0; improper integral diverges",
        divergence_context="Domain discontinuity ignored",
    )
    assert tax2 == ErrorTaxonomy.CONCEPTUAL_MISUNDERSTANDING
    assert conf2 >= 0.85

    # Rubric omission (+C)
    tax3, conf3, exp3 = ErrorTaxonomyClassifier.classify_divergence(
        diverged_step_text="= x e^x - e^x",
        expected_rubric_text="Final antiderivative: x e^x - e^x + C",
        divergence_context="Missing + C",
    )
    assert tax3 == ErrorTaxonomy.RUBRIC_OMISSION
    assert conf3 >= 0.85


def test_live_submissions_analyze_endpoint():
    """Verify POST /api/submissions/analyze endpoint."""
    with TestClient(app) as client:
        payload = {
            "submission_id": "sub_live_test_01",
            "course_id": "course_calc_301",
            "question_id": "q3_parts",
            "submitted_work": "u = x^2, dv = cos(x)dx\n= x^2 sin(x) - 2x sin(x)\n= x^2 sin(x) + 2x cos(x) - 2sin(x)",
        }
        res = client.post("/api/submissions/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "steps" in data
        assert data["first_divergence_step"] is not None
        assert data["primary_error_type"] is not None
