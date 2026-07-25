// Clause → physical component highlight mapping for 3D viewer
export const CLAUSE_HIGHLIGHT_MAP: Record<string, string[]> = {
  '8.3.3.1': ['terminalR', 'terminalS', 'terminalT', 'loadTerminalR', 'loadTerminalS', 'loadTerminalT', 'thermalElement'],
  '8.3.3.2': ['casing', 'arcChute', 'terminalR', 'terminalS', 'terminalT'],
  '8.3.3.3': ['thermalElement', 'magneticRelease', 'tripUnit', 'mainContacts'],
  '8.3.4':   ['mainContacts', 'arcChute', 'magneticRelease', 'operatingMechanism'],
  '8.3.5':   ['mainContacts', 'arcChute', 'tripUnit', 'magneticRelease'],
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
    '8.3.3.1': 'Temperature Rise Test — Verifies that terminals, busbars, and handle do not exceed thermal limits at rated current.',
    '8.3.3.2': 'Dielectric Withstand — Applies 2×Ui+1000 V across insulation to verify breakdown resistance.',
    '8.3.3.3': 'Tripping Characteristics — Verifies correct overcurrent release timing at 1.05×In and 1.30×In.',
    '8.3.4':   'Ultimate Breaking Capacity (Icu) — O–t–CO sequence at maximum prospective short-circuit current.',
    '8.3.5':   'Service Breaking Capacity (Ics) — O–t–CO–t–CO sequence; breaker must remain serviceable.',
  };
  return map[clauseId] || `IEC 60947-2 Clause ${clauseId}`;
}
