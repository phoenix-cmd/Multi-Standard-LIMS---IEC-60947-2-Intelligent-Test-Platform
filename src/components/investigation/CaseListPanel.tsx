import React, { useState } from 'react';
import type { InvestigationCase } from '../../investigation/CaseTypes';
import { FolderOpen, Plus, User, Clock, AlertTriangle, X } from 'lucide-react';

interface CaseListPanelProps {
  cases: InvestigationCase[];
  activeCaseId: string;
  onSelectCase: (id: string) => void;
  onCreateCase: (title: string, clauseId: string, leadEngineer: string) => void;
}

export function CaseListPanel({ cases, activeCaseId, onSelectCase, onCreateCase }: CaseListPanelProps) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [clauseId, setClauseId] = useState('8.3.3.1');
  const [leadEngineer, setLeadEngineer] = useState('Priya Sharma');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateCase(title, clauseId, leadEngineer);
    setTitle('');
    setShowModal(false);
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-surface-400 uppercase tracking-wide">Investigation Cases</p>
        <button
          onClick={() => setShowModal(true)}
          className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors px-2"
        >
          <Plus className="w-3.5 h-3.5" /> New Case
        </button>
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
                <span className="flex items-center gap-1"><User className="w-3 h-3 text-surface-500" /> {c.leadEngineer}</span>
                <span>{c.evidence.length} Evidences</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <h3 className="text-sm font-bold text-surface-50 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Create Root Cause Investigation
              </h3>
              <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-surface-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wide mb-1">Investigation Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dielectric Breakdown at 2.5kV"
                  required
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wide mb-1">IEC Clause</label>
                  <input
                    type="text"
                    value={clauseId}
                    onChange={(e) => setClauseId(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wide mb-1">Lead Engineer</label>
                  <input
                    type="text"
                    value={leadEngineer}
                    onChange={(e) => setLeadEngineer(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-surface-800 text-surface-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
