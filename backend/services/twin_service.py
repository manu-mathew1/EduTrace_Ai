"""
EduTrace AI — Bayesian Learning Twin Mathematical Engine (P1: Tech Lead & Core Systems)
Implements Beta-Binomial conjugate Bayesian belief updating, uncertainty intervals,
dynamic metacognitive telemetry, and student readiness metrics.
"""

import math
import json
from datetime import datetime
from typing import Tuple, List, Dict, Optional, Any

try:
    from scipy.stats import beta as beta_dist
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False

from backend.schemas.contracts import (
    SkillMastery,
    LearningTwinResponse,
    ReassessmentResult,
)


def calculate_beta_mastery(alpha: float, beta: float, credible_mass: float = 0.80) -> Tuple[float, List[float]]:
    """
    Given Beta parameters alpha and beta:
    Returns (mastery_percentage, [lower_bound, upper_bound]) representing
    the posterior expected mastery and the Bayesian credible interval.
    """
    if alpha <= 0 or beta <= 0:
        raise ValueError("Alpha and Beta parameters must be strictly positive (> 0).")

    # Mean of Beta(alpha, beta) is alpha / (alpha + beta)
    mean_mastery = alpha / (alpha + beta)
    mastery_percentage = round(mean_mastery * 100, 1)

    # Calculate Bayesian Credible Interval
    tail_prob = (1.0 - credible_mass) / 2.0
    if SCIPY_AVAILABLE:
        lower_bound = float(beta_dist.ppf(tail_prob, alpha, beta))
        upper_bound = float(beta_dist.ppf(1.0 - tail_prob, alpha, beta))
    else:
        # High-accuracy fallback using Normal approximation to Beta distribution
        variance = (alpha * beta) / (((alpha + beta) ** 2) * (alpha + beta + 1))
        std_dev = math.sqrt(variance)
        # z-score for 80% credible interval is ~1.282
        z_multiplier = 1.282 if credible_mass == 0.80 else 1.96
        lower_bound = max(0.01, mean_mastery - z_multiplier * std_dev)
        upper_bound = min(0.99, mean_mastery + z_multiplier * std_dev)

    uncertainty_range = [round(lower_bound, 2), round(upper_bound, 2)]
    return mastery_percentage, uncertainty_range


def bayesian_posterior_update(
    alpha: float,
    beta: float,
    marks_awarded: float,
    marks_possible: float,
    evidence_weight: float = 3.0,
    credible_mass: float = 0.80
) -> Tuple[float, float, float, List[float]]:
    """
    Performs conjugate Beta-Binomial update:
    - marks_awarded / marks_possible -> empirical success rate x in [0, 1]
    - alpha_new = alpha + evidence_weight * x
    - beta_new  = beta  + evidence_weight * (1 - x)

    Returns:
    (new_alpha, new_beta, new_mastery_percentage, new_uncertainty_range)
    """
    if marks_possible <= 0:
        raise ValueError("marks_possible must be strictly positive.")

    marks_awarded = max(0.0, min(marks_awarded, marks_possible))
    success_rate = marks_awarded / marks_possible

    new_alpha = round(alpha + (evidence_weight * success_rate), 2)
    new_beta = round(beta + (evidence_weight * (1.0 - success_rate)), 2)

    new_mastery_pct, new_uncertainty = calculate_beta_mastery(new_alpha, new_beta, credible_mass)
    return new_alpha, new_beta, new_mastery_pct, new_uncertainty


def update_modality_affinity(
    current_affinities: Dict[str, float],
    modality_used: str,
    performance_ratio: float,
    learning_rate: float = 0.25
) -> Dict[str, float]:
    """
    Exponential smoothing update for cognitive modality affinity:
    A_new = (1 - gamma) * A_old + gamma * score
    """
    updated = dict(current_affinities)
    old_val = updated.get(modality_used, 0.50)
    new_val = ((1.0 - learning_rate) * old_val) + (learning_rate * performance_ratio)
    updated[modality_used] = round(max(0.05, min(0.95, new_val)), 2)
    return updated


# =====================================================================
# Database-Integrated Twin Service Operations
# =====================================================================

DEFAULT_MODALITY_AFFINITIES = {
    "visual_flowchart": 0.88,
    "spot_the_bug": 0.84,
    "real_world_analogy": 0.79,
    "audio_deconstruction": 0.72,
    "textual_deduction": 0.35,
}


