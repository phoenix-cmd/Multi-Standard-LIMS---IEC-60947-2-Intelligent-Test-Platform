import type React from 'react';
import type { ReportDocumentData } from '../types/document';
import { SectionRegistry } from './SectionRegistry';
import { getTheme } from '../themes/themeEngine';
import { NumberingEngine } from './NumberingEngine';

export function DocumentCompiler({ data }: { data: ReportDocumentData }) {
  const theme = getTheme(data.themeId);
  const numbering = new NumberingEngine();
  numbering.reset();

  const visibleSections = SectionRegistry.getVisibleSections(data);
  const isDraft = data.sample.lifecycleState !== 'Approved' && data.sample.lifecycleState !== 'Released';

  return (
    <div
      className="print-page bg-white text-gray-900 p-8 font-sans text-sm relative shadow-2xl my-6"
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Draft Watermark */}
      {isDraft && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 opacity-10">
          <span className="text-8xl font-black text-rose-900 -rotate-45 select-none tracking-widest border-8 border-rose-900 p-8">
            DRAFT — UNAPPROVED
          </span>
        </div>
      )}

      {/* Render Document Sections */}
      <div className="relative z-10 space-y-6">
        {visibleSections.map((Sec) => {
          const SectionComp = Sec.Component;
          return (
            <div key={Sec.id} className="section-block">
              <SectionComp data={data} theme={theme} numbering={numbering} />
            </div>
          );
        })}
      </div>

      {/* Document Footer (Print-Safe) */}
      <div className="mt-12 pt-4 border-t border-gray-300 flex justify-between items-center text-[10px] text-gray-400 no-print">
        <span>Standard: IEC 60947-2 Ed 5.0 (2016)</span>
        <span>Confidential — NABL Accredited Laboratory Document</span>
        <span>Revision: Rev-{data.revision}</span>
      </div>
    </div>
  );
}
