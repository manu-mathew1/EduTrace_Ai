import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  Target,
  ArrowRight,
  Layers,
  Sparkles,
  Check,
  UploadCloud,
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { KnowledgeArchetype } from '../../types/schema';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated?: (courseId: string) => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
}) => {
  const { createNewCourse } = useCourses();
  const [title, setTitle] = useState('');
  const [archetype, setArchetype] = useState<KnowledgeArchetype>(KnowledgeArchetype.PROCEDURAL);
  const [targetScore, setTargetScore] = useState<number>(85);
  const [examDate, setExamDate] = useState<string>('2026-11-20');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a subject title.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const created = await createNewCourse(title.trim(), archetype, targetScore, examDate);
    setIsSubmitting(false);

    if (created) {
      onClose();
      if (onCourseCreated) {
        onCourseCreated(created.course_id);
      }
    } else {
      setErrorMsg('Could not create subject. Please check your network.');
    }
  };

  const sampleSubjects = [
    { name: 'Physics 101: Classical Mechanics', arch: KnowledgeArchetype.CONCEPTUAL },
    { name: 'CHEM 201: Organic Chemistry', arch: KnowledgeArchetype.CONCEPTUAL },
    { name: 'CS 310: Operating Systems & Concurrency', arch: KnowledgeArchetype.PROCEDURAL },
    { name: 'LAW 101: Constitutional Law', arch: KnowledgeArchetype.EVALUATIVE },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121316] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#5E6AD2]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#F7F8F8]">Add New Subject</h2>
              <p className="text-[11px] text-[#8A8F98]">Track any university course with its own Learning Twin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-white/[0.04] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-[#EB5757]/10 border border-[#EB5757]/20 text-xs text-[#EB5757]">
              {errorMsg}
            </div>
          )}

          {/* Subject Title */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#8A8F98] mb-1.5">
              Subject Name & Code
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Physics 101: Classical Mechanics"
              className="w-full bg-[#08090a] border border-white/[0.08] focus:border-[#5E6AD2] rounded-lg px-3 py-2 text-xs text-[#F7F8F8] placeholder-[#5B6069] outline-none"
            />
            {/* Quick Suggestions */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sampleSubjects.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTitle(s.name);
                    setArchetype(s.arch);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.03] hover:bg-white/[0.08] text-[#8A8F98] hover:text-[#F7F8F8] border border-white/[0.06] transition-all"
                >
                  + {s.name.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Archetype Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#8A8F98] mb-1.5">
              Subject Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: KnowledgeArchetype.PROCEDURAL, label: 'Procedural', desc: 'Math, CS, Calculations' },
                { type: KnowledgeArchetype.CONCEPTUAL, label: 'Conceptual', desc: 'Physics, Economics' },
                { type: KnowledgeArchetype.FACTUAL, label: 'Factual', desc: 'Biology, Medicine' },
                { type: KnowledgeArchetype.EVALUATIVE, label: 'Evaluative', desc: 'Law, Humanities' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setArchetype(item.type)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    archetype === item.type
                      ? 'bg-[#5E6AD2]/10 border-[#5E6AD2] text-[#F7F8F8]'
                      : 'bg-[#08090a] border-white/[0.06] hover:border-white/[0.12] text-[#8A8F98]'
                  }`}
                >
                  <p className="text-xs font-medium text-[#F7F8F8]">{item.label}</p>
                  <p className="text-[10px] text-[#8A8F98] mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Target Score & Exam Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#8A8F98] mb-1.5 flex items-center gap-1">
                <Target className="w-3 h-3 text-[#27C57E]" />
                Target Score (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-full bg-[#08090a] border border-white/[0.08] focus:border-[#5E6AD2] rounded-lg px-3 py-2 text-xs font-mono text-[#F7F8F8] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#8A8F98] mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#E59934]" />
                Target Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-[#08090a] border border-white/[0.08] focus:border-[#5E6AD2] rounded-lg px-3 py-2 text-xs font-mono text-[#F7F8F8] outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] text-[#8A8F98]">
              Next step: Upload syllabus, notes & past exams
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-semibold shadow-[0_2px_8px_rgba(94,106,210,0.3)] transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Creating...' : 'Create & Upload Materials'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
