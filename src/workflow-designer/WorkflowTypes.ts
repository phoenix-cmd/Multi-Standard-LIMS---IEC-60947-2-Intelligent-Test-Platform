export type WorkflowNodeType =
  | 'start'
  | 'end'
  | 'test'
  | 'decision'
  | 'condition'
  | 'approval'
  | 'manual_action'
  | 'equipment'
  | 'delay'
  | 'notification'
  | 'report'
  | 'script'
  | 'ai_decision';

export interface WorkflowNodeData {
  id: string;
  type: WorkflowNodeType;
  label: string;
  description?: string;
  position: { x: number; y: number };
  clauseId?: string;
  estimatedMinutes?: number;
  requiredRole?: string;
  requiredEquipmentType?: string;
  formulaRef?: string;
  aiPrompt?: string;
  retryCount?: number;
  status?: 'idle' | 'running' | 'completed' | 'failed' | 'skipped';
}

export interface WorkflowEdgeData {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string; // e.g. "PASS", "FAIL", "Yes", "No"
  condition?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string; // e.g. "v1.0", "v2.0"
  description: string;
  standardId: string;
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
  createdAt: string;
  published: boolean;
}
