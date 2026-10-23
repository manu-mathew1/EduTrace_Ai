import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  BrainCircuit, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Activity, 
  Layers, 
  Zap, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { NavTab } from '../components/layout/Shell';
import { LearningTwinResponse, SkillMastery } from '../types/schema';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<'MATH-301' | 'CS-210'>('MATH-301');
  const [readinessScore, setReadinessScore] = useState<number>(68.4);
  const [marksRecovered, setMarksRecovered] = useState<number>(8.0);
  const [examDaysLeft] = useState<number>(5);
  const [twinData, setTwinData] = useState<LearningTwinResponse | null>(null);

  useEffect(() => {
    const courseId = selectedCourse === 'MATH-301' ? 'course_calc_301' : 'course_cs_210';
    const activeStudentId = user?.id || 'std_rahul_99';

    fetch(`/api/twin/profile?course_id=${courseId}&student_id=${activeStudentId}`)
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
      .catch((e) => console.warn('Using baseline twin', e));
  }, [selectedCourse, user?.id]);

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

  return (
    <div className="space-y-6 font-sans">
      {/* Course Context & Switcher Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase text-[#8A8F98]">Track</span>
            <span className="text-xs font-semibold text-[#F7F8F8]">
              {selectedCourse === 'MATH-301' ? 'MATH-301: Multivariable Calculus' : 'CS-210: Data Structures & Algorithms'}
            </span>
          </div>
          <p className="text-xs text-[#8A8F98] mt-0.5">
            Exam target in {examDaysLeft} days • Bayesian posterior updated 3m ago
          </p>
        </div>

        {/* Minimal Linear Course Switcher */}
        <div className="inline-flex p-0.5 rounded-lg bg-[#121316] border border-white/[0.08]">
          <button
            onClick={() => setSelectedCourse('MATH-301')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              selectedCourse === 'MATH-301'
                ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.08]'
                : 'text-[#8A8F98] hover:text-[#F7F8F8]'
            }`}
          >
            MATH-301
          </button>
          <button
            onClick={() => setSelectedCourse('CS-210')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              selectedCourse === 'CS-210'
                ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.08]'
                : 'text-[#8A8F98] hover:text-[#F7F8F8]'
            }`}
          >
            CS-210
          </button>
        </div>
      </div>

      {/* 4-Metric Key Performance Indicator Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
          <span className="text-[11px] font-mono text-[#8A8F98] uppercase">Target Exam Score</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold font-mono tabular-nums text-[#F7F8F8]">75.0%</span>
            <span className="text-[11px] text-[#8A8F98] font-mono">B+ Target</span>
          </div>
          <div className="mt-2 text-[11px] text-[#8A8F98] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#E59934]" />
            <span>Target Exam: Oct 28</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
          <span className="text-[11px] font-mono text-[#8A8F98] uppercase">Bayesian Readiness</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold font-mono tabular-nums text-[#F7F8F8]">{readinessScore.toFixed(1)}%</span>
            <span className="text-[11px] text-[#27C57E] font-mono font-medium">↑ +14.2%</span>
          </div>
          <div className="mt-2.5 w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
            <div 
              className="bg-[#5E6AD2] h-full rounded-full transition-all duration-500" 
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
          <span className="text-[11px] font-mono text-[#8A8F98] uppercase">Marks Recovered</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold font-mono tabular-nums text-[#27C57E]">+{marksRecovered.toFixed(1)}</span>
            <span className="text-[11px] text-[#8A8F98] font-mono">Marks</span>
          </div>
          <div className="mt-2 text-[11px] text-[#8A8F98] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#27C57E]" />
            <span>Locked in SQLite DB</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
          <span className="text-[11px] font-mono text-[#8A8F98] uppercase">Remaining Gap</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold font-mono tabular-nums text-[#E59934]">6.6</span>
            <span className="text-[11px] text-[#8A8F98] font-mono">Marks to Target</span>
          </div>
          <div className="mt-2 text-[11px] text-[#8A8F98]">
            <span>Rank #1 action recovers +8.0</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Twin Skill Matrix & Action Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Linear-Grade Skill Table */}
        <div className="lg:col-span-2 rounded-xl bg-[#121316] border border-white/[0.08] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#5E6AD2]" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#F7F8F8]">
                Bayesian Learning Twin • Skill Mastery Matrix
              </h2>
            </div>
            <span className="text-[11px] text-[#8A8F98] font-mono">
              Beta Credible Intervals [90%]
            </span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {skillsList.map((skill, index) => {
              const isMastered = skill.mastery_percentage >= 75;
              const isProgress = skill.mastery_percentage >= 50 && skill.mastery_percentage < 75;
              const statusColor = isMastered ? '#27C57E' : isProgress ? '#E59934' : '#EB5757';
              const low = skill.confidence_interval ? (skill.confidence_interval[0] * 100).toFixed(0) : '40';
              const high = skill.confidence_interval ? (skill.confidence_interval[1] * 100).toFixed(0) : '70';

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
                      <span className="text-[10px] font-mono text-[#8A8F98]">
                        α={skill.alpha.toFixed(1)} β={skill.beta.toFixed(1)} • Range: [{low}% – {high}%]
                      </span>
                    </div>
                  </div>

                  {/* Visual Confidence Bar */}
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
                    <span className="text-xs font-mono tabular-nums text-[#F7F8F8] w-12 text-right">
                      {skill.mastery_percentage.toFixed(0)}%
                    </span>
                    <button
                      onClick={() => onNavigate('studio')}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded bg-white/[0.08] hover:bg-white/[0.12] text-[11px] text-white transition-all"
                    >
                      Remediate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: High-ROI Marks Recovery Queue */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#E59934]" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#F7F8F8]">
                  High-ROI Actions
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#27C57E]">+14.0 M Available</span>
            </div>

            <div className="mt-3 space-y-2.5">
              <div 
                onClick={() => onNavigate('forensics')}
                className="p-3 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.16] cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/20">
                    PRIORITY #1 • FORENSICS
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#27C57E]">+8.0 Marks</span>
                </div>
                <h4 className="text-xs font-medium text-[#F7F8F8] mt-2 group-hover:text-[#5E6AD2] transition-colors">
                  Bracket Sign Distribution (Step 3)
                </h4>
                <p className="text-[11px] text-[#8A8F98] mt-1 line-clamp-2">
                  Divergence localized in midterm paper. Resolving inner bracket signs secures 8 marks in 20 mins.
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8A8F98] pt-2 border-t border-white/[0.04]">
                  <span>Est. Time: 20 mins</span>
                  <span className="flex items-center gap-1 text-[#5E6AD2]">Inspect Diff <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>

              <div 
                onClick={() => onNavigate('studio')}
                className="p-3 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.16] cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E59934]/10 text-[#E59934] border border-[#E59934]/20">
                    PRIORITY #2 • STUDIO
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#27C57E]">+4.0 Marks</span>
                </div>
                <h4 className="text-xs font-medium text-[#F7F8F8] mt-2 group-hover:text-[#5E6AD2] transition-colors">
                  Trigonometric Radical Form
                </h4>
                <p className="text-[11px] text-[#8A8F98] mt-1 line-clamp-2">
                  Learn triangle substitution pattern via Flowchart and Spot-the-Bug interactive drill.
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#8A8F98] pt-2 border-t border-white/[0.04]">
                  <span>Est. Time: 15 mins</span>
                  <span className="flex items-center gap-1 text-[#5E6AD2]">Open Studio <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Workflow Jumper */}
          <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase text-[#8A8F98]">Pipeline Stages</span>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('ingestion')}
                className="p-2.5 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all"
              >
                <p className="font-medium text-[#F7F8F8]">1. Ingestion</p>
                <p className="text-[10px] text-[#8A8F98]">Syllabus & Slides</p>
              </button>
              <button
                onClick={() => onNavigate('intake')}
                className="p-2.5 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all"
              >
                <p className="font-medium text-[#F7F8F8]">2. Intake Probe</p>
                <p className="text-[10px] text-[#8A8F98]">10-Min Calibrated</p>
              </button>
              <button
                onClick={() => onNavigate('forensics')}
                className="p-2.5 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all"
              >
                <p className="font-medium text-[#F7F8F8]">3. Step-Diff</p>
                <p className="text-[10px] text-[#8A8F98]">Side-by-side VLM</p>
              </button>
              <button
                onClick={() => onNavigate('reassessment')}
                className="p-2.5 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-white/[0.12] text-left transition-all"
              >
                <p className="font-medium text-[#F7F8F8]">7. Verify Drill</p>
                <p className="text-[10px] text-[#8A8F98]">Isomorphic test</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
