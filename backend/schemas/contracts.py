"""
EduTrace AI — Master Pydantic Data Contracts & Schemas
Single Source of Truth for all Backend, AI, and Evaluation Pipelines.
Mirrored 1:1 in frontend/src/types/schema.ts
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# =====================================================================
# Core Enumerations
# =====================================================================

class KnowledgeArchetype(str, Enum):
    PROCEDURAL = "procedural"      # Math, CS, Accounting
    CONCEPTUAL = "conceptual"      # Economics, Physics, Psychology
    FACTUAL = "factual"            # Biology, History, Anatomy
    EVALUATIVE = "evaluative"      # Law, Literature, Philosophy


class DocumentType(str, Enum):
    SYLLABUS = "syllabus"
    PAST_PAPER = "past_paper"
    LECTURE_NOTES = "lecture_notes"
    RUBRIC = "rubric"
    UNKNOWN = "unknown"


class DiagnosticMode(str, Enum):
    PROBE = "probe"                # Mode A: 10-Minute Diagnostic Probe (Cold-Start)
    EXAM_UPLOAD = "exam_upload"    # Mode B: Forensic Physical Exam / Homework Scan


class ErrorTaxonomy(str, Enum):
    CONCEPTUAL_MISUNDERSTANDING = "conceptual_misunderstanding"
    METHOD_SELECTION = "method_selection"
    PROCEDURAL_CALCULATION = "procedural_calculation"
    INCOMPLETE_REASONING = "incomplete_reasoning"
    QUESTION_INTERPRETATION = "question_interpretation"
    CAUSAL_BLINDSPOT = "causal_blindspot"
    RUBRIC_OMISSION = "rubric_omission"
    ATTEMPT_TIME_PRESSURE = "attempt_time_pressure"


class ModalityType(str, Enum):
    REAL_WORLD_ANALOGY = "real_world_analogy"
    VISUAL_FLOWCHART = "visual_flowchart"
    AUDIO_DECONSTRUCTION = "audio_deconstruction"
    SPOT_THE_BUG = "spot_the_bug"
    FEYNMAN_TEACHBACK = "feynman_teachback"
    STEP_FLOW = "step_flow"


class StepStatus(str, Enum):
    SATISFIED = "satisfied"
    DIVERGED = "diverged"
    CARRIED_FORWARD_ERROR = "carried_forward_error"
    SKIPPED = "skipped"


# =====================================================================
# Stage 1: Course & Document Ingestion Contracts
# =====================================================================

class CourseCreate(BaseModel):
    title: str = Field(..., json_schema_extra={"example": "Math 301: Multivariable Calculus"})
    subject_archetype: KnowledgeArchetype = Field(default=KnowledgeArchetype.PROCEDURAL)
    target_score: int = Field(default=75, ge=0, le=100)
    current_baseline: Optional[int] = Field(default=50, ge=0, le=100)
    target_exam_date: Optional[str] = Field(None, json_schema_extra={"example": "2026-10-28"})


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    subject_archetype: Optional[KnowledgeArchetype] = None
    target_score: Optional[int] = Field(None, ge=0, le=100)
    current_baseline: Optional[int] = Field(None, ge=0, le=100)
    target_exam_date: Optional[str] = None


class CourseResponse(BaseModel):
    course_id: str
    title: str
    subject_archetype: KnowledgeArchetype
    target_score: int
    current_baseline: int
    target_exam_date: Optional[str]
    created_at: str


class ClassifiedDocument(BaseModel):
    document_id: str
    filename: str
    classified_type: DocumentType
    confidence: float = Field(ge=0.0, le=1.0)
    page_count: int
    topics_detected: List[str] = []
    exam_weight_percentage: Optional[float] = None


class DocumentTriageResponse(BaseModel):
    course_id: str
    documents: List[ClassifiedDocument]
    total_documents: int
    ready_for_intake: bool


# =====================================================================
# Stage 2: Intake Consultation & Diagnostic Probe Contracts
# =====================================================================

class IntakeMessage(BaseModel):
    role: str = Field(..., json_schema_extra={"example": "user"})  # 'user' or 'assistant'
    content: str


class IntakeSessionState(BaseModel):
    session_id: str
    course_id: str
    messages: List[IntakeMessage]
    extracted_target_score: Optional[int] = None
    extracted_timeline_days: Optional[int] = None
    extracted_friction_topics: List[str] = []
    recommended_mode: DiagnosticMode = DiagnosticMode.PROBE
    is_consultation_complete: bool = False


class IntakeConsultResponse(BaseModel):
    assistant_reply: str
    session_state: IntakeSessionState
    ready_for_diagnostic: bool


class HingeQuestion(BaseModel):
    question_id: str
    question_text: str
    target_skill: str
    cognitive_trap_tested: str  # e.g. "Method Selection: Substitution vs Parts"
    estimated_minutes: int = 3
    maximum_marks: int = 10
    rubric_steps: List[str]


class DiagnosticProbeResponse(BaseModel):
    probe_id: str
    course_id: str
    subject_archetype: KnowledgeArchetype
    total_estimated_minutes: int
    questions: List[HingeQuestion]
    calibrated_topics: Optional[List[str]] = None
    calibration_source: Optional[str] = None


class ProbeSubmissionRequest(BaseModel):
    submission_id: str = "sub_probe_01"
    course_id: str = "course_calc_301"
    probe_id: str = "probe_calibrated_calc_01"
    question_id: str = "probe_q2"
    submitted_work: str
    all_answers: Optional[Dict[str, str]] = None


# =====================================================================
# Stage 3: Step-by-Step Forensics & Socratic Chat Contracts
# =====================================================================

class UncertainSegment(BaseModel):
    step_index: int
    character_crop_id: Optional[str] = None
    raw_ocr_guess: str
    suggested_alternatives: List[str] = []
    confidence: float
    confirmed_value: Optional[str] = None


class ModeBAutopsyRequest(BaseModel):
    course_id: str = "course_calc_301"
    question_paper_filename: Optional[str] = None
    answer_sheet_filename: Optional[str] = None
    confirmed_crops: Optional[Dict[str, str]] = None


class ModeBAutopsyResponse(BaseModel):
    submission_id: str
    course_id: str
    mode: str = "exam_autopsy"
    question_detected: str
    total_steps_detected: int
    uncertain_segments: List[UncertainSegment] = []
    ready_for_divergence: bool = True


class AnswerStep(BaseModel):
    step_index: int
    submitted_work: str
    expected_rubric_step: str
    marks_awarded: float
    marks_possible: float
    status: StepStatus
    error_type: Optional[ErrorTaxonomy] = None
    divergence_reason: Optional[str] = None
    cited_source_title: Optional[str] = None
    cited_page_or_slide: Optional[int] = None


class StepDivergenceResult(BaseModel):
    submission_id: str
    question_id: str
    steps: List[AnswerStep]
    first_divergence_step: Optional[int] = None
    primary_error_type: Optional[ErrorTaxonomy] = None
    estimated_marks_obtained: float
    total_possible_marks: float
    uncertain_segments: List[UncertainSegment] = []
    needs_human_review: bool = False
    forensic_summary: str
    course_citations: List[Dict[str, Any]] = []


class SocraticChatRequest(BaseModel):
    submission_id: str
    user_query: Optional[str] = None
    user_question: Optional[str] = None
    selected_step_index: Optional[int] = None


class SocraticChatResponse(BaseModel):
    reply: str
    cited_lecture_title: Optional[str] = None
    cited_page_or_slide: Optional[int] = None
    suggested_followup_question: Optional[str] = None


# =====================================================================
# Stage 4 & 5: Error Fingerprint & Marks Recovery Map Contracts
# =====================================================================

class ErrorFrequency(BaseModel):
    error_type: ErrorTaxonomy
    count: int
    percentage: float
    marks_lost_total: float
    example_question_ids: List[str] = []


class ErrorFingerprintResponse(BaseModel):
    course_id: str
    total_errors_analyzed: int
    total_marks_lost: float
    breakdown: List[ErrorFrequency]
    primary_cognitive_leak: ErrorTaxonomy


class MarksRecoveryItem(BaseModel):
    rank: int
    skill_id: str
    skill_name: str
    diagnosed_error: ErrorTaxonomy
    exam_weight_percentage: float
    estimated_time_minutes: int
    potential_marks_recoverable: float
    rationale: str
    recommended_modality: ModalityType


class MarksRecoveryResponse(BaseModel):
    course_id: str
    current_baseline_score: int
    target_score: int
    marks_gap: int
    total_study_time_minutes: int
    priorities: List[MarksRecoveryItem]


# =====================================================================
# Stage 6 & 7: Multimodal Studio & Reassessment Contracts
# =====================================================================

class MultimodalStudioContent(BaseModel):
    skill_id: str
    skill_name: str
    analogy_title: str
    analogy_content: str
    flowchart_mermaid_code: str
    audio_summary_script: str
    audio_stream_url: Optional[str] = None
    spot_the_bug_question: str
    spot_the_bug_steps: List[Dict[str, Any]]
    bug_step_index: int
    bug_explanation: str
    lecture_citations: Optional[List[Dict[str, Any]]] = None
    lecture_grounding_quote: Optional[str] = None


class ReassessmentQuestion(BaseModel):
    reassessment_id: str
    skill_id: str
    question_text: str
    difficulty_level: str = "comparable"
    maximum_marks: int = 10
    rubric_steps: List[str]


class ReassessmentSubmission(BaseModel):
    reassessment_id: str
    submitted_work: str
    time_taken_seconds: Optional[int] = None
    skill_id: Optional[str] = None
    student_id: Optional[str] = None
    course_id: Optional[str] = None


class ReassessmentResult(BaseModel):
    reassessment_id: str
    skill_id: str
    is_improved: bool
    marks_awarded: float
    marks_possible: float
    new_mastery_estimate: float
    previous_mastery_estimate: float
    uncertainty_interval: List[float]
    marks_recovered_secured: float
    celebration_message: str


# =====================================================================
# Metacognitive Learning Twin Representation
# =====================================================================

class SkillMastery(BaseModel):
    skill_id: str
    skill_name: str
    alpha: float
    beta: float
    mastery_percentage: float
    uncertainty_range: List[float]
    last_tested_timestamp: str


class LearningTwinResponse(BaseModel):
    student_id: str
    course_id: str
    skills: List[SkillMastery]
    overall_readiness_score: float
    modality_affinities: Dict[str, float]
    proven_optimal_technique: str
    total_marks_recovered_to_date: float
