export interface OntologyNode {
  id: string;
  type: 'component' | 'material' | 'failure_mode' | 'clause' | 'measurement' | 'equipment' | 'formula';
  label: string;
  metadata?: Record<string, any>;
}

export interface OntologyEdge {
  sourceId: string;
  targetId: string;
  relationship: 'made_of' | 'exhibits' | 'tested_by' | 'measured_with' | 'calculated_via' | 'stresses';
}

export class EngineeringOntology {
  private _nodes: Map<string, OntologyNode> = new Map();
  private _edges: OntologyEdge[] = [];

  constructor() {
    this._seedOntology();
  }

  private _seedOntology() {
    // Component -> Material -> Failure Mode -> Clause relationships
    const seeds: { node: OntologyNode; edges?: OntologyEdge[] }[] = [
      {
        node: { id: 'casing', type: 'component', label: 'Moulded Casing' },
        edges: [{ sourceId: 'casing', targetId: 'bmc_material', relationship: 'made_of' }],
      },
      { node: { id: 'bmc_material', type: 'material', label: 'Glass-reinforced DMC/BMC' } },
      {
        node: { id: 'terminalR', type: 'component', label: 'Line Terminal R' },
        edges: [
          { sourceId: 'terminalR', targetId: 'cu_material', relationship: 'made_of' },
          { sourceId: 'terminalR', targetId: 'clause_8_3_3_1', relationship: 'tested_by' },
        ],
      },
      { node: { id: 'cu_material', type: 'material', label: 'Electrolytic Copper (Cu-ETP)' } },
      { node: { id: 'clause_8_3_3_1', type: 'clause', label: 'IEC 60947-2 Cl. 8.3.3.1 (Temp Rise)' } },
      {
        node: { id: 'arcChute', type: 'component', label: 'Arc Chute Assembly' },
        edges: [
          { sourceId: 'arcChute', targetId: 'clause_8_3_4', relationship: 'tested_by' },
          { sourceId: 'arcChute', targetId: 'carbon_tracking', relationship: 'exhibits' },
        ],
      },
      { node: { id: 'carbon_tracking', type: 'failure_mode', label: 'Carbon Tracking Across Plates' } },
      { node: { id: 'clause_8_3_4', type: 'clause', label: 'IEC 60947-2 Cl. 8.3.4 (Icu Short Circuit)' } },
    ];

    for (const item of seeds) {
      this._nodes.set(item.node.id, item.node);
      if (item.edges) {
        this._edges.push(...item.edges);
      }
    }
  }

  getLinkedNodes(nodeId: string): OntologyNode[] {
    const connectedIds = new Set<string>();
    this._edges.forEach((e) => {
      if (e.sourceId === nodeId) connectedIds.add(e.targetId);
      if (e.targetId === nodeId) connectedIds.add(e.sourceId);
    });
    return Array.from(connectedIds)
      .map((id) => this._nodes.get(id))
      .filter((n): n is OntologyNode => n !== undefined);
  }
}

export const globalEngineeringOntology = new EngineeringOntology();
