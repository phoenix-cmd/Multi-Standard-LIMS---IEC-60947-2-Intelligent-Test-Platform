import React, { useState } from 'react';
import { KPICardsWidget } from './KPICardsWidget';
import { TrendChartsWidget } from './TrendChartsWidget';
import { HeatMapWidget } from './HeatMapWidget';
import { ExecutiveBriefWidget } from './ExecutiveBriefWidget';
import { BarChart3, Filter, RefreshCw, Calendar, ShieldCheck, Cpu } from 'lucide-react';

export function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('week');
  const [standardFilter, setStandardFilter] = useState('all');

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-900 border border-surface-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-surface-100">Laboratory Business Intelligence</h1>
            <p className="text-xs text-surface-400">Real-time KPI metrics, failure heatmaps, and executive insights</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe selector */}
          <div className="flex items-center bg-surface-800 border border-surface-700 rounded-lg p-1">
            {(['week', 'month', 'quarter'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                  timeframe === t ? 'bg-brand-600 text-white shadow' : 'text-surface-400 hover:text-surface-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Standard Filter */}
          <select
            value={standardFilter}
            onChange={(e) => setStandardFilter(e.target.value)}
            className="bg-surface-800 border border-surface-700 text-xs text-surface-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Standards</option>
            <option value="iec60947-2">IEC 60947-2</option>
            <option value="ul489">UL 489</option>
            <option value="iec60898">IEC 60898-1</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <KPICardsWidget />

      {/* Executive Brief Widget */}
      <ExecutiveBriefWidget />

      {/* Grid: Trend Charts & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChartsWidget />
        <HeatMapWidget />
      </div>
    </div>
  );
}
