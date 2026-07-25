import React, { useState, useCallback, useEffect } from 'react';
import type { Scenario, ScenarioConfig, ScenarioTemplate } from '../../sandbox/ScenarioTypes';
import { globalScenarioRunner } from '../../sandbox/ScenarioRunner';
import { SCENARIO_TEMPLATES } from '../../sandbox/ScenarioTemplates';
import { ScenarioDashboard } from './ScenarioDashboard';
import { ScenarioBuilder } from './ScenarioBuilder';
import { ScenarioTimeline } from './ScenarioTimeline';
import { ScenarioComparison } from './ScenarioComparison';
import {
  FlaskConical, Play, BarChart3, Clock, GitCompare, Settings2,
  Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Circle, Search
} from 'lucide-react';

type SandboxTab = 'builder' | 'results' | 'timeline' | 'compare';

const STATUS_CONFIG = {
  draft: { icon: Circle, color: 'text-surface-500', label: 'Draft' },
  ready: { icon: CheckCircle2, color: 'text-yellow-400', label: 'Ready' },
  running: { icon: Loader2, color: 'text-blue-400 animate-spin', label: 'Running' },
  completed: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Done' },
  failed: { icon: AlertCircle, color: 'text-red-400', label: 'Failed' },
};

// ── Template picker ────────────────────────────────────────────

