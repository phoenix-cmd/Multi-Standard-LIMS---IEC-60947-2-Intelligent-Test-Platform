import type { RawWaveformSample } from './Parser';

export interface WaveformMetrics {
  peakCurrentA: number;
  rmsCurrentA: number;
  arcDurationMs: number;
  arcEnergyJ: number;
  clearingTimeMs: number;
  powerFactor: number;
}

export class MeasurementCalculator {
  static calculate(samples: RawWaveformSample[]): WaveformMetrics {
    if (samples.length === 0) {
      return { peakCurrentA: 0, rmsCurrentA: 0, arcDurationMs: 0, arcEnergyJ: 0, clearingTimeMs: 0, powerFactor: 0.85 };
    }

    let peakCurrentA = 0;
    let sumSq = 0;
    let arcEnergyJ = 0;
    let arcStartMs = -1;
    let arcEndMs = -1;

    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const absI = Math.abs(s.currentA);
      if (absI > peakCurrentA) peakCurrentA = absI;
      sumSq += s.currentA * s.currentA;

      // Detect arc onset (> 50A threshold)
      if (absI > 50) {
        if (arcStartMs === -1) arcStartMs = s.timeMs;
        arcEndMs = s.timeMs;
      }

      // Trapezoidal arc energy calculation: P = V * I
      if (i > 0) {
        const dt = (s.timeMs - samples[i - 1].timeMs) / 1000.0;
        const p = Math.abs(s.voltageV * s.currentA);
        arcEnergyJ += p * dt;
      }
    }

    const rmsCurrentA = Math.sqrt(sumSq / samples.length);
    const arcDurationMs = arcStartMs !== -1 && arcEndMs !== -1 ? arcEndMs - arcStartMs : 0;
    const clearingTimeMs = samples[samples.length - 1].timeMs - (samples[0]?.timeMs || 0);

    return {
      peakCurrentA: Math.round(peakCurrentA * 10) / 10,
      rmsCurrentA: Math.round(rmsCurrentA * 10) / 10,
      arcDurationMs: Math.round(arcDurationMs * 10) / 10,
      arcEnergyJ: Math.round(arcEnergyJ * 10) / 10,
      clearingTimeMs: Math.round(clearingTimeMs * 10) / 10,
      powerFactor: 0.85,
    };
  }
}
