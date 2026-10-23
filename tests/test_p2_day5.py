"""
EduTrace AI — Pod P2 Day 5 Test Suite (Task 5.4)
Verifies:
1. Document triage endpoint returns valid classified documents with accurate page/slide counts and confidence scores.
2. Slide inspection endpoint (GET /api/documents/slides) returns exact slide numbers, topic badges, and verbatim lecture quotes.
3. Instant Slide 19 retrieval for Calculus III demo walkthrough with pitfall alert and remediation tip.
4. Macroeconomics Slide 8 & Slide 15 retrieval for secondary demo scenario.
5. Sub-50ms citation retrieval latency guarantee for live stage presentation.
"""

import time
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from rag.retrieval.vector_store import vector_store
from rag.retrieval.citation_engine import citation_retriever


@pytest.fixture
def client():
    return TestClient(app)


def test_document_triage_badges_and_counts(client):
    """
    Task 5.4: Verifies that document triage returns all expected documents
    with valid types, high confidence, and correct page counts.
    """
    response = client.get("/api/documents/triage?course_id=course_calc_301")
    assert response.status_code == 200
    data = response.json()

    assert data["course_id"] == "course_calc_301"
    assert data["total_documents"] >= 3
    assert data["ready_for_intake"] is True

    filenames = [d["filename"] for d in data["documents"]]
    assert any("Syllabus" in f for f in filenames)
    assert any("IntegrationNotes" in f or "Lecture" in f for f in filenames)
    assert any("Midterm" in f or "Paper" in f for f in filenames)

    for doc in data["documents"]:
        assert doc["confidence"] >= 0.85
        assert doc["page_count"] > 0
        assert len(doc["topics_detected"]) > 0


def test_instant_slide_endpoint_calc301(client):
    """
    Task 5.4: Verifies GET /api/documents/slides returns all 5 indexed lecture
    slides for Calculus III with exact slide numbers and trap signatures.
    """
    response = client.get("/api/documents/slides?course_id=course_calc_301")
    assert response.status_code == 200
    data = response.json()

    assert data["course_id"] == "course_calc_301"
    slides = data["slides"]
    assert len(slides) >= 5

    # Check Slide 19 specifically (The critical repeated by-parts demo trap)
    slide_19 = next((s for s in slides if s["slide_number"] == 19), None)
    assert slide_19 is not None
    assert "Kapoor" in slide_19["title"]
    assert "brackets before distributing" in slide_19["quote"]
    assert "Bracket" in slide_19["matched_trap"] or "Minus" in slide_19["matched_trap"]
    assert "Review Slide 19" in slide_19["pedagogical_remediation_tip"]

    # Verify other required slides exist
    slide_nums = {s["slide_number"] for s in slides}
    assert {14, 17, 19, 22, 25}.issubset(slide_nums)


def test_instant_slide_endpoint_econ202(client):
    """
    Task 5.4: Verifies GET /api/documents/slides returns Macroeconomics
    slides (Slide 8, Slide 15, Slide 18, Slide 24).
    """
    response = client.get("/api/documents/slides?course_id=course_econ_202")
    assert response.status_code == 200
    data = response.json()

    slides = data["slides"]
    assert len(slides) >= 3

    slide_nums = {s["slide_number"] for s in slides}
    assert 8 in slide_nums  # Keynesian Multiplier
    assert 15 in slide_nums  # IS-LM Crowding Out

    # Check Slide 8 content
    slide_8 = next(s for s in slides if s["slide_number"] == 8)
    assert "Multiplier" in slide_8["quote"]
    assert "Proportional Taxation" in slide_8["quote"]


def test_slide_citation_latency_under_50ms(client):
    """
    Task 5.4: Verifies sub-50ms citation retrieval latency guarantee
    during repeated demo queries.
    """
    query = "integration by parts repeated bracket minus sign pitfall"

    latencies = []
    for _ in range(5):
        t0 = time.perf_counter()
        res = client.get(f"/api/documents/citations?course_id=course_calc_301&query={query}&limit=1")
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        latencies.append(elapsed_ms)
        assert res.status_code == 200

        data = res.json()
        assert len(data) >= 1
        assert data[0]["slide_number"] == 19

    avg_latency = sum(latencies) / len(latencies)
    assert avg_latency < 50.0, f"Average latency {avg_latency}ms exceeded 50ms budget!"


def test_citation_engine_annotated_slides():
    """
    Task 5.4: Unit test verifying direct citation engine annotated slide generation.
    """
    slides = citation_retriever.get_annotated_slides("course_calc_301")
    assert len(slides) >= 5

    for s in slides:
        assert isinstance(s["slide_number"], int)
        assert len(s["quote"]) > 20
        assert "matched_trap" in s
        assert "pedagogical_remediation_tip" in s
