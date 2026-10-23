import React from 'react';
import {
  Sparkles,
  Award,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
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
  const marks = result.marks_recovered_secured ?? result.marks_recovered ?? 8.0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#121316] border border-white/[0.1] rounded-xl p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#27C57E]/10 border border-[#27C57E]/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-[#27C57E]" />
          </div>

          <div>
            <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#27C57E]/10 text-[#27C57E] text-[10px] font-mono mb-1.5 border border-[#27C57E]/20">
              <Sparkles className="w-3 h-3" />
              <span>Topic Mastery Verified</span>
            </div>
            <h2 className="text-base font-semibold text-[#F7F8F8]">
              {isImproved ? 'Concept Remediated & Mastered' : 'Practice Solution Checked'}
            </h2>
            <p className="text-xs text-[#8A8F98] mt-0.5">
              Great work! Your practice solution was completely verified against the rubric.
            </p>
          </div>

          {/* Mastery Progression Card */}
          <div className="w-full p-3.5 rounded-lg bg-[#08090a] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
              <span className="text-[#8A8F98]">Topic Mastery</span>
              <div className="flex items-center space-x-2 font-mono">
                <span className="text-[#8A8F98]">{prevPct.toFixed(1)}%</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#27C57E]" />
                <span className="text-[#27C57E] font-semibold">{newPct.toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-[#121316] border border-white/[0.06] text-left">
                <span className="text-[10px] font-mono uppercase text-[#8A8F98] block">Marks Secured</span>
                <span className="text-base font-mono font-semibold text-[#27C57E]">
                  +{marks.toFixed(1)} M
                </span>
              </div>

              <div className="p-2.5 rounded bg-[#121316] border border-white/[0.06] text-left">
                <span className="text-[10px] font-mono uppercase text-[#8A8F98] block">Stability</span>
                <span className="text-xs font-mono text-[#5E6AD2]">
                  {Math.round((uncRange[1] - uncRange[0]) * 100) < 30 ? 'High Confidence' : 'Solid Progress'}
                </span>
                <p className="text-[9px] text-[#8A8F98] mt-0.5">Exam Tested</p>
              </div>
            </div>
          </div>

          {/* Telemetry Message */}
          <div className="w-full p-3 rounded-lg bg-[#08090a] border border-white/[0.06] text-xs text-[#8A8F98] text-left leading-relaxed">
            <p className="font-medium text-[#F7F8F8] text-[11px] mb-0.5 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-[#5E6AD2]" />
              <span>Tutor Feedback:</span>
            </p>
            {result.celebration_message}
          </div>

          {/* Action Buttons */}
          <div className="w-full flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-[#F7F8F8] transition-all"
            >
              Continue Practice
            </button>
            <button
              onClick={() => {
                onClose();
                if (onReturnToDashboard) onReturnToDashboard();
              }}
              className="flex-1 py-2 px-3 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwinCelebrationModal;
