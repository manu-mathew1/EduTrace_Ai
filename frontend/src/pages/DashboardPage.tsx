import React from 'react';
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
  FileText 
} from 'lucide-react';
import { NavTab } from '../components/layout/Shell';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Course Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Course: MATH-301
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Archetype: Procedural (Math / CS)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Multivariable Calculus & Differential Equations
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Target Exam Date: 2026-10-28 (6 Days Remaining) • Closed-Loop Academic Diagnostic Active
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
            <div className="text-center px-3 border-r border-slate-800">
              <p className="text-xs text-slate-400">Baseline</p>
              <p className="text-xl font-bold text-slate-200">50%</p>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <p className="text-xs text-slate-400">Target Goal</p>
              <p className="text-xl font-bold text-indigo-400">75%</p>
            </div>
            <div className="text-center px-3">
              <p className="text-xs text-slate-400">Gap</p>
              <p className="text-xl font-bold text-amber-400">25 Marks</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Marks Gap & Recovery Progress */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Marks Recovered</span>
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">+8.0</span>
            <span className="text-sm text-slate-400">/ 25 Marks Needed</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-indigo-500 h-2 rounded-full" style={{ width: '32%' }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">32% of required marks gap bridged through targeted remediation.</p>
        </div>

        {/* Card 2: Bayesian Readiness Score */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Bayesian Learning Twin</span>
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400">58.5%</span>
            <span className="text-sm text-slate-400">Exam Readiness</span>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Beta-Binomial posterior confidence interval narrowed to <strong className="text-slate-200">[0.51, 0.66]</strong>.
          </p>
          <p className="text-xs text-indigo-400 mt-1">High confidence in 2 of 3 diagnosed core skills.</p>
        </div>

        {/* Card 3: Metacognitive Affinity */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Proven Modality</span>
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-sm font-semibold text-white">Visual Flowcharts + Spot-The-Bug</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded bg-slate-800 text-[11px] text-cyan-300 font-medium">Flowchart: 88%</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-[11px] text-indigo-300 font-medium">Bug Drills: 84%</span>
            <span className="px-2 py-1 rounded bg-slate-800 text-[11px] text-amber-300 font-medium">Analogies: 79%</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Discovered dynamically via A/B cognitive probes.</p>
        </div>
      </div>

      {/* 7-Stage Diagnostic & Intervention Workflow Cards */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <span>7-Stage Diagnostic Workflow (Vertical Pod Slices)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Stage 1 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-400">STAGE 1 • POD P2</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Mock Ready</span>
              </div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Smart Document Ingestion</h3>
              <p className="text-xs text-slate-400 mt-2">
                Multi-document drag-and-drop auto-triaging Syllabus, Past Papers, Notes, and Rubrics.
              </p>
            </div>
            <button
              onClick={() => onNavigate('ingestion')}
              className="mt-4 flex items-center justify-between w-full px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600 text-xs font-medium text-slate-200 hover:text-white transition-all"
            >
              <span>Open Ingestion Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stage 2 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-400">STAGE 2 • POD P3</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Mock Ready</span>
              </div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Intake & Diagnostic Probe</h3>
              <p className="text-xs text-slate-400 mt-2">
                3-turn goal consultation & Mode A 10-minute diagnostic probe with calibrated hinge questions.
              </p>
            </div>
            <button
              onClick={() => onNavigate('intake')}
              className="mt-4 flex items-center justify-between w-full px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600 text-xs font-medium text-slate-200 hover:text-white transition-all"
            >
              <span>Take Diagnostic Probe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stage 3 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-400">STAGE 3 & 4 • POD P4</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Mock Ready</span>
              </div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Forensic Step-Diff & Citations</h3>
              <p className="text-xs text-slate-400 mt-2">
                Side-by-side student answer vs rubric diff, pinpointing first divergence with course slide citations.
              </p>
            </div>
            <button
              onClick={() => onNavigate('forensics')}
              className="mt-4 flex items-center justify-between w-full px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600 text-xs font-medium text-slate-200 hover:text-white transition-all"
            >
              <span>Inspect Step-Diff</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stage 5 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-400">STAGE 5 • POD P5</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Mock Ready</span>
              </div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Marks Recovery Map</h3>
              <p className="text-xs text-slate-400 mt-2">
                Ranked ROI roadmap prioritized by Exam Weight × Error Burden × Velocity to bridge the 25-mark gap.
              </p>
            </div>
            <button
              onClick={() => onNavigate('recovery')}
              className="mt-4 flex items-center justify-between w-full px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600 text-xs font-medium text-slate-200 hover:text-white transition-all"
            >
              <span>View Recovery Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stage 6 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-400">STAGE 6 • POD P5</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Mock Ready</span>
              </div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Multimodal Studio</h3>
              <p className="text-xs text-slate-400 mt-2">
                Interactive real-world analogies, SVG flowcharts, 60s audio deconstruction, and spot-the-bug drills.
              </p>
            </div>
            <button
              onClick={() => onNavigate('studio')}
              className="mt-4 flex items-center justify-between w-full px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600 text-xs font-medium text-slate-200 hover:text-white transition-all"
            >
              <span>Launch Studio Player</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bayesian Skill Mastery Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Live Bayesian Skill Twin Telemetry</h3>
            <p className="text-xs text-slate-400">Estimated using conjugate Beta(α, β) belief updating</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            P1 Core Engine
          </span>
        </div>

        <div className="space-y-4">
          {/* Skill 1 */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Integration by Parts: Bracket Sign Distribution</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Beta(α=9.0, β=2.0) • 80% Credible Interval: [0.65, 0.94]</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-400">81.8%</span>
                <p className="text-[10px] text-slate-500">Mastery</p>
              </div>
              <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
          </div>

          {/* Skill 2 */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">Method Selection: Substitution vs Parts</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Beta(α=4.0, β=5.0) • 80% Credible Interval: [0.22, 0.68]</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-sm font-bold text-amber-400">44.4%</span>
                <p className="text-[10px] text-slate-500">Mastery</p>
              </div>
              <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '44%' }}></div>
              </div>
            </div>
          </div>

          {/* Skill 3 */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-semibold text-white">First-Order Linear ODE: Integrating Factor Setup</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Beta(α=3.0, β=6.0) • 80% Credible Interval: [0.15, 0.58]</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-sm font-bold text-rose-400">33.3%</span>
                <p className="text-[10px] text-slate-500">Mastery</p>
              </div>
              <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '33%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
