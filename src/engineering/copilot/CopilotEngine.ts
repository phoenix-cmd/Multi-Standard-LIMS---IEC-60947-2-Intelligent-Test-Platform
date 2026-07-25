import type { CopilotContext } from './ContextBuilder';
import { DiagnosisEngine, RecommendationEngine } from '../../ai/engines';
import type { ClauseResult, MCCBSpecification } from '../../types';
import { COMPONENT_KNOWLEDGE } from '../knowledge/ComponentDatabase';
import { CLAUSE_HIGHLIGHT_MAP } from '../viewer3d/HighlightEngine';

export interface CopilotResponse {
  answer: string;
  reasoning: string;
  clauseRef?: string;
  formulaSteps?: string[];
  affectedComponentIds: string[];
  confidence: number;
  relatedTests: string[];
  recommendation?: string;
  followUpQuestions: string[];
}

const diagnosisEngine = new DiagnosisEngine();
const recommendationEngine = new RecommendationEngine();

export class CopilotEngine {
  generate(userQuestion: string, ctx: CopilotContext): CopilotResponse {
    const q = userQuestion.toLowerCase();

    // ── Route to specialised handlers ─────────────────────────────────────────
    if (q.includes('fail') || q.includes('why') || q.includes('failed')) {
      return this._handleFailureQuery(q, ctx);
    }
    if (q.includes('waveform') || q.includes('oscillograph') || q.includes('short-circuit') || q.includes('peak')) {
      return this._handleWaveformQuery(ctx);
    }
    if (q.includes('component') || q.includes('material') || q.includes('bimetal') || q.includes('contact') || q.includes('terminal') || q.includes('arc')) {
      return this._handleComponentQuery(q, ctx);
    }
    if (q.includes('calculate') || q.includes('formula') || q.includes('equation') || q.includes('step')) {
      return this._handleFormulaQuery(q, ctx);
    }
    if (q.includes('equipment') || q.includes('calibration') || q.includes('instrument')) {
      return this._handleEquipmentQuery(ctx);
    }
    if (q.includes('summary') || q.includes('overall') || q.includes('report') || q.includes('verdict')) {
      return this._handleSummaryQuery(ctx);
    }
    if (q.includes('clause') || q.includes('standard') || q.includes('iec') || q.includes('8.3')) {
      return this._handleClauseQuery(q, ctx);
    }
    return this._handleGeneral(userQuestion, ctx);
  }

  private _handleFailureQuery(q: string, ctx: CopilotContext): CopilotResponse {
    const failedClauses = ctx.clauseResults.filter((c) => c.verdict === 'FAIL');
    if (failedClauses.length === 0) {
      return {
        answer: `All ${ctx.clauseResults.length} evaluated clauses for report ${ctx.sampleReportNo} returned PASS verdicts. No failures detected in the current test data.`,
        reasoning: 'Scanned all clause result records in the current report context.',
        affectedComponentIds: [],
        confidence: 95,
        relatedTests: [],
        followUpQuestions: ['What is the overall verdict?', 'Explain the most critical clause tested.'],
      };
    }

    const clause = failedClauses[0];
    const mockSpec: MCCBSpecification = { ratedCurrent: ctx.ratedCurrent, ratedVoltage: ctx.ratedVoltage } as any;
    const mockResult: ClauseResult = {
      clauseId: clause.clauseId,
      clauseTitle: clause.clauseId,
      verdict: 'FAIL',
      measuredValue: clause.measuredValue,
      limitValue: clause.limitValue,
      unit: clause.unit,
      message: '',
      timestamp: new Date().toISOString(),
    };

    const diagnosis = diagnosisEngine.diagnose([mockResult], mockSpec);
    const recs = recommendationEngine.recommend(diagnosis);
    const affected = CLAUSE_HIGHLIGHT_MAP[clause.clauseId] || [];

    return {
      answer: `Clause ${clause.clauseId} failed because ${diagnosis.failureMechanism.toLowerCase()}. The measured value was ${clause.measuredValue} ${clause.unit || ''} against a limit of ${clause.limitValue} ${clause.unit || ''}.`,
      reasoning: `Primary root cause (${diagnosis.rootCauses[0]?.probability}% probability): ${diagnosis.rootCauses[0]?.cause}`,
      clauseRef: clause.clauseId,
      affectedComponentIds: affected,
      confidence: diagnosis.rootCauses[0]?.probability ?? 70,
      relatedTests: [`Re-run clause ${clause.clauseId}`, 'Inspect highlighted components'],
      recommendation: diagnosis.correctives[0],
      followUpQuestions: [
        `What components are affected by clause ${clause.clauseId}?`,
        'What is the corrective action?',
        `Show me the formula for clause ${clause.clauseId}.`,
      ],
    };
  }

