import type { WaveformChannel, WaveformSnapshot } from '../../types';

/** Generates synthetic multi-channel oscillograph data for demonstrations */
export class StreamSimulator {
  /** Generate a 3-phase short-circuit interruption waveform snapshot */
  static generateShortCircuitSnapshot(Icu: number): WaveformSnapshot {
    const sampleRate = 100_000;
    const duration = 0.1; // 100ms
    const N = Math.floor(sampleRate * duration);
    const f = 50; // 50 Hz system
    const Ipeak = Icu * Math.sqrt(2) * 1.5; // kA peak with DC offset

    const time = Array.from({ length: N }, (_, i) => i / sampleRate);

    // Asymmetric fault current (Phase R) – exponential DC decay
    const iR = time.map((t) => {
      if (t < 0.005) return 0; // pre-fault
      const tFault = t - 0.005;
      const ac = Ipeak * Math.sin(2 * Math.PI * f * tFault - Math.PI / 3);
      const dc = Ipeak * 0.8 * Math.exp(-tFault / 0.02); // τ = 20ms
      return tFault < 0.06 ? (ac + dc) : 0; // cleared at 65ms
    });

    // Phase S (120° offset)
    const iS = time.map((t) => {
      if (t < 0.005) return 0;
      const tFault = t - 0.005;
      const ac = Ipeak * Math.sin(2 * Math.PI * f * tFault - Math.PI / 3 - (2 * Math.PI) / 3);
      const dc = Ipeak * 0.5 * Math.exp(-tFault / 0.02);
      return tFault < 0.06 ? (ac + dc) : 0;
    });

    // Arc voltage – rises during arcing phase
    const vArc = time.map((t) => {
      if (t < 0.005 || t >= 0.065) return 0;
      const tArc = t - 0.005;
      return tArc < 0.06 ? 200 + 150 * Math.random() * Math.sin(2 * Math.PI * f * tArc * 3) : 0;
    });

    // Contact position (0 = closed, 1 = open)
    const contact = time.map((t) => (t >= 0.006 ? 1 : 0));

    const channels: WaveformChannel[] = [
      { id: 'iR', label: 'I_R (Phase R)', unit: 'kA', color: '#f87171', data: iR.map(v => v / 1000) },
      { id: 'iS', label: 'I_S (Phase S)', unit: 'kA', color: '#fbbf24', data: iS.map(v => v / 1000) },
      { id: 'vArc', label: 'V_arc', unit: 'V', color: '#22d3ee', data: vArc },
      { id: 'contact', label: 'Contact Position', unit: '', color: '#a78bfa', data: contact },
    ];

    // Derived metrics
    const peakCurrent = Math.max(...iR) / 1000; // kA
    const arcDuration = 0.060; // s
    const clearingTime = 0.065; // s
    const arcEnergy = iR.reduce((sum, v) => sum + v * v / sampleRate, 0) / 1e6; // MA²s
    const powerFactor = 0.15;

    return { sampleRate, duration, channels, peakCurrent, arcDuration, arcEnergy, clearingTime, powerFactor };
  }

  /** Temperature-rise channel – gradual heating curve for In loading test */
  static generateTempRiseSnapshot(In: number): WaveformSnapshot {
    const sampleRate = 1; // 1 sample/sec
    const duration = 3600; // 1 hour
    const N = duration;
    const tau = 900; // thermal time constant 15 min
    const dT_ss = 55; // steady-state ΔT at In

    const dT = Array.from({ length: N }, (_, t) =>
      dT_ss * (1 - Math.exp(-t / tau)) + 1.5 * Math.sin(t / 60) * Math.random()
    );

    return {
      sampleRate,
      duration,
      channels: [{ id: 'dT', label: 'ΔT Terminal (K)', unit: 'K', color: '#f97316', data: dT }],
      peakCurrent: In,
      arcDuration: 0,
      arcEnergy: 0,
    };
  }
}
