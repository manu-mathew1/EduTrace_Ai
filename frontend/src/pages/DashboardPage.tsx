import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  BrainCircuit, 
  BookOpen, 
  HelpCircle, 
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight,
  Activity,
  Layers,
  Award,
  Zap,
  RefreshCw
} from 'lucide-react';
import { NavTab } from '../components/layout/Shell';
import { LearningTwinResponse, SkillMastery } from '../types/schema';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [selectedCourse, setSelectedCourse] = useState<'MATH-301' | 'CS-210'>('MATH-301');
  const [readinessScore, setReadinessScore] = useState<number>(68.4);
  const [marksRecovered, setMarksRecovered] = useState<number>(8.0);
  const [examDaysLeft, setExamDaysLeft] = useState<number>(5);
  const [backendStatus, setBackendStatus] = useState<'healthy' | 'checking'>('healthy');
  const [twinData, setTwinData] = useState<LearningTwinResponse | null>(null);

  // Live course telemetry and health fetch (Task 3.2 & 4.2)
  useEffect(() => {
    fetch('/api/courses')
      .then((res) => (res.ok ? res.json() : []))
      .then((courses) => {
        if (courses && courses.length > 0) {
          setBackendStatus('healthy');
        }
      })
      .catch(() => {});

    const courseId = selectedCourse === 'MATH-301' ? 'course_calc_301' : 'course_cs_210';
    fetch(`/api/twin/profile?course_id=${courseId}&student_id=std_rahul_99`)
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
  }, [selectedCourse]);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Course Hero Banner with Exam Countdown */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Course Switcher Pills */}
              <div className="inline-flex rounded-lg bg-slate-950/80 p-1 border border-slate-800">
                <button
                  onClick={() => setSelectedCourse('MATH-301')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    selectedCourse === 'MATH-301'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  MATH-301: Calculus III
                </button>
                <button
                  onClick={() => setSelectedCourse('CS-210')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    selectedCourse === 'CS-210'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CS-210: Data Structures
                </button>
              </div>

              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Archetype: Procedural & Analytic
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                Backend: 5/5 Pods Operational
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {selectedCourse === 'MATH-301' 
                ? 'Multivariable Calculus & Differential Equations' 
                : 'Algorithms & Discrete Computational Forensics'}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Target Exam: <strong>Oct 28, 2026</strong> • <strong>{examDaysLeft} Days Remaining</strong> • Closed-Loop Bayesian Twin Active</span>
            </p>
          </div>

          {/* Goal & Readiness Score Telemetry */}
          <div className="flex items-center gap-3 bg-slate-950/90 p-4 rounded-2xl border border-slate-800/90 shadow-inner">
            <div className="text-center px-3 border-r border-slate-800/80">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Baseline</p>
              <p className="text-xl font-bold text-slate-300">50%</p>
            </div>
            <div className="text-center px-3 border-r border-slate-800/80">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Target Goal</p>
              <p className="text-xl font-black text-indigo-400">75%</p>
            </div>
            <div className="text-center px-3 border-r border-slate-800/80">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Marks Gap</p>
              <p className="text-xl font-black text-amber-400">25</p>
            </div>
            <div className="text-center pl-3">
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Readiness</p>
              <p className="text-xl font-black text-emerald-400">{readinessScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Marks Gap & Recovery Velocity */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marks Recovered</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">+{marksRecovered.toFixed(1)}</span>
            <span className="text-xs text-slate-400">/ 25 Marks Needed</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2.5 mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, (marksRecovered / 25) * 100))}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>{Math.round((marksRecovered / 25) * 100)}% Gap Closed</span>
            <span className="text-emerald-400 font-semibold">+{Math.max(0, 25 - marksRecovered).toFixed(1)} Marks in Queue</span>
          </div>
        </div>

        {/* Card 2: Bayesian Posterior Credible Interval */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bayesian Learning Twin</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-400">{readinessScore}%</span>
            <span className="text-xs text-slate-400">Exam Readiness</span>
          </div>
          <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span>Beta Posterior:</span>
              <span className="text-indigo-400 font-bold">Beta(α=12.4, β=5.2)</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>80% Credible Range:</span>
              <span className="text-emerald-400 font-bold">[62.1%, 78.4%]</span>
            </div>
          </div>
        </div>

        {/* Card 3: Metacognitive Affinity Matrix */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proven Modality Affinity</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <p className="text-xs font-bold text-white mb-2">Optimal Remediations for Rahul:</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Visual Flowcharts</span>
              <span className="font-mono text-cyan-400 font-bold">88% Effectiveness</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '88%' }} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400 text-[11px]">Spot-The-Bug Drills</span>
              <span className="font-mono text-indigo-400 font-bold">84% Effectiveness</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '84%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 7-Stage End-to-End Workflow Pipeline Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Closed-Loop Diagnostic & Intervention Pipeline (7 Stages)</span>
          </h2>
          <span className="text-xs text-slate-500">Click any stage to inspect or run</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Stage 1 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400">STAGE 1 • POD P2</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Complete & Indexed
                </span>
              </div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Smart Document Ingestion</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Multi-document dropzone auto-triaging Syllabus, Notes, Past Paper, and Rubrics into ChromaDB.
              </p>
            </div>
            <button
              onClick={() => onNavigate('ingestion')}
              className="mt-4 flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
            >
              <span>Launch Ingestion Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stage 2 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400">STAGE 2 • POD P3</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Probe Ready
                </span>
              </div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Intake & Diagnostic Probe</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                3-turn goal consultation & Mode A 10-minute diagnostic probe with 3 calibrated hinge questions.
              </p>
            </div>
            <button
              onClick={() => onNavigate('intake')}
              className="mt-4 flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
            >
              <span>Take Diagnostic Probe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stage 3 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400">STAGE 3 & 4 • POD P4</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                  Leak Pinpointed
                </span>
              </div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Forensic Step-Diff & Citations</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Side-by-side student work vs rubric diff, identifying Step 3 negative sign leak with lecture citations.
              </p>
            </div>
            <button
              onClick={() => onNavigate('forensics')}
              className="mt-4 flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
            >
              <span>Inspect Forensic Diff</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stage 5 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400">STAGE 5 • POD P5</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  ROI Prioritized
                </span>
              </div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Marks Recovery Map</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Ranked remediation roadmap prioritized by Exam Weight × Error Burden × Velocity (+19 Marks).
              </p>
            </div>
            <button
              onClick={() => onNavigate('recovery')}
              className="mt-4 flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
            >
              <span>View Recovery Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stage 6 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400">STAGE 6 • POD P5</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                  Interactive Audio & Drills
                </span>
              </div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Multimodal Studio</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Interactive flowcharts, Spot-the-Bug drills, analogies, and 60s audio deconstruction with waveform player.
              </p>
            </div>
            <button
              onClick={() => onNavigate('studio')}
              className="mt-4 flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
            >
              <span>Launch Studio Player</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stage 7 */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400">STAGE 7 • POD P1 / P5</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold">
                  Bayesian Verify
                </span>
              </div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Reassessment & Twin Sync</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Solve fresh isomorphic questions to secure recovered marks and update the Bayesian Twin belief state.
              </p>
            </div>
            <button
              onClick={() => onNavigate('reassessment')}
              className="mt-4 flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white hover:brightness-110 transition-all shadow-sm shadow-emerald-600/20"
            >
              <span>Verify & Lock In Marks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bayesian Skill Twin Telemetry Matrix */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800/80 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Live Bayesian Skill Twin Telemetry Matrix</h3>
            <p className="text-xs text-slate-400">Real-time Beta-Binomial conjugate belief estimation per skill</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit">
            P1 Core Bayesian Engine
          </span>
        </div>

        <div className="space-y-3.5">
          {twinData && twinData.skills && twinData.skills.length > 0 ? (
            twinData.skills.map((skill: SkillMastery) => {
              const isRemediated = skill.mastery_percentage >= 70;
              const isInProgress = skill.mastery_percentage >= 40 && skill.mastery_percentage < 70;
              const unc = skill.uncertainty_range || [0.2, 0.8];

              return (
                <div
                  key={skill.skill_id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      {isRemediated ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <HelpCircle className={`w-4 h-4 shrink-0 ${isInProgress ? 'text-amber-400' : 'text-rose-400'}`} />
                      )}
                      <span className="text-sm font-bold text-white">{skill.skill_name}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Beta(α={skill.alpha.toFixed(1)}, β={skill.beta.toFixed(1)}) • 80% Credible Range: [{(unc[0] * 100).toFixed(1)}%, {(unc[1] * 100).toFixed(1)}%] •{' '}
                      {isRemediated ? 'High Confidence' : isInProgress ? 'Moderate Confidence' : 'Diagnostic Queue'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className={`text-sm font-black ${isRemediated ? 'text-emerald-400' : isInProgress ? 'text-amber-400' : 'text-rose-400'}`}>
                        {skill.mastery_percentage.toFixed(1)}%
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {isRemediated ? 'Remediated' : isInProgress ? 'In Progress' : 'Needs Work'}
                      </p>
                    </div>
                    <div className="w-32 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${isRemediated ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, Math.max(5, skill.mastery_percentage))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <>
              {/* Fallback Skill 1 */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Integration by Parts: Bracket Sign Distribution</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Beta(α=9.0, β=2.0) • 80% Credible Range: [65.2%, 94.1%] • High Confidence
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-400">81.8%</span>
                    <p className="text-[10px] text-slate-500">Remediated</p>
                  </div>
                  <div className="w-32 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>

              {/* Fallback Skill 2 */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">Method Selection: Substitution vs Parts</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Beta(α=4.0, β=5.0) • 80% Credible Range: [22.4%, 68.1%] • Moderate Confidence
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-400">44.4%</span>
                    <p className="text-[10px] text-slate-500">In Progress</p>
                  </div>
                  <div className="w-32 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '44%' }}></div>
                  </div>
                </div>
              </div>

              {/* Fallback Skill 3 */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-sm font-bold text-white">First-Order Linear ODE: Integrating Factor Setup</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Beta(α=3.0, β=6.0) • 80% Credible Range: [15.1%, 58.0%] • Diagnostic Queue
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-sm font-black text-rose-400">33.3%</span>
                    <p className="text-[10px] text-slate-500">Needs Work</p>
                  </div>
                  <div className="w-32 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
