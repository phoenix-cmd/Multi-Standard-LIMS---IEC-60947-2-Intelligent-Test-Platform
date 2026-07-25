import React from 'react';
import { useEngineering } from '../../context/EngineeringContext';
import { COMPONENT_KNOWLEDGE } from '../../engineering/knowledge/ComponentDatabase';
import { X, AlertTriangle, CheckCircle2, Wrench, BookOpen, RotateCcw } from 'lucide-react';

export function ComponentInspector() {
  const { selectedComponentId, setSelectedComponentId, twinState, sendMessage, setHighlightedClauseId } = useEngineering();

  if (!selectedComponentId) return null;

  const comp = twinState[selectedComponentId];
  if (!comp) return null;

  const knowledge = COMPONENT_KNOWLEDGE[selectedComponentId];
  const criticalityColor: Record<string, string> = {
    critical: 'text-red-400 bg-red-500/10 border-red-500/30',
    high:     'text-amber-400 bg-amber-500/10 border-amber-500/30',
    medium:   'text-blue-400 bg-blue-500/10 border-blue-500/30',
    low:      'text-surface-400 bg-surface-700 border-surface-600',
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface-900 border-l border-surface-700 flex flex-col z-10 shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-800 flex items-start justify-between flex-shrink-0">
        <div className="flex-1 min-w-0 mr-2">
          <p className="text-xs font-bold text-surface-100 leading-tight">{comp.name}</p>
          <p className="text-[10px] text-surface-500 mt-0.5">Component Inspector</p>
        </div>
        <button
          onClick={() => setSelectedComponentId(null)}
          className="w-6 h-6 rounded flex items-center justify-center text-surface-500 hover:text-surface-200 hover:bg-surface-700 flex-shrink-0 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Status & Health */}
        <div className="p-4 border-b border-surface-800">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Health', value: `${comp.health}%`, color: comp.health >= 80 ? 'text-emerald-400' : comp.health >= 50 ? 'text-amber-400' : 'text-red-400' },
              { label: 'Wear', value: `${comp.wear}%`, color: 'text-surface-300' },
              { label: 'Temp', value: `${comp.temperature}°C`, color: comp.temperature > 70 ? 'text-red-400' : 'text-surface-300' },
              { label: 'Status', value: comp.status.charAt(0).toUpperCase() + comp.status.slice(1), color: comp.status === 'failure' ? 'text-red-400' : comp.status === 'testing' ? 'text-blue-400' : 'text-emerald-400' },
            ].map((item) => (
              <div key={item.label} className="bg-surface-800 rounded-lg px-3 py-2">
                <p className="text-[10px] text-surface-500 uppercase tracking-wide">{item.label}</p>
                <p className={`text-sm font-bold ${item.color} mt-0.5`}>{item.value}</p>
              </div>
            ))}
          </div>

          {comp.faultState && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{comp.faultState}</p>
            </div>
          )}
        </div>

        {knowledge && (
          <>
            {/* Criticality */}
            <div className="px-4 py-3 border-b border-surface-800">
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide mb-2">Criticality</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${criticalityColor[knowledge.criticalityLevel]}`}>
                <AlertTriangle className="w-3 h-3" />
                {knowledge.criticalityLevel.charAt(0).toUpperCase() + knowledge.criticalityLevel.slice(1)}
              </span>
            </div>

            {/* Material */}
            <div className="px-4 py-3 border-b border-surface-800">
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Material & Construction</p>
              <p className="text-xs text-surface-300 leading-relaxed">{knowledge.material}</p>
            </div>

            {/* Function */}
            <div className="px-4 py-3 border-b border-surface-800">
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Engineering Function</p>
              <p className="text-xs text-surface-300 leading-relaxed">{knowledge.function}</p>
            </div>

            {/* Failure Modes */}
            <div className="px-4 py-3 border-b border-surface-800">
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide mb-2">Known Failure Modes</p>
              <ul className="space-y-1.5">
                {knowledge.failureModes.map((fm, i) => (
                  <li key={i} className="flex gap-2 text-xs text-surface-400">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0" />
                    {fm}
                  </li>
                ))}
              </ul>
            </div>

            {/* Associated Clauses */}
            {knowledge.associatedClauses.length > 0 && (
              <div className="px-4 py-3 border-b border-surface-800">
                <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide mb-2">Associated IEC Clauses</p>
                <div className="flex flex-wrap gap-1.5">
                  {knowledge.associatedClauses.map((c) => (
                    <button
                      key={c}
                      onClick={() => setHighlightedClauseId(c)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-brand-600/20 text-brand-400 border border-brand-600/30 hover:bg-brand-600/40 transition-colors font-mono font-semibold"
                    >
                      Cl. {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Maintenance */}
            <div className="px-4 py-3 border-b border-surface-800">
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide mb-1.5">Maintenance Notes</p>
              <p className="text-xs text-surface-300 leading-relaxed">{knowledge.maintenanceNotes}</p>
            </div>

            {/* Lifespan */}
            <div className="px-4 py-3 border-b border-surface-800">
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide mb-1">Typical Lifespan</p>
              <p className="text-xs text-surface-300">{knowledge.typicalLifespan}</p>
            </div>

            {/* AI Actions */}
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide mb-2">Ask Copilot</p>
              <div className="space-y-1.5">
                {[
                  `What are the failure modes of the ${comp.shortName}?`,
                  `What is the replacement procedure for the ${comp.shortName}?`,
                  `Which clauses test the ${comp.shortName}?`,
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg bg-surface-800 text-surface-400 hover:bg-brand-600/20 hover:text-brand-400 transition-colors border border-surface-700 hover:border-brand-500/30"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
