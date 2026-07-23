import type { DiagnosisResult, ClauseResult, MCCBSpecification } from '../types';

export class DiagnosisEngine {
  diagnose(failedResults: ClauseResult[], spec: MCCBSpecification): DiagnosisResult {
    const clauseIds = failedResults.map((r) => r.clauseId);

    // Temperature-rise failure
    if (clauseIds.includes('8.3.3.1')) {
      return {
        failureMechanism: 'Excessive Terminal Temperature Rise',
        rootCauses: [
          { cause: 'High contact resistance at terminal clamp interface (loose connection torque)', probability: 42 },
          { cause: 'Incorrect rated current calibration — bimetal element deflection offset', probability: 28 },
          { cause: 'Inadequate conductor cross-section used during test setup', probability: 18 },
          { cause: 'Ambient temperature correction factor not applied (>35°C lab conditions)', probability: 12 },
        ],
        riskLevel: 'Major' as 'High',
        correctives: [
          'Verify and re-torque terminal connections to manufacturer specification (typically 4–6 N·m for 250A frame)',
          'Re-calibrate bimetal trip element using certified calibration current source',
          'Verify test conductor cross-section matches IEC 60947-2 Table D.1 for rated current',
          'Re-run test at ambient temperature <35°C or apply ambient correction factor',
        ],
        preventives: [
          'Schedule quarterly calibration of bimetal adjustments',
          'Implement pre-test conductor resistance check (< 5 mΩ per terminal)',
          'Maintain lab ambient at 20°C ± 5°C during all temperature-rise tests',
        ],
        clauseContext: 'IEC 60947-2 Clause 8.3.3.1 limits terminal temperature rise to ≤ 70 K above ambient.',
      };
    }

    // Dielectric failure
    if (clauseIds.includes('8.3.3.2')) {
      return {
        failureMechanism: 'Dielectric Insulation Breakdown',
        rootCauses: [
          { cause: 'Carbonized conducting tracks across arc chute side plates (post short-circuit arcing)', probability: 55 },
          { cause: 'Eroded contact material bridging across main contact gap (insufficient arc energy dissipation)', probability: 25 },
          { cause: 'Surface moisture condensation on creepage distances in humid lab environment', probability: 12 },
          { cause: 'Mechanical damage to insulating housing during previous sequence operations', probability: 8 },
        ],
        riskLevel: 'Critical' as 'Critical',
        correctives: [
          'Disassemble arc chute assembly and clean carbonized deposits with isopropyl alcohol and dry nitrogen purge',
          'Inspect and replace contact assembly if erosion depth exceeds 1.5 mm',
          'Condition sample in dry cabinet at 50°C/10% RH for 2 hours prior to re-test',
          'Replace insulating housing if mechanical damage detected on visual inspection',
        ],
        preventives: [
          'Perform arc chute inspection after every Sequence II short-circuit operation',
          'Maintain lab humidity below 75% RH; use desiccant storage for samples',
          'Photograph arc chute before and after each high-current test sequence',
        ],
        clauseContext: 'IEC 60947-2 Clause 8.3.3.2 — Dielectric test voltage: 2500 V (1 min) with no flashover/puncture permitted.',
      };
    }

    // Tripping characteristic failure
    if (clauseIds.includes('8.3.3.3')) {
      return {
        failureMechanism: 'Tripping Characteristic Out of Tolerance',
        rootCauses: [
          { cause: 'Electronic trip unit parameter drift — time-delay relay setpoint shifted from factory calibration', probability: 48 },
          { cause: 'Bimetal element fatigue — creep deflection after extended thermal cycling', probability: 32 },
          { cause: 'Control circuit power supply ripple affecting trip timing accuracy (>±5% Vcc)', probability: 12 },
          { cause: 'Mechanical dashpot fluid viscosity change (temperature-sensitive delay element)', probability: 8 },
        ],
        riskLevel: 'Critical' as 'Critical',
        correctives: [
          'Recalibrate electronic trip unit using certified primary injection test set',
          'Replace bimetal element assembly if trip time deviation exceeds ±20% at 1.3 × In',
          'Measure and correct control circuit supply voltage stability',
          'Check and replace dashpot fluid if operating temperature range exceeded',
        ],
        preventives: [
          'Annual calibration of trip units using primary injection test',
          'Functional tripping verification (50% sample audit) before shipment',
          'Track bimetal element part numbers and implement life-limit replacement schedule',
        ],
        clauseContext: `IEC 60947-2 Clause 8.3.3.3 — Must not trip at 1.05×In; must trip within specified time at 1.30×In. Rated current: ${spec.ratedCurrent} A.`,
      };
    }

    // Short-circuit failure
    return {
      failureMechanism: 'Short-Circuit Breaking Capacity Non-Compliance',
      rootCauses: [
        { cause: `Contact welding observed — contact material (AgCdO) insufficient for ${spec.shortCircuitUltimate} kA Icu`, probability: 38 },
        { cause: 'Arc chute deionization failure — arc elongation path blocked by deformed plates', probability: 30 },
        { cause: 'Thermal actuator operated before magnetic element on instantaneous trip (coordination failure)', probability: 20 },
        { cause: 'Test circuit impedance higher than required — peak current undershooting calculated Ipeak', probability: 12 },
      ],
      riskLevel: 'Critical',
      correctives: [
        'Replace contact material grade — evaluate AgW (Silver-Tungsten) for higher arc erosion resistance',
        'Inspect, clean and re-align arc chute deionizing plates',
        'Verify and adjust magnetic instantaneous trip setpoint (II) to < 10 × In',
        'Recalculate and adjust test circuit impedance to achieve required Ip = Icu × √2 × κ',
      ],
      preventives: [
        'Conduct arc chute plate gap measurement after each short-circuit sequence',
        'Calibrate magnetic trip element annually',
        'Maintain certified test circuit impedance verification records',
      ],
      clauseContext: `IEC 60947-2 Clause 8.3.4 — Ultimate breaking capacity Icu = ${spec.shortCircuitUltimate} kA at Ue = ${spec.ratedVoltage} V.`,
    };
  }
}

