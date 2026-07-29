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
  FlaskConical, Zap, FileText, Bot, ShieldAlert, Wrench
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AdvancedOscillographViewer } from '../oscillograph/AdvancedOscillographViewer';
import { EquipmentGuard } from '../../platform/equipment/domain/EquipmentGuard';

import { IEC60947_2_2003_RULE_CATALOG } from '../../standards/plugins/IEC60947_2_Plugin';
import { StandardRuleEngine } from '../../standards/api/StandardRuleEngine';

const SEQUENCES = [
  { id: 'seq-I', label: 'Sequence I', sub: 'General Performance (IS/IEC 60947-2:2003)', steps: 4 },
  { id: 'seq-II', label: 'Sequence II', sub: 'Ics — Service Short-Circuit', steps: 3 },
  { id: 'seq-III', label: 'Sequence III', sub: 'Icu — Ultimate Short-Circuit', steps: 3 },
  { id: 'seq-IV', label: 'Sequence IV', sub: 'Icw — Short-Time Withstand', steps: 2 },
];

const FORMULAS = [
  { id: 'I_120_calc', expression: '1.20 * In', unit: 'A' },
  { id: 'I_110_calc', expression: '1.10 * In', unit: 'A' },
  { id: 'I_145_calc', expression: '1.45 * In', unit: 'A' },
  { id: 'Utest', expression: '2 * Ui + 1000', unit: 'V' },
];

function VerdictBadge({ v }: { v: Verdict }) {
  if (v === 'PASS') return <span className="badge-pass"><CheckCircle2 className="w-3 h-3" /> PASS</span>;
  if (v === 'FAIL') return <span className="badge-fail"><XCircle className="w-3 h-3" /> FAIL</span>;
  if (v === 'NA') return <span className="badge-na">N/A</span>;
  return <span className="badge-warn"><AlertCircle className="w-3 h-3" /> {v}</span>;
}

