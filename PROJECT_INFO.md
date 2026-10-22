# EduTrace AI — Master Project Specification & Product Blueprint

**Project Title:** EduTrace AI — Intelligent Academic Performance & Metacognitive Intervention System  
**Team:** Cognix  
**Category:** Universal AI Academic Diagnosis, Personalized Modality Discovery, and Progress Verification  
**Target Build Window:** 15-Day Hackathon Implementation  
**Status:** Finalized Master Specification (Version 2.0 — Subject-Agnostic & Metacognitive Expansion)  
**Last Updated:** October 2026  

---

## Table of Contents
1. [Executive Summary & Core Thesis](#1-executive-summary--core-thesis)
2. [Product Philosophy & Differentiation](#2-product-philosophy--differentiation)
3. [The 4 Universal Knowledge Archetypes (Subject-Agnostic Engine)](#3-the-4-universal-knowledge-archetypes-subject-agnostic-engine)
4. [Master 7-Stage End-to-End Workflow](#4-master-7-stage-end-to-end-workflow)
   - [Stage 1: Smart Ingestion & Multi-Doc Auto-Triage](#stage-1-smart-ingestion--multi-doc-auto-triage)
   - [Stage 2: Metacognitive Intake Consultation & Dual-Mode Diagnostic](#stage-2-metacognitive-intake-consultation--dual-mode-diagnostic)
   - [Stage 3: Forensic Step-Diff & Interactive Socratic Chat](#stage-3-forensic-step-diff--interactive-socratic-chat)
   - [Stage 4: Cognitive Error Fingerprint & Empirical Modality Discovery](#stage-4-cognitive-error-fingerprint--empirical-modality-discovery)
   - [Stage 5: Marks Recovery Map (Goal-Aligned ROI Engine)](#stage-5-marks-recovery-map-goal-aligned-roi-engine)
   - [Stage 6: Multimodal Intervention Studio](#stage-6-multimodal-intervention-studio)
   - [Stage 7: Closed-Loop Reassessment & The Metacognitive Learning Twin](#stage-7-closed-loop-reassessment--the-metacognitive-learning-twin)
5. [The Metacognitive Profiling Engine](#5-the-metacognitive-profiling-engine)
6. [Core Technical Architecture](#6-core-technical-architecture)
7. [Proposed Technology Stack](#7-proposed-technology-stack)
8. [Data Models & API Contracts](#8-data-models--api-contracts)
9. [Judge Defense Playbook & Competitive Landscape](#9-judge-defense-playbook--competitive-landscape)
10. [Evaluation Plan & Benchmark Methodology](#10-evaluation-plan--benchmark-methodology)
11. [15-Day Implementation Roadmap](#11-15-day-implementation-roadmap)
12. [Five-Person Team Structure & Responsibilities](#12-five-person-team-structure--responsibilities)
13. [Future Expansion Roadmap (Post-Hackathon)](#13-future-expansion-roadmap-post-hackathon)

---

## 1. Executive Summary & Core Thesis

### The Problem
Millions of students study by passively re-reading notes or highlighting textbooks for hours, yet still score poorly on examinations. When they fail, they blame themselves—assuming they lack the aptitude for the subject. 

In reality, academic failure stems from two interconnected failures:
1. **Lack of Forensic Visibility:** Students know their final mark (e.g., 54/100), but have no idea which specific cognitive failure modes (calculation sign flips, method-selection errors, superficial definition recall, or missing rubric criteria) leaked those marks.
2. **Lack of Metacognitive Awareness:** Students do not know *how* their own brain encodes information best. They default to passive study habits that yield under 30% retention.

### The Solution: EduTrace AI
**EduTrace AI is a universal academic diagnostic and metacognitive intervention platform that identifies why a student loses marks, discovers the study techniques and modalities that actually work for their brain, delivers targeted interventions, and proves improvement through closed-loop reassessment.**

### Core Product Workflow
$$\text{Ingest} \longrightarrow \text{Consult} \longrightarrow \text{Diagnose} \longrightarrow \text{Discover Modality} \longrightarrow \text{Prioritize (ROI)} \longrightarrow \text{Intervene} \longrightarrow \text{Reassess} \longrightarrow \text{Update Twin}$$

### The Core Promise
> **"Find your marks leaks. Discover how your brain learns best. Prove you've improved."**

---

## 2. Product Philosophy & Differentiation

EduTrace AI is deliberately differentiated from existing tools:

| Dimension | Generic LLMs (ChatGPT / Claude) | Google NotebookLM | Institutional Tools (Gradescope) | **EduTrace AI** |
|---|---|---|---|---|
| **Primary Paradigm** | Conversational Chatbot | Passive Information Synthesis | Automated Grading for Professors | **Metacognitive Telemetry & Forensic Remediation** |
| **Input Focus** | User Prompt | Uploaded Sources / Notes | Student Exam Papers | Syllabus + Notes + PYQs + **Student Working** |
| **Output** | Essay-style text feedback | Summaries, FAQs, Audio Overviews | Grades, rubric deductions | **Step-Divergence Diffs, Error Fingerprints, Marks Recovery Map** |
| **Learner Profiling** | Ephemeral chat context | None | None | **Persistent Metacognitive Learning Twin** |
| **Intervention** | Generic explanations | Passive audio/text consumption | None (Grading only) | **Goal-Aligned Multimodal Drills + Fresh Reassessment** |
| **Core Value** | "Ask anything" | "Understand your notes" | "Grade faster" | **"Plug your marks leaks and master how you learn"** |

---

## 3. The 4 Universal Knowledge Archetypes (Subject-Agnostic Engine)

EduTrace operates across any academic discipline by mapping subjects into **Four Universal Cognitive Archetypes** grounded in Bloom's Revised Taxonomy and Cognitive Load Theory:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        THE 4 UNIVERSAL KNOWLEDGE ARCHETYPES                            │
├──────────────────────────┬───────────────────────────┬─────────────────────────────────┤
│ Archetype                │ Representative Fields     │ Diagnostic & Remediation Focus  │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ 1. Procedural & Logical  │ Math, Computer Science,   │ • Step-divergence detection     │
│    Execution             │ Accounting, Chem Kinetics │ • Calculation & sign leak checks│
│                          │                           │ • Bug-hunting & spot-the-error  │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ 2. Conceptual & System   │ Economics, Physics,       │ • Causal mechanism testing      │
│    Dynamics              │ Psychology, Sociology     │ • Real-world analogies          │
│                          │                           │ • Interactive dynamic diagrams  │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ 3. Factual & Relational  │ Biology, Anatomy, History,│ • Active recall ladders         │
│    Association           │ Pharmacology, Geography   │ • Spaced micro-retrieval        │
│                          │                           │ • Narrative mnemonic anchors    │
├──────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ 4. Evaluative & Essay    │ Law, Literature, Political│ • Rubric criterion alignment    │
│    Synthesis             │ Science, Philosophy       │ • Argument structure checklists │
│                          │                           │ • Comparative claim validation  │
└──────────────────────────┴───────────────────────────┴─────────────────────────────────┘
```

When documents are uploaded, EduTrace’s auto-triage classifier identifies the domain archetype and tailors the diagnostic probes, error taxonomy, and remediation modalities accordingly.

---

## 4. Master 7-Stage End-to-End Workflow

```
                               ┌────────────────────────────────┐
                               │   STAGE 1: SMART INGESTION     │
                               │   Multi-Doc Auto-Classification│
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │   STAGE 2: INTAKE & DIAGNOSTIC │
                               │   Goal Consultation + Dual Mode│
                               └───────┬────────────────┬───────┘
                                       │                │
                        ┌──────────────┴──┐          ┌──┴──────────────┐
                        ▼ Mode A          │          │ Mode B          ▼
            [ 10-Min Diagnostic Probe ]   │          │ [ Exam / Homework Autopsy ]
                        └──────────────┬──┘          └──┬──────────────┘
                                       │                │
                                       └───────┬────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │  STAGE 3: FORENSIC STEP-DIFF   │
                               │  Visual Divergence & Socratic  │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │ STAGE 4: COGNITIVE FINGERPRINT │
                               │ Behavioral Telemetry & Modality│
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │   STAGE 5: MARKS RECOVERY MAP  │
                               │   ROI-Ranked Action Priorities │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │ STAGE 6: INTERVENTION STUDIO   │
                               │ Multimodal Remediation Drills  │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │ STAGE 7: CLOSED-LOOP REASSESS  │
                               │ Isomorphic Test & Twin Update  │
                               └────────────────────────────────┘
```

---

### Stage 1: Smart Ingestion & Multi-Doc Auto-Triage
* **Zero Manual Tagging:** The student drops multiple files simultaneously (PDFs, docs, images).
* **Document Auto-Classification:** A lightweight 2-page heuristic and embedding classifier labels each file:
  * `SYLLABUS`: Extracted for exam weightage, module breakdowns, and textbook references.
  * `PAST_PAPERS`: Extracted for recurring question patterns, frequency matrices, and historical mark distributions.
  * `LECTURE_NOTES`: Chunked and indexed with page/slide metadata for RAG retrieval.
  * `MODEL_SOLUTIONS / RUBRICS`: Indexed for expected criteria steps.
* **UI Feedback:** Interactive smart pill badges displayed within 2 seconds:
  `[ 📋 Syllabus • Syll_2026.pdf ] [ 📝 Past Paper • Final_2024.pdf ] [ 📖 Notes • Module2.pdf ]` (Editable if needed).

---

### Stage 2: Metacognitive Intake Consultation & Dual-Mode Diagnostic

#### 1. The Intake Consultation (Empathetic Academic Triage)
A quick 2-to-3 turn interactive conversation to align system goals with student reality:
1. **Target Score & Time Window:** E.g., *"Exam in 5 days; currently at 50%, aiming for 70%."*
2. **Self-Reported Friction:** E.g., *"I've read the notes three times, but nothing sticks during problem sets."*
3. **Goal-Aligned Diagnostic Calibration:** EduTrace matches the target score against syllabus topic weightages to formulate the highest-value diagnostic probe.

#### 2. Dual-Mode Entry Selection
* **Mode A: The 10-Minute Diagnostic Probe (Cold-Start / Zero-Friction)**
  * *Purpose:* For students preparing before an exam, without old physical papers.
  * *Mechanism:* Generates or serves 3–4 calibrated "Hinge Questions" specifically designed to test common cognitive traps (e.g., method selection, bracket distribution, causal connection).
  * *Input:* Digital step scratchpad, interactive formula editor, or single-photo desk snapshot.
* **Mode B: The Forensic Exam Autopsy (Physical Upload)**
  * *Purpose:* For students post-midterm who want to understand why they bled marks.
  * *Mechanism:* Uploads Question Paper + Handwritten Answer Sheet.
  * *Human-in-the-Loop Safeguard:* Side-by-side bounding-box verification. Flags ambiguous handwriting with one-click confirmation badges before analysis runs.

---

### Stage 3: Forensic Step-Diff & Interactive Socratic Chat
* **The Visual Step Diff:** Replaces unstructured chat text with a structured side-by-side comparison:
  * **Column 1:** Student's submitted working (cropped handwritten image or transcribed step).
  * **Column 2:** Expected rubric step & criterion.
  * **Highlight:** Amber/Red leak point pinpointing the exact character, formula inversion, or missing causal link.
* **Integrated Socratic Forensic Chat Drawer:**
  * Students can highlight any step and ask: *"Why is my step wrong here?"* or *"Can't I use method X instead?"*
  * The co-pilot responds strictly grounded in the professor's notes with exact citations (e.g., *"Module 2, Slide 18: Common Traps"*).

---

### Stage 4: Cognitive Error Fingerprint & Empirical Modality Discovery
* **Longitudinal Error Taxonomy Breakdown:**
  * Aggregates errors across attempts into a clear distribution:
    * `Procedural / Calculation Leaks` (e.g., bracket signs, arithmetic)
    * `Method Selection Hesitation` (e.g., choosing substitution over parts)
    * `Superficial Recall / Causal Blindspots` (e.g., definition without mechanism)
    * `Incomplete Reasoning / Rubric Omission` (e.g., missing units, $+C$, missing justification)
* **Empirical Modality Telemetry:**
  * System logs how the student interacts with different explanation formats.
  * Discovers whether the student's comprehension velocity spikes with visual diagrams, concrete metaphors, or step-by-step logic.

---

### Stage 5: Marks Recovery Map (Goal-Aligned ROI Engine)
Prioritizes remediation opportunities using an explicit, transparent formula:
$$\text{Priority}(\text{Skill}) = \text{Normalized Exam Weight} \times \text{Observed Error Burden} \times \text{Remediation Velocity}$$

* **UI Display:** A clean, ranked roadmap showing exactly how to bridge the gap from current score to target goal:
  * `Priority #1: Bracket Sign Distribution (Integration) — 15% Exam Weight — 20 mins to fix — Potential: +8 to +10 Marks`
  * `Priority #2: Monetary Policy Causal Mechanism — 12% Exam Weight — 25 mins to fix — Potential: +6 to +8 Marks`
* Shows the exact total study time required to hit the declared target score.

---

### Stage 6: Multimodal Intervention Studio
EduTrace translates dense course notes into the student's optimal cognitive modality:
1. **Option A: Real-World Analogy Synthesizer:** Grounds abstract principles in intuitive, memorable everyday metaphors.
2. **Option B: Visual System Flowchart / Concept Map:** Generates clean diagrams (Mermaid / SVG) showing causal links or algebraic transformations.
3. **Option C: NotebookLM-Style 60-Second Audio Deconstruction:** A friendly, concise audio walkthrough explaining the intuition and common pitfalls directly from the professor's notes.
4. **Option D: Active "Spot-the-Bug" & Feynman Drills:** Interactive exercises where students identify the error in a sample solution or explain the concept back in plain English.

---

### Stage 7: Closed-Loop Reassessment & The Metacognitive Learning Twin
* **Fresh Isomorphic Challenge:** Serves a brand-new, un-memorized question of identical difficulty targeting the exact same cognitive hinge (never repeats the original question).
* **Proof of Improvement:** Measures whether the student successfully navigates the trap.
* **Live Learning Twin Update:**
  * Updates the Beta-Binomial Bayesian mastery estimate $(\alpha, \beta)$ and shrinks the uncertainty interval.
  * Decreases the error propensity score.
  * Updates the **Marks Recovered Milestone** on the dashboard.

---

## 5. The Metacognitive Profiling Engine

### What We Track (The Learning Twin State Vector)
Instead of discredited, static labels ("visual learner"), EduTrace tracks dynamic, evidence-backed telemetry:

```json
{
  "student_id": "usr_9481",
  "course_id": "econ_201",
  "target_score": 75,
  "current_baseline": 52,
  "skills": {
    "monetary_policy_causality": {
      "alpha": 8.0,
      "beta": 3.0,
      "mastery_estimate": 0.72,
      "uncertainty_range": [0.58, 0.84],
      "error_distribution": {
        "causal_blindspot": 0.45,
        "definition_recall": 0.10
      },
      "last_tested": "2026-10-12T14:30:00Z"
    }
  },
  "modality_affinity": {
    "visual_flowchart": 0.88,
    "real_world_analogy": 0.82,
    "textual_deduction": 0.35,
    "audio_synthesis": 0.76
  },
  "metacognitive_metrics": {
    "confidence_calibration_score": 0.74,
    "average_comprehension_latency_sec": 42.5
  }
}
```

### Empirical Discovery Algorithm (A/B Cognitive Probing)
1. When a new conceptual roadblock is detected, present remediation using two contrasting representations.
2. Measure:
   - Time to complete follow-up check.
   - Accuracy on immediate transfer question.
   - Hint requests.
3. Update `modality_affinity` weights using exponential smoothing.
4. Default to the highest-affinity modality for future interventions while periodically exploring alternative techniques.

---

## 6. Core Technical Architecture

EduTrace AI is architected as a **modular monolith** optimized for rapid hackathon iteration, high reliability, and clear team boundaries.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      REACT + TYPESCRIPT FRONTEND                       │
│  • Mission Control Dashboard    • Forensic Step-Diff Viewer            │
│  • Interactive Socratic Drawer  • Intervention Studio & Modality Player│
│  • Marks Recovery Roadmap       • Metacognitive Twin Visualizer        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND CORE                            │
│  • Auto-Triage Ingestion API    • Forensic Diagnosis Orchestrator      │
│  • Metacognitive State Manager  • Marks Recovery Prioritization Engine │
│  • RAG Knowledge Retriever      • Multi-Modal Generation Dispatcher    │
└──────────────┬────────────────────┬────────────────────┬───────────────┘
               │                    │                    │
               ▼                    ▼                    ▼
     ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
     │  POSTGRESQL DB   │ │  PGVECTOR STORE  │ │ LLM / VLM CLIENT │
     │  Users, Courses, │ │  Embeddings for  │ │ Structured JSON  │
     │  Submissions,    │ │  Syllabus, Notes,│ │ Pydantic outputs │
     │  Learning Twins  │ │  PYQ chunks      │ │ Vision OCR steps │
     └──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 7. Proposed Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite | Component modularity, rich interactive diffs, fast compilation. |
| **Styling** | Tailwind CSS + Lucide Icons | Rapid UI construction with clean academic aesthetics. |
| **Backend API** | Python 3.11+ + FastAPI | Asynchronous performance, native AI library ecosystem, auto OpenAPI docs. |
| **Data Validation** | Pydantic v2 | Strict JSON schema contracts between LLM, backend, and frontend. |
| **Database** | PostgreSQL | Robust relational storage for courses, attempts, and learning twins. |
| **Vector Engine** | pgvector / ChromaDB | Simple, embeddable vector storage for course notes and rubrics. |
| **Doc Processing**| PyMuPDF (fitz) + Tesseract/VLM | Fast, accurate PDF parsing and multi-page text/image extraction. |
| **AI Provider** | Gemini 1.5 Pro / Flash or Claude 3.5 Sonnet | Multimodal vision capabilities, long-context notes processing, reliable structured outputs. |
| **Audio Gen** | ElevenLabs API / Web Speech API | Seamless generation of 60-second NotebookLM-style micro-audio breakdowns. |

---

## 8. Data Models & API Contracts

### Key Database Entities
* `User`: Credentials, profile, study preferences.
* `Course`: Title, subject archetype (`procedural`, `conceptual`, `factual`, `evaluative`), exam date, target score.
* `Document`: Raw file, classified type (`syllabus`, `notes`, `past_paper`, `rubric`), processed chunk index.
* `DiagnosticSession`: Intake conversation transcript, mode used (`probe` vs `exam_upload`), raw submissions.
* `SubmissionStep`: Step index, student transcription, rubric criterion, status (`satisfied`, `diverged`), error tag.
* `ErrorRecord`: Classified error taxonomy enum, confidence score, evidence snippet, citation link.
* `LearningTwin`: Per-skill $\alpha, \beta$ mastery parameters, error propensities, modality affinities.
* `InterventionItem`: Generated remediation artifacts (analogy, flowchart SVG, audio URL, practice item).

### Key API Endpoints
* `POST /api/courses`: Create course workspace with target score and exam date.
* `POST /api/courses/{id}/documents/triage`: Upload multiple files $\to$ auto-classify into types.
* `POST /api/intake/consult`: Conversational intake turns to formulate target diagnostic probe.
* `POST /api/diagnostic/probe`: Fetch or generate calibrated 3-question probe based on syllabus weights.
* `POST /api/submissions/forensics`: Ingest student answer (image or text) $\to$ generate step-divergence diff.
* `POST /api/forensics/{id}/chat`: Socratic interactive chat grounded in course notes.
* `GET /api/courses/{id}/marks-recovery`: Compute ROI-ranked recovery opportunities.
* `POST /api/interventions/generate`: Generate multimodal intervention (analogy, flowchart, audio clip).
* `POST /api/reassessment/verify`: Submit fresh answer $\to$ update Learning Twin state.

---

## 9. Judge Defense Playbook & Competitive Landscape

### Attack 1: "Isn't this just a ChatGPT wrapper?"
**Defense:** *"ChatGPT is an unconstrained conversational chatbot that generates essays that disappear into chat logs. EduTrace is an **observational state machine**. It extracts structured telemetry from student working, aligns it against syllabus rubrics, updates a Bayesian Learning Twin $(\alpha, \beta)$, calculates a mathematical Marks Recovery Map, and closes the loop with fresh reassessment. It is post-exam telemetry, not a chatbot."*

### Attack 2: "How is this different from Google NotebookLM?"
**Defense:** *"NotebookLM is passive synthesis: it summarizes notes, generates FAQs, and creates audio podcasts so you understand the text. EduTrace is **active diagnostic forensics**: it tests where your brain fails, measures your recurring cognitive error patterns, automatically discovers which learning modality improves your retention, and quantifies your recovered marks."*

### Attack 3: "Handwritten OCR and AI grading are notoriously unreliable."
**Defense:** *"We explicitly designed EduTrace around the 2026 DrawEduMath findings on VLM limitations. We never pretend the AI is infallible. Our UI features **Calibrated Uncertainty & Human-in-the-Loop Verification**: it displays original handwriting crops side-by-side with transcription, flags ambiguous characters for one-click student confirmation, and allows manual step overrides."*

### Attack 4: "Re-testing immediately after teaching is just testing short-term recall."
**Defense:** *"Our reassessment never repeats the same question or simply changes numbers. It serves an **isomorphic question testing the identical cognitive hinge** (e.g., testing method selection across 3 new options, or testing bracket expansion in a new problem). We verify skill transfer, not rote memorization."*

---

## 10. Evaluation Plan & Benchmark Methodology

To prove scientific rigor to judges, Cognix will evaluate EduTrace against a ground-truth benchmark:
1. **Benchmark Dataset:** 30 curated multi-subject student answers containing known deliberate errors (sign flips, method confusion, superficial recall, rubric omissions).
2. **Metrics:**
   - **Error Classification Macro-F1:** Measuring precision and recall across our error taxonomy against human-annotated ground truth.
   - **Step Divergence Accuracy:** Percentage of cases where the exact point of error was correctly localized.
   - **RAG Citation Grounding Rate:** Percentage of feedback claims supported by authentic document citations.
   - **Uncertainty Flag Calibration:** Proportion of ambiguous/messy inputs correctly flagged for user confirmation.

---

## 11. 15-Day Implementation Roadmap

```
  DAYS 1-2: CONTRACTS & SKELETON FREEZE
  • Repository scaffold (FastAPI + React TS)
  • Lock Pydantic schemas, error taxonomy, DB models
  • Golden demo datasets (Math + Economics/Bio test packs)
  
  DAYS 3-5: SMART INGESTION & INTAKE CONSULTATION
  • Multi-doc auto-triage ingestion endpoint & classifier
  • Conversational intake triage agent
  • Mode A Diagnostic Probe generator
  
  DAYS 6-8: FORENSICS ENGINE & SOCRATIC CHAT
  • Step-divergence diff pipeline
  • OCR / Vision crop alignment with uncertainty badges
  • RAG course-notes citation engine + Socratic chat drawer
  
  DAYS 9-10: METACOGNITIVE TWIN & MARKS RECOVERY MAP
  • Bayesian Learning Twin persistence (Beta-Binomial)
  • Error Fingerprint aggregation view
  • Marks Recovery Map ROI algorithm
  
  DAYS 11-12: MULTIMODAL STUDIO & CLOSED-LOOP REASSESSMENT
  • Analogy, flowchart (Mermaid/SVG), and audio deconstruction generators
  • Fresh isomorphic reassessment pipeline
  • Live Learning Twin real-time update animation
  
  DAYS 13-14: BENCHMARK EVALUATION & POLISH
  • Run 30-sample benchmark & record F1 metrics
  • Edge-case testing (messy handwriting, ambiguous prompts)
  • Clean UI polish and demo rehearsing
  
  DAY 15: CODE FREEZE & DEMO REHEARSAL
  • Freeze master branch
  • Rehearse the 3-minute pitch walkthrough
```

---

## 12. Five-Person Team Structure & Responsibilities (Vertical Feature Pods)

The team operates using **Full-Stack Vertical Feature Pods**, where every teammate owns an entire feature pipeline end-to-end (Backend router + AI/RAG engine + Frontend page). This ensures equal technical responsibility, parallel execution with zero blocking, and zero Git collisions:

1. **P1: Tech Lead & Core Systems (Feature Pillar 1):**
   - Core API contracts, master schemas, Git integration gatekeeper, release readiness.
   - Master backend server (`backend/main.py`), database setup (`backend/db/*`), and the Bayesian Learning Twin engine (`backend/services/twin_service.py`).
   - Frontend master shell navigation (`frontend/src/App.tsx`) and Academic Mission Control (`DashboardPage.tsx`).
2. **P2: Stage 1 — Smart Ingestion & Course Knowledge RAG (Feature Pillar 2):**
   - Multi-file upload backend router (`backend/api/documents.py`).
   - Document auto-triage classifier, PyMuPDF extraction, ChromaDB vector indexing, and citation retriever (`rag/*`).
   - Drag-and-drop ingestion UI with instant auto-classification badges (`frontend/src/pages/IngestionPage.tsx`).
3. **P3: Stage 2 — Metacognitive Intake & Diagnostic Probe (Feature Pillar 3):**
   - Intake session backend router (`backend/api/intake.py`).
   - Conversational intake triage agent prompt and calibrated 10-Minute Diagnostic Probe generator (`ai/diagnostics/*`).
   - Conversational intake UI card and Mode A diagnostic probe scratchpad (`frontend/src/pages/IntakePage.tsx`).
4. **P4: Stage 3 — Forensic Step-Diff & Socratic RAG Co-Pilot (Feature Pillar 4):**
   - Submissions analysis router (`backend/api/submissions.py`) and Socratic chat router (`backend/api/forensics_chat.py`).
   - Handwritten step parser, Step-Divergence detector, Error Taxonomy classifier, and Socratic co-pilot citing lecture notes (`ai/forensics/*`).
   - Side-by-side Visual Step-Diff component with red/amber divergence highlights and Socratic chat drawer (`frontend/src/pages/ForensicsPage.tsx`).
5. **P5: Stage 5/6 — Marks Recovery Map & Multimodal Studio (Feature Pillar 5):**
   - Marks Recovery router (`backend/api/recovery.py`), Intervention router (`backend/api/interventions.py`), and Reassessment router (`backend/api/reassessment.py`).
   - Marks Recovery ROI ranker, 60s Audio deconstruction generator (ElevenLabs / Web Speech), Analogy & Mermaid Flowchart generators, and Spot-the-Bug drills (`ai/intervention/*`).
   - Marks Recovery Roadmap screen, Multimodal Studio player with audio waveform, Reassessment input view, and 15-case benchmark evaluation runner (`frontend/src/pages/InterventionStudio.tsx`, `evaluation/*`).

---

## 13. Future Expansion Roadmap (Post-Hackathon)
* **Real-time Voice Socratic Tutor:** Full duplex low-latency voice consultation during problem-solving.
* **Canvas Whiteboard Live Ingestion:** Direct stylus handwriting tracking on iPad/tablets.
* **LMS & Classroom Integrations:** Seamless canvas/Moodle integration for automated homework forensics.
* **Cohort-Wide Mark Leak Analytics:** Institutional dashboard for professors to identify which slides or concepts leak the most marks across 500 students.

---

*EduTrace AI — Developed by Team Cognix.*  
*Confidential — Implementation Blueprint for Hackathon Execution.*
