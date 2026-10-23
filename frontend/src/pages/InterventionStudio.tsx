import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Layers,
  ArrowRight,
  Brain,
  HelpCircle,
  Clock,
  Award,
  Zap,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { MultimodalStudioContent } from '../types/schema';

interface InterventionStudioProps {
  initialMode?: 'recovery' | 'studio' | 'all';
  onNavigateToReassessment?: () => void;
  onNavigateToRecovery?: () => void;
  onNavigateToStudio?: () => void;
}

interface PriorityItem {
  rank: number;
  id: string;
  name: string;
  errorType: string;
  examWeight: number;
  timeMins: number;
  marksRecoverable: number;
  recommendedModality: 'bug' | 'flowchart' | 'analogy' | 'audio';
}

export const InterventionStudio: React.FC<InterventionStudioProps> = ({
  initialMode = 'all',
  onNavigateToReassessment,
  onNavigateToRecovery,
  onNavigateToStudio,
}) => {
  const [viewMode, setViewMode] = useState<'recovery' | 'studio' | 'all'>(initialMode);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('skill_parts_sign');
  const [activeTab, setActiveTab] = useState<'flowchart' | 'bug' | 'analogy' | 'audio'>('flowchart');

  useEffect(() => {
    if (initialMode) setViewMode(initialMode);
  }, [initialMode]);

  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Spot-the-bug state
  const [selectedBugStep, setSelectedBugStep] = useState<number | null>(null);
  const [bugFeedback, setBugFeedback] = useState<string | null>(null);

  const defaultPriorities: PriorityItem[] = [
    {
      rank: 1,
      id: 'skill_parts_sign',
      name: 'Integration by Parts: Bracket Sign Distribution',
      errorType: 'Procedural Calculation',
      examWeight: 15.0,
      timeMins: 20,
      marksRecoverable: 8.0,
      recommendedModality: 'bug',
    },
    {
      rank: 2,
      id: 'skill_sub_vs_parts',
      name: 'Method Choice: Substitution vs Integration by Parts',
      errorType: 'Method Selection',
      examWeight: 12.0,
      timeMins: 25,
      marksRecoverable: 6.0,
      recommendedModality: 'flowchart',
    },
    {
      rank: 3,
      id: 'skill_ode_factor',
      name: 'First-Order Linear ODE: Integrating Factor Setup',
      errorType: 'Conceptual Misunderstanding',
      examWeight: 10.0,
      timeMins: 30,
      marksRecoverable: 5.0,
      recommendedModality: 'analogy',
    },
  ];

  const [priorities, setPriorities] = useState<PriorityItem[]>(defaultPriorities);
  const [studioContent, setStudioContent] = useState<MultimodalStudioContent | null>(null);

  useEffect(() => {
    fetch('/api/recovery/map?baseline_score=52&target_score=75')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.priorities && data.priorities.length > 0) {
          const mapped: PriorityItem[] = data.priorities.map((p: any) => ({
            rank: p.rank,
            id: p.skill_id,
            name: p.skill_name,
            errorType: p.diagnosed_error.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            examWeight: p.exam_weight_percentage,
            timeMins: p.estimated_time_minutes,
            marksRecoverable: p.potential_marks_recoverable,
            recommendedModality: p.recommended_modality === 'visual_flowchart' ? 'flowchart' :
                                 p.recommended_modality === 'real_world_analogy' ? 'analogy' :
                                 p.recommended_modality === 'audio_deconstruction' ? 'audio' : 'bug',
          }));
          setPriorities(mapped);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/interventions/${selectedSkillId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStudioContent(data);
      })
      .catch(() => {});
  }, [selectedSkillId]);

  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 60) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && !isAudioMuted) {
        window.speechSynthesis.cancel();
        const textToSpeak =
          studioContent?.audio_summary_script ||
          "Hey! Here is your 60-second golden rule. Always enclose repeated iterations in brackets before distributing outer signs.";
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleBugSelection = (stepNum: number) => {
    setSelectedBugStep(stepNum);
    if (stepNum === 3) {
      setBugFeedback(
        '🎯 Spot on! In Step 2, the double negative - ∫ -e^(-x) dx evaluates to + ∫ e^(-x) dx = -e^(-x). Distributing correctly preserves the signs.'
      );
    } else {
      setBugFeedback('❌ That step is mathematically sound. Look closer at how the double negatives distributed!');
    }
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-[#121316] border border-white/[0.08] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#27C57E] bg-[#27C57E]/10 px-1.5 py-0.5 rounded border border-[#27C57E]/20">
              Score Booster • Interactive Studio
            </span>
            <span className="text-xs font-mono text-[#8A8F98]">Calculus III</span>
          </div>
          <h1 className="text-base font-semibold text-[#F7F8F8] mt-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#27C57E]" />
            Score Booster & Study Studio
          </h1>
          <p className="text-xs text-[#8A8F98] mt-0.5">
            Targets the highest-impact topics so you can gain the most marks with the least study time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex p-0.5 rounded-lg bg-[#08090a] border border-white/[0.06] text-xs">
            <button
              onClick={() => { setViewMode('recovery'); onNavigateToRecovery?.(); }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'recovery' ? 'bg-white/[0.08] text-white' : 'text-[#8A8F98] hover:text-white'
              }`}
            >
              Action Plan
            </button>
            <button
              onClick={() => { setViewMode('studio'); onNavigateToStudio?.(); }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'studio' ? 'bg-white/[0.08] text-white' : 'text-[#8A8F98] hover:text-white'
              }`}
            >
              Practice Lessons
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'all' ? 'bg-white/[0.08] text-white' : 'text-[#8A8F98] hover:text-white'
              }`}
            >
              Show All
            </button>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-[#08090a] border border-white/[0.08] text-right">
            <p className="text-[9px] font-mono uppercase text-[#8A8F98]">Marks to Recover</p>
            <p className="text-xs font-mono font-semibold text-[#27C57E] tabular-nums">+19.0 Marks</p>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-[#08090a] border border-white/[0.08] text-right">
            <p className="text-[9px] font-mono uppercase text-[#8A8F98]">Total Study Time</p>
            <p className="text-xs font-mono font-semibold text-[#5E6AD2] tabular-nums">75 Mins</p>
          </div>
        </div>
      </div>

      {/* RECOVERY ROADMAP TABLE */}
      {(viewMode === 'recovery' || viewMode === 'all') && (
        <div className="rounded-xl bg-[#121316] border border-white/[0.08] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#F7F8F8]">
              Topics Ranked by Exam Score Impact
            </span>
            <span className="text-[11px] font-mono text-[#8A8F98]">Click row to open interactive lesson</span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {priorities.map((item) => {
              const isSelected = selectedSkillId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedSkillId(item.id);
                    setActiveTab(item.recommendedModality);
                  }}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#5E6AD2]/10 border-l-2 border-l-[#5E6AD2]' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1 pr-4">
                    <span className="font-mono text-xs font-semibold text-[#8A8F98]">#{item.rank}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#F7F8F8] truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-[#8A8F98]">
                        <span className="text-[#E59934]">{item.errorType}</span>
                        <span>•</span>
                        <span>Exam Weight: {item.examWeight}%</span>
                        <span>•</span>
                        <span>Est. Time: {item.timeMins}m</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-xs font-mono font-semibold text-[#27C57E] tabular-nums">
                      +{item.marksRecoverable} M
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSkillId(item.id);
                        setActiveTab(item.recommendedModality);
                        setViewMode('studio');
                      }}
                      className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-[11px] text-[#F7F8F8] transition-all flex items-center gap-1"
                    >
                      <span>Open Lesson</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MULTIMODAL STUDIO PLAYER */}
      {(viewMode === 'studio' || viewMode === 'all') && (
        <div className="rounded-xl bg-[#121316] border border-white/[0.08] overflow-hidden space-y-4 p-5">
          {/* Studio Navigation & Modality Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#5E6AD2]">Current Topic</span>
              <h3 className="text-sm font-semibold text-[#F7F8F8] mt-0.5">
                {studioContent?.skill_name || 'Integration by Parts: Bracket Sign Distribution'}
              </h3>
            </div>

            <div className="inline-flex p-0.5 rounded-lg bg-[#08090a] border border-white/[0.06] text-xs">
              <button
                onClick={() => setActiveTab('flowchart')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'flowchart' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-[#8A8F98] hover:text-white'
                }`}
              >
                1. Decision Flowchart
              </button>
              <button
                onClick={() => setActiveTab('bug')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'bug' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-[#8A8F98] hover:text-white'
                }`}
              >
                2. Spot-The-Bug
              </button>
              <button
                onClick={() => setActiveTab('analogy')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'analogy' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-[#8A8F98] hover:text-white'
                }`}
              >
                3. Concept Analogy
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'audio' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-[#8A8F98] hover:text-white'
                }`}
              >
                4. 60s Audio Recap
              </button>
            </div>
          </div>

          {/* TAB 1: FLOWCHART */}
          {activeTab === 'flowchart' && (
            <div className="p-4 rounded-xl bg-[#08090a] border border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-[#F7F8F8]">Visual Decision Guide</span>
                  <p className="text-xs text-[#8A8F98] mt-0.5">Follow this sequence during your exam to avoid losing marks on by-parts.</p>
                </div>
                <span className="text-[10px] font-mono text-[#27C57E] bg-[#27C57E]/10 px-2 py-0.5 rounded border border-[#27C57E]/20">
                  Golden Rule
                </span>
              </div>

              {/* Visual Step-by-Step Flow Cards */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#121316] border border-white/[0.06] flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#5E6AD2]/20 text-[#5E6AD2] font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-[#F7F8F8]">Check Problem Type</h4>
                    <p className="text-xs text-[#8A8F98] mt-0.5">
                      Does the integrand contain a product of two distinct functions (e.g. algebraic $x^2$ and trigonometric $\cos x$)? If yes, use Integration by Parts: $\int u \, dv = uv - \int v \, du$.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#121316] border border-white/[0.06] flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#5E6AD2]/20 text-[#5E6AD2] font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-[#F7F8F8]">First Iteration Setup</h4>
                    <p className="text-xs text-[#8A8F98] mt-0.5">
                      Choose $u = x^2$ (differentiates to lower degree) and $dv = \cos(x)\, dx$. This gives:
                      <span className="block mt-1 font-mono text-[11px] text-[#27C57E]">
                        $x^2 \sin(x) - \int 2x \sin(x) \, dx$
                      </span>
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#E59934]/10 border border-[#E59934]/30 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#E59934]/20 text-[#E59934] font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-[#F7F8F8]">Critical Checkpoint: Second Iteration Brackets</h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E59934]/20 text-[#E59934]">High Trap Risk</span>
                    </div>
                    <p className="text-xs text-[#8A8F98] mt-0.5 leading-relaxed">
                      Before evaluating $\int 2x \sin(x) \, dx$, immediately write an outer bracket:
                      <span className="block mt-1 font-mono text-[11px] text-[#E59934]">
                        {'= x² sin(x) - [ (second by-parts result) ]'}
                      </span>
                      Leaving out the brackets causes a minus sign flip that loses full marks!
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#121316] border border-white/[0.06] flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#5E6AD2]/20 text-[#5E6AD2] font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-[#F7F8F8]">Distribute Outer Minus Sign & Finalize</h4>
                    <p className="text-xs text-[#8A8F98] mt-0.5">
                      Multiply the outer negative sign into every inner term:
                      <span className="block mt-1 font-mono text-[11px] text-[#27C57E]">
                        $= x^2 \sin(x) - [ -2x \cos(x) + 2 \sin(x) ] = x^2 \sin(x) + 2x \cos(x) - 2 \sin(x) + C$
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPOT-THE-BUG */}
          {activeTab === 'bug' && (
            <div className="p-4 rounded-xl bg-[#08090a] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#F7F8F8]">Spot-The-Bug Interactive Drill</span>
                <span className="text-[10px] font-mono text-[#E59934]">Click the flawed line</span>
              </div>

              <div className="space-y-2">
                {[
                  { step: 1, text: '∫ x² e^(-x) dx = -x² e^(-x) - ∫ -2x e^(-x) dx' },
                  { step: 2, text: '= -x² e^(-x) + 2 ∫ x e^(-x) dx' },
                  { step: 3, text: '= -x² e^(-x) + 2 [ -x e^(-x) - ∫ e^(-x) dx ]  (Sign Error Here!)' },
                  { step: 4, text: '= -x² e^(-x) - 2x e^(-x) - 2 e^(-x) + C' },
                ].map((s) => (
                  <button
                    key={s.step}
                    onClick={() => handleBugSelection(s.step)}
                    className={`w-full p-3 rounded-lg border text-left text-xs font-mono transition-all flex items-center justify-between ${
                      selectedBugStep === s.step
                        ? s.step === 3
                          ? 'bg-[#27C57E]/10 border-[#27C57E] text-[#F7F8F8]'
                          : 'bg-[#EB5757]/10 border-[#EB5757] text-[#F7F8F8]'
                        : 'bg-[#121316] border-white/[0.06] hover:border-white/[0.12] text-[#8A8F98]'
                    }`}
                  >
                    <span>Step {s.step}: {s.text}</span>
                    {selectedBugStep === s.step && (
                      <span className="text-[10px] font-mono">
                        {s.step === 3 ? 'BUG FOUND ✅' : 'CLEAN ❌'}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {bugFeedback && (
                <div className="p-3 rounded-lg bg-[#121316] border border-white/[0.08] text-xs leading-relaxed text-[#F7F8F8]">
                  {bugFeedback}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ANALOGY */}
          {activeTab === 'analogy' && (
            <div className="p-4 rounded-xl bg-[#08090a] border border-white/[0.06] space-y-3">
              <span className="text-xs font-mono uppercase text-[#F7F8F8]">
                {studioContent?.analogy_title || 'The Russian Nesting Doll & Bank Overdraft Analogy'}
              </span>
              <p className="text-xs text-[#8A8F98] leading-relaxed">
                {studioContent?.analogy_content ||
                  'Think of repeated integration by parts like opening a series of locked boxes. The outer negative sign is a tax on the entire second box. If you open the inner box without checking the tax rate, you inadvertently invert your savings into debt. Always maintain the outer container brackets until every inner calculation is resolved!'}
              </p>
            </div>
          )}

          {/* TAB 4: 60S AUDIO */}
          {activeTab === 'audio' && (
            <div className="p-5 rounded-xl bg-[#08090a] border border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-[#F7F8F8]">60-Second Audio Deconstruction</span>
                  <p className="text-xs text-[#8A8F98] mt-0.5">Rapid audio walkthrough designed for pre-exam review.</p>
                </div>

                <button
                  onClick={togglePlayAudio}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-medium transition-all"
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? 'Pause' : 'Play Deconstruction'}</span>
                </button>
              </div>

              {/* Progress & Animated Waveform */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8A8F98]">
                  <span>0:{audioProgress < 10 ? `0${audioProgress}` : audioProgress}</span>
                  <span>1:00</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#27C57E] h-full transition-all duration-300"
                    style={{ width: `${(audioProgress / 60) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#121316] border border-white/[0.06] text-xs font-mono text-[#8A8F98] leading-relaxed">
                &ldquo;{studioContent?.audio_summary_script ||
                  'Golden Rule: Whenever you perform repeated integration by parts, wrap iteration two inside brackets immediately. The minus sign in front applies to both uv and the integral term!'}
                &rdquo;
              </div>
            </div>
          )}

          {/* Bottom Action: Proceed to Practice Drill */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-[#8A8F98]">Ready to test your understanding?</span>
            <button
              onClick={onNavigateToReassessment}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-[#27C57E] hover:bg-[#20A668] text-[#08090a] text-xs font-semibold transition-all shadow-[0_2px_8px_rgba(39,197,126,0.3)]"
            >
              <span>Take Quick Practice Test (+8 Marks)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
