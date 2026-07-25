import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Activity, Brain, Clock, Users, Zap } from 'lucide-react';
import { useDesktopWorkspace } from './DesktopWorkspaceContext';

export function DesktopStatusBar() {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  const { focusMode } = useDesktopWorkspace();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (focusMode) return null;

  return (
    <footer className="h-7 bg-surface-950 border-t border-surface-800 px-4 flex items-center justify-between text-[11px] font-mono text-surface-400 select-none flex-shrink-0 z-40">
      {/* Left indicators */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>CONNECTED</span>
        </div>
        <div className="flex items-center gap-1 text-surface-300">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
          <span>IEC 60947-2 Ed 5.0</span>
        </div>
        <div className="flex items-center gap-1 text-surface-400">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>Priya Sharma (Lead)</span>
        </div>
      </div>

      {/* Center status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-purple-400">
          <Brain className="w-3.5 h-3.5" />
          <span>AI Engine: Active</span>
        </div>
        <div className="flex items-center gap-1 text-teal-400">
          <Activity className="w-3.5 h-3.5" />
          <span>Sync: 100%</span>
        </div>
      </div>

      {/* Right indicators */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-surface-500">
          <Zap className="w-3 h-3 text-yellow-400" />
          <span>Jobs: 0</span>
        </div>
        <div className="flex items-center gap-1 text-surface-300 font-semibold">
          <Clock className="w-3.5 h-3.5 text-brand-400" />
          <span>{time}</span>
        </div>
      </div>
    </footer>
  );
}