  private _handleWaveformQuery(ctx: CopilotContext): CopilotResponse {
    if (!ctx.waveformSummary) {
      return {
        answer: 'No oscillograph waveform data is available for the currently selected sample. Waveform data is generated during Sequence II (short-circuit) tests.',
        reasoning: 'Checked waveform context — no data present.',
        affectedComponentIds: [],
        confidence: 90,
        relatedTests: ['Execute Sequence II (Ics test)'],
        followUpQuestions: ['How do I start a short-circuit test?'],
      };
    }
    return {
      answer: `The short-circuit waveform shows: ${ctx.waveformSummary} The peak current Ip represents the asymmetric fault current including DC offset. The arc duration (tarc) is the time from contact separation to arc extinction. Arc energy ∫i²dt is used to assess contact erosion per IEC 60947-2 Clause 8.3.4 requirements.`,
      reasoning: 'Analysed waveform telemetry parameters from the Sequence II oscillograph capture.',
      clauseRef: '8.3.4',
      affectedComponentIds: ['mainContacts', 'arcChute'],
      confidence: 92,
      relatedTests: ['Verify post-arc dielectric withstand (Cl. 8.3.3.2)', 'Inspect arc chute after Icu sequence'],
      recommendation: 'Inspect main contacts and arc chute after this short-circuit sequence for erosion.',
      followUpQuestions: ['Explain arc duration significance.', 'What is the acceptable arc energy limit?', 'Which components are stressed by this test?'],
    };
  }

  private _handleComponentQuery(q: string, ctx: CopilotContext): CopilotResponse {
    const comp = ctx.selectedComponent;
    const knowledge = comp ? COMPONENT_KNOWLEDGE[comp.id] : null;

    if (!knowledge) {
      return {
        answer: 'Please select a component in the 3D viewer to get detailed engineering information. Click any highlighted component to inspect its specifications, failure modes, and associated clauses.',
        reasoning: 'No component selected in current context.',
        affectedComponentIds: [],
        confidence: 80,
        relatedTests: [],
        followUpQuestions: ['What is the arc chute made of?', 'Why do contacts fail?', 'Explain the bimetal element.'],
      };
    }

    return {
      answer: `**${knowledge.name}**: ${knowledge.function}\n\n**Material**: ${knowledge.material}\n\n**Known failure modes**: ${knowledge.failureModes.slice(0, 2).join('; ')}.\n\n**Typical lifespan**: ${knowledge.typicalLifespan}.`,
      reasoning: `Retrieved component engineering data from knowledge base for component ID: ${comp!.id}. Current status: ${comp!.status}, health: ${comp!.health}%, wear: ${comp!.wear}%.`,
      affectedComponentIds: [comp!.id],
      confidence: 96,
      relatedTests: knowledge.associatedClauses.map((c) => `Clause ${c}`),
      recommendation: knowledge.maintenanceNotes,
      followUpQuestions: [`What clauses test the ${knowledge.name}?`, `What is the replacement procedure?`, 'Show failure analysis.'],
    };
  }

