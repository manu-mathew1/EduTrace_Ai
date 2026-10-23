import React, { useState, useEffect, useRef } from 'react';
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
  FileText, 
  Zap 
} from 'lucide-react';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleFastForwardDemo = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/intake/demo-fast-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: 'course_calc_301',
          session_id: 'sess_demo_01',
          target_score: 75,
          baseline_score: 50,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.session_state.messages);
        setTargetScore(data.session_state.extracted_target_score);
        setTimelineDays(data.session_state.extracted_timeline_days);
        setFrictionSkills(data.session_state.extracted_friction_topics);
        setSuggestedChips(data.suggested_chips);
        setIsConsultComplete(true);
      } else {
        throw new Error('Offline fallback');
      }
    } catch {
      setTargetScore(75);
      setTimelineDays(5);
      setFrictionSkills([
        'Integration by Parts: Bracket Sign Distribution',
        'Method Selection: Substitution vs Arctan Form',
      ]);
      setMessages([
        {
          role: 'assistant',
          content: 'Hello Rahul! Welcome to Stage 2: Metacognitive Intake. I analyzed your Calculus III syllabus and target goal of 75%. To calibrate your diagnostic, what topics feel like major friction points right now?',
        },
        {
          role: 'user',
          content: "I'm aiming for 75+ and have 5 days before the exam. I keep making bracket sign mistakes in integration by parts.",
        },
        {
          role: 'assistant',
          content: 'Target of 75% (+25 marks gap) and 5-day runway locked in! Sign distribution across nested brackets in repeated integration by parts accounts for 15% of lost marks in past exams. I have calibrated your Mode A "10-Minute Diagnostic Probe" with 3 calibrated hinge questions. Ready to solve?',
        },
      ]);
      setSuggestedChips([
        'Launch Mode A 10-Minute Probe',
        'Review Question 2: Repeated By-Parts',
        'Switch to Mode B: Exam Paper Autopsy',
      ]);
      setIsConsultComplete(true);
    } finally {
      setIsSending(false);
    }
  };

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
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-[#121316] border border-white/[0.08] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E6AD2] bg-[#5E6AD2]/10 px-1.5 py-0.5 rounded border border-[#5E6AD2]/20">
              Stage 2 • Intake & Diagnostic Probe
            </span>
            <span className="text-xs font-mono text-[#8A8F98]">Session #sess_calc_301</span>
          </div>
          <h1 className="text-base font-semibold text-[#F7F8F8] mt-1 flex items-center gap-2">
            <MessageSquareCode className="w-4 h-4 text-[#5E6AD2]" />
            Metacognitive Intake & Calibrated Diagnostic
          </h1>
          <p className="text-xs text-[#8A8F98] mt-0.5">
            Extracts target score, exam runway, and serves a 10-minute calibrated hinge probe.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleFastForwardDemo}
            disabled={isSending}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#08090a] hover:bg-white/[0.04] text-[#F7F8F8] text-xs font-medium border border-white/[0.08] transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-[#E59934]" />
            <span>Fast-Forward Demo</span>
          </button>

          <button
            onClick={() => setActiveTab('probe')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-medium transition-all shadow-[0_2px_8px_rgba(94,106,210,0.3)]"
          >
            <span>Open Diagnostic Probe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Segmented Mode Selector */}
      <div className="flex items-center space-x-1 border-b border-white/[0.06] pb-2">
        <button
          onClick={() => setActiveTab('consultation')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'consultation'
              ? 'bg-white/[0.08] text-white border border-white/[0.08]'
              : 'text-[#8A8F98] hover:text-[#F7F8F8]'
          }`}
        >
          <MessageSquareCode className="w-3.5 h-3.5" />
          <span>Metacognitive Consultation</span>
        </button>

        <button
          onClick={() => setActiveTab('probe')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'probe'
              ? 'bg-white/[0.08] text-white border border-white/[0.08]'
              : 'text-[#8A8F98] hover:text-[#F7F8F8]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Calibrated Diagnostic Probe ({questions.length} Hinge Questions)</span>
        </button>
      </div>

      {/* TAB 1: CONSULTATION CHAT */}
      {activeTab === 'consultation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Chat Conversation Thread (2 Cols) */}
          <div className="lg:col-span-2 rounded-xl bg-[#121316] border border-white/[0.08] flex flex-col h-[520px] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#F7F8F8]">3-Turn Intake Consultation</span>
              <span className="text-[10px] font-mono text-[#27C57E]">LLM Agent Active</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 text-[#F7F8F8]'
                        : 'bg-[#08090a] border border-white/[0.08] text-[#F7F8F8]'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            {suggestedChips.length > 0 && (
              <div className="px-4 py-2 border-t border-white/[0.04] bg-[#08090a] flex flex-wrap gap-1.5">
                {suggestedChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (chip.includes('Mode A') || chip.includes('Probe')) {
                        setActiveTab('probe');
                      } else {
                        setMessages((prev) => [...prev, { role: 'user', content: chip }]);
                      }
                    }}
                    className="px-2 py-1 rounded-md text-[11px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[#8A8F98] hover:text-[#F7F8F8] transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-white/[0.06] bg-[#08090a] flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && input.trim()) {
                    setMessages((prev) => [...prev, { role: 'user', content: input }]);
                    setInput('');
                  }
                }}
                placeholder="Reply to intake consultant..."
                className="flex-1 bg-[#121316] border border-white/[0.08] focus:border-[#5E6AD2] rounded-lg px-3 py-2 text-xs text-[#F7F8F8] outline-none"
              />
              <button
                onClick={() => {
                  if (input.trim()) {
                    setMessages((prev) => [...prev, { role: 'user', content: input }]);
                    setInput('');
                  }
                }}
                className="p-2 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Extracted Parameter Lock Card */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08] space-y-3">
              <span className="text-[11px] font-mono uppercase text-[#8A8F98]">Consultation State</span>
              <div className="p-3 rounded-lg bg-[#08090a] border border-white/[0.06] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8A8F98]">Locked Target:</span>
                  <span className="font-mono font-semibold text-[#27C57E]">{targetScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A8F98]">Timeline Runway:</span>
                  <span className="font-mono text-[#F7F8F8]">{timelineDays} Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A8F98]">Status:</span>
                  <span className="font-mono text-[10px] text-[#27C57E]">
                    {isConsultComplete ? 'CALIBRATION LOCKED' : 'CONVERSING'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#8A8F98] block mb-1.5">
                  Friction Topics Isolated:
                </span>
                <div className="space-y-1">
                  {frictionSkills.map((topic, i) => (
                    <div key={i} className="p-2 rounded bg-[#08090a] border border-white/[0.06] text-xs text-[#F7F8F8] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E59934]" />
                      <span className="truncate">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('probe')}
                className="w-full py-2 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Diagnostic Probe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CALIBRATED DIAGNOSTIC PROBE */}
      {activeTab === 'probe' && (
        <div className="space-y-4">
          {/* Dual-Mode Selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#121316] border border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDiagnosticMode('mode_a')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  diagnosticMode === 'mode_a'
                    ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                    : 'text-[#8A8F98] hover:text-[#F7F8F8]'
                }`}
              >
                Mode A: 10-Minute Calibrated Probe
              </button>
              <button
                onClick={() => setDiagnosticMode('mode_b')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  diagnosticMode === 'mode_b'
                    ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                    : 'text-[#8A8F98] hover:text-[#F7F8F8]'
                }`}
              >
                Mode B: Exam Paper Autopsy (Upload)
              </button>
            </div>
            <span className="text-[11px] font-mono text-[#8A8F98]">10 mins • 20 Marks Total</span>
          </div>

          {/* MODE A VIEW */}
          {diagnosticMode === 'mode_a' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-[#121316] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold text-[#5E6AD2]">Question {idx + 1}</span>
                        <span className="text-[10px] font-mono text-[#8A8F98]">({q.marks} Marks • ~{q.time} mins)</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#E59934] bg-[#E59934]/10 px-1.5 py-0.5 rounded">
                        {q.skill}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#08090a] border border-white/[0.06] font-mono text-xs text-[#F7F8F8]">
                      {q.text}
                    </div>

                    <div className="text-[11px] text-[#8A8F98] flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#5E6AD2]" />
                      <span>Cognitive Trap Tested: {q.trap}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#8A8F98] block mb-1">Your Derivation / Scratchpad:</span>
                      <textarea
                        rows={3}
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                        placeholder="Write your step-by-step solution here..."
                        className="w-full p-2.5 rounded-lg bg-[#08090a] border border-white/[0.08] font-mono text-xs text-[#F7F8F8] outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={handleSubmitProbe}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-medium transition-all shadow-[0_2px_8px_rgba(94,106,210,0.3)]"
                >
                  <span>{isSubmitting ? 'Transmitting to Forensics...' : 'Submit to Stage 3 Forensics'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* MODE B VIEW */}
          {diagnosticMode === 'mode_b' && (
            <div className="p-6 rounded-xl bg-[#121316] border border-white/[0.08] space-y-4">
              <h3 className="text-xs font-mono uppercase text-[#F7F8F8]">Mode B: Exam Paper Upload Autopsy</h3>
              <p className="text-xs text-[#8A8F98]">
                Upload your graded paper or midterm exam scan. The forensic VLM pipeline will extract crops and perform step-diff against official rubric criteria.
              </p>

              <div className="p-4 rounded-lg bg-[#08090a] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8A8F98]">Question Paper:</span>
                  <span className="text-[#F7F8F8]">Midterm_2024_Calc3.pdf</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8A8F98]">Handwritten Answer Scan:</span>
                  <span className="text-[#F7F8F8]">Rahul_AnswerSheet_Scan.pdf</span>
                </div>
              </div>

              <button
                onClick={handleSubmitModeB}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-medium transition-all flex items-center justify-center gap-2"
              >
                <span>Run Exam Paper Autopsy & Launch Step-Diff</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
