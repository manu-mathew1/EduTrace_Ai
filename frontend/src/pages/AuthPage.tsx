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
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AuthPage: React.FC = () => {
  const { login, register, switchPersona, personas, authError } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (tab === 'signin') {
      await login(email, password);
    } else {
      await register(email, name, password);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-[#F7F8F8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Top Right: Theme Switcher Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#121316] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.04] text-xs transition-all shadow-sm text-[#8A8F98] hover:text-[#F7F8F8]"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle light or dark theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#E59934] transition-transform hover:rotate-45" />
              <span className="text-xs font-medium text-[#F7F8F8]">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#5E6AD2] transition-transform hover:-rotate-12" />
              <span className="text-xs font-medium text-[#F7F8F8]">Dark</span>
            </>
          )}
        </button>
      </div>

      {/* Subtle Linear top light-cone effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#5E6AD2]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#5E6AD2] shadow-[0_0_24px_rgba(94,106,210,0.5)] mb-3.5">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#F7F8F8]">EduTrace AI</h1>
        <p className="text-xs text-[#8A8F98] mt-1 max-w-sm mx-auto">
          AI Exam Diagnostic & Personalized Grade Recovery
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-4xl z-10 px-4">
        {/* Demo Student Personas Bar */}
        <div className="mb-6 p-4 rounded-xl bg-[#121316] border border-white/[0.08] shadow-2xl">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E59934] shadow-[0_0_8px_rgba(229,153,52,0.6)]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#F7F8F8]">
                Quick Demo • Explore as a Sample Student
              </span>
            </div>
            <span className="text-[11px] text-[#8A8F98] font-mono">1-click instant login</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => switchPersona(p.id)}
                className="text-left p-3 rounded-lg bg-[#08090a] border border-white/[0.06] hover:border-[#5E6AD2]/50 hover:bg-white/[0.02] transition-all group flex items-start space-x-3"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/[0.08] overflow-hidden shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#5E6AD2]">
                      {p.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-medium text-[#F7F8F8] group-hover:text-white truncate">{p.name}</p>
                    <span className="text-[10px] font-mono text-[#27C57E] bg-[#27C57E]/10 px-1 rounded border border-[#27C57E]/20">
                      {p.baseline_readiness}%
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8A8F98] line-clamp-2 mt-0.5 leading-snug">{p.headline}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Form Box */}
        <div className="bg-[#121316] border border-white/[0.08] rounded-xl p-6 shadow-2xl max-w-md mx-auto">
          {/* Segmented Auth Tabs */}
          <div className="flex p-0.5 rounded-lg bg-[#08090a] border border-white/[0.06] mb-5">
            <button
              onClick={() => setTab('signin')}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === 'signin'
                  ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.08]'
                  : 'text-[#8A8F98] hover:text-[#F7F8F8]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === 'register'
                  ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.08]'
                  : 'text-[#8A8F98] hover:text-[#F7F8F8]'
              }`}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-2.5 rounded-lg bg-[#EB5757]/10 border border-[#EB5757]/20 flex items-center space-x-2 text-xs text-[#EB5757]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#8A8F98] mb-1.5">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full bg-[#08090a] border border-white/[0.08] focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2] rounded-lg px-3 py-2 text-xs text-[#F7F8F8] placeholder-[#5B6069] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#8A8F98] mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@edutrace.ai"
                className="w-full bg-[#08090a] border border-white/[0.08] focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2] rounded-lg px-3 py-2 text-xs text-[#F7F8F8] placeholder-[#5B6069] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#8A8F98] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#08090a] border border-white/[0.08] focus:border-[#5E6AD2] focus:ring-1 focus:ring-[#5E6AD2] rounded-lg px-3 py-2 text-xs text-[#F7F8F8] placeholder-[#5B6069] outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-[#5E6AD2] hover:bg-[#6F7CE8] text-white text-xs font-semibold shadow-[0_2px_8px_rgba(94,106,210,0.3)] transition-all disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'Signing in...' : tab === 'signin' ? 'Sign In to Workspace' : 'Create Student Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {tab === 'signin' && (
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
              <p className="text-[11px] text-[#8A8F98]">
                Default demo password is <code className="text-[#F7F8F8] font-mono bg-white/[0.06] px-1 py-0.5 rounded">password123</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
