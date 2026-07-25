import React from 'react';
import type { WorkflowDefinition, WorkflowNodeData } from '../../workflow-designer/WorkflowTypes';
import { Play, CheckCircle2, AlertTriangle, Cpu, Layers } from 'lucide-react';

interface WorkflowCanvasProps {
  workflow: WorkflowDefinition;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

const NODE_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  start:           { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400' },
  end:             { bg: 'bg-red-500/10',     border: 'border-red-500/40',     text: 'text-red-400' },
  test:            { bg: 'bg-brand-500/10',   border: 'border-brand-500/40',   text: 'text-brand-400' },
  decision:        { bg: 'bg-amber-500/10',   border: 'border-amber-500/40',   text: 'text-amber-400' },
  manual_action:   { bg: 'bg-purple-500/10',  border: 'border-purple-500/40',  text: 'text-purple-400' },
  report:          { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/40',    text: 'text-cyan-400' },
};

export function WorkflowCanvas({ workflow, selectedNodeId, onSelectNode }: WorkflowCanvasProps) {
  return (
    <div
      onClick={() => onSelectNode(null)}
      className="flex-1 h-full relative overflow-auto bg-surface-950 p-8 cursor-grab active:cursor-grabbing select-none"
      style={{
        backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* SVG Canvas Edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
          </marker>
        </defs>
        {workflow.edges.map((e) => {
          const src = workflow.nodes.find((n) => n.id === e.sourceId);
          const tgt = workflow.nodes.find((n) => n.id === e.targetId);
          if (!src || !tgt) return null;

          const x1 = src.position.x + 80;
          const y1 = src.position.y + 40;
          const x2 = tgt.position.x + 80;
          const y2 = tgt.position.y + 40;

          const dx = x2 - x1;
          const cx1 = x1 + dx * 0.5;
          const cx2 = x1 + dx * 0.5;

          const pathStr = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;

          return (
            <g key={e.id}>
              <path d={pathStr} stroke="#475569" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
              {e.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 8}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="bg-surface-900"
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Render Nodes */}
      {workflow.nodes.map((node) => {
        const style = NODE_STYLE[node.type] || NODE_STYLE.manual_action;
        const isSelected = selectedNodeId === node.id;
        const isRunning = node.status === 'running';

        return (
          <div
            key={node.id}
            onClick={(e) => { e.stopPropagation(); onSelectNode(node.id); }}
            style={{ left: `${node.position.x}px`, top: `${node.position.y}px` }}
            className={`
              absolute w-44 rounded-xl border p-3 shadow-xl transition-all cursor-pointer z-10
              ${style.bg} ${style.border}
              ${isSelected ? 'ring-2 ring-brand-500 scale-105' : 'hover:scale-102'}
              ${isRunning ? 'animate-pulse ring-2 ring-blue-500' : ''}
            `}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[9px] font-bold uppercase tracking-wide ${style.text}`}>{node.type}</span>
              {node.clauseId && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-800 text-brand-400">
                  Cl. {node.clauseId}
                </span>
              )}
            </div>

            <p className="text-xs font-bold text-surface-100 leading-snug">{node.label}</p>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-800/60 text-[9px] text-surface-400">
              <span>Est: {node.estimatedMinutes ?? 10}m</span>
              {node.requiredRole && <span className="truncate max-w-[80px]">{node.requiredRole}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
