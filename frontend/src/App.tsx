import React, { useState } from 'react';
import { Shell, NavTab } from './components/layout/Shell';
import { DashboardPage } from './pages/DashboardPage';
import { IngestionPage } from './pages/IngestionPage';
import { IntakePage } from './pages/IntakePage';
import { ForensicsPage } from './pages/ForensicsPage';
import { UploadCloud, MessageSquareCode, GitCompare, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  return (
    <Shell currentTab={currentTab} onSelectTab={setCurrentTab}>
      {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}

      {/* Stage 1 Ingestion Page (Pod P2) */}
      {currentTab === 'ingestion' && <IngestionPage onNavigateToIntake={() => setCurrentTab('intake')} />}

      {/* Stage 2 Intake & Diagnostic Probe Page (Pod P3) */}
      {currentTab === 'intake' && <IntakePage onNavigateToForensics={() => setCurrentTab('forensics')} />}

      {/* Stage 3 Forensic Step-Diff Page (Pod P4) */}
      {currentTab === 'forensics' && <ForensicsPage onNavigateToRecovery={() => setCurrentTab('recovery')} />}

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
