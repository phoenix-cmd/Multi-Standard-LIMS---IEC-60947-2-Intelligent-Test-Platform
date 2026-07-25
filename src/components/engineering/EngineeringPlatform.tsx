import React, { useState } from 'react';
import { EngineeringProvider, useEngineering } from '../../context/EngineeringContext';
import { useLIMS } from '../../context/LIMSContext';
import { DigitalTwinPanel } from './DigitalTwinPanel';
import { Viewer3DPanel } from './Viewer3DPanel';
import { ComponentInspector } from './ComponentInspector';
import { EngineeringCopilot } from './EngineeringCopilot';
import { FailureAnalysisPanel } from './FailureAnalysisPanel';
import {
  ChevronDown, Camera, Cpu, AlertTriangle, Activity,
  BarChart2, Bot, RotateCcw, Layers
} from 'lucide-react';

type RightPanelTab = 'copilot' | 'failure';
type BottomPanelTab = 'none' | 'inspector';

function PlatformContent() {
  const { samples } = useLIMS();
  const { activeSampleId, setActiveSampleId, twinEngine, selectedComponentId } = useEngineering();
  const [rightTab, setRightTab] = useState<RightPanelTab>('copilot');
  const [sampleMenuOpen, setSampleMenuOpen] = useState(false);

  const activeSample = samples.find((s) => s.id === activeSampleId) ?? samples[0];

  const failedCount = activeSample?.testRuns.flatMap((r) => r.clauseResults).filter((c) => c.verdict === 'FAIL').length ?? 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Platform Header ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-surface-800 bg-surface-950 flex items-center gap-3">
        {/* Sample selector */}
        <div className="relative">
          <button
            onClick={() => setSampleMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700 hover:border-brand-500/40 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <div className="text-left">
              <p className="text-xs font-bold text-surface-100 leading-none">
                {activeSample?.reportNo ?? 'No Sample'}
              </p>
              <p className="text-[9px] text-surface-500 mt-0.5">
                {activeSample?.specification?.model ?? '—'} · In={activeSample?.specification?.ratedCurrent ?? '—'}A
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-surface-500" />
          </button>

          {sampleMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSampleMenuOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-64 bg-surface-900 border border-surface-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                {samples.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveSampleId(s.id); setSampleMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 border-b border-surface-800 last:border-0 hover:bg-surface-800 transition-colors
                      ${s.id === activeSampleId ? 'bg-brand-600/10' : ''}`}
                  >
                    <p className="text-xs font-bold text-surface-100">{s.reportNo}</p>
                    <p className="text-[10px] text-surface-500">{s.clientName} · {s.specification?.model}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Verdict badge */}
        {activeSample && (
          <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg
            ${failedCount > 0
              ? 'bg-red-500/15 text-red-400 border border-red-500/25'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
            }`}>
            {failedCount > 0 ? <AlertTriangle className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
            {failedCount > 0 ? `${failedCount} Clause${failedCount > 1 ? 's' : ''} Failed` : 'All Clauses Pass'}
          </span>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={() => twinEngine.reset()}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200 hover:border-surface-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Twin
        </button>

        <div className="flex items-center gap-1 bg-surface-800 border border-surface-700 rounded-lg p-0.5">
          {([
            { id: 'copilot' as const, label: 'Copilot', Icon: Bot },
            { id: 'failure' as const, label: 'Failure Analysis', Icon: BarChart2 },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setRightTab(id)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all
                ${rightTab === id ? 'bg-surface-700 text-surface-100' : 'text-surface-500 hover:text-surface-300'}`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Three-Panel Layout ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex gap-0">

        {/* LEFT: Digital Twin Panel */}
        <div className="w-56 flex-shrink-0 border-r border-surface-800 overflow-hidden">
          <DigitalTwinPanel />
        </div>

        {/* CENTRE: 3D Viewer */}
        <div className="flex-1 relative overflow-hidden bg-surface-950 p-3">
          <Viewer3DPanel />

          {/* Component Inspector slides in from right within viewer */}
          {selectedComponentId && <ComponentInspector />}
        </div>

        {/* RIGHT: Copilot / Failure Analysis */}
        <div className="w-80 flex-shrink-0 border-l border-surface-800 overflow-hidden">
          <div className="h-full overflow-hidden">
            {rightTab === 'copilot' && <EngineeringCopilot />}
            {rightTab === 'failure' && (
              <div className="h-full overflow-y-auto p-3">
                <h3 className="text-sm font-bold text-surface-100 mb-3">Failure Analysis</h3>
                <FailureAnalysisPanel />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EngineeringPlatform() {
  return (
    <EngineeringProvider>
      <PlatformContent />
    </EngineeringProvider>
  );
}
