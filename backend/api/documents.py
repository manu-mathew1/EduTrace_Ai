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
from rag.ingestion.classifier import classifier
from rag.retrieval.vector_store import vector_store
from rag.retrieval.citation_engine import citation_retriever

router = APIRouter()

MOCKS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mocks"
UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "uploads"


def classify_document(filename: str, content_sample: str = "", file_bytes_len: int = 0) -> tuple[DocumentType, float, List[str], Optional[float], int]:
    """Routes through the central DocumentClassifier (Task 2.3)."""
    return classifier.classify(filename=filename, content=content_sample, file_bytes_len=file_bytes_len)


async def _process_document_uploads(
    files: List[UploadFile],
    course_id: str,
    db: AsyncSession,
) -> DocumentTriageResponse:
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

        # Estimate text sample for classification and indexing
        try:
            sample_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            sample_text = ""

        doc_type, confidence, topics, weight, est_pages = classify_document(
            file.filename or "",
            sample_text,
            len(file_bytes)
        )

        # Index into vector store for RAG citation retrieval (Task 2.4)
        if sample_text:
            vector_store.index_document(
                doc_id=doc_id,
                course_id=course_id,
                filename=file.filename or "uploaded_doc",
                content=sample_text,
            )

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


@router.post("/upload", response_model=DocumentTriageResponse)
async def upload_documents(
    files: List[UploadFile] = File(...),
    course_id: str = Form("course_calc_301"),
    db: AsyncSession = Depends(get_db),
):
    """Upload documents with course_id in Form body."""
    return await _process_document_uploads(files=files, course_id=course_id, db=db)


@router.post("/courses/{course_id}/documents/upload", response_model=DocumentTriageResponse)
async def upload_course_documents(
    course_id: str,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload documents with course_id in URL path (Task 2.5)."""
    return await _process_document_uploads(files=files, course_id=course_id, db=db)


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


@router.get("/citations")
async def get_citations(
    course_id: str = Query("course_calc_301"),
    query: str = Query(..., description="Topic or step text to find relevant lecture slide citations"),
    limit: int = Query(3, ge=1, le=10),
):
    """
    RAG Citation Retriever endpoint (Task 3.3):
    Extracts slide/page quotes grounded in course notes.
    """
    matches = citation_retriever.retrieve_citations(course_id=course_id, topic=query, limit=limit)
    return [m.to_dict() for m in matches]


@router.get("/slides")
async def get_document_slides(
    course_id: str = Query("course_calc_301"),
    doc_id: Optional[str] = Query(None),
):
    """
    RAG Slide Inspection endpoint (Task 5.4):
    Returns indexed slides with exact slide numbers, topic badges, quotes, and trap warnings.
    Instant latency verification for live demo walkthroughs.
    """
    slides = citation_retriever.get_annotated_slides(course_id=course_id, doc_id=doc_id)
    return {
        "course_id": course_id,
        "total_slides": len(slides),
        "slides": slides,
    }


@router.get("/metrics")
async def get_rag_metrics():
    """
    Returns RAG search latency and cache performance statistics (Task 3.4).
    """
    return citation_retriever.get_metrics()

