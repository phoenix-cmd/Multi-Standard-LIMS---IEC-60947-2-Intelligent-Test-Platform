import React from 'react';
import type { Notebook } from '../../domain/notebook/NotebookTypes';
import { Clock, BookOpen } from 'lucide-react';

const EVENT_ICONS: Record<string, string> = {
  'Notebook Created': '📓',
  'Page Added': '📄',
  'Block Added': '➕',
  'Block Updated': '✏️',
  'Artifact Linked': '🔗',
  'AI Analysis': '🧠',
};

interface NotebookTimelineProps {
  notebook: Notebook;
}

export function NotebookTimeline({ notebook }: NotebookTimelineProps) {
  const events = [...notebook.timeline].reverse();

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center px-4">
        <Clock className="w-8 h-8 text-surface-700 mb-2" />
        <p className="text-surface-500 text-xs">No events recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-1">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-brand-400" />
        <p className="text-xs font-bold text-surface-300 uppercase tracking-wider">Activity Timeline</p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-surface-800" />

        <div className="space-y-3">
          {events.map((ev) => {
            const icon = EVENT_ICONS[ev.action] ?? ev.icon ?? '•';
            const dt = new Date(ev.timestamp);
            const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = dt.toLocaleDateString([], { month: 'short', day: 'numeric' });

            return (
              <div key={ev.id} className="flex gap-3 items-start relative">
                <div className="w-7 h-7 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-sm flex-shrink-0 z-10">
                  <span>{icon}</span>
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <p className="text-xs font-semibold text-surface-200">{ev.action}</p>
                  <p className="text-[10px] text-surface-500 mt-0.5 truncate">{ev.detail}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-surface-600">{ev.actor}</span>
                    <span className="text-surface-700">·</span>
                    <span className="text-[10px] text-surface-600">{dateStr} {timeStr}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
