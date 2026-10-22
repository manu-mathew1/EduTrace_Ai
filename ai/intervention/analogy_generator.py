"""
EduTrace AI — Real-World Analogy Generator (Pod P5: Stage 6, Task 3.11)
Transforms abstract mathematical and procedural misconceptions into intuitive,
sticky physical analogies that prevent recurring errors.
"""

import logging
from typing import Optional, Dict, Any
from pydantic import BaseModel

from ai.client import ai_client

logger = logging.getLogger("edutrace.intervention.analogy")


class AnalogyResponse(BaseModel):
    title: str
    content: str
    remediation_takeaway: str


ANALOGY_SYSTEM_PROMPT = """You are EduTrace AI's Pedagogical Analogy Engine.
Your task is to take an abstract mathematical, scientific, or algorithmic mistake and invent a sticky,
memorable real-world physical metaphor that permanently fixes the misconception in the student's mind.
RULES:
1. Ground the analogy in everyday physical reality (suitcases, toll booths, bridges, scales, assembly lines).
2. Explicitly map the physical object to the mathematical symbol or operation (e.g. outer minus sign = luggage padlock).
3. Conclude with a punchy 1-sentence memorable takeaway rule.
"""

DOMAIN_ANALOGIES: Dict[str, Dict[str, str]] = {
    "skill_parts_sign": {
        "title": "The Nested Suitcase Rule",
        "content": "Imagine packing a smaller toiletry bag inside a giant travel suitcase. The outer minus sign in front of the second integration is a security padlock on the outer suitcase. If you open the outer suitcase while the items inside the toiletry bag are still loose, items get mixed up and lost. Always keep the toiletry bag sealed in giant square brackets [ ... ] until all calculations inside are 100% finished, and only distribute the negative padlock as your very last step.",
        "remediation_takeaway": "Wrap repeated parts in giant square brackets [ ... ] and only multiply the negative sign on your final line.",
    },
    "skill_sub_vs_parts": {
        "title": "The Security Scanner Filter",
        "content": "Think of integration techniques like an airport security checkpoint with two separate lanes. The standard table lane allows passengers with exact tickets (like standard arctan or exponential forms) to walk straight through with zero delay. U-substitution is the secondary luggage inspection lane—it only works if you have the exact derivative companion ticket. Never rush into secondary inspection for 1/(1+x²) when the standard lane is open right beside you.",
        "remediation_takeaway": "Inspect the degree of the numerator vs denominator before initiating substitution.",
    },
    "skill_ode_factor": {
        "title": "The Highway Lane Normalization",
        "content": "Before entering a high-speed express highway, every vehicle must enter the single standard lane. In linear differential equations, the canonical standard form requires y' to have a leading coefficient of exactly 1. If you attempt to calculate your integrating factor I(x) while the leading coefficient 2x is still attached to y', you are driving in two lanes at once. Always divide the entire equation by the leading coefficient first.",
        "remediation_takeaway": "Always divide by the leading coefficient to isolate y' before calculating exp(∫ P(x) dx).",
    },
    "skill_improper_discontinuity": {
        "title": "The Grand Canyon Bridge Fallacy",
        "content": "Imagine calculating the elevation gain of a road from mile -1 to mile +1, but right at mile 0 sits the Grand Canyon with an infinite drop. You cannot calculate the total distance by merely subtracting the starting elevation from the ending elevation as if a continuous bridge existed. The Fundamental Theorem of Calculus assumes an unbroken road; when an infinite abyss divides the domain, you must calculate each side separately using limits.",
        "remediation_takeaway": "Never apply the Fundamental Theorem of Calculus across an infinite singularity; split into improper limit integrals.",
    },
    "skill_determinant_cofactor": {
        "title": "The Alternating Chessboard Rule",
        "content": "When expanding a 3x3 determinant by minors, the signs do not all remain positive—they alternate like black and white squares on a chessboard (+, -, +, then -, +, -, etc.). Multiplying your minor without applying the checkerboard sign factor (-1)^(i+j) is like moving a bishop straight forward instead of diagonally. Always sketch the +/- checkerboard grid beside your matrix before taking minors.",
        "remediation_takeaway": "Always write the checkerboard sign pattern (+, -, +) above your pivot row or column before computing 2x2 minors.",
    },
    "skill_rank_nullity": {
        "title": "The Airline Baggage Allowance Balance",
        "content": "Think of the domain dimension as your total checked luggage allowance (e.g., 50 kg total). The nullity (kernel dimension) is the weight of items lost or compressed into zero space, while the rank (image dimension) is the weight of items that successfully reach the destination. The total baggage allowance must always equal the lost items plus the delivered items: dim(V) = nullity + rank.",
        "remediation_takeaway": "The domain dimension always splits into what vanishes (nullity) plus what survives (rank).",
    },
    "skill_quotient_denominator": {
        "title": "The Two-Story House Foundation",
        "content": "Applying the quotient rule without squaring the denominator is like building the second story of a house and forgetting the concrete foundation slab. Even if your numerator subtraction (u'v - uv') is completely accurate, the whole structure collapses to zero marks if v² is omitted underneath.",
        "remediation_takeaway": "Write the denominator v² first before deriving the numerator so you never forget the foundation.",
    },
    # Macroeconomics Analogies (Task 4.4)
    "skill_econ_multiplier": {
        "title": "The Leaky Bucket Irrigation Sieve",
        "content": "Think of fiscal stimulus like pouring water from a government reservoir into farm irrigation canals. The Marginal Propensity to Consume (MPC) is the fraction of water farmers spray onto crops. But proportional taxation is a drainage sieve built into the canal floor. If you calculate how many crops grow assuming zero water drains through the sieve, you will overestimate crop yield by double! Always calculate the water that remains after the tax sieve drains away: 1 / [1 - MPC(1 - t)].",
        "remediation_takeaway": "Always multiply MPC by (1 - t) in the multiplier denominator to account for tax leakage.",
    },
    "skill_is_lm_crowding": {
        "title": "The Crowded Highway Toll Lane",
        "content": "Imagine a fast express lane where government buses suddenly surge in number. The road gets congested, driving up the toll booth price (the interest rate). Private cars (private investment) see the skyrocketing toll and decide to stay home or take side streets instead. The total increase in traffic is far less than the number of government buses added because private cars were crowded off the road.",
        "remediation_takeaway": "An increase in government spending pushes up interest rates, which crowds out interest-sensitive private investment.",
    },
}


