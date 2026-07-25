import type { ReportSectionProps } from '../core/SectionRegistry';
import { ReportDataMapper } from '../core/ReportDataMapper';

export function EquipmentCalibrationSection({ data, theme, numbering }: ReportSectionProps) {
  const eqVMs = ReportDataMapper.mapEquipmentViewModels(data);
  const tableRef = numbering.nextTable('equipment-cal', 'Apparatus & Instrumentation Calibration Record');

  return (
    <div className="space-y-4 my-6">
      <div className="border-b pb-2" style={{ borderColor: theme.primaryColor }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
          Test Equipment Traceability & Calibration
        </h3>
        <p className="text-xs text-gray-500">Only calibrated instruments used during execution are listed per ISO/IEC 17025 traceability requirements.</p>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
        {tableRef.label}: {tableRef.title}
      </p>

      <table className="w-full text-xs border-collapse border" style={{ borderColor: theme.borderColor }}>
        <thead>
          <tr style={{ backgroundColor: theme.tableHeaderBg, color: theme.tableHeaderColor }}>
            <th className="border p-2 text-left w-24">Asset Tag</th>
            <th className="border p-2 text-left">Equipment Name</th>
            <th className="border p-2 text-left">Make / Model</th>
            <th className="border p-2 text-left">Serial No.</th>
            <th className="border p-2 text-left">Cal. Cert No.</th>
            <th className="border p-2 text-left w-28">Calibration Due</th>
            <th className="border p-2 text-center w-24">Status</th>
          </tr>
        </thead>
        <tbody>
          {eqVMs.map((eq, idx) => (
            <tr key={eq.assetTag} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border p-2 font-mono font-bold text-blue-900">{eq.assetTag}</td>
              <td className="border p-2 font-medium">{eq.name}</td>
              <td className="border p-2">{eq.manufacturer} {eq.model}</td>
              <td className="border p-2 font-mono">{eq.serialNo}</td>
              <td className="border p-2 font-mono font-bold">{eq.certNo}</td>
              <td className="border p-2 font-mono">{eq.calDue}</td>
              <td className="border p-2 text-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${eq.status === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {eq.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
