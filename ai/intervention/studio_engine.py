"""
EduTrace AI — Unified Multimodal Studio Engine (Pod P5: Stage 6)
Assembles the complete 4-tab multimodal intervention package:
- Tab 1: Visual Mermaid Decision Flowchart
- Tab 2: Spot-the-Bug Interactive Micro-Drill
- Tab 3: Real-World Physical Analogy
- Tab 4: 60-Second Audio Deconstruction Script
"""

import logging
from typing import Optional, Dict, Any, List

from backend.schemas.contracts import MultimodalStudioContent
from ai.intervention.analogy_generator import analogy_generator
from ai.intervention.flowchart_generator import flowchart_generator
from rag.retrieval.citation_engine import citation_retriever

logger = logging.getLogger("edutrace.intervention.studio")

# Spot-the-bug catalog for key skills
BUG_DRILLS: Dict[str, Dict[str, Any]] = {
    "skill_parts_sign": {
        "question": "Spot the sign leak in this 3-step solution of ∫ x e^(-x) dx:",
        "steps": [
            {"step_num": 1, "text": "u = x, dv = e^(-x)dx => du = dx, v = -e^(-x)"},
            {"step_num": 2, "text": "= -x e^(-x) - ∫ -e^(-x) dx"},
            {"step_num": 3, "text": "= -x e^(-x) - e^(-x) + C  <-- [Click here if bug is here]"},
        ],
        "bug_index": 3,
        "explanation": "Correct! In Step 2, the double negative - ∫ -e^(-x) dx evaluates to + ∫ e^(-x) dx = -e^(-x). The outer minus was not properly distributed.",
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
    },
    # Macroeconomics Bug Drills (Task 4.4)
    "skill_econ_multiplier": {
        "question": "Spot the tax leakage omission in calculating the fiscal stimulus multiplier:",
        "steps": [
            {"step_num": 1, "text": "Given MPC = 0.8, proportional income tax t = 0.25, government expenditure increases by $100B."},
            {"step_num": 2, "text": "Calculate multiplier k = 1 / (1 - 0.8) = 1 / 0.2 = 5.0. <-- [Click here if bug is here]"},
            {"step_num": 3, "text": "Conclude aggregate output expands by 5.0 * $100B = $500B."},
        ],
        "bug_index": 2,
        "explanation": "Correct! Step 2 omitted the tax leakage (1 - t) in the denominator. The true multiplier is 1 / [1 - 0.8(0.75)] = 2.5, resulting in a 100% overstatement of output expansion.",
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
    },
}


class StudioEngine:
    """
    Coordinates multimodal content generation for student intervention,
    grounded directly in course lecture notes and slide citations (Task 4.3).
    """

    @classmethod
    async def build_studio_content(
        cls,
        skill_id: str,
        skill_name: Optional[str] = None,
        error_type: Optional[str] = None,
        divergence_context: Optional[str] = None,
        course_id: str = "course_calc_301",
    ) -> MultimodalStudioContent:
        """
        Synthesizes the complete 4-tab multimodal package grounded in lecture citations.
        """
        clean_name = skill_name or skill_id.replace("skill_", "").replace("_", " ").title()

        # 1. Retrieve lecture slide citations for grounding (Task 4.3)
        citations = []
        primary_quote = None
        slide_info = ""
        try:
            if divergence_context:
                matches = citation_retriever.retrieve_for_divergence(
                    course_id=course_id,
                    diverged_step_text=divergence_context,
                    expected_step_text=clean_name,
                    error_type=error_type,
                    limit=2,
                )
            else:
                matches = citation_retriever.retrieve_citations(
                    course_id=course_id,
                    topic=clean_name,
                    limit=2,
                )
            citations = [m.to_dict() for m in matches]
            if citations:
                top_c = citations[0]
                primary_quote = top_c.get("quote", "")
                if top_c.get("slide_number"):
                    slide_info = f" (Slide {top_c['slide_number']})"
                elif top_c.get("page_number"):
                    slide_info = f" (Page {top_c['page_number']})"
        except Exception as e:
            logger.warning(f"RAG citation grounding fallback: {e}")

        # 2. Generate real-world physical analogy grounded in lecture quote
        analogy_res = await analogy_generator.generate_analogy(
            skill_id=skill_id,
            skill_name=clean_name,
            error_type=error_type,
            divergence_context=divergence_context,
            lecture_quote=primary_quote,
        )

        # 3. Generate Mermaid procedural flowchart grounded in lecture rule
        flowchart_res = await flowchart_generator.generate_flowchart(
            skill_id=skill_id,
            skill_name=clean_name,
            error_type=error_type,
            lecture_quote=primary_quote,
        )

        # 4. Lookup or generate spot-the-bug drill
        bug_data = BUG_DRILLS.get(
            skill_id,
            {
                "question": f"Spot the algebraic or procedural leak in this {clean_name} problem:",
                "steps": [
                    {"step_num": 1, "text": "Set up problem and state initial conditions."},
                    {"step_num": 2, "text": "Execute transformation with unverified sign distribution. <-- [Click here if bug is here]"},
                    {"step_num": 3, "text": "Carry forward error into final evaluation line."},
                ],
                "bug_index": 2,
                "explanation": f"Correct! Step 2 failed to verify preconditions for {clean_name}.",
            },
        )

        bug_explanation = bug_data["explanation"]
        if citations and citations[0].get("pedagogical_remediation_tip"):
            tip = citations[0]["pedagogical_remediation_tip"]
            if tip not in bug_explanation:
                bug_explanation += f" ({tip})"

        # 5. Synthesize 60-second audio script grounded in lecture notes
        grounding_prefix = (
            f"As emphasized in your professor's lecture notes{slide_info}: \"{primary_quote}\" "
            if primary_quote else ""
        )
        audio_script = (
            f"Hey there! Here is your 60-second golden rule for {clean_name}. "
            f"{grounding_prefix}"
            f"Remember the core principle: {analogy_res.remediation_takeaway} "
            f"{analogy_res.content} "
            f"Review the decision flowchart in your studio tabs and always pause before writing down your final answer. "
            f"You've got this!"
        )

        return MultimodalStudioContent(
            skill_id=skill_id,
            skill_name=clean_name,
            analogy_title=analogy_res.title,
            analogy_content=analogy_res.content,
            flowchart_mermaid_code=flowchart_res.mermaid_code,
            audio_summary_script=audio_script,
            audio_stream_url=None,
            spot_the_bug_question=bug_data["question"],
            spot_the_bug_steps=bug_data["steps"],
            bug_step_index=bug_data["bug_index"],
            bug_explanation=bug_explanation,
            lecture_citations=citations if citations else None,
            lecture_grounding_quote=primary_quote if primary_quote else None,
        )


studio_engine = StudioEngine()
