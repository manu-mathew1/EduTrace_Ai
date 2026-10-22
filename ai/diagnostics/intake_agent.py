"""
EduTrace AI — 3-Turn Metacognitive Intake Triage Agent (Pod P3: Task 2.6)
Extracts student friction points, target scores, and exam timelines,
recommending Mode A (Diagnostic Probe) vs Mode B (Exam Paper Upload).
"""

import re
import logging
from typing import List, Dict, Any, Optional
from ai.client import ai_client
from backend.schemas.contracts import (
    DiagnosticMode,
    IntakeMessage,
    IntakeSessionState,
    IntakeConsultResponse,
)

logger = logging.getLogger("edutrace.ai.intake_agent")

INTAKE_SYSTEM_INSTRUCTION = """You are EduTrace AI's Metacognitive Intake Counselor.
Your role is to conduct a focused, 3-turn academic diagnostic interview with a STEM student:
- Turn 1: Acknowledge student's target score and baseline gap. Inquire about their primary friction points (e.g. method selection vs procedural execution errors).
- Turn 2: Validate their cognitive struggle and introduce the Mode A '10-Minute Diagnostic Probe' consisting of 3 calibrated hinge questions designed to isolate their exact leak point without re-solving an entire exam.
- Turn 3: Finalize intake calibration, synthesize extracted friction topics, and hand off to the Diagnostic Probe.
Maintain an encouraging, analytical, and highly structured tone.
"""


