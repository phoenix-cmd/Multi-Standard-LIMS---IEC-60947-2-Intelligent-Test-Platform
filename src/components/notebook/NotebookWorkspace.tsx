import React, { useState, useEffect, useCallback } from 'react';
import type { Notebook, NotebookPage } from '../../domain/notebook/NotebookTypes';
import { globalNotebookService } from '../../application/NotebookAppService';
import { globalNotebookTemplateEngine } from '../../intelligence/notebook/NotebookTemplateEngine';
import { NotebookEditor } from './NotebookEditor';
import { LinkedArtifactsPanel } from './LinkedArtifactsPanel';
import { NotebookTimeline } from './NotebookTimeline';
import { NotebookAIPanel } from './NotebookAIPanel';
import { TopHeader } from '../layout/TopHeader';
import {
  BookOpen, Plus, FileText, Layers, Clock, Link2, Brain,
  Search, Star, ChevronRight, ChevronDown, Trash2, BookMarked, X,
} from 'lucide-react';

// ── Seed data — run exactly once ─────────────────────────────
let _seeded = false;

async function seedIfEmpty() {
  const all = await globalNotebookService.getAll();
  if (all.length > 0 || _seeded) return all;
  _seeded = true;

  const n1 = await globalNotebookService.createNotebook(
    'Havells MCCB — Temperature Rise Investigation',
    'sample',
    'Dr. Arjun Mehta',
    { templateId: 'temperature-rise', tags: ['iec-60947-2', 'temperature'], contextId: 'SMP-001' }
  );
  await globalNotebookService.linkArtifact(n1.id, 'SMP-001', 'sample', 'Havells MCCB 100A', 'Dr. Arjun Mehta', 'Report No. HAV-2024-001');
  await globalNotebookService.linkArtifact(n1.id, 'RPT-001', 'report', 'Type Test Report HAV-2024-001', 'Dr. Arjun Mehta');

  await globalNotebookService.createNotebook(
    'Short Circuit Failure — Root Cause Analysis',
    'investigation',
    'Priya Sharma',
    { templateId: 'failure-investigation', tags: ['rca', 'short-circuit'] }
  );

  await globalNotebookService.createNotebook(
    'Q3 2024 Endurance Study',
    'project',
    'Dr. Arjun Mehta',
    { templateId: 'research-experiment', tags: ['endurance', 'q3-2024'] }
  );

  return globalNotebookService.getAll();
}

// ── Sub-components ────────────────────────────────────────────

type RightTab = 'artifacts' | 'timeline' | 'ai';

interface CreateDialogProps {
  onClose(): void;
  onCreate(title: string, context: string, templateId?: string): void;
}

