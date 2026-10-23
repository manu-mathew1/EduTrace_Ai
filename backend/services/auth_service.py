"""
EduTrace AI — Multi-Tenant Authentication & Cryptographic Security Engine
(P1: Tech Lead & Core Systems — Proposal #007)

Implements:
- PBKDF2-HMAC-SHA256 password hashing with cryptographically secure random salt
- HMAC-SHA256 signed bearer token issuing and verification with expiry
- User creation, authentication, profile extraction, and demo personas
"""

import os
import time
import json
import base64
import hmac
import hashlib
import secrets
from datetime import datetime
from typing import Tuple, Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.models import UserModel, SkillTwinModel
from backend.services.twin_service import calculate_beta_mastery

# Secret key for HMAC token signing (configurable via environment variable)
AUTH_SECRET_KEY = os.getenv("EDUTRACE_AUTH_SECRET", "edutrace_cognix_production_secret_key_2026_x79")
TOKEN_EXPIRY_SECONDS = 86400 * 7  # 7 days


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with 100,000 iterations.
    Returns (hex_hash, hex_salt).
    """
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    )
    return hashed.hex(), salt


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    """
    Verifies a plaintext candidate password against the stored hash and salt
    using constant-time HMAC comparison.
    """
    candidate_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(candidate_hash, password_hash)


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64url_decode(s: str) -> bytes:
    padding = 4 - (len(s) % 4)
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s.encode("utf-8"))


def create_access_token(
    user_id: str,
    email: str,
    name: str,
    role: str = "student",
    expires_in_seconds: int = TOKEN_EXPIRY_SECONDS
) -> str:
    """
    Creates an HMAC-SHA256 signed bearer token with JSON payload and expiration timestamp.
    """
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "role": role,
        "iat": int(time.time()),
        "exp": int(time.time()) + expires_in_seconds,
    }

    header_bytes = json.dumps(header, separators=(",", ":")).encode("utf-8")
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")

    header_b64 = _b64url_encode(header_bytes)
    payload_b64 = _b64url_encode(payload_bytes)

    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(AUTH_SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies token signature and checks expiration. Returns payload dictionary if valid, None otherwise.
    """
    try:
        parts = token.strip().split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts

        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(AUTH_SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
        expected_sig_b64 = _b64url_encode(expected_sig)

        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None

        payload_bytes = _b64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))

        if payload.get("exp", 0) < int(time.time()):
            return None  # Token expired

        return payload
    except Exception:
        return None


# =====================================================================
# Database Auth Service Operations
# =====================================================================

DEFAULT_PERSONAS = [
    {
        "id": "std_rahul_99",
        "email": "rahul@edutrace.ai",
        "name": "Rahul Sharma",
        "password": "password123",
        "role": "student",
        "primary_course_id": "course_calc_301",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
        "headline": "Calculus III • Procedural Calculation & Bracket Inversion Focus",
        "baseline_readiness": 55.4,
    },
    {
        "id": "std_priya_88",
        "email": "priya@edutrace.ai",
        "name": "Priya Patel",
        "password": "password123",
        "role": "student",
        "primary_course_id": "course_econ_macro",
        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces",
        "headline": "Macroeconomics • Crowding-Out Effect & Fiscal Policy Remediation",
        "baseline_readiness": 58.0,
    },
    {
        "id": "std_alex_77",
        "email": "alex@edutrace.ai",
        "name": "Alex Chen",
        "password": "password123",
        "role": "student",
        "primary_course_id": "course_cs_210",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
        "headline": "Data Structures • Loop Invariant & Binary Search Termination",
        "baseline_readiness": 62.5,
    },
]


async def seed_default_users(session: AsyncSession):
    """
    Idempotently seeds default test personas into SQLite database.
    """
    for p in DEFAULT_PERSONAS:
        stmt = select(UserModel).where(UserModel.id == p["id"])
        res = await session.execute(stmt)
        existing = res.scalars().first()
        if not existing:
            p_hash, p_salt = hash_password(p["password"])
            user = UserModel(
                id=p["id"],
                email=p["email"],
                name=p["name"],
                password_hash=p_hash,
                salt=p_salt,
                role=p["role"],
                primary_course_id=p["primary_course_id"],
                avatar_url=p["avatar_url"],
            )
            session.add(user)
    await session.commit()
