import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FlaskConical, Package, Cpu, Settings,
  ClipboardList, FileText, History, Zap, BookOpen, Shield, BrainCircuit,
  BarChart3, GitBranch, Search, NotebookPen,
} from 'lucide-react';
import { useLIMS } from '../../context/LIMSContext';

type NavItem = { label: string; to: string; icon: React.ComponentType<{ className?: string }> };
type NavSection = { section: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Operations', to: '/', icon: LayoutDashboard },
      { label: 'Quality', to: '/quality', icon: Shield },
      { label: 'Equipment', to: '/equipment', icon: Wrench },
    ],
  },
  {
    section: 'INTELLIGENCE SUITE',
    items: [
      { label: 'Analytics BI', to: '/analytics', icon: BarChart3 },
      { label: 'Workflow Editor', to: '/workflow', icon: GitBranch },
      { label: 'AI Investigation', to: '/investigation', icon: Search },
      { label: 'Notebook', to: '/notebook', icon: NotebookPen },
      { label: 'Sandbox', to: '/sandbox', icon: FlaskConical },
    ],
  },
  {
    section: 'LAB EXECUTION',
    items: [
      { label: 'Samples', to: '/samples', icon: Package },
      { label: 'Test Wizard', to: '/wizard', icon: FlaskConical },
      { label: 'Oscillograph', to: '/oscillograph', icon: Zap },
      { label: 'Test Replay', to: '/replay', icon: History },
      { label: 'Engineering AI', to: '/engineering', icon: BrainCircuit },
    ],
  },
  {
    section: 'GOVERNANCE & REPORTS',
    items: [
      { label: 'Administration', to: '/admin', icon: Shield },
      { label: 'Reports', to: '/reports', icon: FileText },
      { label: 'Standards', to: '/standards', icon: BookOpen },
      { label: 'Audit Trail', to: '/audit', icon: ClipboardList },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
];

function Wrench(p: { className?: string }) {
  return (
    <svg className={p.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export function Sidebar() {
  const { samples, notifications } = useLIMS();
  const activeSamples = samples.filter((s) => s.lifecycleState === 'Testing').length;
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <aside className="w-56 flex-shrink-0 bg-surface-950 border-r border-surface-800 flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-surface-800 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center glow-brand flex-shrink-0">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-surface-100 leading-none">ChipTester</p>
            <p className="text-[10px] text-brand-400 mt-0.5 font-mono">LIMS OS v2.5</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto custom-scrollbar">
        {NAV_SECTIONS.map((sec) => (
          <div key={sec.section} className="space-y-1">
            <p className="px-2 text-[9px] font-extrabold text-surface-500 tracking-wider uppercase">{sec.section}</p>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const badge = item.to === '/samples' && activeSamples > 0 ? activeSamples : 0;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {badge > 0 && (
                    <span className="text-[10px] bg-brand-600/30 text-brand-400 px-1.5 py-0.2 rounded-full font-semibold">
                      {badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Standard badge */}
      <div className="p-3 border-t border-surface-800">
        <div className="px-3 py-2 bg-surface-800 rounded-lg">
          <p className="text-[10px] text-surface-500 font-semibold uppercase tracking-wide">Active Standard</p>
          <p className="text-xs font-bold text-brand-400 mt-0.5">IEC 60947-2 Ed 5.0</p>
          <p className="text-[10px] text-surface-500">2016 Revision</p>
        </div>
      </div>
    </aside>
  );
}
