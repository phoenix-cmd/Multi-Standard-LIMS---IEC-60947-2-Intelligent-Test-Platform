import type { ReportDocumentData } from '../types/document';
import { ReportDataMapper } from './ReportDataMapper';

export interface ClauseDiffItem {
  clauseId: string;
  clauseTitle: string;
  revA_measured?: string | number;
  revB_measured?: string | number;
  revA_verdict: string;
  revB_verdict: string;
  changed: boolean;
  verdictChanged: boolean;
}

export interface ReportDiffResult {
  reportNo: string;
  revA: number;
  revB: number;
  diffs: ClauseDiffItem[];
  hasChanges: boolean;
}

export class ReportDiffEngine {
  static compareRevisions(docRevA: ReportDocumentData, docRevB: ReportDocumentData): ReportDiffResult {
    const clausesA = ReportDataMapper.mapClauseViewModels(docRevA);
    const clausesB = ReportDataMapper.mapClauseViewModels(docRevB);

    const diffs: ClauseDiffItem[] = [];

    // Compare each clause in Rev B against Rev A
    clausesB.forEach((cB) => {
      const cA = clausesA.find((c) => c.clauseId === cB.clauseId);
      if (!cA) {
        // Added clause
        diffs.push({
          clauseId: cB.clauseId,
          clauseTitle: cB.clauseTitle,
          revA_measured: 'N/A',
          revB_measured: cB.measuredValue,
          revA_verdict: 'NOT_TESTED',
          revB_verdict: cB.verdict,
          changed: true,
          verdictChanged: true,
        });
      } else {
        const measuredChanged = String(cA.measuredValue) !== String(cB.measuredValue);
        const verdictChanged = cA.verdict !== cB.verdict;
        diffs.push({
          clauseId: cB.clauseId,
          clauseTitle: cB.clauseTitle,
          revA_measured: cA.measuredValue,
          revB_measured: cB.measuredValue,
          revA_verdict: cA.verdict,
          revB_verdict: cB.verdict,
          changed: measuredChanged || verdictChanged,
          verdictChanged,
        });
      }
    });

    const hasChanges = diffs.some((d) => d.changed);

    return {
      reportNo: docRevB.sample.reportNo,
      revA: docRevA.revision,
      revB: docRevB.revision,
      diffs,
      hasChanges,
    };
  }
}
