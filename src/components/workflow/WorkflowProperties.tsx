import React from 'react';
import type { WorkflowNodeData } from '../../workflow-designer/WorkflowTypes';
import { X, Clock, User, Wrench, BookOpen, AlertCircle } from 'lucide-react';

interface WorkflowPropertiesProps {
  node: WorkflowNodeData;
  onClose: () => void;
  onUpdate: (node: WorkflowNodeData) => void;
}

export function WorkflowProperties({ node, onClose, onUpdate }: WorkflowPropertiesProps) {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface-900 border-l border-surface-800 p-4 overflow-y-auto z-20 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-surface-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-surface-100">Node Inspector</h3>
          <p className="text-[10px] text-surface-400 font-mono">ID: {node.id}</p>
        </div>
        <button onClick={onClose} className="text-surface-400 hover:text-surface-100">
          <X className="w-4 h-4" />
        </button>
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
      </div>
    </div>
  );
}
