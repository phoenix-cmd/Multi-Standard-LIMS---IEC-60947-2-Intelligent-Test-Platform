import { useState } from 'react';
import { useLIMS } from '../../context/LIMSContext';
import type { Sample } from '../../types';
import { ReportValidator } from '../../engine/report-engine/core/ReportValidator';
import type { ReportDocumentData } from '../../engine/report-engine/types/document';
import { ReportComposer } from '../../engine/report-engine/core/ReportComposer';
import { PackageExporter } from '../../engine/report-engine/core/PackageExporter';
import { ReportDiffViewer } from './ReportDiffViewer';
import { THEMES } from '../../engine/report-engine/themes/themeEngine';
import { Printer, ShieldCheck, AlertTriangle, XCircle, ArrowLeft, Palette, History, Download, GitCompare } from 'lucide-react';

export function ReportViewer({ sample, onClose }: { sample: Sample; onClose: () => void }) {
  const { equipment, users, auditEvents } = useLIMS();

  const [themeId, setThemeId] = useState<string>('havells');
  const [revision, setRevision] = useState<number>(1);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);

  // Construct current ReportDocumentData
  const reportDoc: ReportDocumentData = {
    sample,
    equipmentList: equipment,
    users,
    auditLog: auditEvents,
    generatedAt: new Date().toISOString(),
    revision,
    hash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`.toUpperCase(),
    themeId,
  };

  // Construct Rev 1 document for comparison
  const reportDocRev1: ReportDocumentData = {
    ...reportDoc,
    revision: 1,
  };

  // Validate Document Integrity
  const valResult = ReportValidator.validate(reportDoc);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Action Bar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-4 no-print border-brand-500/30">
        <div className="flex items-center gap-3">
          <button className="btn-secondary py-1.5 px-3 text-xs" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" /> Back to Reports List
          </button>
          <div>
            <p className="text-sm font-bold text-surface-100">
              Report Engine: <span className="font-mono text-brand-400">{sample.reportNo}</span>
            </p>
            <p className="text-xs text-surface-400">
              {sample.clientName} · {sample.specification.model}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 bg-surface-800 px-3 py-1.5 rounded border border-surface-700">
            <Palette className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs text-surface-300">Theme:</span>
            <select
              className="bg-transparent text-xs text-surface-100 focus:outline-none cursor-pointer font-medium"
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
            >
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id} className="bg-surface-900 text-surface-100">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Revision Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-800 px-3 py-1.5 rounded border border-surface-700">
            <History className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs text-surface-300">Revision:</span>
            <select
              className="bg-transparent text-xs text-surface-100 focus:outline-none cursor-pointer font-medium"
              value={revision}
              onChange={(e) => setRevision(Number(e.target.value))}
            >
              <option value={1} className="bg-surface-900">Rev 1.0 (Original)</option>
              <option value={2} className="bg-surface-900">Rev 2.0 (Post-Review)</option>
            </select>
          </div>

          {/* Diff Revisions Button */}
          <button
            className="btn-secondary text-xs py-1.5 px-3"
            onClick={() => setShowDiffModal(true)}
            title="Compare Rev 1.0 vs Rev 2.0"
          >
            <GitCompare className="w-3.5 h-3.5" /> Compare Revisions
          </button>

          {/* Export JSON Audit Package Button */}
          <button
            className="btn-secondary text-xs py-1.5 px-3 text-brand-300 border-brand-500/30"
            onClick={() => PackageExporter.downloadPackageJSON(reportDoc)}
            title="Export Machine-Readable JSON Audit Package"
          >
            <Download className="w-3.5 h-3.5" /> Export Package (JSON)
          </button>

          {/* Print Button */}
          <button
            className={`btn-primary text-xs py-1.5 px-4 ${!valResult.canExport ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!valResult.canExport}
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Validation Status Bar */}
      <div className="card p-3 no-print">
        <div className="flex items-center gap-3">
          {valResult.valid ? (
            <span className="badge-pass text-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> Validation Passed
            </span>
          ) : (
            <span className="badge-fail text-xs">
              <XCircle className="w-3.5 h-3.5" /> Validation Errors ({valResult.errors.length})
            </span>
          )}

          {valResult.warnings.length > 0 && (
            <span className="badge-warn text-xs">
              <AlertTriangle className="w-3.5 h-3.5" /> {valResult.warnings.length} Warnings
            </span>
          )}

          <div className="text-xs text-surface-400 flex-1 truncate">
            {valResult.errors.length > 0
              ? valResult.errors[0].message
              : valResult.warnings.length > 0
              ? valResult.warnings[0].message
              : 'Report data fully verified per ISO/IEC 17025 completeness rules.'}
          </div>
        </div>
      </div>

      {/* Report Composer View */}
      <div className="overflow-x-auto pb-12">
        <ReportComposer data={reportDoc} />
      </div>

      {/* Revision Diff Viewer Modal */}
      {showDiffModal && (
        <ReportDiffViewer
          docRevA={reportDocRev1}
          docRevB={reportDoc}
          onClose={() => setShowDiffModal(false)}
        />
      )}
    </div>
  );
}
