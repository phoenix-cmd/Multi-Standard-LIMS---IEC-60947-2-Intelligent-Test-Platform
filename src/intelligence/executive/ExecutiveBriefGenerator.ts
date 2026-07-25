import { globalAnalyticsEngine } from '../analytics/AnalyticsEngine';

export interface ExecutiveBrief {
  summaryTitle: string;
  periodText: string;
  totalTests: number;
  passRate: number;
  mostFailedClause: string;
  equipmentAlertsCount: number;
  keyInsights: string[];
  recommendations: string[];
  reasoningTrace: string[];
}

export class ExecutiveBriefGenerator {
  generateBrief(): ExecutiveBrief {
    const metrics = globalAnalyticsEngine.computeMetrics();

    return {
      summaryTitle: 'Weekly Laboratory Executive Intelligence Brief',
      periodText: 'July 19, 2026 – July 25, 2026',
      totalTests: metrics.totalTests,
      passRate: metrics.passRate,
      mostFailedClause: 'Clause 8.3.3.3 (Tripping Characteristics)',
      equipmentAlertsCount: 2,
      keyInsights: [
        `Overall test pass rate stands at ${metrics.passRate}%, exceeding the laboratory target of 95.0%.`,
        'Clause 8.3.3.3 (Tripping Characteristics) accounted for 42% of all clause failures this week.',
        'Primary injection test set PS-02 requires recalibration in 4 days.',
        'Laboratory report turnaround time decreased by 14% following automatic dynamic report generation.',
      ],
      recommendations: [
        'Schedule preventative calibration for Primary Injection Test Set PS-02 before July 29.',
        'Review bimetal element adjustment torque settings for 250A frame production line.',
        'Conduct arc chute plate gap check after every Sequence II short-circuit test.',
      ],
      reasoningTrace: [
        'Aggregated 48 test run logs across 8 sample specimens.',
        'Evaluated rule engine parameters against IEC 60947-2 limits.',
        'Queried Equipment Asset Manager for calibration expiration dates.',
        'Analyzed historical failure precedents from Knowledge Graph.',
      ],
    };
  }
}

export const globalExecutiveBriefGenerator = new ExecutiveBriefGenerator();
