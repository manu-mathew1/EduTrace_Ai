"""
EduTrace AI — Document Upload & Auto-Triage Router (Pod P2: Stage 1 Ingestion)
Handles multi-document uploads, heuristic & content-based classification,
persistence to SQLite database, and triage response generation.
"""

import os
import json
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.database import get_db
from backend.db.models import DocumentModel, CourseModel
from backend.schemas.contracts import (
    DocumentType,
    ClassifiedDocument,
    DocumentTriageResponse,
)

router = APIRouter()

MOCKS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mocks"
UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "uploads"


def classify_document(filename: str, content_sample: str = "") -> tuple[DocumentType, float, List[str], Optional[float]]:
    """
    Auto-triage classifier: determines document role based on filename tokens and content cues.
    Returns: (classified_type, confidence, topics_detected, exam_weight)
    """
    fn_lower = filename.lower()
    text_lower = content_sample.lower()

    if any(k in fn_lower for k in ["syllabus", "curriculum", "course_outline", "overview"]):
        return (
            DocumentType.SYLLABUS,
            0.98,
            ["Integration Techniques", "Partial Derivatives", "Multiple Integrals", "Vector Calculus"],
            100.0,
        )
    elif any(k in fn_lower for k in ["pyq", "exam", "paper", "midterm", "final", "test", "quiz"]):
        return (
            DocumentType.PAST_PAPER,
            0.95,
            ["Integration by Parts", "Substitution", "Differential Equations"],
            40.0,
        )
    elif any(k in fn_lower for k in ["rubric", "marking", "solution", "scheme", "answer_key"]):
        return (
            DocumentType.RUBRIC,
            0.92,
            ["Step-by-step marking", "Partial credit rules"],
            None,
        )
    elif any(k in fn_lower for k in ["notes", "slide", "lecture", "module", "chapter", "handout"]):
        return (
            DocumentType.LECTURE_NOTES,
            0.99,
            ["Integration by Parts", "Trigonometric Substitution", "Partial Fractions"],
            None,
        )
    else:
        # Content-based heuristic fallback
        if "grading criteria" in text_lower or "prerequisites" in text_lower:
            return DocumentType.SYLLABUS, 0.85, ["Course Structure"], 100.0
        elif "marks" in text_lower and ("question" in text_lower or "q1" in text_lower):
            return DocumentType.PAST_PAPER, 0.80, ["Exam Questions"], 50.0
        elif "definition" in text_lower or "theorem" in text_lower or "example" in text_lower:
            return DocumentType.LECTURE_NOTES, 0.85, ["Course Content"], None
        return DocumentType.UNKNOWN, 0.60, ["General Academic Material"], None


@router.post("/upload", response_model=DocumentTriageResponse)
async def upload_documents(
    files: List[UploadFile] = File(...),
    course_id: str = Form("course_calc_301"),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload one or multiple course documents (Syllabus, Past Papers, Lecture Notes, Rubrics).
    Auto-classifies each document and persists metadata to SQLite.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided for upload.")

    course_upload_dir = UPLOADS_DIR / course_id
    course_upload_dir.mkdir(parents=True, exist_ok=True)

    classified_docs: List[ClassifiedDocument] = []

    for file in files:
        file_bytes = await file.read()
        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        saved_path = course_upload_dir / f"{doc_id}_{file.filename}"

        # Write to disk
        with open(saved_path, "wb") as f:
            f.write(file_bytes)

        # Estimate text sample for classification
        try:
            sample_text = file_bytes[:2048].decode("utf-8", errors="ignore")
        except Exception:
            sample_text = ""

        # Estimate page count (heuristics: ~2KB per page or 1 page minimum)
        est_pages = max(1, len(file_bytes) // 2500)

        doc_type, confidence, topics, weight = classify_document(file.filename or "", sample_text)

        # Persist to database
        db_doc = DocumentModel(
            id=doc_id,
            course_id=course_id,
            filename=file.filename or "unknown_file",
            file_path=str(saved_path),
            classified_type=doc_type.value,
            confidence=confidence,
            page_count=est_pages,
            topics_detected_json=json.dumps(topics),
            exam_weight_percentage=weight,
        )
        db.add(db_doc)

        classified_docs.append(
            ClassifiedDocument(
                document_id=doc_id,
                filename=file.filename or "unknown_file",
                classified_type=doc_type,
                confidence=confidence,
                page_count=est_pages,
                topics_detected=topics,
                exam_weight_percentage=weight,
            )
        )

    await db.commit()

    return DocumentTriageResponse(
        course_id=course_id,
        documents=classified_docs,
        total_documents=len(classified_docs),
        ready_for_intake=True,
    )


@router.get("/triage", response_model=DocumentTriageResponse)
async def get_document_triage(
    course_id: str = Query("course_calc_301"),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves all auto-classified documents for a course.
    Falls back to golden mock fixture if no uploads exist yet.
    """
    stmt = select(DocumentModel).where(DocumentModel.course_id == course_id)
    result = await db.execute(stmt)
    records = result.scalars().all()

    if records:
        docs = []
        for r in records:
            topics = json.loads(r.topics_detected_json) if r.topics_detected_json else []
            docs.append(
                ClassifiedDocument(
                    document_id=r.id,
                    filename=r.filename,
                    classified_type=DocumentType(r.classified_type),
                    confidence=r.confidence,
                    page_count=r.page_count,
                    topics_detected=topics,
                    exam_weight_percentage=r.exam_weight_percentage,
                )
            )
        return DocumentTriageResponse(
            course_id=course_id,
            documents=docs,
            total_documents=len(docs),
            ready_for_intake=len(docs) >= 1,
        )

    # Golden Mock Fallback (Guarantees zero-block parallel execution)
    mock_file = MOCKS_DIR / "mock_triage.json"
    if mock_file.exists():
        with open(mock_file, "r") as f:
            return DocumentTriageResponse(**json.load(f))

    return DocumentTriageResponse(
        course_id=course_id,
        documents=[],
        total_documents=0,
        ready_for_intake=False,
    )
