import type { RawWaveformSample } from './Parser';

export class WaveformNormalizer {
  static normalize(samples: RawWaveformSample[]): RawWaveformSample[] {
    if (samples.length === 0) return [];
    const t0 = samples[0].timeMs;

    return samples.map((s) => ({
      ...s,
      timeMs: Math.round((s.timeMs - t0) * 100) / 100,
    }));
  }
}
