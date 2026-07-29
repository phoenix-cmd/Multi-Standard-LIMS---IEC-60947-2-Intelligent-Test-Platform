import React from 'react';
import {
  Users, UserCheck, ShieldAlert, KeyRound, Lock, Wrench, FileText, CheckCircle2,
  Activity, Monitor, BrainCircuit, AlertOctagon, TrendingUp
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'amber' | 'blue' | 'rose' | 'purple' | 'cyan';
  trend?: string;
}

function MetricCard({ title, value, subtitle, icon: Icon, color, trend }: MetricCardProps) {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex flex-col justify-between hover:border-surface-700 transition-all shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-surface-400">{title}</p>
          <h3 className="text-2xl font-extrabold text-surface-100 mt-1 font-mono tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-800/60 text-[11px]">
        <span className="text-surface-400">{subtitle}</span>
        {trend && (
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export function AdminDashboardPanel() {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-surface-900 via-brand-950/40 to-surface-900 border border-surface-800 rounded-xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-surface-100 tracking-tight">Enterprise Administration & Security Overview</h2>
          <p className="text-xs text-surface-400 mt-1 max-w-2xl">
            Real-time identity management telemetry, active sessions, RBAC permissions, audit trail activity, and system health.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-emerald-400">IDENTITY KERNEL ONLINE</span>
        </div>
      </div>

      {/* 12 Metric Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Active Users" value={18} subtitle="Registered active accounts" icon={Users} color="blue" trend="+2 this week" />
        <MetricCard title="Logged In Users" value={6} subtitle="Concurrent active sessions" icon={UserCheck} color="emerald" />
        <MetricCard title="Locked Accounts" value={1} subtitle="Failed login lockouts" icon={Lock} color="rose" />
        <MetricCard title="Recent Logins" value={24} subtitle="Past 24 hours total" icon={Activity} color="cyan" />

        <MetricCard title="Failed Logins" value={3} subtitle="Security authentication alerts" icon={ShieldAlert} color="amber" />
        <MetricCard title="Password Resets" value={5} subtitle="Administrative & self resets" icon={KeyRound} color="purple" />
        <MetricCard title="Equipment Status" value="13 / 15" subtitle="Operational vs calibrating" icon={Wrench} color="emerald" />
        <MetricCard title="Pending Reports" value={4} subtitle="Awaiting quality review" icon={FileText} color="amber" />

        <MetricCard title="Pending Approvals" value={2} subtitle="Digital signature pending" icon={CheckCircle2} color="blue" />
        <MetricCard title="Audit Events (24h)" value={142} subtitle="Immutable audit log entries" icon={AlertOctagon} color="cyan" trend="+18%" />
        <MetricCard title="Active Sessions" value={8} subtitle="Browsers & mobile nodes" icon={Monitor} color="purple" />
        <MetricCard title="AI Usage" value="184.5K" subtitle="Token telemetry consumption" icon={BrainCircuit} color="emerald" />
      </div>
    </div>
  );
}
