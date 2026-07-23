import { useState } from 'react';
import { useLIMS } from '../../context/LIMSContext';
import { RuleEngine } from '../../engine/rule-engine/RuleEngine';
import { FormulaEngine } from '../../engine/rule-engine/FormulaEngine';
import { DiagnosisEngine, RecommendationEngine, ConsistencyChecker, SummaryGenerator } from '../../ai/engines';
import { StreamSimulator } from '../../engine/drivers/StreamSimulator';
import type { TestRun, ClauseResult, Verdict, FormSchema } from '../../types';
import { FORM_SCHEMAS } from '../../mock/enterpriseInitialData';
import {
  ChevronRight, ChevronLeft, CheckCircle2, XCircle, AlertCircle,
  FlaskConical, Zap, FileText, Bot
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AdvancedOscillographViewer } from '../oscillograph/AdvancedOscillographViewer';

const SEQUENCES = [
  { id: 'seq-I', label: 'Sequence I', sub: 'General Performance', steps: 4 },
  { id: 'seq-II', label: 'Sequence II', sub: 'Ics — Service Short-Circuit', steps: 3 },
  { id: 'seq-III', label: 'Sequence III', sub: 'Icu — Ultimate Short-Circuit', steps: 3 },
  { id: 'seq-IV', label: 'Sequence IV', sub: 'Icw — Short-Time Withstand', steps: 2 },
];

const RULES = [
  {
    id: 'r1', clauseId: '8.3.3.1', label: 'Temperature Rise — Terminals',
    expression: 'dT_terminal_R <= 70 AND dT_terminal_S <= 70 AND dT_terminal_T <= 70',
    conditions: [], severity: 'critical' as const,
    failMessage: 'One or more terminal temperature rises exceed 70 K limit (IEC 60947-2 Cl. 8.3.3.1).',
    passMessage: 'All terminal temperature rises ≤ 70 K. PASS.',
  },
  {
    id: 'r2', clauseId: '8.3.3.1', label: 'Temperature Rise — Handle',
    expression: 'dT_handle <= 35',
    conditions: [], severity: 'major' as const,
    failMessage: 'Operating handle temperature rise exceeds 35 K limit (Cl. 8.3.3.1).',
    passMessage: 'Handle temperature rise ≤ 35 K. PASS.',
  },
  {
    id: 'r3', clauseId: '8.3.3.2', label: 'Dielectric Withstand',
    expression: 'flashover_num == 0 AND leakage_current < 5',
    conditions: [], severity: 'critical' as const,
    failMessage: 'Dielectric test failed — flashover/puncture detected or leakage > 5 mA (Cl. 8.3.3.2).',
    passMessage: 'No flashover/puncture. Leakage within limit. PASS.',
  },
  {
    id: 'r4', clauseId: '8.3.3.3', label: 'No-Trip at 1.05×In',
    expression: 'tripOccurred_105_num == 0',
    conditions: [], severity: 'critical' as const,
    failMessage: 'Device tripped at 1.05×In — should NOT trip (Cl. 8.3.3.3).',
    passMessage: 'No trip at 1.05×In. Correct behaviour. PASS.',
  },
  {
    id: 'r5', clauseId: '8.3.3.3', label: 'Trip at 1.30×In within limit',
    expression: 'tripTime_130 <= tripLimit_max',
    conditions: [], severity: 'critical' as const,
    failMessage: 'Trip time at 1.30×In exceeds the maximum allowed limit (Cl. 8.3.3.3).',
    passMessage: 'Trip at 1.30×In within limit band. PASS.',
  },
];

const FORMULAS = [
  { id: 'I_105_calc', expression: '1.05 * In', unit: 'A' },
  { id: 'I_130_calc', expression: '1.30 * In', unit: 'A' },
  { id: 'Utest', expression: '2 * Ui + 1000', unit: 'V' },
];

function VerdictBadge({ v }: { v: Verdict }) {
  if (v === 'PASS') return <span className="badge-pass"><CheckCircle2 className="w-3 h-3" /> PASS</span>;
  if (v === 'FAIL') return <span className="badge-fail"><XCircle className="w-3 h-3" /> FAIL</span>;
  if (v === 'NA') return <span className="badge-na">N/A</span>;
  return <span className="badge-warn"><AlertCircle className="w-3 h-3" /> {v}</span>;
}