export function GuidedTestWizard() {
  const { samples, equipment, addTestRun, currentUser } = useLIMS();
  const [selectedSampleId, setSelectedSampleId] = useState<string>(samples[1]?.id ?? '');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(equipment[0]?.id ?? '');
  const [selectedSeq, setSelectedSeq] = useState('seq-I');
  const [step, setStep] = useState(0); // 0=select, 1..N=form steps, N+1=results
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<ClauseResult[]>([]);
  const [verdict, setVerdict] = useState<Verdict>('PENDING');
  const [showWaveform, setShowWaveform] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<string[] | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [equipmentGuardError, setEquipmentGuardError] = useState<string | null>(null);

  const formulaEngine = new FormulaEngine();
  const sample = samples.find((s) => s.id === selectedSampleId);
  const spec = sample?.specification;
  const targetEq = equipment.find((e) => e.id === selectedEquipmentId);

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

  const handleStartWizard = () => {
    if (targetEq) {
      const guardResult = EquipmentGuard.validateForTestRun(targetEq);
      if (!guardResult.valid) {
        setEquipmentGuardError(guardResult.reason || 'Equipment calibration guard check failed.');
        return;
      }
    }
    setEquipmentGuardError(null);
    setStep(1);
  };

  const runEvaluation = () => {
    if (!spec) return;
    const numInputs: Record<string, number | string | boolean> = {};
    for (const [k, v] of Object.entries(inputs)) {
      if (v === 'Yes' || v === 'Tripped (FAIL)') {
        numInputs[k] = true;
      } else if (v === 'No' || v === 'No Trip (PASS)') {
        numInputs[k] = false;
      } else {
        const n = parseFloat(v);
        numInputs[k] = isNaN(n) ? v : n;
      }
    }
    numInputs['In'] = spec.ratedCurrent;
    numInputs['Ui'] = spec.insulationVoltage;
    numInputs['Ue'] = spec.ratedVoltage;

    const stdEngine = new StandardRuleEngine();
    const clauseResults = Object.values(IEC60947_2_2003_RULE_CATALOG).map((cfg) =>
      stdEngine.evaluateDeclarativeRule(cfg, numInputs)
    );
    setResults(clauseResults);
    const ov: Verdict = clauseResults.some((r) => r.verdict === 'FAIL') ? 'FAIL' : 'PASS';
    setVerdict(ov);

    const checker = new ConsistencyChecker();
    setWarnings(checker.check(numInputs as Record<string, number>, spec));

    const sg = new SummaryGenerator();
    setSummary(sg.generate(clauseResults, spec));

    const failed = clauseResults.filter((r) => r.verdict === 'FAIL');
    if (failed.length > 0 && spec) {
      const diagEngine = new DiagnosisEngine();
      const rec = new RecommendationEngine();
      const diag = diagEngine.diagnose(failed, spec);
      setAiDiagnosis(rec.recommend(diag));
    } else {
      setAiDiagnosis(null);
    }

    const run: TestRun = {
      id: uuidv4(), sampleId: selectedSampleId, sequenceId: selectedSeq,
      startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
      executedBy: currentUser.name, verdict: ov, inputs: numInputs as Record<string, number>,
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
          <span className="text-sm font-semibold text-surface-100">Guided Test Wizard — IS/IEC 60947-2:2003</span>
          <span className="ml-auto text-xs text-surface-500">Step {step + 1} of {STEPS}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-brand-500' : 'bg-surface-700'}`} />
          ))}
        </div>
      </div>

      {/* Equipment Guard Error Alert */}
      {equipmentGuardError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300 animate-fade-in">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <div>
            <p className="font-bold text-rose-200">Equipment Calibration Guard Rejected Test Launch</p>
            <p className="text-rose-300 mt-0.5">{equipmentGuardError}</p>
          </div>
        </div>
      )}

      {/* Step 0: Setup */}
      {step === 0 && (
        <div className="card p-6 space-y-4">
          <p className="text-sm font-bold text-surface-100 mb-2">Select Test Sample & Test Station Equipment</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Target Sample</label>
              <select
                value={selectedSampleId}
                onChange={(e) => setSelectedSampleId(e.target.value)}
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-100 focus:outline-none focus:border-brand-500"
              >
                {samples.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.reportNo} ({s.specification.model}) — {s.lifecycleState}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1.5">Assigned Test Equipment</label>
              <select
                value={selectedEquipmentId}
                onChange={(e) => {
                  setSelectedEquipmentId(e.target.value);
                  setEquipmentGuardError(null);
                }}
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-100 focus:outline-none focus:border-brand-500"
              >
                {equipment.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.assetTag} ({e.name}) — {e.status} (Cal Due: {e.nextCalibrationDue})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleStartWizard}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2 transition-all"
            >
              Start Sequence Evaluation <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Remaining Form Steps & Results */}
      {step > 0 && step < STEPS - 1 && currentForm && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-800 pb-3">
            <h3 className="text-sm font-bold text-surface-100">{currentForm.title}</h3>
            <span className="text-xs text-surface-400">Step: {currentForm.stepId}</span>
          </div>

          <div className="space-y-4">
            {currentForm.fields.map((f) => (
              <div key={f.id} className="space-y-1">
                <label className="block text-xs font-medium text-surface-300">
                  {f.label} {f.unit && <span className="text-surface-500">({f.unit})</span>}
                </label>
                {f.type === 'number' && (
                  <input
                    type="number"
                    value={inputs[f.id] ?? ''}
                    onChange={(e) => handleInput(f.id, e.target.value)}
                    placeholder={f.formulaRef ? `Calculated formula: ${evaluateForField(f.id, currentForm)}` : ''}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-100 focus:outline-none focus:border-brand-500"
                  />
                )}
                {f.type === 'select' && (
                  <select
                    value={inputs[f.id] ?? ''}
                    onChange={(e) => handleInput(f.id, e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Select value...</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 bg-surface-800 text-surface-300 rounded-xl text-xs font-semibold hover:bg-surface-700"
            >
              Back
            </button>
            {isLastFormStep ? (
              <button
                onClick={runEvaluation}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Evaluate Sequence Results
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold"
              >
                Next Step
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results View */}
      {step === STEPS - 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-surface-400 uppercase tracking-wide font-bold">Overall Verdict (IS/IEC 60947-2:2003)</p>
              <h2 className="text-xl font-bold text-surface-100 mt-1">{verdict}</h2>
            </div>
            <VerdictBadge v={verdict} />
          </div>

          <div className="card p-6 space-y-3">
            <p className="text-xs font-bold text-surface-400 uppercase">Clause Results & Evidence</p>
            {results.map((r) => (
              <div key={r.ruleId} className="p-3 bg-surface-900 rounded-xl border border-surface-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-surface-100">Clause {r.clauseId} — {r.clauseTitle}</span>
                  <VerdictBadge v={r.verdict} />
                </div>
                {r.explanation && <p className="text-surface-300 text-xs font-medium">{r.explanation}</p>}
                {r.evidence && (
                  <div className="text-[11px] text-surface-400 flex flex-wrap gap-x-4 gap-y-1 bg-surface-950/50 p-2 rounded-lg border border-surface-800/50">
                    <span><strong>Measured:</strong> {String(r.evidence.measuredValue)} {r.evidence.unit}</span>
                    <span><strong>Limit:</strong> {String(r.evidence.expectedLimit)} {r.evidence.unit}</span>
                    <span><strong>Standard Edition:</strong> {r.evidence.standardEdition}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {showWaveform && (
            <div className="card p-6">
              <AdvancedOscillographViewer />
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setShowWaveform((prev) => !prev)}
              className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-xl text-xs font-semibold"
            >
              {showWaveform ? 'Hide Waveform' : 'Show Telemetry Waveform'}
            </button>
            <button
              onClick={() => setStep(0)}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold"
            >
              Complete & Reset Wizard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
