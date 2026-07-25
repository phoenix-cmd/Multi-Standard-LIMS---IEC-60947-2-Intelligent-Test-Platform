import React, { useState, useRef, useCallback } from 'react';
import type {
  Notebook,
  NotebookPage,
  NotebookBlock,
  NotebookBlockType,
  TextBlockContent,
  HeadingBlockContent,
  FormulaBlockContent,
  CodeBlockContent,
  ChecklistBlockContent,
  MeasurementBlockContent,
  TableBlockContent,
  AIConversationBlockContent,
} from '../../domain/notebook/NotebookTypes';
import { globalNotebookService } from '../../application/NotebookAppService';
import { globalNotebookRepository } from '../../domain/notebook/NotebookRepository';
import {
  Type, Heading, Image, CheckSquare, FunctionSquare, Code2,
  BarChart2, Table, Link2, Bot, PenLine, Plus, GripVertical,
  Trash2, ChevronUp, ChevronDown,
} from 'lucide-react';

// ── Block type picker ─────────────────────────────────────────

const BLOCK_TYPES: { type: NotebookBlockType; icon: React.FC<{className?: string}>; label: string; defaultContent: () => object }[] = [
  { type: 'text', icon: Type, label: 'Text', defaultContent: () => ({ markdown: '' } as TextBlockContent) },
  { type: 'heading', icon: Heading, label: 'Heading', defaultContent: () => ({ text: 'New Section', level: 2 } as HeadingBlockContent) },
  { type: 'formula', icon: FunctionSquare, label: 'Formula', defaultContent: () => ({ expression: '', description: '' } as FormulaBlockContent) },
  { type: 'code', icon: Code2, label: 'Code', defaultContent: () => ({ language: 'python', code: '' } as CodeBlockContent) },
  { type: 'checklist', icon: CheckSquare, label: 'Checklist', defaultContent: () => ({ items: [] } as ChecklistBlockContent) },
  { type: 'measurement', icon: BarChart2, label: 'Measurements', defaultContent: () => ({ headers: ['Parameter', 'Value', 'Unit', 'Limit', 'Status'], rows: [] } as MeasurementBlockContent) },
  { type: 'table', icon: Table, label: 'Table', defaultContent: () => ({ headers: ['Column A', 'Column B'], rows: [] } as TableBlockContent) },
  { type: 'ai-conversation', icon: Bot, label: 'AI Chat', defaultContent: () => ({ messages: [] } as AIConversationBlockContent) },
  { type: 'sketch', icon: PenLine, label: 'Sketch', defaultContent: () => ({ svgData: '', description: '' }) },
  { type: 'investigation-link', icon: Link2, label: 'Link', defaultContent: () => ({ refId: '', title: '', refType: 'report' }) },
];

// ── Individual block renderers ────────────────────────────────

function TextBlockEditor({ block, onChange }: { block: NotebookBlock; onChange(c: object): void }) {
  const content = block.content as TextBlockContent;
  return (
    <textarea
      defaultValue={content.markdown}
      onBlur={(e) => onChange({ markdown: e.target.value })}
      rows={4}
      placeholder="Start writing in Markdown…"
      className="w-full bg-transparent border-none outline-none resize-none text-sm text-surface-200 placeholder-surface-600 font-mono leading-relaxed"
    />
  );
}

