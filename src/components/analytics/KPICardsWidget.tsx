import React from 'react';
import { globalAnalyticsEngine } from '../../intelligence/analytics/AnalyticsEngine';
import { Activity, CheckCircle2, XCircle, Clock, FileText, Wrench } from 'lucide-react';

export function KPICardsWidget() {
  const metrics = globalAnalyticsEngine.computeMetrics();

  const cards = [
    { label: 'Total Tests Evaluated', value: metrics.totalTests, sub: '+12% vs last week', color: 'text-brand-400', icon: Activity, bg: 'bg-brand-500/10 border-brand-500/20' },
    { label: 'Overall Pass Rate', value: `${metrics.passRate}%`, sub: 'Target ≥ 95.0%', color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Clause Failure Rate', value: `${metrics.failureRate}%`, sub: '3 failed clauses', color: 'text-red-400', icon: XCircle, bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Avg Test Duration', value: `${metrics.averageTestDurationMinutes}m`, sub: 'Per test sequence', color: 'text-amber-400', icon: Clock, bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Reports Published', value: metrics.reportThroughput, sub: '100% NABL compliant', color: 'text-cyan-400', icon: FileText, bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Equipment Health', value: '94%', sub: '2 due for calibration', color: 'text-purple-400', icon: Wrench, bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className={`rounded-xl border p-4 flex flex-col justify-between ${c.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wide truncate">{c.label}</span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
              <p className="text-[10px] text-surface-400 mt-0.5">{c.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
