// ── Digital Twin Type System ──────────────────────────────────────────────────

export type ComponentStatus =
  | 'normal'
  | 'testing'
  | 'warning'
  | 'failure'
  | 'selected'
  | 'maintenance'
  | 'hovered';

export type TwinVisualMode = 'assembled' | 'exploded' | 'section-x' | 'section-y';

export interface ComponentState {
  id: string;
  name: string;
  shortName: string;
  status: ComponentStatus;
  temperature: number;       // °C above ambient
  current: number;           // A flowing through
  voltage: number;           // V across terminals
  health: number;            // 0–100 %
  wear: number;              // 0–100 % (cumulative)
  faultState?: string;       // short description if failed
  highlightColor?: string;   // override color (CSS hex)
  animating: boolean;
  linkedClauseIds: string[]; // IEC clause IDs this component is tested by
  position: [number, number, number];       // 3D assembled position
  explosionVector: [number, number, number]; // direction to explode along
  dimensions: [number, number, number];     // [w, h, d] in Three.js units
  colorByStatus: Record<ComponentStatus, string>; // hex colors
}

export interface TwinSnapshot {
  id: string;
  timestamp: string;
  label: string;
  clauseId?: string;
  verdict?: string;
  componentStates: Record<string, ComponentState>;
  overallHealth: number;
}

export interface TwinEvent {
  type: 'test_start' | 'test_complete' | 'fault' | 'reset' | 'sync';
  clauseId?: string;
  componentIds?: string[];
  verdict?: string;
  measuredValue?: number | string;
  timestamp: string;
}
