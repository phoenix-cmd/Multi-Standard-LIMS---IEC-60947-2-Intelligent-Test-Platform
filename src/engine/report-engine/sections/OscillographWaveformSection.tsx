import type { ReportSectionProps } from '../core/SectionRegistry';

export function OscillographWaveformSection({ data, theme, numbering }: ReportSectionProps) {
  const shortCircuitRuns = data.sample.testRuns.filter((r) => r.waveformData);

  if (shortCircuitRuns.length === 0) return null;

  return (
    <div className="space-y-6 my-6">
      <div className="border-b pb-2" style={{ borderColor: theme.primaryColor }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
          Short-Circuit Telemetry & Oscillograph Analysis
        </h3>
        <p className="text-xs text-gray-500">Derived waveform values captured at 100 kS/s sampling rate during short-circuit sequence execution.</p>
      </div>

      {shortCircuitRuns.map((run) => {
        const wf = run.waveformData!;
        const figRef = numbering.nextFigure(`fig-osg-${run.sequenceId}`, `Short-Circuit Oscillograph Waveform (${run.sequenceId.toUpperCase()})`);
        const tableRef = numbering.nextTable(`table-osg-${run.sequenceId}`, `Waveform Derived Parameters (${run.sequenceId.toUpperCase()})`);

        return (
          <div key={run.id} className="border rounded p-4 space-y-4 bg-white" style={{ borderColor: theme.borderColor }}>
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="text-xs font-bold text-gray-900">Sequence {run.sequenceId.toUpperCase()} — Short Circuit Breakdown</h4>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                100,000 Samples / sec
              </span>
            </div>

            {/* Waveform graphic placeholder / render container */}
            <div className="p-4 bg-slate-950 text-slate-100 rounded border border-slate-800 flex flex-col items-center justify-center space-y-2">
              <div className="w-full h-32 flex items-center justify-center border border-dashed border-slate-700 rounded bg-slate-900">
                <p className="text-xs font-mono text-cyan-400">
                  [ Oscillograph Waveform Captured: Phase R / Phase S / V_arc ]
                </p>
              </div>
              <p className="text-[10px] text-slate-400">
                {figRef.label}: {figRef.title}
              </p>
            </div>

            {/* Metrics Table */}
            <div>
              <p className="text-[11px] font-bold uppercase text-gray-600 mb-1">
                {tableRef.label}: {tableRef.title}
              </p>
              <table className="w-full text-xs border-collapse border" style={{ borderColor: theme.borderColor }}>
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border p-1.5 text-left">Peak Current (Ip)</th>
                    <th className="border p-1.5 text-left">Clearing Time (tc)</th>
                    <th className="border p-1.5 text-left">Arc Duration (tarc)</th>
                    <th className="border p-1.5 text-left">Arc Energy (∫i²dt)</th>
                    <th className="border p-1.5 text-left">Power Factor (cos φ)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-1.5 font-mono font-bold text-blue-900">{wf.peakCurrent?.toFixed(3)} kA</td>
                    <td className="border p-1.5 font-mono font-bold">{((wf.clearingTime || 0) * 1000).toFixed(1)} ms</td>
                    <td className="border p-1.5 font-mono font-bold">{((wf.arcDuration || 0) * 1000).toFixed(1)} ms</td>
                    <td className="border p-1.5 font-mono font-bold">{wf.arcEnergy?.toFixed(3)} MA²s</td>
                    <td className="border p-1.5 font-mono font-bold">{wf.powerFactor?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
