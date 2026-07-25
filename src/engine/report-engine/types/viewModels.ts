import type { Verdict, DiagnosisResult } from '../../../types';

export interface FormulaStepViewModel {
  stepName: string;
  expression: string;
  substitution: string;
  result: string;
  unit?: string;
  verdict?: Verdict;
}

export interface ClauseViewModel {
  clauseId: string;
  clauseTitle: string;
  requirement: string;
  purpose: string;
  acceptanceCriteria: string;
  measuredValue?: number | string;
  limitValue?: number | string;
  unit?: string;
  formulaSteps: FormulaStepViewModel[];
  observations: string;
  equipmentIds: string[];
  verdict: Verdict;
  aiDiagnosis?: DiagnosisResult;
  engineerRemarks?: string;
  sequenceId: string;
}

export interface EquipmentViewModel {
  assetTag: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNo: string;
  certNo: string;
  calDue: string;
  status: string;
  usedInClauses: string[];
}

export interface AppendixViewModel {
  id: string;
  title: string;
  type: 'oscillograph' | 'photo' | 'certificate' | 'raw_data' | 'ai_analysis';
  description: string;
  content: any;
  refCode: string;
}

export interface SpecSectionViewModel {
  title: string;
  items: { label: string; value: string | number }[];
}
