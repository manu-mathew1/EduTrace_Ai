#!/usr/bin/env bash
# =============================================================================
# EduTrace AI — One-Click Demo Startup Script (Pod P1: Tech Lead & Core Systems)
# =============================================================================
# Automatically prepares the database, starts the FastAPI backend, and launches
# the Vite frontend dashboard for live hackathon judging demonstrations.
# =============================================================================

set -e

# Terminal Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "========================================================================"
echo "    _____     _       _____                      _____ _____ "
echo "   |  ___|   | |     |_   _|                    |  _  |_   _| "
echo "   | |__   __| |_   _  | |_ __ __ _  ___ ___    | |_| | | |   "
echo "   |  __| / _\` | | | | | | '__/ _\` |/ __/ _ \   |  _  | | |   "
echo "   | |___| (_| | |_| | | | | | (_| | (_|  __/   | | | |_| |_  "
echo "   \____/ \__,_|\__,_| \_/_|  \__,_|\___\___|   \_| |_/\___/  "
echo "        ACADEMIC FORENSIC & INTERVENTION PLATFORM — TEAM COGNIX"
echo "========================================================================"
echo -e "${NC}"

# 1. Environment & Dependency Path Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

export PYTHONPATH="${SCRIPT_DIR}/.deps:${SCRIPT_DIR}:${PYTHONPATH}"

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}❌ Error: python3 is not installed or not in PATH.${NC}"
    exit 1
fi

echo -e "${GREEN}🔍 Checking Python 3 environment... OK!${NC}"

# 2. Pre-Seed SQLite Demo Database
echo -e "${BLUE}🌱 Pre-seeding SQLite Demo Database with Calculus III & Macroeconomics...${NC}"
python3 backend/scripts/seed_demo_data.py

# 3. Clean up any existing instances on port 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️ Port 8000 is occupied. Stopping previous backend process...${NC}"
    kill -9 $(lsof -Pi :8000 -sTCP:LISTEN -t) 2>/dev/null || true
    sleep 1
fi

# 4. Start FastAPI Backend Server
echo -e "${GREEN}🚀 Launching EduTrace AI FastAPI Backend on http://localhost:8000...${NC}"
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend health
echo -e "${CYAN}⏳ Waiting for backend health check...${NC}"
RETRIES=10
until curl -s http://localhost:8000/api/health > /dev/null || [ $RETRIES -eq 0 ]; do
    sleep 1
    RETRIES=$((RETRIES-1))
done

if [ $RETRIES -eq 0 ]; then
    echo -e "${YELLOW}⚠️ Backend started without instant ping, proceeding with dashboard...${NC}"
else
    echo -e "${GREEN}✅ Backend API is Healthy & Ready!${NC}"
fi

# 5. Start Vite Frontend Dashboard
FRONTEND_PID=""
if command -v npm &> /dev/null && [ -d "frontend" ]; then
    if [ -d "frontend/node_modules" ]; then
        echo -e "${PURPLE}💻 Launching Frontend Dashboard on http://localhost:5173...${NC}"
        (cd frontend && npm run dev) &
        FRONTEND_PID=$!
    else
        echo -e "${YELLOW}ℹ️ Frontend node_modules not yet installed.${NC}"
        echo -e "${CYAN}👉 Run 'npm install --prefix frontend' and 'npm run dev --prefix frontend' to launch UI.${NC}"
    fi
else
    echo -e "${YELLOW}ℹ️ Node.js not detected in sandbox; Backend API & Interactive Swagger UI are active.${NC}"
fi

# 6. Display Quick Demo Links
echo -e "${CYAN}"
echo "========================================================================"
echo "🎯 LIVE DEMO MISSION CONTROL IS ACTIVE!"
echo "========================================================================"
echo -e "${GREEN}👉 Mission Control Dashboard:  http://localhost:5173/${NC}"
echo -e "${GREEN}👉 Interactive Swagger API:    http://localhost:8000/docs${NC}"
echo -e "${BLUE}👉 Stage 1 Ingestion:          http://localhost:8000/api/documents/triage${NC}"
echo -e "${BLUE}👉 Stage 2 Intake Probe:       http://localhost:8000/api/intake/probe${NC}"
echo -e "${BLUE}👉 Stage 3 Forensic Step-Diff: http://localhost:8000/api/submissions/analyze${NC}"
echo -e "${BLUE}👉 Stage 4 Cognitive Leaks:    http://localhost:8000/api/submissions/fingerprint${NC}"
echo -e "${BLUE}👉 Stage 5 Recovery Roadmap:   http://localhost:8000/api/recovery/map${NC}"
echo -e "${BLUE}👉 Stage 6 Multimodal Studio:  http://localhost:8000/api/interventions/studio${NC}"
echo -e "${BLUE}👉 Stage 7 Reassessment Drill: http://localhost:8000/api/reassessment/question${NC}"
echo -e "${BLUE}👉 Bayesian Twin Profile:      http://localhost:8000/api/twin/profile?course_id=course_calc_301&student_id=std_rahul_99${NC}"
echo "========================================================================"
echo -e "${YELLOW}Press [CTRL+C] at any time to gracefully stop all servers.${NC}"
echo ""

# Graceful Exit Handler
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down demo servers...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Servers cleanly stopped. Thank you!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait $BACKEND_PID
