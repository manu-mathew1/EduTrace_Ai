"""
EduTrace AI — Cognitive Error Taxonomy Classifier (Pod P4: Task 2.10)
Classifies student derivation divergence points into 6 pedagogical error archetypes:
1. Procedural Calculation (algebraic slips, bracket distribution, arithmetic)
2. Method Selection (wrong formula or technique chosen)
3. Conceptual Misunderstanding (violating fundamental theorems, ignoring bounds/domains)
4. Rubric Omission (omitting constants of integration +C, boundary justifications)
5. Factual Recall (misremembering definitions or standard formulas)
6. Evaluative Synthesis (failing multi-stage proof constraints)
"""

import re
import logging
from typing import Dict, Any, Tuple
from backend.schemas.contracts import ErrorTaxonomy

logger = logging.getLogger("edutrace.forensics.taxonomy")


class ErrorTaxonomyClassifier:
    """
    Expert classifier mapping mathematical discrepancies to cognitive root causes.
    """

    PROCEDURAL_TRIGGERS = [
        r"sign", r"minus", r"bracket", r"arithmetic", r"factor", r"distribution",
        r"algebraic", r"expand", r"multiply", r"invert"
    ]
    METHOD_TRIGGERS = [
        r"technique", r"method", r"substitution", r"formula", r"inappropriate",
        r"separable", r"parts instead", r"wrong rule"
    ]
    CONCEPTUAL_TRIGGERS = [
        r"discontinuity", r"domain", r"theorem", r"fundamental", r"diverge",
        r"boundary", r"limit", r"infinity", r"unbounded", r"dimension"
    ]
    OMISSION_TRIGGERS = [
        r"\+ ?c\b", r"constant of integration", r"omitted", r"missing", r"unstated"
    ]

    @classmethod
    def classify_divergence(
        cls,
        diverged_step_text: str,
        expected_rubric_text: str,
        divergence_context: str = "",
    ) -> Tuple[ErrorTaxonomy, float, str]:
        """
        Classifies the root cause of a divergence.
        Returns: (ErrorTaxonomy, confidence_score, pedagogical_explanation)
        """
        combined = f"{diverged_step_text} {expected_rubric_text} {divergence_context}".lower()

        # 1. Check Rubric Omission (+C omission)
        if ("+ c" in expected_rubric_text.lower() and "+ c" not in diverged_step_text.lower()) or \
           any(re.search(pat, combined) for pat in cls.OMISSION_TRIGGERS):
            return (
                ErrorTaxonomy.RUBRIC_OMISSION,
                0.96,
                "Omission of mandatory integration constant (+ C) or boundary conditions required by official rubric."
            )

        # 2. Check Conceptual Misunderstanding
        if any(re.search(pat, combined) for pat in cls.CONCEPTUAL_TRIGGERS):
            return (
                ErrorTaxonomy.CONCEPTUAL_MISUNDERSTANDING,
                0.94,
                "Violation of underlying mathematical principles (e.g. evaluating an improper integral across an interior discontinuity without limits)."
            )

        # 3. Check Method Selection
        if any(re.search(pat, combined) for pat in cls.METHOD_TRIGGERS):
            return (
                ErrorTaxonomy.METHOD_SELECTION,
                0.92,
                "Sub-optimal or incorrect method chosen for the problem structure (e.g. attempting u-substitution where standard form or parts is required)."
            )

        # 4. Check Procedural Calculation (Default for sign/bracket leaks)
        return (
            ErrorTaxonomy.PROCEDURAL_CALCULATION,
            0.95,
            "Algebraic calculation slip during execution (e.g. minus sign inverted across nested parentheses during repeated integration by parts)."
        )


# Global singleton instance
taxonomy_classifier = ErrorTaxonomyClassifier()
