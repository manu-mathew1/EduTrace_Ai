"""
EduTrace AI — Unit & Integration Tests: Custom Subject Creation & Dynamic Multi-Course Twin
Verifies that any student can dynamically create custom university courses and
receive an isolated, domain-tailored Bayesian Learning Twin.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_list_and_create_custom_course():
    # 1. Fetch default courses
    res = client.get("/api/courses")
    assert res.status_code == 200
    courses = res.json()
    assert len(courses) >= 2
    assert any("course_calc_301" in c["course_id"] for c in courses)

    # 2. Create a custom subject (Physics 101)
    new_course_payload = {
        "title": "Physics 101: Classical Mechanics",
        "subject_archetype": "conceptual",
        "target_score": 90,
        "current_baseline": 55,
        "target_exam_date": "2026-11-25"
    }
    create_res = client.post("/api/courses", json=new_course_payload)
    assert create_res.status_code == 201
    created_course = create_res.json()
    assert "course_physics" in created_course["course_id"] or "physics" in created_course["course_id"]
    assert created_course["target_score"] == 90
    course_id = created_course["course_id"]

    # 3. Retrieve single course
    get_res = client.get(f"/api/courses/{course_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Physics 101: Classical Mechanics"

    # 4. Verify Learning Twin dynamically generates domain-appropriate skills
    twin_res = client.get(f"/api/twin/profile?course_id={course_id}&student_id=std_rahul_99")
    assert twin_res.status_code == 200
    twin = twin_res.json()
    assert twin["course_id"] == course_id
    assert len(twin["skills"]) >= 3
    # Skills should be tailored to physics
    skill_names = [s["skill_name"] for s in twin["skills"]]
    assert any("Newton" in s or "Physics" in s or "Vector" in s or "Mechanics" in s for s in skill_names)

    # 5. Verify documents triage for brand new course starts clean (0 documents)
    triage_res = client.get(f"/api/documents/triage?course_id={course_id}")
    assert triage_res.status_code == 200
    triage = triage_res.json()
    assert triage["total_documents"] == 0
    assert triage["ready_for_intake"] is False
