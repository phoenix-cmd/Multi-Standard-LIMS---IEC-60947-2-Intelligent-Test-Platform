import { useState } from 'react';
import { useLIMS } from '../../context/LIMSContext';
import type { Sample, SampleLifecycleState } from '../../types';
import { Package, Plus, ChevronRight, Clock, CheckCircle2, FlaskConical, Archive } from 'lucide-react';

const LIFECYCLE_STAGES: SampleLifecycleState[] = [
  'Received', 'Accepted', 'Inspection', 'Waiting',
  'Testing', 'Paused', 'Completed', 'Review',
  'Approved', 'Released', 'Archived'
];

function stageColor(state: SampleLifecycleState): string {
  if (['Approved', 'Released'].includes(state)) return 'bg-success-600';
  if (['Testing', 'Completed', 'Review'].includes(state)) return 'bg-brand-500';
  if (['Paused'].includes(state)) return 'bg-warning-500';
  if (['Archived'].includes(state)) return 'bg-surface-600';
  return 'bg-surface-700';
}

function SampleCard({ sample, onSelect }: { sample: Sample; onSelect: () => void }) {
  const currentIdx = LIFECYCLE_STAGES.indexOf(sample.lifecycleState);
  const progress = Math.round(((currentIdx + 1) / LIFECYCLE_STAGES.length) * 100);
  return (
    <button onClick={onSelect} className="card p-4 text-left hover:border-brand-600/40 hover:bg-surface-800/60 transition-all w-full">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-mono text-brand-400">{sample.reportNo}</p>
          <p className="text-sm font-semibold text-surface-100 mt-0.5">{sample.specification.model}</p>
          <p className="text-xs text-surface-400">{sample.clientName}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${stageColor(sample.lifecycleState)}`}>
            {sample.lifecycleState}
          </span>
          <p className="text-[10px] text-surface-500 mt-1">
            {sample.specification.ratedCurrent}A · {sample.specification.ratedVoltage}V · {sample.specification.shortCircuitUltimate}kA
          </p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-surface-500 mb-1">
          <span>Lifecycle Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </button>
  );
}

function SampleDetail({ sample }: { sample: Sample }) {
  const { updateSampleLifecycle } = useLIMS();
  const currentIdx = LIFECYCLE_STAGES.indexOf(sample.lifecycleState);

  return (
    <div className="space-y-4">
      {/* Spec */}
      <div className="card p-4">
        <p className="section-title">Specimen Specification</p>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            ['Report No.', sample.reportNo],
            ['Client', sample.clientName],
            ['Model', sample.specification.model],
            ['Frame', sample.specification.frameSize],
            ['Poles', sample.specification.poles],
            ['In', `${sample.specification.ratedCurrent} A`],
            ['Ue', `${sample.specification.ratedVoltage} V`],
            ['Ui', `${sample.specification.insulationVoltage} V`],
            ['Icu', `${sample.specification.shortCircuitUltimate} kA`],
            ['Ics', `${sample.specification.shortCircuitService} kA`],
            ['Category', sample.specification.category],
            ['Release', sample.specification.releaseType],
          ].map(([k, v]) => (
            <div key={k as string} className="bg-surface-800 rounded-lg px-3 py-2">
              <p className="text-[10px] text-surface-500 uppercase tracking-wide">{k}</p>
              <p className="text-surface-100 font-medium mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lifecycle timeline */}
      <div className="card p-4">
        <p className="section-title">Lifecycle Timeline</p>
        <div className="relative">
          {/* Track */}
          <div className="flex items-center gap-0 overflow-x-auto pb-8 pt-2">
            {LIFECYCLE_STAGES.map((stage, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              return (
                <div key={stage} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all
                      ${done ? 'border-success-500 bg-success-600 text-white' : active ? 'border-brand-500 bg-brand-600 text-white glow-brand' : 'border-surface-700 bg-surface-800 text-surface-500'}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={`text-[9px] font-medium whitespace-nowrap ${active ? 'text-brand-400' : done ? 'text-success-400' : 'text-surface-600'}`}>
                      {stage}
                    </span>
                  </div>
                  {i < LIFECYCLE_STAGES.length - 1 && (
                    <div className={`w-6 h-0.5 flex-shrink-0 mt-[-12px] ${done ? 'bg-success-500' : 'bg-surface-700'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Advance button */}
        {currentIdx < LIFECYCLE_STAGES.length - 1 && (
          <button
            className="btn-primary mt-3"
            onClick={() => updateSampleLifecycle(sample.id, LIFECYCLE_STAGES[currentIdx + 1])}
          >
            <ChevronRight className="w-4 h-4" />
            Advance to: {LIFECYCLE_STAGES[currentIdx + 1]}
          </button>
        )}
      </div>

      {/* History */}
      <div className="card p-4">
        <p className="section-title">Lifecycle History</p>
        <div className="space-y-2">
          {[...sample.lifecycleHistory].reverse().map((h, i) => (
            <div key={i} className="flex items-start gap-3 text-xs">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? 'bg-brand-400' : 'bg-surface-600'}`} />
              <div>
                <span className="font-semibold text-surface-200">{h.state}</span>
                <span className="text-surface-500 ml-2">by {h.user}</span>
                <p className="text-surface-600">{new Date(h.timestamp).toLocaleString()}</p>
                {h.notes && <p className="text-surface-400 italic">{h.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test runs */}
      {sample.testRuns.length > 0 && (
        <div className="card p-4">
          <p className="section-title">Test Runs</p>
          <div className="space-y-2">
            {sample.testRuns.map((run) => (
              <div key={run.id} className="bg-surface-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-surface-100">{run.sequenceId.toUpperCase()}</p>
                  <p className="text-[11px] text-surface-400">{run.executedBy} · {new Date(run.startedAt).toLocaleDateString()}</p>
                </div>
                <span className={run.verdict === 'PASS' ? 'badge-pass' : 'badge-fail'}>
                  {run.verdict}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {sample.attachments.length > 0 && (
        <div className="card p-4">
          <p className="section-title">Attachments ({sample.attachments.length})</p>
          <div className="space-y-1.5">
            {sample.attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-3 bg-surface-800 rounded px-3 py-2 text-xs">
                <span className="text-brand-400 font-mono uppercase">[{att.type}]</span>
                <span className="text-surface-200 flex-1">{att.name}</span>
                <span className="text-surface-500">{(att.size / 1024).toFixed(0)} KB</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SampleRegistry() {
  const { samples } = useLIMS();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<string>('all');

  const selectedSample = samples.find((s) => s.id === selectedId);
  const filtered = filterState === 'all'
    ? samples
    : samples.filter((s) => s.lifecycleState === filterState);

  return (
    <div className="flex gap-4 h-full">
      {/* Left panel */}
      <div className={`${selectedSample ? 'w-64 flex-shrink-0' : 'flex-1'} space-y-3`}>
        <div className="flex items-center gap-2">
          <select className="input text-xs py-1.5" value={filterState} onChange={(e) => setFilterState(e.target.value)}>
            <option value="all">All States</option>
            {LIFECYCLE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-primary py-1.5 px-3 text-xs flex-shrink-0"><Plus className="w-3.5 h-3.5" /> New</button>
        </div>
        <div className="space-y-2">
          {filtered.map((s) => (
            <SampleCard key={s.id} sample={s} onSelect={() => setSelectedId(s.id === selectedId ? null : s.id)} />
          ))}
        </div>
      </div>

      {/* Right detail */}
      {selectedSample && (
        <div className="flex-1 overflow-y-auto animate-fade-in">
          <SampleDetail sample={selectedSample} />
        </div>
      )}
    </div>
  );
}
