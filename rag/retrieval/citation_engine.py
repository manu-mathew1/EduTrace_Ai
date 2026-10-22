"""
EduTrace AI — RAG Citation Retriever & Lecture Quote Engine (Pod P2: Task 3.3)
Extracts slide/page quotes grounded in professor's lecture notes for diverged steps.
Fulfills Thread #004 contract for Pod P4's Socratic Co-Pilot.
"""

import re
from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Tuple

from rag.retrieval.vector_store import vector_store


@dataclass
class CitationMatch:
    chunk_id: str
    title: str
    slide_number: Optional[int]
    page_number: Optional[int]
    quote: str
    relevance_score: float
    pedagogical_remediation_tip: str
    matched_trap: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "title": self.title,
            "slide_number": self.slide_number,
            "page_number": self.page_number,
            "quote": self.quote,
            "relevance_score": self.relevance_score,
            "pedagogical_remediation_tip": self.pedagogical_remediation_tip,
            "matched_trap": self.matched_trap,
        }


class CitationRetriever:
    """
    RAG Citation Engine extracting exact lecture slide/page references and
    pedagogical remediation tips for forensic step divergences.
    """

    def __init__(self, engine=None):
        self.vector_store = engine or vector_store

    def _extract_trap_signature(
        self,
        diverged_text: str,
        expected_text: str,
        error_type: Optional[str] = None,
    ) -> Tuple[str, str, str]:
        """
        Analyzes divergence delta to produce focused query terms, trap name, and remediation tip.
        """
        combined = f"{diverged_text} {expected_text} {error_type or ''}".lower()

        if any(w in combined for w in ["bracket", "minus", "sign", "- [", "-∫", "outer negative"]):
            return (
                "integration by parts repeated bracket minus sign pitfall",
                "Nested Bracket Minus Sign Inversion",
                "Review Slide 19: Always enclose the entire second iteration in brackets before distributing the outer minus sign.",
            )
        elif any(w in combined for w in ["arctan", "1/(1+x^2)", "degree", "substitution vs"]):
            return (
                "substitution vs arctan standard form degree numerator denominator",
                "Method Selection: Impulsive Substitution",
                "Review Slide 17: Check polynomial degree numerator vs denominator before initiating substitution.",
            )
        elif any(w in combined for w in ["ode", "linear", "integrating factor", "leading", "standard form", "p(x)", "i(x)", "y'"]):
            return (
                "linear differential equation canonical standard form leading coefficient integrating factor",
                "Leading Coefficient Normalization Omission",
                "Review Slide 22: Always divide by leading coefficient to isolate y' before calculating exp(∫ P(x) dx).",
            )
        elif any(w in combined for w in ["discontinuity", "improper", "1/x^2", "singularity", "infinite"]):
            return (
                "improper integral essential infinite discontinuity singularity",
                "Blind FTC Application Across Infinite Discontinuity",
                "Review Slide 25: Never apply FTC across an infinite singularity. Split into improper limit integrals.",
            )
        elif any(w in combined for w in ["binary", "search", "overflow", "mid"]):
            return (
                "binary search invariant midpoint integer overflow loop condition",
                "Binary Search Midpoint Overflow / Loop Invariant",
                "Review Slide 12: Use `low + (high - low) // 2` to prevent 32-bit integer overflow.",
            )
        else:
            return (
                f"{diverged_text} {expected_text}",
                "General Step Divergence",
                "Review the corresponding lecture slide method derivation carefully.",
            )

    def retrieve_for_divergence(
        self,
        course_id: str,
        diverged_step_text: str,
        expected_step_text: str,
        error_type: Optional[str] = None,
        limit: int = 3,
    ) -> List[CitationMatch]:
        """
        Retrieves lecture quotes directly explaining why the student's step failed.
        """
        query_terms, trap_name, remediation_tip = self._extract_trap_signature(
            diverged_text=diverged_step_text,
            expected_text=expected_step_text,
            error_type=error_type,
        )

        raw_results = self.vector_store.search(
            query=query_terms,
            course_id=course_id,
            limit=limit,
        )

        matches: List[CitationMatch] = []
        for r in raw_results:
            matches.append(
                CitationMatch(
                    chunk_id=r["chunk_id"],
                    title=r["title"],
                    slide_number=r.get("slide_number"),
                    page_number=r.get("page_number"),
                    quote=r["quote"],
                    relevance_score=r["relevance_score"],
                    pedagogical_remediation_tip=remediation_tip,
                    matched_trap=trap_name,
                )
            )

        return matches

    def retrieve_citations(
        self,
        course_id: str,
        topic: str,
        limit: int = 3,
    ) -> List[CitationMatch]:
        """
        General topic-based citation retrieval.
        """
        raw_results = self.vector_store.search(query=topic, course_id=course_id, limit=limit)
        return [
            CitationMatch(
                chunk_id=r["chunk_id"],
                title=r["title"],
                slide_number=r.get("slide_number"),
                page_number=r.get("page_number"),
                quote=r["quote"],
                relevance_score=r["relevance_score"],
                pedagogical_remediation_tip="Review the identified lecture section for step guidance.",
                matched_trap="Topic Reference",
            )
            for r in raw_results
        ]

    def get_metrics(self) -> Dict[str, Any]:
        """Returns query caching and search performance metrics."""
        return self.vector_store.cache.get_metrics()


# Global singleton instance
citation_retriever = CitationRetriever()


def retrieve_relevant_citations(course_id: str, topic: str, limit: int = 3) -> List[Dict[str, Any]]:
    """
    Contract function requested by Pod P4 in Thread #004.
    Returns list of dicts with title, slide_number, page_number, and quote.
    """
    matches = citation_retriever.retrieve_citations(course_id=course_id, topic=topic, limit=limit)
    return [m.to_dict() for m in matches]
