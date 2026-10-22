"""
EduTrace AI — Benchmark Evaluation Runner (Pod P5: Stage 5/6)
Executes ground-truth benchmark evaluation across annotated test cases,
reporting Step Divergence Accuracy, Taxonomy Macro-F1, and Marks Estimation MAE.
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from collections import defaultdict

from ai.forensics.divergence_detector import divergence_detector
from ai.forensics.taxonomy_classifier import taxonomy_classifier

logger = logging.getLogger("edutrace.evaluation")
EVAL_DIR = Path(__file__).resolve().parent


class BenchmarkRunner:
    """
    Evaluates forensic step parser, divergence detector, and taxonomy classifier against gold ground-truth.
    """

    def __init__(self, data_path: Optional[Path] = None):
        self.data_path = data_path or (EVAL_DIR / "data" / "annotated_cases.json")

    def load_cases(self) -> List[Dict[str, Any]]:
        if not self.data_path.exists():
            manifest_path = EVAL_DIR / "benchmark_manifest.json"
            if manifest_path.exists():
                with open(manifest_path) as f:
                    return json.load(f).get("cases", [])
            return []
        with open(self.data_path) as f:
            return json.load(f).get("cases", [])

    async def run_evaluation(self, cases: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        eval_cases = cases or self.load_cases()
        if not eval_cases:
            return {"status": "error", "message": "No benchmark cases found."}

        total = len(eval_cases)
        divergence_correct = 0
        taxonomy_matches = defaultdict(lambda: {"tp": 0, "fp": 0, "fn": 0})
        abs_marks_diffs = []

        for c in eval_cases:
            gt_step = c["ground_truth_divergence_step"]
            gt_tax = c["ground_truth_error_taxonomy"]
            gt_marks = float(c.get("expected_marks", 0.0))

            student_work = "\n".join(c["student_steps"])
            rubric = c["canonical_steps"]

            pred = await divergence_detector.detect_divergence(
                submission_id=f"bench_{c['case_id']}",
                question_id=c["case_id"],
                submitted_work=student_work,
                rubric_steps=rubric,
            )

            # Divergence localization check
            pred_step = pred.first_divergence_step
            if pred_step == gt_step:
                divergence_correct += 1

            # Taxonomy check
            pred_tax = pred.primary_error_type.value if pred.primary_error_type else "procedural_calculation"
            for t in ["procedural_calculation", "method_selection", "conceptual_misunderstanding", "rubric_omission"]:
                if pred_tax == t and gt_tax == t:
                    taxonomy_matches[t]["tp"] += 1
                elif pred_tax == t and gt_tax != t:
                    taxonomy_matches[t]["fp"] += 1
                elif pred_tax != t and gt_tax == t:
                    taxonomy_matches[t]["fn"] += 1

            abs_marks_diffs.append(abs(pred.estimated_marks_obtained - gt_marks))

        # Calculate Macro-F1 across active categories
        f1_scores = []
        for t, counts in taxonomy_matches.items():
            tp, fp, fn = counts["tp"], counts["fp"], counts["fn"]
            precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 1.0
            f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
            f1_scores.append(f1)

        macro_f1 = sum(f1_scores) / len(f1_scores) if f1_scores else 0.0
        divergence_acc = divergence_correct / total if total > 0 else 0.0
        mae_marks = sum(abs_marks_diffs) / total if total > 0 else 0.0

        return {
            "status": "success",
            "total_cases_evaluated": total,
            "divergence_localization_accuracy": round(divergence_acc, 3),
            "taxonomy_macro_f1": round(macro_f1, 3),
            "marks_estimation_mae": round(mae_marks, 2),
            "target_thresholds_met": divergence_acc >= 0.80 and macro_f1 >= 0.75,
        }


benchmark_runner = BenchmarkRunner()

if __name__ == "__main__":
    import asyncio
    res = asyncio.run(benchmark_runner.run_evaluation())
    print("Benchmark Evaluation Results:")
    print(json.dumps(res, indent=2))