function HeadingBlockEditor({ block, onChange }: { block: NotebookBlock; onChange(c: object): void }) {
  const content = block.content as HeadingBlockContent;
  const sizes: Record<number, string> = { 1: 'text-2xl', 2: 'text-xl', 3: 'text-lg' };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {([1, 2, 3] as const).map((l) => (
          <button
            key={l}
            onClick={() => onChange({ ...content, level: l })}
            className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${content.level === l ? 'bg-brand-600 text-white' : 'text-surface-500 hover:text-surface-300'}`}
          >
            H{l}
          </button>
        ))}
      </div>
      <input
        defaultValue={content.text}
        onBlur={(e) => onChange({ ...content, text: e.target.value })}
        className={`w-full bg-transparent border-none outline-none font-bold text-surface-100 ${sizes[content.level]} placeholder-surface-600`}
        placeholder="Section heading…"
      />
    </div>
  );
}

function FormulaBlockEditor({ block, onChange }: { block: NotebookBlock; onChange(c: object): void }) {
  const content = block.content as FormulaBlockContent;
  return (
    <div className="bg-surface-800/50 rounded-xl p-4 space-y-2 border border-surface-700">
      <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
        <FunctionSquare className="w-3.5 h-3.5" />
        Formula / Expression
      </div>
      <input
        defaultValue={content.expression}
        onBlur={(e) => onChange({ ...content, expression: e.target.value })}
        placeholder="e.g. ΔT = T_measured − T_ambient"
        className="w-full bg-surface-900 border border-purple-500/30 rounded-lg px-3 py-2 text-sm font-mono text-purple-300 placeholder-surface-600 focus:outline-none focus:border-purple-400"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          defaultValue={content.description}
          onBlur={(e) => onChange({ ...content, description: e.target.value })}
          placeholder="Description"
          className="px-3 py-1.5 bg-surface-900 border border-surface-700 rounded-lg text-xs text-surface-300 placeholder-surface-600 focus:outline-none"
        />
        <input
          defaultValue={content.result}
          onBlur={(e) => onChange({ ...content, result: e.target.value })}
          placeholder="Result (optional)"
          className="px-3 py-1.5 bg-surface-900 border border-surface-700 rounded-lg text-xs text-surface-300 placeholder-surface-600 focus:outline-none"
        />
      </div>
    </div>
  );
}

function CodeBlockEditor({ block, onChange }: { block: NotebookBlock; onChange(c: object): void }) {
  const content = block.content as CodeBlockContent;
  const langs = ['python', 'typescript', 'javascript', 'bash', 'sql', 'r', 'matlab', 'json'];
  return (
    <div className="bg-surface-900 rounded-xl border border-surface-700 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-surface-800 border-b border-surface-700">
        <select
          value={content.language}
          onChange={(e) => onChange({ ...content, language: e.target.value })}
          className="bg-transparent text-xs text-surface-400 focus:outline-none"
        >
          {langs.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <Code2 className="w-3.5 h-3.5 text-surface-500" />
      </div>
      <textarea
        defaultValue={content.code}
        onBlur={(e) => onChange({ ...content, code: e.target.value })}
        rows={6}
        spellCheck={false}
        placeholder="# Enter code here…"
        className="w-full bg-transparent p-3 text-sm font-mono text-green-300 placeholder-surface-600 resize-none focus:outline-none"
      />
    </div>
  );
}

function ChecklistBlockEditor({ block, onChange }: { block: NotebookBlock; onChange(c: object): void }) {
  const content = block.content as ChecklistBlockContent;
  const [items, setItems] = useState(content.items);

  const toggle = (id: string) => {
    const updated = items.map((it) => it.id === id ? { ...it, checked: !it.checked } : it);
    setItems(updated);
    onChange({ items: updated });
  };

  const addItem = () => {
    const updated = [...items, { id: Math.random().toString(36).slice(2), text: 'New item', checked: false }];
    setItems(updated);
    onChange({ items: updated });
  };

  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <button
            onClick={() => toggle(item.id)}
            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-surface-600'}`}
          >
            {item.checked && <span className="text-[10px]">✓</span>}
          </button>
          <span className={`text-sm flex-1 ${item.checked ? 'line-through text-surface-600' : 'text-surface-300'}`}>{item.text}</span>
        </div>
      ))}
      <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 mt-1">
        <Plus className="w-3 h-3" /> Add item
      </button>
    </div>
  );
}