export class RecommendationEngine {
  recommend(diagnosis: DiagnosisResult): string[] {
    const priority = diagnosis.rootCauses
      .sort((a: { cause: string; probability: number }, b: { cause: string; probability: number }) => b.probability - a.probability)
      .slice(0, 3)
      .map((c, i) => `${i + 1}. [${c.probability}% probability] ${c.cause}`);
    return [
      '--- Priority Root Causes ---',
      ...priority,
      '',
      '--- Immediate Corrective Actions ---',
      ...diagnosis.correctives,
      '',
      '--- Preventive Measures ---',
      ...diagnosis.preventives,
    ];
  }
}

export class ConsistencyChecker {
  check(inputs: Record<string, number>, spec: MCCBSpecification): string[] {
    const warnings: string[] = [];
    if (inputs['In'] && Math.abs(inputs['In'] - spec.ratedCurrent) > 5)
      warnings.push(`Measured In (${inputs['In']}A) deviates >5A from rated In (${spec.ratedCurrent}A).`);
    if (inputs['Icu'] && inputs['Icu'] > spec.shortCircuitUltimate * 1.1)
      warnings.push(`Applied Icu (${inputs['Icu']}kA) exceeds declared rating by >10%.`);
    if (inputs['Ics'] && inputs['Ics'] > inputs['Icu'])
      warnings.push('Ics cannot exceed Icu — data inconsistency detected.');
    return warnings;
  }
}

export class SummaryGenerator {
  generate(results: ClauseResult[], spec: MCCBSpecification): string {
    const pass = results.filter((r) => r.verdict === 'PASS').length;
    const fail = results.filter((r) => r.verdict === 'FAIL').length;
    const na = results.filter((r) => r.verdict === 'NA').length;
    const overall = fail === 0 ? 'PASSED' : 'FAILED';
    return `Test Summary — ${spec.manufacturer} ${spec.model} (${spec.ratedCurrent}A, ${spec.ratedVoltage}V, ${spec.shortCircuitUltimate}kA Icu, ${spec.poles}P): ` +
      `${pass} clauses PASS, ${fail} clauses FAIL, ${na} N/A. ` +
      `Overall verdict: ${overall}. ` +
      (fail > 0
        ? `Immediate corrective action required for ${fail} failing clause(s). Refer to AI Diagnosis panel.`
        : 'Device meets all evaluated IEC 60947-2 requirements for the tested sequences.');
  }
}

export class ClauseExplainer {
  explain(clauseId: string, inputs: Record<string, number>): string {
    const explanations: Record<string, (i: Record<string, number>) => string> = {
      '8.3.3.1': (i) =>
        `Clause 8.3.3.1 (Temperature Rise): The MCCB terminals must not exceed 70 K rise above ambient when carrying rated current (${i['In'] ?? '?'} A) for ≥1 hour. Accessible parts must not exceed 25 K (metal) / 35 K (insulated). Measured: ${i['dT_terminal'] ?? '?'} K.`,
      '8.3.3.2': (i) =>
        `Clause 8.3.3.2 (Dielectric Withstand): After all short-circuit sequences, the MCCB must withstand ${i['Ui'] ? 2 * i['Ui'] + 1000 : 2500} V AC for 1 minute without flashover or puncture. Confirms arc-damage has not compromised creepage distances.`,
      '8.3.3.3': (i) =>
        `Clause 8.3.3.3 (Tripping Characteristics): Must NOT trip at 1.05×In (${i['In'] ? (1.05 * i['In']).toFixed(1) : '?'} A) within defined time. MUST trip within allowed band at 1.30×In (${i['In'] ? (1.30 * i['In']).toFixed(1) : '?'} A). Electronic units have narrower tolerance bands.`,
      '8.3.4': (i) =>
        `Clause 8.3.4 (Icu — Ultimate Breaking Capacity): Device must successfully interrupt ${i['Icu'] ?? '?'} kA (rms) prospective short-circuit current in O–CO sequence, then pass subsequent dielectric test.`,
      '8.3.5': (i) =>
        `Clause 8.3.5 (Ics — Service Breaking Capacity): Device must interrupt ${i['Ics'] ?? '?'} kA three times (O–CO–CO), then pass temperature-rise and tripping verification — demonstrating repeated service-grade performance.`,
    };
    const fn = explanations[clauseId];
    return fn ? fn(inputs) : `Clause ${clauseId}: No detailed explanation available. Refer to IEC 60947-2 standard text.`;
  }
}
