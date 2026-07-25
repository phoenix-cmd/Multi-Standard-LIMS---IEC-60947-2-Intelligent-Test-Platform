import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type DesktopTheme = 'dark' | 'industrial' | 'light';

export interface DesktopTab {
  id: string;
  title: string;
  path: string;
  icon?: string;
  pinned?: boolean;
}

export interface InspectedObject {
  type: 'sample' | 'equipment' | 'report' | 'workflow' | 'investigation' | 'notebook' | 'scenario' | 'component' | 'clause';
  id: string;
  title: string;
  subtitle?: string;
  data?: Record<string, unknown>;
}

interface DesktopWorkspaceContextType {
  // Tabs
  tabs: DesktopTab[];
  activeTabId: string;
  openTab: (tab: Omit<DesktopTab, 'id'> & { id?: string }) => void;
  closeTab: (id: string) => void;
  restoreTab: () => void;
  pinTab: (id: string) => void;

  // Focus Mode
  focusMode: boolean;
  toggleFocusMode: () => void;

  // Theme
  theme: DesktopTheme;
  setTheme: (theme: DesktopTheme) => void;

  // Inspector
  inspectedObject: InspectedObject | null;
  inspectObject: (obj: InspectedObject) => void;
  closeInspector: () => void;

  // Overlays
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  shortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;
  notificationDrawerOpen: boolean;
  setNotificationDrawerOpen: (open: boolean) => void;
}

const DEFAULT_TABS: DesktopTab[] = [
  { id: 'tab-home', title: 'Operations Dashboard', path: '/', icon: '📊', pinned: true },
];

const DesktopWorkspaceContext = createContext<DesktopWorkspaceContextType | null>(null);

export function DesktopWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<DesktopTab[]>(() => {
    try {
      const saved = localStorage.getItem('desktop_tabs');
      return saved ? JSON.parse(saved) : DEFAULT_TABS;
    } catch {
      return DEFAULT_TABS;
    }
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0]?.id ?? 'tab-home');
  const [closedTabs, setClosedTabs] = useState<DesktopTab[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [theme, setThemeState] = useState<DesktopTheme>('dark');
  const [inspectedObject, setInspectedObject] = useState<InspectedObject | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('desktop_tabs', JSON.stringify(tabs));
    } catch {
      // ignore
    }
  }, [tabs]);

  const setTheme = useCallback((newTheme: DesktopTheme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  const openTab = useCallback((tab: Omit<DesktopTab, 'id'> & { id?: string }) => {
    const id = tab.id ?? `tab-${Math.random().toString(36).slice(2, 8)}`;
    setTabs((prev) => {
      const existing = prev.find((t) => t.path === tab.path || t.id === id);
      if (existing) {
        setActiveTabId(existing.id);
        return prev;
      }
      const newTab: DesktopTab = { ...tab, id };
      setActiveTabId(id);
      return [...prev, newTab];
    });
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const tabToClose = prev.find((t) => t.id === id);
      if (tabToClose && !tabToClose.pinned) {
        setClosedTabs((c) => [tabToClose, ...c]);
      }
      const next = prev.filter((t) => t.id !== id || t.pinned);
      if (activeTabId === id && next.length > 0) {
        setActiveTabId(next[next.length - 1].id);
      }
      return next.length > 0 ? next : DEFAULT_TABS;
    });
  }, [activeTabId]);

  const restoreTab = useCallback(() => {
    if (closedTabs.length === 0) return;
    const [lastClosed, ...remaining] = closedTabs;
    setClosedTabs(remaining);
    setTabs((prev) => [...prev, lastClosed]);
    setActiveTabId(lastClosed.id);
  }, [closedTabs]);

  const pinTab = useCallback((id: string) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)));
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => !prev);
  }, []);

  const inspectObject = useCallback((obj: InspectedObject) => {
    setInspectedObject(obj);
  }, []);

  const closeInspector = useCallback(() => {
    setInspectedObject(null);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K or Ctrl + Shift + P => Command Palette
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k' || (e.shiftKey && e.key.toLowerCase() === 'p'))) {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      // F11 => Focus Mode
      else if (e.key === 'F11') {
        e.preventDefault();
        toggleFocusMode();
      }
      // Ctrl + Shift + T => Restore Tab
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        restoreTab();
      }
      // Ctrl + W => Close active tab
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      }
      // Shift + ? => Shortcuts Reference Modal
      else if (e.shiftKey && e.key === '?') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShortcutsModalOpen((prev) => !prev);
        }
      }
      // Esc => Close Inspector or Modals
      else if (e.key === 'Escape') {
        if (commandPaletteOpen) setCommandPaletteOpen(false);
        else if (shortcutsModalOpen) setShortcutsModalOpen(false);
        else if (notificationDrawerOpen) setNotificationDrawerOpen(false);
        else if (inspectedObject) setInspectedObject(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, closeTab, commandPaletteOpen, inspectedObject, notificationDrawerOpen, restoreTab, shortcutsModalOpen, toggleFocusMode]);

  return (
    <DesktopWorkspaceContext.Provider
      value={{
        tabs,
        activeTabId,
        openTab,
        closeTab,
        restoreTab,
        pinTab,
        focusMode,
        toggleFocusMode,
        theme,
        setTheme,
        inspectedObject,
        inspectObject,
        closeInspector,
        commandPaletteOpen,
        setCommandPaletteOpen,
        shortcutsModalOpen,
        setShortcutsModalOpen,
        notificationDrawerOpen,
        setNotificationDrawerOpen,
      }}
    >
      {children}
    </DesktopWorkspaceContext.Provider>
  );
}

export function useDesktopWorkspace() {
  const context = useContext(DesktopWorkspaceContext);
  if (!context) {
    throw new Error('useDesktopWorkspace must be used within a DesktopWorkspaceProvider');
  }
  return context;
}
