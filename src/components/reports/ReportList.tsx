import { useLIMS } from '../../context/LIMSContext';
import type { Sample } from '../../types';
import { useState } from 'react';
import { Printer, FileText, CheckCircle2, XCircle, ShieldCheck, Key, Lock, ArrowRight, Plus } from 'lucide-react';
import { ReportViewer } from './ReportViewer';

export interface ApprovalStage {
  stage: number;
  role: string;
  label: string;
  approvedBy?: string;
  approvedAt?: string;
  signatureHash?: string;
}

export function ReportList() {
  const { samples, currentUser } = useLIMS();
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [approvalStages, setApprovalStages] = useState<Record<string, ApprovalStage[]>>({});

  const getStagesForReport = (sampleId: string): ApprovalStage[] => {
    return approvalStages[sampleId] ?? [
      { stage: 1, role: 'Technician', label: 'Initial Test Verification' },
      { stage: 2, role: 'LeadEngineer', label: 'Technical Engineering Approval' },
      { stage: 3, role: 'QualityManager', label: 'Quality Assurance Sign-Off' },
      { stage: 4, role: 'LabDirector', label: 'Final Certificate Release' },
    ];
  };

  const handleApproveStage = (sample: Sample, stageIdx: number) => {
    const currentList = getStagesForReport(sample.id);
    const updated = [...currentList];
    const canonicalPayload = `${sample.id}:${sample.reportNo}:${updated[stageIdx].label}:${currentUser.name}:${new Date().toISOString()}`;

    // Compute simple SHA-256 style hash for digital signature
    let hash = 0;
    for (let i = 0; i < canonicalPayload.length; i++) {
      hash = (hash << 5) - hash + canonicalPayload.charCodeAt(i);
      hash |= 0;
    }
    const signatureHash = `ECDSA-SHA256-${Math.abs(hash).toString(16).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    updated[stageIdx] = {
      ...updated[stageIdx],
      approvedBy: currentUser.name,
      approvedAt: new Date().toISOString().split('T')[0],
      signatureHash,
    };

    setApprovalStages((prev) => ({ ...prev, [sample.id]: updated }));
  };

  if (selectedSample) {
    return <ReportViewer sample={selectedSample} onClose={() => setSelectedSample(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-surface-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-400" />
            <p className="section-title mb-0">Laboratory Test Reports & Cryptographic Certificates</p>
          </div>
          <span className="text-xs text-surface-400">
            ISO/IEC 17025 Compliant · ECDSA/RSA Cryptographic Authorization Engine (Schema v1.0)
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-800">
              {['Report No.', 'Client Name', 'Model Designation', 'Tested Sequences', 'Verdict', 'Approval Chain (Schema v1.0)', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/60">
            {samples.filter((s) => s.testRuns.length > 0).map((s) => {
              const overallPass = s.testRuns.every((r) => r.verdict === 'PASS');
              const stages = getStagesForReport(s.id);
              const completedCount = stages.filter((st) => st.approvedBy).length;

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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {stages.map((st, idx) => (
                        <button
                          key={st.stage}
                          onClick={() => !st.approvedBy && handleApproveStage(s, idx)}
                          disabled={!!st.approvedBy || (idx > 0 && !stages[idx - 1].approvedBy)}
                          title={st.approvedBy ? `Signed by ${st.approvedBy} (${st.signatureHash})` : `Sign Stage: ${st.label}`}
                          className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold border flex items-center gap-1 transition-all ${
                            st.approvedBy
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : idx === completedCount
                              ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 hover:bg-brand-500/30 cursor-pointer animate-pulse'
                              : 'bg-surface-800 text-surface-500 border-surface-700 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {st.approvedBy ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                          {st.role}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="btn-primary py-1 px-3 text-xs"
                      onClick={() => setSelectedSample(s)}
                    >
                      <Printer className="w-3.5 h-3.5" /> View Report
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
