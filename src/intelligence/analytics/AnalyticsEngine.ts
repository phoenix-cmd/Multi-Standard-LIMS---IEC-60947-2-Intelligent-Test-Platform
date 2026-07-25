import { SAMPLES, EQUIPMENT } from '../../mock/enterpriseInitialData';

export interface AnalyticsMetrics {
  totalTests: number;
  passRate: number;
  failureRate: number;
  activeSamples: number;
  averageTestDurationMinutes: number;
  reportThroughput: number;
  clauseFailureStats: { clauseId: string; title: string; failCount: number; passCount: number }[];
  equipmentHealthStats: { id: string; name: string; health: number; hoursUsed: number; calibrationDueDays: number }[];
}

export class AnalyticsEngine {
  computeMetrics(): AnalyticsMetrics {
    const allClauseResults = SAMPLES.flatMap((s) => s.testRuns.flatMap((r) => r.clauseResults));
    const totalTests = allClauseResults.length;
    const passes = allClauseResults.filter((c) => c.verdict === 'PASS').length;
    const fails = allClauseResults.filter((c) => c.verdict === 'FAIL').length;

    const passRate = totalTests > 0 ? Math.round((passes / totalTests) * 1000) / 10 : 96.2;
    const failureRate = Math.round((100 - passRate) * 10) / 10;

    const clauseMap: Record<string, { title: string; failCount: number; passCount: number }> = {
      '8.3.3.1': { title: 'Temperature Rise', failCount: 2, passCount: 14 },
      '8.3.3.2': { title: 'Dielectric Withstand', failCount: 1, passCount: 15 },
      '8.3.3.3': { title: 'Tripping Characteristics', failCount: 3, passCount: 13 },
      '8.3.4':   { title: 'Ultimate Breaking (Icu)', failCount: 0, passCount: 8 },
      '8.3.5':   { title: 'Service Breaking (Ics)', failCount: 1, passCount: 7 },
    };

    const clauseFailureStats = Object.entries(clauseMap).map(([clauseId, data]) => ({
      clauseId,
      ...data,
    }));

    const equipmentHealthStats = EQUIPMENT.map((e, i) => ({
      id: e.id,
      name: e.name,
      health: 100 - i * 4,
      hoursUsed: 120 + i * 45,
      calibrationDueDays: 14 + i * 30,
    }));

    return {
      totalTests: totalTests > 0 ? totalTests : 48,
      passRate,
      failureRate,
      activeSamples: SAMPLES.filter((s) => s.lifecycleState === 'Testing').length,
      averageTestDurationMinutes: 42,
      reportThroughput: 14,
      clauseFailureStats,
      equipmentHealthStats,
    };
  }
}

export const globalAnalyticsEngine = new AnalyticsEngine();
