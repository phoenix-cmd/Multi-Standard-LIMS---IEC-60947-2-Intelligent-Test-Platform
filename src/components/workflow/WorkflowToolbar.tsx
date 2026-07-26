import React from 'react';
import type { WorkflowDefinition, NodeType } from '../../workflow-designer/WorkflowTypes';
import { Play, Code, Layers, CheckCircle2, Plus, Save } from 'lucide-react';
import { globalWorkflowValidator } from '../../workflow-designer/WorkflowValidator';

interface WorkflowToolbarProps {
  workflow: WorkflowDefinition;
  viewMode: 'visual' | 'dsl';
  setViewMode: (m: 'visual' | 'dsl') => void;
  onSimulate: () => void;
  onAddNode: (type: NodeType) => void;
  onSave: () => void;
}

export function WorkflowToolbar({
  workflow,
  viewMode,
  setViewMode,
  onSimulate,
  onAddNode,
  onSave,
}: WorkflowToolbarProps) {
  const issues = globalWorkflowValidator.validate(workflow);
  const errors = issues.filter((i) => i.type === 'error');

  return (
    <div className="px-4 py-3 border-b border-surface-800 bg-surface-900 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
          <Layers className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-surface-100">{workflow.name}</h2>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-800 text-brand-400 border border-surface-700">
              {workflow.version}
            </span>
          </div>
          <p className="text-[10px] text-surface-400">{workflow.description}</p>
        </div>
      </div>

      {/* Palette Node Creators */}
      <div className="flex items-center gap-1.5 bg-surface-950 p-1 rounded-xl border border-surface-800">
        <span className="text-[10px] font-mono font-bold text-surface-400 px-2">Add Step:</span>
        <button
          onClick={() => onAddNode('test')}
          className="px-2 py-1 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 rounded text-[10px] font-bold text-brand-400 flex items-center gap-1 transition-all"
        >
          <Plus className="w-3 h-3" /> Test
        </button>
        <button
          onClick={() => onAddNode('decision')}
          className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded text-[10px] font-bold text-amber-400 flex items-center gap-1 transition-all"
        >
          <Plus className="w-3 h-3" /> Decision
        </button>
        <button
          onClick={() => onAddNode('manual_action')}
          className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded text-[10px] font-bold text-purple-400 flex items-center gap-1 transition-all"
        >
          <Plus className="w-3 h-3" /> Action
        </button>
        <button
          onClick={() => onAddNode('report')}
          className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-[10px] font-bold text-cyan-400 flex items-center gap-1 transition-all"
        >
          <Plus className="w-3 h-3" /> Report
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle visual vs DSL */}
        <div className="flex items-center bg-surface-800 border border-surface-700 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('visual')}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-all ${
              viewMode === 'visual' ? 'bg-surface-700 text-surface-100 font-semibold' : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            <Layers className="w-3 h-3" /> Visual Canvas
          </button>
          <button
            onClick={() => setViewMode('dsl')}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-all ${
              viewMode === 'dsl' ? 'bg-surface-700 text-surface-100 font-semibold' : 'text-surface-400 hover:text-surface-200'
            }`}
          >
            <Code className="w-3 h-3" /> DSL Code
          </button>
        </div>

        {/* Validation indicator */}
        {errors.length === 0 ? (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Valid Graph
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1 font-semibold">
            {errors.length} Error(s)
          </span>
        )}

        {/* Save button */}
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-700 text-surface-100 transition-colors"
        >
          <Save className="w-3.5 h-3.5" /> Save Workflow
        </button>

        {/* Simulate button */}
        <button
          onClick={onSimulate}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow"
        >
          <Play className="w-3.5 h-3.5 fill-current" /> Run Simulation
        </button>
      </div>
    </div>
  );
}
