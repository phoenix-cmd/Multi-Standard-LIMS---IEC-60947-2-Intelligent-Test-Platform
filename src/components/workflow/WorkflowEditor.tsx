import React, { useState, useEffect } from 'react';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowToolbar } from './WorkflowToolbar';
import { WorkflowProperties } from './WorkflowProperties';
import { WorkflowDSLEditor } from './WorkflowDSLEditor';
import type { WorkflowDefinition, WorkflowNodeData, WorkflowNodeType } from '../../workflow-designer/WorkflowTypes';
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
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(() => {
    const saved = localStorage.getItem('lims_saved_workflow');
    return saved ? JSON.parse(saved) : INITIAL_WORKFLOW;
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'dsl'>('visual');

  const handleNodeUpdate = (updatedNode: WorkflowNodeData) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)),
    }));
  };

  const handleUpdateNodePosition = (id: string, pos: { x: number; y: number }) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, position: pos } : n)),
    }));
  };

  const handleAddNode = (type: WorkflowNodeType) => {
    const newId = `node-${Date.now().toString().slice(-4)}`;
    const labels: Partial<Record<WorkflowNodeType, string>> = {
      start: 'Start Execution',
      end: 'Complete Sequence',
      test: 'New Test Clause',
      decision: 'Pass / Fail Criteria',
      manual_action: 'Manual Inspection',
      report: 'Compile Report',
    };
    const newNode: WorkflowNodeData = {
      id: newId,
      type,
      label: labels[type] || 'New Step',
      position: { x: 300 + Math.random() * 200, y: 150 + Math.random() * 100 },
      estimatedMinutes: 15,
      requiredRole: 'Lab Engineer',
    };
    setWorkflow((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    setSelectedNodeId(newId);
  };

  const handleDeleteNode = (nodeId: string) => {
    setWorkflow((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: prev.edges.filter((e) => e.sourceId !== nodeId && e.targetId !== nodeId),
    }));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleAddEdge = (sourceId: string, targetId: string, label?: string) => {
    const edgeId = `edge-${Date.now().toString().slice(-4)}`;
    setWorkflow((prev) => ({
      ...prev,
      edges: [...prev.edges, { id: edgeId, sourceId, targetId, label }],
    }));
  };

  const handleDeleteEdge = (edgeId: string) => {
    setWorkflow((prev) => ({
      ...prev,
      edges: prev.edges.filter((e) => e.id !== edgeId),
    }));
  };

  const handleSave = () => {
    localStorage.setItem('lims_saved_workflow', JSON.stringify(workflow));
    alert('Workflow saved successfully!');
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
        onAddNode={handleAddNode}
        onSave={handleSave}
      />

      <div className="flex-1 overflow-hidden flex relative">
        {viewMode === 'visual' ? (
          <WorkflowCanvas
            workflow={workflow}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onUpdateNodePosition={handleUpdateNodePosition}
            onDeleteEdge={handleDeleteEdge}
          />
        ) : (
          <WorkflowDSLEditor
            workflow={workflow}
            onUpdateWorkflow={setWorkflow}
          />
        )}

        {/* Node Properties Panel */}
        {selectedNode && (
          <WorkflowProperties
            node={selectedNode}
            workflow={workflow}
            onClose={() => setSelectedNodeId(null)}
            onUpdate={handleNodeUpdate}
            onDeleteNode={handleDeleteNode}
            onAddEdge={handleAddEdge}
            onDeleteEdge={handleDeleteEdge}
          />
        )}
      </div>
    </div>
  );
}