  private _handleFormulaQuery(q: string, ctx: CopilotContext): CopilotResponse {
    if (q.includes('8.3.3.2') || q.includes('dielectric') || q.includes('voltage')) {
      const vTest = 2 * ctx.ratedVoltage + 1000;
      return {
        answer: `Dielectric test voltage calculation per IEC 60947-2 Clause 8.3.3.2:\n\nFormula: V_test = 2 × Ui + 1000\nSubstitution: V_test = 2 × ${ctx.ratedVoltage} + 1000\nResult: V_test = ${vTest} V AC (applied for 60 seconds)`,
        reasoning: 'Applied IEC 60947-2 Cl. 8.3.3.2 formula with specimen Ui from report data.',
        clauseRef: '8.3.3.2',
        formulaSteps: [`V_test = 2 × Ui + 1000`, `= 2 × ${ctx.ratedVoltage} + 1000`, `= ${vTest} V`],
        affectedComponentIds: ['casing', 'arcChute'],
        confidence: 99,
        relatedTests: ['Clause 8.3.3.2'],
        followUpQuestions: ['What happens if flashover occurs?', 'Which components are tested here?'],
      };
    }
    if (q.includes('8.3.3.3') || q.includes('trip') || q.includes('1.3') || q.includes('1.05')) {
      return {
        answer: `Tripping characteristic test currents per IEC 60947-2 Clause 8.3.3.3:\n\nNon-trip current: I_NT = 1.05 × In = 1.05 × ${ctx.ratedCurrent} = ${1.05 * ctx.ratedCurrent} A\nTrip current: I_T = 1.30 × In = 1.30 × ${ctx.ratedCurrent} = ${1.30 * ctx.ratedCurrent} A`,
        reasoning: 'Applied IEC 60947-2 Cl. 8.3.3.3 current multipliers to rated current In from specimen data.',
        clauseRef: '8.3.3.3',
        formulaSteps: ['I_NT = 1.05 × In', `= 1.05 × ${ctx.ratedCurrent}`, `= ${1.05 * ctx.ratedCurrent} A`, 'I_T = 1.30 × In', `= 1.30 × ${ctx.ratedCurrent}`, `= ${1.30 * ctx.ratedCurrent} A`],
        affectedComponentIds: ['thermalElement', 'tripUnit', 'magneticRelease'],
        confidence: 99,
        relatedTests: ['Clause 8.3.3.3'],
        followUpQuestions: ['What is the maximum allowed trip time?', 'Why use 1.30×In instead of 2×In?'],
      };
    }
    return this._handleGeneral(q, ctx);
  }

  private _handleEquipmentQuery(ctx: CopilotContext): CopilotResponse {
    return {
      answer: `The following calibrated equipment is required for IEC 60947-2 testing of report ${ctx.sampleReportNo}:\n\n1. Short-Circuit Test Station — primary power source for Icu/Ics sequences\n2. Digital Storage Oscilloscope — waveform capture at ≥100 kS/s\n3. Primary Current Injection Set — for tripping characteristic verification\n4. High-Voltage AC Test Set — for dielectric withstand (${2 * ctx.ratedVoltage + 1000} V)\n5. Precision Thermocouples — terminal and handle temperature rise measurement\n\nAll instruments must have valid NABL calibration certificates and be within calibration due dates.`,
      reasoning: 'Retrieved equipment requirements from IEC 60947-2 test methodology and matched to specimen ratings.',
      affectedComponentIds: [],
      confidence: 93,
      relatedTests: ['Cl. 8.3.3.1', 'Cl. 8.3.3.2', 'Cl. 8.3.3.3', 'Cl. 8.3.4'],
      followUpQuestions: ['Is any equipment overdue for calibration?', 'What accuracy is required for the oscilloscope?'],
    };
  }

  private _handleSummaryQuery(ctx: CopilotContext): CopilotResponse {
    const passed = ctx.clauseResults.filter((c) => c.verdict === 'PASS').length;
    const failed = ctx.clauseResults.filter((c) => c.verdict === 'FAIL').length;
    const na = ctx.clauseResults.filter((c) => c.verdict === 'NA').length;

    return {
      answer: `**Report ${ctx.sampleReportNo} — ${ctx.clientName} — ${ctx.model}**\n\nOverall verdict: **${ctx.overallVerdict}**\n\nClause evaluation results:\n- ✓ Passed: ${passed} clause(s)\n- ✗ Failed: ${failed} clause(s)\n- N/A: ${na} clause(s)\n\nSpecimen ratings: In=${ctx.ratedCurrent}A, Ue=${ctx.ratedVoltage}V${ctx.waveformSummary ? `\n\nShort-circuit waveform captured: ${ctx.waveformSummary}` : ''}`,
      reasoning: 'Generated summary from all clause result records in current report context.',
      affectedComponentIds: [],
      confidence: 98,
      relatedTests: ctx.clauseResults.map((c) => c.clauseId),
      followUpQuestions: ['Why did any clause fail?', 'What corrective actions are needed?', 'Compare to previous revision.'],
    };
  }

