import type { ReportSectionProps } from '../core/SectionRegistry';
import { ReportDataMapper } from '../core/ReportDataMapper';

export function SampleSpecificationSection({ data, theme, numbering }: ReportSectionProps) {
  const specSections = ReportDataMapper.mapSpecificationSections(data);

  return (
    <div className="space-y-6 my-6">
      <div className="border-b pb-2" style={{ borderColor: theme.primaryColor }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
          Technical Specimen Specifications
        </h3>
        <p className="text-xs text-gray-500">Declared technical ratings and construction characteristics of the specimen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specSections.map((sec, sIdx) => {
          const tableRef = numbering.nextTable(`spec-sec-${sIdx}`, sec.title);
          return (
            <div key={sec.title} className="space-y-1">
              <p className="text-[11px] font-bold uppercase text-gray-600">
                {tableRef.label}: {tableRef.title}
              </p>
              <table className="w-full text-xs border-collapse border" style={{ borderColor: theme.borderColor }}>
                <tbody>
                  {sec.items.map((item, iIdx) => (
                    <tr key={item.label} className={iIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border p-2 font-semibold text-gray-600 w-1/2">{item.label}</td>
                      <td className="border p-2 font-medium font-mono text-gray-900">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
