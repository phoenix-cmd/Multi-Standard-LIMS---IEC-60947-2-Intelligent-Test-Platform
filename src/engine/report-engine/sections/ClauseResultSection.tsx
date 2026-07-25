import type { ReportSectionProps } from '../core/SectionRegistry';
import { ReportDataMapper } from '../core/ReportDataMapper';

export function ClauseResultSection({ data, theme, numbering }: ReportSectionProps) {
  const clauseVMs = ReportDataMapper.mapClauseViewModels(data);

  return (
    <div className="space-y-8 my-6">
      <div className="border-b pb-2" style={{ borderColor: theme.primaryColor }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
          Clause-Wise Detailed Test Results & Calculations
        </h3>
        <p className="text-xs text-gray-500">Comprehensive evaluation, equation step substitutions, and verdict breakdown.</p>
      </div>

      {clauseVMs.map((c) => {
        const tableRef = numbering.nextTable(`clause-${c.clauseId}`, `Clause ${c.clauseId} Evaluation Data`);

        return (
          <div key={c.clauseId} className="border rounded p-4 space-y-3 bg-white" style={{ borderColor: theme.borderColor }}>
            {/* Clause Header */}
            <div className="flex justify-between items-start border-b pb-2">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-900 rounded">
                  CLAUSE {c.clauseId}
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-1">{c.clauseTitle}</h4>
                <p className="text-xs text-gray-500">Sequence: {c.sequenceId.toUpperCase()}</p>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-black text-white ${c.verdict === 'PASS' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                {c.verdict}
              </span>
            </div>

            {/* Purpose & Criteria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-gray-50 p-2.5 rounded border border-gray-200">
              <div>
                <span className="font-bold text-gray-700 block mb-0.5">PURPOSE & OBJECTIVE:</span>
                <p className="text-gray-600">{c.purpose}</p>
              </div>
              <div>
                <span className="font-bold text-gray-700 block mb-0.5">ACCEPTANCE CRITERIA:</span>
                <p className="text-gray-600">{c.acceptanceCriteria}</p>
              </div>
            </div>

            {/* Formula Step-by-Step Display */}
            {c.formulaSteps.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase text-gray-700 block">Calculations & Formula Step Substitutions:</span>
                <div className="grid grid-cols-1 gap-2">
                  {c.formulaSteps.map((f, fIdx) => {
                    const eqRef = numbering.nextEquation(`eq-${c.clauseId}-${fIdx}`, f.stepName);
                    return (
                      <div key={f.stepName} className="p-2.5 bg-slate-900 text-slate-100 rounded text-xs font-mono flex justify-between items-center">
                        <div>
                          <span className="text-cyan-400 font-bold mr-2">{eqRef.label} {f.stepName}:</span>
                          <span className="text-slate-300">{f.expression}</span>
                          <span className="text-slate-400 mx-2">⇒</span>
                          <span className="text-yellow-300 font-bold">{f.substitution}</span>
                          <span className="text-slate-400 mx-2">=</span>
                          <span className="text-emerald-400 font-bold">{f.result}</span>
                        </div>
                        {f.verdict && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-900 text-emerald-300 rounded border border-emerald-700">
                            {f.verdict}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Measured Data Table */}
            <div>
              <p className="text-[11px] font-bold uppercase text-gray-600 mb-1">
                {tableRef.label}: {tableRef.title}
              </p>
              <table className="w-full text-xs border-collapse border" style={{ borderColor: theme.borderColor }}>
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border p-1.5 text-left">Parameter</th>
                    <th className="border p-1.5 text-left w-32">Measured Value</th>
                    <th className="border p-1.5 text-left w-32">Specified Limit</th>
                    <th className="border p-1.5 text-center w-24">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-1.5 font-medium">{c.clauseTitle}</td>
                    <td className="border p-1.5 font-mono font-bold">{c.measuredValue ?? '—'} {c.unit || ''}</td>
                    <td className="border p-1.5 font-mono">{c.limitValue ?? '—'} {c.unit || ''}</td>
                    <td className="border p-1.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${c.verdict === 'PASS' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                        {c.verdict}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AI Diagnosis Panel if Failed */}
            {c.aiDiagnosis && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded space-y-1 text-xs text-rose-900">
                <span className="font-bold flex items-center gap-1">
                  ⚠️ AI FAILURE DIAGNOSIS & ROOT CAUSE ANALYSIS:
                </span>
                <p><strong>Failure Mechanism:</strong> {c.aiDiagnosis.failureMechanism}</p>
                <p><strong>Primary Root Cause:</strong> {c.aiDiagnosis.rootCauses[0]?.cause} ({c.aiDiagnosis.rootCauses[0]?.probability}% probability)</p>
                <p><strong>Recommended Corrective Action:</strong> {c.aiDiagnosis.correctives[0]}</p>
              </div>
            )}

            {/* Engineer Remarks */}
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Engineer Observations:</strong> {c.observations}
            </div>
          </div>
        );
      })}
    </div>
  );
}
