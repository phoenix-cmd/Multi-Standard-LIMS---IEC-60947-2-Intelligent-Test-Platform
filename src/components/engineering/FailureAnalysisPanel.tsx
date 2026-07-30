import React from 'react';
import { useEngineering } from '../../context/EngineeringContext';
import { useLIMS } from '../../context/LIMSContext';
import { AlertTriangle, TrendingDown, CheckCircle2, Zap } from 'lucide-react';
import { CLAUSE_HIGHLIGHT_MAP } from '../../engineering/viewer3d/HighlightEngine';
import { COMPONENT_KNOWLEDGE } from '../../engineering/knowledge/ComponentDatabase';

/** Convert camelCase or unknown IDs to a readable label. */
function humanizeComponentId(id: string, shortName?: string): string {
  if (shortName) return shortName;
  const knowledge = COMPONENT_KNOWLEDGE[id];
  if (knowledge) return knowledge.name;
  // Fallback: split camelCase → "Undervoltage Release"
  return id.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}


export function FailureAnalysisPanel() {
  const { activeSampleId, twinState, setHighlightedClauseId, sendMessage, highlightedClauseId } = useEngineering();
  const { samples } = useLIMS();

  const sample = samples.find((s) => s.id === activeSampleId) ?? samples[0];
  if (!sample) return null;

  const allResults = sample.testRuns.flatMap((r) => r.clauseResults);
  const failed = allResults.filter((r) => r.verdict === 'FAIL');
  const passed = allResults.filter((r) => r.verdict === 'PASS');

  // Failed components in twin
  const failedComponents = Object.values(twinState).filter((c) => c.status === 'failure');

  return (
    <div className="flex flex-col gap-3">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Clauses Passed', value: passed.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Clauses Failed', value: failed.length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Components Stressed', value: failedComponents.length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border p-3 text-center ${item.bg}`}>
            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
            <p className="text-[10px] text-surface-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Failed clauses */}
      {failed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-surface-300 uppercase tracking-wide">Failed Clause Analysis</p>
          {failed.map((r) => {
            const affectedComponents = CLAUSE_HIGHLIGHT_MAP[r.clauseId] || [];
            return (
              <div
                key={r.clauseId}
                className={`rounded-xl border p-3 cursor-pointer transition-all
                  ${highlightedClauseId === r.clauseId
                    ? 'bg-red-500/15 border-red-500/40'
                    : 'bg-surface-800 border-surface-700 hover:border-red-500/30'
                  }`}
                onClick={() => setHighlightedClauseId(highlightedClauseId === r.clauseId ? null : r.clauseId)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-red-400 font-mono">Cl. {r.clauseId}</span>
                    <span className="text-xs text-surface-300">{r.clauseTitle || r.clauseId}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold flex-shrink-0">FAIL</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-surface-900 rounded-lg px-2 py-1.5">
                    <p className="text-[9px] text-surface-500">Measured</p>
                    <p className="text-xs font-bold text-red-400">{r.measuredValue ?? '—'} {r.unit ?? ''}</p>
                  </div>
                  <div className="bg-surface-900 rounded-lg px-2 py-1.5">
                    <p className="text-[9px] text-surface-500">Limit</p>
                    <p className="text-xs font-bold text-surface-300">{r.limitValue ?? '—'} {r.unit ?? ''}</p>
                  </div>
                </div>

                {/* Affected components */}
                {affectedComponents.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] text-surface-500">Affects:</span>
                    {affectedComponents.slice(0, 3).map((cid) => (
                      <span key={cid} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-700 text-surface-400">
                        {humanizeComponentId(cid, twinState[cid]?.shortName)}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); sendMessage(`Why did clause ${r.clauseId} fail?`); }}
                  className="mt-2 w-full text-[10px] py-1.5 rounded-lg bg-surface-700 text-surface-400 hover:bg-brand-600/20 hover:text-brand-400 transition-colors border border-surface-600 hover:border-brand-500/30"
                >
                  Analyse with Copilot →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Passed clauses summary */}
      {passed.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-surface-300 uppercase tracking-wide">Passed Clauses</p>
          {passed.map((r) => (
            <div key={r.clauseId} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-xs font-mono font-bold text-emerald-400">Cl. {r.clauseId}</span>
              <span className="text-xs text-surface-400 flex-1 truncate">{r.clauseTitle || r.clauseId}</span>
              <span className="text-xs text-surface-500">{r.measuredValue} {r.unit}</span>
            </div>
          ))}
        </div>
      )}

      {allResults.length === 0 && (
        <div className="py-8 flex flex-col items-center text-center gap-2">
          <Zap className="w-8 h-8 text-surface-600" />
          <p className="text-sm text-surface-500">No test results for this sample.</p>
          <p className="text-xs text-surface-600">Run the Test Wizard to generate clause results.</p>
        </div>
      )}
    </div>
  );
}
