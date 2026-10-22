import React, { useState, useEffect } from 'react';
import { 
  MessageSquareCode, 
  Send, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  HelpCircle, 
  BrainCircuit, 
  FileCheck2, 
  ChevronRight,
  UploadCloud,
  Check,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { NavTab } from '../components/layout/Shell';

interface IntakePageProps {
  onNavigateToForensics: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Question {
  id: string;
  text: string;
  skill: string;
  trap: string;
  time: number;
  marks: number;
}

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'probe_q1',
    text: 'Evaluate the integrals: ∫ (x / (1 + x²)) dx  vs  ∫ (1 / (1 + x²)) dx',
    skill: 'Method Selection: Substitution vs Arctan Form',
    trap: 'Tests whether student impulsively applies u-substitution to both or spots standard form',
    time: 3,
    marks: 5,
  },
  {
    id: 'probe_q2',
    text: 'Evaluate using Integration by Parts: ∫ x² e^(-x) dx',
    skill: 'Bracket Sign Inversion & Multi-Iteration Distribution',
    trap: 'Tests repeated minus sign distribution across brackets in second iteration',
    time: 4,
    marks: 10,
  },
  {
    id: 'probe_q3',
    text: 'Evaluate ∫_{-1}^{1} (1 / x²) dx. Is the standard power rule directly applicable?',
    skill: 'Conceptual Boundary & Discontinuity Check',
    trap: 'Tests if student blindly computes [-1/x] or notices infinite discontinuity at x=0',
    time: 3,
    marks: 5,
  },
];

