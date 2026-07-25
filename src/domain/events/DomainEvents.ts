import type { Verdict } from '../../types';

export interface TestCompletedPayload {
  sampleId: string;
  reportNo: string;
  clauseId: string;
  verdict: Verdict;
  measuredValue: number | string;
  limitValue?: number | string;
  unit?: string;
  timestamp: string;
}

export interface ClauseEvaluationCompletedPayload {
  sampleId: string;
  clauseId: string;
  verdict: Verdict;
  ruleId: string;
  evalText: string;
}

export interface EquipmentCalibrationExpiredPayload {
  equipmentId: string;
  equipmentName: string;
  dueDate: string;
}

export interface SampleRegisteredPayload {
  sampleId: string;
  reportNo: string;
  clientName: string;
  model: string;
}

export interface WorkflowExecutionStartedPayload {
  workflowId: string;
  workflowName: string;
  version: string;
  sampleId: string;
}

export interface InvestigationClosedPayload {
  caseId: string;
  clauseId: string;
  title: string;
  resolution: string;
  approvedBy: string;
}
