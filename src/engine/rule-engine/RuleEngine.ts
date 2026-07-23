import type { ClauseResult, RuleDefinition, Verdict } from '../../types';
import { ExpressionParser } from './ExpressionParser';
import { FormulaEngine } from './FormulaEngine';

export class RuleEngine {
  private formulaEngine = new FormulaEngine();

  evaluateRule(
    rule: RuleDefinition,
    inputs: Record<string, number>,
    formulaDefs: { id: string; expression: string; unit: string }[] = []
  ): ClauseResult {
    // 1. Resolve all formula values so expression can use them
    const resolved = this.formulaEngine.resolveAll(formulaDefs, inputs);

    // 2. Evaluate expression
    const parser = new ExpressionParser(resolved);
    const pass = parser.evaluate(rule.expression);
    const verdict: Verdict = pass ? 'PASS' : 'FAIL';

    return {
      clauseId: rule.clauseId,
      clauseTitle: rule.label,
      verdict,
      message: pass ? rule.passMessage : rule.failMessage,
      ruleId: rule.id,
      timestamp: new Date().toISOString(),
    };
  }

  evaluateAll(
    rules: RuleDefinition[],
    inputs: Record<string, number>,
    formulaDefs: { id: string; expression: string; unit: string }[] = []
  ): ClauseResult[] {
    return rules.map((r) => this.evaluateRule(r, inputs, formulaDefs));
  }

  /** Overall verdict = FAIL if any critical/major rule fails */
  overallVerdict(results: ClauseResult[]): Verdict {
    if (results.some((r) => r.verdict === 'FAIL')) return 'FAIL';
    if (results.some((r) => r.verdict === 'PENDING')) return 'PENDING';
    return 'PASS';
  }
}
