/**
 * EduTrace AI — Master TypeScript Interfaces & Types
 * Mirrored 1:1 from backend/schemas/contracts.py
 * Single Source of Truth for all Frontend Components & Mock Data.
 */

export enum KnowledgeArchetype {
  PROCEDURAL = "procedural",
  CONCEPTUAL = "conceptual",
  FACTUAL = "factual",
  EVALUATIVE = "evaluative"
}

export enum DocumentType {
  SYLLABUS = "syllabus",
  PAST_PAPER = "past_paper",
  LECTURE_NOTES = "lecture_notes",
  RUBRIC = "rubric",
  UNKNOWN = "unknown"
}

export enum DiagnosticMode {
  PROBE = "probe",
  EXAM_UPLOAD = "exam_upload"
}

export enum ErrorTaxonomy {
  CONCEPTUAL_MISUNDERSTANDING = "conceptual_misunderstanding",
  METHOD_SELECTION = "method_selection",
  PROCEDURAL_CALCULATION = "procedural_calculation",
  INCOMPLETE_REASONING = "incomplete_reasoning",
  QUESTION_INTERPRETATION = "question_interpretation",
  CAUSAL_BLINDSPOT = "causal_blindspot",
  RUBRIC_OMISSION = "rubric_omission",
  ATTEMPT_TIME_PRESSURE = "attempt_time_pressure"
}

export enum ModalityType {
  REAL_WORLD_ANALOGY = "real_world_analogy",
  VISUAL_FLOWCHART = "visual_flowchart",
  AUDIO_DECONSTRUCTION = "audio_deconstruction",
  SPOT_THE_BUG = "spot_the_bug",
  FEYNMAN_TEACHBACK = "feynman_teachback",
  STEP_FLOW = "step_flow"
}

export enum StepStatus {
  SATISFIED = "satisfied",
  DIVERGED = "diverged",
  CARRIED_FORWARD_ERROR = "carried_forward_error",
  SKIPPED = "skipped"
}

// Stage 1: Course & Documents
export interface CourseCreate {
  title: string;
  subject_archetype: KnowledgeArchetype;
  target_score: number;
  current_baseline?: number;
  target_exam_date?: string;
}

export interface CourseResponse {
  course_id: string;
  title: string;
  subject_archetype: KnowledgeArchetype;
  target_score: number;
  current_baseline: number;
  target_exam_date?: string;
  created_at: string;
}

export interface ClassifiedDocument {
  document_id: string;
  filename: string;
  classified_type: DocumentType;
  confidence: number;
  page_count: number;
  topics_detected: string[];
  exam_weight_percentage?: number;
}

export interface DocumentTriageResponse {
  course_id: string;
  documents: ClassifiedDocument[];
  total_documents: number;
  ready_for_intake: boolean;
}

// Stage 2: Intake & Diagnostic
export interface IntakeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface IntakeSessionState {
  session_id: string;
  course_id: string;
  messages: IntakeMessage[];
  extracted_target_score?: number;
  extracted_timeline_days?: number;
  extracted_friction_topics: string[];
  recommended_mode: DiagnosticMode;
  is_consultation_complete: boolean;
}

export interface IntakeConsultResponse {
  assistant_reply: string;
  session_state: IntakeSessionState;
  ready_for_diagnostic: boolean;
}

export interface HingeQuestion {
  question_id: string;
  question_text: string;
  target_skill: string;
  cognitive_trap_tested: string;
  estimated_minutes: number;
  maximum_marks: number;
  rubric_steps: string[];
}

export interface DiagnosticProbeResponse {
  probe_id: string;
  course_id: string;
  subject_archetype: KnowledgeArchetype;
  total_estimated_minutes: number;
  questions: HingeQuestion[];
}

// Stage 3: Step-by-Step Forensics & Socratic Chat
export interface UncertainSegment {
  step_index: number;
  character_crop_id?: string;
  raw_ocr_guess: string;
  suggested_alternatives: string[];
  confidence: number;
  confirmed_value?: string;
}

export interface AnswerStep {
  step_index: number;
  submitted_work: string;
  expected_rubric_step: string;
  marks_awarded: number;
  marks_possible: number;
  status: StepStatus;
  error_type?: ErrorTaxonomy;
  divergence_reason?: string;
  cited_source_title?: string;
  cited_page_or_slide?: number;
}

export interface StepDivergenceResult {
  submission_id: string;
  question_id: string;
  steps: AnswerStep[];
  first_divergence_step?: number;
  primary_error_type?: ErrorTaxonomy;
  estimated_marks_obtained: number;
  total_possible_marks: number;
  uncertain_segments: UncertainSegment[];
  needs_human_review: boolean;
  forensic_summary: string;
  course_citations: Record<string, any>[];
}

export interface SocraticChatRequest {
  submission_id: string;
  user_query: string;
  selected_step_index?: number;
}

export interface SocraticChatResponse {
  reply: string;
  cited_lecture_title?: string;
  cited_page_or_slide?: number;
  suggested_followup_question?: string;
}

// Stage 4 & 5: Error Fingerprint & Marks Recovery Map
export interface ErrorFrequency {
  error_type: ErrorTaxonomy;
  count: number;
  percentage: number;
  marks_lost_total: number;
  example_question_ids: string[];
}

export interface ErrorFingerprintResponse {
  course_id: string;
  total_errors_analyzed: number;
  total_marks_lost: number;
  breakdown: ErrorFrequency[];
  primary_cognitive_leak: ErrorTaxonomy;
}

export interface MarksRecoveryItem {
  rank: number;
  skill_id: string;
  skill_name: string;
  diagnosed_error: ErrorTaxonomy;
  exam_weight_percentage: number;
  estimated_time_minutes: number;
  potential_marks_recoverable: number;
  rationale: string;
  recommended_modality: ModalityType;
}

export interface MarksRecoveryResponse {
  course_id: string;
  current_baseline_score: number;
  target_score: number;
  marks_gap: number;
  total_study_time_minutes: number;
  priorities: MarksRecoveryItem[];
}

// Stage 6 & 7: Multimodal Studio & Reassessment
export interface MultimodalStudioContent {
  skill_id: string;
  skill_name: string;
  analogy_title: string;
  analogy_content: string;
  flowchart_mermaid_code: string;
  audio_summary_script: string;
  audio_stream_url?: string;
  spot_the_bug_question: string;
  spot_the_bug_steps: Record<string, any>[];
  bug_step_index: number;
  bug_explanation: string;
}

export interface ReassessmentSubmission {
  reassessment_id: string;
  submitted_work: string;
  time_taken_seconds?: number;
}

export interface ReassessmentResult {
  reassessment_id: string;
  skill_id: string;
  is_improved: boolean;
  marks_awarded: number;
  marks_possible: number;
  new_mastery_estimate: number;
  previous_mastery_estimate: number;
  uncertainty_interval: number[];
  marks_recovered_secured: number;
  celebration_message: string;
}

// Metacognitive Learning Twin Representation
export interface SkillMastery {
  skill_id: string;
  skill_name: string;
  alpha: number;
  beta: number;
  mastery_percentage: number;
  uncertainty_range: number[];
  last_tested_timestamp: string;
}

export interface LearningTwinResponse {
  student_id: string;
  course_id: string;
  skills: SkillMastery[];
  overall_readiness_score: number;
  modality_affinities: Record<string, number>;
  proven_optimal_technique: string;
  total_marks_recovered_to_date: number;
}
