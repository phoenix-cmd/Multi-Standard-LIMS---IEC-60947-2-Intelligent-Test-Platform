import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDesktopWorkspace, InspectedObject } from './DesktopWorkspaceContext';

interface ContextMenuState {
  x: number;
  y: number;
  object: InspectedObject;
}

interface ContextMenuContextType {
  showContextMenu: (e: React.MouseEvent, obj: InspectedObject) => void;
  hideContextMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const { openTab, inspectObject } = useDesktopWorkspace();

  const showContextMenu = useCallback((e: React.MouseEvent, obj: InspectedObject) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({
      x: e.clientX,
      y: e.clientY,
      object: obj,
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setMenu(null);
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => setMenu(null);
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('contextmenu', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('contextmenu', handleGlobalClick);
    };
  }, []);

  const handleAction = (action: string) => {
    if (!menu) return;
    const { object } = menu;
    hideContextMenu();

    switch (action) {
      case 'open-tab':
        openTab({
          title: object.title,
          path: `/${object.type}s`,
          icon: '📄',
        });
        break;
      case 'inspect':
        inspectObject(object);
        break;
      case 'ai-explain':
        inspectObject({ ...object, subtitle: 'AI Explanation Active' });
        break;
      case 'copy-link':
        navigator.clipboard?.writeText?.(`${window.location.origin}/${object.type}/${object.id}`);
        break;
      case 'report':
        openTab({ title: `Report — ${object.title}`, path: '/reports', icon: '📄' });
        break;
      case 'investigation':
        openTab({ title: `Investigation — ${object.title}`, path: '/investigation', icon: '🔬' });
        break;
      default:
        break;
    }
  };

  return (
    <ContextMenuContext.Provider value={{ showContextMenu, hideContextMenu }}>
      {children}
      {menu && (
        <div
          className="fixed z-50 bg-surface-900 border border-surface-700 rounded-xl shadow-2xl p-1.5 w-56 text-xs text-surface-200 context-menu-enter backdrop-blur-md"
          style={{ left: Math.min(menu.x, window.innerWidth - 230), top: Math.min(menu.y, window.innerHeight - 250) }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-surface-800 mb-1">
            <p className="font-bold text-surface-100 truncate">{menu.object.title}</p>
            <p className="text-[10px] text-brand-400 capitalize">{menu.object.type} · ID: {menu.object.id}</p>
          </div>
          <button
            onClick={() => handleAction('open-tab')}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-brand-600/20 hover:text-brand-300 flex items-center justify-between"
          >
            <span>📖 Open in New Tab</span>
          </button>
          <button
            onClick={() => handleAction('inspect')}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-brand-600/20 hover:text-brand-300 flex items-center justify-between"
          >
            <span>🔍 Inspect Properties</span>
          </button>
          <button
            onClick={() => handleAction('ai-explain')}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-purple-600/20 hover:text-purple-300 flex items-center justify-between"
          >
            <span>🧠 AI Explain & Summarize</span>
          </button>
          <button
            onClick={() => handleAction('report')}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-emerald-600/20 hover:text-emerald-300 flex items-center justify-between"
          >
            <span>📄 View Test Report</span>
          </button>
          <button
            onClick={() => handleAction('investigation')}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-red-600/20 hover:text-red-300 flex items-center justify-between"
          >
            <span>🔬 Root Cause Investigation</span>
          </button>
          <div className="my-1 border-t border-surface-800" />
          <button
            onClick={() => handleAction('copy-link')}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-surface-800 text-surface-400 flex items-center justify-between"
          >
            <span>🔗 Copy Entity Link</span>
          </button>
        </div>
      )}
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
}
