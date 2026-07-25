import type { WorkflowDefinition } from './WorkflowTypes';

export interface WorkflowValidationIssue {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
}

export class WorkflowValidator {
  validate(wf: WorkflowDefinition): WorkflowValidationIssue[] {
    const issues: WorkflowValidationIssue[] = [];

    // Check Start & End nodes
    const starts = wf.nodes.filter((n) => n.type === 'start');
    const ends = wf.nodes.filter((n) => n.type === 'end');

    if (starts.length === 0) issues.push({ type: 'error', message: 'Workflow must contain a Start node.' });
    if (starts.length > 1) issues.push({ type: 'error', message: 'Workflow cannot have multiple Start nodes.' });
    if (ends.length === 0) issues.push({ type: 'error', message: 'Workflow must contain an End node.' });

    // Check orphan nodes
    wf.nodes.forEach((node) => {
      if (node.type === 'start') return;
      const incoming = wf.edges.filter((e) => e.targetId === node.id);
      if (incoming.length === 0) {
        issues.push({ type: 'warning', message: `Node '${node.label}' has no incoming connections.`, nodeId: node.id });
      }
    });

    return issues;
  }
}

export const globalWorkflowValidator = new WorkflowValidator();
