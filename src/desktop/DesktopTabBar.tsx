import React from 'react';
import { useDesktopWorkspace } from './DesktopWorkspaceContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Pin, RotateCcw, Maximize2, Minimize2, Sun, Moon, SlidersHorizontal } from 'lucide-react';

export function DesktopTabBar() {
  const { tabs, activeTabId, openTab, closeTab, restoreTab, pinTab, focusMode, toggleFocusMode, theme, setTheme } = useDesktopWorkspace();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex items-center justify-between bg-surface-950 border-b border-surface-800 px-3 h-10 select-none flex-shrink-0">
      {/* Tabs list */}
      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar flex-1 mr-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || activeTabId === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => {
                openTab(tab);
                navigate(tab.path);
              }}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-semibold cursor-pointer border-t-2 transition-all ${
                isActive
                  ? 'bg-surface-900 text-brand-300 border-brand-500 shadow-sm'
                  : 'bg-surface-950/40 text-surface-400 border-transparent hover:bg-surface-900/60 hover:text-surface-200'
              }`}
            >
              <span>{tab.icon ?? '📄'}</span>
              <span className="truncate max-w-[140px]">{tab.title}</span>
              {tab.pinned && <Pin className="w-2.5 h-2.5 text-brand-400 fill-brand-400 flex-shrink-0" />}
              {!tab.pinned && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-surface-500 hover:text-red-400 p-0.5 rounded transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={restoreTab}
          title="Restore Closed Tab (Ctrl+Shift+T)"
          className="p-1.5 text-surface-500 hover:text-surface-200 hover:bg-surface-800 rounded-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Theme selector */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'dark' | 'industrial' | 'light')}
          className="bg-surface-900 border border-surface-700 text-surface-300 text-[10px] rounded-md px-2 py-1 focus:outline-none"
        >
          <option value="dark">🌙 Dark</option>
          <option value="industrial">⚙️ Industrial</option>
          <option value="light">☀️ Light</option>
        </select>

        {/* Focus Mode toggle */}
        <button
          onClick={toggleFocusMode}
          title={focusMode ? 'Exit Focus Mode (F11)' : 'Enter Focus Mode (F11)'}
          className={`p-1.5 rounded-md transition-colors ${
            focusMode
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-surface-500 hover:text-surface-200 hover:bg-surface-800'
          }`}
        >
          {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
