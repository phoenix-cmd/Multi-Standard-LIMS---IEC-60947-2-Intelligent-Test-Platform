import type { ClauseDefinition, FormulaDefinition, RuleDefinition } from '../../types';

export interface StandardPluginMetadata {
  id: string;
  name: string;
  scope: string;
  revision: string;
  organization: 'IEC' | 'UL' | 'IS' | 'EN';
  publishedYear: number;
}

export interface StandardPlugin {
  metadata: StandardPluginMetadata;
  clauses: ClauseDefinition[];
  formulas: FormulaDefinition[];
  rules: RuleDefinition[];
  defaultWorkflowDSL: string;
  evaluateRule(ruleId: string, measuredValues: Record<string, number>): { verdict: 'PASS' | 'FAIL'; message: string };
}
