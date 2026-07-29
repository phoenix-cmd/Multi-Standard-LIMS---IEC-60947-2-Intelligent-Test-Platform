import type { ClauseResult, DeclarativeRuleConfig, RuleEvidence, Verdict } from '../../types';

export class StandardRuleEngine {
  /**
   * Evaluates a declarative rule configuration against an input dictionary.
   * Returns a complete ClauseResult containing structured evidence and explanations.
   */
  evaluateDeclarativeRule(
    config: DeclarativeRuleConfig,
    inputs: Record<string, number | string | boolean>
  ): ClauseResult {
    const { ruleId, clauseId, title, edition, passMessageTemplate, failMessageTemplate, parameters } = config;

    let verdict: Verdict = 'PASS';
    let measuredVal: number | string = 0;
    let expectedLimit: number | string = 0;
    let unit = '';
    let operator = '';
    let explanation = '';
    let violatedClause: string | null = null;
    let parameterName = '';

    switch (ruleId) {
      case '8.3.3.1.2_short_circuit_80': {
        parameterName = 'tripped_80';
        const tripped = Boolean(inputs['tripped_80']);
        const dur = Number(inputs['duration_80'] ?? 0);
        const reqDur = Number(parameters['minHoldDurationSec'] ?? 0.2);

        measuredVal = tripped ? 'Tripped' : `Maintained for ${dur}s`;
        expectedLimit = `No Trip for >= ${reqDur}s`;
        unit = 's';
        operator = '== false';

        if (tripped || dur < reqDur) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Breaker improperly tripped or current not maintained at 80% Ir_sc (${dur}s vs required ${reqDur}s). Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Measured current maintained at 80% Ir_sc for ${dur}s without tripping. PASS.`;
        }
        break;
      }

      case '8.3.3.1.2_short_circuit_120': {
        parameterName = 'tripTime_120';
        const tripped = Boolean(inputs['tripped_120'] ?? true);
        const tripTime = Number(inputs['tripTime_120'] ?? 0);
        const maxTime = Number(parameters['maxTripTimeSec'] ?? 0.2);

        measuredVal = tripTime;
        expectedLimit = maxTime;
        unit = 's';
        operator = '<=';

        if (!tripped || tripTime > maxTime) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Breaker failed to trip within ${maxTime}s at 120% Ir_sc (Measured: ${tripTime}s). Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Breaker correctly operated in ${tripTime}s (<= ${maxTime}s) at 120% Ir_sc. PASS.`;
        }
        break;
      }

      case '8.3.3.1.3a_overload_90': {
        parameterName = 'tripped_90';
        const tripped = Boolean(inputs['tripped_90']);
        const dur = Number(inputs['duration_90'] ?? 0);
        const reqDur = Number(parameters['minHoldDurationSec'] ?? 0.2);

        measuredVal = tripped ? 'Tripped' : `Maintained for ${dur}s`;
        expectedLimit = `No Trip for >= ${reqDur}s`;
        unit = 's';
        operator = '== false';

        if (tripped || dur < reqDur) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Breaker tripped at 90% overload setting (or current not maintained for ${reqDur}s). Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Breaker did not trip at 90% overload setting for ${dur}s. PASS.`;
        }
        break;
      }

      case '8.3.3.1.3a_overload_110': {
        parameterName = 'tripTime_110';
        const tripped = Boolean(inputs['tripped_110'] ?? true);
        const tripTime = Number(inputs['tripTime_110'] ?? 0);
        const maxTime = Number(parameters['maxTripTimeSec'] ?? 0.2);

        measuredVal = tripTime;
        expectedLimit = maxTime;
        unit = 's';
        operator = '<=';

        if (!tripped || tripTime > maxTime) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Breaker failed to trip within ${maxTime}s at 110% overload setting (Measured: ${tripTime}s). Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Breaker operated in ${tripTime}s (<= ${maxTime}s) at 110% overload setting. PASS.`;
        }
        break;
      }

