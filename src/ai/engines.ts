import type { DiagnosisResult, ClauseResult, MCCBSpecification } from '../types';

export class DiagnosisEngine {
  diagnose(failedResults: ClauseResult[], spec: MCCBSpecification): DiagnosisResult {
    const clauseIds = failedResults.map((r) => r.clauseId);

    // Temperature-rise failure (8.3.3.6)
    if (clauseIds.includes('8.3.3.6')) {
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
          'Verify test conductor cross-section matches IS/IEC 60947-2 Table D.1 for rated current',
          'Re-run test at ambient temperature <35°C or apply ambient correction factor',
        ],
        preventives: [
          'Schedule quarterly calibration of bimetal adjustments',
          'Implement pre-test conductor resistance check (< 5 mΩ per terminal)',
          'Maintain lab ambient at 20°C ± 5°C during all temperature-rise tests',
        ],
        clauseContext: 'IS/IEC 60947-2:2003 Clause 8.3.3.6 limits terminal temperature rise to <= 70 K above ambient.',
      };
    }

    // Dielectric failure (8.3.3.2 / 8.3.3.5)
    if (clauseIds.includes('8.3.3.2') || clauseIds.includes('8.3.3.5')) {
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
        clauseContext: 'IS/IEC 60947-2:2003 Clause 8.3.3.2 — Leakage current <= 0.5 mA at 1.1 Ue for isolation; 2Ui+1000V AC 60s withstand.',
      };
    }

    // Tripping limits failure (8.3.3.1.2 / 8.3.3.1.3 / 8.3.3.7)
    if (clauseIds.some((id) => id.startsWith('8.3.3.1') || id === '8.3.3.7')) {
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
          'Replace bimetal element assembly if trip time deviation exceeds ±20% at 1.10x / 1.45x Ir',
          'Measure and correct control circuit supply voltage stability',
          'Check and replace dashpot fluid if operating temperature range exceeded',
        ],
        preventives: [
          'Annual calibration of trip units using primary injection test',
          'Functional tripping verification (50% sample audit) before shipment',
          'Track bimetal element part numbers and implement life-limit replacement schedule',
        ],
        clauseContext: `IS/IEC 60947-2:2003 Clause 8.3.3.1 — 80% non-trip / 120% trip short-circuit; 90% non-trip / 110% trip overload; 1.45 Ir post thermal test. Rated current: ${spec.ratedCurrent} A.`,
      };
    }

    // Default short-circuit failure
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
        'Verify and adjust magnetic instantaneous trip setpoint (II) to < 10 x In',
        'Recalculate and adjust test circuit impedance to achieve required Ip = Icu x √2 x κ',
      ],
      preventives: [
        'Conduct arc chute plate gap measurement after each short-circuit sequence',
        'Calibrate magnetic trip element annually',
        'Maintain certified test circuit impedance verification records',
      ],
      clauseContext: `IS/IEC 60947-2 Clause 8.3.4 — Ultimate breaking capacity Icu = ${spec.shortCircuitUltimate} kA at Ue = ${spec.ratedVoltage} V.`,
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
        : 'Device meets all evaluated IS/IEC 60947-2:2003 requirements for the tested sequences.');
  }
}

export class ClauseExplainer {
  explain(clauseId: string, inputs: Record<string, number>): string {
    const explanations: Record<string, (i: Record<string, number>) => string> = {
      '8.3.3.1': (i) =>
        `IS/IEC 60947-2:2003 Clause 8.3.3.1 (Tripping Limits & Characteristics): Verifies short-circuit releases at 80% (no trip) and 120% (trip <= 0.2s), overload releases at 90% (no trip) and 110% (trip <= 0.2s), neutral pole at 1.32x Ir, and definite time-delay limits. Rated In: ${i['In'] ?? '?'} A.`,
      '8.3.3.1.2': () =>
        `IS/IEC 60947-2:2003 Clause 8.3.3.1.2 (Opening under short-circuit conditions): Release must NOT operate at 80% Ir_sc for >= 0.2s (inst) or 2x delay (def time). Release MUST operate at 120% Ir_sc within 0.2s (inst) or 2x delay (def time).`,
      '8.3.3.1.3a': () =>
        `IS/IEC 60947-2:2003 Clause 8.3.3.1.3a (Opening under overload conditions): Release must NOT operate at 90% Ir_ol; release MUST operate at 110% Ir_ol. Neutral pole test current is 1.2 x 110% = 1.32 Ir_ol.`,
      '8.3.3.2': (i) =>
        `IS/IEC 60947-2:2003 Clause 8.3.3.2 (Dielectric Properties): Solid-state devices disconnected. Isolation leakage current measured through open contacts at 1.1 Ue must not exceed 0.5 mA per pole. Test voltage: ${i['Ui'] ? 2 * i['Ui'] + 1000 : 2500} V AC.`,
      '8.3.3.3': () =>
        `IS/IEC 60947-2:2003 Clause 8.3.3.3 (Mechanical & Operational Performance): Undervoltage release drop-out between 35% and 70% Vc; no close at 30% Vc, can close at 85% Vc. Shunt release operates at 70% Vc at +55°C. Table 8 operational cycles.`,
      '8.3.3.4': () =>
        `IS/IEC 60947-2:2003 Clause 8.3.3.4 (Overload Performance): For In <= 630A, tested at 6 In AC / 2.5 In DC at 1.05 Ue max, 12 operations (9 manual + 3 automatic).`,
      '8.3.3.5': () =>
        `IS/IEC 60947-2:2003 Clause 8.3.3.5 (Dielectric Withstand Post Overload): Verified post overload test with leakage current <= 2 mA at 1.1 Ue for isolation.`,
      '8.3.3.6': (i) =>
        `IS/IEC 60947-2:2003 Clause 8.3.3.6 (Verification of Temperature-Rise): Tested at conventional thermal current Ith. Terminal temperature rise <= 70 K; handle temperature rise <= 35 K (insulated) / 25 K (metallic).`,
      '8.3.3.7': () =>
        `IS/IEC 60947-2:2003 Clause 8.3.3.7 (Verification of Overload Releases Post Thermal Test): Immediately following 8.3.3.6, operation of overload releases is verified at 1.45 Ir at reference temperature. Trips within conventional tripping time.`,
      '8.3.3.8': () =>
        `IS/IEC 60947-2:2003 Clause 8.3.3.8 (Verification of UV and Shunt Releases at Room Temp): UV release no-trip at 70% min Vc, trip at 35% max Vc. Shunt release trip at 70% min Vc.`,
      '8.3.3.9': () =>
        `IS/IEC 60947-2:2003 Clause 8.3.3.9 (Verification of Main Contact Position): Verify effectiveness of contact position indication for isolation suitability.`,
    };
    const fn = explanations[clauseId];
    return fn ? fn(inputs) : `IS/IEC 60947-2:2003 Clause ${clauseId}: Refer to standard text for detailed specification.`;
  }
}
