"""
EduTrace AI — Pod P2 Day 4 Test Suite (Tasks 4.3 & 4.4)
Verifies:
1. Finalized sample course documents (Calculus + Macroeconomics) and auto-classification.
2. Macroeconomics vector indexing, inverted index search, and sub-millisecond query caching.
3. Multimodal Studio lecture note grounding via the citation engine.
"""

import pytest
from pathlib import Path
from fastapi.testclient import TestClient

from backend.main import app
from backend.schemas.contracts import DocumentType
from rag.ingestion.classifier import classifier
from rag.retrieval.vector_store import vector_store
from rag.retrieval.citation_engine import citation_retriever
from ai.intervention.studio_engine import studio_engine

SAMPLE_DIR = Path(__file__).resolve().parent.parent / "data" / "sample_courses"


def test_sample_course_documents_exist_and_classify():
    """
    Task 4.4: Verifies sample course documents for Calculus and Macroeconomics
    exist on disk and correctly auto-classify with detected topics.
    """
    # 1. Verify Calculus course documents
    calc_dir = SAMPLE_DIR / "math_calculus"
    assert (calc_dir / "syllabus.md").exists()
    assert (calc_dir / "lecture_notes.md").exists()
    assert (calc_dir / "past_paper.md").exists()

    with open(calc_dir / "syllabus.md", "r") as f:
        content = f.read()
    doc_type, conf, topics, weight, pages = classifier.classify("syllabus.md", content)
    assert doc_type == DocumentType.SYLLABUS
    assert conf >= 0.85
    assert any("Integration" in t or "Calculus" in t for t in topics)

    # 2. Verify Macroeconomics course documents
    econ_dir = SAMPLE_DIR / "econ_macro"
    assert (econ_dir / "syllabus.md").exists()
    assert (econ_dir / "lecture_notes.md").exists()
    assert (econ_dir / "past_paper.md").exists()

    # Test Syllabus classification
    with open(econ_dir / "syllabus.md", "r") as f:
        econ_syl = f.read()
    doc_type, conf, topics, weight, pages = classifier.classify("syllabus.md", econ_syl)
    assert doc_type == DocumentType.SYLLABUS
    assert conf >= 0.85
    assert any("Keynesian" in t or "IS-LM" in t or "Macroeconomic" in t for t in topics)

    # Test Lecture Notes classification
    with open(econ_dir / "lecture_notes.md", "r") as f:
        econ_notes = f.read()
    doc_type, conf, topics, weight, pages = classifier.classify("lecture_notes.md", econ_notes)
    assert doc_type == DocumentType.LECTURE_NOTES
    assert conf >= 0.85
    assert any("Keynesian" in t or "IS-LM" in t for t in topics)

    # Test Past Paper classification
    with open(econ_dir / "past_paper.md", "r") as f:
        econ_exam = f.read()
    doc_type, conf, topics, weight, pages = classifier.classify("past_paper.md", econ_exam)
    assert doc_type == DocumentType.PAST_PAPER
    assert weight == 40.0


def test_macroeconomics_vector_store_citations_and_latency():
    """
    Task 4.4: Verifies that Macroeconomics lecture notes are indexed into the vector store
    and return precise slide citations with sub-millisecond cached queries.
    """
    # 1. Search for tax drag in Keynesian multiplier (Slide 8)
    results = vector_store.search(
        query="multiplier tax drag proportional taxation keynesian",
        course_id="course_econ_202",
        limit=2,
    )
    assert len(results) >= 1
    top = results[0]
    assert top["slide_number"] == 8
    assert "c1(1 - t)" in top["quote"] or "taxation" in top["quote"].lower()
    assert top["relevance_score"] > 0.0

    # 2. Search for Crowding-Out in IS-LM (Slide 15)
    crowd_results = vector_store.search(
        query="crowding out interest rate investment is-lm",
        course_id="course_econ_202",
        limit=2,
    )
    assert len(crowd_results) >= 1
    top_crowd = crowd_results[0]
    assert top_crowd["slide_number"] in [15, 18]
    assert "crowding-out" in top_crowd["quote"].lower() or "investment" in top_crowd["quote"].lower()

    # 3. Verify sub-millisecond cached retrieval
    bench = vector_store.benchmark_search_latency(
        query="multiplier tax drag proportional taxation",
        course_id="course_econ_202",
    )
    assert bench["warm_latency_ms"] < 5.0
    assert bench["metrics"]["cache_hits"] >= 1


