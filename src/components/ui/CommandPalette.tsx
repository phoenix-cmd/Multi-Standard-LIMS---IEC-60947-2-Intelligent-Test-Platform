import React, { useState, useEffect } from 'react';
import { useDesktopWorkspace } from '../../desktop/DesktopWorkspaceContext';
import { useNavigate } from 'react-router-dom';
import {
  Search, FlaskConical, FileText, GitBranch, BrainCircuit,
  Package, Wrench, Shield, BookOpen, Clock, Command, X, Plus, Play
} from 'lucide-react';
import { useLIMS } from '../../context/LIMSContext';

interface CommandItem {
  id: string;
  category: 'Objects' | 'Actions';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, openTab } = useDesktopWorkspace();
  const { samples, equipment, standards } = useLIMS();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const handleNav = (path: string, title: string, iconStr: string) => {
    openTab({ title, path, icon: iconStr });
    navigate(path);
    setCommandPaletteOpen(false);
  };

  const objectCommands: CommandItem[] = [
    ...samples.map((s) => ({
      id: `obj-sample-${s.id}`,
      category: 'Objects' as const,
      title: `Sample: ${s.reportNo} (${s.specification.model})`,
      subtitle: `State: ${s.lifecycleState} · Client: ${s.clientName}`,
      icon: Package,
      action: () => handleNav('/samples', `Sample ${s.reportNo}`, '📦'),
    })),
    ...equipment.map((e) => ({
      id: `obj-eq-${e.id}`,
      category: 'Objects' as const,
      title: `Asset: ${e.name} (${e.assetTag})`,
      subtitle: `Status: ${e.status} · Cal Due: ${e.nextCalibrationDue}`,
      icon: Wrench,
      action: () => handleNav('/equipment', `Equipment ${e.assetTag}`, '⚙️'),
    })),
    ...standards.map((std) => ({
      id: `obj-std-${std.id}`,
      category: 'Objects' as const,
      title: `Standard: ${std.name}`,
      subtitle: `Scope: ${std.scope}`,
      icon: BookOpen,
      action: () => handleNav('/standards', 'Standard Manager', '📜'),
    })),
  ];

  const actionCommands: CommandItem[] = [
    {
      id: 'act-new-sample',
      category: 'Actions',
      title: 'Action: Register New Sample',
      subtitle: 'Add a new circuit breaker sample to the lab queue',
      icon: Plus,
      action: () => handleNav('/samples', 'Sample Registry', '📦'),
    },
    {
      id: 'act-run-test',
      category: 'Actions',
      title: 'Action: Run Guided Test Sequence',
      subtitle: 'Launch IEC 60947-2 Guided Test Wizard',
      icon: Play,
      action: () => handleNav('/wizard', 'Guided Test Wizard', '🧪'),
    },
    {
      id: 'act-gen-report',
      category: 'Actions',
      title: 'Action: Generate Type Test Report',
      subtitle: 'Compile IEC certificate and multi-stage sign-off',
      icon: FileText,
      action: () => handleNav('/reports', 'Test Reports', '📄'),
    },
    {
      id: 'act-open-ops',
      category: 'Actions',
      title: 'Action: Open Operations Dashboard',
      subtitle: 'View live telemetry, sample queues, and KPIs',
      icon: BrainCircuit,
      action: () => handleNav('/', 'Operations Dashboard', '📊'),
    },
  ];

  const allCommands = [...actionCommands, ...objectCommands];

  const filtered = allCommands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filtered, selectedIndex]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search header */}
        <div className="flex items-center px-4 py-3 border-b border-surface-800 bg-surface-950">
          <Search className="w-4 h-4 text-brand-400 mr-3 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Objects & Actions (e.g. 'Sample', 'Run Test', 'Asset')..."
            className="w-full bg-transparent text-sm text-surface-100 placeholder-surface-500 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 bg-surface-800 border border-surface-700 rounded text-[10px] font-mono text-surface-400">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-surface-500 text-xs">No matching objects or actions found.</div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-brand-600/20 border border-brand-500/30 text-brand-300' : 'hover:bg-surface-800/60 text-surface-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-surface-100">{item.title}</p>
                    {item.subtitle && <p className="text-[10px] text-surface-500 truncate">{item.subtitle}</p>}
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    item.category === 'Actions' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                  }`}>
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-surface-950 border-t border-surface-800 flex items-center justify-between text-[10px] font-mono text-surface-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>Ctrl + K</span>
        </div>
      </div>
    </div>
  );
}