  private _handleClauseQuery(q: string, ctx: CopilotContext): CopilotResponse {
    const clauseMatch = q.match(/8\.3\.[\d.]+/);
    const clauseId = clauseMatch ? clauseMatch[0] : ctx.activeClauseId;
    const result = clauseId ? ctx.clauseResults.find((c) => c.clauseId === clauseId) : null;

    return {
      answer: clauseId
        ? `**Clause ${clauseId}**: ${this._getClauseExplanation(clauseId, ctx)}\n\n${result ? `Current result: **${result.verdict}** — Measured: ${result.measuredValue ?? 'N/A'} ${result.unit ?? ''}, Limit: ${result.limitValue ?? 'N/A'} ${result.unit ?? ''}` : 'No result recorded for this clause yet.'}`
        : 'Please specify a clause number (e.g., "Explain clause 8.3.3.1") or select a clause from the twin panel.',
      reasoning: 'Retrieved clause information from IEC 60947-2 knowledge base and matched to current report data.',
      clauseRef: clauseId,
      affectedComponentIds: clauseId ? (CLAUSE_HIGHLIGHT_MAP[clauseId] || []) : [],
      confidence: 90,
      relatedTests: clauseId ? [`Clause ${clauseId}`] : [],
      followUpQuestions: ['Show the calculation formula.', 'Which components are involved?', 'What happens if this fails?'],
    };
  }

  private _handleGeneral(question: string, ctx: CopilotContext): CopilotResponse {
    return {
      answer: `I'm your IEC 60947-2 engineering assistant. I have full context on report **${ctx.sampleReportNo}** (${ctx.model}, In=${ctx.ratedCurrent}A, overall: ${ctx.overallVerdict}).\n\nI can help with:\n• Clause failures and root cause analysis\n• Formula calculations and step-by-step substitutions\n• Component engineering specifications\n• Oscillograph waveform interpretation\n• Equipment calibration requirements\n• Test procedure guidance per IEC 60947-2`,
      reasoning: 'General context response — question did not match a specific handler.',
      affectedComponentIds: [],
      confidence: 75,
      relatedTests: [],
      followUpQuestions: [
        'Why did this test fail?',
        'Explain clause 8.3.3.1.',
        'Show me the dielectric voltage calculation.',
        'What is the arc chute made of?',
        'Summarize this report.',
      ],
    };
  }

  private _getClauseExplanation(clauseId: string, ctx: CopilotContext): string {
    const map: Record<string, string> = {
      '8.3.3.1': `Temperature rise test — verifies that no terminal exceeds ΔT=70K and the operating handle does not exceed ΔT=35K above ambient when carrying rated current In=${ctx.ratedCurrent}A continuously until thermal equilibrium.`,
      '8.3.3.2': `Dielectric withstand — applies ${2 * ctx.ratedVoltage + 1000}V AC for 60 seconds across each insulated path. No flashover, puncture, or leakage >5mA shall occur.`,
      '8.3.3.3': `Overcurrent release characteristics — breaker must NOT trip at 1.05×In=${1.05 * ctx.ratedCurrent}A for 2 hours from cold. Must TRIP at 1.30×In=${1.3 * ctx.ratedCurrent}A within the conventional tripping time.`,
      '8.3.4': `Ultimate breaking capacity (Icu) — O–t–CO sequence at ${ctx.ratedCurrent >= 630 ? 85 : 50}kA prospective short-circuit current. Post-test: must withstand dielectric and trip correctly.`,
      '8.3.5': `Service breaking capacity (Ics) — O–t–CO–t–CO sequence. Breaker must remain fully serviceable after all three operations.`,
    };
    return map[clauseId] || `IEC 60947-2 clause requiring specific electrical or mechanical performance.`;
  }
}
