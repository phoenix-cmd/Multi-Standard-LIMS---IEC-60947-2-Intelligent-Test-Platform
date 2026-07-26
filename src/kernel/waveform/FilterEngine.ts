export class FilterEngine {
  static lowPassFilter(samples: number[], alpha: number = 0.25): number[] {
    if (samples.length === 0) return [];
    const filtered: number[] = [samples[0]];
    for (let i = 1; i < samples.length; i++) {
      filtered[i] = filtered[i - 1] + alpha * (samples[i] - filtered[i - 1]);
    }
    return filtered;
  }

  static movingAverage(samples: number[], windowSize: number = 5): number[] {
    if (samples.length === 0) return [];
    const result: number[] = [];
    const half = Math.floor(windowSize / 2);

    for (let i = 0; i < samples.length; i++) {
      const start = Math.max(0, i - half);
      const end = Math.min(samples.length, i + half + 1);
      const sum = samples.slice(start, end).reduce((a, b) => a + b, 0);
      result.push(sum / (end - start));
    }
    return result;
  }
}
