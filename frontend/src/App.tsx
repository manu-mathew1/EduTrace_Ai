import React, { useState } from 'react';
import { Shell, NavTab } from './components/layout/Shell';
import { DashboardPage } from './pages/DashboardPage';
import { IngestionPage } from './pages/IngestionPage';
import { IntakePage } from './pages/IntakePage';
import { ForensicsPage } from './pages/ForensicsPage';
import { InterventionStudio } from './pages/InterventionStudio';
import { ReassessmentPage } from './pages/ReassessmentPage';
import { UploadCloud, MessageSquareCode, GitCompare, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

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

export default App;
