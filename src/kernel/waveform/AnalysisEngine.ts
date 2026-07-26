import type { RawWaveformSample } from './Parser';
import { WaveformValidator, type WaveformValidationReport } from './Validator';
import { WaveformNormalizer } from './Normalizer';
import { MeasurementCalculator, type WaveformMetrics } from './MeasurementCalculator';
import { FFTCalculator, type FFTAnalysisResult } from './FFTCalculator';

export interface WaveformAnalysisResult {
  validation: WaveformValidationReport;
  normalizedSamples: RawWaveformSample[];
  metrics: WaveformMetrics;
  fft: FFTAnalysisResult;
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
        fft: { fundamentalFreqHz: 50, totalHarmonicDistortionTHD: 0, harmonics: [] },
        verdict: 'FAIL',
        evaluatedAt: new Date().toISOString(),
      };
    }

    const normalizedSamples = WaveformNormalizer.normalize(rawSamples);
    const metrics = MeasurementCalculator.calculate(normalizedSamples);
    const currentValues = normalizedSamples.map((s) => s.currentA);
    const fft = FFTCalculator.computeHarmonics(currentValues);
    const verdict = metrics.peakCurrentA <= maxPeakCurrentLimitA ? 'PASS' : 'FAIL';

    return {
      validation,
      normalizedSamples,
      metrics,
      fft,
      verdict,
      evaluatedAt: new Date().toISOString(),
    };
  }
}