class IntakeAgent:
    """
    3-Turn Metacognitive Triage Agent with Gemini integration and rule-based fallback.
    """

    KNOWN_TOPICS = {
        "Integration by Parts": ["parts", "by parts", "udv", "bracket", "product rule"],
        "Substitution vs Standard Forms": ["substitution", "u-sub", "arctan", "power rule"],
        "First-Order Linear ODEs": ["ode", "differential", "integrating factor", "separable"],
        "Improper Integrals": ["improper", "discontinuity", "infinity", "divergence"],
        "Partial Fractions": ["partial fraction", "decomposition", "rational"],
    }

    @classmethod
    async def process_turn(
        cls,
        session_id: str,
        course_id: str,
        user_message: str,
        history: List[IntakeMessage],
        target_score: Optional[int] = 75,
        baseline_score: Optional[int] = 50,
    ) -> IntakeConsultResponse:
        """
        Processes a single conversational turn in the 3-turn intake consultation.
        """
        turn_number = (len(history) // 2) + 1
        msg_lower = user_message.lower()

        # Extract friction topics from user message and history
        detected_topics: List[str] = []
        combined_text = user_message + " " + " ".join(m.content for m in history if m.role == "user")
        comb_lower = combined_text.lower()

        for topic, keywords in cls.KNOWN_TOPICS.items():
            if any(kw in comb_lower for kw in keywords):
                detected_topics.append(topic)

        if not detected_topics:
            detected_topics = ["Integration by Parts: Bracket Sign Distribution", "Substitution vs Standard Forms"]

        # Extract target score if mentioned in message (e.g., "I'm aiming for 75+", "need 85%", "75%")
        score_matches = []
        kw_matches = re.findall(r"(?:aiming for|target|goal|need|score of)\s*(\d{2})(?:\+|%|marks?)?", user_message, re.IGNORECASE)
        if kw_matches:
            score_matches.extend([int(s) for s in kw_matches])
        pct_matches = re.findall(r"(\d{2})\s*%", user_message)
        if pct_matches:
            score_matches.extend([int(s) for s in pct_matches])
        plus_matches = re.findall(r"(\d{2})\s*\+", user_message)
        if plus_matches:
            score_matches.extend([int(s) for s in plus_matches])

        valid_scores = [s for s in score_matches if 40 <= s <= 100]
        extracted_target = max(valid_scores) if valid_scores else target_score

        # Extract timeline in days if mentioned (e.g., "Have 5 days", "in 48 hours", "2 weeks")
        extracted_days = 5
        days_matches = re.findall(r"(\d+)\s*days?", user_message, re.IGNORECASE)
        hours_matches = re.findall(r"(\d+)\s*hours?", user_message, re.IGNORECASE)
        weeks_matches = re.findall(r"(\d+)\s*weeks?", user_message, re.IGNORECASE)
        if days_matches:
            extracted_days = int(days_matches[0])
        elif hours_matches:
            extracted_days = max(1, int(hours_matches[0]) // 24)
        elif weeks_matches:
            extracted_days = int(weeks_matches[0]) * 7

        is_complete = turn_number >= 2 or any(k in msg_lower for k in ["ready", "launch", "probe", "begin"])

        prompt = f"""
Turn Number: {turn_number}/3
Student Target Score: {extracted_target}%
Baseline Score: {baseline_score}%
Timeline Days Remaining: {extracted_days}
Current User Message: "{user_message}"
Conversation History:
{chr(10).join(f"- {m.role.upper()}: {m.content}" for m in history)}

Generate a helpful, empathetic response guiding the student to calibrate their 10-minute diagnostic probe.
"""

        try:
            ai_reply = await ai_client.generate_text(
                prompt=prompt,
                system_instruction=INTAKE_SYSTEM_INSTRUCTION,
            )
            if not ai_reply or "offline" in ai_reply.lower():
                reply = cls._generate_deterministic_reply(turn_number, extracted_target, baseline_score, user_message)
            else:
                reply = ai_reply.strip()
        except Exception:
            reply = cls._generate_deterministic_reply(turn_number, extracted_target, baseline_score, user_message)

        # Contextual Quick-Select Chips (Task 4.5)
        if turn_number == 1:
            suggested_chips = [
                "I'm aiming for 75+",
                "Have 5 days left",
                "Bracket sign distribution in parts",
                "Method selection: substitution vs parts",
            ]
        elif turn_number == 2:
            suggested_chips = [
                "Bracket sign mistakes in integration by parts",
                "Integrating factor setup in linear ODEs",
                "Boundary checks in improper integrals",
                "Ready to launch Mode A Diagnostic Probe",
            ]
        else:
            suggested_chips = [
                "Launch Mode A 10-Minute Probe",
                "Explain the 3 calibrated hinge questions",
                "Switch to Mode B: Upload Exam Paper",
            ]

        # Update message history
        updated_messages = list(history)
        updated_messages.append(IntakeMessage(role="user", content=user_message))
        updated_messages.append(IntakeMessage(role="assistant", content=reply))

        session_state = IntakeSessionState(
            session_id=session_id,
            course_id=course_id,
            messages=updated_messages,
            extracted_target_score=extracted_target,
            extracted_timeline_days=extracted_days,
            extracted_friction_topics=detected_topics,
            recommended_mode=DiagnosticMode.PROBE,
            is_consultation_complete=is_complete,
        )

        return IntakeConsultResponse(
            assistant_reply=reply,
            session_state=session_state,
            ready_for_diagnostic=is_complete,
            suggested_chips=suggested_chips,
        )

    @classmethod
    def _generate_deterministic_reply(
        cls,
        turn_number: int,
        target_score: int,
        baseline_score: int,
        user_message: str,
    ) -> str:
        """Deterministic conversational fallbacks for fast, guaranteed zero-block execution."""
        if turn_number == 1:
            return (
                f"Welcome Rahul! Bridging from {baseline_score}% to {target_score}% in MATH 301 is completely achievable before your exam on Oct 28. "
                "When working through exam-level problems, where do you feel the biggest friction: deciding which method to choose, or making algebraic execution slips along the way?"
            )
        elif turn_number == 2:
            return (
                "That makes complete sense. Many students lose marks in procedural calculus when signs distribute across nested brackets. "
                "To pinpoint your exact marks leaks without you having to re-solve an entire 3-hour exam, I have prepared a Mode A '10-Minute Diagnostic Probe' consisting of 3 calibrated hinge questions. Shall we launch the probe?"
            )
        else:
            return (
                "Your diagnostic profile is calibrated! I have queued 3 hinge questions covering Method Selection, Bracket Sign Inversion, and Boundary Checks. Ready to begin?"
            )


# Global singleton instance
intake_agent = IntakeAgent()
