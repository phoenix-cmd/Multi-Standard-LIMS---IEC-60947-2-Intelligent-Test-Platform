import React, { useState } from 'react';
import { useLIMS } from '../../context/LIMSContext';
import { BookOpen, CheckCircle2, Download, ToggleLeft, ToggleRight, Plus, X } from 'lucide-react';
import type { StandardMetadata } from '../../types';

export function StandardManagerView() {
  const { standards, activateStandard, installStandard } = useLIMS();
  const [customStandards, setCustomStandards] = useState<StandardMetadata[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [scope, setScope] = useState('');
  const [revision, setRevision] = useState('2026');

  const allStandards = [...standards, ...customStandards];

  const handleAddStandard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newStd: StandardMetadata = {
      id,
      name,
      scope,
      installed: true,
      active: false,
      activeRevision: revision,
      revisions: [{ version: revision, label: `Ed 1.0 (${revision})`, publishedDate: new Date().toISOString().split('T')[0] }],
    };

    setCustomStandards((prev) => [...prev, newStd]);
    setName('');
    setScope('');
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="card p-4 bg-brand-600/5 border-brand-600/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-brand-400" />
            <p className="text-sm font-semibold text-brand-400">Standard Plugin Manager</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Standard Package
          </button>
        </div>
        <p className="text-xs text-surface-400 mt-1">
          Install, activate, and version-manage electrical testing standards as plugins.
          Each standard provides its own clauses, formulas, sequences, form schemas, and report templates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allStandards.map((std) => (
          <div key={std.id} className={`card p-4 ${std.active ? 'border-brand-500/40 bg-brand-600/5' : ''}`}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-surface-100">{std.name}</p>
                  {std.active && <span className="badge-pass text-[10px]"><CheckCircle2 className="w-3 h-3" /> Active</span>}
                  {!std.installed && <span className="badge-na text-[10px]">Not Installed</span>}
                </div>
                <p className="text-xs text-surface-400 mt-0.5">{std.scope}</p>
              </div>
            </div>

            {/* Revisions */}
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide">Revisions</p>
              <div className="flex flex-wrap gap-1.5">
                {std.revisions.map((r) => (
                  <span
                    key={r.version}
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${r.version === std.activeRevision ? 'bg-brand-600/20 border-brand-600/40 text-brand-400' : 'border-surface-700 text-surface-500'}`}
                  >
                    {r.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {!std.installed ? (
                <button className="btn-primary text-xs py-1.5" onClick={() => installStandard(std.id)}>
                  <Download className="w-3.5 h-3.5" /> Install
                </button>
              ) : std.active ? (
                <button className="btn-secondary text-xs py-1.5" disabled>
                  <ToggleRight className="w-3.5 h-3.5 text-brand-400" /> Active
                </button>
              ) : (
                <button className="btn-primary text-xs py-1.5" onClick={() => activateStandard(std.id)}>
                  <ToggleLeft className="w-3.5 h-3.5" /> Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <h3 className="text-sm font-bold text-surface-50 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-400" /> Add Custom Standard Package
              </h3>
              <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-surface-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStandard} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wide mb-1">Standard Code & Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. IEEE 1584 Arc Flash Standard"
                  required
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wide mb-1">Scope & Description</label>
                <textarea
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="Scope of testing and compliance evaluation..."
                  rows={2}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wide mb-1">Revision Year</label>
                <input
                  type="text"
                  value={revision}
                  onChange={(e) => setRevision(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-100 font-mono"
                />
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
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold shadow"
                >
                  Register Plugin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