function TemplatePicker({ onSelect }: { onSelect(t: ScenarioTemplate): void }) {
  const [query, setQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filtered = SCENARIO_TEMPLATES.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase());
    const matchesDiff = filterDifficulty === 'all' || t.difficulty === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-surface-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 10 scenario templates..."
            className="w-full pl-9 pr-3 py-2 bg-surface-800 border border-surface-700 rounded-xl text-xs text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-surface-800 p-1 rounded-xl border border-surface-700">
          {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFilterDifficulty(d)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase transition-colors ${
                filterDifficulty === d ? 'bg-brand-600 text-white' : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className="text-left p-4 bg-surface-900 hover:bg-surface-800 border border-surface-800 hover:border-brand-500/40 rounded-2xl transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl mb-2">{t.icon}</div>
              <p className="text-sm font-bold text-surface-200 group-hover:text-brand-300 transition-colors">{t.name}</p>
              <p className="text-xs text-surface-500 mt-1 leading-relaxed line-clamp-2">{t.description}</p>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-800/60">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                t.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' :
                t.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-red-500/10 text-red-400'
              }`}>
                {t.difficulty.toUpperCase()}
              </span>
              <span className="text-[10px] text-surface-600 font-mono">{t.expectedDurationHours}h sim</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Sandbox Workspace ────────────────────────────────────

export function SandboxWorkspace() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [tab, setTab] = useState<SandboxTab>('builder');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<Partial<ScenarioConfig> | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const all = globalScenarioRunner.findAll();
    setScenarios(all);
    if (activeScenario) {
      const updated = all.find((s) => s.id === activeScenario.id);
      if (updated) setActiveScenario(updated);
    }
  }, [activeScenario]);

  useEffect(() => {
    const all = globalScenarioRunner.findAll();
    setScenarios(all);
    if (all.length > 0) {
      const firstCompleted = all.find((s) => s.status === 'completed') ?? all[0];
      setActiveScenario(firstCompleted);
      if (firstCompleted.status === 'completed') setTab('results');
    }
  }, []);

  const handleSelectTemplate = useCallback((tpl: ScenarioTemplate) => {
    setShowTemplatePicker(false);
    setPendingConfig({ ...tpl.defaultConfig, name: tpl.name, description: tpl.description });
    setTab('builder');
  }, []);

  const handleCreateScenario = useCallback((config: Omit<ScenarioConfig, 'id'>) => {
    const scenario = globalScenarioRunner.create(config);
    refresh();
    setActiveScenario(scenario);
    setTab('builder');
    setPendingConfig(null);
  }, [refresh]);

  const handleRun = useCallback((id: string) => {
    setRunningId(id);
    // Run synchronously (fast simulation) then update
    setTimeout(() => {
      const result = globalScenarioRunner.run(id);
      setRunningId(null);
      refresh();
      setActiveScenario(result);
      setTab('results');
    }, 1200);
  }, [refresh]);

  const handleDelete = useCallback((id: string) => {
    globalScenarioRunner.delete(id);
    if (activeScenario?.id === id) {
      setActiveScenario(null);
      setTab('builder');
    }
    refresh();
  }, [activeScenario, refresh]);

  const tabs: { id: SandboxTab; icon: React.FC<{className?: string}>; label: string }[] = [
    { id: 'builder', icon: Settings2, label: 'Configure' },
    { id: 'results', icon: BarChart3, label: 'Results' },
    { id: 'timeline', icon: Clock, label: 'Timeline' },
    { id: 'compare', icon: GitCompare, label: 'Compare' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* ── Left: Scenario List ────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 border-r border-surface-800 flex flex-col">
        <div className="px-4 py-4 border-b border-surface-800">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="w-5 h-5 text-brand-400" />
            <span className="font-bold text-surface-100 text-sm">Scenarios</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplatePicker(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> From Template
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {scenarios.length === 0 && (
            <div className="text-center py-12 px-4">
              <FlaskConical className="w-8 h-8 text-surface-700 mx-auto mb-2" />
              <p className="text-xs text-surface-600">No scenarios yet.</p>
              <p className="text-[10px] text-surface-700 mt-1">Pick a template to get started.</p>
            </div>
          )}
          {scenarios.map((s) => {
            const isActive = activeScenario?.id === s.id;
            const { icon: StatusIcon, color, label } = STATUS_CONFIG[s.status];
            return (
              <div
                key={s.id}
                className={`group flex items-start gap-2 px-3 py-3 rounded-xl cursor-pointer transition-colors ${isActive ? 'bg-brand-600/15 border border-brand-600/30' : 'hover:bg-surface-800'}`}
                onClick={() => { setActiveScenario(s); setTab(s.status === 'completed' ? 'results' : 'builder'); }}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${isActive ? 'text-brand-300' : 'text-surface-200'}`}>
                    {s.config.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <StatusIcon className={`w-3 h-3 ${color}`} />
                    <span className={`text-[10px] ${color}`}>{label}</span>
                    {s.result && <span className="text-[10px] text-surface-600">· {s.result.metrics.passRate}%</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {s.status === 'ready' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRun(s.id); }}
                      disabled={runningId !== null}
                      className="w-6 h-6 flex items-center justify-center bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30 disabled:opacity-50"
                    >
                      {runningId === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                    className="w-6 h-6 flex items-center justify-center text-surface-600 hover:text-red-400 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main Panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center justify-between border-b border-surface-800 px-6 bg-surface-950">
          <div className="flex">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  tab === id
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-surface-500 hover:text-surface-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {activeScenario && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-surface-200">{activeScenario.config.name}</p>
                <p className="text-[10px] text-surface-600">{activeScenario.config.standardId} · {activeScenario.config.sampleCount} samples</p>
              </div>
              {(activeScenario.status === 'ready' || activeScenario.status === 'draft') && (
                <button
                  onClick={() => handleRun(activeScenario.id)}
                  disabled={runningId !== null}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  {runningId === activeScenario.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {runningId === activeScenario.id ? 'Simulating…' : 'Run Simulation'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {tab === 'builder' && (
            <ScenarioBuilder
              pendingConfig={pendingConfig}
              onSave={handleCreateScenario}
            />
          )}
          {tab === 'results' && activeScenario?.result && (
            <ScenarioDashboard scenario={activeScenario} />
          )}
          {tab === 'results' && !activeScenario?.result && (
            <EmptyState icon={BarChart3} message="Run a simulation to see results here." />
          )}
          {tab === 'timeline' && activeScenario?.result && (
            <ScenarioTimeline scenario={activeScenario} />
          )}
          {tab === 'timeline' && !activeScenario?.result && (
            <EmptyState icon={Clock} message="Run a simulation to view the event timeline." />
          )}
          {tab === 'compare' && (
            <ScenarioComparison scenarios={scenarios} />
          )}
        </div>
      </div>

      {/* Template picker modal */}
      {showTemplatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
              <div>
                <p className="font-bold text-surface-100">Choose a Scenario Template</p>
                <p className="text-xs text-surface-500 mt-0.5">Select a pre-configured laboratory scenario</p>
              </div>
              <button onClick={() => setShowTemplatePicker(false)} className="text-surface-500 hover:text-surface-200 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <TemplatePicker onSelect={handleSelectTemplate} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.FC<{className?: string}>; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Icon className="w-12 h-12 text-surface-700 mb-3" />
      <p className="text-surface-500 text-sm">{message}</p>
    </div>
  );
}
