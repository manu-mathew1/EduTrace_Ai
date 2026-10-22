# EduTrace AI — Intelligent Academic Performance & Metacognitive Intervention System

**Team Cognix — 5-Day Hackathon Sprint (Vertical Feature Pods)**

> **"Find your marks leaks. Discover how your brain learns best. Prove you've improved."**

---

## 🚀 Quick Navigation for Team Members

| Document | Purpose | Who reads it? |
|---|---|---|
| 📘 [PROJECT_INFO.md](file:///Users/manumathew/Documents/VS_code/EduTrace_Ai/PROJECT_INFO.md) | **Master Product Blueprint:** Universal 4-archetype system, stage-by-stage workflow, judge defense | **Everyone** |
| 📋 [TASKS.md](file:///Users/manumathew/Documents/VS_code/EduTrace_Ai/TASKS.md) | **5-Day Sprint Task Sheet:** Feature Pod tasks with exact target files for P1 to P5 | **Everyone** |
| 📝 [UPDATES.md](file:///Users/manumathew/Documents/VS_code/EduTrace_Ai/UPDATES.md) | **Living Technical Ledger & In-Repo Chat:** Active requests, feature voting, and work logs | **Everyone & All AIs** |
| 🤖 [.agents/](file:///Users/manumathew/Documents/VS_code/EduTrace_Ai/.agents/) | **Pre-Configured AI Instruction Files:** Self-contained master instructions for P1 through P5 | **AI Assistants** |

---

## 🤖 10-Second AI Setup for Each Teammate (Zero-Decision AI)

To ensure your AI coding assistant (Cursor, Antigravity, Claude, Copilot) automatically behaves with 100% role accuracy without you needing to explain anything:

1. **Check your assigned pod:** (P1 = Tech Lead, P2 = Ingestion/RAG, P3 = Intake/Probe, P4 = Forensics/Diff, P5 = Recovery/Studio).
2. **Activate your role instruction:**
   - **For P1:** Root `AGENTS.md` is already pre-configured for you!
   - **For P2:** `cp .agents/AGENTS_P2.md AGENTS.md`
   - **For P3:** `cp .agents/AGENTS_P3.md AGENTS.md`
   - **For P4:** `cp .agents/AGENTS_P4.md AGENTS.md`
   - **For P5:** `cp .agents/AGENTS_P5.md AGENTS.md`
3. **Start working!** Your AI will automatically:
   - Run the pre-flight git pull check and read `UPDATES.md` from top to bottom.
   - Answer pending requests directed to your pod in `UPDATES.md` Section A.
   - Prompt you to vote on active feature proposals before moving on.
   - Stay strictly inside your vertical pod files (never touches other teammates' files).
   - Log work and push to Git after every turn.

---

## 👥 Team Cognix — Vertical Feature Pods Ownership

Every teammate is a full-stack engineer owning an entire feature pipeline end-to-end:

| Pod | Role | Backend Router | AI / RAG Logic | Frontend Page / UI |
|---|---|---|---|---|
| **P1** | **Core Systems & Learning Twin** | `backend/main.py`, `backend/db/*` | `backend/services/twin_service.py` | `frontend/src/App.tsx`, `DashboardPage.tsx` |
| **P2** | **Stage 1: Smart Ingestion & RAG**| `backend/api/documents.py` | `rag/*` (PyMuPDF, ChromaDB) | `frontend/src/pages/IngestionPage.tsx` |
| **P3** | **Stage 2: Intake & Diagnostic** | `backend/api/intake.py` | `ai/diagnostics/*` (Triage/Probe) | `frontend/src/pages/IntakePage.tsx` |
| **P4** | **Stage 3: Forensics & Step-Diff** | `backend/api/submissions.py` | `ai/forensics/*` (Divergence, OCR)| `frontend/src/pages/ForensicsPage.tsx` |
| **P5** | **Stage 5/6: Recovery & Studio** | `backend/api/recovery.py`, `interventions.py` | `ai/intervention/*`, `evaluation/*` | `frontend/src/pages/InterventionStudio.tsx`|

---

## 🔄 Mandatory Git Synchronization Protocol (All Team Members & Agents)

1. **Before any code change (FETCH LATEST):**
   ```bash
   git checkout dev && git pull origin dev
   ```
2. **Make changes strictly within your assigned vertical pod files.**
3. **Additive Evolution Rule:** When adding new fields, always make them `Optional[T] = None` so existing code never breaks!
4. **After any code change (PUSH LATEST):**
   - Update `TASKS.md` status (`[🔄]` or `[✅]`).
   - Append detailed technical log to top of `UPDATES.md`.
   - Commit and push to Git:
     ```bash
     git add <modified_files> TASKS.md UPDATES.md
     git commit -m "feat(<pod>): [Task ID] Description"
     git push origin feat/<your-feature-branch>
     ```

---

## 💬 In-Repo Team Chat & Cross-Domain Requests (Replacing WhatsApp/Discord)

All technical collaboration, questions, and feature requests between pods are posted directly inside **`UPDATES.md` Section A**:
* **Before working:** Check Section A for threads tagged `To: [My Role]`. If there's a `[PENDING]` request, prioritize answering it!
* **Need something from another pod?** Add a new thread:
  ```markdown
  ### 💬 Thread #XXX: [From P_ -> To P_] Subject
  - **Status:** [PENDING]
  - **Message:** "Hey P1, please add avatar_url to the user schema..."
  ```
* **Why this works:** Every developer and their AI assistant reads `UPDATES.md` on every single prompt. The AI sees the request, writes the code, and replies in the thread automatically!

### 💡 The Unanimous Consensus Rule for New Features (All 5 Must Agree)
To protect our 5-day timeline and ensure everyone is included:
- **No unilateral additions:** Any new feature proposal posted in `UPDATES.md` Section A requires **100% team agreement (all 5 members voting Agree)**.
- **Proactive AI Prompting:** Because team members are beginners, your AI assistant will proactively ask you for your vote (*Agree / Disagree*) on any active proposals before continuing work.
- **Lead Research Gate:** Once 5/5 consensus is achieved, Team Lead (P1) is prompted to conduct technical research, assess schema impacts, and divide micro-tasks into `TASKS.md` before any pod starts coding.

---

## 🛠️ Tech Stack & Setup

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

### Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
*(Never commit `.env` to Git!)*