function MeasurementBlockEditor({ block, onChange }: { block: NotebookBlock; onChange(c: object): void }) {
  const content = block.content as MeasurementBlockContent;
  const [rows, setRows] = useState(content.rows);

  const addRow = () => {
    const updated = [...rows, { values: content.headers.map(() => '') }];
    setRows(updated);
    onChange({ ...content, rows: updated });
  };

  const updateCell = (ri: number, ci: number, val: string) => {
    const updated = rows.map((r, i) => i === ri ? { values: r.values.map((v, j) => j === ci ? val : v) } : r);
    setRows(updated);
    onChange({ ...content, rows: updated });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-surface-800">
            {content.headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-surface-400 font-semibold border border-surface-700 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-surface-800/50">
              {row.values.map((cell, ci) => (
                <td key={ci} className="border border-surface-700 p-0">
                  <input
                    value={String(cell)}
                    onChange={(e) => updateCell(ri, ci, e.target.value)}
                    className="w-full px-3 py-2 bg-transparent text-surface-200 focus:outline-none focus:bg-surface-800"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow} className="mt-2 flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300">
        <Plus className="w-3 h-3" /> Add row
      </button>
    </div>
  );
}

function TableBlockEditor({ block, onChange }: { block: NotebookBlock; onChange(c: object): void }) {
  const content = block.content as TableBlockContent;
  const [rows, setRows] = useState(content.rows);

  const addRow = () => {
    const updated = [...rows, content.headers.map(() => '')];
    setRows(updated);
    onChange({ ...content, rows: updated });
  };

  const update = (ri: number, ci: number, val: string) => {
    const updated = rows.map((r, i) => i === ri ? r.map((v, j) => j === ci ? val : v) : r);
    setRows(updated);
    onChange({ ...content, rows: updated });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-surface-800">
            {content.headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-surface-400 font-semibold border border-surface-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className="border border-surface-700 p-0">
                  <input
                    value={cell}
                    onChange={(e) => update(ri, ci, e.target.value)}
                    className="w-full px-3 py-2 bg-transparent text-surface-200 focus:outline-none focus:bg-surface-800"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow} className="mt-2 flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300">
        <Plus className="w-3 h-3" /> Add row
      </button>
    </div>
  );
}

function BlockRenderer({ block, onChange }: { block: NotebookBlock; onChange(c: object): void }) {
  switch (block.type) {
    case 'text': return <TextBlockEditor block={block} onChange={onChange} />;
    case 'heading': return <HeadingBlockEditor block={block} onChange={onChange} />;
    case 'formula': return <FormulaBlockEditor block={block} onChange={onChange} />;
    case 'code': return <CodeBlockEditor block={block} onChange={onChange} />;
    case 'checklist': return <ChecklistBlockEditor block={block} onChange={onChange} />;
    case 'measurement': return <MeasurementBlockEditor block={block} onChange={onChange} />;
    case 'table': return <TableBlockEditor block={block} onChange={onChange} />;
    case 'ai-conversation': {
      const content = block.content as AIConversationBlockContent;
      return (
        <div className="space-y-2">
          {content.messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-300'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {content.messages.length === 0 && <p className="text-xs text-surface-600 italic">AI conversation will appear here when triggered from the AI panel.</p>}
        </div>
      );
    }
    default:
      return <p className="text-xs text-surface-600 italic">{block.type} block — content rendered inline.</p>;
  }
}

// ── Block item with controls ──────────────────────────────────

interface BlockItemProps {
  block: NotebookBlock;
  notebook: Notebook;
  page: NotebookPage;
  onUpdate(): void;
  onMoveUp(): void;
  onMoveDown(): void;
  onDelete(): void;
  isFirst: boolean;
  isLast: boolean;
}

function BlockItem({ block, notebook, page, onUpdate, onMoveUp, onMoveDown, onDelete, isFirst, isLast }: BlockItemProps) {
  const [hovered, setHovered] = useState(false);

  const handleChange = useCallback(async (content: object) => {
    await globalNotebookService.updateBlock(notebook.id, page.id, block.id, content as never, 'Engineer');
    onUpdate();
  }, [notebook.id, page.id, block.id, onUpdate]);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div className="absolute -left-8 top-1 flex flex-col gap-0.5 z-10">
          <div className="w-6 h-6 flex items-center justify-center text-surface-600 cursor-grab">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
      <div className={`rounded-xl border transition-colors p-4 ${hovered ? 'border-surface-600 bg-surface-900/50' : 'border-transparent'}`}>
        <BlockRenderer block={block} onChange={handleChange} />
      </div>
      {hovered && (
        <div className="absolute -right-2 top-1 flex flex-col gap-0.5 z-10">
          <button onClick={onMoveUp} disabled={isFirst} className="w-6 h-6 flex items-center justify-center text-surface-600 hover:text-surface-300 disabled:opacity-30">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="w-6 h-6 flex items-center justify-center text-surface-600 hover:text-surface-300 disabled:opacity-30">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="w-6 h-6 flex items-center justify-center text-surface-600 hover:text-red-400">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Editor ───────────────────────────────────────────────

interface NotebookEditorProps {
  notebook: Notebook;
  page: NotebookPage;
  onUpdate(): void;
}

export function NotebookEditor({ notebook, page, onUpdate }: NotebookEditorProps) {
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const addBlock = useCallback(async (type: NotebookBlockType, defaultContent: () => object) => {
    setShowBlockPicker(false);
    await globalNotebookService.addBlock(notebook.id, page.id, type, defaultContent() as never, 'Engineer');
    onUpdate();
  }, [notebook.id, page.id, onUpdate]);

  const deleteBlock = useCallback(async (blockId: string) => {
    const nb = await globalNotebookService.getById(notebook.id);
    if (!nb) return;
    const pg = nb.pages.find((p) => p.id === page.id);
    if (!pg) return;
    pg.blocks = pg.blocks.filter((b) => b.id !== blockId);
    pg.updatedAt = new Date().toISOString();
    nb.updatedAt = pg.updatedAt;
    // persist via save
    await globalNotebookRepository.save(nb);
    onUpdate();
  }, [notebook.id, page.id, onUpdate]);

  const moveBlock = useCallback(async (blockId: string, direction: 'up' | 'down') => {
    const nb = await globalNotebookService.getById(notebook.id);
    if (!nb) return;
    const pg = nb.pages.find((p) => p.id === page.id);
    if (!pg) return;
    const idx = pg.blocks.findIndex((b) => b.id === blockId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= pg.blocks.length) return;
    [pg.blocks[idx], pg.blocks[swapIdx]] = [pg.blocks[swapIdx], pg.blocks[idx]];
    await globalNotebookRepository.save(nb);
    onUpdate();
  }, [notebook.id, page.id, onUpdate]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Page title */}
          <h1 className="text-2xl font-black text-surface-100 mb-1">{page.title}</h1>
          <div className="flex items-center gap-3 text-xs text-surface-600 mb-8">
            <span>{page.blocks.length} blocks</span>
            <span>•</span>
            <span>v{page.version}</span>
            <span>•</span>
            <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
          </div>

          {/* Blocks */}
          <div className="space-y-2 relative pl-8">
            {page.blocks.length === 0 && (
              <div className="text-center py-16 border border-dashed border-surface-700 rounded-2xl">
                <p className="text-surface-500 text-sm">This page is empty.</p>
                <p className="text-surface-600 text-xs mt-1">Click "Add Block" to start documenting.</p>
              </div>
            )}
            {page.blocks.map((block, i) => (
              <BlockItem
                key={block.id}
                block={block}
                notebook={notebook}
                page={page}
                onUpdate={onUpdate}
                onMoveUp={() => moveBlock(block.id, 'up')}
                onMoveDown={() => moveBlock(block.id, 'down')}
                onDelete={() => deleteBlock(block.id)}
                isFirst={i === 0}
                isLast={i === page.blocks.length - 1}
              />
            ))}
          </div>

          {/* Add block button */}
          <div className="relative mt-6 pl-8" ref={pickerRef}>
            <button
              onClick={() => setShowBlockPicker((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-surface-700 rounded-xl text-sm text-surface-500 hover:text-brand-400 hover:border-brand-500/40 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Block
            </button>

            {showBlockPicker && (
              <div className="absolute left-8 top-10 z-30 bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl p-3 grid grid-cols-3 gap-2 w-80">
                {BLOCK_TYPES.map(({ type, icon: Icon, label, defaultContent }) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type, defaultContent)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-surface-800 text-surface-400 hover:text-brand-300 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
