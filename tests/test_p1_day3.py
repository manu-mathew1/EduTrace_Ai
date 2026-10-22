"""
EduTrace AI — Day 3 Pod P1: Core Systems & Integration Test Suite
Verifies:
1. Task 3.1: Uploaded course documents feed topics directly into Stage 2 Diagnostic Probe.
2. Task 3.2: Full Course Database persistence (CRUD + Seeding + Lifespan).
"""

import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from backend.main import app
from backend.db.database import AsyncSessionLocal
from backend.db.models import CourseModel, DocumentModel, IntakeSessionModel


client = TestClient(app)


def test_course_seeding_and_list_persistence():
    """
    Task 3.2: Verifies courses endpoint lists seeded default courses from SQLite.
    """
    resp = client.get("/api/courses")
    assert resp.status_code == 200
    courses = resp.json()
    assert len(courses) >= 2

    course_ids = [c["course_id"] for c in courses]
    assert "course_calc_301" in course_ids
    assert "course_cs_210" in course_ids

    calc_course = next(c for c in courses if c["course_id"] == "course_calc_301")
    assert calc_course["title"] == "Calculus III: Multivariable & Advanced Integration"
    assert calc_course["target_score"] == 75
    assert calc_course["current_baseline"] == 50


def test_course_crud_lifecycle():
    """
    Task 3.2: Verifies Create, Read, Update, and Delete on persistent courses.
    """
    # 1. Create Course
    create_payload = {
        "title": "PHYS 201: Classical Mechanics",
        "subject_archetype": "procedural",
        "target_score": 80,
        "current_baseline": 55,
        "target_exam_date": "2026-11-15",
    }
    create_resp = client.post("/api/courses", json=create_payload)
    assert create_resp.status_code == 201
    created = create_resp.json()
    new_id = created["course_id"]
    assert "phys_201" in new_id
    assert created["target_score"] == 80

    # 2. Read Course by ID
    get_resp = client.get(f"/api/courses/{new_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["course_id"] == new_id

    # 3. Update Course
    update_payload = {
        "target_score": 90,
        "current_baseline": 62,
    }
    put_resp = client.put(f"/api/courses/{new_id}", json=update_payload)
    assert put_resp.status_code == 200
    updated = put_resp.json()
    assert updated["target_score"] == 90
    assert updated["current_baseline"] == 62

    # 4. Delete Course
    del_resp = client.delete(f"/api/courses/{new_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "deleted"

    # Confirm 404 after deletion
    get_after_del = client.get(f"/api/courses/{new_id}")
    assert get_after_del.status_code == 404


@pytest.mark.anyio
async def test_uploaded_documents_feed_into_stage2_diagnostic_probe():
    """
    Task 3.1: Verifies that topics extracted from uploaded syllabus & notes
    feed directly into Stage 2 Diagnostic Probe generation.
    """
    test_course_id = "course_test_integration_flow"

    # Create test course and insert uploaded document with detected topics
    async with AsyncSessionLocal() as session:
        # 1. Ensure test course exists
        existing = await session.execute(select(CourseModel).where(CourseModel.id == test_course_id))
        if not existing.scalars().first():
            course = CourseModel(
                id=test_course_id,
                title="Advanced Analytical Calculus",
                subject_archetype="procedural",
                target_score=85,
                current_baseline=50,
                target_exam_date="2026-10-30",
            )
            session.add(course)

        # 2. Add an uploaded document representing a syllabus with specific topics
        doc = DocumentModel(
            id="doc_uploaded_syllabus_01",
            course_id=test_course_id,
            filename="Syllabus_2026_Advanced_Calc.pdf",
            classified_type="syllabus",
            confidence=0.98,
            page_count=5,
            topics_detected_json=json.dumps([
                "Integration by Parts",
                "Differential Equations",
                "Substitution Technique",
            ]),
            exam_weight_percentage=100.0,
        )
        session.add(doc)
        await session.commit()

    # 3. Request Diagnostic Probe for this course via HTTP API
    probe_resp = client.get(f"/api/intake/probe?course_id={test_course_id}")
    assert probe_resp.status_code == 200
    probe_data = probe_resp.json()

    # Verify that the probe recognized uploaded document topics
    assert probe_data["course_id"] == test_course_id
    assert probe_data["calibration_source"] == "uploaded_course_documents"
    assert "Integration by Parts" in probe_data["calibrated_topics"]
    assert "Differential Equations" in probe_data["calibrated_topics"]

    # Verify questions match the uploaded topics
    question_skills = [q["target_skill"] for q in probe_data["questions"]]
    assert any("Integration by Parts" in s for s in question_skills)
    assert any("Differential" in s or "ODE" in s for s in question_skills)

    # Clean up test course and documents
    async with AsyncSessionLocal() as session:
        doc_record = await session.execute(select(DocumentModel).where(DocumentModel.id == "doc_uploaded_syllabus_01"))
        d = doc_record.scalars().first()
        if d:
            await session.delete(d)
        course_record = await session.execute(select(CourseModel).where(CourseModel.id == test_course_id))
        c = course_record.scalars().first()
        if c:
            await session.delete(c)
        await session.commit()
