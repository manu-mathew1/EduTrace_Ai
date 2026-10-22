"""
EduTrace AI — Mode A 10-Minute Diagnostic Probe Generator (Pod P3: Task 2.7)
Generates 3 calibrated hinge questions testing specific cognitive traps
without forcing students to solve a full 3-hour exam paper.
"""

import json
from pathlib import Path
from typing import List, Optional
from backend.schemas.contracts import (
    DiagnosticProbeResponse,
    HingeQuestion,
    KnowledgeArchetype,
)

MOCKS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mocks"


class DiagnosticProbeGenerator:
    """
    Generates 10-minute diagnostic probes serving 3 calibrated hinge questions.
    """

    @classmethod
    def generate_probe(
        cls,
        course_id: str = "course_calc_301",
        friction_topics: Optional[List[str]] = None,
    ) -> DiagnosticProbeResponse:
        """
        Produces a calibrated 3-question diagnostic probe targeted at detected friction topics.
        """
        # Load from golden mock if present
        mock_file = MOCKS_DIR / "mock_probe.json"
        if mock_file.exists():
            with open(mock_file, "r") as f:
                return DiagnosticProbeResponse(**json.load(f))

        # Golden Calibrated Questions
        q1 = HingeQuestion(
            question_id="probe_q1",
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
        )

        q2 = HingeQuestion(
            question_id="probe_q2",
            question_text=r"Evaluate using Integration by Parts: \int x^2 e^{-x} \, dx",
            target_skill="Integration by Parts: Minus Sign Distribution Across Nested Brackets",
            cognitive_trap_tested="Inverting the minus sign during the second iteration when distributing outer negative",
            estimated_minutes=4,
            maximum_marks=10,
            rubric_steps=[
                "Iteration 1: Let u = x^2, dv = e^{-x}dx => du = 2x dx, v = -e^{-x}",
                "Write first stage: -x^2 e^{-x} - \int -2x e^{-x} dx = -x^2 e^{-x} + 2 \int x e^{-x} dx",
                "Iteration 2: Enclose in brackets: u2 = x, dv2 = e^{-x}dx => -x e^{-x} - \int -e^{-x} dx",
                "Distribute signs: -x^2 e^{-x} - 2x e^{-x} - 2e^{-x} + C",
            ],
        )

        q3 = HingeQuestion(
            question_id="probe_q3",
            question_text=r"Evaluate \int_{-1}^{1} \frac{1}{x^2} \, dx. Is the standard power rule directly applicable?",
            target_skill="Conceptual Boundary & Discontinuity Check",
            cognitive_trap_tested="Blindly applying fundamental theorem of calculus across an essential infinite discontinuity at x=0",
            estimated_minutes=3,
            maximum_marks=5,
            rubric_steps=[
                "Identify discontinuity: 1/x^2 is unbounded and discontinuous at x = 0 in [-1, 1]",
                "State improper integral formulation: lim_{t->0^-} \int_{-1}^t x^{-2}dx + lim_{s->0^+} \int_s^1 x^{-2}dx",
                "Conclude integral diverges to infinity (cannot evaluate to -2)",
            ],
        )

        return DiagnosticProbeResponse(
            probe_id="probe_calibrated_calc_01",
            course_id=course_id,
            subject_archetype=KnowledgeArchetype.PROCEDURAL,
            total_estimated_minutes=10,
            questions=[q1, q2, q3],
        )


# Global singleton instance
probe_generator = DiagnosticProbeGenerator()
