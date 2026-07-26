import type { WaveformAnalysisResult } from './AnalysisEngine';

export class WaveformExporter {
  static exportJSON(result: WaveformAnalysisResult): string {
    return JSON.stringify(result, null, 2);
  }

  static exportCSV(result: WaveformAnalysisResult): string {
    const lines = ['TimeMs,CurrentA,VoltageV'];
    result.normalizedSamples.forEach((s) => {
      lines.push(`${s.timeMs},${s.currentA},${s.voltageV}`);
    });
    return lines.join('\n');
  }
}
