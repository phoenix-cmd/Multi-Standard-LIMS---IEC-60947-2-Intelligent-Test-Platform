import React from 'react';
import { useDesktopWorkspace } from '../../desktop/DesktopWorkspaceContext';
import { Command, X, Keyboard } from 'lucide-react';

interface ShortcutGroup {
  category: string;
  items: { keys: string[]; description: string }[];
}

export function KeyboardShortcutsModal() {
  const { shortcutsModalOpen, setShortcutsModalOpen } = useDesktopWorkspace();

  if (!shortcutsModalOpen) return null;

  const groups: ShortcutGroup[] = [
    {
      category: 'Global & Navigation',
      items: [
        { keys: ['Ctrl', 'K'], description: 'Open Command Palette & Global Search' },
        { keys: ['Ctrl', 'Shift', 'P'], description: 'Command Palette (IDE Style)' },
        { keys: ['Shift', '?'], description: 'Keyboard Shortcuts Reference' },
        { keys: ['F11'], description: 'Toggle Focus Mode (Distraction Free)' },
        { keys: ['Esc'], description: 'Close Modals / Overlays' },
      ],
    },
    {
      category: 'Workspace & Tab Management',
      items: [
        { keys: ['Ctrl', 'W'], description: 'Close Active Tab' },
        { keys: ['Ctrl', 'Shift', 'T'], description: 'Restore Last Closed Tab' },
        { keys: ['Right Click'], description: 'Open Domain Object Context Menu' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-800 flex items-center justify-between bg-surface-950">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-surface-100 text-sm">Keyboard Shortcuts Reference</h3>
          </div>
          <button onClick={() => setShortcutsModalOpen(false)} className="text-surface-500 hover:text-surface-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {groups.map((group) => (
            <div key={group.category} className="space-y-3">
              <h4 className="text-[10px] font-extrabold uppercase text-brand-400 tracking-wider">
                {group.category}
              </h4>
              <div className="space-y-2">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-surface-800/60">
                    <span className="text-surface-300">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, j) => (
                        <kbd key={j} className="px-2 py-1 bg-surface-800 border border-surface-700 rounded text-[10px] font-mono text-surface-200 shadow-sm">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
