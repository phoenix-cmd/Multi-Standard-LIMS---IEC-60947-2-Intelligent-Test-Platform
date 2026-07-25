import type { ReportSectionProps } from '../core/SectionRegistry';
import { SectionRegistry } from '../core/SectionRegistry';

export function TableOfContentsSection({ data, theme }: ReportSectionProps) {
  const visibleSections = SectionRegistry.getVisibleSections(data);

  return (
    <div className="space-y-4 my-6">
      <div className="border-b pb-2" style={{ borderColor: theme.primaryColor }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
          Document Table of Contents
        </h3>
      </div>
      <div className="divide-y text-xs">
        {visibleSections.map((sec, idx) => (
          <div key={sec.id} className="py-1.5 flex justify-between items-center hover:bg-gray-50 px-2">
            <span className="font-medium text-gray-800">
              <span className="font-mono text-gray-400 mr-2">{idx + 1}.0</span>
              {sec.title}
            </span>
            <span className="font-mono text-gray-400">Section {idx + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
