"""
EduTrace AI — Multi-Tenant Authentication & Identity Router (P1: Tech Lead — Proposal #007)
Provides secure endpoints for user registration, login, persona switching, and session validation.
"""

import uuid
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.database import get_db
from backend.db.models import UserModel, SkillTwinModel
from backend.schemas.contracts import (
    RegisterRequest,
    LoginRequest,
    AuthTokenResponse,
    UserResponse,
    PersonaResponse,
)
from backend.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    DEFAULT_PERSONAS,
)
from backend.services.twin_service import calculate_beta_mastery

router = APIRouter(tags=["auth (P1)"])


def _user_to_response(u: UserModel) -> UserResponse:
    return UserResponse(
        id=u.id,
        email=u.email,
        name=u.name,
        role=u.role,
        primary_course_id=u.primary_course_id,
        avatar_url=u.avatar_url,
        created_at=u.created_at.isoformat() if u.created_at else None,
    )


async def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Optional[UserModel]:
    """Optional dependency to extract authenticated user from Authorization Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    stmt = select(UserModel).where(UserModel.id == user_id)
    res = await db.execute(stmt)
    return res.scalars().first()


async def get_current_user_required(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> UserModel:
    """Strict dependency requiring authenticated user."""
    user = await get_current_user_optional(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    req: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Registers a new student user:
    - Verifies email uniqueness
    - Computes PBKDF2-HMAC-SHA256 password hash + salt
    - Initializes an isolated, private Bayesian Learning Twin state for this student in SQLite
    - Returns signed JWT bearer access token and user profile
    """
    email_clean = req.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="A valid email address is required.")

    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    # Check email duplicate
    stmt = select(UserModel).where(UserModel.email == email_clean)
    res = await db.execute(stmt)
    if res.scalars().first():
        raise HTTPException(status_code=409, detail=f"User with email '{email_clean}' already exists.")

    p_hash, p_salt = hash_password(req.password)
    user_id = f"std_{uuid.uuid4().hex[:8]}"

    avatar_url = f"https://api.dicebear.com/7.x/bottts/svg?seed={user_id}"

    new_user = UserModel(
        id=user_id,
        email=email_clean,
        name=req.name.strip(),
        password_hash=p_hash,
        salt=p_salt,
        role=req.role or "student",
        primary_course_id=req.primary_course_id or None,
        avatar_url=avatar_url,
    )
    db.add(new_user)

    # Initialize private baseline Bayesian Learning Twin skills ONLY IF a course was explicitly specified
    if req.primary_course_id:
        course_id = req.primary_course_id
        initial_skills = [
            ("skill_parts_sign_expansion", "Integration by Parts: Bracket Sign Distribution", 2.0, 3.0),
            ("skill_parts_vs_sub_decision", "Method Choice: Substitution vs Parts", 2.0, 3.0),
            ("skill_ode_integrating_factor", "First-Order Linear ODE: Integrating Factor Setup", 2.0, 3.0),
        ]
        now_iso = datetime.utcnow().isoformat() + "Z"
        for sid, sname, a, b in initial_skills:
            m_pct, unc_range = calculate_beta_mastery(a, b)
            model_inst = SkillTwinModel(
                student_id=user_id,
                course_id=course_id,
                skill_id=sid,
                skill_name=sname,
                alpha=a,
                beta=b,
                mastery_percentage=m_pct,
                uncertainty_range_json=str(unc_range),
                last_tested_timestamp=now_iso,
            )
            db.add(model_inst)

    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(
        user_id=new_user.id,
        email=new_user.email,
        name=new_user.name,
        role=new_user.role,
    )

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=_user_to_response(new_user),
    )


@router.post("/login", response_model=AuthTokenResponse)
async def login_user(
    req: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticates user with email and password:
    - Verifies password against PBKDF2 hash using constant-time comparison
    - Returns signed JWT bearer access token and user profile
    """
    email_clean = req.email.strip().lower()
    stmt = select(UserModel).where(UserModel.email == email_clean)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user or not verify_password(req.password, user.password_hash, user.salt):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        user_id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
    )

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=_user_to_response(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: UserModel = Depends(get_current_user_required),
):
    """Returns the authenticated user's profile."""
    return _user_to_response(current_user)


@router.get("/personas", response_model=List[PersonaResponse])
async def list_demo_personas():
    """
    Returns seeded student personas for rapid 1-click evaluation by hackathon judges:
    - Rahul Sharma (Calculus III)
    - Priya Patel (Macroeconomics)
    - Alex Chen (Computer Science / Data Structures)
    """
    return [
        PersonaResponse(
            id=p["id"],
            email=p["email"],
            name=p["name"],
            role=p["role"],
            primary_course_id=p["primary_course_id"],
            avatar_url=p["avatar_url"],
            headline=p["headline"],
            baseline_readiness=p["baseline_readiness"],
        )
        for p in DEFAULT_PERSONAS
    ]


@router.post("/switch-persona/{persona_id}", response_model=AuthTokenResponse)
async def switch_demo_persona(
    persona_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    1-Click Fast-Track Persona Switcher for hackathon evaluations:
    Instantly logs in as the selected demo persona and issues signed access token.
    """
    stmt = select(UserModel).where(UserModel.id == persona_id)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user:
        # If not yet created, seed from default persona list
        persona_def = next((p for p in DEFAULT_PERSONAS if p["id"] == persona_id), None)
        if not persona_def:
            raise HTTPException(status_code=404, detail=f"Persona '{persona_id}' not found.")
        p_hash, p_salt = hash_password(persona_def["password"])
        user = UserModel(
            id=persona_def["id"],
            email=persona_def["email"],
            name=persona_def["name"],
            password_hash=p_hash,
            salt=p_salt,
            role=persona_def["role"],
            primary_course_id=persona_def["primary_course_id"],
            avatar_url=persona_def["avatar_url"],
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(
        user_id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
    )

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=_user_to_response(user),
    )
