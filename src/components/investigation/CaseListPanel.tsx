import React from 'react';
import type { InvestigationCase } from '../../investigation/CaseTypes';
import { FolderOpen, Plus, User, Clock, AlertTriangle } from 'lucide-react';

interface CaseListPanelProps {
  cases: InvestigationCase[];
  activeCaseId: string;
  onSelectCase: (id: string) => void;
}

export function CaseListPanel({ cases, activeCaseId, onSelectCase }: CaseListPanelProps) {
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-surface-400 uppercase tracking-wide">Investigation Cases</p>
        <span className="text-[10px] bg-brand-600/20 text-brand-400 font-bold px-2 py-0.5 rounded-full border border-brand-500/30">
          {cases.length} Active
        </span>
      </div>

      <div className="space-y-2">
        {cases.map((c) => {
          const isActive = c.id === activeCaseId;
          return (
            <div
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isActive
                  ? 'bg-red-500/10 border-red-500/40 ring-1 ring-red-500/30'
                  : 'bg-surface-900 border-surface-800 hover:border-surface-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-red-400">{c.id}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-800 text-surface-400">Cl. {c.clauseId}</span>
              </div>

              <p className="text-xs font-bold text-surface-100 line-clamp-2 leading-snug mb-2">{c.title}</p>

              <div className="flex items-center justify-between text-[10px] text-surface-400 border-t border-surface-800/60 pt-2">
                <span className="flex items-center gap-1"><User className="w-3 h-3 text-surface-500" /> {c.leadEngineer.split(' ')[1]}</span>
                <span>{c.evidence.length} Evidences</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
