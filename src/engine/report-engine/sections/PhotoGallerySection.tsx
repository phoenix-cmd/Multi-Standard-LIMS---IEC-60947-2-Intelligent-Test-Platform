import type { ReportSectionProps } from '../core/SectionRegistry';
import { ReportDataMapper } from '../core/ReportDataMapper';

export function PhotoGallerySection({ data, theme, numbering }: ReportSectionProps) {
  const attachments = data.sample.attachments;

  if (!attachments || attachments.length === 0) return null;

  const figRef = numbering.nextFigure('sample-photos', 'Specimen Physical Evidence & Attachments');

  return (
    <div className="space-y-4 my-6">
      <div className="border-b pb-2" style={{ borderColor: theme.primaryColor }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
          Specimen Photographs & Attachments
        </h3>
        <p className="text-xs text-gray-500">Photographic proof of sample physical condition before and after test sequence execution.</p>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
        {figRef.label}: {figRef.title}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {attachments.map((att, idx) => (
          <div key={att.id} className="border p-2 rounded bg-gray-50 text-xs space-y-1.5" style={{ borderColor: theme.borderColor }}>
            <div className="w-full h-24 bg-slate-900 rounded border border-slate-700 flex items-center justify-center text-slate-400 font-mono text-[10px] p-2 text-center">
              [ {att.type.toUpperCase()}: {att.name} ]
            </div>
            <p className="font-semibold text-gray-800 truncate">{att.name}</p>
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>{(att.size / 1024).toFixed(0)} KB</span>
              <span>{new Date(att.uploadedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppendixSection({ data, theme, numbering }: ReportSectionProps) {
  const appendixVMs = ReportDataMapper.mapAppendixViewModels(data);

  if (!appendixVMs || appendixVMs.length === 0) return null;

  return (
    <div className="space-y-6 my-6 pt-6 border-t-2" style={{ borderColor: theme.primaryColor }}>
      <div className="border-b pb-2" style={{ borderColor: theme.primaryColor }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
          Appendices & Supporting Documentation
        </h3>
        <p className="text-xs text-gray-500">Supplementary data logs, raw telemetry extractions, and certificate attachments.</p>
      </div>

      {appendixVMs.map((app) => {
        const appRef = numbering.nextAppendix(app.id, app.title);
        return (
          <div key={app.id} className="border rounded p-4 space-y-2 bg-white" style={{ borderColor: theme.borderColor }}>
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="text-xs font-bold text-gray-900">
                {appRef.label}: {app.title}
              </h4>
              <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                Ref: {app.refCode}
              </span>
            </div>
            <p className="text-xs text-gray-600">{app.description}</p>
          </div>
        );
      })}
    </div>
  );
}