      case '8.3.3.1.3a_neutral_overload': {
        parameterName = 'tripTime_neutral';
        const tripped = Boolean(inputs['tripped_neutral'] ?? true);
        const tripTime = Number(inputs['tripTime_neutral'] ?? 0);
        const maxTime = Number(parameters['maxTripTimeSec'] ?? 0.2);
        const factor = Number(parameters['neutralCurrentMultiplier'] ?? 1.32);

        measuredVal = tripTime;
        expectedLimit = maxTime;
        unit = 's';
        operator = '<=';

        if (!tripped || tripTime > maxTime) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Neutral pole release failed to operate within ${maxTime}s at ${factor}x Ir (1.2 x 110%). Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Neutral pole release correctly operated in ${tripTime}s at ${factor}x Ir. PASS.`;
        }
        break;
      }

      case '8.3.3.1.4a_definite_delay': {
        parameterName = 'measuredDelay';
        const delay = Number(inputs['measuredDelay'] ?? 0);
        const minDelay = Number(parameters['minDelaySec'] ?? 0.1);
        const maxDelay = Number(parameters['maxDelaySec'] ?? 0.5);

        measuredVal = delay;
        expectedLimit = `[${minDelay}, ${maxDelay}]`;
        unit = 's';
        operator = 'between';

        if (delay < minDelay || delay > maxDelay) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Definite time-delay measured (${delay}s) outside manufacturer limits [${minDelay}s, ${maxDelay}s] at 1.5x Ir. Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Definite time-delay measured (${delay}s) within limits [${minDelay}s, ${maxDelay}s]. PASS.`;
        }
        break;
      }

      case '8.3.3.1.4b_non_tripping_dur': {
        parameterName = 'trippedDuringDelay';
        const tripped = Boolean(inputs['trippedDuringDelay']);
        measuredVal = tripped ? 'Tripped' : 'No Trip';
        expectedLimit = 'No Trip';
        operator = '== false';

        if (tripped) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Breaker improperly tripped during non-tripping duration test at 1.5x Ir. Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Breaker withstood non-tripping duration at 1.5x Ir then 1.0x In without tripping. PASS.`;
        }
        break;
      }

      case '8.3.3.2_dielectric_properties': {
        parameterName = 'leakageCurrentmA';
        const leakage = Number(inputs['leakageCurrentmA'] ?? 0);
        const flashover = Boolean(inputs['flashoverDetected']);
        const limit = Number(parameters['maxLeakageCurrentmA'] ?? 0.5);

        measuredVal = leakage;
        expectedLimit = limit;
        unit = 'mA';
        operator = '<=';

        if (flashover || leakage > limit) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Dielectric properties failed: ${flashover ? 'Flashover detected' : `Leakage current ${leakage} mA exceeds ${limit} mA limit`}. Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Dielectric withstand passed. Leakage current ${leakage} mA <= ${limit} mA. PASS.`;
        }
        break;
      }

      case '8.3.3.3.2_uv_drop_out': {
        parameterName = 'dropOutVoltageRatio';
        const ratio = Number(inputs['dropOutVoltageRatio'] ?? 0.5);
        const minRatio = Number(parameters['minDropOutRatio'] ?? 0.35);
        const maxRatio = Number(parameters['maxDropOutRatio'] ?? 0.70);

        measuredVal = ratio;
        expectedLimit = `[${minRatio}, ${maxRatio}]`;
        unit = 'Vc';
        operator = 'between';

        if (ratio < minRatio || ratio > maxRatio) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Undervoltage release drop-out voltage ratio (${ratio} Vc) outside required bounds [${minRatio}, ${maxRatio}] Vc. Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Undervoltage release dropped out at ${ratio} Vc (within [${minRatio}, ${maxRatio}] Vc). PASS.`;
        }
        break;
      }

      case '8.3.3.3.2_shunt_operation': {
        parameterName = 'shuntOperated';
        const operated = Boolean(inputs['shuntOperated'] ?? true);
        const vRatio = Number(inputs['shuntVoltageRatio'] ?? 0.7);
        const minRatio = Number(parameters['minShuntVoltageRatio'] ?? 0.7);

        measuredVal = operated ? 'Operated' : 'Failed to operate';
        expectedLimit = `Operates at >= ${minRatio} Vc`;
        operator = '== true';

        if (!operated || vRatio < minRatio) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Shunt release failed to operate at ${minRatio} Vc at +55°C. Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Shunt release operated reliably at ${vRatio} Vc at +55°C. PASS.`;
        }
        break;
      }

      case '8.3.3.4_overload_performance': {
        parameterName = 'operationsCompleted';
        const ops = Number(inputs['overloadOpsCompleted'] ?? 12);
        const reqOps = Number(parameters['requiredOperations'] ?? 12);
        measuredVal = ops;
        expectedLimit = reqOps;
        operator = '>=';

        if (ops < reqOps) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Overload performance test incomplete (${ops}/${reqOps} ops at 6 In AC / 2.5 In DC). Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Overload performance test successfully completed all ${ops} operations at 6 In. PASS.`;
        }
        break;
      }

      case '8.3.3.5_dielectric_withstand': {
        parameterName = 'postOverloadLeakage';
        const leakage = Number(inputs['postOverloadLeakage'] ?? 0);
        const limit = Number(parameters['maxPostOverloadLeakage'] ?? 2.0);
        measuredVal = leakage;
        expectedLimit = limit;
        unit = 'mA';
        operator = '<=';

        if (leakage > limit) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Post-overload dielectric leakage current (${leakage} mA) exceeds ${limit} mA limit. Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Post-overload dielectric withstand verified. Leakage current ${leakage} mA <= ${limit} mA. PASS.`;
        }
        break;
      }

      case '8.3.3.6_temperature_rise': {
        parameterName = 'dT_terminal_max';
        const dT_term = Math.max(
          Number(inputs['dT_terminal_R'] ?? 0),
          Number(inputs['dT_terminal_S'] ?? 0),
          Number(inputs['dT_terminal_T'] ?? 0)
        );
        const dT_handle = Number(inputs['dT_handle'] ?? 0);
        const maxTerm = Number(parameters['maxTerminalTempRiseK'] ?? 70);
        const maxHandle = Number(parameters['maxHandleTempRiseK'] ?? 35);

        measuredVal = `Terminal ΔT: ${dT_term} K, Handle ΔT: ${dT_handle} K`;
        expectedLimit = `Terminal <= ${maxTerm} K, Handle <= ${maxHandle} K`;
        unit = 'K';
        operator = '<=';

        if (dT_term > maxTerm || dT_handle > maxHandle) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Temperature-rise limit exceeded: ${dT_term > maxTerm ? `Terminal ΔT (${dT_term} K > ${maxTerm} K)` : ''} ${dT_handle > maxHandle ? `Handle ΔT (${dT_handle} K > ${maxHandle} K)` : ''}. Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Temperature-rise within standard limits (Terminal ΔT = ${dT_term} K <= ${maxTerm} K, Handle ΔT = ${dT_handle} K <= ${maxHandle} K). PASS.`;
        }
        break;
      }

      case '8.3.3.7_overload_releases_verification': {
        parameterName = 'tripTime_145';
        const tripped = Boolean(inputs['tripped_145'] ?? true);
        const tripTime = Number(inputs['tripTime_145'] ?? 0);
        const maxTime = Number(inputs['tripLimit_max'] ?? parameters['maxTripTimeSec'] ?? 7200);

        measuredVal = tripTime;
        expectedLimit = maxTime;
        unit = 's';
        operator = '<=';

        if (!tripped || tripTime > maxTime) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Overload release verification immediately after temperature-rise test failed at 1.45 Ir (Trip time: ${tripTime}s vs conventional max: ${maxTime}s). Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Overload release verified at 1.45 Ir immediately following temperature-rise test (Operated in ${tripTime}s). PASS.`;
        }
        break;
      }

      case '8.3.3.8_uv_shunt_room_temp': {
        parameterName = 'uv_shunt_room';
        const uvNoTrip70 = Boolean(inputs['uvNoTrip70'] ?? true);
        const uvTrip35 = Boolean(inputs['uvTrip35'] ?? true);
        const shuntTrip70 = Boolean(inputs['shuntTrip70'] ?? true);

        measuredVal = uvNoTrip70 && uvTrip35 && shuntTrip70 ? 'Verified' : 'Failed';
        expectedLimit = 'UV no-trip @ 70%, trip @ 35%; Shunt trip @ 70%';
        operator = '== true';

        if (!uvNoTrip70 || !uvTrip35 || !shuntTrip70) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Room temperature release verification failed: UV no-trip 70%: ${uvNoTrip70}, UV trip 35%: ${uvTrip35}, Shunt trip 70%: ${shuntTrip70}. Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Room temperature verification of undervoltage and shunt releases passed. PASS.`;
        }
        break;
      }

      case '8.3.3.9_main_contact_position': {
        parameterName = 'contactPositionIndication';
        const effective = Boolean(inputs['contactPositionIndicationEffective'] ?? true);
        measuredVal = effective ? 'Effective' : 'Ineffective';
        expectedLimit = 'Effective Indication';
        operator = '== true';

        if (!effective) {
          verdict = 'FAIL';
          violatedClause = clauseId;
          explanation = `Main contact position indication ineffective for isolation suitability. Requirement violated: Clause ${clauseId}.`;
        } else {
          verdict = 'PASS';
          explanation = `Main contact position indication verified effective for isolation suitability. PASS.`;
        }
        break;
      }

      default: {
        measuredVal = Number(inputs['value'] ?? 0);
        expectedLimit = Number(parameters['limit'] ?? 0);
        explanation = verdict === 'PASS' ? passMessageTemplate : failMessageTemplate;
      }
    }

    const evidence: RuleEvidence = {
      parameterName,
      measuredValue: measuredVal,
      expectedLimit,
      unit,
      operator,
      verdict,
      clauseId,
      standardEdition: edition,
      explanation,
    };

    return {
      clauseId,
      clauseTitle: title,
      verdict,
      measuredValue: measuredVal,
      limitValue: expectedLimit,
      unit,
      ruleId,
      message: verdict === 'PASS' ? passMessageTemplate : failMessageTemplate,
      explanation,
      violatedClause,
      standardEdition: edition,
      evidence,
      timestamp: new Date().toISOString(),
    };
  }
}
