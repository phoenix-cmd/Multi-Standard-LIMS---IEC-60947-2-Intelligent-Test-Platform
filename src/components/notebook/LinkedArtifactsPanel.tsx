import React, { useState } from 'react';
import type { Notebook, ArtifactType } from '../../domain/notebook/NotebookTypes';
import { globalNotebookService } from '../../application/NotebookAppService';
import { Link2, Plus, ExternalLink, X } from 'lucide-react';

const TYPE_COLORS: Record<ArtifactType, string> = {
  sample: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  report: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  investigation: 'text-red-400 bg-red-400/10 border-red-400/20',
  equipment: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  workflow: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  thread: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  clause: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  formula: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  'ontology-node': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
};

const TYPE_ICONS: Record<ArtifactType, string> = {
  sample: '🧪', report: '📄', investigation: '🔬', equipment: '⚙️',
  workflow: '🔄', thread: '🧵', clause: '📜', formula: '𝑓',
  'ontology-node': '🕸️',
};

interface LinkArtifactDialogProps {
  onClose(): void;
  onLink(id: string, type: ArtifactType, title: string): void;
}

const DEMO_LINKABLE = [
  { id: 'SMP-001', type: 'sample' as ArtifactType, title: 'Havells MCCB 100A', subtitle: 'Report No. HAV-2024-001' },
  { id: 'RPT-001', type: 'report' as ArtifactType, title: 'Type Test Report HAV-2024-001', subtitle: 'IEC 60947-2' },
  { id: 'INV-001', type: 'investigation' as ArtifactType, title: 'Temperature Rise Anomaly', subtitle: 'Case #INV-001' },
  { id: 'EQ-001', type: 'equipment' as ArtifactType, title: 'Short Circuit Test Bench', subtitle: 'Cal. valid to 2025-06' },
  { id: 'WF-001', type: 'workflow' as ArtifactType, title: 'Standard Test Workflow v2', subtitle: 'IEC 60947-2' },
  { id: 'CL-8.3.4', type: 'clause' as ArtifactType, title: 'Clause 8.3.4 — Temperature Rise', subtitle: 'IEC 60947-2' },
];

function LinkDialog({ onClose, onLink }: LinkArtifactDialogProps) {
  const [query, setQuery] = useState('');
  const filtered = DEMO_LINKABLE.filter(
    (a) => a.title.toLowerCase().includes(query.toLowerCase()) || a.type.includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-800">
          <p className="font-bold text-surface-100 text-sm">Link Artifact</p>
          <button onClick={onClose} className="text-surface-500 hover:text-surface-200"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search samples, reports, investigations…"
            className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-xs text-surface-200 placeholder-surface-600 focus:outline-none focus:border-brand-500"
          />
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {filtered.map((a) => (
              <button
                key={`${a.type}-${a.id}`}
                onClick={() => { onLink(a.id, a.type, a.title); onClose(); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-800 text-left transition-colors"
              >
                <span className="text-base">{TYPE_ICONS[a.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-surface-200 truncate">{a.title}</p>
                  <p className="text-[10px] text-surface-500">{a.subtitle}</p>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${TYPE_COLORS[a.type]}`}>{a.type}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LinkedArtifactsPanelProps {
  notebook: Notebook;
  onUpdate(): void;
}

export function LinkedArtifactsPanel({ notebook, onUpdate }: LinkedArtifactsPanelProps) {
  const [showLink, setShowLink] = useState(false);

  const handleLink = async (id: string, type: ArtifactType, title: string) => {
    await globalNotebookService.linkArtifact(notebook.id, id, type, title, 'Engineer');
    onUpdate();
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-brand-400" />
          <p className="text-xs font-bold text-surface-300 uppercase tracking-wider">Linked Artifacts</p>
        </div>
        <button
          onClick={() => setShowLink(true)}
          className="flex items-center gap-1 px-2 py-1 bg-surface-800 hover:bg-surface-700 text-surface-400 hover:text-brand-300 text-xs rounded-lg border border-surface-700 transition-colors"
        >
          <Plus className="w-3 h-3" /> Link
        </button>
      </div>

      {notebook.linkedArtifacts.length === 0 ? (
        <div className="text-center py-8">
          <Link2 className="w-8 h-8 text-surface-700 mx-auto mb-2" />
          <p className="text-xs text-surface-600">No artifacts linked yet.</p>
          <p className="text-[10px] text-surface-700 mt-1">Link samples, reports, and investigations for full traceability.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notebook.linkedArtifacts.map((artifact) => (
            <div
              key={`${artifact.type}-${artifact.id}`}
              className="flex items-center gap-2.5 p-2.5 bg-surface-900 rounded-xl border border-surface-800 group hover:border-surface-700 transition-colors"
            >
              <span className="text-base flex-shrink-0">{TYPE_ICONS[artifact.type as ArtifactType] ?? '📎'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-surface-200 truncate">{artifact.title}</p>
                {artifact.subtitle && <p className="text-[10px] text-surface-500 truncate">{artifact.subtitle}</p>}
                <p className="text-[10px] text-surface-600 mt-0.5">
                  {new Date(artifact.linkedAt).toLocaleDateString()}
                  {artifact.linkedBy && ` · ${artifact.linkedBy}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${TYPE_COLORS[artifact.type as ArtifactType]}`}>
                  {artifact.type}
                </span>
                <ExternalLink className="w-3 h-3 text-surface-700 group-hover:text-surface-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {showLink && (
        <LinkDialog
          onClose={() => setShowLink(false)}
          onLink={handleLink}
        />
      )}
    </div>
  );
}