class AnalogyGenerator:
    """
    Synthesizes physical, real-world metaphors for cognitive misconceptions.
    """

    @classmethod
    async def generate_analogy(
        cls,
        skill_id: str,
        skill_name: str,
        error_type: Optional[str] = None,
        divergence_context: Optional[str] = None,
        lecture_quote: Optional[str] = None,
    ) -> AnalogyResponse:
        """
        Generates an analogy using LLM or domain calibrated knowledge bank,
        grounded in professor lecture notes.
        """
        # Check domain knowledge bank first
        for key, data in DOMAIN_ANALOGIES.items():
            if key in skill_id or any(w in skill_name.lower() for w in key.replace("skill_", "").split("_")):
                analogy_data = dict(data)
                if lecture_quote and "Grounded in" not in analogy_data["content"]:
                    analogy_data["content"] = f"{analogy_data['content']} Grounded in lecture guidance: \"{lecture_quote}\""
                return AnalogyResponse(**analogy_data)

        # Check LLM client if configured
        if getattr(ai_client, "api_key", None):
            quote_clause = f"\n- Grounded Lecture Note Reference: {lecture_quote}" if lecture_quote else ""
            prompt = f"""
Create a real-world physical analogy for the following academic skill and student misconception:
- Skill ID: {skill_id}
- Skill Name: {skill_name}
- Error Category: {error_type or 'Procedural / Conceptual'}
- Divergence Context: {divergence_context or 'Student inverted signs or omitted preconditions'}{quote_clause}

Return valid JSON adhering to the AnalogyResponse schema with title, content, and remediation_takeaway.
"""
            try:
                res = await ai_client.generate_structured_json(
                    prompt=prompt,
                    response_model=AnalogyResponse,
                    system_instruction=ANALOGY_SYSTEM_PROMPT,
                )
                if res and res.title and res.content:
                    return res
            except Exception as e:
                logger.warning(f"AI Analogy generation fallback: {e}")

        # Deterministic universal fallback
        return AnalogyResponse(
            title="The Precision Gauge Rule",
            content=f"When working through {skill_name}, think of every mathematical operation as setting a high-precision gauge. A single inverted sign or skipped normalization coefficient throws off the calibration of all subsequent readouts. Always complete and verify each stage before passing values forward.",
            remediation_takeaway="Pause at transition points to verify preconditions before executing the next line.",
        )


analogy_generator = AnalogyGenerator()
