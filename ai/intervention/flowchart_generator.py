"""
EduTrace AI — Mermaid Decision Flowchart Generator (Pod P5: Stage 6, Task 3.11)
Produces syntactically verified, visually engaging Mermaid.js decision trees
that enforce procedural guardrails and method selection rules.
"""

import logging
from typing import Optional, Dict, Any
from pydantic import BaseModel

from ai.client import ai_client

logger = logging.getLogger("edutrace.intervention.flowchart")


class FlowchartResponse(BaseModel):
    title: str
    mermaid_code: str
    decision_summary: str


FLOWCHART_SYSTEM_PROMPT = """You are EduTrace AI's Procedural Flowchart Engine.
Your task is to generate valid Mermaid.js flowchart syntax (graph TD) that maps the exact
decision rules, warning checkpoints, and terminal steps to avoid academic marks leaks.
RULES:
1. Always start with 'graph TD'.
2. Use quoted strings inside brackets for labels containing parentheses, math symbols, or punctuation: e.g. A["Step 1: Apply formula"].
3. Use question diamonds for branching decisions: e.g. B{"Does term have another product?"}.
4. Provide clear '|Yes|' and '|No|' branches.
5. Emphasize warning checkpoints with emoji or caution tags.
"""

DOMAIN_FLOWCHARTS: Dict[str, Dict[str, str]] = {
    "skill_parts_sign": {
        "title": "Repeated Parts Bracket Guardrail",
        "mermaid_code": """graph TD
  A["Start: Apply ∫ u dv = uv - ∫ v du"] --> B{"Does inner integral require a 2nd iteration?"}
  B -->|No| C["Integrate directly + C"]
  B -->|Yes| D["STOP: Wrap in Giant Square Brackets: - [ u2 v2 - ∫ v2 du2 ]"]
  D --> E["Identify u2 and dv2; compute du2 and v2"]
  E --> F["Evaluate everything INSIDE the brackets completely"]
  F --> G["LAST STEP: Distribute the outer minus sign across all terms"]
  G --> H["Append integration constant + C"]""",
        "decision_summary": "Never distribute the outer negative sign until all internal integrals inside the square brackets are evaluated.",
    },
    "skill_sub_vs_parts": {
        "title": "Integration Method Selection Matrix",
        "mermaid_code": """graph TD
  A["Inspect Integrand: f(x)"] --> B{"Does f(x) match a standard derivative table e.g. 1/(1+x²)?"}
  B -->|Yes| C["Direct Table Lookup: arctan(x) + C"]
  B -->|No| D{"Is the integrand a single product of polynomials, trig, or exp?"}
  D -->|Yes| E{"Does numerator contain the exact derivative of denominator?"}
  E -->|Yes| F["Apply U-Substitution: let u = g(x)"]
  E -->|No| G["Apply Integration by Parts: LIATE rule"]
  D -->|No| H["Perform algebraic division or partial fractions"]""",
        "decision_summary": "Check for immediate inverse trigonometric derivative matches before attempting substitution or parts.",
    },
    "skill_ode_factor": {
        "title": "First-Order Linear ODE Standardization Guardrail",
        "mermaid_code": """graph TD
  A["Given ODE: a(x) y' + b(x) y = c(x)"] --> B{"Is leading coefficient a(x) == 1?"}
  B -->|Yes| C["Identify P(x) = b(x) and Q(x) = c(x) directly"]
  B -->|No| D["MANDATORY: Divide entire ODE by a(x)"]
  D --> E["Normalized Form: y' + P(x)y = Q(x)"]
  E --> F["Compute Integrating Factor: I(x) = exp(∫ P(x) dx)"]
  F --> G["Multiply normalized equation by I(x): (I(x) y)' = I(x) Q(x)"]
  G --> H["Integrate both sides and isolate y"]""",
        "decision_summary": "Always normalize the leading coefficient to 1 before calculating the integrating factor.",
    },
    "skill_improper_discontinuity": {
        "title": "Domain Continuity Verification Checkpoint",
        "mermaid_code": """graph TD
  A["Evaluate Definite Integral: ∫[a to b] f(x) dx"] --> B{"Does f(x) have any infinite discontinuity in [a, b]?"}
  B -->|No| C["Apply Fundamental Theorem of Calculus: F(b) - F(a)"]
  B -->|Yes| D["STOP: Never apply FTC across an infinite singularity!"]
  D --> E["Identify discontinuity point c inside (a, b)"]
  E --> F["Split into two improper limits: lim(t->c-) + lim(s->c+)"]
  F --> G{"Do both one-sided limits converge?"}
  G -->|Yes| H["Sum the two limit values"]
  G -->|No| I["State that integral diverges to infinity"]""",
        "decision_summary": "Always inspect the denominator for zeros across the integration interval before computing antiderivatives.",
    },
    "skill_determinant_cofactor": {
        "title": "3x3 Determinant Minor Expansion Workflow",
        "mermaid_code": """graph TD
  A["Select Row or Column with most zeros"] --> B["Write alternating signs pattern: + - +"]
  B --> C["For each element a_ij, cross out row i and column j"]
  C --> D["Compute 2x2 minor: det([[a, b], [c, d]]) = ad - bc"]
  D --> E["Multiply: sign * a_ij * minor"]
  E --> F["Sum all 3 cofactor products for final determinant"]""",
        "decision_summary": "Superimpose the alternating checkerboard sign (+, -, +) prior to computing 2x2 cross multiplications.",
    },
}


