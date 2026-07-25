import type { CrossRefEntry, CrossRefMap } from '../types/document';

export class NumberingEngine {
  private tableCount = 0;
  private figureCount = 0;
  private equationCount = 0;
  private appendixCount = 0;
  private registry: CrossRefMap = {};

  reset() {
    this.tableCount = 0;
    this.figureCount = 0;
    this.equationCount = 0;
    this.appendixCount = 0;
    this.registry = {};
  }

  nextTable(id: string, title: string): CrossRefEntry {
    this.tableCount += 1;
    const entry: CrossRefEntry = {
      id,
      type: 'table',
      label: `Table ${this.tableCount}`,
      title,
    };
    this.registry[id] = entry;
    return entry;
  }

  nextFigure(id: string, title: string): CrossRefEntry {
    this.figureCount += 1;
    const entry: CrossRefEntry = {
      id,
      type: 'figure',
      label: `Figure ${this.figureCount}`,
      title,
    };
    this.registry[id] = entry;
    return entry;
  }

  nextEquation(id: string, title: string): CrossRefEntry {
    this.equationCount += 1;
    const entry: CrossRefEntry = {
      id,
      type: 'equation',
      label: `Eq (${this.equationCount})`,
      title,
    };
    this.registry[id] = entry;
    return entry;
  }

  nextAppendix(id: string, title: string): CrossRefEntry {
    this.appendixCount += 1;
    const letter = String.fromCharCode(64 + this.appendixCount); // A, B, C...
    const entry: CrossRefEntry = {
      id,
      type: 'appendix',
      label: `Appendix ${letter}`,
      title,
    };
    this.registry[id] = entry;
    return entry;
  }

  getRegistry(): CrossRefMap {
    return this.registry;
  }

  resolveRef(id: string): string {
    const entry = this.registry[id];
    if (!entry) return `[Ref: ${id}]`;
    return `${entry.label} (${entry.title})`;
  }
}