function CreateNotebookDialog({ onClose, onCreate }: CreateDialogProps) {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('sample');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const templates = globalNotebookTemplateEngine.getAll();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
          <p className="font-bold text-surface-100">New Engineering Notebook</p>
          <button onClick={onClose} className="text-surface-500 hover:text-surface-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs text-surface-400 mb-1.5 font-semibold uppercase tracking-wide">Notebook Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Havells MCCB Temperature Rise Study"
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs text-surface-400 mb-1.5 font-semibold uppercase tracking-wide">Context</label>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 focus:outline-none focus:border-brand-500"
            >
              {(['sample','investigation','product','equipment','engineer','project','standard'] as const).map((c) => (
                <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-surface-400 mb-1.5 font-semibold uppercase tracking-wide">Start from Template (optional)</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              <button
                onClick={() => setSelectedTemplate('')}
                className={`text-left p-2.5 rounded-lg border text-sm transition-all ${selectedTemplate === '' ? 'border-brand-500 bg-brand-500/10 text-brand-300' : 'border-surface-700 text-surface-400 hover:border-surface-600'}`}
              >
                <div className="text-lg mb-0.5">📓</div>
                <div className="font-medium text-xs">Blank Notebook</div>
              </button>
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`text-left p-2.5 rounded-lg border text-sm transition-all ${selectedTemplate === t.id ? 'border-brand-500 bg-brand-500/10 text-brand-300' : 'border-surface-700 text-surface-400 hover:border-surface-600'}`}
                >
                  <div className="text-lg mb-0.5">{t.icon}</div>
                  <div className="font-medium text-xs">{t.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 px-6 pb-5">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-surface-700 text-surface-400 rounded-lg hover:bg-surface-800">Cancel</button>
          <button
            onClick={() => { if (title.trim()) { onCreate(title.trim(), context, selectedTemplate || undefined); onClose(); } }}
            disabled={!title.trim()}
            className="flex-1 px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
          >
            Create Notebook
          </button>
        </div>
      </div>
    </div>
  );
}

const CONTEXT_COLORS: Record<string, string> = {
  sample: 'text-blue-400',
  investigation: 'text-red-400',
  product: 'text-purple-400',
  equipment: 'text-orange-400',
  engineer: 'text-teal-400',
  project: 'text-yellow-400',
  standard: 'text-emerald-400',
};

const CONTEXT_ICONS: Record<string, string> = {
  sample: '🧪', investigation: '🔬', product: '📦',
  equipment: '⚙️', engineer: '👤', project: '🗂️', standard: '📜',
};

// ── Main Workspace ────────────────────────────────────────────

export function NotebookWorkspace() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNb, setActiveNb] = useState<Notebook | null>(null);
  const [activePage, setActivePage] = useState<NotebookPage | null>(null);
  const [expandedNbs, setExpandedNbs] = useState<Set<string>>(new Set());
  const [rightTab, setRightTab] = useState<RightTab>('ai');
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadNotebooks = useCallback(async () => {
    const all = await seedIfEmpty();
    setNotebooks(all);
    setActiveNb((prev) => prev ?? (all.length > 0 ? all[0] : null));
    setActivePage((prev) => prev ?? (all[0]?.pages[0] ?? null));
    setExpandedNbs((prev) => prev.size > 0 ? prev : new Set(all[0] ? [all[0].id] : []));
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // deliberately empty — runs only on mount

  useEffect(() => { loadNotebooks(); }, [loadNotebooks]);

  const refresh = useCallback(async () => {
    const all = await globalNotebookService.getAll();
    setNotebooks(all);
    if (activeNb) {
      const updated = all.find((n) => n.id === activeNb.id);
      if (updated) {
        setActiveNb(updated);
        if (activePage) {
          const updatedPage = updated.pages.find((p) => p.id === activePage.id);
          setActivePage(updatedPage ?? updated.pages[0] ?? null);
        }
      }
    }
  }, [activeNb, activePage]);

  const handleCreate = useCallback(async (title: string, context: string, templateId?: string) => {
    const nb = await globalNotebookService.createNotebook(
      title, context as Notebook['context'], 'Engineer',
      { templateId: templateId as import('../../domain/notebook/NotebookTypes').NotebookTemplateId | undefined }
    );
    await refresh();
    setActiveNb(nb);
    setActivePage(nb.pages[0] ?? null);
    setExpandedNbs((prev) => new Set([...prev, nb.id]));
  }, [refresh]);

  const handleAddPage = useCallback(async () => {
    if (!activeNb) return;
    const page = await globalNotebookService.addPage(activeNb.id, `Page ${activeNb.pages.length + 1}`, 'Engineer');
    await refresh();
    setActivePage(page);
  }, [activeNb, refresh]);

  const handleDelete = useCallback(async (id: string) => {
    await globalNotebookService.deleteNotebook(id);
    const all = await globalNotebookService.getAll();
    setNotebooks(all);
    if (activeNb?.id === id) {
      setActiveNb(all[0] ?? null);
      setActivePage(all[0]?.pages[0] ?? null);
    }
  }, [activeNb]);

  const filteredNbs = searchQuery
    ? notebooks.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.tags.some((t) => t.includes(searchQuery.toLowerCase()))
      )
    : notebooks;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-3">
          <BookOpen className="w-12 h-12 text-brand-400 mx-auto animate-pulse" />
          <p className="text-surface-400">Loading Engineering Notebook…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* ── Left Panel: Notebook Tree ───────────────────────── */}
      <aside className="w-64 flex-shrink-0 border-r border-surface-800 flex flex-col bg-surface-950">
        <div className="px-4 py-4 border-b border-surface-800">
          <div className="flex items-center gap-2 mb-3">
            <BookMarked className="w-5 h-5 text-brand-400" />
            <span className="font-bold text-surface-100 text-sm">Engineering Notebooks</span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-surface-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notebooks…"
              className="w-full pl-8 pr-3 py-1.5 bg-surface-800 border border-surface-700 rounded-lg text-xs text-surface-300 placeholder-surface-600 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredNbs.map((nb) => {
            const isExpanded = expandedNbs.has(nb.id);
            const isActive = activeNb?.id === nb.id;
            return (
              <div key={nb.id}>
                <div
                  className={`flex items-center gap-1.5 px-2 py-2 rounded-lg cursor-pointer group transition-colors ${isActive ? 'bg-brand-600/20 border border-brand-600/30' : 'hover:bg-surface-800'}`}
                >
                  <button
                    onClick={() => setExpandedNbs((prev) => {
                      const next = new Set(prev);
                      if (next.has(nb.id)) next.delete(nb.id); else next.add(nb.id);
                      return next;
                    })}
                    className="text-surface-500"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-base leading-none">{CONTEXT_ICONS[nb.context]}</span>
                  <button
                    className="flex-1 text-left min-w-0"
                    onClick={() => { setActiveNb(nb); setActivePage(nb.pages[0] ?? null); if (!expandedNbs.has(nb.id)) setExpandedNbs((p) => new Set([...p, nb.id])); }}
                  >
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-brand-300' : 'text-surface-200'}`}>{nb.title}</p>
                    <p className={`text-[10px] ${CONTEXT_COLORS[nb.context]}`}>{nb.context}</p>
                  </button>
                  <button onClick={() => handleDelete(nb.id)} className="opacity-0 group-hover:opacity-100 text-surface-600 hover:text-red-400 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="ml-6 mt-0.5 space-y-0.5">
                    {nb.pages.map((pg) => (
                      <button
                        key={pg.id}
                        onClick={() => { setActiveNb(nb); setActivePage(pg); }}
                        className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors ${activePage?.id === pg.id && activeNb?.id === nb.id ? 'text-brand-300 bg-brand-600/10' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'}`}
                      >
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{pg.title}</span>
                      </button>
                    ))}
                    {isActive && (
                      <button
                        onClick={handleAddPage}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-surface-600 hover:text-brand-400 hover:bg-surface-800 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Page</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-surface-800">
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Notebook
          </button>
        </div>
      </aside>

      {/* ── Center Panel: Editor ────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-3 border-b border-surface-800 flex items-center justify-between bg-surface-950">
          {activeNb ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{CONTEXT_ICONS[activeNb.context]}</span>
                <h2 className="font-bold text-surface-100 text-sm">{activeNb.title}</h2>
              </div>
              {activePage && <p className="text-xs text-surface-500 ml-7">📄 {activePage.title}</p>}
            </div>
          ) : (
            <p className="text-surface-500 text-sm">Select a notebook</p>
          )}
          <div className="flex items-center gap-2">
            {activeNb && (
              <div className="flex items-center gap-1">
                {activeNb.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-surface-800 text-brand-400 rounded text-[10px] font-mono">{tag}</span>
                ))}
              </div>
            )}
            <button
              onClick={handleAddPage}
              disabled={!activeNb}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Page
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeNb && activePage ? (
            <NotebookEditor
              notebook={activeNb}
              page={activePage}
              onUpdate={refresh}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-4">
                <BookOpen className="w-16 h-16 text-surface-700 mx-auto" />
                <p className="text-surface-500 text-sm">Select a notebook from the left panel</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold"
                >
                  + Create First Notebook
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel: Context ───────────────────────────── */}
      {activeNb && (
        <aside className="w-72 flex-shrink-0 border-l border-surface-800 flex flex-col bg-surface-950">
          {/* Tab bar */}
          <div className="flex border-b border-surface-800">
            {([
              { id: 'ai', icon: Brain, label: 'AI' },
              { id: 'artifacts', icon: Link2, label: 'Artifacts' },
              { id: 'timeline', icon: Clock, label: 'Timeline' },
            ] as { id: RightTab; icon: React.FC<{className?: string}>; label: string }[]).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setRightTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${rightTab === id ? 'border-brand-500 text-brand-400' : 'border-transparent text-surface-500 hover:text-surface-300'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {rightTab === 'ai' && <NotebookAIPanel notebook={activeNb} activePageId={activePage?.id} />}
            {rightTab === 'artifacts' && <LinkedArtifactsPanel notebook={activeNb} onUpdate={refresh} />}
            {rightTab === 'timeline' && <NotebookTimeline notebook={activeNb} />}
          </div>
        </aside>
      )}

      {showCreate && (
        <CreateNotebookDialog
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
