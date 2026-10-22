"""
EduTrace AI — Main FastAPI Application Core Hub (P1: Tech Lead & Core Systems)
Single entrypoint orchestrating database lifecycle, CORS, health checks,
and router registrations for all 5 vertical feature pods.
"""

import os
import json
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.db.database import init_db
from backend.api import twin

# Setup logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("edutrace.core")

MOCKS_DIR = Path(__file__).resolve().parent.parent / "data" / "mocks"


def load_mock(filename: str) -> Dict[str, Any]:
    """Helper to load a mock JSON fixture for rapid development testing."""
    file_path = MOCKS_DIR / filename
    if file_path.exists():
        with open(file_path, "r") as f:
            return json.load(f)
    return {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: initializes database tables and logs pod registry."""
    logger.info("Initializing EduTrace AI Database tables...")
    try:
        await init_db()
        logger.info("✅ Database tables successfully created/verified.")
        # Seed default courses on startup (Task 3.2)
        from backend.db.database import AsyncSessionLocal
        from backend.api.courses import seed_default_courses
        async with AsyncSessionLocal() as session:
            await seed_default_courses(session)
        logger.info("✅ Default courses seeded/verified in SQLite.")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")

    yield
    logger.info("EduTrace AI Application shutting down cleanly.")


# Initialize FastAPI App
app = FastAPI(
    title="EduTrace AI — Core Diagnostic & Intervention Engine",
    description="Universal Academic Diagnostic & Metacognitive Intervention Platform. Team Cognix.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for Vite Frontend (port 5173) and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================================
# Core Health & Status Endpoints (P1)
# =====================================================================

@app.get("/", tags=["health"])
async def root():
    return {
        "platform": "EduTrace AI",
        "version": "1.0.0",
        "status": "operational",
        "message": "Welcome to EduTrace AI API Hub. Visit /docs for Swagger UI.",
        "team": "Team Cognix"
    }


@app.get("/api/health", tags=["health"])
async def health_check():
    """Health check endpoint displaying active status across all 5 pods."""
    return {
        "status": "healthy",
        "engine": "FastAPI + SQLAlchemy + aiosqlite",
        "pods": {
            "p1_core": "active (Bayesian Twin, Course Persistence & Master Hub)",
            "p2_ingestion": "registered (/api/documents)",
            "p3_intake": "registered (/api/intake)",
            "p4_forensics": "registered (/api/submissions)",
            "p5_recovery": "registered (/api/recovery, /api/interventions, /api/reassessment)"
        }
    }


# =====================================================================
# Router Registrations (P1 Hub)
# =====================================================================

# 0. P1: Course Management & Database Persistence Router (Task 3.2)
from backend.api import courses
app.include_router(courses.router, prefix="/api/courses", tags=["courses (P1)"])

# 1. P1: Metacognitive Learning Twin Router
app.include_router(twin.router, prefix="/api/twin", tags=["twin (P1)"])

# 2. P2: Ingestion & Document Router (Thread #002)
try:
    from backend.api import documents
    app.include_router(documents.router, prefix="/api/documents", tags=["documents (P2)"])
    logger.info("✅ Mounted live P2 router: documents.py")
except (ImportError, AttributeError):
    logger.info("ℹ️ Mounting mock fallback routes for P2 /api/documents until P2 finishes Task 1.6")

    @app.post("/api/documents/upload", tags=["documents (P2 Mock)"])
    @app.get("/api/documents/triage", tags=["documents (P2 Mock)"])
    async def mock_document_triage():
        """Fallback mock response for P2 document triage."""
        return load_mock("mock_triage.json")

# 3. P3: Intake Consultation & Diagnostic Probe Router (Thread #003)
try:
    from backend.api import intake
    app.include_router(intake.router, prefix="/api/intake", tags=["intake (P3)"])
    logger.info("✅ Mounted live P3 router: intake.py")
except (ImportError, AttributeError):
    logger.info("ℹ️ Mounting mock fallback routes for P3 /api/intake until P3 finishes Task 1.9")

    @app.post("/api/intake/consult", tags=["intake (P3 Mock)"])
    async def mock_intake_consult():
        """Fallback mock response for P3 intake consultation."""
        return {
            "assistant_reply": "Got it. Let's start with a quick 3-question diagnostic probe.",
            "session_state": {
                "session_id": "sess_probe_demo",
                "course_id": "course_calc_301",
                "messages": [],
                "recommended_mode": "probe",
                "is_consultation_complete": True
            },
            "ready_for_diagnostic": True
        }

    @app.get("/api/intake/probe", tags=["intake (P3 Mock)"])
    async def mock_intake_probe():
        """Fallback mock response for P3 diagnostic probe."""
        return load_mock("mock_probe.json")

# 4. P4: Forensics & Step-Diff Router
try:
    from backend.api import submissions
    app.include_router(submissions.router, prefix="/api/submissions", tags=["submissions (P4)"])
    logger.info("✅ Mounted live P4 router: submissions.py")
except (ImportError, AttributeError):
    logger.info("ℹ️ Mounting mock fallback routes for P4 /api/submissions until P4 finishes Task 1.12")

    @app.get("/api/submissions/forensics", tags=["submissions (P4 Mock)"])
    @app.post("/api/submissions/diff", tags=["submissions (P4 Mock)"])
    async def mock_forensics_diff():
        """Fallback mock response for P4 forensic step-diff."""
        return load_mock("mock_forensic_diff.json")

# 5. P5: Marks Recovery & Multimodal Studio Router
try:
    from backend.api import recovery, interventions, reassessment
    app.include_router(recovery.router, prefix="/api/recovery", tags=["recovery (P5)"])
    app.include_router(interventions.router, prefix="/api/interventions", tags=["interventions (P5)"])
    app.include_router(reassessment.router, prefix="/api/reassessment", tags=["reassessment (P5)"])
    logger.info("✅ Mounted live P5 routers")
except (ImportError, AttributeError):
    logger.info("ℹ️ Mounting mock fallback routes for P5 until P5 finishes Tasks 1.15")

    @app.get("/api/recovery/map", tags=["recovery (P5 Mock)"])
    async def mock_recovery_map():
        """Fallback mock response for P5 marks recovery map."""
        return load_mock("mock_recovery_map.json")

    @app.get("/api/interventions/studio", tags=["interventions (P5 Mock)"])
    async def mock_intervention_studio():
        """Fallback mock response for P5 multimodal studio."""
        return load_mock("mock_intervention.json")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
