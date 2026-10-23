#!/usr/bin/env bash
# =============================================================================
# EduTrace AI — Official Production Startup Script (Pod P1: Tech Lead & Core Systems)
# =============================================================================
# Multi-worker asynchronous process manager, automated database migrations,
# optimized static build compilation, and unified single-port HTTP server.
# =============================================================================

set -e

# Terminal Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "========================================================================"
echo "    _____     _       _____                      _____ _____ "
echo "   |  ___|   | |     |_   _|                    |  _  |_   _| "
echo "   | |__   __| |_   _  | |_ __ __ _  ___ ___    | |_| | | |   "
echo "   |  __| / _\` | | | | | | '__/ _\` |/ __/ _ \   |  _  | | |   "
echo "   | |___| (_| | |_| | | | | | (_| | (_|  __/   | | | |_| |_  "
echo "   \____/ \__,_|\__,_| \_/_|  \__,_|\___\___|   \_| |_/\___/  "
echo "       PRODUCTION DEPLOYMENT RUNNER — TEAM COGNIX (ENTERPRISE)"
echo "========================================================================"
echo -e "${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

export PYTHONPATH="${SCRIPT_DIR}/.deps:${SCRIPT_DIR}:${PYTHONPATH}"
export EDUTRACE_ENV="production"

# 1. Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}❌ Error: python3 is not installed or not in PATH.${NC}"
    exit 1
fi

echo -e "${GREEN}🔍 Python runtime verified: $(python3 --version)${NC}"

# 2. Database Migration & Multi-Tenant Persona Seeding
echo -e "${BLUE}🌱 Verifying and migrating production database (edutrace.db)...${NC}"
python3 backend/scripts/seed_demo_data.py

# 3. Optional Frontend Build
if command -v npm &> /dev/null && [ -d "frontend" ]; then
    if [ ! -d "frontend/dist" ] || [ "$1" == "--build" ]; then
        echo -e "${PURPLE}📦 Building optimized production frontend bundle...${NC}"
        (cd frontend && npm install && npm run build) || {
            echo -e "${YELLOW}⚠️ Frontend build skipped; will serve via Vite or API.${NC}"
        }
    else
        echo -e "${GREEN}✅ Existing production frontend bundle detected in frontend/dist${NC}"
    fi
fi

# 4. Clean up any existing instances on port 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️ Port 8000 is occupied. Stopping previous backend process...${NC}"
    kill -9 $(lsof -Pi :8000 -sTCP:LISTEN -t) 2>/dev/null || true
    sleep 1
fi

# 5. Launch High-Concurrency Multi-Worker Server
WORKERS=${EDUTRACE_WORKERS:-4}
echo -e "${GREEN}🚀 Launching EduTrace AI Multi-Worker Server (${WORKERS} Workers) on http://0.0.0.0:8000...${NC}"

# If frontend/dist exists, FastAPI serves the complete UI directly on port 8000
python3 -m uvicorn backend.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers $WORKERS \
    --log-level info &
PROD_PID=$!

sleep 2

echo -e "${CYAN}"
echo "========================================================================"
echo "🎯 EDUTRACE AI PRODUCTION SERVER IS LIVE!"
echo "========================================================================"
echo -e "${GREEN}👉 Unified Application & Dashboard: http://localhost:8000/${NC}"
echo -e "${GREEN}👉 Production Swagger API Docs:      http://localhost:8000/docs${NC}"
echo -e "${BLUE}👉 Auth Registration Endpoint:       http://localhost:8000/api/auth/register${NC}"
echo -e "${BLUE}👉 Auth Login Endpoint:              http://localhost:8000/api/auth/login${NC}"
echo -e "${BLUE}👉 Multi-Tenant Personas:            http://localhost:8000/api/auth/personas${NC}"
echo "========================================================================"
echo -e "${YELLOW}Press [CTRL+C] at any time to gracefully terminate production workers.${NC}"
echo ""

cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down production server...${NC}"
    if [ -n "$PROD_PID" ]; then
        kill $PROD_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Production workers cleanly terminated.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM
wait $PROD_PID
