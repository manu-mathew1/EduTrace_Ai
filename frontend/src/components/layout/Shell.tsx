import React, { useState } from 'react';
import { 
  Compass, 
  UploadCloud, 
  MessageSquareCode, 
  GitCompare, 
  TrendingUp, 
  Sparkles, 
  BrainCircuit, 
  ShieldCheck,
  LogOut,
  ChevronDown,
  ChevronRight,
  Activity,
  User,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 'dashboard' | 'ingestion' | 'intake' | 'forensics' | 'recovery' | 'studio' | 'reassessment';

interface ShellProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ currentTab, onSelectTab, children }) => {
  const { user, logout, switchPersona, personas } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Compass, key: '1' },
    { id: 'ingestion', label: 'Materials', icon: UploadCloud, key: '2' },
    { id: 'intake', label: 'Diagnostic Check', icon: MessageSquareCode, key: '3' },
    { id: 'forensics', label: 'Step Analysis', icon: GitCompare, key: '4' },
    { id: 'recovery', label: 'Action Plan', icon: TrendingUp, key: '5' },
    { id: 'studio', label: 'Study Studio', icon: Sparkles, key: '6' },
    { id: 'reassessment', label: 'Skill Check', icon: ShieldCheck, key: '7' },
  ];

  const currentTabLabel = navItems.find((item) => item.id === currentTab)?.label || 'Overview';
  const courseTitle = user?.primary_course_id === 'course_econ_macro' ? 'Macroeconomics 202' : 'Calculus III (MATH-301)';

  return (
    <div className="min-h-screen flex flex-col bg-[#08090a] text-[#F7F8F8] font-sans antialiased selection:bg-[#5E6AD2]/30 selection:text-white">
      {/* Low-Profile Student Header (48px height) */}
      <header className="h-12 border-b border-white/[0.08] bg-[#08090a]/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-4 justify-between transition-all">
        {/* Left: Brand & Course Context */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="w-6 h-6 rounded-md bg-[#5E6AD2] flex items-center justify-center shadow-[0_0_12px_rgba(94,106,210,0.4)]">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-[#F7F8F8]">EduTrace</span>
          </button>

          <span className="text-white/20 text-xs font-mono">/</span>

          {/* Student Breadcrumb */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-[#8A8F98]">
            <span className="hover:text-white transition-colors cursor-default">{courseTitle}</span>
            <ChevronRight className="w-3 h-3 text-white/30" />
            <span className="text-[#F7F8F8] font-medium">{currentTabLabel}</span>
          </div>
        </div>

        {/* Center: Simplified Navigation */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#121316] p-0.5 rounded-lg border border-white/[0.06]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                className={`group flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.08]'
                    : 'text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#5E6AD2]' : 'text-[#8A8F98] group-hover:text-[#F7F8F8]'}`} />
                <span>{item.label}</span>
                <span className={`text-[10px] font-mono ml-0.5 ${isActive ? 'text-white/40' : 'text-white/20 group-hover:text-white/40'}`}>
                  {item.key}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right: Readiness Badge & Student Profile */}
        <div className="flex items-center space-x-2.5">
          {/* Student-Facing Readiness Pill */}
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#121316] border border-white/[0.08] text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27C57E] shadow-[0_0_8px_rgba(39,197,126,0.6)]" />
            <span className="text-[#8A8F98] text-[11px]">Exam Readiness:</span>
            <span className="font-mono text-[11px] font-semibold text-[#27C57E]">68%</span>
          </div>

          {/* Persona Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center space-x-2 px-2 py-1 rounded-lg bg-[#121316] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.04] text-xs transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-[#5E6AD2] overflow-hidden flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'S'
                )}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-[#F7F8F8] max-w-[90px] truncate">
                {user?.name || 'Student'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#8A8F98]" />
            </button>

            {/* Persona Switcher Dropdown */}
            {showPersonaMenu && (
              <div className="absolute right-0 top-10 w-64 rounded-xl bg-[#121316] border border-white/[0.1] shadow-2xl p-1.5 z-50 animate-fadeIn">
                <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8A8F98]">
                  Switch Demo Account
                </div>
                <div className="space-y-0.5 my-1">
                  {personas.map((p) => {
                    const isSelected = user?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          switchPersona(p.id);
                          setShowPersonaMenu(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-all ${
                          isSelected 
                            ? 'bg-[#5E6AD2]/15 text-[#F7F8F8] border border-[#5E6AD2]/30 font-medium' 
                            : 'text-[#8A8F98] hover:text-[#F7F8F8] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-white/10 shrink-0 overflow-hidden">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold flex items-center justify-center h-full text-white">{p.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs">{p.name}</p>
                          <p className="text-[10px] text-[#8A8F98] truncate">{p.headline}</p>
                        </div>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2]" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-1 mt-1 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      logout();
                      setShowPersonaMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-[#EB5757] hover:bg-[#EB5757]/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Clean Student-Facing Footer */}
      <footer className="border-t border-white/[0.06] bg-[#08090a] py-3 text-[11px] text-[#8A8F98]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#27C57E]" />
            <span className="text-[#F7F8F8]">EduTrace AI</span>
            <span className="text-white/20">•</span>
            <span>Personalized Academic Diagnostic & Mastery Platform</span>
          </div>
          <div className="text-white/50 text-[11px]">
            Target Exam Date: Oct 28 • All progress automatically saved
          </div>
        </div>
      </footer>
    </div>
  );
};
