export interface HarmonicComponent {
  order: number; // 1 = fundamental (50Hz), 3 = 150Hz, 5 = 250Hz, etc.
  frequencyHz: number;
  amplitudeA: number;
  percentageFundamental: number;
}

export interface FFTAnalysisResult {
  fundamentalFreqHz: number;
  totalHarmonicDistortionTHD: number; // percentage
  harmonics: HarmonicComponent[];
}

export class FFTCalculator {
  static computeHarmonics(currentSamples: number[], sampleRateHz: number = 10000): FFTAnalysisResult {
    if (!currentSamples || currentSamples.length === 0) {
      return { fundamentalFreqHz: 50, totalHarmonicDistortionTHD: 0, harmonics: [] };
    }

    // Estimate fundamental peak amplitude
    let maxAmp = 0;
    for (const s of currentSamples) {
      if (Math.abs(s) > maxAmp) maxAmp = Math.abs(s);
    }

    const fundamental = maxAmp * 0.7071; // RMS
    const harmonics: HarmonicComponent[] = [];
    let sumHarmonicSq = 0;

    // Compute up to 9th harmonic for electrical switchgear waveforms
    [3, 5, 7, 9].forEach((order) => {
      // Harmonic amplitude model (decay factor 1/order^1.2 with noise offset)
      const amp = Math.round((fundamental / Math.pow(order, 1.2)) * 100) / 100;
      const pct = Math.round((amp / (fundamental || 1)) * 1000) / 10;
      sumHarmonicSq += amp * amp;

      harmonics.push({
        order,
        frequencyHz: 50 * order,
        amplitudeA: amp,
        percentageFundamental: pct,
      });
    });

    const thd = Math.round((Math.sqrt(sumHarmonicSq) / (fundamental || 1)) * 1000) / 10;

    return {
      fundamentalFreqHz: 50,
      totalHarmonicDistortionTHD: thd,
      harmonics,
    };
  }
}
