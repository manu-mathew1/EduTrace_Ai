import React from 'react';
import { 
  Compass, 
  UploadCloud, 
  MessageSquareCode, 
  GitCompare, 
  TrendingUp, 
  Sparkles, 
  BrainCircuit, 
  ShieldCheck 
} from 'lucide-react';

export type NavTab = 'dashboard' | 'ingestion' | 'intake' | 'forensics' | 'recovery' | 'studio' | 'reassessment';

interface ShellProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ currentTab, onSelectTab, children }) => {
  const navItems = [
    { id: 'dashboard', label: 'Mission Control', icon: Compass, pod: 'P1: Core' },
    { id: 'ingestion', label: '1. Ingestion', icon: UploadCloud, pod: 'P2: RAG' },
    { id: 'intake', label: '2. Intake Probe', icon: MessageSquareCode, pod: 'P3: Intake' },
    { id: 'forensics', label: '3. Step-Diff', icon: GitCompare, pod: 'P4: Forensics' },
    { id: 'recovery', label: '5. Recovery Map', icon: TrendingUp, pod: 'P5: Recovery' },
    { id: 'studio', label: '6. Multimodal Studio', icon: Sparkles, pod: 'P5: Studio' },
    { id: 'reassessment', label: '7. Reassessment', icon: ShieldCheck, pod: 'P5: Verify' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Main Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Mission */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                    EduTrace AI
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Team Cognix
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">Metacognitive Forensic & Recovery Platform</p>
              </div>
            </div>

            {/* Workflow Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id as NavTab)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Live Telemetry Capsule */}
            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">Readiness:</span>
                <span className="font-semibold text-emerald-400">58.5%</span>
                <span className="text-slate-700">|</span>
                <span className="text-indigo-400 font-medium">+8.0 Marks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stage Selector */}
        <div className="md:hidden flex overflow-x-auto px-4 py-2 space-x-2 border-t border-slate-800/60 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavTab)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium ${
                currentTab === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};