export const IntakePage: React.FC<IntakePageProps> = ({ onNavigateToForensics }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello Rahul! Welcome to Stage 2: Metacognitive Intake. I analyzed your Calculus III syllabus and target goal of 75%. To calibrate your diagnostic, what topics feel like major friction points right now?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isConsultComplete, setIsConsultComplete] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'consultation' | 'probe'>('consultation');
  const [diagnosticMode, setDiagnosticMode] = useState<'mode_a' | 'mode_b'>('mode_a');
  const [confirmedCropValue, setConfirmedCropValue] = useState<string>('-2x cos(x)');
  const [isCropConfirmed, setIsCropConfirmed] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [targetScore, setTargetScore] = useState<number>(75);
  const [timelineDays, setTimelineDays] = useState<number>(5);
  const [frictionSkills, setFrictionSkills] = useState<string[]>([
    'Integration by Parts: Bracket Sign Distribution',
    'Method Selection: Substitution vs Arctan Form',
  ]);
  const [suggestedChips, setSuggestedChips] = useState<string[]>([
    "I'm aiming for 75+",
    "Have 5 days left",
    "Bracket sign mistakes in parts",
    "Method selection: substitution vs parts",
    "Integrating factor in linear ODEs",
  ]);
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({
    probe_q1: 'Part 1: u = 1+x^2, du = 2xdx => (1/2)ln|1+x^2|. Part 2: arctan(x) + C',
    probe_q2: 'Step 1: u=x^2, dv=cos(x)dx => x^2 sin(x) - ∫ 2x sin(x) dx\nStep 2: = x^2 sin(x) - [ -2x cos(x) - ∫ -2cos(x) dx ]\nStep 3: = x^2 sin(x) + 2x cos(x) - 2sin(x)',
    probe_q3: '[-1/x] from -1 to 1 = -1 - (1) = -2 (Wait, is x=0 a discontinuity?)',
  });

  const handleSubmitProbe = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/intake/submit-probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: 'sub_live_probe_01',
          course_id: 'course_calc_301',
          probe_id: 'probe_calibrated_calc_01',
          question_id: 'probe_q2',
          submitted_work: userAnswers['probe_q2'] || 'u=x^2, dv=cos(x)dx ...',
          all_answers: userAnswers,
        }),
      });
    } catch {
      // offline fallback
    } finally {
      setIsSubmitting(false);
      onNavigateToForensics();
    }
  };

  const handleConfirmCrop = async (val: string) => {
    setConfirmedCropValue(val);
    setIsCropConfirmed(true);
    try {
      await fetch('/api/intake/mode-b/confirm-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_id: 'crop_q3_step3',
          confirmed_value: val,
        }),
      });
    } catch {
      // offline fallback
    }
  };

  const handleSubmitModeB = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/intake/mode-b/autopsy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: 'course_calc_301',
          question_paper_filename: 'Midterm_2024_Calc3.pdf',
          answer_sheet_filename: 'Rahul_AnswerSheet_Scan.pdf',
          confirmed_crops: {
            crop_q3_step3: confirmedCropValue,
          },
        }),
      });
    } catch {
      // offline fallback
    } finally {
      setIsSubmitting(false);
      onNavigateToForensics();
    }
  };

  // Load diagnostic probe questions from backend
  useEffect(() => {
    fetch('/api/intake/probe?course_id=course_calc_301')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.questions && data.questions.length > 0) {
          const qs: Question[] = data.questions.map((q: any) => ({
            id: q.question_id,
            text: q.question_text,
            skill: q.target_skill,
            trap: q.cognitive_trap_tested,
            time: q.estimated_minutes,
            marks: q.maximum_marks,
          }));
          setQuestions(qs);
        }
      })
      .catch(() => {
        // Keeps DEFAULT_QUESTIONS
      });
  }, []);

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || isSending) return;

    const newMsgs: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMsgs);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/intake/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: 'course_calc_301',
          session_id: 'sess_user_demo',
          user_message: textToSend,
          messages_history: messages,
          target_score: targetScore,
          baseline_score: 50,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.assistant_reply }]);
        if (data.session_state) {
          if (data.session_state.extracted_target_score) {
            setTargetScore(data.session_state.extracted_target_score);
          }
          if (data.session_state.extracted_timeline_days) {
            setTimelineDays(data.session_state.extracted_timeline_days);
          }
          if (data.session_state.extracted_friction_topics && data.session_state.extracted_friction_topics.length > 0) {
            setFrictionSkills(data.session_state.extracted_friction_topics);
          }
        }
        if (data.suggested_chips && data.suggested_chips.length > 0) {
          setSuggestedChips(data.suggested_chips);
        }
        if (data.ready_for_diagnostic || data.session_state?.is_consultation_complete) {
          setIsConsultComplete(true);
        }
      } else {
        throw new Error('API offline');
      }
    } catch {
      // Offline fallback
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'That makes total sense. Bracket sign distribution in integration by parts accounts for 15% of all lost marks in past exams. I have generated your Mode A "10-Minute Diagnostic Probe" with 3 calibrated hinge questions to pinpoint your exact leak point. Ready to solve?',
          },
        ]);
        setIsConsultComplete(true);
      }, 500);
    } finally {
      setIsSending(false);
    }
  };

  const handleChipClick = (chip: string) => {
    // Instantaneous local state feedback
    if (chip.includes('75')) setTargetScore(75);
    if (chip.includes('85')) setTargetScore(85);
    if (chip.includes('65')) setTargetScore(65);
    if (chip.includes('5 days')) setTimelineDays(5);
    if (chip.includes('48 hours')) setTimelineDays(2);
    if (chip.includes('2 weeks')) setTimelineDays(14);
    handleSend(chip);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">STAGE 2 • INTAKE</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
              Pod P3 Domain
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Metacognitive Intake & Diagnostic Probe</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            A quick 3-turn goal consultation unlocks your calibrated 10-minute diagnostic probe, testing crucial conceptual hinges without re-taking full exams.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('consultation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'consultation' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Consultation
          </button>
          <button
            onClick={() => setActiveTab('probe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'probe' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Diagnostic Probe (3 Qs)
          </button>
        </div>
      </div>

      {activeTab === 'consultation' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Window */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col h-[560px]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      m.role === 'user' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25' : 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {m.role === 'user' ? 'You' : 'AI'}
                  </div>
                  <div
                    className={`p-4 rounded-2xl text-xs max-w-lg leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-none'
                        : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center space-x-2 text-xs text-indigo-300 italic py-1 animate-pulse pl-11">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>AI Counselor is analyzing your goals & calibrating topics...</span>
                </div>
              )}
            </div>

            {/* Quick-Select Suggestion Chips (Task 4.5) */}
            <div className="pt-3 border-t border-slate-800/80 mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Quick-Select Suggestions:</span>
                </span>
                <span className="text-[10px] text-slate-500">Click to answer instantly</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-thin">
                {suggestedChips.map((chip, cIdx) => {
                  const isGoal = chip.includes('75') || chip.includes('85') || chip.includes('aiming');
                  const isTime = chip.includes('days') || chip.includes('hours') || chip.includes('weeks');
                  return (
                    <button
                      key={cIdx}
                      onClick={() => handleChipClick(chip)}
                      disabled={isSending}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border flex items-center space-x-1 ${
                        isGoal
                          ? 'bg-indigo-950/60 hover:bg-indigo-900/80 border-indigo-500/40 text-indigo-300 hover:text-white shadow-sm'
                          : isTime
                          ? 'bg-emerald-950/50 hover:bg-emerald-900/70 border-emerald-500/30 text-emerald-300 hover:text-white'
                          : 'bg-slate-800/80 hover:bg-slate-700/90 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>{isGoal ? '🎯' : isTime ? '⏳' : '⚡'}</span>
                      <span>{chip}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Explain what topics or steps trouble you, or click a quick chip above..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={isSending || !input.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/25"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Extracted Profile Summary Card */}
          <div className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <BrainCircuit className="w-4 h-4 text-indigo-400" />
                  <span>Extracted Goal Vector</span>
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    isConsultComplete
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {isConsultComplete ? '✅ Calibrated' : '🔄 Triage in Progress'}
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Target Score Goal:</span>
                    <span className="text-base font-black text-indigo-400">{targetScore}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(10, targetScore))}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Baseline: 50% • Marks Gap: +{targetScore - 50} Marks</p>
                </div>

                <div>
                  <span className="text-slate-400">Time Horizon:</span>
                  <p className="font-semibold text-slate-200 mt-0.5 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{timelineDays} Days remaining before exam</span>
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Identified Friction Skills:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {frictionSkills.map((sk, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Recommended Diagnostic Mode:</span>
                  <p className="font-semibold text-emerald-400 mt-0.5">Mode A: 10-Minute Probe</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('probe')}
                className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center space-x-2 ${
                  isConsultComplete
                    ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 shadow-indigo-500/25 ring-2 ring-emerald-500/30 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                }`}
              >
                <span>{isConsultComplete ? 'Launch Mode A Probe (3 Qs)' : 'Preview Mode A Probe'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dual-Mode Diagnostic Entry View (Task 3.5 & 3.6) */
        <div className="space-y-6">
          {/* Dual Mode Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 gap-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Diagnostic Mode:</span>
            </div>
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setDiagnosticMode('mode_a')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  diagnosticMode === 'mode_a'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mode A: 10-Min Probe (Cold-Start)</span>
              </button>
              <button
                onClick={() => setDiagnosticMode('mode_b')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  diagnosticMode === 'mode_b'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Mode B: Exam Paper Autopsy (OCR)</span>
              </button>
            </div>
          </div>

          {diagnosticMode === 'mode_a' ? (
            /* Mode A: 10-Minute Probe Scratchpad */
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-xs font-semibold text-white">Mode A: 10-Minute Cold-Start Diagnostic Probe</p>
                    <p className="text-[11px] text-slate-400">3 calibrated hinge questions • 20 Total Marks</p>
                  </div>
                </div>
                <button
                  onClick={handleSubmitProbe}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/25"
                >
                  <span>{isSubmitting ? 'Evaluating...' : 'Submit Probe & Run Stage 3 Forensics'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-xs font-bold flex items-center justify-center text-white">
                          {idx + 1}
                        </span>
                        <h3 className="font-bold text-sm text-white">{q.skill}</h3>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400">
                        <span>Est: {q.time} mins</span>
                        <span>•</span>
                        <span className="font-semibold text-indigo-400">{q.marks} Marks</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-indigo-200">
                      {q.text}
                    </div>

                    <div className="text-[11px] text-amber-400/90 flex items-center space-x-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Cognitive Trap Tested: {q.trap}</span>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">
                        Your Step-by-Step Scratchpad Solution:
                      </label>
                      <textarea
                        rows={3}
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-4">
                <button
                  onClick={handleSubmitProbe}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-xl shadow-indigo-600/20 transition-all inline-flex items-center space-x-2"
                >
                  <span>{isSubmitting ? 'Evaluating Submission...' : 'Submit All Questions & Localize Step-Divergences (Stage 3)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Mode B: Physical Exam Autopsy (OCR Crops & Verification) */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-300">Mode B: Post-Exam Autopsy & Handwriting OCR</p>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    Upload your physical midterm question paper and graded handwritten answer script.
                    EduTrace executes VLM step extraction with a Human-in-the-Loop verification safeguard for ambiguous handwriting.
                  </p>
                </div>
              </div>

              {/* Upload Dropzones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center space-y-2 py-8">
                  <FileText className="w-8 h-8 text-indigo-400" />
                  <p className="text-xs font-bold text-white">Question Paper</p>
                  <p className="text-[11px] text-slate-400">Midterm_2024_Calc3.pdf (Loaded)</p>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Rubric & Scheme Ready
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center space-y-2 py-8">
                  <UploadCloud className="w-8 h-8 text-emerald-400" />
                  <p className="text-xs font-bold text-white">Handwritten Answer Script</p>
                  <p className="text-[11px] text-slate-400">Rahul_AnswerSheet_Scan.pdf (4 Pages)</p>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    OCR Transcription Completed
                  </span>
                </div>
              </div>

              {/* Human-in-the-Loop Handwriting Crop Verification Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <BrainCircuit className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Human-in-the-Loop Safeguard: 1 Ambiguous Step Crop Detected
                    </h4>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    Confidence: 68% (Amber Review)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                  <p className="text-[11px] text-slate-500 mb-1">Question 3 • Step 3 Mathematical Derivation:</p>
                  <p>= x² sin(x) - [ <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 font-bold">{confirmedCropValue}</span> - ∫ -2cos(x) dx ]</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-2">
                    Select the exact character representation from the student's handwritten scan:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['-2x cos(x)', '+2x cos(x)', '-2x sin(x)'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleConfirmCrop(option)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                          confirmedCropValue === option
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {option} {option === '-2x cos(x)' && '(68% Conf)'}
                      </button>
                    ))}
                  </div>
                </div>

                {isCropConfirmed && (
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 pt-1">
                    <Check className="w-4 h-4" />
                    <span>Transcription confirmed: &ldquo;{confirmedCropValue}&rdquo; locked for Stage 3 Step-Diff.</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleSubmitModeB}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2"
                  >
                    <span>{isSubmitting ? 'Analyzing Autopsy...' : 'Run Stage 3 Forensic Step-Diff on Confirmed Exam Autopsy'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
