import { useLIMS } from '../../context/LIMSContext';
import { NotificationCenter } from './NotificationCenter';
import { Search, User } from 'lucide-react';

export function TopHeader({ title }: { title: string }) {
  const { currentUser } = useLIMS();
  return (
    <header className="h-14 border-b border-surface-800 bg-surface-950/80 backdrop-blur-sm flex items-center px-6 gap-4 no-print">
      <div className="flex-1">
        <h1 className="text-base font-semibold text-surface-100">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500" />
          <input
            className="input pl-9 py-1.5 w-48 text-xs"
            placeholder="Search samples, reports…"
          />
        </div>
        <NotificationCenter />
        <div className="flex items-center gap-2 pl-2 border-l border-surface-700">
          <div className="w-7 h-7 rounded-full bg-brand-600/20 border border-brand-600/40 flex items-center justify-center">
            <span className="text-[11px] font-bold text-brand-400">{currentUser.avatarInitials}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-surface-100 leading-none">{currentUser.name}</p>
            <p className="text-[10px] text-surface-500 mt-0.5">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
