import React from 'react';
import type { InvestigationCase } from '../../investigation/CaseTypes';
import { StickyNote, Plus, Move } from 'lucide-react';

export function WhiteboardCanvas({ caseData }: { caseData: InvestigationCase }) {
  const [notes, setNotes] = React.useState(caseData.whiteboardNotes);

  const addNote = () => {
    const newNote = {
      id: `wb-${Date.now()}`,
      text: 'New engineering note...',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 100,
      color: 'bg-purple-500/20 border-purple-500/40 text-purple-200',
    };
    setNotes([...notes, newNote]);
  };

  return (
    <div className="h-full bg-surface-950 border border-surface-800 rounded-xl p-4 relative overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 z-10 bg-surface-900/90 backdrop-blur border border-surface-800 rounded-xl p-3">
        <div>
          <h3 className="text-sm font-bold text-surface-100">Collaborative Investigation Whiteboard</h3>
          <p className="text-xs text-surface-400">Interactive sticky notes & team markup canvas</p>
        </div>
        <button
          onClick={addNote}
          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Note
        </button>
      </div>

      <div
        className="flex-1 relative overflow-auto rounded-xl"
        style={{
          backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {notes.map((n) => (
          <div
            key={n.id}
            style={{ left: `${n.x}px`, top: `${n.y}px` }}
            className={`absolute w-56 rounded-xl border p-3 shadow-xl backdrop-blur select-none cursor-move ${n.color}`}
          >
            <div className="flex items-center justify-between mb-1 opacity-60">
              <StickyNote className="w-3.5 h-3.5" />
              <Move className="w-3 h-3" />
            </div>
            <textarea
              value={n.text}
              onChange={(e) => {
                const text = e.target.value;
                setNotes(notes.map((item) => (item.id === n.id ? { ...item, text } : item)));
              }}
              className="w-full bg-transparent text-xs font-medium leading-relaxed resize-none focus:outline-none"
              rows={3}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