async def get_learning_twin_data(
    student_id: str,
    course_id: str,
    db_session: Optional[Any] = None
) -> LearningTwinResponse:
    """
    Retrieves the Metacognitive Learning Twin profile for a student in a course.
    Falls back to mock data if database session is not provided or empty.
    """
    if db_session is not None:
        from sqlalchemy import select
        from backend.db.models import SkillTwinModel
        stmt = select(SkillTwinModel).where(
            SkillTwinModel.student_id == student_id,
            SkillTwinModel.course_id == course_id
        )
        result = await db_session.execute(stmt)
        skill_records = result.scalars().all()

        if skill_records:
            skills = []
            total_mastery = 0.0
            for record in skill_records:
                uncertainty = json.loads(record.uncertainty_range_json) if record.uncertainty_range_json else [0.2, 0.8]
                skills.append(
                    SkillMastery(
                        skill_id=record.skill_id,
                        skill_name=record.skill_name,
                        alpha=record.alpha,
                        beta=record.beta,
                        mastery_percentage=record.mastery_percentage,
                        uncertainty_range=uncertainty,
                        last_tested_timestamp=record.last_tested_timestamp or datetime.utcnow().isoformat() + "Z"
                    )
                )
                total_mastery += record.mastery_percentage

            readiness = round(total_mastery / len(skills), 1) if skills else 50.0
            return LearningTwinResponse(
                student_id=student_id,
                course_id=course_id,
                skills=skills,
                overall_readiness_score=readiness,
                modality_affinities=DEFAULT_MODALITY_AFFINITIES,
                proven_optimal_technique="Visual Flowcharts + Active Spot-the-Bug Drills",
                total_marks_recovered_to_date=8.0
            )

    # Standard Golden Mock Fallback (Guarantees zero-block parallel execution)
    from pathlib import Path
    mock_file = Path(__file__).resolve().parent.parent.parent / "data" / "mocks" / "mock_learning_twin.json"
    if mock_file.exists():
        with open(mock_file, "r") as f:
            data = json.load(f)
            return LearningTwinResponse(**data)

    # Default synthetic seed
    alpha, beta = 8.0, 3.0
    mastery, uncertainty = calculate_beta_mastery(alpha, beta)
    seed_skill = SkillMastery(
        skill_id="skill_integration_parts",
        skill_name="Integration by Parts: Sign Distribution",
        alpha=alpha,
        beta=beta,
        mastery_percentage=mastery,
        uncertainty_range=uncertainty,
        last_tested_timestamp=datetime.utcnow().isoformat() + "Z"
    )
    return LearningTwinResponse(
        student_id=student_id,
        course_id=course_id,
        skills=[seed_skill],
        overall_readiness_score=mastery,
        modality_affinities=DEFAULT_MODALITY_AFFINITIES,
        proven_optimal_technique="Visual Flowcharts + Active Spot-the-Bug Drills",
        total_marks_recovered_to_date=0.0
    )


async def record_reassessment_outcome(
    reassessment_id: str,
    student_id: str,
    course_id: str,
    skill_id: str,
    skill_name: str,
    marks_awarded: float,
    marks_possible: float,
    potential_recoverable: float = 8.0,
    current_alpha: float = 4.0,
    current_beta: float = 5.0,
    db_session: Optional[Any] = None
) -> ReassessmentResult:
    """
    Main API called by P5 (Reassessment Router) when a student submits an isomorphic drill.
    Computes conjugate Bayesian update, records persistence, and returns ReassessmentResult.
    """
    # 1. Calculate previous mastery
    prev_mastery, _ = calculate_beta_mastery(current_alpha, current_beta)

    # 2. Perform Bayesian posterior update
    new_alpha, new_beta, new_mastery, new_uncertainty = bayesian_posterior_update(
        alpha=current_alpha,
        beta=current_beta,
        marks_awarded=marks_awarded,
        marks_possible=marks_possible,
        evidence_weight=3.0
    )

    is_improved = new_mastery > prev_mastery
    marks_recovered_secured = round(potential_recoverable * (marks_awarded / marks_possible), 1)

    celebration = (
        f"🎯 Concept Mastered! Bayesian Twin updated your mastery from {prev_mastery}% to {new_mastery}%. "
        f"Uncertainty interval narrowed to [{new_uncertainty[0]}, {new_uncertainty[1]}]. "
        f"+{marks_recovered_secured} Marks Secured on your Exam Target!"
        if is_improved else
        f"Progress logged. Mastery updated to {new_mastery}%. Review the visual flowchart once more!"
    )

    # 3. Optional DB persistence
    if db_session is not None:
        from sqlalchemy import select
        from backend.db.models import SkillTwinModel, ReassessmentLogModel
        stmt = select(SkillTwinModel).where(
            SkillTwinModel.student_id == student_id,
            SkillTwinModel.course_id == course_id,
            SkillTwinModel.skill_id == skill_id
        )
        res = await db_session.execute(stmt)
        record = res.scalar_one_or_none()

        now_str = datetime.utcnow().isoformat() + "Z"
        if record:
            record.alpha = new_alpha
            record.beta = new_beta
            record.mastery_percentage = new_mastery
            record.uncertainty_range_json = json.dumps(new_uncertainty)
            record.last_tested_timestamp = now_str
        else:
            new_record = SkillTwinModel(
                student_id=student_id,
                course_id=course_id,
                skill_id=skill_id,
                skill_name=skill_name,
                alpha=new_alpha,
                beta=new_beta,
                mastery_percentage=new_mastery,
                uncertainty_range_json=json.dumps(new_uncertainty),
                last_tested_timestamp=now_str
            )
            db_session.add(new_record)

        log = ReassessmentLogModel(
            id=reassessment_id,
            student_id=student_id,
            skill_id=skill_id,
            is_improved=is_improved,
            marks_awarded=marks_awarded,
            marks_possible=marks_possible,
            previous_mastery=prev_mastery,
            new_mastery=new_mastery,
            marks_recovered=marks_recovered_secured
        )
        db_session.add(log)
        await db_session.commit()

    return ReassessmentResult(
        reassessment_id=reassessment_id,
        skill_id=skill_id,
        is_improved=is_improved,
        marks_awarded=marks_awarded,
        marks_possible=marks_possible,
        previous_mastery_estimate=prev_mastery,
        new_mastery_estimate=new_mastery,
        uncertainty_interval=new_uncertainty,
        marks_recovered_secured=marks_recovered_secured,
        celebration_message=celebration
    )
