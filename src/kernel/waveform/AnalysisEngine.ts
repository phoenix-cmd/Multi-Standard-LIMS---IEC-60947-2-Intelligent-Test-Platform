import type { RawWaveformSample } from './Parser';
import { WaveformValidator, type WaveformValidationReport } from './Validator';
import { WaveformNormalizer } from './Normalizer';
import { MeasurementCalculator, type WaveformMetrics } from './MeasurementCalculator';

export interface WaveformAnalysisResult {
  validation: WaveformValidationReport;
  normalizedSamples: RawWaveformSample[];
  metrics: WaveformMetrics;
  verdict: 'PASS' | 'FAIL';
  evaluatedAt: string;
}

export class AnalysisEngine {
  static analyze(rawSamples: RawWaveformSample[], maxPeakCurrentLimitA: number = 20000): WaveformAnalysisResult {
    const validation = WaveformValidator.validate(rawSamples);
    if (!validation.valid) {
      return {
        validation,
        normalizedSamples: [],
        metrics: { peakCurrentA: 0, rmsCurrentA: 0, arcDurationMs: 0, arcEnergyJ: 0, clearingTimeMs: 0, powerFactor: 0.85 },
        verdict: 'FAIL',
        evaluatedAt: new Date().toISOString(),
      };
    }

    const normalizedSamples = WaveformNormalizer.normalize(rawSamples);
    const metrics = MeasurementCalculator.calculate(normalizedSamples);
    const verdict = metrics.peakCurrentA <= maxPeakCurrentLimitA ? 'PASS' : 'FAIL';

    return {
      validation,
      normalizedSamples,
      metrics,
      verdict,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
