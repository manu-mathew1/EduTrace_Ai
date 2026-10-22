import React, { useState } from 'react';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquareCode,
  BookOpen,
  ArrowRight,
  Sparkles,
  Send,
  Eye,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface ForensicsPageProps {
  onNavigateToRecovery: () => void;
}

interface StepItem {
  index: number;
  submitted: string;
  expected: string;
  marksAwarded: number;
  marksPossible: number;
  status: 'satisfied' | 'diverged' | 'carried_forward_error';
  divergenceReason?: string;
  citedSlide?: number;
}

export const ForensicsPage: React.FC<ForensicsPageProps> = ({ onNavigateToRecovery }) => {
  const [selectedStep, setSelectedStep] = useState<number>(3);
  const [confirmedCropValue, setConfirmedCropValue] = useState<string>('-2x cos(x)');
  const [showCropSelector, setShowCropSelector] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: 'Hello Rahul! I localized your marks leak in Question 3 to Step 3. Method selection was sound, but you inverted a minus sign while expanding the inner bracket. Ask me anything about this step!',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  const steps: StepItem[] = [
    {
      index: 1,
      submitted: 'Let u = x², dv = cos(x)dx  ⟹  du = 2x dx, v = sin(x)',
      expected: 'Identify parts u and dv correctly: u = x², dv = cos(x)dx',
      marksAwarded: 2.0,
      marksPossible: 2.0,
      status: 'satisfied',
      citedSlide: 14,
    },
    {
      index: 2,
      submitted: '= x² sin(x) - ∫ 2x sin(x) dx',
      expected: 'Apply integration by parts standard formula: uv - ∫ v du',
      marksAwarded: 2.0,
      marksPossible: 2.0,
      status: 'satisfied',
      citedSlide: 15,
    },
    {
      index: 3,
      submitted: '= x² sin(x) - [ -2x cos(x) - ∫ -2cos(x) dx ]',
      expected: 'Perform 2nd iteration: u = 2x, dv = sin(x)dx ⟹ v = -cos(x). Apply uv - ∫ v du with outer negative.',
      marksAwarded: 0.0,
      marksPossible: 2.0,
      status: 'diverged',
      divergenceReason: 'Sign distribution error on expanding inner bracket. Outer minus was inverted across the -∫ term.',
      citedSlide: 19,
    },
    {
      index: 4,
      submitted: '= x² sin(x) + 2x cos(x) - 2sin(x)',
      expected: 'Final simplified antiderivative with integration constant: x² sin(x) + 2x cos(x) - 2sin(x) + C',
      marksAwarded: 1.0,
      marksPossible: 4.0,
      status: 'carried_forward_error',
      divergenceReason: 'Omitted integration constant (+ C) and final term sign affected by Step 3 algebraic leak.',
      citedSlide: 20,
    },
  ];

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');

    try {
      const response = await fetch('/api/submissions/socratic-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: 'sub_live_01',
          selected_step_index: selectedStep,
          user_question: userMsg,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: data.reply || `In Step ${selectedStep}, check your sign distribution across the inner integral!`,
          },
        ]);
        return;
      }
    } catch {
      // Graceful fallback to rich localized explanation
    }

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `In Step ${selectedStep}, the formula is: uv - ∫ v du. Since v = -cos(x), the integral term becomes - ∫ (-cos(x)) (2 dx) = + 2 ∫ cos(x) dx. When distributing the outer minus sign across [ -2x cos(x) + 2 sin(x) ], the second term must become -2 sin(x). Prof Kapoor warns about this exact bracket trap in Lecture Module 2, Slide 19!`,
        },
      ]);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-slate-900 border border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Stage 3 Forensic Step-Diff
            </span>
            <span className="text-xs font-mono text-slate-400">Submission #sub_math_9042</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            Answer Step Divergence & Error Localization
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Question 3: Evaluate ∫ x² cos(x) dx (10 Marks) • Target Skill: Multi-Iteration Integration by Parts
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right px-4 py-2 rounded-xl bg-slate-950 border border-slate-800">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Score Awarded</p>
            <p className="text-lg font-black text-amber-400">5.0 / 10.0</p>
          </div>
          <button
            onClick={onNavigateToRecovery}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <span>Proceed to Marks Recovery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Cognitive Leak Alert */}
      <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-rose-300">Point of Divergence Localized: Step 3</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">
              Procedural Calculation (Sign Inversion)
            </span>
          </div>
          <p className="text-slate-300 mt-1 leading-relaxed">
            Your conceptual framework and choice of method were entirely correct. Divergence was triggered when distributing the negative sign across nested brackets during the second iteration of integration by parts.
          </p>
        </div>
      </div>

      {/* Main Forensic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Side-by-Side Steps Comparison (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Derivation Verification (4 Steps)
            </h3>
            <span className="text-[11px] text-slate-500">Click any step to inspect with AI Co-Pilot</span>
          </div>

          <div className="space-y-3">
            {steps.map((s) => {
              const isSelected = selectedStep === s.index;
              const isDiverged = s.status === 'diverged';
              const isCarried = s.status === 'carried_forward_error';
              const isSatisfied = s.status === 'satisfied';

              return (
                <div
                  key={s.index}
                  onClick={() => setSelectedStep(s.index)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-400">Step {s.index}</span>
                      {isSatisfied && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Satisfied (+{s.marksAwarded} Marks)
                        </span>
                      )}
                      {isDiverged && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                          <XCircle className="w-3 h-3" /> Diverged (0/{s.marksPossible} Marks)
                        </span>
                      )}
                      {isCarried && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" /> Carried Forward Error (+{s.marksAwarded} Marks)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Slide {s.citedSlide}</span>
                  </div>

                  {/* Submitted Work vs Canonical Rubric */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        Student Written Step:
                      </span>
                      <div className="mt-0.5 p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-slate-200">
                        {s.submitted}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        Canonical Rubric Requirement:
                      </span>
                      <div className="mt-0.5 p-2 rounded bg-slate-950/60 border border-slate-900 font-mono text-slate-400">
                        {s.expected}
                      </div>
                    </div>

                    {s.divergenceReason && (
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                        <strong>Divergence Cause:</strong> {s.divergenceReason}
                      </div>
                    )}
                  </div>

                  {/* Step 3 OCR Handwriting Uncertainty Interactive Badge */}
                  {s.index === 3 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Handwriting Uncertainty (78% Conf)
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {confirmedCropValue}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCropSelector(!showCropSelector);
                          }}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline"
                        >
                          {showCropSelector ? 'Hide alternatives' : 'Confirm handwriting OCR'}
                        </button>
                      </div>

                      {showCropSelector && (
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">Did you write:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmedCropValue('-2x cos(x)');
                            }}
                            className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                              confirmedCropValue === '-2x cos(x)'
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            -2x cos(x)
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmedCropValue('2x cos(x)');
                            }}
                            className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                              confirmedCropValue === '2x cos(x)'
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            2x cos(x)
                          </button>
                          <span className="text-[10px] text-emerald-400 ml-auto flex items-center gap-1">
                            <Check className="w-3 h-3" /> Confirmed
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Socratic Chat Co-Pilot & Course Citation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Lecture Citation Drawer */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center space-x-2 text-indigo-400 mb-2">
              <BookOpen className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Course Citation (RAG Verified)</h4>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
              <p className="font-semibold text-slate-200">Prof Kapoor Lecture Notes — Module 2, Slide 19</p>
              <p className="text-slate-400 italic mt-1 leading-relaxed border-l-2 border-indigo-500 pl-2">
                &ldquo;Pitfall Alert: When repeating integration by parts, always enclose the entire second iteration in brackets before distributing the outer minus sign.&rdquo;
              </p>
            </div>
          </div>

          {/* Socratic Co-Pilot Interactive Chat */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col h-[460px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Socratic Co-Pilot</h4>
                  <p className="text-[10px] text-slate-400">Inspecting Step {selectedStep}</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Active Context
              </span>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-xl leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-slate-950 border border-slate-800 text-slate-300'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask AI why this step diverged..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendChat}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicsPage;
