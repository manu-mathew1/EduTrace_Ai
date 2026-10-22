"""
EduTrace AI — Pod P2 (Ingestion & RAG) Unit and Integration Tests (Day 2)
Tests DocumentClassifier heuristic and keyword matching, VectorStoreEngine chunking,
and live document upload endpoints.
"""

import io
from fastapi.testclient import TestClient
from backend.main import app
from backend.schemas.contracts import DocumentType
from rag.ingestion.classifier import DocumentClassifier
from rag.retrieval.vector_store import VectorStoreEngine, retrieve_relevant_citations


def test_document_classifier_heuristics():
    """Verify classification across all 4 document types."""
    # Syllabus
    dtype, conf, topics, weight, pages = DocumentClassifier.classify(
        "MATH_301_Course_Syllabus.pdf",
        "Grading policy: Midterm 40%, Final 60%. Prerequisites and curriculum outline."
    )
    assert dtype == DocumentType.SYLLABUS
    assert conf >= 0.85
    assert weight == 100.0

    # Past Paper
    dtype, conf, topics, weight, pages = DocumentClassifier.classify(
        "Midterm_Exam_Paper_2024.pdf",
        "Maximum Marks: 50. Question 1: Evaluate the integral by parts."
    )
    assert dtype == DocumentType.PAST_PAPER
    assert conf >= 0.80

    # Lecture Notes
    dtype, conf, topics, weight, pages = DocumentClassifier.classify(
        "Module2_Lecture_Notes_Kapoor.pdf",
        "Theorem: Integration by parts rule. Definition and worked examples."
    )
    assert dtype == DocumentType.LECTURE_NOTES
    assert conf >= 0.85


def test_vector_store_indexing_and_citation():
    """Verify chunking and citation retrieval."""
    engine = VectorStoreEngine()
    test_doc = """
    ## Slide 10
    Introduction to partial derivatives and directional gradients.
    ## Slide 19
    Pitfall Alert: When repeating integration by parts, always enclose the entire second iteration in brackets before distributing the outer minus sign.
    """
    chunks_count = engine.index_document(
        doc_id="test_doc_01",
        course_id="course_calc_301",
        filename="lecture_test.txt",
        content=test_doc,
    )
    assert chunks_count >= 1

    # Search for citation
    results = engine.search("Why did I get a minus sign error in integration by parts?", course_id="course_calc_301")
    assert len(results) >= 1
    top = results[0]
    assert "bracket" in top["quote"].lower() or "minus" in top["quote"].lower()


def test_live_document_upload_endpoints():
    """Verify live upload endpoints with multipart file data."""
    with TestClient(app) as client:
        # Test /api/documents/upload
        sample_file = io.BytesIO(b"# Syllabus\nCourse outline: Math 301. Grading policy.")
        files = [("files", ("Calculus_Syllabus.txt", sample_file, "text/plain"))]
        data = {"course_id": "course_calc_301"}

        res = client.post("/api/documents/upload", files=files, data=data)
        assert res.status_code == 200
        res_json = res.json()
        assert res_json["ready_for_intake"] is True
        assert len(res_json["documents"]) >= 1
        assert res_json["documents"][0]["classified_type"] == "syllabus"

        # Test /api/courses/{course_id}/documents/upload (Task 2.5)
        sample_notes = io.BytesIO(b"## Slide 1\nLecture Notes on Integration Techniques.")
        notes_files = [("files", ("Lecture_Notes_Module1.txt", sample_notes, "text/plain"))]
        res2 = client.post("/api/documents/courses/course_calc_301/documents/upload", files=notes_files)
        assert res2.status_code == 200
        res2_json = res2.json()
        assert len(res2_json["documents"]) >= 1
