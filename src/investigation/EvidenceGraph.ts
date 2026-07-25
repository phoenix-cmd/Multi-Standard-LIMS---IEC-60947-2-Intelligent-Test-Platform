import type { EvidenceItem } from './CaseTypes';

export interface EvidenceGraphNode {
  id: string;
  type: string;
  label: string;
  sublabel?: string;
}

export interface EvidenceGraphEdge {
  source: string;
  target: string;
  relation: string;
}

export class EvidenceGraph {
  buildGraph(evidenceList: EvidenceItem[]): { nodes: EvidenceGraphNode[]; edges: EvidenceGraphEdge[] } {
    const nodes: EvidenceGraphNode[] = [];
    const edges: EvidenceGraphEdge[] = [];

    evidenceList.forEach((item) => {
      // Add Evidence Node
      nodes.push({
        id: item.id,
        type: item.type,
        label: item.title,
        sublabel: `${item.measuredValue ?? ''} ${item.unit ?? ''}`,
      });

      // Link to Component if present
      if (item.componentId) {
        const compNodeId = `comp-${item.componentId}`;
        if (!nodes.some((n) => n.id === compNodeId)) {
          nodes.push({ id: compNodeId, type: 'component', label: item.componentId });
        }
        edges.push({ source: item.id, target: compNodeId, relation: 'stresses' });
      }

      // Link to Clause if present
      if (item.clauseId) {
        const clauseNodeId = `clause-${item.clauseId}`;
        if (!nodes.some((n) => n.id === clauseNodeId)) {
          nodes.push({ id: clauseNodeId, type: 'clause', label: `Cl. ${item.clauseId}` });
        }
        edges.push({ source: item.id, target: clauseNodeId, relation: 'evaluates' });
      }
    });

    return { nodes, edges };
  }
}

export const globalEvidenceGraph = new EvidenceGraph();
