import React from 'react';
import type { WorkflowDefinition, WorkflowNodeData } from '../../workflow-designer/WorkflowTypes';
import { X, Trash2, ArrowRight, Plus } from 'lucide-react';

interface WorkflowPropertiesProps {
  node: WorkflowNodeData;
  workflow: WorkflowDefinition;
  onClose: () => void;
  onUpdate: (node: WorkflowNodeData) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddEdge: (sourceId: string, targetId: string, label?: string) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export function WorkflowProperties({
  node,
  workflow,
  onClose,
  onUpdate,
  onDeleteNode,
  onAddEdge,
  onDeleteEdge,
}: WorkflowPropertiesProps) {
  const outgoingEdges = workflow.edges.filter((e) => e.sourceId === node.id);

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface-900 border-l border-surface-800 p-4 overflow-y-auto z-20 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-surface-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-surface-100">Node Inspector</h3>
          <p className="text-[10px] text-surface-400 font-mono">ID: {node.id} ({node.type})</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteNode(node.id)}
            title="Delete Node"
            className="p-1.5 hover:bg-rose-500/20 text-surface-400 hover:text-rose-400 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 text-surface-400 hover:text-surface-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wide">Label</label>
          <input
            type="text"
            value={node.label}
            onChange={(e) => onUpdate({ ...node, label: e.target.value })}
            className="w-full mt-1 bg-surface-800 border border-surface-700 rounded-lg px-2.5 py-1.5 text-xs text-surface-100 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wide">Estimated Minutes</label>
          <input
            type="number"
            value={node.estimatedMinutes ?? 10}
            onChange={(e) => onUpdate({ ...node, estimatedMinutes: parseInt(e.target.value) || 0 })}
            className="w-full mt-1 bg-surface-800 border border-surface-700 rounded-lg px-2.5 py-1.5 text-xs text-surface-100 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wide">Required Role</label>
          <input
            type="text"
            value={node.requiredRole ?? ''}
            onChange={(e) => onUpdate({ ...node, requiredRole: e.target.value })}
            placeholder="e.g. Lab Engineer"
            className="w-full mt-1 bg-surface-800 border border-surface-700 rounded-lg px-2.5 py-1.5 text-xs text-surface-100 focus:outline-none focus:border-brand-500"
          />
        </div>

        {node.clauseId !== undefined && (
          <div>
            <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wide">IEC Clause Reference</label>
            <input
              type="text"
              value={node.clauseId}
              onChange={(e) => onUpdate({ ...node, clauseId: e.target.value })}
              className="w-full mt-1 bg-surface-800 border border-surface-700 rounded-lg px-2.5 py-1.5 text-xs text-surface-100 font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
        )}

        {/* Connections & Edges Inspector */}
        <div className="pt-3 border-t border-surface-800 space-y-2">
          <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wide flex items-center justify-between">
            <span>Outgoing Connections ({outgoingEdges.length})</span>
          </label>

          {outgoingEdges.map((e) => {
            const targetNode = workflow.nodes.find((n) => n.id === e.targetId);
            return (
              <div key={e.id} className="flex items-center justify-between p-2 bg-surface-950 border border-surface-800 rounded-lg text-xs">
                <span className="flex items-center gap-1.5 text-surface-200 truncate">
                  <ArrowRight className="w-3 h-3 text-brand-400 flex-shrink-0" />
                  {targetNode?.label || e.targetId} {e.label ? `(${e.label})` : ''}
                </span>
                <button
                  onClick={() => onDeleteEdge(e.id)}
                  className="text-surface-500 hover:text-rose-400 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* Add Connection */}
          <div className="pt-2">
            <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wide mb-1 block">
              Connect to Step:
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onAddEdge(node.id, e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-2 py-1.5 text-xs text-surface-100 focus:outline-none"
            >
              <option value="" disabled>Select target node...</option>
              {workflow.nodes
                .filter((n) => n.id !== node.id)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label} ({n.id})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
