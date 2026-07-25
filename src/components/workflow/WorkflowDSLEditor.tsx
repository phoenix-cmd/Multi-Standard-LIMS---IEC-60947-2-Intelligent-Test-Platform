import React from 'react';
import type { WorkflowDefinition } from '../../workflow-designer/WorkflowTypes';
import { WorkflowDSL } from '../../workflow-designer/WorkflowDSL';
import { Code, Copy, Check } from 'lucide-react';

export function WorkflowDSLEditor({ workflow }: { workflow: WorkflowDefinition }) {
  const dslText = WorkflowDSL.stringify(workflow);
  const [copied, setCopied] = React.useState(false);

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
          Workflow Definition Language (DSL) Specification
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-surface-800 border border-surface-700 text-surface-300 hover:text-surface-100 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy DSL'}
        </button>
      </div>

      <textarea
        readOnly
        value={dslText}
        className="flex-1 w-full bg-surface-900 border border-surface-800 rounded-xl p-4 font-mono text-xs text-brand-300 leading-relaxed focus:outline-none resize-none shadow-inner"
      />
    </div>
  );
}
