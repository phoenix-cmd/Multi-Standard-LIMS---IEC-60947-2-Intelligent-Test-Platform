import type { ReportSectionProps } from '../core/SectionRegistry';
import { ReportDataMapper } from '../core/ReportDataMapper';

export function ExecutiveSummarySection({ data, theme, numbering }: ReportSectionProps) {
  const clauseVMs = ReportDataMapper.mapClauseViewModels(data);
  const tableRef = numbering.nextTable('exec-summary', 'Clause-wise Test Summary Matrix');

  const passCount = clauseVMs.filter((c) => c.verdict === 'PASS').length;
  const failCount = clauseVMs.filter((c) => c.verdict === 'FAIL').length;
  const naCount = clauseVMs.filter((c) => c.verdict === 'NA').length;

  return (
    <div className="space-y-4 my-6">
      <div className="flex justify-between items-end border-b pb-2" style={{ borderColor: theme.primaryColor }}>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
            Executive Summary & Clause Matrix
          </h3>
          <p className="text-xs text-gray-500">Summary of all clause evaluations performed under IEC 60947-2.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Passed: {passCount}</span>
          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">Failed: {failCount}</span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-bold">N/A: {naCount}</span>
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
        {tableRef.label}: {tableRef.title}
      </p>

      <table className="w-full text-xs border-collapse border" style={{ borderColor: theme.borderColor }}>
        <thead>
          <tr style={{ backgroundColor: theme.tableHeaderBg, color: theme.tableHeaderColor }}>
            <th className="border p-2 text-left w-20">Clause</th>
            <th className="border p-2 text-left">Test Title</th>
            <th className="border p-2 text-left w-24">Sequence</th>
            <th className="border p-2 text-left w-24">Measured</th>
            <th className="border p-2 text-left w-24">Limit</th>
            <th className="border p-2 text-center w-24">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {clauseVMs.map((c, idx) => (
            <tr key={c.clauseId + idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border p-2 font-mono font-bold text-blue-900">{c.clauseId}</td>
              <td className="border p-2 font-medium">{c.clauseTitle}</td>
              <td className="border p-2 font-mono uppercase">{c.sequenceId}</td>
              <td className="border p-2 font-mono">{c.measuredValue ?? '—'} {c.unit || ''}</td>
              <td className="border p-2 font-mono">{c.limitValue ?? '—'} {c.unit || ''}</td>
              <td className="border p-2 text-center">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white ${c.verdict === 'PASS' ? 'bg-emerald-600' : c.verdict === 'FAIL' ? 'bg-rose-600' : 'bg-gray-400'}`}>
                  {c.verdict}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
