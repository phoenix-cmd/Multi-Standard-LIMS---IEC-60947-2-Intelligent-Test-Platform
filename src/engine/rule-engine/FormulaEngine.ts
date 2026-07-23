/**
 * FormulaEngine: Dynamically evaluates mathematical string formulas.
 * e.g. "1.45 * In", "2 * Ui + 1000", "0.8 * Icu"
 */
export class FormulaEngine {
  evaluate(formula: string, variables: Record<string, number>): number {
    try {
      const js = formula.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (match) => {
        if (match in variables) return String(variables[match]);
        return '0';
      });
      // eslint-disable-next-line no-new-func
      return Number(new Function(`return (${js});`)());
    } catch {
      return 0;
    }
  }

  /** Evaluate and format result with unit */
  evaluateFormatted(formula: string, variables: Record<string, number>, unit: string): string {
    const result = this.evaluate(formula, variables);
    return `${result.toFixed(3)} ${unit}`;
  }

  /** Resolve all formulas from a formula map against given variables */
  resolveAll(
    formulas: { id: string; expression: string; unit: string }[],
    variables: Record<string, number>
  ): Record<string, number> {
    const resolved: Record<string, number> = { ...variables };
    for (const f of formulas) {
      resolved[f.id] = this.evaluate(f.expression, resolved);
    }
    return resolved;
  }
}
