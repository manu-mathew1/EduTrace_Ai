"""
EduTrace AI — Multimodal Intervention Studio Router (Pod P5: Stage 6)
Serves multimodal intervention packages: Flowcharts, Spot-the-Bug drills,
Real-World Analogies, and 60-Second Audio Deconstructions.
"""

import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.database import get_db
from backend.schemas.contracts import MultimodalStudioContent

router = APIRouter()
MOCKS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "mocks"


@router.get("/studio", response_model=MultimodalStudioContent)
@router.get("/{skill_id}", response_model=MultimodalStudioContent)
async def get_intervention_studio(
    skill_id: str = "skill_parts_sign_expansion",
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the complete 4-tab Multimodal Studio content for a prioritized skill.
    """
    mock_file = MOCKS_DIR / "mock_intervention.json"
    if mock_file.exists():
        with open(mock_file, "r") as f:
            data = json.load(f)
            return MultimodalStudioContent(**data)

    # Dynamic fallback
    return MultimodalStudioContent(
        skill_id=skill_id,
        skill_name="Integration by Parts: Bracket Sign Distribution",
        analogy_title="The Nested Suitcase Rule",
        analogy_content="Imagine packing a small suitcase inside a larger suitcase. The outer minus sign is a lock on the outer suitcase. Always wrap the entire second iteration in giant square brackets [ ... ] and only multiply the negative sign as the very last step.",
        flowchart_mermaid_code="graph TD\n  A[\"∫ u dv Step 1: u v - ∫ v du\"] --> B{\"Second integral has another product?\"}\n  B -->|Yes| C[\"STOP: Wrap in Giant Square Brackets: - [ u2 v2 - ∫ v2 du2 ]\"]\n  B -->|No| D[\"Integrate directly\"]\n  C --> E[\"Evaluate inner integral completely\"]\n  E --> F[\"LAST STEP: Distribute the outer minus sign across all terms in bracket\"]",
        audio_summary_script="Hey there! Here is the 60-second golden rule for repeated integration by parts. Never try to distribute minus signs in your head. Professor Kapoor calls this the bracket trap. Whenever you apply the formula a second time, immediately drop a giant pair of square brackets around the whole thing: minus, open bracket, u-two times v-two minus the integral of v-two du-two, close bracket. Evaluate everything inside first, and only multiply the negative sign on your final line.",
        audio_stream_url=None,
        spot_the_bug_question="Spot the sign leak in this 3-step solution of \\int x e^{-x} \\, dx:",
        spot_the_bug_steps=[
            {"step_num": 1, "text": "u = x, dv = e^{-x}dx => du = dx, v = -e^{-x}"},
            {"step_num": 2, "text": "= -x e^{-x} - \\int -e^{-x} dx"},
            {"step_num": 3, "text": "= -x e^{-x} - e^{-x} + C  <-- [Click here if bug is here]"},
        ],
        bug_step_index=3,
        bug_explanation="Correct! In Step 2, the double negative - \\int -e^{-x} becomes + \\int e^{-x}dx = -e^{-x}. So the final sign was flipped.",
    )
