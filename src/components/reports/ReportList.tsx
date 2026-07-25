import { useLIMS } from '../../context/LIMSContext';
import type { Sample } from '../../types';
import { useState } from 'react';
import { Printer, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { ReportViewer } from './ReportViewer';

export function ReportList() {
  const { samples } = useLIMS();
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

  if (selectedSample) {
    return <ReportViewer sample={selectedSample} onClose={() => setSelectedSample(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-surface-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-400" />
            <p className="section-title mb-0">Laboratory Test Reports & Certificates</p>
          </div>
          <span className="text-xs text-surface-400">
            ISO/IEC 17025 Compliant · Template-Driven Modular Engine
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-800">
              {['Report No.', 'Client Name', 'Model Designation', 'Tested Sequences', 'Overall Verdict', 'Lifecycle State', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/60">
            {samples.filter((s) => s.testRuns.length > 0).map((s) => {
              const overallPass = s.testRuns.every((r) => r.verdict === 'PASS');
              return (
                <tr key={s.id} className="hover:bg-surface-800/30">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-brand-400">{s.reportNo}</td>
                  <td className="px-4 py-3 text-xs text-surface-200">{s.clientName}</td>
                  <td className="px-4 py-3 text-xs text-surface-300 font-medium">{s.specification.model}</td>
                  <td className="px-4 py-3 text-xs text-surface-400 font-mono">{s.testRuns.map((r) => r.sequenceId.toUpperCase()).join(', ')}</td>
                  <td className="px-4 py-3">
                    {overallPass
                      ? <span className="badge-pass"><CheckCircle2 className="w-3 h-3" /> PASS</span>
                      : <span className="badge-fail"><XCircle className="w-3 h-3" /> FAIL</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-surface-400">{s.lifecycleState}</td>
                  <td className="px-4 py-3">
                    <button
                      className="btn-primary py-1 px-3 text-xs"
                      onClick={() => setSelectedSample(s)}
                    >
                      <Printer className="w-3.5 h-3.5" /> View Full Report
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
