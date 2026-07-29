import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LIMSProvider } from './context/LIMSContext';
import { DesktopWorkspaceProvider, useDesktopWorkspace } from './desktop/DesktopWorkspaceContext';
import { ContextMenuProvider } from './desktop/ContextMenuProvider';
import { DesktopTabBar } from './desktop/DesktopTabBar';
import { DesktopStatusBar } from './desktop/DesktopStatusBar';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { AICopilotDrawer } from './components/ai/AICopilotDrawer';
import { CommandPalette } from './components/ui/CommandPalette';
import { PropertyInspector } from './components/ui/PropertyInspector';
import { NotificationCenter } from './components/ui/NotificationCenter';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';

import { LoginPage } from './components/auth/LoginPage';
import { OperationsDashboard } from './components/dashboard/OperationsDashboard';
import { QualityDashboard } from './components/dashboard/QualityDashboard';
import { SampleRegistry } from './components/samples/SampleRegistry';
import { GuidedTestWizard } from './components/wizard/GuidedTestWizard';
import { AdvancedOscillographViewer } from './components/oscillograph/AdvancedOscillographViewer';
import { EquipmentAssetManager } from './components/equipment/EquipmentAssetManager';
import { StandardManagerView } from './components/standards/StandardManagerView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { ReportList } from './components/reports/ReportList';
import { EngineeringPlatform } from './components/engineering/EngineeringPlatform';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { WorkflowEditor } from './components/workflow/WorkflowEditor';
import { InvestigationWorkspace } from './components/investigation/InvestigationWorkspace';
import { NotebookWorkspace } from './components/notebook/NotebookWorkspace';
import { SandboxWorkspace } from './components/sandbox/SandboxWorkspace';
import { AdminWorkspace } from './components/admin/AdminWorkspace';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Operations Dashboard',
  '/quality': 'Quality Dashboard',
  '/equipment': 'Equipment & Calibration',
  '/samples': 'Sample Registry & Lifecycle',
  '/wizard': 'Guided Test Wizard — IEC 60947-2',
  '/oscillograph': 'Oscillograph Viewer',
  '/replay': 'Test Replay',
  '/reports': 'Test Reports',
  '/standards': 'Standard Manager',
  '/audit': 'Audit Trail',
  '/admin': 'Enterprise Administration & Identity OS',
  '/settings': 'Enterprise Administration & Identity OS',
  '/engineering': 'Engineering Intelligence Platform',
  '/analytics': 'Laboratory Analytics & Business Intelligence',
  '/workflow': 'Visual Workflow Designer',
  '/investigation': 'AI Root Cause Investigation Workspace',
  '/notebook': 'Digital Engineering Notebook',
  '/sandbox': 'Laboratory Scenario Sandbox',
};

function Page({ children, path }: { children: React.ReactNode; path: string }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopHeader title={PAGE_TITLES[path] ?? 'LIMS'} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="p-12 flex flex-col items-center justify-center text-center h-full">
      <p className="text-2xl font-black text-surface-100 mb-2">{label}</p>
      <p className="text-sm text-surface-400">This module is part of the enterprise LIMS platform and will be populated with full functionality.</p>
    </div>
  );
}

function ConditionalAICopilotDrawer() {
  const location = useLocation();
  if (location.pathname === '/engineering' || location.pathname === '/login') return null;
  return <AICopilotDrawer />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center text-surface-200">
        <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
        <p className="font-mono text-sm">Authenticating Engineering OS Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function DesktopShell() {
  const { focusMode } = useDesktopWorkspace();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-950">
      <DesktopTabBar />

      <div className="flex-1 flex overflow-hidden">
        {!focusMode && <Sidebar />}

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Page path="/"><OperationsDashboard /></Page>} />
            <Route path="/quality" element={<Page path="/quality"><QualityDashboard /></Page>} />
            <Route path="/equipment" element={<Page path="/equipment"><EquipmentAssetManager /></Page>} />
            <Route path="/samples" element={<Page path="/samples"><SampleRegistry /></Page>} />
            <Route path="/wizard" element={<Page path="/wizard"><GuidedTestWizard /></Page>} />
            <Route path="/oscillograph" element={<Page path="/oscillograph">
              <div className="h-[600px] p-6"><AdvancedOscillographViewer /></div>
            </Page>} />
            <Route path="/replay" element={<Page path="/replay"><Placeholder label="Test Replay Engine" /></Page>} />
            <Route path="/reports" element={<Page path="/reports"><ReportList /></Page>} />
            <Route path="/standards" element={<Page path="/standards"><StandardManagerView /></Page>} />
            <Route path="/audit" element={<Page path="/audit"><AuditTrailView /></Page>} />
            <Route path="/admin" element={<Page path="/admin"><AdminWorkspace /></Page>} />
            <Route path="/settings" element={<Page path="/settings"><AdminWorkspace /></Page>} />
            <Route path="/engineering" element={<EngineeringPlatform />} />
            <Route path="/analytics" element={<Page path="/analytics"><AnalyticsDashboard /></Page>} />
            <Route path="/workflow" element={<WorkflowEditor />} />
            <Route path="/investigation" element={<InvestigationWorkspace />} />
            <Route path="/notebook" element={<NotebookWorkspace />} />
            <Route path="/sandbox" element={<SandboxWorkspace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      <DesktopStatusBar />

      <CommandPalette />
      <PropertyInspector />
      <NotificationCenter />
      <KeyboardShortcutsModal />
      <ConditionalAICopilotDrawer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LIMSProvider>
          <DesktopWorkspaceProvider>
            <ContextMenuProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <DesktopShell />
                  </ProtectedRoute>
                } />
              </Routes>
            </ContextMenuProvider>
          </DesktopWorkspaceProvider>
        </LIMSProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
