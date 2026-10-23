# EduTrace AI — Compressed 5-Day Sprint Task Sheet (Vertical Feature Pods)

**Project:** EduTrace AI — Intelligent Academic Performance & Metacognitive Intervention System  
**Team:** Cognix (5-Person Team — Full-Stack Vertical Feature Pods)  
**Timeline:** ⚡ **CRITICAL 5-DAY HACKATHON SPRINT**  
**Single Source of Truth:** [PROJECT_INFO.md](file:///Users/manumathew/Documents/VS_code/EduTrace_Ai/PROJECT_INFO.md)  
**Living Technical Ledger:** [UPDATES.md](file:///Users/manumathew/Documents/VS_code/EduTrace_Ai/UPDATES.md)  

**Status Key:**  
`[ ] Pending` — Not started  
`[🔄] In Progress` — Currently being developed  
`[✅] Completed` — Built, tested, and merged into `dev`  
`[⚠️] Blocked` — Waiting on dependency or clarification  

---

## 1. Team Roster & Vertical Feature Pod Directory

Every person owns an entire feature stage end-to-end (their Backend router + their AI/RAG engine + their Frontend page):

| Pod | Role | Owner | Backend Router | AI / RAG Logic | Frontend Page / Components | Branch |
|---|---|---|---|---|---|---|
| **P1** | **Core Systems & Learning Twin** | *(You / Lead)* | `backend/main.py`, `backend/db/*` | `backend/services/twin_service.py` | `frontend/src/App.tsx`, `DashboardPage.tsx` | `main`, `dev`, `feat/core-*` |
| **P2** | **Stage 1: Smart Ingestion & RAG**| *(Teammate 2)* | `backend/api/documents.py` | `rag/*` (PyMuPDF, ChromaDB) | `frontend/src/pages/IngestionPage.tsx` | `feat/ingestion-rag-*` |
| **P3** | **Stage 2: Intake & Diagnostic** | *(Teammate 3)* | `backend/api/intake.py` | `ai/diagnostics/*` (Triage/Probe) | `frontend/src/pages/IntakePage.tsx` | `feat/intake-probe-*` |
| **P4** | **Stage 3: Forensics & Step-Diff** | *(Teammate 4)* | `backend/api/submissions.py` | `ai/forensics/*` (Divergence, OCR)| `frontend/src/pages/ForensicsPage.tsx` | `feat/forensics-diff-*` |
| **P5** | **Stage 5/6: Recovery & Studio** | *(Teammate 5)* | `backend/api/recovery.py`, `interventions.py` | `ai/intervention/*`, `evaluation/*` | `frontend/src/pages/InterventionStudio.tsx`| `feat/recovery-studio-*`|

---

## 2. Mandatory Git Synchronization Cycle (Every Prompt / Code Session)

```
       [BEFORE EVERY CODE CHANGE]
       1. Run: git checkout dev && git pull origin dev
          (Always fetch the latest commits from everyone before touching code!)
                   │
                   ▼
       [DURING CODE CHANGE]
       2. Switch to your feature branch: git checkout feat/your-feature-name
       3. Modify files STRICTLY inside your assigned vertical pod files.
                   │
                   ▼
       [AFTER EVERY CODE CHANGE / PROMPT]
       4. Update TASKS.md (change [ ] -> [🔄] -> [✅]).
       5. Append detailed technical entry to the top of UPDATES.md.
       6. Commit and push immediately:
          git add <modified_files> TASKS.md UPDATES.md
          git commit -m "feat(pod): [Task ID] Description"
          git push origin feat/your-feature-name
          (Open PR to dev for P1 review).
```

---

## 3. The 5-Day Sprint Schedule

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │ DAY 1: Foundation, Schemas, Mocks & Vertical Walking Skeletons         │
  │ DAY 2: Stage 1 (Smart Ingestion) & Stage 2 (Intake / Diagnostic Probe) │
  │ DAY 3: Stage 3 (Forensic Step-Diff) & Stage 4 (Error Fingerprint)      │
  │ DAY 4: Stage 5 (Recovery Map), Stage 6 (Studio) & Stage 7 (Reassess)   │
  │ DAY 5: Golden Demo Polish, 15-Sample Benchmark, Backup Video & Pitch   │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Detailed Day-by-Day Task Breakdown

### Day 1: Foundation, Schemas, Mocks & Walking Skeletons

#### P1: Core Systems, Learning Twin & Integration Gatekeeper
- [✅] **Task 1.1:** Initialize Git repository, create central GitHub repository (`EduTrace_Ai`), establish `main` and `dev` branches, push initial project scaffold (`contracts.py`, `schema.ts`, mock fixtures, agent instructions), and invite team members (P2–P5) as collaborators.
- [✅] **Task 1.2:** Write master Pydantic data contracts in `backend/schemas/contracts.py` and mirror into `frontend/src/types/schema.ts`.
- [✅] **Task 1.3:** Setup `backend/main.py` (FastAPI app, CORS, health check) and database setup in `backend/db/database.py`, `backend/db/models.py`.
- [✅] **Task 1.4:** Setup frontend Shell layout & navigation in `frontend/src/App.tsx`, `frontend/src/components/layout/Shell.tsx`.
- [✅] **Task 1.5:** Implement core Bayesian Learning Twin prior math in `backend/services/twin_service.py`.

#### P2: Stage 1 — Smart Ingestion & Course Knowledge RAG
- [✅ (Completed by P1)] **Task 1.6:** Implement backend document upload router stub in `backend/api/documents.py` returning `mock_triage.json`.
- [✅ (Completed by P1)] **Task 1.7:** Curate Golden Sample course material in `data/sample_courses/math_calculus/` (Syllabus, Notes, Past Paper).
- [✅ (Completed by P1)] **Task 1.8:** Build initial Ingestion drag-and-drop dropzone UI shell in `frontend/src/pages/IngestionPage.tsx`.

#### P3: Stage 2 — Metacognitive Intake & Diagnostic Probe
- [✅ (Completed by P1)] **Task 1.9:** Implement backend intake router stub in `backend/api/intake.py` returning `mock_probe.json`.
- [✅ (Completed by P1)] **Task 1.10:** Setup AI client wrapper in `ai/client.py` enforcing structured JSON outputs.
- [✅ (Completed by P1)] **Task 1.11:** Build initial Intake consultation chat UI card in `frontend/src/pages/IntakePage.tsx`.

#### P4: Stage 3 — Forensic Step-Diff & Socratic Co-Pilot
- [✅ (Completed by P1)] **Task 1.12:** Implement backend submissions router stub in `backend/api/submissions.py` returning `mock_forensic_diff.json`.
- [✅ (Completed by P1)] **Task 1.13:** Build side-by-side Step Diff component shell in `frontend/src/pages/ForensicsPage.tsx`.
- [✅ (Completed by P1)] **Task 1.14:** Test Gemini prompt parsing handwritten student answer steps against rubric steps in `ai/forensics/step_parser.py`.

#### P5: Stage 5/6 — Marks Recovery Map & Multimodal Studio
- [✅ (Completed by P1)] **Task 1.15:** Implement backend recovery and studio router stubs in `backend/api/recovery.py` and `backend/api/interventions.py`.
- [✅ (Completed by P1)] **Task 1.16:** Setup benchmark manifest in `evaluation/benchmark_manifest.json` for 15 test cases.
- [✅ (Completed by P1)] **Task 1.17:** Build initial Marks Recovery table and Multimodal Studio tab player in `frontend/src/pages/InterventionStudio.tsx`.

---

### Day 2: Stage 1 (Smart Ingestion) & Stage 2 (Intake Consultation & Diagnostic Probe)

#### P1: Core Systems & Integration
- [✅] **Task 2.1:** Review Day 1 PRs, merge into `dev`, verify walking skeleton connects UI $\to$ Backend.
- [✅] **Task 2.2:** Build Mission Control Dashboard in `frontend/src/pages/DashboardPage.tsx` displaying course overview and readiness score.

#### P2: Stage 1 Pod (Ingestion & RAG)
- [✅ (Completed by P1)] **Task 2.3:** Build Multi-Document Auto-Triage Classifier (`rag/ingestion/classifier.py`) categorizing Syllabus vs Notes vs Past Paper.
- [✅ (Completed by P1)] **Task 2.4:** Build PyMuPDF chunking and ChromaDB vector indexing (`rag/retrieval/vector_store.py`).
- [✅ (Completed by P1)] **Task 2.5:** Connect Ingestion UI dropzone to live `POST /api/courses/{id}/documents/upload` endpoint; render smart badges.

#### P3: Stage 2 Pod (Intake & Probe)
- [✅ (Completed by P1)] **Task 2.6:** Build 3-turn Intake Triage Agent prompt (`ai/diagnostics/intake_agent.py`) extracting target score and friction topics.
- [✅ (Completed by P1)] **Task 2.7:** Build Mode A "10-Minute Diagnostic Probe" generator (`ai/diagnostics/probe_generator.py`) serving 3 calibrated hinge questions.
- [✅ (Completed by P1)] **Task 2.8:** Connect Intake UI to live `POST /api/intake/chat` and render Mode A interactive scratchpad.

#### P4: Stage 3 Pod (Forensics)
- [✅ (Completed by P1)] **Task 2.9:** Build Step-Divergence detection prompt (`ai/forensics/divergence_detector.py`) pin-pointing exact leak point.
- [✅ (Completed by P1)] **Task 2.10:** Build Error Taxonomy classifier tagging `procedural_calculation`, `method_selection`, `conceptual_misunderstanding`.

#### P5: Stage 5/6 Pod (Recovery & Studio)
- [✅ (Completed by P1)] **Task 2.11:** Build Marks Recovery ROI ranking algorithm (`ai/diagnostics/recovery_ranker.py`).
- [✅ (Completed by P1)] **Task 2.12:** Annotate first 5 ground-truth benchmark cases in `evaluation/data/annotated_cases.json`.

---

### Day 3: Stage 3 (Forensic Step-Diff & Socratic Chat) & Stage 4 (Error Fingerprint)

#### P1: Core Systems & Integration
- [✅] **Task 3.1:** Merge Day 2 PRs; test that uploaded documents feed into Stage 2 Diagnostic Probe.
- [✅] **Task 3.2:** Wire Course Database persistence into `backend/main.py`.

#### P2: Stage 1 Pod (Ingestion & RAG)
- [✅ (Completed by P1)] **Task 3.3:** Build RAG Citation Retriever (`rag/retrieval/citation_engine.py`) extracting slide/page quotes for diverged steps.
- [✅ (Completed by P1)] **Task 3.4:** Optimize vector search latency and caching for live demo.

#### P3: Stage 2 Pod (Intake & Probe)
- [✅ (Completed by P1)] **Task 3.5:** Build Dual-Mode Diagnostic toggle: Mode A (Probe) vs Mode B (Exam Paper Upload with handwriting crops).
- [✅ (Completed by P1)] **Task 3.6:** Wire completed diagnostic probe submissions into Stage 3 forensics endpoint.

#### P4: Stage 3 Pod (Forensics)
- [✅ (Completed by P1)] **Task 3.7:** Build live `POST /api/submissions/analyze` endpoint calling real VLM divergence detector with dynamic citation attachment.
- [✅ (Completed by P1)] **Task 3.8:** Build Socratic Chat co-pilot endpoint (`backend/api/forensics_chat.py` & `ai/forensics/socratic_copilot.py`) citing lecture notes via P2's RAG retriever.
- [✅ (Completed by P1)] **Task 3.9:** Build Side-by-Side Visual Step Diff component with red/amber divergence highlights and uncertainty badge inline selector (`frontend/src/pages/ForensicsPage.tsx`).
- [✅ (Completed by P1)] **Task 3.10:** Build Cognitive Error Fingerprint breakdown card in `frontend/src/components/fingerprint/ErrorFingerprint.tsx` and SQLite analytics router (`backend/api/fingerprint.py`).

#### P5: Stage 5/6 Pod (Recovery & Studio)
- [✅ (Completed by P1)] **Task 3.11:** Build Multimodal Content Generators: Real-World Analogy generator and Mermaid Flowchart generator (`ai/intervention/`).
- [✅ (Completed by P1)] **Task 3.12:** Annotate cases 6–10 in `evaluation/data/annotated_cases.json` and build Benchmark Runner (`evaluation/runner.py`).

---

### Day 4: Stage 5 (Recovery Map), Stage 6 (Studio) & Stage 7 (Reassessment & Twin)

#### P1: Core Systems & Integration
- [✅] **Task 4.1:** Merge Day 3 PRs; verify end-to-end data pipeline from Stage 1 through Stage 4.
- [✅] **Task 4.2:** Integrate live Bayesian Learning Twin updates upon reassessment completion.

#### P2: Stage 1 Pod (Ingestion & RAG)
- [✅ (Completed by P1)] **Task 4.3:** Connect citation engine to Multimodal Studio prompts for lecture note grounding.
- [✅ (Completed by P1)] **Task 4.4:** Finalize sample course documents (Calculus + Macroeconomics).

#### P3: Stage 2 Pod (Intake & Probe)
- [✅ (Completed by P1)] **Task 4.5:** Polish Intake conversational styling and add quick-select chip suggestions ("I'm aiming for 75+", "Have 5 days").

#### P4: Stage 3 Pod (Forensics)
- [✅ (Completed by P1)] **Task 4.6:** Conduct dry runs on messy handwriting crops; ensure uncertainty badges trigger reliably.
- [✅ (Completed by P1)] **Task 4.7:** Polish Socratic chat drawer animation and citation pill click-throughs.

#### P5: Stage 5/6 Pod (Recovery & Studio)
- [✅ (Completed by P1)] **Task 4.8:** Build 60-Second Audio Deconstruction generator (`ai/intervention/audio_generator.py`) via ElevenLabs / Web Speech synthesis.
- [✅ (Completed by P1)] **Task 4.9:** Build Spot-the-Bug interactive drill generator and Isomorphic Reassessment question generator.
- [✅ (Completed by P1)] **Task 4.10:** Build Reassessment verification API (`POST /api/reassessment/verify`) calling P1's Learning Twin update function.
- [✅ (Completed by P1)] **Task 4.11:** Build Reassessment input view & live celebratory Learning Twin update modal in `frontend/src/pages/ReassessmentPage.tsx`.
- [✅ (Completed by P1)] **Task 4.12:** Annotate cases 11–15 (15 total benchmark cases complete).

---

### Day 5: Demo Lock, 15-Case Benchmark, Backup Video & Pitch

#### P1: Core Systems & Integration
- [✅] **Task 5.1:** Full Code Freeze on `dev` $\to$ Merge to `main`. Tag `v1.0.0-hackathon`.
- [✅] **Task 5.2:** Create one-click demo startup script (`./run_demo.sh`) and pre-seed demo database (`backend/scripts/seed_demo_data.py`).
- [✅] **Task 5.3:** Finalize 3-Minute Live Demo Pitch Script & Slide Deck.

#### P2: Stage 1 Pod (Ingestion & RAG)
- [✅ (Completed by P1)] **Task 5.4:** Verify all document badges and citations display instant slide numbers during demo walkthrough.

#### P3: Stage 2 Pod (Intake & Probe)
- [✅ (Completed by P1)] **Task 5.5:** Verify Intake consultation runs smoothly without lag on live stage.

#### P4: Stage 3 Pod (Forensics)
- [✅ (Completed by P1)] **Task 5.6:** Rehearse the live "Step Divergence & Uncertainty" interaction sequence.

#### P5: Stage 5/6 Pod (Recovery & Studio)
- [ ] **Task 5.7:** Run 15-case benchmark evaluation runner (`evaluation/runner.py`) and export Macro-F1 / accuracy charts for pitch slides.
- [ ] **Task 5.8:** Record high-definition 3-minute backup demo screen recording (with voiceover).
