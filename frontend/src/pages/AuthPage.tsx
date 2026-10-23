import React, { useState } from 'react';
import {
  BrainCircuit,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { login, register, switchPersona, personas, authError } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('course_calc_301');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (tab === 'signin') {
      await login(email, password);
    } else {
      await register(email, name, password, courseId);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/25 mb-4">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <BrainCircuit className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">EduTrace AI</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Academic Forensic & Metacognitive Intervention Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl z-10 px-4">
        {/* Judge Fast-Track Persona Bar */}
        <div className="mb-6 p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Judge Fast-Track: 1-Click Multi-Tenant Personas
              </span>
            </div>
            <span className="text-[11px] text-indigo-300 font-medium">Click any persona to log in instantly</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => switchPersona(p.id)}
                className="text-left p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/90 transition-all group flex items-start space-x-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-indigo-300">
                      {p.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">{p.name}</p>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {p.baseline_readiness}% Readiness
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">{p.headline}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Form Box */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl max-w-lg mx-auto">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6 text-xs font-bold">
            <button
              onClick={() => setTab('signin')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'signin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In to Account
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create New Student
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative rounded-xl border border-slate-800 bg-slate-950 focus-within:border-indigo-500">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-transparent pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 focus-within:border-indigo-500">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@school.edu"
                  className="w-full bg-transparent pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 focus-within:border-indigo-500">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Course Enrolled</label>
                <div className="relative rounded-xl border border-slate-800 bg-slate-950 focus-within:border-indigo-500">
                  <BookOpen className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full bg-slate-950 pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none rounded-xl"
                  >
                    <option value="course_calc_301">MATH-301: Calculus III (Multivariable)</option>
                    <option value="course_econ_macro">ECON-202: Macroeconomic Theory</option>
                    <option value="course_cs_210">CS-210: Data Structures & Algorithms</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <span>{tab === 'signin' ? 'Sign In to Mission Control' : 'Create Student Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
            <span>Production Authentication Engine • PBKDF2-HMAC-SHA256 • Tenant-Isolated State</span>
          </div>
        </div>
      </div>
    </div>
  );
};
