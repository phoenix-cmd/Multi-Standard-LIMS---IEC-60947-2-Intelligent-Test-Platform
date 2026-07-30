// ── Single Source of Truth: Clause → Component Map ────────────────────────────
// Used by both TwinEngine (state mutations) and HighlightEngine (visual highlights).
// Any changes to clause coverage MUST be made here only.
//
// Clause IDs follow IS/IEC 60947-2:2003 Section 8.3 numbering.

export const CLAUSE_COMPONENT_MAP: Record<string, string[]> = {
  '8.3.3.1':    ['thermalElement', 'magneticRelease', 'tripUnit', 'operatingMechanism'],
  '8.3.3.1.2':  ['magneticRelease', 'tripUnit', 'mainContacts'],
  '8.3.3.1.3a': ['thermalElement', 'tripUnit'],
  '8.3.3.2':    ['casing', 'arcChute', 'terminalR', 'terminalS', 'terminalT', 'phaseBarriers'],
  '8.3.3.3':    ['operatingMechanism', 'undervoltageRelease', 'shuntRelease', 'mainContacts'],
  '8.3.3.4':    ['mainContacts', 'arcChute', 'thermalElement', 'magneticRelease'],
  '8.3.3.5':    ['casing', 'arcChute', 'terminalR', 'terminalS', 'terminalT', 'phaseBarriers'],
  '8.3.3.6':    ['terminalR', 'terminalS', 'terminalT', 'loadTerminalR', 'loadTerminalS', 'loadTerminalT', 'handle'],
  '8.3.3.7':    ['thermalElement', 'tripUnit', 'operatingMechanism'],
  '8.3.3.8':    ['undervoltageRelease', 'shuntRelease', 'operatingMechanism'],
  '8.3.3.9':    ['handle', 'mainContacts', 'positionIndicator'],
  '8.3.4':      ['mainContacts', 'arcChute', 'operatingMechanism', 'magneticRelease'],
  '8.3.5':      ['mainContacts', 'arcChute', 'tripUnit', 'magneticRelease'],
};

export const CLAUSE_IDS = Object.keys(CLAUSE_COMPONENT_MAP);
