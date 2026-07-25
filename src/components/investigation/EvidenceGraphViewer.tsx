import React from 'react';
import type { InvestigationCase } from '../../investigation/CaseTypes';
import { globalEvidenceGraph } from '../../investigation/EvidenceGraph';
import { Layers, Activity, FileText, Cpu, Zap, ArrowRight } from 'lucide-react';

export function EvidenceGraphViewer({ caseData }: { caseData: InvestigationCase }) {
  const graph = globalEvidenceGraph.buildGraph(caseData.evidence);

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto">
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-surface-100">Interconnected Evidence Graph</h3>
          <p className="text-xs text-surface-400">Visual mapping linking failure evidence to physical 3D components and standard clauses</p>
        </div>
        <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-lg">
          {graph.nodes.length} Graph Nodes
        </span>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {caseData.evidence.map((item) => (
          <div key={item.id} className="bg-surface-900 border border-surface-800 rounded-xl p-4 space-y-3 hover:border-brand-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wide px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                {item.type.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-surface-500 font-mono">{item.id}</span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-surface-100">{item.title}</h4>
              <p className="text-[11px] text-surface-400 mt-1 leading-relaxed">{item.description}</p>
            </div>

            {item.measuredValue !== undefined && (
              <div className="bg-surface-950 rounded-lg p-2 flex items-center justify-between text-xs">
                <span className="text-surface-400">Measured Value</span>
                <span className="font-bold text-red-400">{item.measuredValue} {item.unit} (Limit: {item.limitValue} {item.unit})</span>
              </div>
            )}

            {/* Linked Nodes Badges */}
            <div className="flex items-center gap-2 pt-2 border-t border-surface-800 text-[10px]">
              {item.componentId && (
                <span className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-semibold">
                  <Cpu className="w-3 h-3" /> {item.componentId}
                </span>
              )}
              {item.clauseId && (
                <span className="flex items-center gap-1 text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-semibold">
                  <FileText className="w-3 h-3" /> Cl. {item.clauseId}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
