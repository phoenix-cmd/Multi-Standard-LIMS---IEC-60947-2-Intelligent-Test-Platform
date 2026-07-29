import { v4 as uuidv4 } from 'uuid';
import type { ComponentState, ComponentStatus, TwinSnapshot, TwinEvent } from './TwinState';
import { MCCB_COMPONENTS, COMPONENT_IDS } from './ComponentRegistry';

function makeInitialState(): Record<string, ComponentState> {
  const state: Record<string, ComponentState> = {};
  for (const id of COMPONENT_IDS) {
    const def = MCCB_COMPONENTS[id];
    state[id] = {
      ...def,
      status: 'normal',
      temperature: 25,
      current: 0,
      voltage: 0,
      health: 100,
      wear: 0,
      animating: false,
    };
  }
  return state;
}

// ── Clause → Component linkage map (IS/IEC 60947-2:2003) ──────────────────────
const CLAUSE_COMPONENT_MAP: Record<string, string[]> = {
  '8.3.3.1':   ['thermalElement', 'magneticRelease', 'tripUnit', 'operatingMechanism'],
  '8.3.3.1.2': ['magneticRelease', 'tripUnit', 'mainContacts'],
  '8.3.3.1.3a':['thermalElement', 'tripUnit'],
  '8.3.3.2':   ['casing', 'arcChute', 'terminalR', 'terminalS', 'terminalT'],
  '8.3.3.3':   ['operatingMechanism', 'undervoltageRelease', 'shuntRelease', 'mainContacts'],
  '8.3.3.4':   ['mainContacts', 'arcChute', 'thermalElement', 'magneticRelease'],
  '8.3.3.5':   ['casing', 'arcChute', 'terminalR', 'terminalS', 'terminalT'],
  '8.3.3.6':   ['terminalR', 'terminalS', 'terminalT', 'loadTerminalR', 'loadTerminalS', 'loadTerminalT', 'handle'],
  '8.3.3.7':   ['thermalElement', 'tripUnit', 'operatingMechanism'],
  '8.3.3.8':   ['undervoltageRelease', 'shuntRelease', 'operatingMechanism'],
  '8.3.3.9':   ['handle', 'mainContacts'],
  '8.3.4':     ['mainContacts', 'arcChute', 'operatingMechanism', 'magneticRelease'],
  '8.3.5':     ['mainContacts', 'arcChute', 'tripUnit', 'magneticRelease'],
};

export class TwinEngine {
  private _state: Record<string, ComponentState>;
  private _snapshots: TwinSnapshot[] = [];
  private _events: TwinEvent[] = [];
  private _listeners: Set<() => void> = new Set();

  constructor() {
    this._state = makeInitialState();
  }

  // ── Subscription ────────────────────────────────────────────────────────────
  subscribe(cb: () => void) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _notify() {
    this._listeners.forEach((cb) => cb());
  }

  // ── Read ────────────────────────────────────────────────────────────────────
  getState(): Record<string, ComponentState> {
    return { ...this._state };
  }

  getComponent(id: string): ComponentState | undefined {
    return this._state[id];
  }

  getSnapshots(): TwinSnapshot[] {
    return [...this._snapshots];
  }

  getOverallHealth(): number {
    const vals = COMPONENT_IDS.map((id) => this._state[id].health);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  // ── Mutations ───────────────────────────────────────────────────────────────
  setComponentStatus(id: string, status: ComponentStatus, overrides?: Partial<ComponentState>) {
    if (!this._state[id]) return;
    this._state[id] = { ...this._state[id], status, ...overrides };
    this._notify();
  }

  setHighlightedClause(clauseId: string | null) {
    // Reset all highlights first
    for (const id of COMPONENT_IDS) {
      if (this._state[id].status === 'selected') continue;
      this._state[id] = { ...this._state[id], status: 'normal', highlightColor: undefined };
    }
    if (!clauseId) { this._notify(); return; }
    const components = CLAUSE_COMPONENT_MAP[clauseId] || [];
    components.forEach((cid) => {
      if (this._state[cid]) {
        this._state[cid] = { ...this._state[cid], status: 'testing', highlightColor: '#06b6d4' };
      }
    });
    this._notify();
  }

  applyTestEvent(clauseId: string, verdict: 'PASS' | 'FAIL' | 'NA', measuredValue?: number | string) {
    const affected = CLAUSE_COMPONENT_MAP[clauseId] || [];
    const event: TwinEvent = {
      type: verdict === 'FAIL' ? 'fault' : 'test_complete',
      clauseId, verdict,
      measuredValue,
      timestamp: new Date().toISOString(),
      componentIds: affected,
    };
    this._events.push(event);

    affected.forEach((id) => {
      if (!this._state[id]) return;
      if (verdict === 'PASS') {
        this._state[id] = {
          ...this._state[id],
          status: 'normal',
          health: Math.max(80, this._state[id].health - 1),
          wear: Math.min(100, this._state[id].wear + 2),
          animating: false,
          faultState: undefined,
        };
      } else if (verdict === 'FAIL') {
        this._state[id] = {
          ...this._state[id],
          status: 'failure',
          health: Math.max(0, this._state[id].health - 20),
          wear: Math.min(100, this._state[id].wear + 15),
          faultState: `Failed at clause ${clauseId}`,
          animating: true,
        };
      }
    });
    this._notify();
  }

  applyTestRunData(testRuns: { clauseResults: { clauseId: string; verdict: string; measuredValue?: number | string }[] }[]) {
    for (const run of testRuns) {
      for (const cr of run.clauseResults) {
        if (cr.verdict === 'PASS' || cr.verdict === 'FAIL') {
          this.applyTestEvent(cr.clauseId, cr.verdict, cr.measuredValue);
        }
      }
    }
  }

  startTestAnimation(clauseId: string) {
    const affected = CLAUSE_COMPONENT_MAP[clauseId] || [];
    affected.forEach((id) => {
      if (this._state[id]) {
        this._state[id] = { ...this._state[id], status: 'testing', animating: true };
      }
    });
    this._notify();
  }

  reset() {
    this._state = makeInitialState();
    this._events = [];
    this._notify();
  }

  snapshot(label: string, clauseId?: string, verdict?: string): TwinSnapshot {
    const snap: TwinSnapshot = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      label,
      clauseId,
      verdict,
      componentStates: JSON.parse(JSON.stringify(this._state)),
      overallHealth: this.getOverallHealth(),
    };
    this._snapshots.push(snap);
    return snap;
  }
}

// Global singleton for the session
export const globalTwinEngine = new TwinEngine();
