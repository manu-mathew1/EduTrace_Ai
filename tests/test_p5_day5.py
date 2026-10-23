"""
EduTrace AI — Pod P5 Day 5 Test Suite (Tasks 5.7 & 5.8)
Verifies:
1. 15-case benchmark evaluation runner executes with ≥80% localization accuracy and ≥75% taxonomy Macro-F1.
2. Automated export of benchmark JSON report and Markdown charts (evaluation/results/BENCHMARK_CHART.md).
3. Live API endpoint (GET /api/recovery/benchmark/metrics) returns empirical metrics for demo walkthrough.
4. Backup demo walkthrough script (docs/pitch/BACKUP_DEMO_WALKTHROUGH.md) and pitch assets integrity.
"""

import os
import json
import asyncio
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

from backend.main import app
from evaluation.runner import benchmark_runner

PITCH_DIR = Path(__file__).resolve().parent.parent / "docs" / "pitch"
RESULTS_DIR = Path(__file__).resolve().parent.parent / "evaluation" / "results"


@pytest.fixture
def client():
    return TestClient(app)


def test_15_case_benchmark_evaluation_metrics():
    """
    Task 5.7: Verifies that the benchmark runner evaluates all 15 cases
    and meets or exceeds the hackathon accuracy targets.
    """
    res = asyncio.run(benchmark_runner.run_evaluation())

    assert res["status"] == "success"
    assert res["total_cases_evaluated"] == 15
    assert res["divergence_localization_accuracy"] >= 0.80, "Localization accuracy fell below 80% target!"
    assert res["taxonomy_macro_f1"] >= 0.75, "Taxonomy Macro-F1 fell below 75% target!"
    assert res["marks_estimation_mae"] <= 1.0
    assert res["target_thresholds_met"] is True
    assert len(res["case_results"]) == 15


def test_benchmark_export_reports():
    """
    Task 5.7: Verifies automated export of benchmark_report.json,
    BENCHMARK_CHART.md, and pitch slide metrics.
    """
    res = asyncio.run(benchmark_runner.export_reports())
    assert res["status"] == "success"

    # 1. Check benchmark_report.json
    report_json_path = RESULTS_DIR / "benchmark_report.json"
    assert report_json_path.exists()
    with open(report_json_path) as f:
        data = json.load(f)
        assert data["total_cases_evaluated"] == 15
        assert data["divergence_localization_accuracy"] == 1.0
        assert data["taxonomy_macro_f1"] >= 0.95

    # 2. Check BENCHMARK_CHART.md
    chart_path = RESULTS_DIR / "BENCHMARK_CHART.md"
    assert chart_path.exists()
    chart_content = chart_path.read_text()
    assert "100.0%" in chart_content
    assert "97.7%" in chart_content
    assert "case_calc_01" in chart_content
    assert "case_calc_15" in chart_content

    # 3. Check EVALUATION_METRICS.md
    metrics_path = PITCH_DIR / "EVALUATION_METRICS.md"
    assert metrics_path.exists()
    metrics_content = metrics_path.read_text()
    assert "100.0%" in metrics_content
    assert "97.7%" in metrics_content


def test_api_benchmark_metrics_endpoint(client):
    """
    Task 5.7: Verifies GET /api/recovery/benchmark/metrics returns
    evaluation statistics for the live presentation frontend.
    """
    response = client.get("/api/recovery/benchmark/metrics")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert data["total_cases_evaluated"] == 15
    assert data["divergence_localization_accuracy"] == 1.0
    assert data["taxonomy_macro_f1"] >= 0.95
    assert data["marks_estimation_mae"] == 0.0


def test_backup_demo_walkthrough_assets():
    """
    Task 5.8: Verifies backup demo video walkthrough script and pitch deck assets exist.
    """
    walkthrough_path = PITCH_DIR / "BACKUP_DEMO_WALKTHROUGH.md"
    assert walkthrough_path.exists()
    walkthrough_text = walkthrough_path.read_text()

    assert "Act I" in walkthrough_text
    assert "Act II" in walkthrough_text
    assert "Act III" in walkthrough_text
    assert "Act IV" in walkthrough_text
    assert "Act V" in walkthrough_text
    assert "180 seconds" in walkthrough_text
    assert "Slide 19" in walkthrough_text

    # Pitch script & Slide deck
    assert (PITCH_DIR / "DEMO_PITCH_SCRIPT.md").exists()
    assert (PITCH_DIR / "SLIDE_DECK.md").exists()
