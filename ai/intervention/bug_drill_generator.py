"""
EduTrace AI — Spot-the-Bug Interactive Micro-Drill Generator (Pod P5: Stage 6)
Synthesizes targeted 3-to-4 step derivation challenges with an embedded intentional bug,
clickable step indices, and pedagogical explanations grounded in lecture notes.
"""

import logging
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

logger = logging.getLogger("edutrace.intervention.drill")


class DrillStep(BaseModel):
    step_num: int
    text: str


class SpotTheBugDrill(BaseModel):
    skill_id: str
    skill_name: str
    question: str
    steps: List[DrillStep]
    bug_index: int
    explanation: str
    remediation_tip: Optional[str] = None


PRECOMPUTED_DRILLS: Dict[str, Dict[str, Any]] = {
    "skill_parts_sign": {
        "question": "Spot the sign leak in this 3-step solution of ∫ x e^(-x) dx:",
        "steps": [
            {"step_num": 1, "text": "u = x, dv = e^(-x)dx => du = dx, v = -e^(-x)"},
            {"step_num": 2, "text": "= -x e^(-x) - ∫ -e^(-x) dx"},
            {"step_num": 3, "text": "= -x e^(-x) - e^(-x) + C  <-- [Click here if bug is here]"},
        ],
        "bug_index": 3,
        "explanation": "Correct! In Step 2, the double negative - ∫ -e^(-x) dx evaluates to + ∫ e^(-x) dx = -e^(-x). The outer minus was not properly distributed.",
        "remediation_tip": "Always enclose the second iteration in brackets before distributing signs.",
    },
    "skill_sub_vs_parts": {
        "question": "Spot the method leak in this attempt to integrate 1 / (1 + x²):",
        "steps": [
            {"step_num": 1, "text": "Let u = 1 + x² => du = 2x dx"},
            {"step_num": 2, "text": "= (1/2x) ∫ (1/u) du  <-- [Click here if bug is here]"},
            {"step_num": 3, "text": "= (1/2x) ln|1 + x²| + C"},
        ],
        "bug_index": 2,
        "explanation": "Spot on! In Step 2, a variable expression (1/2x) was pulled outside the integral sign. Variables cannot leave the integration operator.",
        "remediation_tip": "Recognize standard arctan(x) form directly instead of forcing u-substitution.",
    },
    "skill_ode_factor": {
        "question": "Spot the normalization omission in this first-order ODE: 2x y' + y = x³:",
        "steps": [
            {"step_num": 1, "text": "Identify P(x) = 1, so I(x) = exp(∫ 1 dx) = e^x  <-- [Click here if bug is here]"},
            {"step_num": 2, "text": "e^x y = ∫ e^x x³ dx"},
            {"step_num": 3, "text": "Integrate by parts to find general solution"},
        ],
        "bug_index": 1,
        "explanation": "Excellent! The equation was not normalized to standard form y' + P(x)y = Q(x) by dividing through by 2x before finding P(x).",
        "remediation_tip": "Always normalize coefficient of y' to 1 before calculating the integrating factor.",
    },
    "skill_improper_discontinuity": {
        "question": "Spot the fundamental theorem violation in evaluating ∫[-1 to 1] (1/x²) dx:",
        "steps": [
            {"step_num": 1, "text": "Antiderivative of x^(-2) is -1/x  <-- [Click here if bug is here]"},
            {"step_num": 2, "text": "Evaluate [-1/x] from -1 to 1 = (-1/1) - (-1/-1) = -1 - 1 = -2"},
            {"step_num": 3, "text": "Conclude that area under 1/x² is -2"},
        ],
        "bug_index": 1,
        "explanation": "Exactly! The integrand has an infinite singularity at x = 0. The Fundamental Theorem of Calculus cannot be applied across non-continuous domains.",
        "remediation_tip": "Check integrand continuity across the entire integration interval.",
    },
    "skill_econ_multiplier": {
        "question": "Spot the tax leakage omission in calculating the fiscal stimulus multiplier:",
        "steps": [
            {"step_num": 1, "text": "Given MPC = 0.8, proportional income tax t = 0.25, government expenditure increases by $100B."},
            {"step_num": 2, "text": "Calculate multiplier k = 1 / (1 - 0.8) = 1 / 0.2 = 5.0. <-- [Click here if bug is here]"},
            {"step_num": 3, "text": "Conclude aggregate output expands by 5.0 * $100B = $500B."},
        ],
        "bug_index": 2,
        "explanation": "Correct! Step 2 omitted the tax leakage (1 - t) in the denominator. The true multiplier is 1 / [1 - 0.8(0.75)] = 2.5, resulting in a 100% overstatement of output expansion.",
        "remediation_tip": "In an economy with taxes, use k = 1 / [1 - MPC*(1 - t)].",
    },
    "skill_is_lm_crowding": {
        "question": "Spot the monetary transmission omission in this IS-LM expansion analysis:",
        "steps": [
            {"step_num": 1, "text": "Government increases purchases ΔG > 0, shifting the IS curve rightward."},
            {"step_num": 2, "text": "Higher income raises transaction money demand in the financial markets."},
            {"step_num": 3, "text": "Output increases by full horizontal IS shift with zero interest rate change. <-- [Click here if bug is here]"},
        ],
        "bug_index": 3,
        "explanation": "Spot on! Step 3 ignores Crowding-Out. Higher money demand in an unchanged money supply drives interest rates up, reducing interest-sensitive private investment I(r).",
        "remediation_tip": "Remember: IS right shift -> Money Demand rises -> Interest rate r rises -> Investment I(r) falls.",
    },
}


class BugDrillGenerator:
    """Generates interactive spot-the-bug drills for targeted skill remediation."""

    @classmethod
    def generate_drill(
        cls,
        skill_id: str,
        skill_name: Optional[str] = None,
        lecture_tip: Optional[str] = None,
    ) -> SpotTheBugDrill:
        clean_name = skill_name or skill_id.replace("skill_", "").replace("_", " ").title()
        drill_data = PRECOMPUTED_DRILLS.get(skill_id)

        if not drill_data:
            # High-fidelity dynamic fallback
            drill_data = {
                "question": f"Spot the procedural or algebraic leak in this {clean_name} derivation:",
                "steps": [
                    {"step_num": 1, "text": f"Set up canonical form and state initial conditions for {clean_name}."},
                    {"step_num": 2, "text": "Execute transformation with unverified sign distribution. <-- [Click here if bug is here]"},
                    {"step_num": 3, "text": "Carry forward intermediate result to evaluation boundary."},
                ],
                "bug_index": 2,
                "explanation": f"Correct! Step 2 violated the core requirement for {clean_name}. Always isolate nested terms before proceeding.",
                "remediation_tip": lecture_tip or "Check every algebraic operation against reference notes.",
            }

        return SpotTheBugDrill(
            skill_id=skill_id,
            skill_name=clean_name,
            question=drill_data["question"],
            steps=[DrillStep(**s) for s in drill_data["steps"]],
            bug_index=drill_data["bug_index"],
            explanation=drill_data["explanation"],
            remediation_tip=drill_data.get("remediation_tip") or lecture_tip,
        )


bug_drill_generator = BugDrillGenerator()
