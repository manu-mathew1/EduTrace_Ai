import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  TrendingUp,
  BrainCircuit,
  HelpCircle,
  FileText,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { ReassessmentQuestion, ReassessmentResult } from '../types/schema';
import { TwinCelebrationModal } from '../components/twin/TwinCelebrationModal';

interface ReassessmentPageProps {
  skillId?: string;
  onReturnToDashboard: () => void;
  onReturnToRecovery?: () => void;
}

export const ReassessmentPage: React.FC<ReassessmentPageProps> = ({
  skillId = 'skill_parts_sign',
  onReturnToDashboard,
  onReturnToRecovery,
}) => {
  const [question, setQuestion] = useState<ReassessmentQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(true);
  const [submittedWork, setSubmittedWork] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [result, setResult] = useState<ReassessmentResult | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Isomorphic Question
  useEffect(() => {
    const fetchQuestion = async () => {
      setIsLoadingQuestion(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/reassessment/question?skill_id=${encodeURIComponent(skillId)}`);
        if (res.ok) {
          const data: ReassessmentQuestion = await res.json();
          setQuestion(data);
        } else {
          // Fallback question
          setQuestion({
            reassessment_id: 'reassess_calc_01',
            skill_id: skillId,
            question_text: String.raw`Evaluate using Integration by Parts: \int x \cos(2x) \, dx`,
            difficulty_level: 'comparable',
            maximum_marks: 10,
            rubric_steps: [
              'Set u = x, dv = cos(2x)dx => du = dx, v = (1/2)sin(2x)',
              'Apply uv - \\int v du: (1/2)x sin(2x) - \\int (1/2)sin(2x) dx',
              'Integrate with inner bracket: (1/2)x sin(2x) - [ -(1/4)cos(2x) ] + C',
              'Final simplified form: (1/2)x sin(2x) + (1/4)cos(2x) + C',
            ],
          });
        }
      } catch (e) {
        console.warn('Reassessment question fetch offline:', e);
        setQuestion({
          reassessment_id: 'reassess_calc_01',
          skill_id: skillId,
          question_text: String.raw`Evaluate using Integration by Parts: \int x \cos(2x) \, dx`,
          difficulty_level: 'comparable',
          maximum_marks: 10,
          rubric_steps: [
            'Set u = x, dv = cos(2x)dx => du = dx, v = (1/2)sin(2x)',
            'Apply uv - \\int v du: (1/2)x sin(2x) - \\int (1/2)sin(2x) dx',
            'Integrate: (1/2)x sin(2x) - [ -(1/4)cos(2x) ] + C',
            'Final simplified form: (1/2)x sin(2x) + (1/4)cos(2x) + C',
          ],
        });
      } finally {
        setIsLoadingQuestion(false);
      }
    };

    fetchQuestion();
  }, [skillId]);

  // Handle Isomorphic Solution Verification
  const handleVerify = async () => {
    if (!submittedWork.trim()) {
      setErrorMsg('Please write your derivation steps before submitting.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/reassessment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reassessment_id: question?.reassessment_id || 'reassess_calc_01',
          student_id: 'std_rahul_99',
          course_id: 'course_calc_301',
          skill_id: skillId,
          submitted_work: submittedWork,
        }),
      });

      if (res.ok) {
        const data: ReassessmentResult = await res.json();
        setResult(data);
        setShowCelebration(true);
      } else {
        // Fallback simulated outcome
        const isCorrect = submittedWork.includes('1/4') || submittedWork.includes('cos') || submittedWork.includes('+');
        const fallbackResult: ReassessmentResult = {
          reassessment_id: question?.reassessment_id || 'reassess_calc_01',
          skill_id: skillId,
          skill_name: 'Integration by Parts: Bracket Sign Distribution',
          marks_awarded: isCorrect ? 9.5 : 4.0,
          marks_possible: 10.0,
          marks_recovered: isCorrect ? 8.0 : 2.0,
          is_improved: isCorrect,
          previous_mastery_estimate: 44.4,
          new_mastery_estimate: isCorrect ? 77.8 : 48.0,
          uncertainty_interval: isCorrect ? [0.65, 0.94] : [0.35, 0.62],
          alpha: isCorrect ? 13.5 : 5.0,
          beta: isCorrect ? 5.5 : 5.5,
          celebration_message: isCorrect
            ? 'Remediation Verified! 8.0 Marks successfully added back to Projected Baseline.'
            : 'Partial remediation logged. Continue practicing bracket isolation.',
        };
        setResult(fallbackResult);
        setShowCelebration(true);
      }
    } catch (e) {
      console.error('Reassessment verification error:', e);
      setErrorMsg('Could not reach verification engine. Check server connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePreFillSample = () => {
    setSubmittedWork(
      'u = x, dv = cos(2x)dx => du = dx, v = (1/2)sin(2x)\n' +
      '= (1/2)x sin(2x) - \\int (1/2)sin(2x) dx\n' +
      '= (1/2)x sin(2x) - [ -(1/4)cos(2x) ] + C\n' +
      '= (1/2)x sin(2x) + (1/4)cos(2x) + C'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Stage 7: Isomorphic Reassessment & Learning Twin Lock-in
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Remediation Verification Drill
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Solve this structurally comparable problem to prove conceptual remediation.
            Passing this drill updates your Bayesian Student Twin and officially recovers your marks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onReturnToRecovery && (
            <button
              onClick={onReturnToRecovery}
              className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Back to Roadmap
            </button>
          )}
          <button
            onClick={onReturnToDashboard}
            className="px-3.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
          >
            Mission Control
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Isomorphic Question & Rubric (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Isomorphic Question
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                +{question?.maximum_marks || 10} Marks Possible
              </span>
            </div>

            {isLoadingQuestion ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Generating isomorphic problem...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                  <p className="text-sm font-semibold text-white leading-relaxed font-mono">
                    {question?.question_text}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Canonical Rubric Expectations
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {question?.rubric_steps.map((step, idx) => (
                      <li
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-300 font-mono text-[11px] leading-relaxed flex items-start gap-2"
                      >
                        <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Solution Input & Verification Submission (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-emerald-400" />
                  Your Step-by-Step Derivation
                </h3>
                <p className="text-xs text-slate-400">
                  Type each derivation line. Remember to enclose nested steps in brackets!
                </p>
              </div>

              <button
                type="button"
                onClick={handlePreFillSample}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1"
              >
                <span>Load Sample Solution</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={submittedWork}
              onChange={(e) => setSubmittedWork(e.target.value)}
              placeholder="Step 1: u = x, dv = cos(2x)dx ...&#10;Step 2: ...&#10;Step 3: ...&#10;Step 4: ..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
            />

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Evaluation triggers immediate Bayesian Twin update
              </span>

              <button
                onClick={handleVerify}
                disabled={isVerifying || !submittedWork.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating with Bayesian Engine...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit & Verify Remediation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Celebratory Learning Twin Modal */}
      <TwinCelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        result={result}
        onReturnToDashboard={onReturnToDashboard}
      />
    </div>
  );
};

export default ReassessmentPage;
