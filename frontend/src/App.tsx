import React, { useState } from 'react';
import { Shell, NavTab } from './components/layout/Shell';
import { DashboardPage } from './pages/DashboardPage';
import { UploadCloud, MessageSquareCode, GitCompare, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  return (
    <Shell currentTab={currentTab} onSelectTab={setCurrentTab}>
      {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}

      {/* Stage 1 Ingestion Walking Skeleton (Pod P2) */}
      {currentTab === 'ingestion' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                Pod P2 Domain: Smart Ingestion & Course Knowledge RAG
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Multi-Document Course Upload & Triage</h2>
            </div>
            <span className="text-xs text-slate-400">Task 1.6 & 1.8</span>
          </div>

          <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-12 text-center transition-all bg-slate-900/30">
            <UploadCloud className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-white">Drag and drop your course materials</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Drop Syllabus PDF, Lecture Slides, Past Exam Papers, and Question Rubrics. Auto-classifier will auto-tag them.
            </p>
            <button className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/30">
              Browse Files
            </button>
          </div>
        </div>
      )}

      {/* Stage 2 Intake & Probe Walking Skeleton (Pod P3) */}
      {currentTab === 'intake' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                Pod P3 Domain: Metacognitive Intake & Diagnostic Probe
              </span>
              <h2 className="text-xl font-bold text-white mt-1">3-Turn Goal Consultation & Cold-Start Probe</h2>
            </div>
            <span className="text-xs text-slate-400">Task 1.9 & 1.11</span>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">AI</div>
              <div className="p-3 rounded-xl bg-slate-800/80 text-xs text-slate-200 max-w-xl">
                Hey Rahul! I see your baseline in Calculus is 50%, and your target is 75% for the exam on Oct 28. What topics feel like friction points right now?
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <input 
                type="text" 
                placeholder="Type your response or concerns..." 
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button className="px-4 py-2.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-all">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage 3 Forensic Step-Diff Walking Skeleton (Pod P4) */}
      {currentTab === 'forensics' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                Pod P4 Domain: Forensic Step-Diff & Socratic Co-Pilot
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Answer Step Divergence & Error Localization</h2>
            </div>
            <span className="text-xs text-slate-400">Task 1.12 & 1.13</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Student Submitted Work</h4>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <p>Step 1: let u = x, dv = cos(2x) dx</p>
                <p>Step 2: du = dx, v = (1/2)sin(2x)</p>
                <p className="text-rose-400 bg-rose-500/10 p-1 rounded border border-rose-500/20">
                  Step 3: = (1/2)x sin(2x) + (1/4)cos(2x) + C  [DIVERGED]
                </p>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Rubric / Golden Solution</h4>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <p>Step 1: u = x, dv = cos(2x) dx</p>
                <p>Step 2: du = dx, v = (1/2)sin(2x)</p>
                <p className="text-emerald-400 bg-emerald-500/10 p-1 rounded border border-emerald-500/20">
                  Step 3: = (1/2)x sin(2x) - ∫(1/2)sin(2x)dx = (1/2)x sin(2x) - (1/4)cos(2x) + C
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage 5 Marks Recovery Map Walking Skeleton (Pod P5) */}
      {currentTab === 'recovery' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                Pod P5 Domain: Marks Recovery ROI Prioritizer
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Goal-Aligned Remediation Roadmap</h2>
            </div>
            <span className="text-xs text-slate-400">Task 1.15 & 1.17</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400">
              Formula: <span className="font-mono text-indigo-300">Priority = Exam Weight × Error Burden × Velocity</span>
            </p>
            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-400">#1 Priority</span>
                  <p className="text-sm font-semibold text-white">Integration by Parts: Bracket Sign Distribution</p>
                  <p className="text-xs text-slate-400">15% Exam Weight • 20 mins to fix</p>
                </div>
                <span className="text-sm font-bold text-emerald-400">+8 to +10 Marks</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage 6 Multimodal Studio Walking Skeleton (Pod P5) */}
      {currentTab === 'studio' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                Pod P5 Domain: Multimodal Intervention Studio
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Cognitive Modality Player</h2>
            </div>
            <span className="text-xs text-slate-400">Task 1.15 & 1.17</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex space-x-2 border-b border-slate-800 pb-3 mb-4">
              <span className="px-3 py-1.5 rounded-md bg-indigo-600 text-xs font-medium text-white">1. Flowchart</span>
              <span className="px-3 py-1.5 rounded-md bg-slate-800 text-xs font-medium text-slate-400">2. Spot-The-Bug</span>
              <span className="px-3 py-1.5 rounded-md bg-slate-800 text-xs font-medium text-slate-400">3. Analogy</span>
              <span className="px-3 py-1.5 rounded-md bg-slate-800 text-xs font-medium text-slate-400">4. 60s Audio</span>
            </div>
            <p className="text-xs text-slate-300">
              Interactive visual flowchart mapping Integration by Parts minus-sign distribution across nested parentheses.
            </p>
          </div>
        </div>
      )}
    </Shell>
  );
};

export default App;
