import React from 'react';
import { useEngineering } from '../../context/EngineeringContext';
import { COMPONENT_KNOWLEDGE } from '../../engineering/knowledge/ComponentDatabase';
import type { ComponentState, ComponentStatus } from '../../engineering/digital-twin/TwinState';
import { CLAUSE_HIGHLIGHT_MAP } from '../../engineering/viewer3d/HighlightEngine';
import { AlertTriangle, CheckCircle2, Wrench, Activity, Zap, ThermometerIcon } from 'lucide-react';

const STATUS_CONFIG: Record<ComponentStatus, { label: string; color: string; bg: string; Icon: React.FC<{ className?: string }> }> = {
  normal:      { label: 'Normal',      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', Icon: CheckCircle2 },
  testing:     { label: 'Testing',     color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',       Icon: Activity },
  warning:     { label: 'Warning',     color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',    Icon: AlertTriangle },
  failure:     { label: 'Failure',     color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',        Icon: AlertTriangle },
  selected:    { label: 'Selected',    color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20',      Icon: Zap },
  maintenance: { label: 'Maintenance', color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20', Icon: Wrench },
  hovered:     { label: 'Highlighted', color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20',       Icon: Activity },
};

function HealthBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function ComponentCard({ comp }: { comp: ComponentState }) {
  const { selectedComponentId, setSelectedComponentId, setHighlightedClauseId } = useEngineering();
  const cfg = STATUS_CONFIG[comp.status] || STATUS_CONFIG.normal;
  const Icon = cfg.Icon;
  const knowledge = COMPONENT_KNOWLEDGE[comp.id];
  const isSelected = selectedComponentId === comp.id;

  const healthColor =
    comp.health >= 80 ? 'bg-emerald-500' : comp.health >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div
      onClick={() => {
        setSelectedComponentId(isSelected ? null : comp.id);
        if (!isSelected && knowledge?.associatedClauses[0]) {
          setHighlightedClauseId(knowledge.associatedClauses[0]);
        }
      }}
      className={`
        relative cursor-pointer rounded-xl p-3 border transition-all duration-200
        ${isSelected
          ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/40'
          : `${cfg.bg} hover:scale-[1.02]`
        }
      `}
    >
      {/* Status flash for failure */}
      {comp.status === 'failure' && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}
      {comp.status === 'testing' && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
      )}

      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-bold text-surface-100 leading-tight">{comp.shortName}</p>
        <span className={`flex items-center gap-1 text-[10px] font-semibold ${cfg.color}`}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>

      {/* Health bar */}
      <HealthBar value={comp.health} color={healthColor} />

      <div className="flex justify-between mt-1.5">
        <span className="text-[9px] text-surface-500">Health {comp.health}%</span>
        <span className="text-[9px] text-surface-500">Wear {comp.wear}%</span>
      </div>

      {comp.faultState && (
        <p className="mt-1.5 text-[9px] text-red-400 font-medium truncate">{comp.faultState}</p>
      )}

      {/* Linked clauses */}
      {knowledge && knowledge.associatedClauses.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {knowledge.associatedClauses.slice(0, 2).map((c) => (
            <button
              key={c}
              onClick={(e) => { e.stopPropagation(); setHighlightedClauseId(c); }}
              className="text-[9px] px-1.5 py-0.5 rounded bg-surface-700 text-surface-400 hover:bg-brand-600/30 hover:text-brand-400 transition-colors"
            >
              Cl. {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ClauseFilter() {
  const { highlightedClauseId, setHighlightedClauseId } = useEngineering();
  const clauses = Object.keys(CLAUSE_HIGHLIGHT_MAP);

  return (
    <div className="flex gap-1.5 flex-wrap">
      {clauses.map((c) => (
        <button
          key={c}
          onClick={() => setHighlightedClauseId(highlightedClauseId === c ? null : c)}
          className={`text-xs px-2.5 py-1 rounded-lg border transition-all font-mono font-semibold
            ${highlightedClauseId === c
              ? 'bg-brand-600 border-brand-500 text-white'
              : 'bg-surface-800 border-surface-700 text-surface-400 hover:border-brand-500/50 hover:text-brand-400'
            }`}
        >
          {c}
        </button>
      ))}
      {highlightedClauseId && (
        <button
          onClick={() => setHighlightedClauseId(null)}
          className="text-xs px-2.5 py-1 rounded-lg border bg-surface-800 border-surface-700 text-surface-500 hover:text-surface-300 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}

export function DigitalTwinPanel() {
  const { twinState, overallHealth, highlightedClauseId } = useEngineering();
  const components = Object.values(twinState);
  const failureCount = components.filter((c) => c.status === 'failure').length;
  const testingCount = components.filter((c) => c.status === 'testing').length;

  const healthColor = overallHealth >= 80 ? 'text-emerald-400' : overallHealth >= 60 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-surface-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-surface-100">Digital Twin</h3>
            <p className="text-xs text-surface-500">MCCB Component State</p>
          </div>
          <div className="text-right">
            <p className={`text-xl font-black ${healthColor}`}>{overallHealth}%</p>
            <p className="text-[10px] text-surface-500">Overall Health</p>
          </div>
        </div>

        {/* Status summary bar */}
        <div className="flex gap-2 mb-3">
          {failureCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {failureCount} Failure{failureCount > 1 ? 's' : ''}
            </span>
          )}
          {testingCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              {testingCount} Testing
            </span>
          )}
          {failureCount === 0 && testingCount === 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
              All Systems Normal
            </span>
          )}
        </div>

        {/* Clause filter */}
        <div>
          <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide mb-1.5">
            Highlight by Clause
          </p>
          <ClauseFilter />
        </div>
      </div>

      {/* Component grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-1 gap-2">
          {components.map((comp) => (
            <ComponentCard key={comp.id} comp={comp} />
          ))}
        </div>
      </div>
    </div>
  );
}
