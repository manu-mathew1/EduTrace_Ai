import React, { useState, useEffect } from 'react';
import {
  PieChart,
  AlertTriangle,
  TrendingDown,
  Layers,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
} from 'lucide-react';
import { ErrorFingerprintResponse, ErrorTaxonomy } from '../../types/schema';

interface ErrorFingerprintProps {
  courseId?: string;
  onNavigateToRecovery?: () => void;
  onSelectSkill?: (skillId: string) => void;
}

export const ErrorFingerprint: React.FC<ErrorFingerprintProps> = ({
  courseId = 'course_calc_301',
  onNavigateToRecovery,
  onSelectSkill,
}) => {
  const [data, setData] = useState<ErrorFingerprintResponse | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFingerprint = async () => {
      try {
        const res = await fetch(`/api/fingerprint?course_id=${encodeURIComponent(courseId)}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setData(json);
            setSelectedType(json.primary_cognitive_leak || 'procedural_calculation');
          }
          return;
        }
      } catch (e) {
        console.warn('Using fallback baseline for fingerprint', e);
      }

      if (isMounted) {
        setData({
          course_id: courseId,
          total_errors_analyzed: 15,
          total_marks_lost: 36.0,
          primary_cognitive_leak: 'procedural_calculation' as ErrorTaxonomy,
          breakdown: [
            {
              error_type: 'procedural_calculation' as ErrorTaxonomy,
              count: 8,
              percentage: 53.3,
              marks_lost_total: 18.0,
              example_question_ids: ['q3_integration_by_parts', 'q7_line_integrals'],
            },
            {
              error_type: 'method_selection' as ErrorTaxonomy,
              count: 4,
              percentage: 26.7,
              marks_lost_total: 12.0,
              example_question_ids: ['q1_substitution_vs_arctan', 'q5_taylor_series'],
            },
            {
              error_type: 'rubric_omission' as ErrorTaxonomy,
              count: 3,
              percentage: 20.0,
              marks_lost_total: 6.0,
              example_question_ids: ['q3_final_line', 'q9_convergence_interval'],
            },
          ],
        });
        setSelectedType('procedural_calculation');
      }
    };

    fetchFingerprint();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const getTaxonomyConfig = (type: string) => {
    switch (type) {
      case 'procedural_calculation':
        return {
          label: 'Procedural Calculation',
          subtitle: 'Sign distribution, algebraic manipulation, bracket inversions',
          color: '#E59934',
          remedyModality: 'Spot-the-Bug Interactive Micro-Drill',
          pedagogyTip: 'Enclose iterated terms in brackets before distributing negative coefficients.',
        };
      case 'method_selection':
        return {
          label: 'Method Selection',
          subtitle: 'Selecting ineffective formulas, premature substitution before standard form',
          color: '#5E6AD2',
          remedyModality: 'Visual Decision Flowchart & Pattern Matrix',
          pedagogyTip: 'Compare polynomial degree of numerator vs denominator before initiating substitution.',
        };
      case 'rubric_omission':
        return {
          label: 'Rubric Omission',
          subtitle: 'Omission of integration constant (+C), boundary states, or final units',
          color: '#4DA0FF',
          remedyModality: 'Rubric Checkpoint Self-Audit Protocol',
          pedagogyTip: 'Always write `+ C` immediately when removing the final integral sign.',
        };
      case 'conceptual_misunderstanding':
      default:
        return {
          label: 'Conceptual Misunderstanding',
          subtitle: 'Violations of fundamental theorems (e.g. FTC across singularities)',
          color: '#EB5757',
          remedyModality: 'Intuitive Real-World Analogy & Boundary Sandbox',
          pedagogyTip: 'Verify domain continuity before applying Fundamental Theorem of Calculus.',
        };
    }
  };

  if (!data) {
    return (
      <div className="p-8 rounded-xl bg-[#121316] border border-white/[0.08] text-center text-xs text-[#8A8F98]">
        Computing cognitive error fingerprint...
      </div>
    );
  }

  const activeDetail = data.breakdown.find((b) => b.error_type === selectedType) || data.breakdown[0];
  const activeConfig = getTaxonomyConfig(activeDetail?.error_type || 'procedural_calculation');

  return (
    <div className="space-y-5 font-sans">
      {/* Top Banner Card */}
      <div className="p-5 rounded-xl bg-[#121316] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E6AD2] bg-[#5E6AD2]/10 px-1.5 py-0.5 rounded border border-[#5E6AD2]/20">
              Stage 4 • Cognitive Error Taxonomy
            </span>
            <span className="text-xs font-mono text-[#8A8F98]">Longitudinal Analysis</span>
          </div>
          <h2 className="text-base font-semibold text-[#F7F8F8] mt-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#5E6AD2]" />
            Cognitive Error Fingerprint
          </h2>
          <p className="text-xs text-[#8A8F98] mt-0.5">
            Identifies systemic recurring mental habits draining marks across past tests.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-lg bg-[#08090a] border border-white/[0.08] text-right">
            <p className="text-[9px] font-mono uppercase text-[#8A8F98]">Marks Lost</p>
            <p className="text-xs font-mono font-semibold text-[#EB5757] tabular-nums">
              -{data.total_marks_lost.toFixed(1)} M
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#08090a] border border-white/[0.08] text-right">
            <p className="text-[9px] font-mono uppercase text-[#8A8F98]">Sample Size</p>
            <p className="text-xs font-mono font-semibold text-[#F7F8F8] tabular-nums">
              {data.total_errors_analyzed} Items
            </p>
          </div>
        </div>
      </div>

      {/* Main Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Taxonomy Categories (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl bg-[#121316] border border-white/[0.08] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#F7F8F8]">Error Categories</span>
            <span className="text-[10px] font-mono text-[#8A8F98]">Click row to inspect</span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {data.breakdown.map((item) => {
              const cfg = getTaxonomyConfig(item.error_type);
              const isSelected = selectedType === item.error_type;

              return (
                <div
                  key={item.error_type}
                  onClick={() => setSelectedType(item.error_type)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-white/[0.03] border-l-2 border-l-[#5E6AD2]' : 'hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                      <span className="text-xs font-medium text-[#F7F8F8]">{cfg.label}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#EB5757]">
                      -{item.marks_lost_total.toFixed(1)} M ({item.percentage.toFixed(0)}%)
                    </span>
                  </div>

                  <p className="text-[11px] text-[#8A8F98] ml-4">{cfg.subtitle}</p>

                  <div className="mt-2.5 ml-4 w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.percentage}%`, backgroundColor: cfg.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Remediation Recommendation */}
        <div className="p-4 rounded-xl bg-[#121316] border border-white/[0.08] space-y-3">
          <span className="text-[10px] font-mono uppercase text-[#8A8F98]">Recommended Remediation</span>
          
          <div className="p-3 rounded-lg bg-[#08090a] border border-white/[0.06] space-y-2">
            <span className="text-xs font-medium text-[#F7F8F8]">{activeConfig.label}</span>
            <p className="text-xs text-[#8A8F98] leading-relaxed">{activeConfig.pedagogyTip}</p>
            <div className="pt-2 border-t border-white/[0.04] text-[11px] text-[#27C57E]">
              Modality: {activeConfig.remedyModality}
            </div>
          </div>

          <button
            onClick={() => {
              if (onNavigateToRecovery) onNavigateToRecovery();
              if (onSelectSkill) onSelectSkill('skill_parts_sign');
            }}
            className="w-full py-2 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5"
          >
            <span>Proceed to Recovery ROI Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
