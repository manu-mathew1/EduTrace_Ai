import React, { useState } from 'react';
import { Shell, NavTab } from './components/layout/Shell';
import { DashboardPage } from './pages/DashboardPage';
import { IngestionPage } from './pages/IngestionPage';
import { IntakePage } from './pages/IntakePage';
import { ForensicsPage } from './pages/ForensicsPage';
import { InterventionStudio } from './pages/InterventionStudio';
import { ReassessmentPage } from './pages/ReassessmentPage';
import { AuthPage } from './pages/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { ThemeProvider } from './context/ThemeContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Loading EduTrace AI...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Shell currentTab={currentTab} onSelectTab={setCurrentTab}>
      {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}

      {/* Stage 1 Ingestion Page (Pod P2) */}
      {currentTab === 'ingestion' && <IngestionPage onNavigateToIntake={() => setCurrentTab('intake')} />}

      {/* Stage 2 Intake & Diagnostic Probe Page (Pod P3) */}
      {currentTab === 'intake' && <IntakePage onNavigateToForensics={() => setCurrentTab('forensics')} />}

      {/* Stage 3 Forensic Step-Diff Page (Pod P4) */}
      {currentTab === 'forensics' && <ForensicsPage onNavigateToRecovery={() => setCurrentTab('recovery')} />}

      {/* Stage 5 Marks Recovery Roadmap (Pod P5) */}
      {currentTab === 'recovery' && (
        <InterventionStudio
          initialMode="recovery"
          onNavigateToStudio={() => setCurrentTab('studio')}
          onNavigateToReassessment={() => setCurrentTab('reassessment')}
        />
      )}

      {/* Stage 6 Multimodal Intervention Studio (Pod P5) */}
      {currentTab === 'studio' && (
        <InterventionStudio
          initialMode="studio"
          onNavigateToRecovery={() => setCurrentTab('recovery')}
          onNavigateToReassessment={() => setCurrentTab('reassessment')}
        />
      )}

      {/* Stage 7 Reassessment & Learning Twin Lock-in (Pod P5) */}
      {currentTab === 'reassessment' && (
        <ReassessmentPage
          onReturnToDashboard={() => setCurrentTab('dashboard')}
          onReturnToRecovery={() => setCurrentTab('recovery')}
        />
      )}
    </Shell>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <AppContent />
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
