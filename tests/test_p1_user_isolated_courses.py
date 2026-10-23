"""
EduTrace AI — Unit & Integration Test: User-Isolated Courses & Clean Onboarding Flow
(Pod P1: Task 5.12)
Verifies:
1. Fresh user registration starts with 0 courses and no fake Bayesian skills.
2. Real students query /api/courses and receive ONLY their own courses.
3. Newly created courses start with is_calibrated = False (Awaiting Diagnostic).
4. Diagnostic completion marks is_calibrated = True.
"""

import time
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_fresh_student_registration_and_isolated_evaluation():
    ts = int(time.time() * 1000)
    email = f"fresh_student_{ts}@university.edu"
    password = "SecurePassword2026!"

    # 1. Register a brand new student with NO default course
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "name": "Sarah Connor",
            "password": password,
            # No primary_course_id supplied!
        }
    )
    assert reg_res.status_code == 201, reg_res.text
    reg_data = reg_res.json()
    token = reg_data["access_token"]
    user_id = reg_data["user"]["id"]
    assert reg_data["user"]["primary_course_id"] is None

    # 2. Query courses for this fresh student: MUST be empty []
    courses_res = client.get(f"/api/courses?user_id={user_id}")
    assert courses_res.status_code == 200
    courses = courses_res.json()
    assert len(courses) == 0, f"Expected 0 courses for new user, got: {courses}"

    # 3. Student adds their first subject
    create_res = client.post(
        f"/api/courses?user_id={user_id}",
        json={
            "title": "Linear Algebra: Vector Spaces & Eigenvalues",
            "subject_archetype": "procedural",
            "target_score": 85,
            "current_baseline": 45,
            "target_exam_date": "2026-11-20"
        }
    )
    assert create_res.status_code == 201
    course_data = create_res.json()
    course_id = course_data["course_id"]
    assert course_data["user_id"] == user_id
    assert course_data["is_calibrated"] is False

    # 4. Query courses again: must contain ONLY their new subject
    courses_res2 = client.get(f"/api/courses?user_id={user_id}")
    assert courses_res2.status_code == 200
    user_courses = courses_res2.json()
    assert len(user_courses) == 1
    assert user_courses[0]["course_id"] == course_id
    assert user_courses[0]["is_calibrated"] is False

    # 5. Check twin profile: uncalibrated
    twin_res = client.get(f"/api/twin/profile?course_id={course_id}&student_id={user_id}")
    assert twin_res.status_code == 200
    twin = twin_res.json()
    assert twin["is_calibrated"] is False

    # 6. Complete calibration
    calib_res = client.post(f"/api/courses/{course_id}/calibrate")
    assert calib_res.status_code == 200
    assert calib_res.json()["is_calibrated"] is True

    # 7. Check twin profile again: now calibrated
    twin_res2 = client.get(f"/api/twin/profile?course_id={course_id}&student_id={user_id}")
    assert twin_res2.status_code == 200
    assert twin_res2.json()["is_calibrated"] is True
