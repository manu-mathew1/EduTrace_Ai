"""
EduTrace AI — Multi-Tenant Authentication & Data Isolation Test Suite
(Pod P1: Task 5.9 / Proposal #007)
"""

import time
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)


def test_password_hashing_and_verification():
    """Verify cryptographic PBKDF2-HMAC-SHA256 hashing."""
    pwd = "SecretPassword123!"
    h1, salt1 = hash_password(pwd)
    assert len(h1) == 64
    assert len(salt1) == 32

    # Verification success
    assert verify_password(pwd, h1, salt1) is True

    # Wrong password failure
    assert verify_password("WrongPassword!", h1, salt1) is False

    # Unique salts generate unique hashes
    h2, salt2 = hash_password(pwd)
    assert salt1 != salt2
    assert h1 != h2


def test_token_creation_and_tamper_resistance():
    """Verify HMAC-SHA256 token signing and verification."""
    token = create_access_token(
        user_id="std_test_01",
        email="test@edutrace.ai",
        name="Test Student",
        role="student",
        expires_in_seconds=3600
    )
    assert token.count(".") == 2

    # Valid decode
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "std_test_01"
    assert payload["email"] == "test@edutrace.ai"

    # Tampered token fails
    tampered = token[:-4] + "xxxx"
    assert decode_access_token(tampered) is None

    # Expired token fails
    expired_token = create_access_token(
        user_id="std_test_01",
        email="test@edutrace.ai",
        name="Test Student",
        expires_in_seconds=-10
    )
    assert decode_access_token(expired_token) is None


def test_api_auth_register_and_login_lifecycle():
    """Verify registration, duplicate email prevention, and login endpoints."""
    with TestClient(app) as client:
        ts = int(time.time() * 1000)
        email = f"student_{ts}@school.edu"
        password = "strong_password_99"

        # 1. Register new student
        reg_res = client.post(
            "/api/auth/register",
            json={
                "email": email,
                "name": "Jane Doe",
                "password": password,
                "primary_course_id": "course_calc_301",
            }
        )
        assert reg_res.status_code == 201, reg_res.text
        data = reg_res.json()
        assert "access_token" in data
        assert data["user"]["email"] == email
        assert data["user"]["name"] == "Jane Doe"
        user_id = data["user"]["id"]

        # 2. Duplicate registration rejected
        dup_res = client.post(
            "/api/auth/register",
            json={
                "email": email,
                "name": "Jane Duplicate",
                "password": password,
            }
        )
        assert dup_res.status_code == 409

        # 3. Login with correct credentials
        login_res = client.post(
            "/api/auth/login",
            json={"email": email, "password": password}
        )
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert login_data["user"]["id"] == user_id
        assert login_data["access_token"] is not None

        # 4. Login with invalid password
        bad_login = client.post(
            "/api/auth/login",
            json={"email": email, "password": "wrong_password"}
        )
        assert bad_login.status_code == 401

        # 5. Access /api/auth/me with Bearer token
        me_res = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {login_data['access_token']}"}
        )
        assert me_res.status_code == 200
        assert me_res.json()["id"] == user_id


def test_api_auth_personas_and_fast_switch():
    """Verify demo personas endpoint and 1-click persona switching."""
    with TestClient(app) as client:
        # Get list of personas
        res = client.get("/api/auth/personas")
        assert res.status_code == 200
        personas = res.json()
        assert len(personas) >= 3
        ids = [p["id"] for p in personas]
        assert "std_rahul_99" in ids
        assert "std_priya_88" in ids

        # Switch to Rahul
        switch_res = client.post("/api/auth/switch-persona/std_rahul_99")
        assert switch_res.status_code == 200
        data = switch_res.json()
        assert data["user"]["id"] == "std_rahul_99"
        assert data["user"]["name"] == "Rahul Sharma"
        assert "access_token" in data


def test_multi_tenant_user_twin_isolation():
    """
    Verify strict user-data isolation:
    Updating Student A's Bayesian Learning Twin has zero effect on Student B's Twin.
    """
    with TestClient(app) as client:
        ts = int(time.time() * 1000)
        # Register Student A
        res_a = client.post(
            "/api/auth/register",
            json={
                "email": f"student_a_{ts}@univ.edu",
                "name": "Student A",
                "password": "passwordA123",
                "primary_course_id": "course_calc_301",
            }
        )
        assert res_a.status_code == 201
        user_a_id = res_a.json()["user"]["id"]

        # Register Student B
        res_b = client.post(
            "/api/auth/register",
            json={
                "email": f"student_b_{ts}@univ.edu",
                "name": "Student B",
                "password": "passwordB123",
                "primary_course_id": "course_calc_301",
            }
        )
        assert res_b.status_code == 201
        user_b_id = res_b.json()["user"]["id"]

        # Fetch initial profiles
        twin_a_init = client.get(f"/api/twin/profile?course_id=course_calc_301&student_id={user_a_id}").json()
        twin_b_init = client.get(f"/api/twin/profile?course_id=course_calc_301&student_id={user_b_id}").json()

        assert twin_a_init["total_marks_recovered_to_date"] == 0.0
        assert twin_b_init["total_marks_recovered_to_date"] == 0.0

        # Student A completes a reassessment drill and recovers +8 Marks
        verify_payload = {
            "reassessment_id": f"reassess_user_a_{ts}",
            "student_id": user_a_id,
            "course_id": "course_calc_301",
            "skill_id": "skill_parts_sign_expansion",
            "submitted_work": "u = x, dv = cos(2x)dx ... = (1/2)x sin(2x) + (1/4)cos(2x) + C",
        }
        reassess_res = client.post("/api/reassessment/verify", json=verify_payload)
        assert reassess_res.status_code == 200

        # Query Student A's profile: should reflect +8.0 Marks recovered
        twin_a_updated = client.get(f"/api/twin/profile?course_id=course_calc_301&student_id={user_a_id}").json()
        assert twin_a_updated["total_marks_recovered_to_date"] == 8.0

        # Query Student B's profile: MUST REMAIN COMPLETELY UNTOUCHED at 0.0 Marks!
        twin_b_check = client.get(f"/api/twin/profile?course_id=course_calc_301&student_id={user_b_id}").json()
        assert twin_b_check["total_marks_recovered_to_date"] == 0.0, "Tenant leak! Student B was affected by Student A's drill!"
