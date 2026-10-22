"""
EduTrace AI — Mode A 10-Minute Diagnostic Probe Generator (Pod P3: Task 2.7 & P1: Task 3.1)
Generates 3 calibrated hinge questions testing specific cognitive traps
without forcing students to solve a full 3-hour exam paper.
Dynamically feeds topics detected from uploaded documents into probe questions.
"""

from pathlib import Path
from typing import List, Optional, Dict
from backend.schemas.contracts import (
    DiagnosticProbeResponse,
    HingeQuestion,
    KnowledgeArchetype,
)

MOCKS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mocks"


class DiagnosticProbeGenerator:
    """
    Generates 10-minute diagnostic probes serving 3 calibrated hinge questions.
    Calibrates questions based on uploaded syllabus documents, lecture notes,
    and student-reported friction topics.
    """

    # Comprehensive question bank keyed by topic signatures
    QUESTION_BANK: Dict[str, HingeQuestion] = {
        "substitution": HingeQuestion(
            question_id="probe_q1_sub",
            question_text=r"Evaluate the integrals: \int \frac{x}{1+x^2} \, dx \quad \text{vs} \quad \int \frac{1}{1+x^2} \, dx",
            target_skill="Method Selection: Substitution vs Arctan Standard Form",
            cognitive_trap_tested="Impulsive u-substitution without inspecting polynomial degree numerator vs denominator",
            estimated_minutes=3,
            maximum_marks=5,
            rubric_steps=[
                "For integral 1: Observe numerator degree is 1 and denominator degree is 2; let u = 1 + x^2 => du = 2x dx",
                "Evaluate integral 1: (1/2) ln|1 + x^2| + C1",
                "For integral 2: Recognize standard derivative d/dx(arctan(x)) = 1/(1+x^2)",
                "Evaluate integral 2: arctan(x) + C2",
            ],
        ),
        "integration_by_parts": HingeQuestion(
            question_id="probe_q2_parts",
            question_text=r"Evaluate using Integration by Parts: \int x^2 e^{-x} \, dx",
            target_skill="Integration by Parts: Minus Sign Distribution Across Nested Brackets",
            cognitive_trap_tested="Inverting the minus sign during the second iteration when distributing outer negative",
            estimated_minutes=4,
            maximum_marks=10,
            rubric_steps=[
                "Iteration 1: Let u = x^2, dv = e^{-x}dx => du = 2x dx, v = -e^{-x}",
                "Write first stage: -x^2 e^{-x} - \\int -2x e^{-x} dx = -x^2 e^{-x} + 2 \\int x e^{-x} dx",
                "Iteration 2: Enclose in brackets: u2 = x, dv2 = e^{-x}dx => -x e^{-x} - \\int -e^{-x} dx",
                "Distribute signs: -x^2 e^{-x} - 2x e^{-x} - 2e^{-x} + C",
            ],
        ),
        "discontinuity": HingeQuestion(
            question_id="probe_q3_discont",
            question_text=r"Evaluate \int_{-1}^{1} \frac{1}{x^2} \, dx. Is the standard power rule directly applicable?",
            target_skill="Conceptual Boundary & Discontinuity Check",
            cognitive_trap_tested="Blindly applying fundamental theorem of calculus across an essential infinite discontinuity at x=0",
            estimated_minutes=3,
            maximum_marks=5,
            rubric_steps=[
                "Identify discontinuity: 1/x^2 is unbounded and discontinuous at x = 0 in [-1, 1]",
                "State improper integral formulation: lim_{t->0^-} \\int_{-1}^t x^{-2}dx + lim_{s->0^+} \\int_s^1 x^{-2}dx",
                "Conclude integral diverges to infinity (cannot evaluate to -2)",
            ],
        ),
        "differential_equations": HingeQuestion(
            question_id="probe_q4_ode",
            question_text=r"Solve the first-order differential equation: 2x y' + y = x^3. What is the integrating factor?",
            target_skill="First-Order Linear ODE: Leading Coefficient Normalization",
            cognitive_trap_tested="Reading off P(x) without dividing by 2x to put into standard form y' + P(x)y = Q(x)",
            estimated_minutes=4,
            maximum_marks=8,
            rubric_steps=[
                "Divide entire equation by 2x: y' + (1/(2x))y = (1/2)x^2",
                "Identify P(x) = 1/(2x)",
                "Calculate integrating factor I(x) = e^{\\int (1/2x)dx} = \\sqrt{x}",
                "Multiply and integrate to obtain y = (1/7)x^3 + C x^{-1/2}",
            ],
        ),
        "algorithms_binary_search": HingeQuestion(
            question_id="probe_q5_algo",
            question_text="Implement binary search for a sorted array. How do you compute the midpoint and handle the while condition?",
            target_skill="Binary Search: Integer Overflow & Loop Invariant Termination",
            cognitive_trap_tested="Integer overflow in `(low + high) / 2` and off-by-one infinite loops with `<` vs `<=`",
            estimated_minutes=3,
            maximum_marks=6,
            rubric_steps=[
                "Use overflow-safe midpoint: `low + (high - low) // 2`",
                "Maintain loop invariant: `while low <= high`",
                "Strict boundary shifts: `low = mid + 1` or `high = mid - 1`",
            ],
        ),
    }

    @classmethod
    def generate_probe(
        cls,
        course_id: str = "course_calc_301",
        friction_topics: Optional[List[str]] = None,
    ) -> DiagnosticProbeResponse:
        """
        Produces a calibrated 3-question diagnostic probe targeted at detected friction topics
        extracted from uploaded course documents or student consultation.
        """
        selected_questions: List[HingeQuestion] = []
        matched_topics: List[str] = []

        is_cs = "cs" in course_id.lower() or "algo" in course_id.lower()

        if friction_topics and len(friction_topics) > 0:
            topics_lower = [t.lower() for t in friction_topics]

            for t_raw, t_low in zip(friction_topics, topics_lower):
                if any(k in t_low for k in ["part", "bracket", "iteration"]) and cls.QUESTION_BANK["integration_by_parts"] not in selected_questions:
                    selected_questions.append(cls.QUESTION_BANK["integration_by_parts"])
                    matched_topics.append(t_raw)
                elif any(k in t_low for k in ["sub", "arctan", "technique"]) and cls.QUESTION_BANK["substitution"] not in selected_questions:
                    selected_questions.append(cls.QUESTION_BANK["substitution"])
                    matched_topics.append(t_raw)
                elif any(k in t_low for k in ["improper", "discontinuity", "boundary", "limit"]) and cls.QUESTION_BANK["discontinuity"] not in selected_questions:
                    selected_questions.append(cls.QUESTION_BANK["discontinuity"])
                    matched_topics.append(t_raw)
                elif any(k in t_low for k in ["ode", "differential", "integrating factor"]) and cls.QUESTION_BANK["differential_equations"] not in selected_questions:
                    selected_questions.append(cls.QUESTION_BANK["differential_equations"])
                    matched_topics.append(t_raw)
                elif any(k in t_low for k in ["binary", "search", "algo", "tree", "array"]) and cls.QUESTION_BANK["algorithms_binary_search"] not in selected_questions:
                    selected_questions.append(cls.QUESTION_BANK["algorithms_binary_search"])
                    matched_topics.append(t_raw)

        # Fill remaining slots up to 3 questions with course-appropriate defaults
        if is_cs:
            fallbacks = [
                cls.QUESTION_BANK["algorithms_binary_search"],
                cls.QUESTION_BANK["substitution"],
                cls.QUESTION_BANK["differential_equations"],
            ]
        else:
            fallbacks = [
                cls.QUESTION_BANK["substitution"],
                cls.QUESTION_BANK["integration_by_parts"],
                cls.QUESTION_BANK["discontinuity"],
            ]

        for q in fallbacks:
            if len(selected_questions) >= 3:
                break
            if q not in selected_questions:
                selected_questions.append(q)

        calibrated_source = "uploaded_course_documents" if (friction_topics and len(friction_topics) > 0) else "default_curriculum"
        calibrated_topics = matched_topics if matched_topics else (friction_topics or ["Substitution Technique", "Integration by Parts", "Improper Integrals"])

        total_time = sum(q.estimated_minutes for q in selected_questions)

        return DiagnosticProbeResponse(
            probe_id=f"probe_{course_id}_calibrated",
            course_id=course_id,
            subject_archetype=KnowledgeArchetype.PROCEDURAL,
            total_estimated_minutes=total_time,
            questions=selected_questions[:3],
            calibrated_topics=calibrated_topics,
            calibration_source=calibrated_source,
        )


# Global singleton instance
probe_generator = DiagnosticProbeGenerator()
