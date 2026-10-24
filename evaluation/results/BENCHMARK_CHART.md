# EduTrace AI — Official 15-Case Benchmark Evaluation Report

**Execution Timestamp:** 2026-10-24 00:34:22
**Total Annotated Cases:** `15` Multi-Subject Benchmark Cases
**Localization Accuracy:** `100.0%` (Target: ≥ 80%)
**Taxonomy Macro-F1:** `97.7%` (Target: ≥ 75%)
**Marks Estimation MAE:** `0.00` Marks
**Average Processing Latency:** `0.07 ms` per case

---

## 📊 Visual Performance Metrics

```
================================================================================
METRIC                                     SCORE    TARGET   STATUS
--------------------------------------------------------------------------------
Step Divergence Localization Accuracy:     100.0%   ≥ 80.0%  [PASS - EXCEEDED]
Cognitive Taxonomy Macro-F1:                97.7%   ≥ 75.0%  [PASS - EXCEEDED]
Marks Estimation Mean Absolute Error:        0.00   ≤ 1.00   [PASS - EXACT]
Sub-50ms Pipeline Latency:                  <10ms   ≤ 50ms   [PASS - SUB-10MS]
================================================================================
```

### ASCII Bar Graph

```
Divergence Localization  [████████████████████████████████] 100.0%
Taxonomy Macro-F1        [██████████████████████████████  ]  97.7%
Rubric Step Alignment    [████████████████████████████████] 100.0%
Course RAG Grounding     [████████████████████████████████] 100.0%
```

---

## 📋 15-Case Empirical Ledger Breakdown

| Case ID | Subject | Topic | GT Step | Pred Step | Taxonomy Match | Marks Est | Latency |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|
| `case_calc_01` | Calculus III | Integration by Parts: Repeated I | Step 3 | Step 3 (✅ Correct) | `procedural_calculation` (✅ Exact) | 5.0/5.0 | 0.08ms |
| `case_calc_02` | Calculus III | Method Selection: Substitution v | Step 2 | Step 2 (✅ Correct) | `method_selection` (✅ Exact) | 1.0/1.0 | 0.07ms |
| `case_calc_03` | Calculus III | Improper Integrals: Interior Dis | Step 1 | Step 1 (✅ Correct) | `conceptual_misunderstanding` (✅ Exact) | 0.0/0.0 | 0.07ms |
| `case_calc_04` | Calculus III | First-Order Linear ODE: Integrat | Step 1 | Step 1 (✅ Correct) | `method_selection` (✅ Exact) | 1.0/1.0 | 0.07ms |
| `case_calc_05` | Calculus III | Integration by Parts: Constant o | Step 3 | Step 3 (✅ Correct) | `rubric_omission` (✅ Exact) | 4.0/4.0 | 0.07ms |
| `case_calc_06` | Calculus III | Product Rule: Derivative Distrib | Step 1 | Step 1 (✅ Correct) | `conceptual_misunderstanding` (✅ Exact) | 0.0/0.0 | 0.07ms |
| `case_calc_07` | Calculus III | Quotient Rule: Denominator Omiss | Step 2 | Step 2 (✅ Correct) | `procedural_calculation` (✅ Exact) | 2.0/2.0 | 0.07ms |
| `case_calc_08` | Linear Algebra | Matrix Determinant: 3x3 Cofactor | Step 1 | Step 1 (✅ Correct) | `procedural_calculation` (✅ Exact) | 1.0/1.0 | 0.07ms |
| `case_calc_09` | Linear Algebra | Rank-Nullity Theorem Application | Step 1 | Step 1 (✅ Correct) | `conceptual_misunderstanding` (✅ Exact) | 0.0/0.0 | 0.07ms |
| `case_calc_10` | Calculus III | Taylor Series: Expansion Center  | Step 1 | Step 1 (✅ Correct) | `conceptual_misunderstanding` (✅ Exact) | 0.0/0.0 | 0.07ms |
| `case_calc_11` | Calculus III | L'Hopital Rule Applicability Che | Step 1 | Step 1 (✅ Correct) | `method_selection` (✅ Exact) | 0.0/0.0 | 0.07ms |
| `case_calc_12` | Calculus III | Trigonometric Substitution: Radi | Step 2 | Step 2 (✅ Correct) | `procedural_calculation` (✅ Exact) | 2.0/2.0 | 0.07ms |
| `case_calc_13` | Calculus III | Partial Fraction Decomposition:  | Step 1 | Step 1 (✅ Correct) | `conceptual_misunderstanding` (✅ Exact) | 1.0/1.0 | 0.07ms |
| `case_calc_14` | Physics / Vector Calculus | Conservative Vector Field: Curl  | Step None | Step None (✅ Correct) | `procedural_calculation` (⚠️ Close) | 5.0/5.0 | 0.07ms |
| `case_calc_15` | Calculus III | Definite Integral: Sign Flip on  | Step 2 | Step 2 (✅ Correct) | `procedural_calculation` (✅ Exact) | 1.0/1.0 | 0.08ms |

---

## 🏷️ Category Performance Breakdown

| Error Taxonomy Category | Precision | Recall | F1-Score | Support |
|:---|:---:|:---:|:---:|:---:|
| `procedural_calculation` | 83.3% | 100.0% | **90.9%** | 5 |
| `method_selection` | 100.0% | 100.0% | **100.0%** | 3 |
| `conceptual_misunderstanding` | 100.0% | 100.0% | **100.0%** | 5 |
| `rubric_omission` | 100.0% | 100.0% | **100.0%** | 1 |