"""
EduTrace AI — Day 3 Pod P2: Ingestion & RAG Citation Test Suite
Verifies:
1. Task 3.3: RAG Citation Retriever (rag/retrieval/citation_engine.py) extracting exact slide quotes and tips for diverged steps.
2. Task 3.4: Inverted index and LRU query caching performance and latency optimization.
"""

import time
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from rag.retrieval.citation_engine import (
    CitationRetriever,
    citation_retriever,
    retrieve_relevant_citations,
    CitationMatch,
)
from rag.retrieval.vector_store import vector_store

client = TestClient(app)


def test_rag_citation_retriever_for_divergence():
    """
    Task 3.3: Verifies that citation retriever extracts the exact lecture note
    slides and pedagogical remediation tips based on the student's mathematical divergence.
    """
    # 1. Bracket sign inversion in repeated integration by parts
    bracket_citations = citation_retriever.retrieve_for_divergence(
        course_id="course_calc_301",
        diverged_step_text="= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]",
        expected_step_text="Apply uv - \\int v du with outer negative distributed cleanly",
        error_type="procedural_calculation",
    )
    assert len(bracket_citations) >= 1
    top_cit = bracket_citations[0]
    assert isinstance(top_cit, CitationMatch)
    assert top_cit.slide_number == 19
    assert "Slide 19" in top_cit.pedagogical_remediation_tip
    assert "brackets" in top_cit.quote.lower()

    # 2. Impulsive substitution on 1/(1+x^2)
    sub_citations = citation_retriever.retrieve_for_divergence(
        course_id="course_calc_301",
        diverged_step_text="Let u = 1 + x^2 => du = 2x dx",
        expected_step_text="Recognize standard derivative d/dx(arctan(x)) = 1/(1+x^2)",
        error_type="method_selection",
    )
    assert len(sub_citations) >= 1
    sub_top = sub_citations[0]
    assert sub_top.slide_number == 17
    assert "Slide 17" in sub_top.pedagogical_remediation_tip

    # 3. Leading coefficient normalization in linear ODE
    ode_citations = citation_retriever.retrieve_for_divergence(
        course_id="course_calc_301",
        diverged_step_text="P(x) = 1, I(x) = e^{\\int 1 dx} = e^x",
        expected_step_text="Divide by 2x to put into standard form: y' + (1/(2x))y = (1/2)x^2",
        error_type="method_selection",
    )
    assert len(ode_citations) >= 1
    ode_top = ode_citations[0]
    assert ode_top.slide_number == 22
    assert "Slide 22" in ode_top.pedagogical_remediation_tip


def test_thread004_citation_contract():
    """
    Verifies that retrieve_relevant_citations meets the exact function signature
    and output schema requested by P4 in UPDATES.md Thread #004.
    """
    results = retrieve_relevant_citations(
        course_id="course_calc_301",
        topic="repeated integration by parts sign distribution",
        limit=2,
    )
    assert isinstance(results, list)
    assert len(results) >= 1

    first = results[0]
    assert "title" in first
    assert "slide_number" in first
    assert "page_number" in first
    assert "quote" in first


def test_vector_search_latency_and_caching():
    """
    Task 3.4: Verifies sub-millisecond cached search latency and LRU cache metrics.
    """
    query = "integration by parts bracket pitfall"
    course_id = "course_calc_301"

    # Reset cache to test cold vs warm latency
    vector_store.cache.invalidate(course_id)

    # 1. Cold search
    t0 = time.perf_counter()
    cold_results = vector_store.search(query=query, course_id=course_id)
    cold_latency_ms = (time.perf_counter() - t0) * 1000.0
    assert len(cold_results) > 0

    # 2. Warm search (sub-millisecond cached)
    t1 = time.perf_counter()
    warm_results = vector_store.search(query=query, course_id=course_id)
    warm_latency_ms = (time.perf_counter() - t1) * 1000.0

    assert cold_results == warm_results
    assert warm_latency_ms < 5.0  # Typically < 0.2ms

    # Check metrics
    metrics = vector_store.cache.get_metrics()
    assert metrics["cache_hits"] >= 1
    assert metrics["hit_ratio"] > 0.0


def test_live_documents_citation_and_metrics_endpoints():
    """
    Tests live GET /api/documents/citations and GET /api/documents/metrics HTTP endpoints.
    """
    # 1. Test citations endpoint
    resp = client.get("/api/documents/citations?course_id=course_calc_301&query=bracket+sign+inversion")
    assert resp.status_code == 200
    citations = resp.json()
    assert len(citations) >= 1
    assert any("Kapoor" in c["title"] for c in citations)

    # 2. Test metrics endpoint
    m_resp = client.get("/api/documents/metrics")
    assert m_resp.status_code == 200
    metrics = m_resp.json()
    assert "cache_hits" in metrics
    assert "total_queries" in metrics
