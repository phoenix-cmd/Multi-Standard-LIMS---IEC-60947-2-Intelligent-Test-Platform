import type { WorkflowDefinition, WorkflowNodeData, WorkflowEdgeData } from './WorkflowTypes';

export class WorkflowDSL {
  static stringify(wf: WorkflowDefinition): string {
    const lines: string[] = [
      `workflow: ${wf.id}`,
      `name: "${wf.name}"`,
      `version: ${wf.version}`,
      `standard: ${wf.standardId}`,
      `description: "${wf.description}"`,
      ``,
      `nodes:`,
    ];

    wf.nodes.forEach((n) => {
      lines.push(`  - id: ${n.id}`);
      lines.push(`    type: ${n.type}`);
      lines.push(`    label: "${n.label}"`);
      if (n.clauseId) lines.push(`    clause: ${n.clauseId}`);
      if (n.estimatedMinutes) lines.push(`    estimatedMinutes: ${n.estimatedMinutes}`);
      if (n.requiredRole) lines.push(`    requiredRole: ${n.requiredRole}`);
    });

    lines.push(``);
    lines.push(`edges:`);
    wf.edges.forEach((e) => {
      lines.push(`  - from: ${e.sourceId}`);
      lines.push(`    to: ${e.targetId}`);
      if (e.label) lines.push(`    label: "${e.label}"`);
    });

    return lines.join('\n');
  }
}
