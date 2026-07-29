import { describe, it, expect } from 'vitest';
import { IEC60947_2_Plugin, IEC60947_2_2003_RULE_CATALOG } from '../IEC60947_2_Plugin';
import { StandardRuleEngine } from '../../api/StandardRuleEngine';

describe('IS/IEC 60947-2:2003 Standard Rule Engine & Plugin Evaluation', () => {
  const engine = new StandardRuleEngine();

  describe('Clause 8.3.3.1.2 — Short-Circuit Release Tripping Limits (80% & 120%)', () => {
    it('80% Ir_sc Non-Tripping: PASSes when maintained for >= 0.2s without tripping', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.1.2_short_circuit_80'];
      const res = engine.evaluateDeclarativeRule(config, { tripped_80: false, duration_80: 0.2 });
      expect(res.verdict).toBe('PASS');
      expect(res.evidence?.measuredValue).toBe('Maintained for 0.2s');
      expect(res.evidence?.standardEdition).toBe('IS/IEC 60947-2:2003');
    });

    it('80% Ir_sc Non-Tripping: FAILs if breaker trips at 80% Ir_sc', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.1.2_short_circuit_80'];
      const res = engine.evaluateDeclarativeRule(config, { tripped_80: true, duration_80: 0.05 });
      expect(res.verdict).toBe('FAIL');
      expect(res.violatedClause).toBe('8.3.3.1.2');
      expect(res.explanation).toContain('improperly tripped');
    });

    it('120% Ir_sc Tripping: PASSes when breaker trips in <= 0.2s', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.1.2_short_circuit_120'];
      const res = engine.evaluateDeclarativeRule(config, { tripped_120: true, tripTime_120: 0.08 });
      expect(res.verdict).toBe('PASS');
      expect(res.evidence?.measuredValue).toBe(0.08);
      expect(res.evidence?.expectedLimit).toBe(0.2);
    });

    it('120% Ir_sc Tripping: FAILs if trip time exceeds 0.2s (e.g. 0.21s)', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.1.2_short_circuit_120'];
      const res = engine.evaluateDeclarativeRule(config, { tripped_120: true, tripTime_120: 0.21 });
      expect(res.verdict).toBe('FAIL');
      expect(res.violatedClause).toBe('8.3.3.1.2');
    });
  });

  describe('Clause 8.3.3.1.3a — Overload Release Tripping Limits (90%, 110%, Neutral 1.32x)', () => {
    it('90% Ir_ol Non-Tripping: PASSes when maintained >= 0.2s', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.1.3a_overload_90'];
      const res = engine.evaluateDeclarativeRule(config, { tripped_90: false, duration_90: 0.25 });
      expect(res.verdict).toBe('PASS');
    });

    it('110% Ir_ol Tripping: PASSes when trip time <= 0.2s', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.1.3a_overload_110'];
      const res = engine.evaluateDeclarativeRule(config, { tripped_110: true, tripTime_110: 0.15 });
      expect(res.verdict).toBe('PASS');
    });

    it('Neutral Pole Overload Release (1.2 x 110% = 1.32 Ir_ol): PASSes when trip time <= 0.2s', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.1.3a_neutral_overload'];
      const res = engine.evaluateDeclarativeRule(config, { tripped_neutral: true, tripTime_neutral: 0.14 });
      expect(res.verdict).toBe('PASS');
      expect(res.explanation).toContain('1.32x Ir');
    });

    it('Neutral Pole Overload Release: FAILs when trip time exceeds limit', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.1.3a_neutral_overload'];
      const res = engine.evaluateDeclarativeRule(config, { tripped_neutral: true, tripTime_neutral: 0.35 });
      expect(res.verdict).toBe('FAIL');
    });
  });

  describe('Clause 8.3.3.1.4 — Definite Time-Delay & Non-Tripping Duration', () => {
    it('8.3.3.1.4a Time-Delay: PASSes within [0.1s, 0.5s] bounds', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.1.4a_definite_delay'];
      const res = engine.evaluateDeclarativeRule(config, { measuredDelay: 0.3 });
      expect(res.verdict).toBe('PASS');
    });

    it('8.3.3.1.4a Time-Delay: FAILs outside bounds (e.g. 0.08s or 0.55s)', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.1.4a_definite_delay'];
      const resLow = engine.evaluateDeclarativeRule(config, { measuredDelay: 0.08 });
      const resHigh = engine.evaluateDeclarativeRule(config, { measuredDelay: 0.55 });
      expect(resLow.verdict).toBe('FAIL');
      expect(resHigh.verdict).toBe('FAIL');
    });

    it('8.3.3.1.4b Non-Tripping Duration: PASSes when breaker does not trip', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.1.4b_non_tripping_dur'];
      const res = engine.evaluateDeclarativeRule(config, { trippedDuringDelay: false });
      expect(res.verdict).toBe('PASS');
    });
  });

  describe('Clause 8.3.3.2 & 8.3.3.5 — Dielectric Properties & Isolation Leakage Limits', () => {
    it('8.3.3.2 Isolation Leakage: PASSes at exact boundary 0.50 mA', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.2_dielectric_properties'];
      const res = engine.evaluateDeclarativeRule(config, { leakageCurrentmA: 0.50, flashoverDetected: false });
      expect(res.verdict).toBe('PASS');
    });

    it('8.3.3.2 Isolation Leakage: FAILs at 0.51 mA', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.2_dielectric_properties'];
      const res = engine.evaluateDeclarativeRule(config, { leakageCurrentmA: 0.51, flashoverDetected: false });
      expect(res.verdict).toBe('FAIL');
      expect(res.violatedClause).toBe('8.3.3.2');
    });

    it('8.3.3.5 Post-Overload Dielectric Leakage: PASSes at 2.00 mA, FAILs at 2.01 mA', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.5_dielectric_withstand'];
      const resPass = engine.evaluateDeclarativeRule(config, { postOverloadLeakage: 2.00 });
      const resFail = engine.evaluateDeclarativeRule(config, { postOverloadLeakage: 2.01 });
      expect(resPass.verdict).toBe('PASS');
      expect(resFail.verdict).toBe('FAIL');
    });
  });

  describe('Clause 8.3.3.3.2 & 8.3.3.8 — Undervoltage & Shunt Release Thresholds', () => {
    it('UV Drop-Out Voltage Ratio: PASSes at 35% and 70% bounds', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.3.2_uv_drop_out'];
      const resMin = engine.evaluateDeclarativeRule(config, { dropOutVoltageRatio: 0.35 });
      const resMax = engine.evaluateDeclarativeRule(config, { dropOutVoltageRatio: 0.70 });
      expect(resMin.verdict).toBe('PASS');
      expect(resMax.verdict).toBe('PASS');
    });

    it('UV Drop-Out Voltage Ratio: FAILs at 34.9% or 70.1%', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.3.2_uv_drop_out'];
      const resLow = engine.evaluateDeclarativeRule(config, { dropOutVoltageRatio: 0.349 });
      const resHigh = engine.evaluateDeclarativeRule(config, { dropOutVoltageRatio: 0.701 });
      expect(resLow.verdict).toBe('FAIL');
      expect(resHigh.verdict).toBe('FAIL');
    });

    it('Shunt Release Operation (+55°C): PASSes at 70% Vc', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.3.2_shunt_operation'];
      const res = engine.evaluateDeclarativeRule(config, { shuntOperated: true, shuntVoltageRatio: 0.70 });
      expect(res.verdict).toBe('PASS');
    });
  });

  describe('Clause 8.3.3.6 & 8.3.3.7 — Temperature-Rise & Post-Thermal Overload Verification', () => {
    it('8.3.3.6 Terminal ΔT: PASSes at exact boundary 70.0 K, FAILs at 70.1 K', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.6_temperature_rise'];
      const resPass = engine.evaluateDeclarativeRule(config, { dT_terminal_R: 70.0, dT_terminal_S: 65, dT_terminal_T: 68, dT_handle: 35.0 });
      const resFail = engine.evaluateDeclarativeRule(config, { dT_terminal_R: 70.1, dT_terminal_S: 65, dT_terminal_T: 68, dT_handle: 35.0 });
      expect(resPass.verdict).toBe('PASS');
      expect(resFail.verdict).toBe('FAIL');
      expect(resFail.violatedClause).toBe('8.3.3.6');
    });

    it('8.3.3.6 Handle ΔT: FAILs if handle temperature rise exceeds 35.0 K (e.g. 35.2 K)', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.6_temperature_rise'];
      const res = engine.evaluateDeclarativeRule(config, { dT_terminal_R: 60, dT_terminal_S: 60, dT_terminal_T: 60, dT_handle: 35.2 });
      expect(res.verdict).toBe('FAIL');
    });

    it('8.3.3.7 Overload Release Verification at 1.45 Ir: PASSes when operated post thermal test', () => {
      const config = IEC60947_2_2003_RULE_CATALOG['8.3.3.7_overload_releases_verification'];
      const res = engine.evaluateDeclarativeRule(config, { tripped_145: true, tripTime_145: 450, tripLimit_max: 7200 });
      expect(res.verdict).toBe('PASS');
      expect(res.evidence?.measuredValue).toBe(450);
    });
  });

  describe('Plugin Integration & Fallback Handling', () => {
    it('Plugin metadata specifies IS/IEC 60947-2:2003', () => {
      expect(IEC60947_2_Plugin.metadata.revision).toBe('IS/IEC 60947-2:2003');
      expect(IEC60947_2_Plugin.metadata.organization).toBe('BIS / IEC');
    });

    it('Plugin evaluateRule evaluates catalog rule and returns structured evidence', () => {
      const result = IEC60947_2_Plugin.evaluateRule('8.3.3.6_temperature_rise', { dT_terminal_R: 55, dT_terminal_S: 58, dT_terminal_T: 54, dT_handle: 20 });
      expect(result.verdict).toBe('PASS');
      expect(result.evidence?.standardEdition).toBe('IS/IEC 60947-2:2003');
      expect(result.explanation).toContain('Temperature-rise within standard limits');
    });
  });
});
