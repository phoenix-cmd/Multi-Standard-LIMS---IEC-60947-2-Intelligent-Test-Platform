import type { ClauseDefinition, ClauseResult, FormulaDefinition, RuleDefinition } from '../../types';

export interface StandardPluginMetadata {
  id: string;
  name: string;
  scope: string;
  revision: string;
  organization: 'IEC' | 'UL' | 'IS' | 'EN' | 'BIS' | 'BIS / IEC' | 'IS/IEC';
  publishedYear: number;
}

export interface StandardPlugin {
  metadata: StandardPluginMetadata;
  clauses: ClauseDefinition[];
  formulas: FormulaDefinition[];
  rules: RuleDefinition[];
  defaultWorkflowDSL: string;
  evaluateRule(ruleId: string, measuredValues: Record<string, number | string | boolean>): ClauseResult;
}
