import React, { useState } from 'react';
import { useDesktopWorkspace } from '../../desktop/DesktopWorkspaceContext';
import {
  X, Layers, Cpu, ShieldCheck, Activity, Brain, History, Link2, GitFork, ExternalLink, Sparkles
} from 'lucide-react';

type InspectorTab = 'overview' | 'properties' | 'relationships' | 'thread' | 'graph' | 'ai';

export function PropertyInspector() {
  const { inspectedObject, closeInspector, openTab } = useDesktopWorkspace();
  const [tab, setTab] = useState<InspectorTab>('overview');

  if (!inspectedObject) return null;

  const tabs: { id: InspectorTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'properties', label: 'Tech Specs', icon: Cpu },
    { id: 'relationships', label: 'Links', icon: Link2 },
    { id: 'thread', label: 'Lineage', icon: History },
    { id: 'graph', label: 'Graph', icon: GitFork },
    { id: 'ai', label: 'AI Insights', icon: Brain },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 bg-surface-900 border-l border-surface-800 shadow-2xl flex flex-col backdrop-blur-md">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-800 flex items-center justify-between bg-surface-950">
        <div>
          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-600/20 text-brand-400 border border-brand-500/30">
            {inspectedObject.type}
          </span>
          <h3 className="text-sm font-bold text-surface-100 truncate mt-1 max-w-[280px]">
            {inspectedObject.title}
          </h3>
        </div>
        <button onClick={closeInspector} className="p-1 text-surface-500 hover:text-surface-200 rounded-lg hover:bg-surface-800">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-800 bg-surface-950/60 overflow-x-auto custom-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab === id ? 'border-brand-500 text-brand-400 bg-surface-900' : 'border-transparent text-surface-500 hover:text-surface-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tab === 'overview' && (
          <div className="space-y-3">
            <div className="p-3 bg-surface-800/50 rounded-xl border border-surface-700 space-y-2">
              <p className="text-[10px] text-surface-500 font-semibold uppercase">Entity Metadata</p>
              <div className="flex justify-between text-xs">
                <span className="text-surface-400">ID:</span>
                <span className="font-mono text-brand-400 font-bold">{inspectedObject.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-surface-400">Type:</span>
                <span className="capitalize text-surface-200">{inspectedObject.type}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-surface-400">Status:</span>
                <span className="text-emerald-400 font-semibold">● Active / Validated</span>
              </div>
            </div>

            <button
              onClick={() => {
                openTab({ title: inspectedObject.title, path: `/${inspectedObject.type}s` });
                closeInspector();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Full Module Workspace
            </button>
          </div>
        )}

        {tab === 'properties' && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-surface-300">Technical Attributes</p>
            <div className="space-y-1 text-xs">
              <div className="p-2 bg-surface-800/40 rounded-lg border border-surface-800 flex justify-between">
                <span className="text-surface-400">Standard Clause</span>
                <span className="font-mono text-purple-300">IEC 60947-2 Cl 8.3.4</span>
              </div>
              <div className="p-2 bg-surface-800/40 rounded-lg border border-surface-800 flex justify-between">
                <span className="text-surface-400">Rated Current (In)</span>
                <span className="font-mono text-surface-200">100 A</span>
              </div>
              <div className="p-2 bg-surface-800/40 rounded-lg border border-surface-800 flex justify-between">
                <span className="text-surface-400">Calibration State</span>
                <span className="font-mono text-emerald-400">Valid</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'relationships' && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-surface-300">Upstream & Downstream Dependencies</p>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300">
                🧪 Sample: Havells MCCB 100A (SMP-001)
              </div>
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-300">
                🔄 Workflow: Standard Test Sequence v2
              </div>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300">
                📄 Report: Type Test Report HAV-2024-001
              </div>
            </div>
          </div>
        )}

        {tab === 'thread' && (
          <div className="space-y-2 text-xs">
            <p className="font-bold text-surface-300">Digital Thread Lineage</p>
            <div className="relative pl-4 space-y-3 border-l border-surface-800">
              <div>
                <p className="text-[10px] text-surface-500">2026-07-25 14:00</p>
                <p className="font-semibold text-surface-200">Sample Registration</p>
                <p className="text-[10px] text-surface-400">Registered by Dr. Arjun Mehta</p>
              </div>
              <div>
                <p className="text-[10px] text-surface-500">2026-07-25 15:30</p>
                <p className="font-semibold text-surface-200">Temperature Rise Test Executed</p>
                <p className="text-[10px] text-emerald-400">Passed — ΔT max 48K</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'graph' && (
          <div className="p-4 bg-surface-950 rounded-xl border border-surface-800 text-center space-y-2">
            <GitFork className="w-8 h-8 text-cyan-400 mx-auto" />
            <p className="text-xs font-bold text-surface-200">Knowledge Graph Linked Node</p>
            <p className="text-[10px] text-surface-500">Connected to 14 ontological entities in the test graph database.</p>
          </div>
        )}

        {tab === 'ai' && (
          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <Sparkles className="w-4 h-4" /> AI Automated Summary
            </div>
            <p className="text-surface-300 leading-relaxed">
              Target object <strong>{inspectedObject.title}</strong> shows nominal operational performance. All thermal and dielectric limits adhere strictly to IEC 60947-2 certification specifications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
