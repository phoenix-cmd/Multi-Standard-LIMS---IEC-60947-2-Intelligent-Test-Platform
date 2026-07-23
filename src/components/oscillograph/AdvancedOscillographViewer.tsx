import { useRef, useEffect, useState, useCallback } from 'react';
import type { WaveformSnapshot, WaveformChannel } from '../../types';
import { StreamSimulator } from '../../engine/drivers/StreamSimulator';
import {
  ZoomIn, ZoomOut, RefreshCw, Crosshair, Activity, BarChart2
} from 'lucide-react';

interface OscillographProps {
  snapshot?: WaveformSnapshot;
  title?: string;
}

export function AdvancedOscillographViewer({ snapshot, title = 'Oscillograph — Short-Circuit Event' }: OscillographProps) {
  const data = snapshot ?? StreamSimulator.generateShortCircuitSnapshot(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(0);          // sample offset
  const [cursor1, setCursor1] = useState<number | null>(null);
  const [cursor2, setCursor2] = useState<number | null>(null);
  const [hoveredX, setHoveredX] = useState<number | null>(null);
  const [activeChannels, setActiveChannels] = useState<Set<string>>(
    new Set(data.channels.map((c) => c.id))
  );
  const dragging = useRef<'c1' | 'c2' | null>(null);

  const totalSamples = data.channels[0]?.data.length ?? 1;
  const visibleSamples = Math.floor(totalSamples / zoom);

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

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += W / 10) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let ch = 0; ch < visibleChannels.length; ch++) {
      const y = ch * channelH;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      // Center line per channel
      ctx.strokeStyle = '#1e3a5f40';
      ctx.beginPath(); ctx.moveTo(0, y + channelH / 2); ctx.lineTo(W, y + channelH / 2); ctx.stroke();
      ctx.strokeStyle = '#1e293b';
    }

    // Draw each channel
    visibleChannels.forEach((ch, chIdx) => {
      const startSample = Math.floor(offset);
      const endSample = Math.min(startSample + visibleSamples, ch.data.length);
      const slice = ch.data.slice(startSample, endSample);
      const yBase = chIdx * channelH;
      const yCenter = yBase + channelH / 2;

      // Normalize
      const max = Math.max(...slice.map(Math.abs), 1e-9);
      const scale = (channelH / 2) * 0.85 / max;

      // Channel label
      ctx.fillStyle = ch.color;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(ch.label, 8, yBase + 14);

      // Waveform
      ctx.strokeStyle = ch.color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = ch.color;
      ctx.shadowBlur = 3;
      ctx.beginPath();
      slice.forEach((v, i) => {
        const x = (i / (slice.length - 1)) * W;
        const y = yCenter - v * scale;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Value at hover
      if (hoveredX !== null) {
        const idx = Math.floor((hoveredX / W) * slice.length);
        if (idx >= 0 && idx < slice.length) {
          const val = slice[idx];
          ctx.fillStyle = ch.color;
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.fillText(`${val.toFixed(3)} ${ch.unit}`, W - 100, yBase + 14);
        }
      }
    });

    // Cursors
    const drawCursor = (xFrac: number | null, label: string, color: string) => {
      if (xFrac === null) return;
      const x = xFrac * W;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText(label, x + 3, 12);
    };
    drawCursor(cursor1, 'T1', '#22d3ee');
    drawCursor(cursor2, 'T2', '#a78bfa');

    // ΔT measurement
    if (cursor1 !== null && cursor2 !== null) {
      const dtSamples = Math.abs(cursor2 - cursor1) * visibleSamples;
      const dt = dtSamples / data.sampleRate;
      const midX = ((cursor1 + cursor2) / 2) * W;
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(`Δt = ${(dt * 1000).toFixed(2)} ms`, midX - 40, H - 8);
    }
  }, [data, zoom, offset, cursor1, cursor2, hoveredX, activeChannels, visibleSamples]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
  }, [draw]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; draw(); }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    setHoveredX((e.clientX - rect.left));
    if (dragging.current === 'c1') setCursor1(x);
    if (dragging.current === 'c2') setCursor2(x);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    if (e.button === 0) { dragging.current = 'c1'; setCursor1(x); }
    if (e.button === 2) { dragging.current = 'c2'; setCursor2(x); }
  };

  const handleMouseUp = () => { dragging.current = null; };

  const toggleChannel = (id: string) => {
    setActiveChannels((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="card overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-700 flex items-center gap-3 bg-surface-900">
        <Activity className="w-4 h-4 text-brand-400" />
        <span className="text-sm font-semibold text-surface-100 flex-1">{title}</span>
        <div className="flex items-center gap-2">
          <button className="btn-secondary py-1 px-2 text-xs" onClick={() => setZoom((z) => Math.min(z * 2, 32))}>
            <ZoomIn className="w-3.5 h-3.5" /> Zoom In
          </button>
          <button className="btn-secondary py-1 px-2 text-xs" onClick={() => setZoom((z) => Math.max(z / 2, 1))}>
            <ZoomOut className="w-3.5 h-3.5" /> Zoom Out
          </button>
          <button className="btn-secondary py-1 px-2 text-xs" onClick={() => { setZoom(1); setOffset(0); setCursor1(null); setCursor2(null); }}>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Channel toggles */}
      <div className="flex flex-wrap gap-2 px-4 py-2 bg-surface-950 border-b border-surface-800">
        {data.channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => toggleChannel(ch.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${activeChannels.has(ch.id) ? 'border-transparent text-surface-950' : 'border-surface-700 text-surface-500 bg-transparent'}`}
            style={activeChannels.has(ch.id) ? { backgroundColor: ch.color, borderColor: ch.color } : {}}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
            {ch.label}
          </button>
        ))}
        <span className="text-xs text-surface-500 ml-auto self-center">
          <Crosshair className="w-3 h-3 inline mr-1" />Left-click = T1 cursor · Right-click = T2 cursor
        </span>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="flex-1 w-full min-h-64 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setHoveredX(null)}
        onContextMenu={(e) => e.preventDefault()}
        style={{ height: '320px' }}
      />

      {/* Metrics bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px border-t border-surface-800 bg-surface-800">
        {[
          { label: 'Peak Current Ip', value: `${data.peakCurrent?.toFixed(3) ?? '—'} kA` },
          { label: 'Clearing Time tc', value: `${data.clearingTime ? (data.clearingTime * 1000).toFixed(1) : '—'} ms` },
          { label: 'Arc Duration tarc', value: `${data.arcDuration ? (data.arcDuration * 1000).toFixed(1) : '—'} ms` },
          { label: 'Arc Energy ∫i²dt', value: `${data.arcEnergy?.toFixed(2) ?? '—'} MA²s` },
          { label: 'Power Factor cos φ', value: data.powerFactor?.toFixed(2) ?? '—' },
        ].map((m) => (
          <div key={m.label} className="bg-surface-900 px-3 py-2.5">
            <p className="text-[10px] text-surface-500 uppercase tracking-wide">{m.label}</p>
            <p className="text-sm font-bold text-brand-400 font-mono mt-0.5">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
