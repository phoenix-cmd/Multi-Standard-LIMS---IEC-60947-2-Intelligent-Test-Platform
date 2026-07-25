import React, { useState } from 'react';
import type { Scenario } from '../../sandbox/ScenarioTypes';
import { Clock, Filter } from 'lucide-react';

const SEVERITY_STYLES = {
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const SEVERITY_DOTS = {
  info: 'bg-blue-400',
  warning: 'bg-yellow-400',
  error: 'bg-red-400',
  success: 'bg-emerald-400',
};

const TYPE_ICONS: Record<string, string> = {
  'lab-open': '🏢', 'lab-close': '🔒', 'sample-received': '📦',
  'test-started': '▶️', 'test-completed': '✅', 'test-failed': '❌',
  'equipment-failure': '⚠️', 'equipment-repaired': '🔧',
  'calibration-expired': '📅', 'calibration-renewed': '✔️',
  'power-failure': '⚡', 'power-restored': '💡',
  'network-failure': '📡', 'network-restored': '🌐',
  'engineer-assigned': '👤', 'engineer-unavailable': '🚫',
  'workflow-triggered': '🔄', 'investigation-started': '🔬',
  'ai-recommendation': '🧠', 'emergency-shutdown': '🚨',
  'emergency-resolved': '✅', 'queue-backlog': '📋',
  'bottleneck-detected': '🚧', 'scenario-complete': '🏁',
};

interface ScenarioTimelineProps {
  scenario: Scenario;
}

export function ScenarioTimeline({ scenario }: ScenarioTimelineProps) {
  const { events } = scenario.result!;
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'success'>('all');

  const filtered = filter === 'all' ? events : events.filter((e) => e.severity === filter);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-surface-800 flex-shrink-0">
        <Filter className="w-4 h-4 text-surface-500" />
        <span className="text-xs text-surface-500 font-semibold uppercase tracking-wide">Filter:</span>
        {(['all', 'error', 'warning', 'success'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filter === s ? 'bg-brand-600 text-white' : 'text-surface-500 hover:text-surface-300'}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-xs text-surface-600">{filtered.length} events</span>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="relative">
          {/* Vertical guide line */}
          <div className="absolute left-[72px] top-0 bottom-0 w-px bg-surface-800" />

          <div className="space-y-3">
            {filtered.map((ev) => (
              <div key={ev.id} className="flex items-start gap-4">
                {/* Time label */}
                <div className="w-16 flex-shrink-0 text-right">
                  <p className="text-[10px] font-mono text-surface-600 leading-none mt-1.5">
                    {String(Math.floor(ev.simHour)).padStart(2, '0')}:
                    {String(Math.round((ev.simHour % 1) * 60)).padStart(2, '0')}
                  </p>
                  <p className="text-[9px] text-surface-700 mt-0.5">h{Math.floor(ev.simHour)}</p>
                </div>

                {/* Node */}
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-surface-900 border border-surface-700 text-base flex-shrink-0 mt-0.5">
                  <span>{TYPE_ICONS[ev.type] ?? '●'}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 mt-0.5">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-surface-200">{ev.title}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase ${SEVERITY_STYLES[ev.severity]}`}>
                          {ev.severity}
                        </span>
                        {ev.sampleId && (
                          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                            {ev.sampleId}
                          </span>
                        )}
                        {ev.equipmentId && (
                          <span className="text-[10px] font-mono bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20">
                            {ev.equipmentId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-500 mt-0.5">{ev.detail}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${SEVERITY_DOTS[ev.severity]}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
