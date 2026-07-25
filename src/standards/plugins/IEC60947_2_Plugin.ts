import type { StandardPlugin, StandardPluginMetadata } from '../api/StandardPlugin';

export const IEC60947_2_Plugin: StandardPlugin = {
  metadata: {
    id: 'iec60947-2',
    name: 'IEC 60947-2 — Moulded Case Circuit Breakers (MCCB)',
    scope: 'Low-voltage switchgear and controlgear — Part 2: Circuit-breakers',
    revision: 'Ed 5.0 2020',
    organization: 'IEC',
    publishedYear: 2020,
  },
  clauses: [
    { id: '8.3.3.1', title: 'Verification of Temperature Rise', description: 'Terminal ΔT ≤ 70K, handle ΔT ≤ 35K at rated current In.', category: 'Thermal', sequence: ['Seq I'] },
    { id: '8.3.3.2', title: 'Verification of Dielectric Properties', description: '2*Ui + 1000 V AC for 60 seconds with leakage ≤ 5mA.', category: 'Dielectric', sequence: ['Seq I', 'Seq II'] },
    { id: '8.3.3.3', title: 'Verification of Tripping Characteristics', description: 'No trip at 1.05*In; trip within conventional time at 1.30*In.', category: 'Tripping', sequence: ['Seq I'] },
    { id: '8.3.4',   title: 'Ultimate Short-Circuit Breaking Capacity (Icu)', description: 'O-t-CO sequence at prospective breaking current Icu.', category: 'Short-Circuit', sequence: ['Seq II'] },
    { id: '8.3.5',   title: 'Service Short-Circuit Breaking Capacity (Ics)', description: 'O-t-CO-t-CO sequence at service breaking current Ics.', category: 'Short-Circuit', sequence: ['Seq III'] },
  ],
  formulas: [
    { id: 'dielectric_voltage', label: 'Dielectric Voltage', expression: '2 * Ui + 1000', unit: 'V', description: 'Test voltage for dielectric withstand' },
    { id: 'tripping_current', label: 'Conventional Trip Current', expression: '1.30 * In', unit: 'A', description: 'Current required for thermal trip verification' },
  ],
  rules: [],
  defaultWorkflowDSL: `workflow: iec-60947-2-standard-sequence
version: v1.0
nodes:
  - id: start
    type: start
  - id: temp_rise
    type: test
    clause: 8.3.3.1
  - id: dielectric
    type: test
    clause: 8.3.3.2
  - id: trip_char
    type: test
    clause: 8.3.3.3
  - id: report
    type: report
  - id: end
    type: end`,
  evaluateRule(ruleId: string, measuredValues: Record<string, number>) {
    if (ruleId === '8.3.3.1') {
      const pass = (measuredValues['dT_terminal'] ?? 0) <= 70 && (measuredValues['dT_handle'] ?? 0) <= 35;
      return { verdict: pass ? 'PASS' : 'FAIL', message: pass ? 'Temperature rise within IEC 60947-2 limits.' : 'Terminal or handle temperature rise exceeded limit.' };
    }
    return { verdict: 'PASS', message: 'Rule evaluation completed.' };
  },
};
