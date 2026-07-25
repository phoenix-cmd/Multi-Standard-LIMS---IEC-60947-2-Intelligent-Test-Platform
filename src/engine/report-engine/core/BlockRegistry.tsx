import type React from 'react';
import type { BlockType, FormulaTraceability, EvidenceItem, DigitalManifestEntry } from '../types/dsl';
import type { ThemeConfig } from '../types/document';

export interface BlockComponentProps {
  props: Record<string, any>;
  theme: ThemeConfig;
}

export function TitleBlockComponent({ props, theme }: BlockComponentProps) {
  return (
    <div className="border-b pb-2 mb-3 break-after-avoid" style={{ borderColor: theme.primaryColor }}>
      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
        {props.title}
      </h3>
      {props.subtitle && <p className="text-xs text-gray-500 mt-0.5">{props.subtitle}</p>}
    </div>
  );
}

export function TableBlockComponent({ props, theme }: BlockComponentProps) {
  const { headers, rows, title, caption } = props;
  return (
    <div className="space-y-1 my-3 break-inside-avoid">
      {title && <p className="text-[11px] font-bold uppercase text-gray-700">{title}</p>}
      <table className="w-full text-xs border-collapse border" style={{ borderColor: theme.borderColor }}>
        {headers && (
          <thead>
            <tr style={{ backgroundColor: theme.tableHeaderBg, color: theme.tableHeaderColor }}>
              {headers.map((h: string, i: number) => (
                <th key={i} className="border p-2 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row: any[], rIdx: number) => (
            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              {row.map((cell: any, cIdx: number) => (
                <td key={cIdx} className="border p-2 font-medium">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {caption && <p className="text-[10px] text-gray-500 italic mt-0.5">{caption}</p>}
    </div>
  );
}

export function FormulaBlockComponent({ props }: BlockComponentProps) {
  const formula: FormulaTraceability = props.formula;
  return (
    <div className="p-3 bg-slate-900 text-slate-100 rounded-md text-xs font-mono space-y-2 my-3 border border-slate-800 break-inside-avoid">
      <div className="flex justify-between items-center border-b border-slate-800 pb-1 text-[11px]">
        <span className="text-cyan-400 font-bold">SOURCE CLAUSE: {formula.sourceClause}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${formula.verdict === 'PASS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'}`}>
          {formula.verdict}
        </span>
      </div>

      {/* Variables Map */}
      <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 bg-slate-950 p-2 rounded">
        <span className="font-bold text-slate-300">Variables:</span>
        {Object.entries(formula.variables).map(([k, v]) => (
          <span key={k} className="text-slate-300 font-bold">{k} = <span className="text-yellow-300">{v}</span></span>
        ))}
      </div>

      {/* Calculation Expression & Substitution */}
      <div className="space-y-1">
        <p className="text-slate-400 text-[10px]">FORMULA: <span className="text-slate-200">{formula.expression}</span></p>
        <p className="text-slate-400 text-[10px]">SUBSTITUTION: <span className="text-yellow-300 font-bold">{formula.substitution}</span> = <span className="text-emerald-400 font-bold">{formula.result}</span></p>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
        <span>TOLERANCE / CRITERIA: {formula.tolerance}</span>
        {formula.evidenceRefs.length > 0 && (
          <span>EVIDENCE: {formula.evidenceRefs.map(e => e.referenceCode).join(', ')}</span>
        )}
      </div>
    </div>
  );
}

export function EvidenceLinkBlockComponent({ props }: BlockComponentProps) {
  const items: EvidenceItem[] = props.items || [];
  return (
    <div className="my-3 p-2.5 bg-gray-50 border rounded text-xs space-y-1.5 break-inside-avoid">
      <span className="font-bold text-gray-700 uppercase tracking-wide text-[10px] flex items-center gap-1">
        🔗 Traceable Supporting Evidence Links:
      </span>
      <div className="flex flex-wrap gap-2">
        {items.map((ev) => (
          <span key={ev.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 rounded font-mono text-[10px] text-blue-900 shadow-sm">
            <span className="font-bold">{ev.type.toUpperCase()}:</span> {ev.referenceCode} ({ev.label})
          </span>
        ))}
      </div>
    </div>
  );
}

export function ManifestBlockComponent({ props }: BlockComponentProps) {
  const entries: DigitalManifestEntry[] = props.entries || [];
  return (
    <div className="my-4 space-y-2 break-inside-avoid">
      <h4 className="text-xs font-bold uppercase text-gray-700 tracking-wider">Digital Attachments & Evidence Manifest</h4>
      <table className="w-full text-xs border-collapse border">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="border p-1.5 text-left">Filename</th>
            <th className="border p-1.5 text-left">Type</th>
            <th className="border p-1.5 text-left font-mono">Timestamp</th>
            <th className="border p-1.5 text-left font-mono">Size</th>
            <th className="border p-1.5 text-left font-mono">SHA-256 Checksum</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((m, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="border p-1.5 font-medium">{m.filename}</td>
              <td className="border p-1.5 uppercase font-mono text-[10px]">{m.type}</td>
              <td className="border p-1.5 font-mono text-[10px]">{m.timestamp}</td>
              <td className="border p-1.5 font-mono text-[10px]">{(m.sizeBytes / 1024).toFixed(0)} KB</td>
              <td className="border p-1.5 font-mono text-[10px] text-gray-600 truncate max-w-xs">{m.sha256Checksum}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BLOCK_REGISTRY: Record<BlockType, React.ComponentType<BlockComponentProps>> = {
  title: TitleBlockComponent,
  table: TableBlockComponent,
  formula: FormulaBlockComponent,
  evidence: EvidenceLinkBlockComponent,
  manifest: ManifestBlockComponent,
  paragraph: ({ props }) => <p className="text-xs text-gray-700 my-2 leading-relaxed break-inside-avoid">{props.text}</p>,
  image: ({ props }) => (
    <div className="my-3 border p-2 bg-gray-50 rounded text-center space-y-1 break-inside-avoid">
      <div className="w-full h-24 bg-slate-900 rounded border border-slate-700 flex items-center justify-center text-slate-300 font-mono text-xs">
        [ IMAGE: {props.caption || props.alt || 'Evidence Artifact'} ]
      </div>
      {props.caption && <p className="text-[10px] text-gray-500 font-mono">{props.caption}</p>}
    </div>
  ),
  signature: ({ props }) => (
    <div className="my-4 border p-3 bg-white rounded flex justify-between items-center text-xs break-inside-avoid">
      <div>
        <p className="font-bold text-gray-900">{props.name}</p>
        <p className="text-gray-500 text-[10px]">{props.role}</p>
      </div>
      <div className="text-right font-mono text-[10px] text-gray-400">
        <p className="text-emerald-700 font-bold">{props.status}</p>
        <p>{props.timestamp}</p>
      </div>
    </div>
  ),
};

export function renderBlock(type: BlockType, props: Record<string, any>, theme: ThemeConfig) {
  const Comp = BLOCK_REGISTRY[type];
  if (!Comp) return null;
  return <Comp key={props.id || Math.random()} props={props} theme={theme} />;
}
