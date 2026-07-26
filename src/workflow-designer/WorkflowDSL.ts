import type { WorkflowDefinition, WorkflowNodeData, WorkflowEdgeData, WorkflowNodeType } from './WorkflowTypes';

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

  static parse(dslText: string): WorkflowDefinition {
    const lines = dslText.split('\n');
    let id = 'wf-custom';
    let name = 'Custom Workflow';
    let version = 'v1.0';
    let standardId = 'iec60947-2';
    let description = 'Custom DSL Workflow';

    const nodes: WorkflowNodeData[] = [];
    const edges: WorkflowEdgeData[] = [];

    let currentSection: 'header' | 'nodes' | 'edges' = 'header';
    let currentNode: Partial<WorkflowNodeData> | null = null;
    let currentEdge: Partial<WorkflowEdgeData> | null = null;

    let nodeIndex = 0;

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.startsWith('workflow:')) {
        id = line.replace('workflow:', '').trim();
      } else if (line.startsWith('name:')) {
        name = line.replace('name:', '').trim().replace(/^"|"$/g, '');
      } else if (line.startsWith('version:')) {
        version = line.replace('version:', '').trim();
      } else if (line.startsWith('standard:')) {
        standardId = line.replace('standard:', '').trim();
      } else if (line.startsWith('description:')) {
        description = line.replace('description:', '').trim().replace(/^"|"$/g, '');
      } else if (line === 'nodes:') {
        currentSection = 'nodes';
      } else if (line === 'edges:') {
        if (currentNode && currentNode.id && currentNode.type && currentNode.label) {
          nodes.push(currentNode as WorkflowNodeData);
          currentNode = null;
        }
        currentSection = 'edges';
      } else if (currentSection === 'nodes') {
        if (line.startsWith('- id:')) {
          if (currentNode && currentNode.id && currentNode.type && currentNode.label) {
            nodes.push(currentNode as WorkflowNodeData);
          }
          const nodeIdx = nodes.length;
          currentNode = {
            id: line.replace('- id:', '').trim(),
            type: 'manual_action',
            label: 'Step',
            position: { x: 50 + (nodeIdx % 5) * 180, y: 150 + Math.floor(nodeIdx / 5) * 120 },
            estimatedMinutes: 10,
          };
        } else if (currentNode) {
          if (line.startsWith('type:')) currentNode.type = line.replace('type:', '').trim() as WorkflowNodeType;
          else if (line.startsWith('label:')) currentNode.label = line.replace('label:', '').trim().replace(/^"|"$/g, '');
          else if (line.startsWith('clause:')) currentNode.clauseId = line.replace('clause:', '').trim();
          else if (line.startsWith('estimatedMinutes:')) currentNode.estimatedMinutes = parseInt(line.replace('estimatedMinutes:', '').trim()) || 10;
          else if (line.startsWith('requiredRole:')) currentNode.requiredRole = line.replace('requiredRole:', '').trim();
        }
      } else if (currentSection === 'edges') {
        if (line.startsWith('- from:')) {
          if (currentEdge && currentEdge.sourceId && currentEdge.targetId) {
            edges.push(currentEdge as WorkflowEdgeData);
          }
          currentEdge = {
            id: `e-${edges.length + 1}`,
            sourceId: line.replace('- from:', '').trim(),
            targetId: '',
          };
        } else if (currentEdge) {
          if (line.startsWith('to:')) currentEdge.targetId = line.replace('to:', '').trim();
          else if (line.startsWith('label:')) currentEdge.label = line.replace('label:', '').trim().replace(/^"|"$/g, '');
        }
      }
    }

    if (currentNode && currentNode.id && currentNode.type && currentNode.label) {
      nodes.push(currentNode as WorkflowNodeData);
    }
    if (currentEdge && currentEdge.sourceId && currentEdge.targetId) {
      edges.push(currentEdge as WorkflowEdgeData);
    }

    return {
      id,
      name,
      version,
      description,
      standardId,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      published: true,
    };
  }
}
