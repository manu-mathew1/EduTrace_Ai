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
  PieChart,
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
      text: 'Hello! I localized your marks leak in Question 3 to Step 3. Method selection was sound, but you inverted a minus sign while expanding the inner bracket. Ask me anything about this step!',
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
    <div className="space-y-5 font-sans pb-12">
      {/* Top Header Card (Linear Minimal Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-[#121316] border border-white/[0.08] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#EB5757] bg-[#EB5757]/10 px-1.5 py-0.5 rounded border border-[#EB5757]/20">
              Stage 3 • Forensic Step-Diff
            </span>
            <span className="text-xs font-mono text-[#8A8F98]">#sub_math_9042</span>
          </div>
          <h1 className="text-base font-semibold text-[#F7F8F8] mt-1 flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[#5E6AD2]" />
            Question 3: Repeated Integration by Parts
          </h1>
          <p className="text-xs text-[#8A8F98] mt-0.5">
            Target Skill: Multi-Iteration Sign Distribution • 10 Marks
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowAnalyzeModal(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#08090a] hover:bg-white/[0.04] text-[#F7F8F8] text-xs font-medium border border-white/[0.08] transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#5E6AD2]" />
            <span>Test Derivation</span>
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-[#08090a] border border-white/[0.08] text-right">
            <p className="text-[9px] font-mono uppercase text-[#8A8F98]">Marks Awarded</p>
            <p className="text-sm font-mono font-semibold text-[#E59934] tabular-nums">5.0 / 10.0</p>
          </div>

          <button
            onClick={onNavigateToRecovery}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-medium transition-all shadow-[0_2px_8px_rgba(94,106,210,0.3)]"
          >
            <span>Recovery Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center space-x-1 border-b border-white/[0.06] pb-2">
        <button
          onClick={() => setActiveTab('step_diff')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'step_diff'
              ? 'bg-white/[0.08] text-white border border-white/[0.08]'
              : 'text-[#8A8F98] hover:text-[#F7F8F8]'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Step-by-Step Diff & Socratic Copilot</span>
        </button>

        <button
          onClick={() => setActiveTab('fingerprint')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'fingerprint'
              ? 'bg-white/[0.08] text-white border border-white/[0.08]'
              : 'text-[#8A8F98] hover:text-[#F7F8F8]'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Cognitive Error Fingerprint</span>
        </button>
      </div>

      {/* TAB 1: SIDE-BY-SIDE STEP DIFF & SOCRATIC COPILOT */}
      {activeTab === 'step_diff' && (
        <div className="space-y-4">
          {/* Divergence Notification Banner */}
          <div className="p-3.5 rounded-xl bg-[#121316] border-l-2 border-l-[#E59934] border border-white/[0.08] flex items-start space-x-3">
            <AlertTriangle className="w-4 h-4 text-[#E59934] shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-[#F7F8F8]">Divergence Point: Step 3</span>
                <span className="px-1.5 py-0.5 rounded bg-[#E59934]/15 text-[#E59934] font-mono text-[10px]">
                  Procedural Calculation (Sign Inversion)
                </span>
              </div>
              <p className="text-[#8A8F98] mt-1 leading-relaxed text-[11px]">
                Integration method selection was correct. Divergence was triggered when distributing the negative sign across nested inner brackets during the second iteration.
              </p>
            </div>
          </div>

          {cropConfirmedAlert && (
            <div className="p-2.5 rounded-lg bg-[#27C57E]/10 border border-[#27C57E]/20 flex items-center space-x-2 text-xs text-[#27C57E]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>OCR crop verification locked: &ldquo;{confirmedCropValue}&rdquo; confirmed.</span>
            </div>
          )}

          {/* Main Grid: Diff on Left (7 cols), Socratic Chat on Right (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Step Diff Table */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8F98]">
                  Derivation Verification ({steps.length} Steps)
                </span>
                <span className="text-[11px] text-[#8A8F98]">Select a step to inspect</span>
              </div>

              <div className="space-y-2">
                {steps.map((s) => {
                  const isSelected = selectedStep === s.index;
                  const isDiverged = s.status === 'diverged';
                  const isCarried = s.status === 'carried_forward_error';
                  const isSatisfied = s.status === 'satisfied';

                  const borderClass = isDiverged
                    ? 'border-[#E59934]/60 bg-[#E59934]/5'
                    : isCarried
                    ? 'border-[#EB5757]/40 bg-[#EB5757]/5'
                    : isSelected
                    ? 'border-[#5E6AD2]/60 bg-white/[0.02]'
                    : 'border-white/[0.06] bg-[#121316]';

                  return (
                    <div
                      key={s.index}
                      onClick={() => setSelectedStep(s.index)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${borderClass}`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-semibold text-[#8A8F98]">Step {s.index}</span>
                          {isSatisfied && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#27C57E]/10 text-[#27C57E] border border-[#27C57E]/20">
                              <CheckCircle2 className="w-3 h-3" /> Satisfied (+{s.marksAwarded} M)
                            </span>
                          )}
                          {isDiverged && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E59934]/15 text-[#E59934] border border-[#E59934]/30">
                              <XCircle className="w-3 h-3" /> Diverged (0/{s.marksPossible} M)
                            </span>
                          )}
                          {isCarried && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/20">
                              <AlertTriangle className="w-3 h-3" /> Carried Error (+{s.marksAwarded} M)
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
                                tip: 'Review Slide 19: Check bracket distribution.',
                                matchedTrap: 'Sign Inversion in Second Integration by Parts',
                              });
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#5E6AD2]/10 text-[#5E6AD2] border border-[#5E6AD2]/30 hover:bg-[#5E6AD2]/20 transition-all"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Slide {s.citedSlide}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </button>
                        )}
                      </div>

                      {/* Work Grid */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#8A8F98]">
                            Student Written Step:
                          </span>
                          <div className="mt-1 p-2 rounded bg-[#08090a] border border-white/[0.06] font-mono text-xs text-[#F7F8F8]">
                            {s.submitted}
                          </div>
                        </div>

                        {/* OCR Uncertainty Crop trigger for Step 3 */}
                        {isDiverged && (
                          <div className="mt-2 p-2.5 rounded-lg bg-[#08090a] border border-[#E59934]/30 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Eye className="w-3.5 h-3.5 text-[#E59934]" />
                              <span className="text-[11px] text-[#8A8F98]">Handwriting Ambiguity:</span>
                              <span className="font-mono text-[11px] text-[#E59934] font-semibold">{confirmedCropValue}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCropSelector(true);
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E59934]/15 hover:bg-[#E59934]/25 text-[#E59934] border border-[#E59934]/30 transition-all"
                            >
                              Verify Crop
                            </button>
                          </div>
                        )}

                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#8A8F98]">
                            Rubric Model Requirement:
                          </span>
                          <div className="mt-1 p-2 rounded bg-[#08090a] border border-white/[0.06] font-mono text-xs text-[#8A8F98]">
                            {s.expected}
                          </div>
                        </div>

                        {s.divergenceReason && (
                          <div className="text-[11px] text-[#E59934] mt-1 flex items-start gap-1">
                            <span>•</span>
                            <span>{s.divergenceReason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Socratic Copilot Drawer */}
            <div className="lg:col-span-5 rounded-xl bg-[#121316] border border-white/[0.08] flex flex-col h-[650px] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquareCode className="w-4 h-4 text-[#5E6AD2]" />
                  <h3 className="text-xs font-mono uppercase text-[#F7F8F8]">Socratic Copilot</h3>
                </div>
                <span className="text-[10px] font-mono text-[#27C57E] bg-[#27C57E]/10 px-1.5 py-0.5 rounded">
                  Grounded in RAG
                </span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] p-3 rounded-xl ${
                        msg.role === 'user'
                          ? 'bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 text-[#F7F8F8]'
                          : 'bg-[#08090a] border border-white/[0.08] text-[#F7F8F8]'
                      }`}
                    >
                      <p className="leading-relaxed text-xs">{msg.text}</p>
                      {msg.citation && (
                        <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center gap-1.5 text-[10px] font-mono text-[#5E6AD2]">
                          <BookOpen className="w-3 h-3" />
                          <span>{msg.citation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isAiReplying && (
                  <div className="p-2.5 rounded-lg bg-[#08090a] border border-white/[0.06] text-xs text-[#8A8F98] animate-pulse">
                    Synthesizing pedagogical step guidance...
                  </div>
                )}
              </div>

              {/* Suggested Follow-up Prompt */}
              {suggestedFollowup && (
                <div className="px-3.5 py-2 border-t border-white/[0.04] bg-[#08090a]">
                  <button
                    onClick={() => handleSendChat(suggestedFollowup)}
                    className="w-full text-left text-[11px] text-[#5E6AD2] hover:underline flex items-center justify-between"
                  >
                    <span className="truncate">Ask: &ldquo;{suggestedFollowup}&rdquo;</span>
                    <ChevronRight className="w-3 h-3 shrink-0" />
                  </button>
                </div>
              )}

              {/* Chat Input */}
              <div className="p-3 border-t border-white/[0.06] bg-[#08090a] flex items-center space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask why Step 3 failed..."
                  className="flex-1 bg-[#121316] border border-white/[0.08] focus:border-[#5E6AD2] rounded-lg px-3 py-2 text-xs text-[#F7F8F8] outline-none"
                />
                <button
                  onClick={() => handleSendChat()}
                  disabled={!chatInput.trim() || isAiReplying}
                  className="p-2 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white disabled:opacity-40 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COGNITIVE ERROR FINGERPRINT */}
      {activeTab === 'fingerprint' && (
        <ErrorFingerprint
          courseId="course_calc_301"
          onSelectSkill={(skillId) => {
            onNavigateToRecovery();
          }}
        />
      )}

      {/* Crop Uncertainty Selector Modal */}
      {showCropSelector && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-white/[0.1] rounded-xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-xs font-mono uppercase text-[#F7F8F8]">Verify Handwriting Crop</h3>
            <p className="text-xs text-[#8A8F98] mt-1">
              VLM flagged confidence of 0.74 on minus sign. Select the confirmed value:
            </p>
            <div className="mt-4 space-y-2">
              {['-2x cos(x)', '+2x cos(x)', '-(2x) cos(x)'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleConfirmCrop(opt)}
                  className="w-full p-2.5 rounded-lg bg-[#08090a] border border-white/[0.08] hover:border-[#5E6AD2] text-left text-xs font-mono text-[#F7F8F8] transition-all flex items-center justify-between"
                >
                  <span>{opt}</span>
                  {confirmedCropValue === opt && <Check className="w-3.5 h-3.5 text-[#27C57E]" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCropSelector(false)}
              className="mt-4 w-full py-2 rounded-lg bg-white/[0.04] text-xs text-[#8A8F98] hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slide Citation Modal */}
      {activeCitationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-white/[0.1] rounded-xl max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-xs font-mono text-[#5E6AD2]">Slide {activeCitationModal.slide} Citation</span>
              <button onClick={() => setActiveCitationModal(null)} className="text-[#8A8F98] hover:text-white text-xs">Close</button>
            </div>
            <h4 className="text-sm font-medium text-[#F7F8F8] mt-3">{activeCitationModal.title}</h4>
            <div className="mt-3 p-3 rounded-lg bg-[#08090a] border border-white/[0.06] text-xs font-mono text-[#8A8F98] leading-relaxed">
              &ldquo;{activeCitationModal.quote}&rdquo;
            </div>
            {activeCitationModal.tip && (
              <p className="text-xs text-[#27C57E] mt-3">Tip: {activeCitationModal.tip}</p>
            )}
          </div>
        </div>
      )}

      {/* Test Derivation Modal */}
      {showAnalyzeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-white/[0.1] rounded-xl max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-xs font-mono uppercase text-[#F7F8F8]">Test Custom Derivation</h3>
            <textarea
              value={modalInputWork}
              onChange={(e) => setModalInputWork(e.target.value)}
              rows={5}
              className="mt-3 w-full p-3 rounded-lg bg-[#08090a] border border-white/[0.08] font-mono text-xs text-[#F7F8F8] outline-none"
            />
            <div className="mt-4 flex items-center justify-end space-x-2">
              <button onClick={() => setShowAnalyzeModal(false)} className="px-3 py-1.5 rounded-lg text-xs text-[#8A8F98]">Cancel</button>
              <button
                onClick={handleRunLiveAnalysis}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-lg bg-[#5E6AD2] text-xs font-medium text-white"
              >
                {isAnalyzing ? 'Analyzing...' : 'Run Divergence Detector'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
