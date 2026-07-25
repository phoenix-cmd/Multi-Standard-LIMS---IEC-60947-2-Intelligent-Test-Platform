import type { ReportSectionProps } from '../core/SectionRegistry';

export function LaboratoryHeaderSection({ data, theme }: ReportSectionProps) {
  return (
    <div className="border-b-2 pb-3 mb-6 flex justify-between items-start" style={{ borderColor: theme.primaryColor }}>
      <div>
        <h1 className="text-xl font-black tracking-tight" style={{ color: theme.primaryColor }}>
          {theme.logoText}
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">NABL Accredited Laboratory · ISO/IEC 17025:2017 Certified</p>
        <p className="text-xs text-gray-500">Accreditation Certificate No: NABL-TC-4891 · Test House Code: TH-091</p>
      </div>
      <div className="text-right">
        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-gray-100 text-gray-800 rounded border border-gray-300">
          REPORT NO: {data.sample.reportNo}
        </span>
        <p className="text-[10px] text-gray-500 mt-1">Date of Issue: {new Date(data.generatedAt).toLocaleDateString()}</p>
        <p className="text-[10px] text-gray-400 font-mono">SHA256: {data.hash.slice(0, 12)}...</p>
      </div>
    </div>
  );
}
