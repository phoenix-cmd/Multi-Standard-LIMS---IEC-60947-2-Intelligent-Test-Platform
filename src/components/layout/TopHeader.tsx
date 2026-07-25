import React from 'react';
import { useLIMS } from '../../context/LIMSContext';
import { useDesktopWorkspace } from '../../desktop/DesktopWorkspaceContext';
import { Search, Bell, Keyboard, ChevronRight, User } from 'lucide-react';

export function TopHeader({ title }: { title: string }) {
  const { currentUser, notifications } = useLIMS();
  const { setCommandPaletteOpen, setNotificationDrawerOpen, setShortcutsModalOpen } = useDesktopWorkspace();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-12 border-b border-surface-800 bg-surface-950/80 backdrop-blur-md flex items-center px-4 gap-4 no-print select-none flex-shrink-0">
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-surface-500">LIMS OS</span>
        <ChevronRight className="w-3 h-3 text-surface-600 flex-shrink-0" />
        <h1 className="text-xs font-bold text-surface-100 truncate">{title}</h1>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Global Search Button / Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-surface-900 border border-surface-700 rounded-xl text-xs text-surface-400 hover:text-surface-200 hover:border-brand-500/40 transition-colors shadow-sm"
        >
          <Search className="w-3.5 h-3.5 text-brand-400" />
          <span className="hidden sm:inline">Search & Commands</span>
          <kbd className="px-1.5 py-0.5 bg-surface-800 text-surface-400 rounded text-[9px] font-mono border border-surface-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Keyboard Shortcuts Reference button */}
        <button
          onClick={() => setShortcutsModalOpen(true)}
          title="Keyboard Shortcuts (Shift + ?)"
          className="p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-xl transition-colors border border-transparent hover:border-surface-700"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Notification Bell with Badge */}
        <button
          onClick={() => setNotificationDrawerOpen(true)}
          title="Notification Center"
          className="relative p-1.5 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-xl transition-colors border border-transparent hover:border-surface-700"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-surface-950">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-surface-800">
          <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-500/40 flex items-center justify-center glow-brand flex-shrink-0">
            <span className="text-[11px] font-extrabold text-brand-400">{currentUser.avatarInitials}</span>
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-surface-100 leading-none">{currentUser.name}</p>
            <p className="text-[9px] text-brand-400 mt-0.5 font-mono">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
