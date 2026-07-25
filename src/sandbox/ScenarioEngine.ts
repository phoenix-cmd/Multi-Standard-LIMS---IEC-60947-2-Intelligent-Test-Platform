import type {
  Scenario,
  ScenarioConfig,
  ScenarioResult,
  SimEvent,
  SimEventType,
  Bottleneck,
  ResourceUtilization,
  AIRecommendation,
  ScenarioMetrics,
} from './ScenarioTypes';
import { globalEventBus } from '../core/events/EventBus';

// ── Helpers ───────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function isoAt(baseHour: number, offsetHours: number): string {
  const d = new Date(2026, 0, 1, baseHour);
  d.setMinutes(d.getMinutes() + offsetHours * 60);
  return d.toISOString();
}

function simEvent(
  simHour: number,
  type: SimEventType,
  title: string,
  detail: string,
  severity: SimEvent['severity'] = 'info',
  extra?: Partial<SimEvent>
): SimEvent {
  return {
    id: uid(),
    type,
    timestamp: isoAt(8, simHour),
    wallTimestamp: new Date().toISOString(),
    simHour,
    title,
    detail,
    severity,
    ...extra,
  };
}

// ── Core Simulation Engine ────────────────────────────────────

export class ScenarioEngine {
  run(scenario: Scenario): ScenarioResult {
    const cfg = scenario.config;
    const events: SimEvent[] = [];
    const start = performance.now();

    let simHour = 0;
    let completedSamples = 0;
    let failedSamples = 0;
    let totalDowntimeHours = 0;
    let aiInterventions = 0;
    const queueTimes: number[] = [];
    const testDurations: number[] = [];

    // Lab opens
    events.push(simEvent(simHour, 'lab-open', 'Laboratory Opened', `${cfg.engineers.length} engineers present. ${cfg.equipment.length} equipment online.`, 'success'));

    // Sample intake
    for (let i = 0; i < cfg.sampleCount; i++) {
      const arrival = +(simHour + (i * 0.4)).toFixed(2);
      const sampleId = `SMP-${String(i + 1).padStart(3, '0')}`;
      events.push(simEvent(arrival, 'sample-received', `Sample ${sampleId} Received`, `Ready for ${cfg.standardId} testing. Queue position ${i + 1}.`, 'info', { sampleId }));
    }

    // Equipment checks
    for (const eq of cfg.equipment) {
      if (eq.calibrationStatus === 'expired') {
        const failHour = +(simHour + 0.5).toFixed(2);
        events.push(simEvent(failHour, 'calibration-expired', `Calibration Expired: ${eq.name}`, `Equipment ${eq.name} is out of calibration. Testing halted for this instrument.`, 'error', { equipmentId: eq.id }));
        totalDowntimeHours += 2;
        events.push(simEvent(failHour + 2, 'calibration-renewed', `Calibration Renewed: ${eq.name}`, `Emergency calibration completed. Equipment returned to service.`, 'success', { equipmentId: eq.id }));
      }
    }

    // Power check
    if (!cfg.environment.powerAvailable) {
      const failHour = 0.5;
      events.push(simEvent(failHour, 'power-failure', 'Mains Power Failure', 'All non-critical systems shutting down. Switching to emergency power.', 'error'));
      totalDowntimeHours += 1;
      if (cfg.environment.emergencyPower) {
        events.push(simEvent(failHour + 1, 'power-restored', 'Emergency Power Active', 'Generator online. Critical systems restored at reduced capacity.', 'warning'));
      }
    }

    // Test execution simulation
    let testStart = 1.0;
    for (let i = 0; i < cfg.sampleCount; i++) {
      const sampleId = `SMP-${String(i + 1).padStart(3, '0')}`;
      const assignedEngineer = cfg.engineers[i % cfg.engineers.length];
      const queueTime = +(i * 0.3 + (assignedEngineer.role === 'trainee' ? 0.5 : 0)).toFixed(2);
      const testDuration = +(1.5 + Math.random() * 1.5 + (assignedEngineer.errorRate * 2)).toFixed(2);

      queueTimes.push(queueTime);
      testDurations.push(testDuration);

      events.push(simEvent(testStart + queueTime, 'engineer-assigned', `Engineer Assigned: ${assignedEngineer.name}`, `${assignedEngineer.name} assigned to test ${sampleId}. Duration estimate: ${testDuration.toFixed(1)}h.`, 'info', { sampleId, engineerId: assignedEngineer.id }));
      events.push(simEvent(testStart + queueTime + 0.1, 'test-started', `Test Started: ${sampleId}`, `${cfg.standardId} testing commenced on ${sampleId}.`, 'info', { sampleId }));

      // Failure injection
      const primaryEq = cfg.equipment[0];
      if (cfg.failureInjectionEnabled && Math.random() < primaryEq.failureProbability) {
        const failAt = testStart + queueTime + testDuration * 0.5;
        events.push(simEvent(failAt, 'equipment-failure', `Equipment Failure: ${primaryEq.name}`, `Unexpected failure during test ${sampleId}. Test suspended.`, 'error', { equipmentId: primaryEq.id, sampleId }));
        totalDowntimeHours += primaryEq.repairTimeHours ?? 2;

        if (cfg.aiInterventionEnabled) {
          aiInterventions++;
          events.push(simEvent(failAt + 0.25, 'ai-recommendation', 'AI Recommendation Triggered', `AI Copilot suggests rerouting ${sampleId} to secondary bench. Estimated recovery: 45 min.`, 'warning', { sampleId }));
        }

        events.push(simEvent(failAt + (primaryEq.repairTimeHours ?? 2), 'equipment-repaired', `Equipment Repaired: ${primaryEq.name}`, `${primaryEq.name} back online. Resuming test ${sampleId}.`, 'success', { equipmentId: primaryEq.id }));
        failedSamples++;
        testStart += primaryEq.repairTimeHours ?? 2;
      } else {
        completedSamples++;
      }

      events.push(simEvent(testStart + queueTime + testDuration, 'test-completed', `Test Completed: ${sampleId}`, `${sampleId} testing finished. Result recorded.`, 'success', { sampleId }));
      testStart += testDuration;
    }

    // Bottleneck detection
    const bottlenecks: Bottleneck[] = [];
    if (totalDowntimeHours > 2) {
      bottlenecks.push({
        id: uid(),
        type: 'equipment',
        description: 'Equipment downtime exceeded acceptable threshold.',
        impactHours: totalDowntimeHours,
        affectedSamples: failedSamples,
        recommendation: 'Consider redundant equipment and preventive maintenance scheduling.',
      });
    }
    const maxQueueTime = Math.max(...queueTimes, 0);
    if (maxQueueTime > 1.5) {
      bottlenecks.push({
        id: uid(),
        type: 'queue',
        description: 'Sample queue wait time exceeded 1.5 hours.',
        impactHours: maxQueueTime,
        affectedSamples: cfg.sampleCount,
        recommendation: 'Increase engineer availability or stagger sample intake appointments.',
      });
    }

    const expiredEq = cfg.equipment.filter((e) => e.calibrationStatus !== 'valid');
    if (expiredEq.length > 0) {
      bottlenecks.push({
        id: uid(),
        type: 'calibration',
        description: `${expiredEq.length} equipment with invalid calibration caused testing delays.`,
        impactHours: expiredEq.length * 2,
        affectedSamples: Math.ceil(cfg.sampleCount * 0.3),
        recommendation: 'Implement automated calibration expiry alerts 30 days in advance.',
      });
    }

    // Resource utilization
    const resourceUtilization: ResourceUtilization[] = [];
    for (const eng of cfg.engineers) {
      const activeHours = Math.min(cfg.simulationDurationHours * 0.75, eng.availableHours);
      resourceUtilization.push({
        entityId: eng.id,
        entityName: eng.name,
        entityType: 'engineer',
        utilizationPercent: Math.round((activeHours / eng.availableHours) * 100),
        idleHours: +(eng.availableHours - activeHours).toFixed(1),
        activeHours: +activeHours.toFixed(1),
        failureHours: 0,
      });
    }
    for (const eq of cfg.equipment) {
      const failureHours = cfg.failureInjectionEnabled && eq.failureProbability > 0.3
        ? (eq.downtimeHours ?? 1)
        : 0;
      const activeHours = cfg.simulationDurationHours - failureHours;
      resourceUtilization.push({
        entityId: eq.id,
        entityName: eq.name,
        entityType: 'equipment',
        utilizationPercent: Math.round((activeHours / cfg.simulationDurationHours) * 100),
        idleHours: +(cfg.simulationDurationHours * 0.1).toFixed(1),
        activeHours: +activeHours.toFixed(1),
        failureHours: +failureHours.toFixed(1),
      });
    }

    // AI Recommendations
    const aiRecommendations: AIRecommendation[] = [];
    if (bottlenecks.some((b) => b.type === 'equipment')) {
      aiRecommendations.push({
        id: uid(),
        category: 'equipment',
        priority: 'high',
        title: 'Implement Predictive Maintenance',
        rationale: 'Equipment failures caused the most throughput loss in this scenario.',
        expectedImprovement: '40% reduction in unplanned downtime',
        implementationEffort: 'medium',
      });
    }
    if (cfg.engineers.some((e) => e.role === 'trainee')) {
      aiRecommendations.push({
        id: uid(),
        category: 'staffing',
        priority: 'medium',
        title: 'Pair Trainee with Dedicated Mentor',
        rationale: 'Trainee engineers increase error rates and queue times significantly.',
        expectedImprovement: '25% reduction in test errors',
        implementationEffort: 'low',
      });
    }
    if (cfg.sampleCount > 10) {
      aiRecommendations.push({
        id: uid(),
        category: 'scheduling',
        priority: 'high',
        title: 'Staggered Sample Intake Appointments',
        rationale: 'Burst intake creates queue backlogs and engineer overload.',
        expectedImprovement: '30% improvement in average queue time',
        implementationEffort: 'low',
      });
    }
    aiRecommendations.push({
      id: uid(),
      category: 'workflow',
      priority: 'medium',
      title: 'Automate Pre-Test Equipment Checks',
      rationale: 'Manual equipment readiness verification adds 15–20 min per test.',
      expectedImprovement: '15% throughput improvement',
      implementationEffort: 'medium',
    });

    simHour = testStart + 1;
    events.push(simEvent(simHour, 'scenario-complete', 'Simulation Complete', `${completedSamples} of ${cfg.sampleCount} samples tested successfully.`, 'success'));
    events.sort((a, b) => a.simHour - b.simHour);

    const avgQueueTime = queueTimes.length > 0 ? queueTimes.reduce((s, v) => s + v, 0) / queueTimes.length : 0;
    const avgTestDuration = testDurations.length > 0 ? testDurations.reduce((s, v) => s + v, 0) / testDurations.length : 0;
    const labUtil = Math.min(100, Math.round(((completedSamples * avgTestDuration) / (cfg.simulationDurationHours * cfg.engineers.length)) * 100));
    const passRate = cfg.sampleCount > 0 ? Math.round((completedSamples / cfg.sampleCount) * 100) : 0;

    const metrics: ScenarioMetrics = {
      totalSamples: cfg.sampleCount,
      completedSamples,
      failedSamples,
      passRate,
      averageTestDurationHours: +avgTestDuration.toFixed(2),
      averageQueueTimeHours: +avgQueueTime.toFixed(2),
      laboratoryUtilization: labUtil,
      totalDowntimeHours: +totalDowntimeHours.toFixed(2),
      totalBottlenecks: bottlenecks.length,
      aiInterventions,
      costEstimate: +(cfg.sampleCount * 4500 + totalDowntimeHours * 1200).toFixed(0),
      throughputPerDay: +(completedSamples / Math.max(1, cfg.simulationDurationHours / 8)).toFixed(1),
    };

    globalEventBus.emit('scenario:completed', { scenarioId: scenario.id, metrics });

    return {
      scenarioId: scenario.id,
      completedAt: new Date().toISOString(),
      metrics,
      events,
      bottlenecks,
      resourceUtilization,
      aiRecommendations,
      executionDurationMs: Math.round(performance.now() - start),
    };
  }
}

export const globalScenarioEngine = new ScenarioEngine();
