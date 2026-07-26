import React, { useState, useEffect } from 'react';
import type { WorkflowDefinition } from '../../workflow-designer/WorkflowTypes';
import { WorkflowDSL } from '../../workflow-designer/WorkflowDSL';
import { Code, Copy, Check, AlertCircle } from 'lucide-react';

interface WorkflowDSLEditorProps {
  workflow: WorkflowDefinition;
  onUpdateWorkflow: (wf: WorkflowDefinition) => void;
}

export function WorkflowDSLEditor({ workflow, onUpdateWorkflow }: WorkflowDSLEditorProps) {
  const [dslText, setDslText] = useState(() => WorkflowDSL.stringify(workflow));
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    setDslText(WorkflowDSL.stringify(workflow));
  }, [workflow]);

  const handleChange = (newText: string) => {
    setDslText(newText);
    try {
      const parsed = WorkflowDSL.parse(newText);
      onUpdateWorkflow(parsed);
      setParseError(null);
    } catch (err: any) {
      setParseError(err.message || 'Syntax Error parsing Workflow DSL');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dslText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 h-full bg-surface-950 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-surface-300">
          <Code className="w-4 h-4 text-brand-400" />
          Workflow Definition Language (DSL) Editor — Interactive 2-Way Sync
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-surface-800 border border-surface-700 text-surface-300 hover:text-surface-100 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy DSL'}
        </button>
      </div>

      {parseError && (
        <div className="mb-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {parseError}
        </div>
      )}

      <textarea
        value={dslText}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 w-full bg-surface-900 border border-surface-800 rounded-xl p-4 font-mono text-xs text-brand-300 leading-relaxed focus:outline-none focus:border-brand-500 resize-none shadow-inner"
        placeholder="Edit workflow DSL code here..."
      />
    </div>
  );
}
