export interface MetricRecord {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

export class TelemetryEngine {
  private _metrics: MetricRecord[] = [];

  recordMetric(name: string, value: number, unit: string = 'ms', tags?: Record<string, string>) {
    this._metrics.push({
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags,
    });
    if (this._metrics.length > 500) {
      this._metrics.shift();
    }
  }

  getMetrics(name?: string): MetricRecord[] {
    if (!name) return [...this._metrics];
    return this._metrics.filter((m) => m.name === name);
  }

  getAverageMetric(name: string): number {
    const records = this.getMetrics(name);
    if (records.length === 0) return 0;
    const sum = records.reduce((a, b) => a + b.value, 0);
    return Math.round((sum / records.length) * 100) / 100;
  }
}

export const globalTelemetryEngine = new TelemetryEngine();