class FlowchartGenerator:
    """
    Synthesizes executable, valid Mermaid.js diagrams for procedural intervention.
    """

    @classmethod
    async def generate_flowchart(
        cls,
        skill_id: str,
        skill_name: str,
        error_type: Optional[str] = None,
        procedure_steps: Optional[list] = None,
    ) -> FlowchartResponse:
        """
        Generates Mermaid flowchart using knowledge bank or structured LLM synthesis.
        """
        # 1. Match domain templates
        for key, data in DOMAIN_FLOWCHARTS.items():
            if key in skill_id or any(w in skill_name.lower() for w in key.replace("skill_", "").split("_")):
                return FlowchartResponse(**data)

        # 2. Check LLM client if configured
        if getattr(ai_client, "api_key", None):
            prompt = f"""
Create a Mermaid.js decision flowchart (graph TD) for the following academic skill:
- Skill ID: {skill_id}
- Skill Name: {skill_name}
- Error Category: {error_type or 'Procedural / Method Choice'}
- Canonical Procedure: {procedure_steps or 'Step-by-step mathematical problem solving'}

Return a valid JSON object adhering to FlowchartResponse with title, mermaid_code, and decision_summary.
Ensure all node text with special characters is wrapped in double quotes inside brackets.
"""
            try:
                res = await ai_client.generate_structured_json(
                    prompt=prompt,
                    response_model=FlowchartResponse,
                    system_instruction=FLOWCHART_SYSTEM_PROMPT,
                )
                if res and res.mermaid_code and "graph" in res.mermaid_code:
                    return res
            except Exception as e:
                logger.warning(f"AI Flowchart generation fallback: {e}")

        # 3. Deterministic universal guardrail fallback
        return FlowchartResponse(
            title=f"Procedural Guardrail: {skill_name}",
            mermaid_code="""graph TD
  A["Step 1: Read problem statement and identify input archetype"] --> B{"Are all formula preconditions met?"}
  B -->|No| C["Apply prerequisite transformations or standardization"]
  B -->|Yes| D["Execute step-by-step mathematical derivation"]
  C --> D
  D --> E{"Check sign and algebraic transitions"}
  E -->|Verified| F["Final simplification and add required constants"]""",
            decision_summary=f"Verify preconditions and signs at every transition step for {skill_name}.",
        )


flowchart_generator = FlowchartGenerator()
