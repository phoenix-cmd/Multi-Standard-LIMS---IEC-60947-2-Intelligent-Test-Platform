import React from 'react';
import type { InvestigationCase } from '../../investigation/CaseTypes';
import { FileText, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

export function FinalReportCompiler({ caseData }: { caseData: InvestigationCase }) {
  return (
    <div className="h-full bg-surface-900 border border-surface-800 rounded-xl p-6 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between border-b border-surface-800 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">NABL / IEC Accredited Certificate</span>
          <h2 className="text-base font-bold text-surface-100 mt-1">Formal Failure Investigation Certificate</h2>
          <p className="text-xs text-surface-400">Case Ref: {caseData.id} · Report Ref: {caseData.reportNo}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Print / Export PDF
        </button>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <h4 className="font-bold text-surface-200 uppercase tracking-wide mb-1">1. Executive Summary</h4>
          <p className="text-surface-300 leading-relaxed bg-surface-950 p-3 rounded-lg border border-surface-800">
            Investigation into Clause {caseData.clauseId} failure recorded on specimen report {caseData.reportNo}. Root cause identified as electronic trip unit parameter drift and bimetal thermal deflection fatigue.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-surface-200 uppercase tracking-wide mb-2">2. Root Cause Analysis</h4>
          <div className="space-y-2">
            {caseData.rootCauses.map((rc, i) => (
              <div key={i} className="bg-surface-950 p-3 rounded-lg border border-surface-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-surface-100">{rc.cause}</p>
                  <p className="text-surface-400 text-[11px] mt-0.5">{rc.rationale}</p>
                </div>
                <span className="font-mono font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                  {rc.probability}% Prob.
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-surface-200 uppercase tracking-wide mb-2">3. Authorized Corrective Actions</h4>
          <ul className="space-y-1 bg-surface-950 p-3 rounded-lg border border-surface-800">
            {caseData.correctiveActions.map((act, i) => (
              <li key={i} className="flex items-center gap-2 text-surface-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Digital Signatures */}
        <div className="pt-4 border-t border-surface-800 grid grid-cols-2 gap-4">
          <div className="bg-surface-950 p-3 rounded-lg border border-surface-800">
            <p className="text-[10px] text-surface-500 uppercase tracking-wide font-semibold">Investigating Lead Engineer</p>
            <p className="text-xs font-bold text-surface-100 mt-1">{caseData.leadEngineer}</p>
            <p className="text-[10px] text-brand-400 font-mono mt-1">SHA256: e8b94...39a12 (Verified)</p>
          </div>
          <div className="bg-surface-950 p-3 rounded-lg border border-surface-800">
            <p className="text-[10px] text-surface-500 uppercase tracking-wide font-semibold">Quality Manager Approval</p>
            <p className="text-xs font-bold text-surface-100 mt-1">Elena Rostova</p>
            <p className="text-[10px] text-brand-400 font-mono mt-1">SHA256: c47a1...88f21 (Verified)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
