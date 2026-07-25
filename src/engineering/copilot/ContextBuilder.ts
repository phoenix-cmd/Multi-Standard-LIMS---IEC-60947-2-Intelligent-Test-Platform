import type { Sample } from '../../types';
import type { ComponentState } from '../digital-twin/TwinState';
import { COMPONENT_KNOWLEDGE } from '../knowledge/ComponentDatabase';
import { getClauseDescription } from '../viewer3d/HighlightEngine';

export interface CopilotContext {
  sampleReportNo: string;
  clientName: string;
  model: string;
  ratedCurrent: number;
  ratedVoltage: number;
  clauseResults: { clauseId: string; verdict: string; measuredValue?: string | number; limitValue?: string | number; unit?: string }[];
  selectedComponent: ComponentState | null;
  componentKnowledge: string;
  waveformSummary?: string;
  activeClauseId?: string;
  activeClauseDescription?: string;
  overallVerdict: string;
}

export class ContextBuilder {
  static build(
    sample: Sample,
    selectedComponent: ComponentState | null,
    activeClauseId?: string
  ): CopilotContext {
    const spec = sample.specification;

    const clauseResults = sample.testRuns.flatMap((run) =>
      run.clauseResults.map((cr) => ({
        clauseId: cr.clauseId,
        verdict: cr.verdict,
        measuredValue: cr.measuredValue,
        limitValue: cr.limitValue,
        unit: cr.unit,
      }))
    );

    // Waveform summary if available
    const waveformRun = sample.testRuns.find((r) => r.waveformData);
    const waveformSummary = waveformRun?.waveformData
      ? `Peak current Ip=${waveformRun.waveformData.peakCurrent?.toFixed(2)} kA, clearing time tc=${((waveformRun.waveformData.clearingTime || 0) * 1000).toFixed(1)} ms, arc duration tarc=${((waveformRun.waveformData.arcDuration || 0) * 1000).toFixed(1)} ms, arc energy ∫i²dt=${waveformRun.waveformData.arcEnergy?.toFixed(3)} MA²s.`
      : undefined;

    // Component knowledge summary
    const compKnowledge = selectedComponent
      ? (() => {
          const k = COMPONENT_KNOWLEDGE[selectedComponent.id];
          return k ? `Selected component: ${k.name}. Material: ${k.material}. Function: ${k.function}. Known failure modes: ${k.failureModes.join('; ')}.` : '';
        })()
      : '';

    const overallVerdict = sample.testRuns.every((r) => r.verdict === 'PASS') ? 'PASS' : 'FAIL';

    return {
      sampleReportNo: sample.reportNo,
      clientName: sample.clientName,
      model: spec.model,
      ratedCurrent: spec.ratedCurrent,
      ratedVoltage: spec.ratedVoltage,
      clauseResults,
      selectedComponent,
      componentKnowledge: compKnowledge,
      waveformSummary,
      activeClauseId,
      activeClauseDescription: activeClauseId ? getClauseDescription(activeClauseId) : undefined,
      overallVerdict,
    };
  }

  static toPromptString(ctx: CopilotContext): string {
    const lines: string[] = [
      `REPORT: ${ctx.sampleReportNo} | CLIENT: ${ctx.clientName} | MODEL: ${ctx.model}`,
      `RATINGS: In=${ctx.ratedCurrent}A, Ue=${ctx.ratedVoltage}V`,
      `OVERALL VERDICT: ${ctx.overallVerdict}`,
      `\nCLAUSE RESULTS:`,
      ...ctx.clauseResults.map(
        (cr) => `  ${cr.clauseId}: ${cr.verdict} — measured ${cr.measuredValue ?? 'N/A'} ${cr.unit ?? ''} (limit ${cr.limitValue ?? 'N/A'})`
      ),
    ];
    if (ctx.waveformSummary) lines.push(`\nWAVEFORM: ${ctx.waveformSummary}`);
    if (ctx.activeClauseId) lines.push(`\nACTIVE CLAUSE: ${ctx.activeClauseId} — ${ctx.activeClauseDescription}`);
    if (ctx.componentKnowledge) lines.push(`\nSELECTED COMPONENT: ${ctx.componentKnowledge}`);
    return lines.join('\n');
  }
}
