import React, { useState } from 'react';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowToolbar } from './WorkflowToolbar';
import { WorkflowProperties } from './WorkflowProperties';
import { WorkflowDSLEditor } from './WorkflowDSLEditor';
import type { WorkflowDefinition, WorkflowNodeData } from '../../workflow-designer/WorkflowTypes';
import { globalWorkflowSimulator } from '../../workflow-designer/WorkflowSimulator';

const INITIAL_WORKFLOW: WorkflowDefinition = {
  id: 'wf-iec-60947-2-std',
  name: 'IEC 60947-2 Standard Certification Workflow',
  version: 'v1.0',
  description: 'Standard sequence for Moulded Case Circuit Breaker certification testing',
  standardId: 'iec60947-2',
  published: true,
  createdAt: '2026-07-25T12:00:00Z',
  nodes: [
    { id: 'n1', type: 'start', label: 'Receive Sample', position: { x: 50, y: 150 }, estimatedMinutes: 5, requiredRole: 'Lab Technician' },
    { id: 'n2', type: 'manual_action', label: 'Visual Inspection', position: { x: 220, y: 150 }, estimatedMinutes: 15, requiredRole: 'Lab Engineer' },
    { id: 'n3', type: 'test', label: 'Cl. 8.3.3.1 Temp Rise', clauseId: '8.3.3.1', position: { x: 420, y: 150 }, estimatedMinutes: 60, requiredRole: 'Testing Specialist' },
    { id: 'n4', type: 'decision', label: 'Pass Temp Rise?', position: { x: 620, y: 150 }, estimatedMinutes: 2 },
    { id: 'n5', type: 'test', label: 'Cl. 8.3.3.2 Dielectric', clauseId: '8.3.3.2', position: { x: 820, y: 100 }, estimatedMinutes: 30, requiredRole: 'High-Voltage Specialist' },
    { id: 'n6', type: 'manual_action', label: 'AI Investigation', position: { x: 820, y: 220 }, estimatedMinutes: 45, requiredRole: 'Quality Specialist' },
    { id: 'n7', type: 'report', label: 'Generate PDF Certificate', position: { x: 1020, y: 150 }, estimatedMinutes: 5 },
    { id: 'n8', type: 'end', label: 'Archive & Sign', position: { x: 1200, y: 150 }, estimatedMinutes: 5 },
  ],
  edges: [
    { id: 'e1', sourceId: 'n1', targetId: 'n2' },
    { id: 'e2', sourceId: 'n2', targetId: 'n3' },
    { id: 'e3', sourceId: 'n3', targetId: 'n4' },
    { id: 'e4', sourceId: 'n4', targetId: 'n5', label: 'PASS' },
    { id: 'e5', sourceId: 'n4', targetId: 'n6', label: 'FAIL' },
    { id: 'e6', sourceId: 'n5', targetId: 'n7' },
    { id: 'e7', sourceId: 'n6', targetId: 'n7' },
    { id: 'e8', sourceId: 'n7', targetId: 'n8' },
  ],
};

export function WorkflowEditor() {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(INITIAL_WORKFLOW);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'dsl'>('visual');

  const handleNodeUpdate = (updatedNode: WorkflowNodeData) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)),
    }));
  };

  const handleSimulate = () => {
    globalWorkflowSimulator.runSimulation(workflow, (nodeId, status) => {
      setWorkflow((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, status } : n)),
      }));
    });
  };

  const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-surface-950">
      <WorkflowToolbar
        workflow={workflow}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSimulate={handleSimulate}
      />

      <div className="flex-1 overflow-hidden flex relative">
        {viewMode === 'visual' ? (
          <WorkflowCanvas
            workflow={workflow}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        ) : (
          <WorkflowDSLEditor workflow={workflow} />
        )}

        {/* Node Properties Panel */}
        {selectedNode && (
          <WorkflowProperties
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onUpdate={handleNodeUpdate}
          />
        )}
      </div>
    </div>
  );
}
