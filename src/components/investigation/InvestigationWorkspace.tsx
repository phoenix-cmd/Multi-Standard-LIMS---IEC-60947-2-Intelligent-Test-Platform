import React, { useState } from 'react';
import type { InvestigationCase } from '../../investigation/CaseTypes';
import { CaseListPanel } from './CaseListPanel';
import { EvidenceGraphViewer } from './EvidenceGraphViewer';
import { AITimelineView } from './AITimelineView';
import { WhiteboardCanvas } from './WhiteboardCanvas';
import { FinalReportCompiler } from './FinalReportCompiler';
import { Search, AlertTriangle, ShieldCheck, FileText, Activity, Users, Layers } from 'lucide-react';

const INITIAL_CASES: InvestigationCase[] = [
  {
    id: 'CASE-2026-001',
    title: 'Clause 8.3.3.3 Tripping Delay Out-of-Tolerance Investigation',
    sampleId: 'sample-001',
    reportNo: 'LAB-2026-MCCB-00892',
    clauseId: '8.3.3.3',
    status: 'in_progress',
    leadEngineer: 'Dr. Aris Thorne',
    assignedEngineers: ['Dr. Aris Thorne', 'Elena Rostova (Quality)'],
    createdAt: '2026-07-24T14:30:00Z',
    updatedAt: '2026-07-25T10:15:00Z',
    evidence: [
      { id: 'ev-1', type: 'measurement', title: 'Trip Time at 1.30*In', description: 'Tripping time measured 142s against maximum 120s limit.', clauseId: '8.3.3.3', measuredValue: 142, limitValue: 120, unit: 's', timestamp: '2026-07-24T14:35:00Z' },
      { id: 'ev-2', type: 'waveform', title: 'Tripping Current Telemetry', description: 'Primary injection current trace showed 5% amplitude drop at 90s.', clauseId: '8.3.3.3', componentId: 'thermalElement', timestamp: '2026-07-24T14:40:00Z' },
      { id: 'ev-3', type: '3d_snapshot', title: 'Digital Twin Bimetal Thermal Overlay', description: 'Bimetal element temperature reached 115°C with high thermal inertia.', componentId: 'thermalElement', timestamp: '2026-07-24T14:45:00Z' },
    ],
    timeline: [
      { id: 't-1', timestamp: '2026-07-24T14:35:00Z', author: 'Test Wizard', isAI: false, title: 'Clause 8.3.3.3 FAIL Recorded', details: 'Measured trip time 142s exceeded limit 120s.' },
      { id: 't-2', timestamp: '2026-07-24T14:36:00Z', author: 'AI Copilot', isAI: true, title: 'Diagnostic Analysis Triggered', details: 'Root Cause Probability: 48% Trip unit parameter drift, 32% Bimetal thermal creep.' },
      { id: 't-3', timestamp: '2026-07-24T15:00:00Z', author: 'Dr. Aris Thorne', isAI: false, title: 'Bimetal Deflection Inspection', details: 'Verified bimetal torque adjustment pin.' },
    ],
    rootCauses: [
      { cause: 'Electronic Trip Unit Parameter Drift', probability: 48, rationale: 'Relay delay setpoint shifted by 18% during thermal cycling.' },
      { cause: 'Bimetal Deflection Creep Offset', probability: 32, rationale: 'Bimetal element fatigue after sustained thermal testing.' },
    ],
    correctiveActions: [
      'Recalibrate trip unit time-delay setpoint using certified injection test set PS-02.',
      'Replace bimetal element sub-assembly and re-test Clause 8.3.3.3.',
    ],
    preventiveActions: [
      'Schedule annual primary injection calibration audit.',
      'Implement thermal conditioning bake prior to Sequence I test.',
    ],
    whiteboardNotes: [
      { id: 'wb-1', text: 'Re-verify PS-02 calibration certificate!', x: 50, y: 50, color: 'bg-amber-500/20 border-amber-500/40 text-amber-200' },
      { id: 'wb-2', text: 'Bimetal replacement authorized by Elena', x: 280, y: 50, color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' },
    ],
  },
];

export function InvestigationWorkspace() {
  const [cases, setCases] = useState<InvestigationCase[]>(INITIAL_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>(INITIAL_CASES[0].id);
  const [activeTab, setActiveTab] = useState<'evidence' | 'timeline' | 'whiteboard' | 'report'>('evidence');

  const activeCase = cases.find((c) => c.id === activeCaseId) ?? cases[0];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-surface-950">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-surface-800 bg-surface-900 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-surface-100">{activeCase.title}</h2>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                {activeCase.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[10px] text-surface-400">
              Case ID: {activeCase.id} · Report: {activeCase.reportNo} · Lead: {activeCase.leadEngineer}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-surface-800 border border-surface-700 rounded-lg p-0.5">
          {(['evidence', 'timeline', 'whiteboard', 'report'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all ${
                activeTab === t ? 'bg-surface-700 text-surface-100 shadow' : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Case List Selector */}
        <div className="w-72 border-r border-surface-800 flex-shrink-0 overflow-y-auto">
          <CaseListPanel cases={cases} activeCaseId={activeCaseId} onSelectCase={setActiveCaseId} />
        </div>

        {/* Centre: Dynamic Quad Views */}
        <div className="flex-1 overflow-hidden p-4">
          {activeTab === 'evidence' && <EvidenceGraphViewer caseData={activeCase} />}
          {activeTab === 'timeline' && <AITimelineView caseData={activeCase} />}
          {activeTab === 'whiteboard' && <WhiteboardCanvas caseData={activeCase} />}
          {activeTab === 'report' && <FinalReportCompiler caseData={activeCase} />}
        </div>
      </div>
    </div>
  );
}
