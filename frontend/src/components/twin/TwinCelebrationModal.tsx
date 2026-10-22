import React from 'react';
import {
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ReassessmentResult } from '../../types/schema';

interface TwinCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ReassessmentResult | null;
  onReturnToDashboard?: () => void;
}

export const TwinCelebrationModal: React.FC<TwinCelebrationModalProps> = ({
  isOpen,
  onClose,
  result,
  onReturnToDashboard,
}) => {
  if (!isOpen || !result) return null;

  const prevPct = result.previous_mastery_estimate;
  const newPct = result.new_mastery_estimate;
  const isImproved = result.is_improved;
  const uncRange = result.uncertainty_interval || [0.65, 0.94];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/20 overflow-hidden">
        {/* Glowing background ambient lights */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Trophy / Badge Icon */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 p-0.5 shadow-xl shadow-emerald-500/25">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Award className="w-8 h-8 text-emerald-400 animate-bounce" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bayesian Twin Verified</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isImproved ? 'Concept Remediated & Mastered!' : 'Verification Evaluation Logged'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Your isomorphic drill performance updated the student belief state in the SQLite database.
            </p>
          </div>

          {/* Mastery Progression Comparison Card */}
          <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800/80">
              <span className="text-slate-400 font-semibold">Prior Mastery</span>
              <div className="flex items-center space-x-2 font-mono font-bold">
                <span className="text-slate-400">{prevPct.toFixed(1)}%</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-base">{newPct.toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Marks Secured</span>
                <span className="text-lg font-black text-emerald-400">
                  +{result.marks_recovered_secured.toFixed(1)} M
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">80% Credible Interval</span>
                <span className="text-xs font-mono font-bold text-indigo-300">
                  [{(uncRange[0] * 100).toFixed(0)}%, {(uncRange[1] * 100).toFixed(0)}%]
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">Narrowed Uncertainty</p>
              </div>
            </div>
          </div>

          {/* Celebration Message */}
          <div className="w-full p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 text-left leading-relaxed">
            <p className="font-semibold text-slate-200 mb-0.5 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
              <span>Metacognitive Twin Telemetry:</span>
            </p>
            {result.celebration_message}
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
            >
              Continue Practice
            </button>
            <button
              onClick={() => {
                onClose();
                if (onReturnToDashboard) onReturnToDashboard();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Return to Mission Control</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwinCelebrationModal;
