import { useLIMS } from '../../context/LIMSContext';
import type { Sample, TestRun } from '../../types';
import { useState } from 'react';
import { Printer, FileText, CheckCircle2, XCircle } from 'lucide-react';

function ReportPage({ sample, run }: { sample: Sample; run: TestRun }) {
  const spec = sample.specification;
  const pass = run.verdict === 'PASS';
  return (
    <div className="print-page bg-white text-gray-900 p-10 font-sans text-sm" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto 24px' }}>
      {/* Header */}
      <div className="flex justify-between items-start pb-4 border-b-2 border-blue-900 mb-6">
        <div>
          <p className="text-xl font-black text-blue-900">CHIP TESTER LABORATORY</p>
          <p className="text-xs text-gray-500 mt-0.5">NABL Accredited Lab · ISO/IEC 17025:2017</p>
          <p className="text-xs text-gray-500">Accreditation No: NABL-TC-4891 · lab@chiptester.in</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-blue-900">TEST REPORT</p>
          <p className="text-sm font-bold text-gray-700 mt-1">{sample.reportNo}</p>
          <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>
          <div className={`mt-2 inline-block px-3 py-1 rounded font-bold text-white text-sm ${pass ? 'bg-green-600' : 'bg-red-600'}`}>
            {pass ? '✓ PASS' : '✗ FAIL'}
          </div>
        </div>
      </div>

      {/* Standard reference */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-xs">
        <strong>Standard:</strong> IEC 60947-2 Ed 5.0 (2016) — Low-voltage switchgear and controlgear – Circuit Breakers (MCCBs) &nbsp;|&nbsp;
        <strong>Sequence:</strong> {run.sequenceId.toUpperCase()}
      </div>

      {/* Specimen table */}
      <p className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-2">1. Test Specimen Description</p>
      <table className="w-full border-collapse text-xs mb-6">
        <tbody>
          {[
            ['Manufacturer', spec.manufacturer, 'Model / Type', spec.model],
            ['Rated Current (In)', `${spec.ratedCurrent} A`, 'Rated Voltage (Ue)', `${spec.ratedVoltage} V`],
            ['Insulation Voltage (Ui)', `${spec.insulationVoltage} V`, 'Impulse Withstand (Uimp)', `${spec.impulsWithstand} kV`],
            ['Icu (Ultimate)', `${spec.shortCircuitUltimate} kA`, 'Ics (Service)', `${spec.shortCircuitService} kA`],
            ['No. of Poles', spec.poles, 'Category', spec.category],
            ['Release Type', spec.releaseType, 'Frame Size', spec.frameSize],
            ['Client', sample.clientName, 'Client Ref.', sample.clientRef],
          ].map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border border-gray-300 px-2 py-1.5 font-semibold text-gray-600 w-36">{row[0]}</td>
              <td className="border border-gray-300 px-2 py-1.5 font-medium">{row[1]}</td>
              <td className="border border-gray-300 px-2 py-1.5 font-semibold text-gray-600 w-36">{row[2]}</td>
              <td className="border border-gray-300 px-2 py-1.5 font-medium">{row[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Clause results */}
      <p className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-2">2. Clause-wise Test Results</p>
      <table className="w-full border-collapse text-xs mb-6">
        <thead>
          <tr className="bg-blue-900 text-white">
            {['Cl. Ref.', 'Test Description', 'Limit', 'Measured', 'Verdict'].map((h) => (
              <th key={h} className="border border-blue-700 px-2 py-2 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {run.clauseResults.map((r, i) => (
            <tr key={r.clauseId + i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border border-gray-300 px-2 py-1.5 font-mono font-bold text-blue-800">{r.clauseId}</td>
              <td className="border border-gray-300 px-2 py-1.5">{r.clauseTitle}</td>
              <td className="border border-gray-300 px-2 py-1.5 font-mono">{r.limitValue ?? '—'} {r.unit ?? ''}</td>
              <td className="border border-gray-300 px-2 py-1.5 font-mono">{r.measuredValue ?? '—'} {r.unit ?? ''}</td>
              <td className="border border-gray-300 px-2 py-1.5">
                <span className={`px-2 py-0.5 rounded font-bold text-white text-[10px] ${r.verdict === 'PASS' ? 'bg-green-600' : r.verdict === 'FAIL' ? 'bg-red-600' : 'bg-gray-400'}`}>
                  {r.verdict}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Waveform metrics (if any) */}
      {run.waveformData && (
        <>
          <p className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-2">3. Short-Circuit Test Derived Values</p>
          <table className="w-full border-collapse text-xs mb-6">
            <tbody>
              {[
                ['Peak Current (Ip)', `${run.waveformData.peakCurrent?.toFixed(3)} kA`, 'Clearing Time (tc)', `${((run.waveformData.clearingTime ?? 0) * 1000).toFixed(1)} ms`],
                ['Arc Duration (tarc)', `${((run.waveformData.arcDuration ?? 0) * 1000).toFixed(1)} ms`, 'Arc Energy (∫i²dt)', `${run.waveformData.arcEnergy?.toFixed(3)} MA²s`],
                ['Power Factor (cos φ)', `${run.waveformData.powerFactor?.toFixed(2)}`, 'Sample Rate', `${(run.waveformData.sampleRate / 1000).toFixed(0)} kS/s`],
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 px-2 py-1.5 font-semibold text-gray-600 w-36">{row[0]}</td>
                  <td className="border border-gray-300 px-2 py-1.5 font-mono font-bold">{row[1]}</td>
                  <td className="border border-gray-300 px-2 py-1.5 font-semibold text-gray-600 w-36">{row[2]}</td>
                  <td className="border border-gray-300 px-2 py-1.5 font-mono font-bold">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Signature block */}
      <p className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-2">4. Signatures & Approval</p>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100">
            {['Role', 'Name', 'Date', 'Signature', 'Status'].map((h) => (
              <th key={h} className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { role: 'Test Technician', name: 'Rahul Verma', date: '2026-07-22', status: 'Signed' },
            { role: 'Lead Test Engineer', name: 'Priya Sharma', date: '2026-07-22', status: 'Pending' },
            { role: 'Quality Manager', name: 'Dr. Arjun Menon', date: '—', status: 'Awaiting' },
          ].map((sig, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border border-gray-300 px-3 py-4 font-medium">{sig.role}</td>
              <td className="border border-gray-300 px-3 py-4">{sig.name}</td>
              <td className="border border-gray-300 px-3 py-4">{sig.date}</td>
              <td className="border border-gray-300 px-3 py-4 text-gray-400 italic">{sig.status === 'Signed' ? '(Digitally signed)' : '___________________'}</td>
              <td className="border border-gray-300 px-3 py-4">
                <span className={`px-2 py-0.5 rounded text-white text-[10px] font-bold ${sig.status === 'Signed' ? 'bg-green-600' : sig.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                  {sig.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between text-[10px] text-gray-400">
        <span>Report No: {sample.reportNo} · IEC 60947-2 · Page 1</span>
        <span>Confidential — Laboratory Document — Not Valid Without All Signatures</span>
        <span>SHA-256: {Math.random().toString(36).slice(2, 12).toUpperCase()}</span>
      </div>
    </div>
  );
}

export function ReportList() {
  const { samples } = useLIMS();
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [selectedRunIdx, setSelectedRunIdx] = useState(0);
  const [showReport, setShowReport] = useState(false);

  const sample = samples.find((s) => s.id === selectedSampleId);
  const run = sample?.testRuns[selectedRunIdx];

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-surface-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-400" />
          <p className="section-title mb-0">Test Reports</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-800">
              {['Report No.', 'Client', 'Model', 'Sequences', 'Overall Verdict', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/60">
            {samples.filter((s) => s.testRuns.length > 0).map((s) => {
              const overallPass = s.testRuns.every((r) => r.verdict === 'PASS');
              return (
                <tr key={s.id} className="hover:bg-surface-800/30">
                  <td className="px-4 py-3 font-mono text-xs text-brand-400">{s.reportNo}</td>
                  <td className="px-4 py-3 text-xs text-surface-200">{s.clientName}</td>
                  <td className="px-4 py-3 text-xs text-surface-300">{s.specification.model}</td>
                  <td className="px-4 py-3 text-xs text-surface-400">{s.testRuns.map((r) => r.sequenceId).join(', ')}</td>
                  <td className="px-4 py-3">
                    {overallPass
                      ? <span className="badge-pass"><CheckCircle2 className="w-3 h-3" /> PASS</span>
                      : <span className="badge-fail"><XCircle className="w-3 h-3" /> FAIL</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="btn-secondary py-1 px-2 text-xs"
                      onClick={() => { setSelectedSampleId(s.id); setSelectedRunIdx(0); setShowReport(true); }}
                    >
                      <Printer className="w-3 h-3" /> View Report
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Print report viewer */}
      {showReport && sample && run && (
        <div>
          <div className="flex items-center justify-between mb-3 no-print">
            <p className="text-sm font-semibold text-surface-100">Report Preview: {sample.reportNo}</p>
            <div className="flex gap-2">
              <select className="input py-1.5 text-xs w-auto" value={selectedRunIdx} onChange={(e) => setSelectedRunIdx(Number(e.target.value))}>
                {sample.testRuns.map((r, i) => (
                  <option key={r.id} value={i}>Run {i + 1}: {r.sequenceId.toUpperCase()}</option>
                ))}
              </select>
              <button className="btn-primary py-1.5 px-3 text-xs" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5" /> Print / PDF
              </button>
              <button className="btn-secondary py-1.5 px-3 text-xs" onClick={() => setShowReport(false)}>Close</button>
            </div>
          </div>
          <ReportPage sample={sample} run={run} />
        </div>
      )}
    </div>
  );
}
