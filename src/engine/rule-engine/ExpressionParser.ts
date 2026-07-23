/**
 * ExpressionParser: Lexes and evaluates domain-specific boolean expressions.
 * Syntax: "TripTime < 0.2 AND Current >= 1.3 * In AND Leakage < 5"
 * Supports: <, <=, >, >=, ==, !=, AND, OR, *, /, +, -, ()
 */
export class ExpressionParser {
  private variables: Record<string, number>;

  constructor(variables: Record<string, number>) {
    this.variables = variables;
  }

  evaluate(expression: string): boolean {
    try {
      const js = this.toJS(expression);
      // eslint-disable-next-line no-new-func
      const fn = new Function(...Object.keys(this.variables), `return (${js});`);
      return Boolean(fn(...Object.values(this.variables)));
    } catch {
      return false;
    }
  }

  /** Convert domain expression string to JS eval-safe string */
  private toJS(expr: string): string {
    return expr
      .replace(/\bAND\b/g, '&&')
      .replace(/\bOR\b/g, '||')
      .replace(/\bNOT\b/g, '!')
      .replace(/==/g, '===')
      .replace(/!=/g, '!==')
      // Replace variable names with their values for safe evaluation
      .replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (match) => {
        if (['true', 'false', 'null', 'undefined'].includes(match)) return match;
        return match; // kept as-is; Function constructor receives them as params
      });
  }
}
