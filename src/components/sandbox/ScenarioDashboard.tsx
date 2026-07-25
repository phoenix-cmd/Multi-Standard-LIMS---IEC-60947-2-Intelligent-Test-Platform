import React from 'react';
import type { Scenario } from '../../sandbox/ScenarioTypes';
import { TrendingUp, AlertTriangle, Brain, BarChart3, Users, Cpu } from 'lucide-react';

function MetricCard({ label, value, sub, color = 'text-surface-100' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-surface-900 rounded-xl border border-surface-800 p-4">
      <p className="text-[10px] text-surface-500 uppercase tracking-wide font-semibold">{label}</p>
      <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-surface-600 mt-0.5">{sub}</p>}
    </div>
  );
}

interface ScenarioDashboardProps {
  scenario: Scenario;
}

export function ScenarioDashboard({ scenario }: ScenarioDashboardProps) {
  const { metrics, bottlenecks, resourceUtilization, aiRecommendations, executionDurationMs } = scenario.result!;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-black text-surface-100">{scenario.config.name}</h2>
          <p className="text-xs text-surface-500 mt-0.5">Simulation completed in {executionDurationMs}ms · {new Date(scenario.result!.completedAt).toLocaleString()}</p>
        </div>
        <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
          ✓ Complete
        </span>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Pass Rate" value={`${metrics.passRate}%`} sub={`${metrics.completedSamples}/${metrics.totalSamples} samples`} color={metrics.passRate >= 80 ? 'text-emerald-400' : 'text-red-400'} />
        <MetricCard label="Throughput" value={`${metrics.throughputPerDay}`} sub="samples / day" color="text-brand-400" />
        <MetricCard label="Lab Utilization" value={`${metrics.laboratoryUtilization}%`} sub="of available capacity" color="text-purple-400" />
        <MetricCard label="Downtime" value={`${metrics.totalDowntimeHours}h`} sub="total equipment downtime" color={metrics.totalDowntimeHours > 2 ? 'text-red-400' : 'text-yellow-400'} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Avg Test Duration" value={`${metrics.averageTestDurationHours}h`} />
        <MetricCard label="Avg Queue Time" value={`${metrics.averageQueueTimeHours}h`} color={metrics.averageQueueTimeHours > 1 ? 'text-orange-400' : 'text-surface-100'} />
        <MetricCard label="AI Interventions" value={metrics.aiInterventions} color="text-purple-400" />
        <MetricCard label="Est. Cost" value={`₹${metrics.costEstimate.toLocaleString()}`} sub="operational cost estimate" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Bottlenecks */}
        <div className="bg-surface-900 rounded-2xl border border-surface-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-surface-200 text-sm">Bottlenecks Detected</h3>
            <span className="ml-auto px-2 py-0.5 bg-orange-500/10 text-orange-400 text-xs rounded-full">{bottlenecks.length}</span>
          </div>
          {bottlenecks.length === 0 ? (
            <p className="text-xs text-surface-600">No bottlenecks detected. Excellent scenario performance!</p>
          ) : (
            <div className="space-y-3">
              {bottlenecks.map((b) => (
                <div key={b.id} className="p-3 bg-orange-500/5 rounded-xl border border-orange-500/10">
                  <div className="flex items-start gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 ${
                      b.type === 'equipment' ? 'bg-red-500/10 text-red-400' :
                      b.type === 'queue' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>{b.type}</span>
                    <div className="flex-1">
                      <p className="text-xs text-surface-300">{b.description}</p>
                      <p className="text-[10px] text-surface-500 mt-1">Impact: {b.impactHours}h · {b.affectedSamples} samples</p>
                      <p className="text-[10px] text-brand-400 mt-1">💡 {b.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="bg-surface-900 rounded-2xl border border-surface-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-surface-200 text-sm">AI Recommendations</h3>
          </div>
          <div className="space-y-3">
            {aiRecommendations.map((rec) => (
              <div key={rec.id} className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
                <div className="flex items-start gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 ${
                    rec.priority === 'critical' ? 'bg-red-500/10 text-red-400' :
                    rec.priority === 'high' ? 'bg-orange-500/10 text-orange-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>{rec.priority}</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-surface-200">{rec.title}</p>
                    <p className="text-[10px] text-surface-500 mt-0.5">{rec.rationale}</p>
                    <p className="text-[10px] text-emerald-400 mt-1">↑ {rec.expectedImprovement}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="bg-surface-900 rounded-2xl border border-surface-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-brand-400" />
          <h3 className="font-bold text-surface-200 text-sm">Resource Utilization</h3>
        </div>
        <div className="space-y-3">
          {resourceUtilization.map((r) => (
            <div key={r.entityId} className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0">
                {r.entityType === 'engineer'
                  ? <Users className="w-3.5 h-3.5 text-blue-400" />
                  : <Cpu className="w-3.5 h-3.5 text-orange-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-surface-300 truncate">{r.entityName}</span>
                  <span className={`text-xs font-bold ${r.utilizationPercent > 80 ? 'text-red-400' : r.utilizationPercent > 60 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {r.utilizationPercent}%
                  </span>
                </div>
                <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${r.utilizationPercent > 80 ? 'bg-red-500' : r.utilizationPercent > 60 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                    style={{ width: `${r.utilizationPercent}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-surface-600">Active: {r.activeHours}h</span>
                  <span className="text-[10px] text-surface-600">Idle: {r.idleHours}h</span>
                  {r.failureHours > 0 && <span className="text-[10px] text-red-500">Down: {r.failureHours}h</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
