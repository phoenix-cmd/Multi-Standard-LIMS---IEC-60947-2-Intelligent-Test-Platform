import type { StandardPlugin } from '../api/StandardPlugin';

export const UL489_Plugin: StandardPlugin = {
  metadata: {
    id: 'ul489',
    name: 'UL 489 — Molded-Case Circuit Breakers, Switches and Enclosures',
    scope: 'North American safety standard for molded-case circuit breakers',
    revision: '14th Edition 2019',
    organization: 'UL',
    publishedYear: 2019,
  },
  clauses: [
    { id: '7.1.1', title: 'Calibration Test at 135% Rating', description: 'Breaker must trip within allowed time at 135% rated current.', category: 'Tripping', sequence: ['Seq I'] },
    { id: '7.1.2', title: 'Calibration Test at 200% Rating', description: 'Breaker must trip within specified max time at 200% rated current.', category: 'Tripping', sequence: ['Seq I'] },
    { id: '7.1.4', title: 'Dielectric Voltage-Withstand Test', description: '1000 V + 2x rated voltage for 60 seconds.', category: 'Dielectric', sequence: ['Seq I'] },
  ],
  formulas: [
    { id: 'ul_trip_135', label: '135% Trip Current', expression: '1.35 * In', unit: 'A', description: 'UL 489 135% calibration current' },
  ],
  rules: [],
  defaultWorkflowDSL: `workflow: ul-489-standard-sequence
version: v1.0
nodes:
  - id: start
    type: start
  - id: ul_135
    type: test
    clause: 7.1.1
  - id: ul_dielectric
    type: test
    clause: 7.1.4
  - id: end
    type: end`,
  evaluateRule(ruleId: string, measuredValues: Record<string, number>) {
    return { verdict: 'PASS', message: 'UL 489 rule evaluation passed.' };
  },
};
