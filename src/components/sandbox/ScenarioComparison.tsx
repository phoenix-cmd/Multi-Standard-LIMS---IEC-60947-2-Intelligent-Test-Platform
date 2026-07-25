import React, { useState, useMemo } from 'react';
import type { Scenario, ScenarioComparisonResult } from '../../sandbox/ScenarioTypes';
import { globalScenarioRunner } from '../../sandbox/ScenarioRunner';
import { GitCompare, TrendingUp, TrendingDown, Minus, Brain } from 'lucide-react';

function DeltaBadge({ value, unit = '', lowerIsBetter = false }: { value: number; unit?: string; lowerIsBetter?: boolean }) {
  if (value === 0) return <span className="flex items-center gap-0.5 text-surface-500 text-xs font-semibold"><Minus className="w-3 h-3" /> Equal</span>;
  const positive = lowerIsBetter ? value < 0 : value > 0;
  const Arrow = positive ? TrendingUp : TrendingDown;
  const color = positive ? 'text-emerald-400' : 'text-red-400';
  const prefix = value > 0 ? '+' : '';
  return (
    <span className={`flex items-center gap-0.5 text-xs font-bold ${color}`}>
      <Arrow className="w-3.5 h-3.5" />
      {prefix}{value}{unit}
    </span>
  );
}

interface ComparisonRowProps {
  label: string;
  aValue: string | number;
  bValue: string | number;
  delta: number;
  unit?: string;
  lowerIsBetter?: boolean;
  winner?: 'A' | 'B' | 'tie';
}

function ComparisonRow({ label, aValue, bValue, delta, unit = '', lowerIsBetter = false, winner }: ComparisonRowProps) {
  const aWins = winner === 'A';
  const bWins = winner === 'B';
  return (
    <tr className="border-b border-surface-800 hover:bg-surface-800/30 transition-colors">
      <td className="py-3 px-4 text-xs text-surface-400">{label}</td>
      <td className={`py-3 px-4 text-sm font-bold text-center ${aWins ? 'text-emerald-400' : 'text-surface-200'}`}>
        {aValue}{unit}{aWins && ' 🏆'}
      </td>
      <td className={`py-3 px-4 text-sm font-bold text-center ${bWins ? 'text-emerald-400' : 'text-surface-200'}`}>
        {bValue}{unit}{bWins && ' 🏆'}
      </td>
      <td className="py-3 px-4 text-center">
        <DeltaBadge value={delta} unit={unit} lowerIsBetter={lowerIsBetter} />
      </td>
    </tr>
  );
}

interface ScenarioComparisonProps {
  scenarios: Scenario[];
}

