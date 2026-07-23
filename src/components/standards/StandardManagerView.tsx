import { useLIMS } from '../../context/LIMSContext';
import { BookOpen, CheckCircle2, Download, ToggleLeft, ToggleRight, Plus } from 'lucide-react';

export function StandardManagerView() {
  const { standards, activateStandard, installStandard } = useLIMS();

  return (
    <div className="space-y-4">
      <div className="card p-4 bg-brand-600/5 border-brand-600/20">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-brand-400" />
          <p className="text-sm font-semibold text-brand-400">Standard Plugin Manager</p>
        </div>
        <p className="text-xs text-surface-400">
          Install, activate, and version-manage electrical testing standards as plugins.
          Each standard provides its own clauses, formulas, sequences, form schemas, and report templates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {standards.map((std) => (
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

        {/* Add new standard */}
        <button className="card p-4 border-dashed border-surface-700 hover:border-brand-600/40 flex items-center justify-center gap-3 text-surface-500 hover:text-brand-400 transition-colors">
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Upload Custom Standard Package</span>
        </button>
      </div>
    </div>
  );
}
