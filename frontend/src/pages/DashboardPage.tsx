import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Layers, 
  Zap, 
  HelpCircle,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { NavTab } from '../components/layout/Shell';
import { LearningTwinResponse, SkillMastery } from '../types/schema';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { CreateCourseModal } from '../components/course/CreateCourseModal';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { courses, activeCourse, activeCourseId, setActiveCourseId } = useCourses();
  const [readinessScore, setReadinessScore] = useState<number>(68.4);
  const [marksRecovered, setMarksRecovered] = useState<number>(8.0);
  const [twinData, setTwinData] = useState<LearningTwinResponse | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const isCourseCalibrated = activeCourse ? (activeCourse.is_calibrated ?? (twinData?.is_calibrated ?? false)) : false;

  const examDaysLeft = activeCourse?.target_exam_date
    ? Math.max(1, Math.ceil((new Date(activeCourse.target_exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 5;

  useEffect(() => {
    const activeStudentId = user?.id || 'std_rahul_99';

    fetch(`/api/twin/profile?course_id=${encodeURIComponent(activeCourseId)}&student_id=${activeStudentId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setTwinData(data);
          if (data.overall_readiness_score) {
            setReadinessScore(data.overall_readiness_score);
          }
          if (typeof data.total_marks_recovered_to_date === 'number') {
            setMarksRecovered(data.total_marks_recovered_to_date);
          }
        }
      })
      .catch(() => {});
  }, [activeCourseId, user?.id]);

  const defaultSkills: SkillMastery[] = [
    {
      skill_id: 'skill_parts_sign',
      skill_name: 'Integration by Parts: Bracket Sign Distribution',
      alpha: 13.5,
      beta: 1.5,
      mastery_percentage: 90.0,
      confidence_interval: [0.82, 0.96],
      status: 'verified_mastered',
    },
    {
      skill_id: 'skill_trig_sub',
      skill_name: 'Trigonometric Substitution Radical Forms',
      alpha: 5.5,
      beta: 4.5,
      mastery_percentage: 55.0,
      confidence_interval: [0.38, 0.71],
      status: 'in_progress',
    },
    {
      skill_id: 'skill_partial_fractions',
      skill_name: 'Partial Fractions Repeated Quadratic Factors',
      alpha: 3.0,
      beta: 7.0,
      mastery_percentage: 30.0,
      confidence_interval: [0.15, 0.48],
      status: 'needs_remediation',
    },
    {
      skill_id: 'skill_improper_integrals',
      skill_name: 'Improper Integrals Infinite Discontinuity Detection',
      alpha: 6.0,
      beta: 4.0,
      mastery_percentage: 60.0,
      confidence_interval: [0.42, 0.76],
      status: 'in_progress',
    },
    {
      skill_id: 'skill_nested_chain_rule',
      skill_name: 'Nested Chain Rule & Differential Simplification',
      alpha: 11.0,
      beta: 2.0,
      mastery_percentage: 84.6,
      confidence_interval: [0.72, 0.94],
      status: 'verified_mastered',
    },
  ];

  const skillsList = twinData?.skills && twinData.skills.length > 0 ? twinData.skills : defaultSkills;

  if (!activeCourse || courses.length === 0) {
    return (
      <div className="space-y-6 font-sans pb-12">
        <div className="p-8 rounded-2xl bg-[#121316] border border-white/[0.08] shadow-2xl text-center max-w-2xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 flex items-center justify-center mx-auto mb-4 text-[#5E6AD2] shadow-[0_0_24px_rgba(94,106,210,0.3)]">
            <BookOpen className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E6AD2] bg-[#5E6AD2]/10 px-2.5 py-1 rounded-full border border-[#5E6AD2]/20">
            Welcome • Setup Your First Subject
          </span>
          <h1 className="text-xl font-semibold text-[#F7F8F8] mt-3">
            Welcome to EduTrace AI, {user?.name || 'Student'}!
          </h1>
          <p className="text-xs text-[#8A8F98] mt-2 leading-relaxed max-w-md mx-auto">
            You don't have any subjects enrolled yet. Add your first university subject, set your target exam score, and calibrate your Learning Twin to begin your personalized evaluation.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-medium transition-all shadow-[0_2px_12px_rgba(94,106,210,0.4)]"
            >
              <Zap className="w-4 h-4" />
              <span>+ Add Your First Subject</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-3 rounded-lg bg-[#08090a] border border-white/[0.06]">
              <span className="text-[10px] font-mono text-[#5E6AD2]">1. Setup Subject</span>
              <p className="text-xs text-[#F7F8F8] font-medium mt-0.5">Target Score & Date</p>
              <p className="text-[11px] text-[#8A8F98] mt-1">Define your subject archetype and exam deadline</p>
            </div>
            <div className="p-3 rounded-lg bg-[#08090a] border border-white/[0.06]">
              <span className="text-[10px] font-mono text-[#E59934]">2. Diagnostic Check</span>
              <p className="text-xs text-[#F7F8F8] font-medium mt-0.5">Calibrate Twin</p>
              <p className="text-[11px] text-[#8A8F98] mt-1">Take a 10-min quiz or upload previous test</p>
            </div>
            <div className="p-3 rounded-lg bg-[#08090a] border border-white/[0.06]">
              <span className="text-[10px] font-mono text-[#27C57E]">3. Targeted Recovery</span>
              <p className="text-xs text-[#F7F8F8] font-medium mt-0.5">Earn Back Marks</p>
              <p className="text-[11px] text-[#8A8F98] mt-1">Fix exact cognitive leaks with grounded tutors</p>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <CreateCourseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* If course is not calibrated yet, show prominent Diagnostic Banner */}
      {!isCourseCalibrated && (
        <div className="p-4 rounded-xl bg-[#E59934]/10 border border-[#E59934]/25 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#E59934]/20 border border-[#E59934]/30 flex items-center justify-center shrink-0 text-[#E59934] mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#E59934] font-semibold">
                  Initial Diagnostic Required
                </span>
                <span className="text-xs text-[#8A8F98]">• {activeCourse.title}</span>
              </div>
              <p className="text-xs text-[#F7F8F8] mt-0.5">
                Your Learning Twin needs baseline evaluation data to accurately calculate your exam readiness and pinpoint cognitive leaks.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onNavigate('ingestion')}
              className="px-3 py-1.5 rounded-lg bg-[#08090a] hover:bg-white/[0.04] text-[#F7F8F8] text-xs font-medium border border-white/[0.08] transition-all"
            >
              Upload Notes
            </button>
            <button
              onClick={() => onNavigate('intake')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-medium transition-all shadow-[0_2px_8px_rgba(94,106,210,0.3)]"
            >
              <span>Take Diagnostic Check</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Course Context & Switcher Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase text-[#8A8F98]">Current Course</span>
            <span className="text-xs font-semibold text-[#F7F8F8]">
              {activeCourse?.title || 'Academic Subject'}
            </span>
          </div>
          <p className="text-xs text-[#8A8F98] mt-0.5">
            Upcoming Exam in {examDaysLeft} days • {skillsList.length} topics tracked
          </p>
        </div>

        {/* Dynamic Course Switcher Pills */}
        <div className="inline-flex p-0.5 rounded-lg bg-[#121316] border border-white/[0.08] max-w-full overflow-x-auto">
          {courses.slice(0, 4).map((c) => {
            const isSelected = c.course_id === activeCourseId;
            const shortName = c.title.split(':')[0];
            return (
              <button
                key={c.course_id}
                onClick={() => setActiveCourseId(c.course_id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.08]'
                    : 'text-[#8A8F98] hover:text-[#F7F8F8]'
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Metric Student Telemetry Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
          <span className="text-[11px] font-mono text-[#8A8F98] uppercase">Target Exam Score</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold font-mono tabular-nums text-[#F7F8F8]">
              {(activeCourse?.target_score || 75).toFixed(1)}%
            </span>
            <span className="text-[11px] text-[#8A8F98] font-mono">
              {(activeCourse?.target_score || 75) >= 85 ? 'Grade A' : 'Grade B+'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#8A8F98] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#E59934]" />
            <span>Final Exam: {activeCourse?.target_exam_date || 'Oct 28'}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
          <span className="text-[11px] font-mono text-[#8A8F98] uppercase">Estimated Readiness</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold font-mono tabular-nums text-[#F7F8F8]">
              {isCourseCalibrated ? `${readinessScore.toFixed(0)}%` : '--'}
            </span>
            <span className={`text-[11px] font-mono font-medium ${isCourseCalibrated ? 'text-[#27C57E]' : 'text-[#E59934]'}`}>
              {isCourseCalibrated ? '↑ Calibrated' : 'Awaiting Check'}
            </span>
          </div>
          <div className="mt-2.5 w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isCourseCalibrated ? 'bg-[#5E6AD2]' : 'bg-[#E59934]/40'}`} 
              style={{ width: isCourseCalibrated ? `${readinessScore}%` : '20%' }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
          <span className="text-[11px] font-mono text-[#8A8F98] uppercase">Marks Recovered</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold font-mono tabular-nums text-[#27C57E]">
              {isCourseCalibrated ? `+${marksRecovered.toFixed(1)}` : '0.0'}
            </span>
            <span className="text-[11px] text-[#8A8F98] font-mono">Marks</span>
          </div>
          <div className="mt-2 text-[11px] text-[#8A8F98] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#27C57E]" />
            <span>{isCourseCalibrated ? 'Added to projected score' : 'Complete check to unlock'}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
          <span className="text-[11px] font-mono text-[#8A8F98] uppercase">Gap to Goal</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold font-mono tabular-nums text-[#E59934]">
              {isCourseCalibrated ? '6.6' : `${((activeCourse?.target_score || 75) - (activeCourse?.current_baseline || 50)).toFixed(0)}`}
            </span>
            <span className="text-[11px] text-[#8A8F98] font-mono">Marks needed</span>
          </div>
          <div className="mt-2 text-[11px] text-[#8A8F98]">
            <span>{isCourseCalibrated ? 'Rank #1 practice yields +8.0' : 'Baseline evaluation needed'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Topic Mastery Matrix & Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Student-Friendly Topic Mastery List */}
        <div className="lg:col-span-2 rounded-xl bg-[#121316] border border-white/[0.08] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#5E6AD2]" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#F7F8F8]">
                Topic Mastery Breakdown
              </h2>
            </div>
            <span className="text-[11px] text-[#8A8F98]">
              Updated from your latest checks & exams
            </span>
          </div>

          {isCourseCalibrated ? (
            <div className="divide-y divide-white/[0.04]">
              {skillsList.map((skill, index) => {
                const isMastered = skill.mastery_percentage >= 75;
                const isProgress = skill.mastery_percentage >= 50 && skill.mastery_percentage < 75;
                const statusColor = isMastered ? '#27C57E' : isProgress ? '#E59934' : '#EB5757';
                const statusLabel = isMastered ? 'Mastered' : isProgress ? 'In Progress' : 'Needs Practice';
                const statusBadgeClass = isMastered 
                  ? 'bg-[#27C57E]/10 text-[#27C57E] border-[#27C57E]/20'
                  : isProgress 
                  ? 'bg-[#E59934]/10 text-[#E59934] border-[#E59934]/20'
                  : 'bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/20';

                return (
                  <div 
                    key={skill.skill_id || index}
                    className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1 pr-4">
                      <span 
                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                        style={{ backgroundColor: statusColor }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#F7F8F8] truncate group-hover:text-white">
                          {skill.skill_name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${statusBadgeClass}`}>
                            {statusLabel}
                          </span>
                          <span className="text-[10px] text-[#8A8F98]">
                            {isMastered 
                              ? 'Ready for exam' 
                              : isProgress 
                              ? 'Review recommended' 
                              : 'Primary marks recovery target'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Clean Visual Mastery Progress */}
                    <div className="hidden sm:flex items-center space-x-3 shrink-0">
                      <div className="w-24 bg-white/[0.04] h-1.5 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${skill.mastery_percentage}%`,
                            backgroundColor: statusColor 
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono tabular-nums text-[#F7F8F8] w-10 text-right">
                        {skill.mastery_percentage.toFixed(0)}%
                      </span>
                      <button
                        onClick={() => onNavigate('studio')}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded bg-white/[0.08] hover:bg-white/[0.12] text-[11px] text-white transition-all"
                      >
                        Practice
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 text-[#8A8F98] mx-auto mb-2 opacity-60" />
              <p className="text-xs font-medium text-[#F7F8F8]">Topic Mastery Calibration Pending</p>
              <p className="text-[11px] text-[#8A8F98] mt-1 max-w-sm mx-auto">
                Your Learning Twin needs baseline evaluation data to score your topic mastery. Complete the 10-minute diagnostic check to calibrate.
              </p>
              <button
                onClick={() => onNavigate('intake')}
                className="mt-4 px-4 py-2 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-medium transition-all shadow-[0_2px_8px_rgba(94,106,210,0.3)] inline-flex items-center space-x-1.5"
              >
                <span>Take Diagnostic Check</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Highest-Yield Next Actions */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#E59934]" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#F7F8F8]">
                  {isCourseCalibrated ? 'Recommended Practice' : 'Onboarding Steps'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#27C57E]">
                {isCourseCalibrated ? '+14.0 Marks to Recover' : '2 Steps Remaining'}
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {!isCourseCalibrated ? (
                <>
                  <div 
                    onClick={() => onNavigate('ingestion')}
                    className="p-3 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.16] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#5E6AD2]/10 text-[#5E6AD2] border border-[#5E6AD2]/20">
                        STEP 1 • UPLOAD
                      </span>
                      <span className="text-xs font-mono text-[#8A8F98]">Optional</span>
                    </div>
                    <h4 className="text-xs font-medium text-[#F7F8F8] mt-2 group-hover:text-[#5E6AD2] transition-colors">
                      Course Syllabus & Lecture Slides
                    </h4>
                    <p className="text-[11px] text-[#8A8F98] mt-1 line-clamp-2">
                      Upload past papers and notes to ground AI explanations and slide citations.
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8A8F98] pt-2 border-t border-white/[0.04]">
                      <span>2 mins setup</span>
                      <span className="flex items-center gap-1 text-[#5E6AD2]">Upload Now <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>

                  <div 
                    onClick={() => onNavigate('intake')}
                    className="p-3 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.16] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E59934]/10 text-[#E59934] border border-[#E59934]/20">
                        STEP 2 • CALIBRATE
                      </span>
                      <span className="text-xs font-mono text-[#E59934]">Required</span>
                    </div>
                    <h4 className="text-xs font-medium text-[#F7F8F8] mt-2 group-hover:text-[#5E6AD2] transition-colors">
                      10-Minute Calibrated Diagnostic Quiz
                    </h4>
                    <p className="text-[11px] text-[#8A8F98] mt-1 line-clamp-2">
                      Answer 3 targeted diagnostic questions to calibrate your Bayesian Learning Twin.
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8A8F98] pt-2 border-t border-white/[0.04]">
                      <span>10 mins quiz</span>
                      <span className="flex items-center gap-1 text-[#5E6AD2]">Take Quiz <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div 
                    onClick={() => onNavigate('forensics')}
                    className="p-3 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.16] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/20">
                        TOP PRIORITY • EXAM FIX
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#27C57E]">+8.0 Marks</span>
                    </div>
                    <h4 className="text-xs font-medium text-[#F7F8F8] mt-2 group-hover:text-[#5E6AD2] transition-colors">
                      Bracket Sign Distribution (Question 3)
                    </h4>
                    <p className="text-[11px] text-[#8A8F98] mt-1 line-clamp-2">
                      You lost 5 marks on Question 3 due to a minus sign flip in Step 3. Review the fix in 10 minutes.
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8A8F98] pt-2 border-t border-white/[0.04]">
                      <span>10 mins review</span>
                      <span className="flex items-center gap-1 text-[#5E6AD2]">Inspect Mistake <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>

                  <div 
                    onClick={() => onNavigate('studio')}
                    className="p-3 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.16] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E59934]/10 text-[#E59934] border border-[#E59934]/20">
                        PRACTICE DRILL
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#27C57E]">+4.0 Marks</span>
                    </div>
                    <h4 className="text-xs font-medium text-[#F7F8F8] mt-2 group-hover:text-[#5E6AD2] transition-colors">
                      Trigonometric Radical Forms
                    </h4>
                    <p className="text-[11px] text-[#8A8F98] mt-1 line-clamp-2">
                      Master when to substitute with sine versus tangent using our visual flowchart and spot-the-bug drill.
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8A8F98] pt-2 border-t border-white/[0.04]">
                      <span>15 mins drill</span>
                      <span className="flex items-center gap-1 text-[#5E6AD2]">Open Studio <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Learning Jumper */}
          <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase text-[#8A8F98]">Quick Access</span>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('ingestion')}
                className="p-2.5 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all"
              >
                <p className="font-medium text-[#F7F8F8]">Course Materials</p>
                <p className="text-[10px] text-[#8A8F98]">Syllabus & Slides</p>
              </button>
              <button
                onClick={() => onNavigate('intake')}
                className="p-2.5 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all"
              >
                <p className="font-medium text-[#F7F8F8]">Diagnostic Check</p>
                <p className="text-[10px] text-[#8A8F98]">10-Min Quick Quiz</p>
              </button>
              <button
                onClick={() => onNavigate('forensics')}
                className="p-2.5 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all"
              >
                <p className="font-medium text-[#F7F8F8]">Step Analysis</p>
                <p className="text-[10px] text-[#8A8F98]">See Where You Slipped</p>
              </button>
              <button
                onClick={() => onNavigate('reassessment')}
                className="p-2.5 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all"
              >
                <p className="font-medium text-[#F7F8F8]">Skill Check</p>
                <p className="text-[10px] text-[#8A8F98]">Earn Back Marks</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateCourseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};
