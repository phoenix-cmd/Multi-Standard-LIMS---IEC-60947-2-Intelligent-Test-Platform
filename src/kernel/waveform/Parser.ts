export interface RawWaveformSample {
  timeMs: number;
  currentA: number;
  voltageV: number;
  pressureBar?: number;
}

export class WaveformParser {
  static parseCSV(csvContent: string): RawWaveformSample[] {
    const lines = csvContent.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    if (lines.length < 2) throw new Error('CSV file contains insufficient telemetry data lines.');

    const samples: RawWaveformSample[] = [];
    const header = lines[0].toLowerCase();
    const startIndex = header.includes('time') || header.includes('current') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const timeMs = parseFloat(parts[0]);
        const currentA = parseFloat(parts[1]);
        const voltageV = parts[2] ? parseFloat(parts[2]) : 415;
        if (!isNaN(timeMs) && !isNaN(currentA)) {
          samples.push({ timeMs, currentA, voltageV });
        }
      }
    }

    return samples;
  }

  static parseJSON(jsonContent: string): RawWaveformSample[] {
    const data = JSON.parse(jsonContent);
    const list = Array.isArray(data) ? data : data.samples || data.data;
    if (!Array.isArray(list)) throw new Error('JSON telemetry structure must be an array of samples.');

    return list.map((item: any) => ({
      timeMs: Number(item.timeMs ?? item.time ?? item.t ?? 0),
      currentA: Number(item.currentA ?? item.current ?? item.i ?? 0),
      voltageV: Number(item.voltageV ?? item.voltage ?? item.u ?? 415),
    }));
  }
}
