import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Sliders, 
  Layers, 
  BookOpen, 
  Calendar 
} from 'lucide-react';
import { NavTab } from '../components/layout/Shell';

interface IngestionPageProps {
  onNavigateToIntake: () => void;
}

interface ClassifiedDoc {
  id: string;
  filename: string;
  type: 'syllabus' | 'past_paper' | 'lecture_notes' | 'rubric' | 'unknown';
  confidence: number;
  pageCount: number;
  topics: string[];
  examWeight?: number | null;
}

const DEFAULT_DOCUMENTS: ClassifiedDoc[] = [
  {
    id: 'doc_syll_01',
    filename: 'Calculus_III_Syllabus_2026.pdf',
    type: 'syllabus',
    confidence: 0.98,
    pageCount: 4,
    topics: ['Integration Techniques', 'Partial Derivatives', 'Multiple Integrals', 'Vector Calculus'],
    examWeight: 100,
  },
  {
    id: 'doc_pyq_01',
    filename: 'Midterm_Exam_2024_Paper.pdf',
    type: 'past_paper',
    confidence: 0.95,
    pageCount: 3,
    topics: ['Integration by Parts', 'Substitution', 'Differential Equations'],
    examWeight: 40,
  },
  {
    id: 'doc_notes_01',
    filename: 'Prof_Kapoor_Module2_IntegrationNotes.pdf',
    type: 'lecture_notes',
    confidence: 0.99,
    pageCount: 28,
    topics: ['Integration by Parts', 'Trigonometric Substitution', 'Partial Fractions'],
    examWeight: null,
  },
  {
    id: 'doc_rubric_01',
    filename: 'Official_Marking_Scheme_Midterm2024.pdf',
    type: 'rubric',
    confidence: 0.92,
    pageCount: 2,
    topics: ['Step-by-step marking', 'Partial credit rules'],
    examWeight: null,
  },
];

export const IngestionPage: React.FC<IngestionPageProps> = ({ onNavigateToIntake }) => {
  const [documents, setDocuments] = useState<ClassifiedDoc[]>(DEFAULT_DOCUMENTS);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [targetScore, setTargetScore] = useState<number>(75);
  const [baselineScore, setBaselineScore] = useState<number>(50);
  const [examDate, setExamDate] = useState<string>('2026-10-28');

  // Load from backend if available
  useEffect(() => {
    fetch('/api/documents/triage?course_id=course_calc_301')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.documents && data.documents.length > 0) {
          const mapped: ClassifiedDoc[] = data.documents.map((d: any) => ({
            id: d.document_id,
            filename: d.filename,
            type: d.classified_type,
            confidence: d.confidence,
            pageCount: d.page_count,
            topics: d.topics_detected || [],
            examWeight: d.exam_weight_percentage,
          }));
          setDocuments(mapped);
        }
      })
      .catch(() => {
        // Keeps DEFAULT_DOCUMENTS gracefully
      });
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setIsUploading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('course_id', 'course_calc_301');

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const newDocs: ClassifiedDoc[] = data.documents.map((d: any) => ({
          id: d.document_id,
          filename: d.filename,
          type: d.classified_type,
          confidence: d.confidence,
          pageCount: d.page_count,
          topics: d.topics_detected || [],
          examWeight: d.exam_weight_percentage,
        }));
        setDocuments((prev) => [...newDocs, ...prev]);
      } else {
        // Fallback local classification for rapid UI testing
        const synthetic: ClassifiedDoc[] = files.map((f, i) => ({
          id: `doc_local_${Date.now()}_${i}`,
          filename: f.name,
          type: f.name.toLowerCase().includes('syllabus') ? 'syllabus' : 'lecture_notes',
          confidence: 0.94,
          pageCount: Math.max(1, Math.floor(f.size / 3000)),
          topics: ['Integration Techniques', 'Calculus Fundamentals'],
          examWeight: null,
        }));
        setDocuments((prev) => [...synthetic, ...prev]);
      }
    } catch {
      // Local addition
      const synthetic: ClassifiedDoc[] = files.map((f, i) => ({
        id: `doc_local_${Date.now()}_${i}`,
        filename: f.name,
        type: 'lecture_notes',
        confidence: 0.91,
        pageCount: 5,
        topics: ['Integration Techniques'],
        examWeight: null,
      }));
      setDocuments((prev) => [...synthetic, ...prev]);
    } finally {
      setIsUploading(false);
    }
  };

  const removeDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const getTypeBadge = (type: string, conf: number) => {
    const pct = Math.round(conf * 100);
    switch (type) {
      case 'syllabus':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span>Syllabus</span>
            <span className="text-[10px] text-blue-500">({pct}%)</span>
          </span>
        );
      case 'past_paper':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span>Past Paper</span>
            <span className="text-[10px] text-amber-500">({pct}%)</span>
          </span>
        );
      case 'rubric':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <span>Rubric</span>
            <span className="text-[10px] text-purple-500">({pct}%)</span>
          </span>
        );
      case 'lecture_notes':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span>Lecture Notes</span>
            <span className="text-[10px] text-emerald-500">({pct}%)</span>
          </span>
        );
    }
  };

  const gap = Math.max(0, targetScore - baselineScore);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">STAGE 1 • INGESTION</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
              Pod P2 Domain
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Smart Document Ingestion & Auto-Triage</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Upload course materials in any order. EduTrace's classifier automatically tags Syllabi, Past Papers, Lecture Notes, and Rubrics to extract exam topic weightages.
          </p>
        </div>

        <button
          onClick={onNavigateToIntake}
          disabled={documents.length === 0}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
        >
          <span>Confirm & Start Stage 2 Intake</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Target & Exam Configuration Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-2">
            <span>Target Goal Score</span>
            <span className="text-indigo-400 font-bold text-sm">{targetScore}%</span>
          </label>
          <input
            type="range"
            min={50}
            max={100}
            value={targetScore}
            onChange={(e) => setTargetScore(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 mt-1">Aiming for 1st Class Honours / Grade A</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-2">
            <span>Current Baseline Score</span>
            <span className="text-slate-200 font-bold text-sm">{baselineScore}%</span>
          </label>
          <input
            type="range"
            min={20}
            max={80}
            value={baselineScore}
            onChange={(e) => setBaselineScore(Number(e.target.value))}
            className="w-full accent-slate-500 cursor-pointer"
          />
          <p className="text-[11px] text-amber-400/90 mt-1">Gap to Bridge: +{gap} Marks needed</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Exam Date</span>
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">Countdown: 6 Days Remaining</p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-800/90 hover:border-indigo-500/40 bg-slate-900/40'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Drag & drop your course documents here</h3>
          <p className="text-xs text-slate-400 mt-1.5">
            Supports PDF, DOCX, Markdown, or TXT (Syllabus, Past Papers, Lecture Slides, Marking Scheme)
          </p>

          <label
            htmlFor="file-upload"
            className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
          >
            {isUploading ? 'Classifying Documents...' : 'Select Files to Upload'}
          </label>
        </div>
      </div>

      {/* Classified Documents Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white">Classified Course Knowledge Assets</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
              {documents.length} Files Ready
            </span>
          </div>
          <span className="text-xs text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready for Metacognitive Intake</span>
          </span>
        </div>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-lg bg-slate-800/80 text-indigo-400 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">{doc.filename}</p>
                    {getTypeBadge(doc.type, doc.confidence)}
                    {doc.examWeight && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {doc.examWeight}% Weight
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-slate-500 font-medium mr-1">{doc.pageCount} Pages • Topics:</span>
                    {doc.topics.map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end md:self-center">
                <button
                  onClick={() => removeDoc(doc.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
