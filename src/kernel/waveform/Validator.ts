import type { RawWaveformSample } from './Parser';

export interface WaveformValidationReport {
  valid: boolean;
  sampleCount: number;
  timeDurationMs: number;
  errors: string[];
  warnings: string[];
}

export class WaveformValidator {
  static validate(samples: RawWaveformSample[]): WaveformValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!samples || samples.length === 0) {
      return { valid: false, sampleCount: 0, timeDurationMs: 0, errors: ['Waveform dataset is completely empty.'], warnings: [] };
    }

    if (samples.length < 10) {
      errors.push('Telemetry sample count is too low for accurate IEC calculations (minimum 10 points required).');
    }

    let isMonotonic = true;
    for (let i = 1; i < samples.length; i++) {
      if (samples[i].timeMs < samples[i - 1].timeMs) {
        isMonotonic = false;
        break;
      }
    }
    if (!isMonotonic) {
      errors.push('Time sequence is non-monotonic or out of chronological order.');
    }

    const duration = samples[samples.length - 1].timeMs - samples[0].timeMs;
    if (duration <= 0) {
      errors.push('Total waveform duration must be greater than 0 ms.');
    }

    return {
      valid: errors.length === 0,
      sampleCount: samples.length,
      timeDurationMs: Math.max(0, duration),
      errors,
      warnings,
    };
  }
}
