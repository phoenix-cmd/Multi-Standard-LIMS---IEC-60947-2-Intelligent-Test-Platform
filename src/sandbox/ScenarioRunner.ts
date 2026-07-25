import type { Scenario, ScenarioConfig, ScenarioComparisonResult } from './ScenarioTypes';
import { globalScenarioEngine } from './ScenarioEngine';
import { globalEventBus } from '../core/events/EventBus';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export class ScenarioRunner {
  private _scenarios: Map<string, Scenario> = new Map();

  create(config: Omit<ScenarioConfig, 'id'>): Scenario {
    const id = uid();
    const scenario: Scenario = {
      id,
      config: { ...config, id },
      status: 'ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Engineer',
    };
    this._scenarios.set(id, scenario);
    globalEventBus.emit('scenario:created', { scenarioId: id, name: config.name });
    return scenario;
  }

  run(id: string): Scenario {
    const scenario = this._scenarios.get(id);
    if (!scenario) throw new Error(`Scenario ${id} not found`);

    scenario.status = 'running';
    scenario.updatedAt = new Date().toISOString();
    globalEventBus.emit('scenario:started', { scenarioId: id });

    try {
      const result = globalScenarioEngine.run(scenario);
      scenario.result = result;
      scenario.status = 'completed';
    } catch (err) {
      scenario.status = 'failed';
      console.error('[ScenarioRunner] Run failed:', err);
    }

    scenario.updatedAt = new Date().toISOString();
    return scenario;
  }

  findAll(): Scenario[] {
    return Array.from(this._scenarios.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  findById(id: string): Scenario | null {
    return this._scenarios.get(id) ?? null;
  }

  delete(id: string): boolean {
    return this._scenarios.delete(id);
  }

  compare(idA: string, idB: string): ScenarioComparisonResult {
    const a = this._scenarios.get(idA);
    const b = this._scenarios.get(idB);
    if (!a || !b) throw new Error('Both scenarios must exist to compare');
    if (!a.result || !b.result) throw new Error('Both scenarios must be completed before comparison');

    const mA = a.result.metrics;
    const mB = b.result.metrics;

    const delta = {
      passRate: +(mB.passRate - mA.passRate).toFixed(1),
      throughputPerDay: +(mB.throughputPerDay - mA.throughputPerDay).toFixed(2),
      laboratoryUtilization: +(mB.laboratoryUtilization - mA.laboratoryUtilization).toFixed(1),
      averageQueueTimeHours: +(mB.averageQueueTimeHours - mA.averageQueueTimeHours).toFixed(2),
      totalDowntimeHours: +(mB.totalDowntimeHours - mA.totalDowntimeHours).toFixed(2),
      costEstimate: +(mB.costEstimate - mA.costEstimate).toFixed(0),
      bottlenecks: mB.totalBottlenecks - mA.totalBottlenecks,
    };

    const scoreA =
      mA.passRate * 0.4 +
      mA.throughputPerDay * 10 -
      mA.totalDowntimeHours * 5 -
      mA.averageQueueTimeHours * 3;

    const scoreB =
      mB.passRate * 0.4 +
      mB.throughputPerDay * 10 -
      mB.totalDowntimeHours * 5 -
      mB.averageQueueTimeHours * 3;

    const winner: 'A' | 'B' | 'tie' =
      Math.abs(scoreA - scoreB) < 1 ? 'tie' : scoreA > scoreB ? 'A' : 'B';

    const winnerName = winner === 'A' ? a.config.name : winner === 'B' ? b.config.name : 'neither';
    const aiSummary = winner === 'tie'
      ? `Both scenarios perform comparably. ${a.config.name} has ${mA.passRate}% pass rate vs ${mB.passRate}% in ${b.config.name}. The primary differentiator is equipment utilization.`
      : `${winnerName} outperforms the alternative with ${winner === 'A' ? mA.passRate : mB.passRate}% pass rate, ${winner === 'A' ? mA.throughputPerDay : mB.throughputPerDay} samples/day throughput, and ${winner === 'A' ? mA.totalBottlenecks : mB.totalBottlenecks} identified bottlenecks. The key advantage is reduced downtime and better queue management.`;

    return { scenarioA: a, scenarioB: b, delta, winner, aiSummary };
  }
}

export const globalScenarioRunner = new ScenarioRunner();