export function ScenarioComparison({ scenarios }: ScenarioComparisonProps) {
  const completed = scenarios.filter((s) => s.status === 'completed');
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');

  const comparison = useMemo<ScenarioComparisonResult | null>(() => {
    if (!selectedA || !selectedB || selectedA === selectedB) return null;
    try {
      return globalScenarioRunner.compare(selectedA, selectedB);
    } catch {
      return null;
    }
  }, [selectedA, selectedB]);

  if (completed.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <GitCompare className="w-12 h-12 text-surface-700 mb-3" />
        <p className="text-surface-400 text-sm font-semibold">You need at least 2 completed scenarios to compare.</p>
        <p className="text-surface-600 text-xs mt-1">Run scenarios from the Configure tab, then return here.</p>
      </div>
    );
  }

  const selCls = 'px-3 py-2 bg-surface-800 border border-surface-700 rounded-xl text-sm text-surface-200 focus:outline-none focus:border-brand-500';

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Scenario selectors */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-[10px] text-surface-500 uppercase tracking-wide font-semibold mb-1.5">Scenario A</label>
          <select value={selectedA} onChange={(e) => setSelectedA(e.target.value)} className={selCls + ' w-full'}>
            <option value="">Select scenario…</option>
            {completed.map((s) => (
              <option key={s.id} value={s.id}>{s.config.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-center gap-1 mt-4">
          <GitCompare className="w-6 h-6 text-surface-600" />
          <span className="text-[10px] text-surface-600 font-bold">VS</span>
        </div>
        <div className="flex-1">
          <label className="block text-[10px] text-surface-500 uppercase tracking-wide font-semibold mb-1.5">Scenario B</label>
          <select value={selectedB} onChange={(e) => setSelectedB(e.target.value)} className={selCls + ' w-full'}>
            <option value="">Select scenario…</option>
            {completed.filter((s) => s.id !== selectedA).map((s) => (
              <option key={s.id} value={s.id}>{s.config.name}</option>
            ))}
          </select>
        </div>
      </div>

      {comparison && (
        <>
          {/* Winner banner */}
          <div className={`rounded-2xl p-5 border ${
            comparison.winner === 'tie'
              ? 'bg-surface-800/50 border-surface-700'
              : 'bg-emerald-500/5 border-emerald-500/20'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{comparison.winner === 'tie' ? '⚖️' : '🏆'}</span>
              <div>
                <p className="font-bold text-surface-100">
                  {comparison.winner === 'tie'
                    ? 'Scenarios Perform Equally'
                    : `${comparison.winner === 'A' ? comparison.scenarioA.config.name : comparison.scenarioB.config.name} Wins`}
                </p>
                <p className="text-xs text-surface-400 mt-0.5">{comparison.aiSummary}</p>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-surface-900 rounded-2xl border border-surface-800 overflow-hidden">
            <div className="flex border-b border-surface-800">
              <div className="flex-[2] px-4 py-3 text-[10px] text-surface-500 uppercase tracking-wide font-semibold">Metric</div>
              <div className="flex-1 px-4 py-3 text-center text-xs font-bold text-surface-300">A: {comparison.scenarioA.config.name.slice(0, 20)}</div>
              <div className="flex-1 px-4 py-3 text-center text-xs font-bold text-surface-300">B: {comparison.scenarioB.config.name.slice(0, 20)}</div>
              <div className="flex-1 px-4 py-3 text-center text-[10px] text-surface-500 uppercase tracking-wide font-semibold">B vs A</div>
            </div>
            <table className="w-full">
              <tbody>
                <ComparisonRow
                  label="Pass Rate"
                  aValue={comparison.scenarioA.result!.metrics.passRate}
                  bValue={comparison.scenarioB.result!.metrics.passRate}
                  delta={comparison.delta.passRate}
                  unit="%"
                  winner={comparison.winner !== 'tie' ? (comparison.delta.passRate > 0 ? 'B' : 'A') : 'tie'}
                />
                <ComparisonRow
                  label="Throughput / Day"
                  aValue={comparison.scenarioA.result!.metrics.throughputPerDay}
                  bValue={comparison.scenarioB.result!.metrics.throughputPerDay}
                  delta={comparison.delta.throughputPerDay}
                  winner={comparison.delta.throughputPerDay > 0 ? 'B' : comparison.delta.throughputPerDay < 0 ? 'A' : 'tie'}
                />
                <ComparisonRow
                  label="Lab Utilization"
                  aValue={comparison.scenarioA.result!.metrics.laboratoryUtilization}
                  bValue={comparison.scenarioB.result!.metrics.laboratoryUtilization}
                  delta={comparison.delta.laboratoryUtilization}
                  unit="%"
                  winner={comparison.delta.laboratoryUtilization > 0 ? 'B' : comparison.delta.laboratoryUtilization < 0 ? 'A' : 'tie'}
                />
                <ComparisonRow
                  label="Avg Queue Time"
                  aValue={comparison.scenarioA.result!.metrics.averageQueueTimeHours}
                  bValue={comparison.scenarioB.result!.metrics.averageQueueTimeHours}
                  delta={comparison.delta.averageQueueTimeHours}
                  unit="h"
                  lowerIsBetter
                  winner={comparison.delta.averageQueueTimeHours < 0 ? 'B' : comparison.delta.averageQueueTimeHours > 0 ? 'A' : 'tie'}
                />
                <ComparisonRow
                  label="Total Downtime"
                  aValue={comparison.scenarioA.result!.metrics.totalDowntimeHours}
                  bValue={comparison.scenarioB.result!.metrics.totalDowntimeHours}
                  delta={comparison.delta.totalDowntimeHours}
                  unit="h"
                  lowerIsBetter
                  winner={comparison.delta.totalDowntimeHours < 0 ? 'B' : comparison.delta.totalDowntimeHours > 0 ? 'A' : 'tie'}
                />
                <ComparisonRow
                  label="Bottlenecks"
                  aValue={comparison.scenarioA.result!.metrics.totalBottlenecks}
                  bValue={comparison.scenarioB.result!.metrics.totalBottlenecks}
                  delta={comparison.delta.bottlenecks}
                  lowerIsBetter
                  winner={comparison.delta.bottlenecks < 0 ? 'B' : comparison.delta.bottlenecks > 0 ? 'A' : 'tie'}
                />
                <ComparisonRow
                  label="Est. Cost (₹)"
                  aValue={`₹${comparison.scenarioA.result!.metrics.costEstimate.toLocaleString()}`}
                  bValue={`₹${comparison.scenarioB.result!.metrics.costEstimate.toLocaleString()}`}
                  delta={comparison.delta.costEstimate}
                  lowerIsBetter
                  winner={comparison.delta.costEstimate < 0 ? 'B' : comparison.delta.costEstimate > 0 ? 'A' : 'tie'}
                />
              </tbody>
            </table>
          </div>

          {/* AI Summary */}
          <div className="bg-purple-500/5 rounded-2xl border border-purple-500/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-surface-200">AI Analysis</span>
            </div>
            <p className="text-sm text-surface-400 leading-relaxed">{comparison.aiSummary}</p>
          </div>
        </>
      )}

      {selectedA && selectedB && !comparison && (
        <div className="text-center py-8 text-surface-600 text-sm">Unable to compare. Ensure both scenarios have completed successfully.</div>
      )}
    </div>
  );
}
