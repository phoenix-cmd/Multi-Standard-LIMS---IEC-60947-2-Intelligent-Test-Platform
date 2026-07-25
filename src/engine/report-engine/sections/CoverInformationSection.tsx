import type { ReportSectionProps } from '../core/SectionRegistry';

export function CoverInformationSection({ data, theme, numbering }: ReportSectionProps) {
  const { sample } = data;
  const spec = sample.specification;

  const tableRef = numbering.nextTable('cover-summary', 'Sample & Customer Identification');

  return (
    <div className="space-y-6">
      <div className="text-center py-4 bg-gray-50 border rounded" style={{ borderColor: theme.borderColor }}>
        <h2 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.primaryColor }}>
          TYPE TEST CERTIFICATE & REPORT
        </h2>
        <p className="text-xs font-semibold text-gray-700 mt-1">
          IEC 60947-2 Ed 5.0 (2016) — Low-Voltage Switchgear and Controlgear: Circuit Breakers (MCCBs)
        </p>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
          {tableRef.label}: {tableRef.title}
        </p>
        <table className="w-full text-xs border-collapse border" style={{ borderColor: theme.borderColor }}>
          <tbody>
            <tr className="bg-gray-100">
              <td className="border p-2 font-bold w-36 text-gray-700">Customer Name</td>
              <td className="border p-2 font-medium">{sample.clientName}</td>
              <td className="border p-2 font-bold w-36 text-gray-700">Customer Reference</td>
              <td className="border p-2 font-medium">{sample.clientRef}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold text-gray-700">Date of Receipt</td>
              <td className="border p-2">{sample.receivedDate}</td>
              <td className="border p-2 font-bold text-gray-700">Sample Code ID</td>
              <td className="border p-2 font-mono font-bold text-blue-900">{sample.id.toUpperCase()}</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border p-2 font-bold text-gray-700">Manufacturer</td>
              <td className="border p-2 font-medium">{spec.manufacturer}</td>
              <td className="border p-2 font-bold text-gray-700">Model / Type</td>
              <td className="border p-2 font-bold text-blue-900">{spec.model}</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold text-gray-700">Rated Current (In)</td>
              <td className="border p-2 font-mono font-bold">{spec.ratedCurrent} A</td>
              <td className="border p-2 font-bold text-gray-700">Rated Voltage (Ue)</td>
              <td className="border p-2 font-mono font-bold">{spec.ratedVoltage} V</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border p-2 font-bold text-gray-700">Breaking Capacity (Icu)</td>
              <td className="border p-2 font-mono font-bold">{spec.shortCircuitUltimate} kA</td>
              <td className="border p-2 font-bold text-gray-700">Service Breaking (Ics)</td>
              <td className="border p-2 font-mono font-bold">{spec.shortCircuitService} kA</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold text-gray-700">No. of Poles</td>
              <td className="border p-2">{spec.poles}P</td>
              <td className="border p-2 font-bold text-gray-700">Category / Release</td>
              <td className="border p-2">Cat {spec.category} · {spec.releaseType}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 border rounded" style={{ borderColor: theme.borderColor }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-600">Overall Certificate Verdict</p>
          <p className="text-xs text-gray-500 mt-0.5">Based on evaluation of executed test sequences against IEC 60947-2 clauses.</p>
        </div>
        <div className={`px-4 py-2 rounded text-base font-black text-white ${sample.testRuns.every(r => r.verdict === 'PASS') ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {sample.testRuns.every(r => r.verdict === 'PASS') ? '✓ PASS / CERTIFIED' : '✗ FAIL / NON-COMPLIANT'}
        </div>
      </div>
    </div>
  );
}
