// IS/IEC 60947-2:2003 Clause → physical component highlight mapping for 3D viewer
export const CLAUSE_HIGHLIGHT_MAP: Record<string, string[]> = {
  '8.3.3.1':   ['thermalElement', 'magneticRelease', 'tripUnit', 'operatingMechanism'],
  '8.3.3.1.2': ['magneticRelease', 'tripUnit', 'mainContacts'],
  '8.3.3.1.3': ['thermalElement', 'tripUnit', 'bimetal'],
  '8.3.3.2':   ['casing', 'arcChute', 'terminalR', 'terminalS', 'terminalT'],
  '8.3.3.3':   ['operatingMechanism', 'undervoltageRelease', 'shuntRelease', 'mainContacts'],
  '8.3.3.4':   ['mainContacts', 'arcChute', 'thermalElement', 'magneticRelease'],
  '8.3.3.5':   ['casing', 'arcChute', 'terminalR', 'terminalS', 'terminalT'],
  '8.3.3.6':   ['terminalR', 'terminalS', 'terminalT', 'loadTerminalR', 'loadTerminalS', 'loadTerminalT', 'handle'],
  '8.3.3.7':   ['thermalElement', 'tripUnit', 'operatingMechanism'],
  '8.3.3.8':   ['undervoltageRelease', 'shuntRelease', 'operatingMechanism'],
  '8.3.3.9':   ['handle', 'mainContacts', 'positionIndicator'],
  '8.3.4':     ['mainContacts', 'arcChute', 'magneticRelease', 'operatingMechanism'],
  '8.3.5':     ['mainContacts', 'arcChute', 'tripUnit', 'magneticRelease'],
};

export const STATUS_COLORS: Record<string, string> = {
  normal:      '#1e3a5f',
  testing:     '#0284c7',
  warning:     '#d97706',
  failure:     '#dc2626',
  selected:    '#06b6d4',
  maintenance: '#7c3aed',
  hovered:     '#0ea5e9',
};

export const EMISSIVE_COLORS: Record<string, string> = {
  normal:      '#000000',
  testing:     '#003366',
  warning:     '#7c3800',
  failure:     '#7f0000',
  selected:    '#004455',
  maintenance: '#3d0080',
  hovered:     '#003344',
};

export function getComponentsForClause(clauseId: string): string[] {
  return CLAUSE_HIGHLIGHT_MAP[clauseId] || [];
}

export function getClauseDescription(clauseId: string): string {
  const map: Record<string, string> = {
    '8.3.3.1':   'Tripping Limits & Characteristics — Verifies short-circuit (80%/120%) and overload (90%/110%) releases.',
    '8.3.3.2':   'Dielectric Properties — Tests 2Ui+1000V AC withstand and <= 0.5 mA isolation leakage at 1.1 Ue.',
    '8.3.3.3':   'Mechanical & Operational Performance — UV drop-out (35%-70% Vc), shunt 70% Vc at 55°C, Table 8 cycles.',
    '8.3.3.4':   'Overload Performance — Tests 12 operations at 6 In AC / 2.5 In DC at 1.05 Ue max.',
    '8.3.3.5':   'Dielectric Withstand Post Overload — Verifies leakage <= 2 mA at 1.1 Ue after overload test.',
    '8.3.3.6':   'Temperature-Rise — Verifies terminal ΔT <= 70 K and handle ΔT <= 35 K at conventional thermal current.',
    '8.3.3.7':   'Overload Release Verification — Verified at 1.45 Ir at reference temp immediately post thermal test.',
    '8.3.3.8':   'UV & Shunt Room Temp Verification — UV no-trip 70%, trip 35%; Shunt trip 70% at room temp.',
    '8.3.3.9':   'Main Contact Position Verification — Verifies contact position indicator effectiveness for isolation.',
    '8.3.4':     'Ultimate Breaking Capacity (Icu) — O–t–CO sequence at maximum prospective short-circuit current.',
    '8.3.5':     'Service Breaking Capacity (Ics) — O–t–CO–t–CO sequence; breaker must remain serviceable.',
  };
  return map[clauseId] || `IS/IEC 60947-2:2003 Clause ${clauseId}`;
}
