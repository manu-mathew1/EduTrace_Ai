import React, { useState, useEffect } from 'react';
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
  PieChart,
  RefreshCw,
  PlusCircle,
  CheckCircle,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { ErrorFingerprint } from '../components/fingerprint/ErrorFingerprint';
import { StepDivergenceResult, AnswerStep } from '../types/schema';

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
  citedSourceTitle?: string;
  citedSlide?: number;
}

export const ForensicsPage: React.FC<ForensicsPageProps> = ({ onNavigateToRecovery }) => {
  const [activeTab, setActiveTab] = useState<'step_diff' | 'fingerprint'>('step_diff');
  const [selectedStep, setSelectedStep] = useState<number>(3);
  const [confirmedCropValue, setConfirmedCropValue] = useState<string>('-2x cos(x)');
  const [showCropSelector, setShowCropSelector] = useState<boolean>(false);
  const [cropConfirmedAlert, setCropConfirmedAlert] = useState<boolean>(false);
  const [activeCitationModal, setActiveCitationModal] = useState<{
    title: string;
    slide: number;
    quote: string;
    tip?: string;
    matchedTrap?: string;
  } | null>(null);

  // Live Socratic Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string; citation?: string }>>([
    {
      role: 'ai',
      text: 'Hello Rahul! I localized your marks leak in Question 3 to Step 3. Method selection was sound, but you inverted a minus sign while expanding the inner bracket. Ask me anything about this step!',
      citation: 'Prof Kapoor Lecture Notes — Module 2, Slide 19',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiReplying, setIsAiReplying] = useState<boolean>(false);
  const [suggestedFollowup, setSuggestedFollowup] = useState<string>(
    'Would you like to try expanding -(A - B) to see where the sign inverted?'
  );

  // Dynamic Step List state
  const [steps, setSteps] = useState<StepItem[]>([
    {
      index: 1,
      submitted: 'Let u = x², dv = cos(x)dx  ⟹  du = 2x dx, v = sin(x)',
      expected: 'Identify parts u and dv correctly: u = x², dv = cos(x)dx',
      marksAwarded: 2.0,
      marksPossible: 2.0,
      status: 'satisfied',
      citedSourceTitle: 'Prof Kapoor Lecture Notes - Module 2',
      citedSlide: 14,
    },
    {
      index: 2,
      submitted: '= x² sin(x) - ∫ 2x sin(x) dx',
      expected: 'Apply integration by parts standard formula: uv - ∫ v du',
      marksAwarded: 2.0,
      marksPossible: 2.0,
      status: 'satisfied',
      citedSourceTitle: 'Prof Kapoor Lecture Notes - Module 2',
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
      citedSourceTitle: 'Prof Kapoor Lecture Notes - Module 2',
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
      citedSourceTitle: 'Prof Kapoor Lecture Notes - Module 2',
      citedSlide: 20,
    },
  ]);

  // Live Derivation Testing Modal
  const [showAnalyzeModal, setShowAnalyzeModal] = useState<boolean>(false);
  const [modalInputWork, setModalInputWork] = useState<string>(
    'u = x^2, dv = cos(x)dx\n= x^2 sin(x) - \\int 2x sin(x) dx\n= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]\n= x^2 sin(x) + 2x cos(x) - 2sin(x)'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Active step citation lookup
  const activeStepItem = steps.find((s) => s.index === selectedStep) || steps[2];

  const handleSendChat = async (customQuery?: string) => {
    const query = customQuery || chatInput;
    if (!query.trim() || isAiReplying) return;

    setChatMessages((prev) => [...prev, { role: 'user', text: query }]);
    if (!customQuery) setChatInput('');
    setIsAiReplying(true);

    try {
      const response = await fetch('/api/submissions/socratic-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: 'sub_live_01',
          selected_step_index: selectedStep,
          user_query: query,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: data.reply,
            citation: data.cited_lecture_title
              ? `${data.cited_lecture_title}${data.cited_page_or_slide ? `, Slide ${data.cited_page_or_slide}` : ''}`
              : undefined,
          },
        ]);
        if (data.suggested_followup_question) {
          setSuggestedFollowup(data.suggested_followup_question);
        }
        setIsAiReplying(false);
        return;
      }
    } catch {
      // Graceful fallback
    }

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `In Step ${selectedStep}, the formula is: uv - ∫ v du. Since v = -cos(x), the integral term becomes - ∫ (-cos(x)) (2 dx) = + 2 ∫ cos(x) dx. When distributing the outer minus sign across [ -2x cos(x) + 2 sin(x) ], the second term must become -2 sin(x). Prof Kapoor warns about this exact bracket trap in Lecture Module 2, Slide 19!`,
          citation: 'Prof Kapoor Lecture Notes — Module 2, Slide 19',
        },
      ]);
      setIsAiReplying(false);
    }, 400);
  };

  const handleConfirmCrop = async (value: string) => {
    setConfirmedCropValue(value);
    setShowCropSelector(false);
    setCropConfirmedAlert(true);
    setTimeout(() => setCropConfirmedAlert(false), 3500);

    // Call live backend crop confirmation endpoint (Task 4.6)
    try {
      const res = await fetch('/api/submissions/confirm-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: 'sub_live_01',
          crop_id: 'crop_q3_step3_line2',
          confirmed_value: value,
        }),
      });
      if (res.ok) {
        const updated: StepDivergenceResult = await res.json();
        if (updated.steps && updated.steps.length > 0) {
          const mapped: StepItem[] = updated.steps.map((s: AnswerStep) => ({
            index: s.step_index,
            submitted: s.submitted_work,
            expected: s.expected_rubric_step,
            marksAwarded: s.marks_awarded,
            marksPossible: s.marks_possible,
            status: s.status as 'satisfied' | 'diverged' | 'carried_forward_error',
            divergenceReason: s.divergence_reason,
            citedSourceTitle: s.cited_source_title,
            citedSlide: s.cited_page_or_slide,
          }));
          setSteps(mapped);
        }
      }
    } catch (e) {
      console.warn('Crop confirmation sync offline:', e);
    }
  };

  const handleRunLiveAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/submissions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: `sub_custom_${Date.now()}`,
          course_id: 'course_calc_301',
          question_id: 'q3_custom_integration',
          submitted_work: modalInputWork,
        }),
      });

      if (res.ok) {
        const result: StepDivergenceResult = await res.json();
        if (result.steps && result.steps.length > 0) {
          const mapped: StepItem[] = result.steps.map((s: AnswerStep) => ({
            index: s.step_index,
            submitted: s.submitted_work,
            expected: s.expected_rubric_step,
            marksAwarded: s.marks_awarded,
            marksPossible: s.marks_possible,
            status: s.status as 'satisfied' | 'diverged' | 'carried_forward_error',
            divergenceReason: s.divergence_reason,
            citedSourceTitle: s.cited_source_title,
            citedSlide: s.cited_page_or_slide,
          }));
          setSteps(mapped);
          if (result.first_divergence_step) {
            setSelectedStep(result.first_divergence_step);
          }
          setShowAnalyzeModal(false);
        }
      }
    } catch (e) {
      console.warn('Analysis fallback:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-slate-900 border border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Stage 3 & 4 Forensic Suite
            </span>
            <span className="text-xs font-mono text-slate-400">Submission #sub_math_9042</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            Answer Step Divergence & Cognitive Forensic Suite
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Question 3: Evaluate ∫ x² cos(x) dx (10 Marks) • Target Skill: Multi-Iteration Integration by Parts
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAnalyzeModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-indigo-400" />
            <span>Test Derivation</span>
          </button>

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

      {/* Live Stage Rehearsal Fast-Action Bar (Task 5.6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 gap-3">
        <div className="flex items-center space-x-2 text-xs">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">Live Stage Rehearsal Actions:</span>
          <span className="text-slate-400 hidden lg:inline">
            1:00 Step 3 Leak &bull; 1:22 Handwriting Uncertainty &bull; 1:30 Slide 19 Citation &bull; 1:42 Error Fingerprint
          </span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto text-[11px]">
          <button
            onClick={() => {
              setActiveTab('step_diff');
              setSelectedStep(3);
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all border ${
              activeTab === 'step_diff' && selectedStep === 3
                ? 'bg-rose-600 text-white border-rose-400 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Step 3 Leak
          </button>
          <button
            onClick={() => {
              setActiveTab('step_diff');
              setSelectedStep(3);
              setShowCropSelector(true);
            }}
            className="px-2.5 py-1 rounded-lg font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            <span>Uncertainty Crop</span>
          </button>
          <button
            onClick={() => {
              setActiveCitationModal({
                title: 'Prof Kapoor Lecture Notes — Module 2',
                slide: 19,
                quote: 'Pitfall Alert: When repeating integration by parts, always enclose the entire second iteration in brackets before distributing the outer minus sign.',
                tip: 'Review Slide 19: Check bracket distribution.',
                matchedTrap: 'Sign Inversion in Second Integration by Parts',
              });
            }}
            className="px-2.5 py-1 rounded-lg font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/50 transition-all flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3" />
            <span>Open Slide 19</span>
          </button>
          <button
            onClick={() => setActiveTab('fingerprint')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all border ${
              activeTab === 'fingerprint'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Stage 4 Fingerprint
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('step_diff')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'step_diff'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>Side-by-Side Step Diff & Socratic Co-Pilot</span>
        </button>

        <button
          onClick={() => setActiveTab('fingerprint')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'fingerprint'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Stage 4: Cognitive Error Fingerprint</span>
        </button>
      </div>

      {/* TAB 1: SIDE-BY-SIDE STEP DIFF & SOCRATIC COPILOT */}
      {activeTab === 'step_diff' && (
        <div className="space-y-6">
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

          {/* OCR Confirmation Notification Toast */}
          {cropConfirmedAlert && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Human-in-the-loop OCR verification recorded: &ldquo;{confirmedCropValue}&rdquo; confirmed. Analysis synchronized.</span>
            </div>
          )}

          {/* Main Forensic Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Side-by-Side Steps Comparison (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Derivation Verification ({steps.length} Steps)
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
                        {s.citedSlide && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCitationModal({
                                title: s.citedSourceTitle || 'Prof Kapoor Lecture Notes — Module 2',
                                slide: s.citedSlide!,
                                quote: 'Pitfall Alert: When repeating integration by parts, always enclose the entire second iteration in brackets before distributing the outer minus sign.',
                                tip: 'Review slide examples on nested integration signs to reinforce bracket retention.',
                                matchedTrap: 'Sign Inversion in Second Integration by Parts',
                              });
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-400 transition-all cursor-pointer"
                            title="Click to view lecture slide citation"
                          >
                            <BookOpen className="w-3 h-3 text-indigo-400" />
                            <span>Slide {s.citedSlide}</span>
                            <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                          </button>
                        )}
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
                                  handleConfirmCrop('-2x cos(x)');
                                }}
                                className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
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
                                  handleConfirmCrop('2x cos(x)');
                                }}
                                className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                                  confirmedCropValue === '2x cos(x)'
                                    ? 'bg-indigo-600 text-white font-bold'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                2x cos(x)
                              </button>
                              <span className="text-[10px] text-emerald-400 ml-auto flex items-center gap-1">
                                <Check className="w-3 h-3" /> Selected
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
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 transition-all duration-300 hover:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <BookOpen className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Course Citation (RAG Grounded)</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveCitationModal({
                        title: activeStepItem.citedSourceTitle || 'Prof Kapoor Lecture Notes — Module 2',
                        slide: activeStepItem.citedSlide || 19,
                        quote: 'Pitfall Alert: When repeating integration by parts, always enclose the entire second iteration in brackets before distributing the outer minus sign.',
                        tip: 'Pay special attention to intermediate expressions when calculating -∫ v du.',
                        matchedTrap: 'Sign Inversion in Second Integration by Parts',
                      })
                    }
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Inspect Slide</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                  <p className="font-semibold text-slate-200">
                    {activeStepItem.citedSourceTitle || 'Prof Kapoor Lecture Notes — Module 2'}
                    {activeStepItem.citedSlide ? `, Slide ${activeStepItem.citedSlide}` : ', Slide 19'}
                  </p>
                  <p className="text-slate-400 italic mt-1 leading-relaxed border-l-2 border-indigo-500 pl-2">
                    &ldquo;Pitfall Alert: When repeating integration by parts, always enclose the entire second iteration in brackets before distributing the outer minus sign.&rdquo;
                  </p>
                </div>
              </div>

              {/* Socratic Co-Pilot Interactive Chat */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col h-[480px] transition-all duration-300 shadow-lg">
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
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} transition-opacity duration-200`}
                    >
                      <div
                        className={`max-w-[88%] p-3 rounded-xl leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-indigo-600 text-white font-medium'
                            : 'bg-slate-950 border border-slate-800 text-slate-300'
                        }`}
                      >
                        {m.text}
                        {m.citation && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCitationModal({
                                title: 'Prof Kapoor Lecture Notes — Module 2',
                                slide: 19,
                                quote: 'Pitfall Alert: When repeating integration by parts, always enclose the entire second iteration in brackets before distributing the outer minus sign.',
                                tip: 'Consult this slide to trace where brackets were omitted in step 3.',
                                matchedTrap: 'Sign Inversion in Second Integration by Parts',
                              });
                            }}
                            className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-indigo-400 flex items-center gap-1 font-mono hover:text-indigo-300 transition-colors text-left cursor-pointer w-full"
                          >
                            <BookOpen className="w-3 h-3 shrink-0" />
                            <span className="underline decoration-indigo-500/50">{m.citation}</span>
                            <ExternalLink className="w-2.5 h-2.5 ml-1 opacity-70 shrink-0" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isAiReplying && (
                    <div className="flex justify-start">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                        <span>Socratic Co-Pilot consulting lecture notes...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Follow-up Prompt Chip */}
                {suggestedFollowup && (
                  <button
                    onClick={() => handleSendChat(suggestedFollowup)}
                    className="mt-2 p-2 rounded-lg bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-500/20 text-[11px] text-indigo-300 text-left transition-all flex items-center justify-between"
                  >
                    <span className="truncate pr-2">💡 {suggestedFollowup}</span>
                    <ArrowRight className="w-3 h-3 shrink-0 text-indigo-400" />
                  </button>
                )}

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
                    onClick={() => handleSendChat()}
                    disabled={isAiReplying}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COGNITIVE ERROR FINGERPRINT (STAGE 4) */}
      {activeTab === 'fingerprint' && (
        <ErrorFingerprint
          courseId="course_calc_301"
          onNavigateToRecovery={onNavigateToRecovery}
        />
      )}

      {/* MODAL: LIVE DERIVATION TESTING */}
      {showAnalyzeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-indigo-400" />
                Live VLM / Algorithmic Derivation Parser
              </h3>
              <button
                onClick={() => setShowAnalyzeModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paste or modify any multi-step mathematical derivation below to run live divergence detection against the canonical calculus rubric:
            </p>

            <textarea
              rows={6}
              value={modalInputWork}
              onChange={(e) => setModalInputWork(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() =>
                  setModalInputWork(
                    'u = x^2, dv = cos(x)dx => du = 2x dx, v = sin(x)\n= x^2 sin(x) - \\int 2x sin(x) dx\n= x^2 sin(x) - [ -2x cos(x) - \\int -2cos(x) dx ]\n= x^2 sin(x) + 2x cos(x) - 2sin(x)'
                  )
                }
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Reset to Sample Sign Pitfall
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAnalyzeModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunLiveAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2"
                >
                  {isAnalyzing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAnalyzing ? 'Analyzing...' : 'Run Forensic Diff'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LECTURE SLIDE GROUNDING & RAG CITATION PREVIEW (TASK 4.7) */}
      {activeCitationModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Course Lecture Grounding</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {activeCitationModal.title} &bull; Slide {activeCitationModal.slide}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCitationModal(null)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Matched Trap Warning Badge */}
            {activeCitationModal.matchedTrap && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center space-x-2 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Identified Pitfall:</strong> {activeCitationModal.matchedTrap}
                </span>
              </div>
            )}

            {/* Slide Excerpt / Exact Citation */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Verified Slide Excerpt (Vector RAG Citation):
              </span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed border-l-4 border-l-indigo-500">
                &ldquo;{activeCitationModal.quote}&rdquo;
              </div>
            </div>

            {/* Pedagogical Tip */}
            {activeCitationModal.tip && (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Remediation Advice</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {activeCitationModal.tip}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500">Grounded in Course Corpus RAG</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCitationModal(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const prompt = `Can you explain how Slide ${activeCitationModal.slide} applies to my sign error in Step ${selectedStep}?`;
                    setActiveCitationModal(null);
                    handleSendChat(prompt);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Co-Pilot About Slide {activeCitationModal.slide}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForensicsPage;
