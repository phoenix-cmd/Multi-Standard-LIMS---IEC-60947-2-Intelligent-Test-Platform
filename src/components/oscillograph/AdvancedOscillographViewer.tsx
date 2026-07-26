import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { WaveformSnapshot, WaveformChannel } from '../../types';
import { StreamSimulator } from '../../engine/drivers/StreamSimulator';
import {
  ZoomIn, ZoomOut, RefreshCw, Crosshair, Activity, BarChart2,
  Upload, FileText, AlertCircle, CheckCircle2, Sliders, Zap
} from 'lucide-react';
import { WaveformParser } from '../../kernel/waveform/Parser';
import { AnalysisEngine, type WaveformAnalysisResult } from '../../kernel/waveform/AnalysisEngine';
import { FilterEngine } from '../../kernel/waveform/FilterEngine';

interface OscillographProps {
  snapshot?: WaveformSnapshot;
  title?: string;
}

export function AdvancedOscillographViewer({ snapshot, title = 'Oscillograph — Short-Circuit Event' }: OscillographProps) {
  const [data, setData] = useState<WaveformSnapshot>(() => snapshot ?? StreamSimulator.generateShortCircuitSnapshot(50));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);
  const [cursor1, setCursor1] = useState<number | null>(null);
  const [cursor2, setCursor2] = useState<number | null>(null);
  const [hoveredX, setHoveredX] = useState<number | null>(null);
  const [applyFilter, setApplyFilter] = useState(false);
  const [activeChannels, setActiveChannels] = useState<Set<string>>(
    new Set(data.channels.map((c) => c.id))
  );

  const [analysisResult, setAnalysisResult] = useState<WaveformAnalysisResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const totalSamples = data.channels[0]?.data.length ?? 1;
  const visibleSamples = Math.floor(totalSamples / zoom);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let rawSamples;
        if (file.name.endsWith('.json')) {
          rawSamples = WaveformParser.parseJSON(text);
        } else {
          rawSamples = WaveformParser.parseCSV(text);
        }

        const analysis = AnalysisEngine.analyze(rawSamples);
        setAnalysisResult(analysis);

        if (!analysis.validation.valid) {
          setFileError(analysis.validation.errors.join(' '));
          return;
        }

        setFileError(null);

        const newSnapshot: WaveformSnapshot = {
          eventId: `evt-${Date.now().toString().slice(-4)}`,
          sampleRate: 10000,
          sampleRateHz: 10000,
          duration: analysis.validation.timeDurationMs / 1000,
          durationMs: analysis.validation.timeDurationMs,
          channels: [
            {
              id: 'current',
              label: 'Phase Current I_R',
              unit: 'A',
              color: '#38bdf8',
              data: analysis.normalizedSamples.map((s) => s.currentA),
            },
            {
              id: 'voltage',
              label: 'Phase Voltage U_R',
              unit: 'V',
              color: '#a855f7',
              data: analysis.normalizedSamples.map((s) => s.voltageV),
            },
          ],
        };

        setData(newSnapshot);
        setActiveChannels(new Set(newSnapshot.channels.map((c) => c.id)));
      } catch (err: any) {
        setFileError(err.message || 'Error parsing telemetry file.');
      }
    };
    reader.readAsText(file);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const visibleChannels = data.channels.filter((ch) => activeChannels.has(ch.id));
    const channelH = H / Math.max(visibleChannels.length, 1);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0a1020';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += W / 10) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let ch = 0; ch < visibleChannels.length; ch++) {
      const y = ch * channelH;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.strokeStyle = '#1e3a5f40';
      ctx.beginPath(); ctx.moveTo(0, y + channelH / 2); ctx.lineTo(W, y + channelH / 2); ctx.stroke();
      ctx.strokeStyle = '#1e293b';
    }

    visibleChannels.forEach((ch, chIdx) => {
      const startSample = Math.floor(offset);
      const endSample = Math.min(startSample + visibleSamples, ch.data.length);
      let rawSlice = ch.data.slice(startSample, endSample);

      if (applyFilter) {
        rawSlice = FilterEngine.lowPassFilter(rawSlice, 0.3);
      }

      const yBase = chIdx * channelH;
      const yCenter = yBase + channelH / 2;

      const max = Math.max(...rawSlice.map(Math.abs), 1e-9);
      const scale = (channelH / 2) * 0.85 / max;

      ctx.fillStyle = ch.color;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(ch.label + (applyFilter ? ' (Filtered)' : ''), 8, yBase + 14);

      ctx.strokeStyle = ch.color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = ch.color;
      ctx.shadowBlur = 3;
      ctx.beginPath();
      rawSlice.forEach((v, i) => {
        const x = (i / (rawSlice.length - 1)) * W;
        const y = yCenter - v * scale;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (hoveredX !== null) {
        const idx = Math.floor((hoveredX / W) * rawSlice.length);
        if (idx >= 0 && idx < rawSlice.length) {
          const val = rawSlice[idx];
          ctx.fillStyle = ch.color;
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.fillText(`${val.toFixed(3)} ${ch.unit}`, W - 100, yBase + 14);
        }
      }
    });

    if (cursor1 !== null) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cursor1, 0); ctx.lineTo(cursor1, H); ctx.stroke();
      ctx.setLineDash([]);
    }

    if (cursor2 !== null) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cursor2, 0); ctx.lineTo(cursor2, H); ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [data, activeChannels, offset, visibleSamples, hoveredX, cursor1, cursor2, applyFilter]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-400" />
          <h3 className="text-xs font-bold text-surface-100">{title}</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setApplyFilter((prev) => !prev)}
            className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              applyFilter
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-surface-800 text-surface-400 border-surface-700 hover:text-surface-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Filter Noise
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/30 text-brand-300 rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Import CSV/JSON Telemetry
          </button>
          <button
            onClick={() => {
              const reset = snapshot ?? StreamSimulator.generateShortCircuitSnapshot(50);
              setData(reset);
              setAnalysisResult(null);
              setFileError(null);
            }}
            className="p-1 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Validation Error Alert */}
      {fileError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 font-mono">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{fileError}</span>
        </div>
      )}

      {/* Analysis Metrics Badge Bar */}
      {analysisResult?.metrics && (
        <div className="grid grid-cols-5 gap-2 bg-surface-900 border border-surface-800 p-3 rounded-xl text-xs">
          <div>
            <span className="text-[10px] text-surface-500 uppercase tracking-wide block">Peak Current (I_peak)</span>
            <span className="font-mono font-bold text-brand-400">{analysisResult.metrics.peakCurrentA} A</span>
          </div>
          <div>
            <span className="text-[10px] text-surface-500 uppercase tracking-wide block">Arc Duration (t_arc)</span>
            <span className="font-mono font-bold text-amber-400">{analysisResult.metrics.arcDurationMs} ms</span>
          </div>
          <div>
            <span className="text-[10px] text-surface-500 uppercase tracking-wide block">Arc Energy (E_arc)</span>
            <span className="font-mono font-bold text-purple-400">{analysisResult.metrics.arcEnergyJ} J</span>
          </div>
          <div>
            <span className="text-[10px] text-surface-500 uppercase tracking-wide block">FFT THD %</span>
            <span className="font-mono font-bold text-cyan-400">{analysisResult.fft.totalHarmonicDistortionTHD}%</span>
          </div>
          <div>
            <span className="text-[10px] text-surface-500 uppercase tracking-wide block">Compliance Verdict</span>
            <span className={`font-mono font-bold ${analysisResult.verdict === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {analysisResult.verdict}
            </span>
          </div>
        </div>
      )}

      {/* Canvas Display */}
      <div className="relative bg-surface-950 rounded-xl border border-surface-800 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={320}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoveredX(e.clientX - rect.left);
          }}
          onMouseLeave={() => setHoveredX(null)}
          className="w-full h-80 block cursor-crosshair"
        />
      </div>
    </div>
  );
}
