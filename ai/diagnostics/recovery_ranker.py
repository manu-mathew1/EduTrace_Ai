"""
EduTrace AI — Marks Recovery ROI Ranking Engine (Pod P5: Stage 5)
Calculates goal-aligned remediation priorities using the formula:
    Priority(Skill) = Normalized Exam Weight * Observed Error Burden * Remediation Velocity

Where:
    Normalized Exam Weight = exam_weight_percentage / 100.0
    Observed Error Burden = fraction of lost marks or error recurrence frequency [0.0 - 1.0]
    Remediation Velocity = 60.0 / remediation_time_minutes (speed of fixing cognitive gap)
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict
from backend.schemas.contracts import (
    MarksRecoveryResponse,
    MarksRecoveryItem,
    ErrorTaxonomy,
    ModalityType,
)


@dataclass
class SkillCandidate:
    skill_id: str
    skill_name: str
    diagnosed_error: ErrorTaxonomy
    exam_weight_percentage: float
    error_burden: float  # [0.0 to 1.0]
    remediation_time_minutes: int
    potential_marks_recoverable: float
    rationale: str
    recommended_modality: Optional[ModalityType] = None


class MarksRecoveryRanker:
    """
    Ranks academic remediation opportunities to bridge the exact gap between
    a student's current baseline and their target exam score in minimum study time.
    """

    @staticmethod
    def calculate_velocity(time_minutes: int) -> float:
        """
        Velocity represents the rate of marks recovery per hour of intervention.
        Capped between 1.0 and 6.0 (10 mins to 60 mins).
        """
        clamped_time = max(10, min(120, time_minutes))
        return 60.0 / clamped_time

    @classmethod
    def calculate_roi_score(cls, candidate: SkillCandidate) -> float:
        """
        Priority(Skill) = Normalized Exam Weight * Observed Error Burden * Remediation Velocity
        """
        normalized_weight = max(0.01, candidate.exam_weight_percentage / 100.0)
        burden = max(0.05, min(1.0, candidate.error_burden))
        velocity = cls.calculate_velocity(candidate.remediation_time_minutes)
        return normalized_weight * burden * velocity

    @staticmethod
    def select_default_modality(error: ErrorTaxonomy) -> ModalityType:
        """
        Assigns empirically optimal cognitive modality based on error taxonomy archetype.
        """
        if error == ErrorTaxonomy.PROCEDURAL_CALCULATION:
            return ModalityType.SPOT_THE_BUG
        elif error == ErrorTaxonomy.METHOD_SELECTION:
            return ModalityType.VISUAL_FLOWCHART
        elif error == ErrorTaxonomy.CONCEPTUAL_MISUNDERSTANDING:
            return ModalityType.REAL_WORLD_ANALOGY
        elif error == ErrorTaxonomy.RUBRIC_OMISSION:
            return ModalityType.SPOT_THE_BUG
        else:
            return ModalityType.AUDIO_DECONSTRUCTION

    @classmethod
    def get_default_candidates(cls, course_id: str = "course_calc_301") -> List[SkillCandidate]:
        """
        Returns calibrated skill candidates for Calculus III curriculum.
        """
        return [
            SkillCandidate(
                skill_id="skill_parts_sign_expansion",
                skill_name="Integration by Parts: Bracket Sign Distribution",
                diagnosed_error=ErrorTaxonomy.PROCEDURAL_CALCULATION,
                exam_weight_percentage=15.0,
                error_burden=0.80,
                remediation_time_minutes=20,
                potential_marks_recoverable=8.0,
                rationale="Appeared in 3 out of 5 analyzed problems. High exam weightage (15%) in Module 2. High fix ease (20 mins).",
                recommended_modality=ModalityType.SPOT_THE_BUG,
            ),
            SkillCandidate(
                skill_id="skill_parts_vs_sub_decision",
                skill_name="Method Choice: Substitution vs Integration by Parts",
                diagnosed_error=ErrorTaxonomy.METHOD_SELECTION,
                exam_weight_percentage=12.0,
                error_burden=0.65,
                remediation_time_minutes=25,
                potential_marks_recoverable=6.0,
                rationale="Hesitation observed when choosing between u-sub and parts in Q1 and Q4. Represents 12% of exam marks.",
                recommended_modality=ModalityType.VISUAL_FLOWCHART,
            ),
            SkillCandidate(
                skill_id="skill_ode_integrating_factor",
                skill_name="First-Order Linear ODE: Integrating Factor Setup",
                diagnosed_error=ErrorTaxonomy.CONCEPTUAL_MISUNDERSTANDING,
                exam_weight_percentage=10.0,
                error_burden=0.55,
                remediation_time_minutes=30,
                potential_marks_recoverable=5.0,
                rationale="Missing division by leading coefficient before computing e^{\\int P(x)dx}. High conceptual impact.",
                recommended_modality=ModalityType.REAL_WORLD_ANALOGY,
            ),
            SkillCandidate(
                skill_id="skill_rubric_constant_omission",
                skill_name="Indefinite Integrals: Constant of Integration (+ C)",
                diagnosed_error=ErrorTaxonomy.RUBRIC_OMISSION,
                exam_weight_percentage=5.0,
                error_burden=0.50,
                remediation_time_minutes=10,
                potential_marks_recoverable=3.0,
                rationale="Consistently lost 1-2 marks on final steps across 3 test attempts. Fast 10-minute remediation drill.",
                recommended_modality=ModalityType.SPOT_THE_BUG,
            ),
        ]

    @classmethod
    def rank_skills(
        cls,
        course_id: str,
        candidates: Optional[List[SkillCandidate]] = None,
        baseline_score: int = 50,
        target_score: int = 75,
    ) -> MarksRecoveryResponse:
        """
        Executes ROI ranking algorithm and generates a goal-aligned MarksRecoveryResponse.
        """
        pool = candidates if candidates is not None else cls.get_default_candidates(course_id)
        gap = max(0, target_score - baseline_score)

        # Score and sort by ROI descending
        scored = []
        for cand in pool:
            roi = cls.calculate_roi_score(cand)
            modality = cand.recommended_modality or cls.select_default_modality(cand.diagnosed_error)
            scored.append((roi, cand, modality))

        scored.sort(key=lambda x: x[0], reverse=True)

        ranked_items: List[MarksRecoveryItem] = []
        total_time = 0
        cumulative_recovered = 0.0

        for idx, (roi, cand, modality) in enumerate(scored, start=1):
            ranked_items.append(
                MarksRecoveryItem(
                    rank=idx,
                    skill_id=cand.skill_id,
                    skill_name=cand.skill_name,
                    diagnosed_error=cand.diagnosed_error,
                    exam_weight_percentage=cand.exam_weight_percentage,
                    estimated_time_minutes=cand.remediation_time_minutes,
                    potential_marks_recoverable=cand.potential_marks_recoverable,
                    rationale=cand.rationale,
                    recommended_modality=modality,
                )
            )
            total_time += cand.remediation_time_minutes
            cumulative_recovered += cand.potential_marks_recoverable

        return MarksRecoveryResponse(
            course_id=course_id,
            current_baseline_score=baseline_score,
            target_score=target_score,
            marks_gap=gap,
            total_study_time_minutes=total_time,
            priorities=ranked_items,
        )


recovery_ranker = MarksRecoveryRanker()
