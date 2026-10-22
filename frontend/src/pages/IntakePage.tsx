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
  ChevronRight 
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
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({
    probe_q1: 'Part 1: u = 1+x^2, du = 2xdx => (1/2)ln|1+x^2|. Part 2: arctan(x) + C',
    probe_q2: 'Step 1: u=x^2, dv=e^-x dx => -x^2 e^-x + ∫ 2x e^-x dx\nStep 2: u=2x, dv=e^-x dx => -x^2 e^-x - 2x e^-x - 2e^-x + C',
    probe_q3: '[-1/x] from -1 to 1 = -1 - (1) = -2 (Wait, is x=0 a discontinuity?)',
  });

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

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userText = input;
    const newMsgs: Message[] = [...messages, { role: 'user', content: userText }];
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
          user_message: userText,
          messages_history: messages,
          target_score: 75,
          baseline_score: 50,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.assistant_reply }]);
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
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col h-[520px]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      m.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {m.role === 'user' ? 'You' : 'AI'}
                  </div>
                  <div
                    className={`p-4 rounded-2xl text-xs max-w-lg leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Answer Chips */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/60 mb-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider self-center">Quick Chips:</span>
              <button
                onClick={() => setInput('I often lose minus signs in nested brackets during integration by parts.')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
              >
                Bracket Sign Mistakes
              </button>
              <button
                onClick={() => setInput('I struggle with choosing the right integrating factor for linear ODEs.')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
              >
                Integrating Factor in ODEs
              </button>
            </div>

            {/* Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Explain what topics or steps trouble you..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/25"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Extracted Profile Summary Card */}
          <div className="space-y-5">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span>Extracted Goal Vector</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400">Target Score:</span>
                  <p className="text-base font-bold text-indigo-400 mt-0.5">75% (First Class Goal)</p>
                </div>
                <div>
                  <span className="text-slate-400">Time Horizon:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">6 Days remaining before exam</p>
                </div>
                <div>
                  <span className="text-slate-400">Identified Friction Skills:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                      Integration by Parts
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px]">
                      Negative Sign Distribution
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px]">
                      ODEs Integrating Factor
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Recommended Diagnostic Mode:</span>
                  <p className="font-semibold text-emerald-400 mt-0.5">Mode A: 10-Minute Probe</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('probe')}
                className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center space-x-2"
              >
                <span>Launch Mode A Probe</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Mode A Diagnostic Probe View */
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
              onClick={onNavigateToForensics}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/25"
            >
              <span>Submit Probe & Run Stage 3 Forensics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-5">
            {DEFAULT_QUESTIONS.map((q, idx) => (
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
              onClick={onNavigateToForensics}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-xs font-bold text-white shadow-xl shadow-indigo-600/20 transition-all inline-flex items-center space-x-2"
            >
              <span>Submit All 3 Questions & Localize Step-Divergences (Stage 3)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
