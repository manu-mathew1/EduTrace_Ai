"""
EduTrace AI — Pre-Seed Demo Database Script (Pod P1: Tech Lead & Core Systems)
Seeds SQLite database (edutrace.db) with rich, realistic multi-course demo data:
- Calculus III and Macroeconomics courses with baseline scores and exam dates
- Syllabus & lecture note documents
- Student intake session for Rahul (Target 75+, 5 Days)
- Real forensic derivation submissions with step-diff analysis
- Bayesian Learning Twin skills with calibrated Beta prior parameters
"""

import sys
import os
import json
import asyncio
from datetime import datetime
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / ".deps"))

from backend.db.database import AsyncSessionLocal, init_db, engine
from backend.db.models import (
    CourseModel,
    DocumentModel,
    IntakeSessionModel,
    SubmissionModel,
    SkillTwinModel,
    ReassessmentLogModel,
)
from backend.services.twin_service import calculate_beta_mastery


async def seed_demo_data():
    print("🌱 Initializing EduTrace AI Demo Database...")
    await init_db()

    async with AsyncSessionLocal() as session:
        # 1. Seed Courses
        courses = [
            CourseModel(
                id="course_calc_301",
                title="Calculus III: Multivariable & Advanced Integration",
                subject_archetype="procedural",
                target_score=75,
                current_baseline=50,
                target_exam_date="2026-10-28",
            ),
            CourseModel(
                id="course_econ_macro",
                title="Macroeconomics: Aggregate Dynamics & Fiscal Policy",
                subject_archetype="conceptual",
                target_score=80,
                current_baseline=58,
                target_exam_date="2026-11-04",
            ),
        ]

        for course in courses:
            existing = await session.get(CourseModel, course.id)
            if not existing:
                session.add(course)
                print(f"  + Added Course: {course.title} ({course.id})")
            else:
                existing.title = course.title
                existing.target_score = course.target_score
                existing.current_baseline = course.current_baseline

        await session.commit()

        # 2. Seed Ingested Course Documents
        docs = [
            DocumentModel(
                id="doc_calc_syllabus",
                course_id="course_calc_301",
                filename="MATH301_Syllabus_Fall2026.pdf",
                classified_type="syllabus",
                confidence=0.98,
                page_count=6,
                topics_detected_json=json.dumps([
                    "Repeated Integration by Parts",
                    "Trigonometric Substitution",
                    "First-Order Linear ODEs",
                    "Improper Integrals with Infinite Discontinuity",
                ]),
                exam_weight_percentage=100.0,
            ),
            DocumentModel(
                id="doc_calc_lecture2",
                course_id="course_calc_301",
                filename="Prof_Kapoor_Module2_Integration_Techniques.pdf",
                classified_type="lecture_notes",
                confidence=0.96,
                page_count=32,
                topics_detected_json=json.dumps([
                    "Integration by Parts Bracket Rule",
                    "Sign Distribution in Nested Integrals",
                    "Tabular Integration Shortcut",
                ]),
                exam_weight_percentage=35.0,
            ),
            DocumentModel(
                id="doc_calc_midterm",
                course_id="course_calc_301",
                filename="Calculus_Midterm_Exam2_Fall2026.pdf",
                classified_type="past_paper",
                confidence=0.97,
                page_count=8,
                topics_detected_json=json.dumps([
                    "Question 3: Repeated Parts Sign Pitfall",
                    "Question 4: Improper Integral Discontinuity",
                ]),
                exam_weight_percentage=25.0,
            ),
            DocumentModel(
                id="doc_econ_syllabus",
                course_id="course_econ_macro",
                filename="ECON202_Macro_Syllabus_Fall2026.pdf",
                classified_type="syllabus",
                confidence=0.99,
                page_count=5,
                topics_detected_json=json.dumps([
                    "Keynesian Cross Multiplier",
                    "IS-LM Equilibrium",
                    "Fiscal Crowding Out",
                ]),
                exam_weight_percentage=100.0,
            ),
        ]

        for doc in docs:
            existing = await session.get(DocumentModel, doc.id)
            if not existing:
                session.add(doc)
                print(f"  + Added Document: {doc.filename}")

        await session.commit()

        # 3. Seed Student Intake Session (Rahul, Goal: 75+, Timeline: 5 Days)
        intake_sess = await session.get(IntakeSessionModel, "sess_demo_calc_01")
        if not intake_sess:
            session.add(
                IntakeSessionModel(
                    session_id="sess_demo_calc_01",
                    course_id="course_calc_301",
                    messages_json=json.dumps([
                        {"role": "assistant", "content": "Welcome Rahul! I reviewed your Calculus III course outline. What target grade are you aiming for on next Wednesday's exam?"},
                        {"role": "user", "content": "I'm aiming for 75+. I scored 50 on Midterm 2 and have 5 days left before the exam."},
                        {"role": "assistant", "content": "Target 75+ registered with a 5-day horizon. Where do you feel the biggest friction: procedural calculation leaks or fundamental theorem selection?"},
                        {"role": "user", "content": "Definitely procedural leaks in multi-step integration and sign expansions."},
                    ]),
                    extracted_target_score=75,
                    extracted_timeline_days=5,
                    extracted_friction_topics_json=json.dumps([
                        "Integration by Parts Sign Distribution",
                        "Nested Inner Brackets",
                        "Procedural Algebraic Expansions",
                    ]),
                    recommended_mode="probe",
                    is_consultation_complete=True,
                )
            )
            print("  + Added Intake Session: sess_demo_calc_01 (Rahul)")

        # 4. Seed Forensic Submissions with Step-Diff Divergence Records
        sub_calc = await session.get(SubmissionModel, "sub_math_9042")
        if not sub_calc:
            steps_data = [
                {
                    "step_index": 1,
                    "submitted_work": "u = x^2, dv = cos(x)dx => du = 2x dx, v = sin(x)",
                    "expected_rubric_step": "Identify parts u and dv correctly: u = x^2, dv = cos(x)dx",
                    "marks_awarded": 2.5,
                    "marks_possible": 2.5,
                    "status": "satisfied",
                },
                {
                    "step_index": 2,
                    "submitted_work": "= x^2 sin(x) - \\int 2x sin(x) dx",
                    "expected_rubric_step": "Apply integration by parts formula: uv - \\int v du",
                    "marks_awarded": 2.5,
                    "marks_possible": 2.5,
                    "status": "satisfied",
                },
                {
                    "step_index": 3,
                    "submitted_work": "= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]",
                    "expected_rubric_step": "Perform second iteration: enclose inner formula in brackets before outer negative distribution",
                    "marks_awarded": 0.0,
                    "marks_possible": 2.5,
                    "status": "diverged",
                    "error_type": "procedural_calculation",
                    "divergence_reason": "Minus sign distributed incorrectly across inner brackets during 2nd iteration of Integration by Parts.",
                    "cited_source_title": "Prof Kapoor Lecture Notes — Module 2",
                    "cited_page_or_slide": 19,
                },
                {
                    "step_index": 4,
                    "submitted_work": "= x^2 sin(x) + 2x cos(x) - 2sin(x)",
                    "expected_rubric_step": "Final simplified antiderivative with integration constant + C: x^2 sin(x) + 2x cos(x) - 2sin(x) + C",
                    "marks_awarded": 0.0,
                    "marks_possible": 2.5,
                    "status": "carried_forward_error",
                    "divergence_reason": "Carried forward sign error and omitted arbitrary constant + C.",
                },
            ]

            session.add(
                SubmissionModel(
                    id="sub_math_9042",
                    course_id="course_calc_301",
                    question_id="q3_repeated_parts",
                    submitted_work=(
                        "u = x^2, dv = cos(x)dx => du = 2x dx, v = sin(x)\n"
                        "= x^2 sin(x) - \\int 2x sin(x) dx\n"
                        "= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]\n"
                        "= x^2 sin(x) + 2x cos(x) - 2sin(x)"
                    ),
                    steps_json=json.dumps(steps_data),
                    first_divergence_step=3,
                    primary_error_type="procedural_calculation",
                    estimated_marks_obtained=5.0,
                    total_possible_marks=10.0,
                    forensic_summary="Method selection was sound. Divergence occurred at Step 3 due to negative sign distribution across inner brackets during the 2nd iteration of Integration by Parts.",
                    needs_human_review=False,
                )
            )
            print("  + Added Forensic Submission: sub_math_9042")

        await session.commit()

        # 5. Seed Bayesian Skill Twins for Rahul (std_rahul_99)
        from sqlalchemy import select
        skills_to_seed = [
            {
                "skill_id": "skill_parts_sign",
                "skill_name": "Integration by Parts: Bracket Sign Distribution",
                "alpha": 4.0,
                "beta": 5.0,
                "range": [0.22, 0.68],
            },
            {
                "skill_id": "skill_sub_vs_parts",
                "skill_name": "Method Selection: Substitution vs Integration by Parts",
                "alpha": 6.0,
                "beta": 4.0,
                "range": [0.35, 0.81],
            },
            {
                "skill_id": "skill_ode_factor",
                "skill_name": "First-Order Linear ODE: Integrating Factor Normalization",
                "alpha": 5.0,
                "beta": 5.0,
                "range": [0.25, 0.75],
            },
            {
                "skill_id": "skill_improper_discontinuity",
                "skill_name": "Improper Integrals: Essential Singularity Verification",
                "alpha": 3.0,
                "beta": 7.0,
                "range": [0.12, 0.54],
            },
            {
                "skill_id": "skill_econ_multiplier",
                "skill_name": "Keynesian Fiscal Multiplier: Tax Drag Leakage",
                "alpha": 4.5,
                "beta": 5.5,
                "range": [0.20, 0.70],
            },
        ]

        for s in skills_to_seed:
            stmt = select(SkillTwinModel).where(
                SkillTwinModel.student_id == "std_rahul_99",
                SkillTwinModel.skill_id == s["skill_id"],
            )
            existing_skill = (await session.execute(stmt)).scalar_one_or_none()
            mastery, interval = calculate_beta_mastery(s["alpha"], s["beta"])

            if not existing_skill:
                session.add(
                    SkillTwinModel(
                        student_id="std_rahul_99",
                        course_id="course_calc_301" if "econ" not in s["skill_id"] else "course_econ_macro",
                        skill_id=s["skill_id"],
                        skill_name=s["skill_name"],
                        alpha=s["alpha"],
                        beta=s["beta"],
                        mastery_percentage=mastery,
                        uncertainty_range_json=json.dumps(interval),
                        last_tested_timestamp="2026-10-23T08:00:00",
                    )
                )
                print(f"  + Added Bayesian Skill Twin: {s['skill_name']} ({mastery}%)")
            else:
                existing_skill.alpha = s["alpha"]
                existing_skill.beta = s["beta"]
                existing_skill.mastery_percentage = mastery
                existing_skill.uncertainty_range_json = json.dumps(interval)

        await session.commit()

    print("✅ Demo database successfully populated in 'edutrace.db'!")


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
