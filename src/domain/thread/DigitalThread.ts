export interface DigitalThreadTrace {
  requirementId: string;
  clauseId: string;
  workflowId: string;
  workflowVersion: string;
  equipmentIds: string[];
  sampleId: string;
  testRunId: string;
  formulaRef: string;
  verdict: string;
  investigationCaseId?: string;
  reportNo: string;
  digitalSignatureHash: string;
}

export class DigitalThread {
  private _traces: Map<string, DigitalThreadTrace> = new Map();

  recordTrace(trace: DigitalThreadTrace) {
    this._traces.set(trace.sampleId, trace);
  }

  getTraceForSample(sampleId: string): DigitalThreadTrace | undefined {
    return this._traces.get(sampleId);
  }
}

export const globalDigitalThread = new DigitalThread();
