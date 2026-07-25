import type { WorkflowDefinition, WorkflowNodeData } from './WorkflowTypes';

export interface SimulationStep {
  stepIndex: number;
  activeNodeId: string;
  nodeLabel: string;
  status: 'running' | 'completed' | 'failed';
  elapsedMinutes: number;
  log: string;
}

export class WorkflowSimulator {
  private _listeners: Set<() => void> = new Set();
  private _currentStep: number = 0;
  private _isRunning: boolean = false;
  private _history: SimulationStep[] = [];

  subscribe(cb: () => void) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _notify() {
    this._listeners.forEach((cb) => cb());
  }

  getHistory(): SimulationStep[] {
    return [...this._history];
  }

  isRunning(): boolean {
    return this._isRunning;
  }

  getCurrentNodeId(): string | null {
    return this._history[this._history.length - 1]?.activeNodeId ?? null;
  }

  async runSimulation(wf: WorkflowDefinition, onNodeUpdate: (nodeId: string, status: WorkflowNodeData['status']) => void) {
    this._isRunning = true;
    this._history = [];
    this._currentStep = 0;
    this._notify();

    let currentNode = wf.nodes.find((n) => n.type === 'start') ?? wf.nodes[0];
    let elapsed = 0;

    while (currentNode && this._isRunning) {
      onNodeUpdate(currentNode.id, 'running');
      elapsed += currentNode.estimatedMinutes ?? 10;

      const step: SimulationStep = {
        stepIndex: this._history.length + 1,
        activeNodeId: currentNode.id,
        nodeLabel: currentNode.label,
        status: 'running',
        elapsedMinutes: elapsed,
        log: `Executing ${currentNode.label} (Est: ${currentNode.estimatedMinutes ?? 10}m)...`,
      };
      this._history.push(step);
      this._notify();

      await new Promise((r) => setTimeout(r, 1200));

      onNodeUpdate(currentNode.id, 'completed');
      step.status = 'completed';
      step.log = `Completed ${currentNode.label}. Total elapsed: ${elapsed}m.`;
      this._notify();

      if (currentNode.type === 'end') break;

      // Find next outgoing node
      const edge = wf.edges.find((e) => e.sourceId === currentNode!.id);
      if (!edge) break;
      const nextNode = wf.nodes.find((n) => n.id === edge.targetId);
      if (!nextNode) break;
      currentNode = nextNode;
    }

    this._isRunning = false;
    this._notify();
  }

  stop() {
    this._isRunning = false;
    this._notify();
  }
}

export const globalWorkflowSimulator = new WorkflowSimulator();
