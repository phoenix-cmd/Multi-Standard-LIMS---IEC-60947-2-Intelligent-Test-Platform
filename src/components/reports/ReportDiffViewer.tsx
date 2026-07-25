import { ReportDiffEngine } from '../../engine/report-engine/core/ReportDiffEngine';
import type { ReportDocumentData } from '../../engine/report-engine/types/document';
import { GitCompare, X, AlertTriangle } from 'lucide-react';

export function ReportDiffViewer({
  docRevA,
  docRevB,
  onClose,
}: {
  docRevA: ReportDocumentData;
  docRevB: ReportDocumentData;
  onClose: () => void;
}) {
  const diffResult = ReportDiffEngine.compareRevisions(docRevA, docRevB);

  return (
    <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in no-print">
      <div className="card w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border-brand-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-800 bg-surface-900 rounded-t-xl">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-brand-400" />
            <div>
              <p className="text-sm font-bold text-surface-100">
                Report Revision Diff Engine — <span className="font-mono text-brand-400">{diffResult.reportNo}</span>
              </p>
              <p className="text-xs text-surface-400">
                Comparing Rev {diffResult.revA} vs Rev {diffResult.revB}
              </p>
            </div>
          </div>
          <button className="btn-secondary py-1 px-2 text-xs" onClick={onClose}>
            <X className="w-4 h-4" /> Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!diffResult.hasChanges ? (
            <div className="p-8 text-center text-surface-400">
              <p className="text-sm">No parameter or verdict changes detected between Rev {diffResult.revA} and Rev {diffResult.revB}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-brand-600/10 border border-brand-600/20 rounded text-xs text-brand-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning-400 flex-shrink-0" />
                <span>Changed values and verdict transitions are highlighted in yellow and green below.</span>
              </div>

              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-surface-800 text-surface-400 text-left bg-surface-950">
                    <th className="p-2.5">Clause ID</th>
                    <th className="p-2.5">Clause Title</th>
                    <th className="p-2.5 font-mono">Rev {diffResult.revA} Measured</th>
                    <th className="p-2.5 font-mono">Rev {diffResult.revB} Measured</th>
                    <th className="p-2.5 text-center">Rev {diffResult.revA} Verdict</th>
                    <th className="p-2.5 text-center">Rev {diffResult.revB} Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800">
                  {diffResult.diffs.map((d) => (
                    <tr key={d.clauseId} className={d.changed ? 'bg-warning-500/10' : 'hover:bg-surface-800/30'}>
                      <td className="p-2.5 font-mono font-bold text-brand-400">{d.clauseId}</td>
                      <td className="p-2.5 font-medium text-surface-200">{d.clauseTitle}</td>
                      <td className="p-2.5 font-mono text-surface-300">{String(d.revA_measured ?? '—')}</td>
                      <td className={`p-2.5 font-mono font-bold ${d.changed ? 'text-warning-300' : 'text-surface-100'}`}>
                        {String(d.revB_measured ?? '—')}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="badge-pass text-[10px]">{d.revA_verdict}</span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`text-[10px] ${d.verdictChanged ? 'badge-warn' : 'badge-pass'}`}>
                          {d.revB_verdict}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