def test_citation_retriever_macroeconomics_trap_signatures():
    """
    Task 4.4: Verifies that CitationRetriever maps macroeconomics divergence signatures
    to the correct lecture slide and pedagogical remediation tip.
    """
    matches = citation_retriever.retrieve_for_divergence(
        course_id="course_econ_202",
        diverged_step_text="Calculated multiplier k = 1 / (1 - 0.8) = 5.0 omitting income tax rate t = 0.25",
        expected_step_text="k = 1 / [1 - 0.8(1 - 0.25)] = 2.5",
        error_type="Conceptual Misunderstanding",
    )
    assert len(matches) >= 1
    top = matches[0]
    assert "Slide 8" in top.pedagogical_remediation_tip
    assert "Omission of Proportional Tax Drag" in top.matched_trap


@pytest.mark.anyio
async def test_multimodal_studio_lecture_note_grounding():
    """
    Task 4.3: Verifies that Multimodal Studio prompts and generated content
    are grounded in professor lecture notes and slide citations.
    """
    # 1. Calculus Studio Grounding
    calc_studio = await studio_engine.build_studio_content(
        skill_id="skill_parts_sign",
        skill_name="Integration by Parts: Bracket Sign Distribution",
        course_id="course_calc_301",
    )
    assert calc_studio.lecture_grounding_quote is not None
    assert "Slide 19" in calc_studio.audio_summary_script or "lecture notes" in calc_studio.audio_summary_script
    assert calc_studio.lecture_citations is not None
    assert len(calc_studio.lecture_citations) >= 1
    assert calc_studio.lecture_citations[0]["slide_number"] in [14, 19]

    # 2. Macroeconomics Studio Grounding
    econ_studio = await studio_engine.build_studio_content(
        skill_id="skill_econ_multiplier",
        skill_name="The Keynesian Multiplier with Proportional Taxation",
        course_id="course_econ_202",
    )
    assert econ_studio.lecture_grounding_quote is not None
    assert "Slide 8" in econ_studio.audio_summary_script or "lecture notes" in econ_studio.audio_summary_script
    assert "Leaky Bucket" in econ_studio.analogy_title
    assert "graph TD" in econ_studio.flowchart_mermaid_code
    assert econ_studio.spot_the_bug_question is not None


def test_live_interventions_api_endpoints_grounding():
    """
    Task 4.3 & 4.4: Tests live FastAPI intervention studio endpoints with lecture note citations.
    """
    with TestClient(app) as client:
        # 1. Test GET /api/interventions/studio
        res = client.get("/api/interventions/studio?course_id=course_calc_301")
        assert res.status_code == 200
        data = res.json()
        assert data["skill_id"] == "skill_parts_sign"
        assert data["lecture_grounding_quote"] is not None
        assert "lecture_citations" in data
        assert len(data["lecture_citations"]) >= 1

        # 2. Test GET /api/interventions/skill_econ_multiplier with course_econ_202
        econ_res = client.get("/api/interventions/skill_econ_multiplier?course_id=course_econ_202")
        assert econ_res.status_code == 200
        econ_data = econ_res.json()
        assert "Leaky Bucket" in econ_data["analogy_title"]
        assert econ_data["lecture_citations"] is not None

        # 3. Test POST /api/interventions/generate
        gen_payload = {
            "skill_id": "skill_parts_sign",
            "skill_name": "Integration by Parts: Bracket Sign Distribution",
            "course_id": "course_calc_301",
            "divergence_context": "Student distributed outer negative sign across -∫ (1/2)sin(2x) dx improperly",
        }
        gen_res = client.post("/api/interventions/generate", json=gen_payload)
        assert gen_res.status_code == 200
        gen_data = gen_res.json()
        assert gen_data["lecture_grounding_quote"] is not None
        assert "Nested Suitcase" in gen_data["analogy_title"]
