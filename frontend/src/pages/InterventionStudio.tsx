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
} from 'lucide-react';

interface InterventionStudioProps {
  onNavigateToReassessment?: () => void;
}

interface PriorityItem {
  rank: number;
  id: string;
  name: string;
  errorType: string;
  examWeight: number;
  timeMins: number;
  marksRecoverable: number;
  recommendedModality: 'spot_the_bug' | 'flowchart' | 'analogy' | 'audio';
}

export const InterventionStudio: React.FC<InterventionStudioProps> = ({ onNavigateToReassessment }) => {
  const [selectedSkillId, setSelectedSkillId] = useState<string>('skill_parts_sign');
  const [activeTab, setActiveTab] = useState<'flowchart' | 'bug' | 'analogy' | 'audio'>('flowchart');

  // Audio Player State (Proposal #006)
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
      recommendedModality: 'spot_the_bug',
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

  // Live recovery map fetch from backend API
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
                                 p.recommended_modality === 'audio_deconstruction' ? 'audio' : 'spot_the_bug',
          }));
          setPriorities(mapped);
        }
      })
      .catch(() => {
        // Fallback to default calibrated list
      });
  }, []);

  // Audio animation ticker
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
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-slate-900 border border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Stage 5 & 6 Marks Recovery & Studio
            </span>
            <span className="text-xs font-mono text-slate-400">MATH 301 • Midterm Remediation</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Marks Recovery Map & Multimodal Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Bridging your baseline (52%) to target (75%) by prioritizing high-yield cognitive leak repairs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Recoverable</p>
            <p className="text-lg font-black text-emerald-400">+19 Marks</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Study Time</p>
            <p className="text-lg font-black text-indigo-400">75 Mins</p>
          </div>
        </div>
      </div>

      {/* Stage 5: Marks Recovery ROI Prioritizer Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            Remediation Priority Roadmap (Ranked by ROI = Weight × Burden × Velocity)
          </h3>
          <span className="text-[11px] text-slate-500">Select any row to load into Multimodal Studio</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {priorities.map((item) => {
            const isSelected = selectedSkillId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedSkillId(item.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      item.rank === 1
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{item.rank}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {item.errorType}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-slate-400">
                      <span>Exam Weight: <strong className="text-slate-200">{item.examWeight}%</strong></span>
                      <span>•</span>
                      <span>Fix Time: <strong className="text-slate-200">{item.timeMins} mins</strong></span>
                      <span>•</span>
                      <span className="text-indigo-400">Modality: {item.recommendedModality.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-4">
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      +{item.marksRecoverable} Marks
                    </span>
                  </div>
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage 6: Multimodal Intervention Studio */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {/* Studio Tabs */}
        <div className="border-b border-slate-800 p-4 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Multimodal Studio: {priorities.find((p) => p.id === selectedSkillId)?.name}
            </span>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 space-x-1">
            <button
              onClick={() => setActiveTab('flowchart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'flowchart'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Visual Flowchart
            </button>
            <button
              onClick={() => setActiveTab('bug')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'bug'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Spot-The-Bug Drill
            </button>
            <button
              onClick={() => setActiveTab('analogy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analogy'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Real-World Analogy
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'audio'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              4. 60s Audio Deconstruction
            </button>
          </div>
        </div>

        {/* Studio Tab Contents */}
        <div className="p-6">
          {/* TAB 1: VISUAL FLOWCHART */}
          {activeTab === 'flowchart' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Visual Decision Flowchart</h4>
                  <p className="text-xs text-slate-400">Step-by-step logic guardrails for repeated integration by parts.</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 font-mono">
                  Procedural Guardrail
                </span>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col items-center space-y-3 font-mono text-xs">
                  {/* Step A */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-center w-full max-w-md shadow-sm">
                    <strong>Step 1:</strong> Apply ∫ u dv = uv - ∫ v du
                  </div>
                  <div className="w-0.5 h-4 bg-slate-700" />

                  {/* Decision B */}
                  <div className="p-3 rounded-lg bg-indigo-950/50 border border-indigo-500/50 text-indigo-200 text-center w-full max-w-md">
                    ❓ <strong>Decision:</strong> Does the second integral contain another product?
                  </div>
                  <div className="w-0.5 h-4 bg-slate-700" />

                  {/* Branch C (YES) */}
                  <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-200 text-center w-full max-w-md font-bold">
                    ⚠️ STOP: Wrap in Giant Square Brackets!
                    <div className="text-[11px] font-normal text-rose-300 mt-1">
                      - [ u₂ v₂ - ∫ v₂ du₂ ]
                    </div>
                  </div>
                  <div className="w-0.5 h-4 bg-slate-700" />

                  {/* Step D */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-center w-full max-w-md">
                    Evaluate everything inside the inner brackets completely
                  </div>
                  <div className="w-0.5 h-4 bg-slate-700" />

                  {/* Step E */}
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-center w-full max-w-md font-semibold">
                    LAST STEP: Distribute outer negative across inner terms + C
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPOT-THE-BUG DRILL */}
          {activeTab === 'bug' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h4 className="text-sm font-bold text-white">Spot-The-Bug Diagnostic Drill</h4>
                <p className="text-xs text-slate-400">
                  Click on the step where the student made an algebraic or procedural leak:
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <p className="font-semibold text-slate-300 mb-3">
                  Problem: Evaluate ∫ x e^(-x) dx
                </p>

                <div className="space-y-2.5">
                  <div
                    onClick={() => handleBugSelection(1)}
                    className={`cursor-pointer p-3 rounded-lg border font-mono transition-all ${
                      selectedBugStep === 1
                        ? 'bg-slate-800 border-indigo-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <strong>Step 1:</strong> u = x, dv = e^(-x)dx  ⟹  du = dx, v = -e^(-x)
                  </div>

                  <div
                    onClick={() => handleBugSelection(2)}
                    className={`cursor-pointer p-3 rounded-lg border font-mono transition-all ${
                      selectedBugStep === 2
                        ? 'bg-slate-800 border-indigo-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <strong>Step 2:</strong> = -x e^(-x) - ∫ -e^(-x) dx
                  </div>

                  <div
                    onClick={() => handleBugSelection(3)}
                    className={`cursor-pointer p-3 rounded-lg border font-mono transition-all ${
                      selectedBugStep === 3
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <strong>Step 3:</strong> = -x e^(-x) - e^(-x) + C  <span className="text-amber-400 text-[11px] ml-2">[Click here if bug is here]</span>
                  </div>
                </div>

                {bugFeedback && (
                  <div
                    className={`mt-4 p-3 rounded-lg border text-xs font-medium leading-relaxed ${
                      selectedBugStep === 3
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {bugFeedback}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REAL-WORLD ANALOGY */}
          {activeTab === 'analogy' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Brain className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">The Nested Suitcase Rule</h4>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed text-slate-300 space-y-3">
                <p>
                  Imagine packing a smaller toiletry suitcase inside a giant travel suitcase. The outer minus sign in front of the second integration is a security lock on the outer suitcase.
                </p>
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
                  &ldquo;If you unlock the outer suitcase while the items inside the toiletry bag are still loose, things will get mixed up. Always keep the toiletry bag sealed in giant brackets <code>[ ... ]</code> until all calculations inside are 100% finished.&rdquo;
                </div>
                <p>
                  Only when the inner integral is completely evaluated do you distribute the outer negative sign across each individual term. This prevents 90% of sign flips!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: 60S AUDIO DECONSTRUCTION (Proposal #006 Waveform Visualizer) */}
          {activeTab === 'audio' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  60-Second Audio Deconstruction
                </h4>
                <p className="text-xs text-slate-400">
                  Concise verbal breakdown synthesized for quick auditory review.
                </p>
              </div>

              {/* Audio Player Card with Animated Waveform (Proposal #006) */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div>
                      <p className="text-xs font-bold text-white">Repeated Parts: The Bracket Rule</p>
                      <p className="text-[10px] text-slate-400">Duration: 0:{audioProgress < 10 ? `0${audioProgress}` : audioProgress} / 1:00</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAudioMuted(!isAudioMuted)}
                    className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                  >
                    {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Animated Waveform Bars (Feature Proposal #006) */}
                <div className="h-16 flex items-center justify-center gap-1 bg-slate-900/60 rounded-xl px-4 border border-slate-800/80 overflow-hidden">
                  {[24, 40, 18, 52, 35, 60, 44, 28, 50, 64, 30, 48, 58, 22, 38, 55, 32, 45, 62, 26, 42, 54, 36, 48, 30].map(
                    (height, idx) => {
                      const isAnimated = isPlayingAudio;
                      const dynamicHeight = isAnimated
                        ? Math.max(12, Math.min(60, height + Math.sin(audioProgress * 2 + idx) * 20))
                        : height * 0.4;

                      return (
                        <div
                          key={idx}
                          style={{ height: `${dynamicHeight}px` }}
                          className={`w-1.5 rounded-full transition-all duration-200 ${
                            isPlayingAudio
                              ? 'bg-gradient-to-t from-indigo-500 to-violet-400'
                              : 'bg-slate-700'
                          }`}
                        />
                      );
                    }
                  )}
                </div>

                {/* Transcript Readout */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
                  &ldquo;Never try to distribute minus signs in your head. Professor Kapoor calls this the bracket trap. Whenever you apply the formula a second time, immediately drop a giant pair of square brackets around the whole thing: minus, open bracket, u-two v-two minus the integral of v-two du-two, close bracket. Evaluate everything inside first, and only multiply the negative sign on your final line.&rdquo;
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Studio Bottom Action */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Estimated time to lock in mastery: <strong>5 mins</strong></span>
          </div>

          <button
            onClick={onNavigateToReassessment}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <span>Lock in +8 Marks with Reassessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterventionStudio;
