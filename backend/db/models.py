"""
EduTrace AI — Database ORM Models (P1: Tech Lead & Core Systems)
SQLAlchemy 2.0 ORM models for courses, documents, intake sessions, forensic submissions,
and Bayesian Learning Twin state.
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    String, Integer, Float, Boolean, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.db.database import Base


class CourseModel(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subject_archetype: Mapped[str] = mapped_column(String(32), default="procedural", nullable=False)
    target_score: Mapped[int] = mapped_column(Integer, default=75, nullable=False)
    current_baseline: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    target_exam_date: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    documents: Mapped[List["DocumentModel"]] = relationship("DocumentModel", back_populates="course", cascade="all, delete-orphan")
    intake_sessions: Mapped[List["IntakeSessionModel"]] = relationship("IntakeSessionModel", back_populates="course", cascade="all, delete-orphan")
    submissions: Mapped[List["SubmissionModel"]] = relationship("SubmissionModel", back_populates="course", cascade="all, delete-orphan")
    skills: Mapped[List["SkillTwinModel"]] = relationship("SkillTwinModel", back_populates="course", cascade="all, delete-orphan")


class DocumentModel(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    course_id: Mapped[str] = mapped_column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    classified_type: Mapped[str] = mapped_column(String(32), default="unknown", nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    page_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    topics_detected_json: Mapped[Optional[str]] = mapped_column(Text, default="[]", nullable=True)
    exam_weight_percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    course: Mapped["CourseModel"] = relationship("CourseModel", back_populates="documents")


class IntakeSessionModel(Base):
    __tablename__ = "intake_sessions"

    session_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    course_id: Mapped[str] = mapped_column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    messages_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    extracted_target_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    extracted_timeline_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    extracted_friction_topics_json: Mapped[Optional[str]] = mapped_column(Text, default="[]", nullable=True)
    recommended_mode: Mapped[str] = mapped_column(String(32), default="probe", nullable=False)
    is_consultation_complete: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    course: Mapped["CourseModel"] = relationship("CourseModel", back_populates="intake_sessions")


class SubmissionModel(Base):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    course_id: Mapped[str] = mapped_column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    question_id: Mapped[str] = mapped_column(String(64), nullable=False)
    submitted_work: Mapped[str] = mapped_column(Text, nullable=False)
    steps_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    first_divergence_step: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    primary_error_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    estimated_marks_obtained: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_possible_marks: Mapped[float] = mapped_column(Float, default=10.0, nullable=False)
    forensic_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    needs_human_review: Mapped[Optional[bool]] = mapped_column(Boolean, default=False, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    course: Mapped["CourseModel"] = relationship("CourseModel", back_populates="submissions")


class SkillTwinModel(Base):
    __tablename__ = "skill_twins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[str] = mapped_column(String(64), default="default_student", nullable=False, index=True)
    course_id: Mapped[str] = mapped_column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    skill_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    skill_name: Mapped[str] = mapped_column(String(255), nullable=False)
    alpha: Mapped[float] = mapped_column(Float, default=2.0, nullable=False)
    beta: Mapped[float] = mapped_column(Float, default=2.0, nullable=False)
    mastery_percentage: Mapped[float] = mapped_column(Float, default=50.0, nullable=False)
    uncertainty_range_json: Mapped[str] = mapped_column(String(128), default="[0.2, 0.8]", nullable=False)
    last_tested_timestamp: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    course: Mapped["CourseModel"] = relationship("CourseModel", back_populates="skills")

    __table_args__ = (
        Index("idx_student_course_skill", "student_id", "course_id", "skill_id", unique=True),
    )


class ReassessmentLogModel(Base):
    __tablename__ = "reassessment_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    student_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    skill_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    is_improved: Mapped[bool] = mapped_column(Boolean, nullable=False)
    marks_awarded: Mapped[float] = mapped_column(Float, nullable=False)
    marks_possible: Mapped[float] = mapped_column(Float, nullable=False)
    previous_mastery: Mapped[float] = mapped_column(Float, nullable=False)
    new_mastery: Mapped[float] = mapped_column(Float, nullable=False)
    marks_recovered: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