export function GuidedTestWizard() {
  const { samples, addTestRun, currentUser } = useLIMS();
  const [selectedSampleId, setSelectedSampleId] = useState<string>(samples[1]?.id ?? '');
  const [selectedSeq, setSelectedSeq] = useState('seq-I');
  const [step, setStep] = useState(0); // 0=select, 1..N=form steps, N+1=results
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<ClauseResult[]>([]);
  const [verdict, setVerdict] = useState<Verdict>('PENDING');
  const [showWaveform, setShowWaveform] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<string[] | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const formulaEngine = new FormulaEngine();
  const sample = samples.find((s) => s.id === selectedSampleId);
  const spec = sample?.specification;

  const seqForms = FORM_SCHEMAS;
  const STEPS = seqForms.length + 2; // 0=setup, 1..4=forms, last=results

  const handleInput = (id: string, value: string) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const evaluateForField = (fieldId: string, schema: FormSchema) => {
    const field = schema.fields.find((f) => f.id === fieldId);
    if (!field?.formulaRef || !spec) return '';
    const vars = { In: spec.ratedCurrent, Ui: spec.insulationVoltage, Ue: spec.ratedVoltage };
    return formulaEngine.evaluate(field.formulaRef, vars).toFixed(2);
  };

  const runEvaluation = () => {
    if (!spec) return;
    const numInputs: Record<string, number> = {};
    for (const [k, v] of Object.entries(inputs)) {
      const n = parseFloat(v);
      numInputs[k] = isNaN(n) ? 0 : n;
      // Encode select values
      if (v === 'No' || v === 'No Trip (PASS)') numInputs[`${k}_num`] = 0;
      if (v === 'Yes' || v === 'Tripped (FAIL)') numInputs[`${k}_num`] = 1;
    }
    numInputs['In'] = spec.ratedCurrent;
    numInputs['Ui'] = spec.insulationVoltage;
    numInputs['Ue'] = spec.ratedVoltage;

    const engine = new RuleEngine();
    const clauseResults = engine.evaluateAll(RULES, numInputs, FORMULAS);
    setResults(clauseResults);
    const ov = engine.overallVerdict(clauseResults);
    setVerdict(ov);

    // Consistency check
    const checker = new ConsistencyChecker();
    setWarnings(checker.check(numInputs, spec));

    // Summary
    const sg = new SummaryGenerator();
    setSummary(sg.generate(clauseResults, spec));

    // AI diagnosis for failures
    const failed = clauseResults.filter((r) => r.verdict === 'FAIL');
    if (failed.length > 0 && spec) {
      const diagEngine = new DiagnosisEngine();
      const rec = new RecommendationEngine();
      const diag = diagEngine.diagnose(failed, spec);
      setAiDiagnosis(rec.recommend(diag));
    } else {
      setAiDiagnosis(null);
    }

    // Save run
    const run: TestRun = {
      id: uuidv4(), sampleId: selectedSampleId, sequenceId: selectedSeq,
      startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
      executedBy: currentUser.name, verdict: ov, inputs: numInputs,
      clauseResults,
      waveformData: selectedSeq !== 'seq-I' ? StreamSimulator.generateShortCircuitSnapshot(spec?.shortCircuitUltimate ?? 50) : undefined,
      replayLog: [],
    };
    if (sample) addTestRun(sample.id, run);

    setStep(STEPS - 1);
  };

  const isLastFormStep = step === STEPS - 2;
  const formIdx = step - 1;
  const currentForm = seqForms[formIdx];

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-semibold text-surface-100">Guided Test Wizard — IEC 60947-2</span>
          <span className="ml-auto text-xs text-surface-500">Step {step + 1} of {STEPS}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-brand-500' : 'bg-surface-700'}`} />
          ))}
        </div>
      </div>

      {/* Step 0: Setup */}
      {step === 0 && (
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-surface-100">Test Setup</h2>
          <div>
            <label className="label">Select Sample</label>
            <select className="input" value={selectedSampleId} onChange={(e) => setSelectedSampleId(e.target.value)}>
              {samples.map((s) => (
                <option key={s.id} value={s.id}>{s.reportNo} — {s.specification.model} ({s.clientName})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Select Sequence</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {SEQUENCES.map((seq) => (
                <button
                  key={seq.id}
                  onClick={() => setSelectedSeq(seq.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${selectedSeq === seq.id ? 'border-brand-500 bg-brand-600/10' : 'border-surface-700 bg-surface-800 hover:border-surface-600'}`}
                >
                  <p className="text-sm font-semibold text-surface-100">{seq.label}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{seq.sub}</p>
                </button>
              ))}
            </div>
          </div>
          {sample && (
            <div className="bg-surface-800 rounded-lg p-3 grid grid-cols-3 gap-2 text-xs">
              {[
                ['In', `${sample.specification.ratedCurrent} A`],
                ['Ue', `${sample.specification.ratedVoltage} V`],
                ['Icu', `${sample.specification.shortCircuitUltimate} kA`],
                ['Ics', `${sample.specification.shortCircuitService} kA`],
                ['Poles', sample.specification.poles],
                ['Category', sample.specification.category],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <span className="text-surface-500">{k}: </span>
                  <span className="text-surface-100 font-medium">{v}</span>
                </div>
              ))}
            </div>
          )}
          <button className="btn-primary w-full" onClick={() => setStep(1)}>
            Begin Sequence {selectedSeq.toUpperCase()} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic form steps */}
      {step > 0 && step < STEPS - 1 && currentForm && (
        <div className="card p-6 space-y-4 animate-fade-in">
          <h2 className="text-base font-semibold text-surface-100">{currentForm.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentForm.fields.map((field) => {
              const hint = field.formulaRef && spec
                ? `Formula: ${field.formulaRef} = ${evaluateForField(field.id, currentForm)}`
                : undefined;
              return (
                <div key={field.id}>
                  <label className="label">
                    {field.label}
                    {field.unit && <span className="text-brand-400 ml-1 normal-case font-normal">({field.unit})</span>}
                    {field.required && <span className="text-danger-400 ml-1">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      className="input"
                      value={inputs[field.id] ?? ''}
                      onChange={(e) => handleInput(field.id, e.target.value)}
                    >
                      <option value="">— Select —</option>
                      {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      className="input"
                      placeholder={hint ?? field.placeholder ?? ''}
                      value={inputs[field.id] ?? ''}
                      onChange={(e) => handleInput(field.id, e.target.value)}
                    />
                  )}
                  {field.description && <p className="text-[11px] text-surface-500 mt-1">{field.description}</p>}
                  {hint && <p className="text-[11px] text-brand-400/70 mt-1">{hint}</p>}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-secondary" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {isLastFormStep ? (
              <button className="btn-primary flex-1" onClick={runEvaluation}>
                <Zap className="w-4 h-4" /> Evaluate & Generate Results
              </button>
            ) : (
              <button className="btn-primary flex-1" onClick={() => setStep(step + 1)}>
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {step === STEPS - 1 && (
        <div className="space-y-4 animate-fade-in">
          {/* Overall verdict */}
          <div className={`card p-5 flex items-center gap-4 ${verdict === 'PASS' ? 'glow-success' : 'glow-danger'}`}>
            {verdict === 'PASS'
              ? <CheckCircle2 className="w-10 h-10 text-success-400" />
              : <XCircle className="w-10 h-10 text-danger-400" />}
            <div>
              <p className={`text-2xl font-black ${verdict === 'PASS' ? 'text-success-400' : 'text-danger-400'}`}>
                {verdict === 'PASS' ? 'ALL CLAUSES PASSED' : 'TEST SEQUENCE FAILED'}
              </p>
              <p className="text-xs text-surface-400 mt-1">{summary}</p>
            </div>
          </div>

          {/* Consistency warnings */}
          {warnings.length > 0 && (
            <div className="card p-4 border-warning-600/30 bg-warning-600/5">
              <p className="text-xs font-semibold text-warning-400 mb-2">⚠ Data Consistency Warnings</p>
              {warnings.map((w, i) => <p key={i} className="text-xs text-warning-400/80">{w}</p>)}
            </div>
          )}

          {/* Clause results table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-surface-800">
              <p className="section-title">Clause-by-Clause Results</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-800">
                  {['Clause', 'Description', 'Verdict', 'Message'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {results.map((r) => (
                  <tr key={r.clauseId + r.ruleId} className="hover:bg-surface-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-brand-400">{r.clauseId}</td>
                    <td className="px-4 py-3 text-xs text-surface-300">{r.clauseTitle}</td>
                    <td className="px-4 py-3"><VerdictBadge v={r.verdict} /></td>
                    <td className="px-4 py-3 text-xs text-surface-400">{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Diagnosis */}
          {aiDiagnosis && (
            <div className="card p-4 border-danger-600/20 bg-danger-600/5">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-danger-400" />
                <p className="text-sm font-semibold text-danger-400">AI Failure Diagnosis & Recommendations</p>
              </div>
              <pre className="text-xs text-surface-300 whitespace-pre-wrap font-mono leading-relaxed">
                {aiDiagnosis.join('\n')}
              </pre>
            </div>
          )}

          {/* Show waveform button */}
          {selectedSeq !== 'seq-I' && (
            <button className="btn-secondary w-full" onClick={() => setShowWaveform((v) => !v)}>
              <Zap className="w-4 h-4" /> {showWaveform ? 'Hide' : 'View'} Short-Circuit Oscillograph
            </button>
          )}
          {showWaveform && <AdvancedOscillographViewer />}

          <div className="flex gap-3">
            <button className="btn-secondary" onClick={() => { setStep(0); setResults([]); setInputs({}); setSummary(null); setAiDiagnosis(null); }}>
              <ChevronLeft className="w-4 h-4" /> New Test
            </button>
            <button className="btn-primary flex-1" onClick={() => window.print()}>
              <FileText className="w-4 h-4" /> Print / Export Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
