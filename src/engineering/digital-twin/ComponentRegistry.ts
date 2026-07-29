import type { ComponentState } from './TwinState';

const DEFAULT_COLORS: ComponentState['colorByStatus'] = {
  normal:      '#1e3a5f',
  testing:     '#0284c7',
  warning:     '#d97706',
  failure:     '#dc2626',
  selected:    '#06b6d4',
  maintenance: '#7c3aed',
  hovered:     '#0ea5e9',
};

// ── MCCB 15-Component Registry ────────────────────────────────────────────────
// Positions and dimensions in Three.js units (1 unit ≈ 10mm)
// Origin at centre of the assembled MCCB body

export const MCCB_COMPONENTS: Record<string, Omit<ComponentState, 'status' | 'temperature' | 'current' | 'voltage' | 'health' | 'wear' | 'animating'>> = {
  casing: {
    id: 'casing', name: 'Moulded Casing & Frame', shortName: 'Casing',
    position: [0, 0, 0], dimensions: [8, 11, 4.5], explosionVector: [0, 0, 1],
    linkedClauseIds: ['8.3.3.2', '8.3.3.5'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#1e293b', testing: '#1d4ed8' },
  },
  handle: {
    id: 'handle', name: 'Operating Handle', shortName: 'Handle',
    position: [0, 6.2, 2.4], dimensions: [2.2, 1.4, 1.2], explosionVector: [0, 2, 2],
    linkedClauseIds: ['8.3.3.6', '8.3.3.9'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#374151' },
  },
  operatingMechanism: {
    id: 'operatingMechanism', name: 'Operating Mechanism & Toggle', shortName: 'Op. Mech.',
    position: [0, 3.5, 1.2], dimensions: [3, 3, 2], explosionVector: [0, 1, 1.5],
    linkedClauseIds: ['8.3.3.3', '8.3.3.8', '8.3.4'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#334155' },
  },
  terminalR: {
    id: 'terminalR', name: 'Line Terminal — Phase R', shortName: 'Term R',
    position: [-2.8, 7.2, 0], dimensions: [1.4, 2.2, 1.4], explosionVector: [-1.5, 2.5, 0],
    linkedClauseIds: ['8.3.3.6', '8.3.3.2'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#92400e', failure: '#dc2626' },
  },
  terminalS: {
    id: 'terminalS', name: 'Line Terminal — Phase S', shortName: 'Term S',
    position: [0, 7.2, 0], dimensions: [1.4, 2.2, 1.4], explosionVector: [0, 2.5, 0],
    linkedClauseIds: ['8.3.3.6', '8.3.3.2'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#92400e', failure: '#dc2626' },
  },
  terminalT: {
    id: 'terminalT', name: 'Line Terminal — Phase T', shortName: 'Term T',
    position: [2.8, 7.2, 0], dimensions: [1.4, 2.2, 1.4], explosionVector: [1.5, 2.5, 0],
    linkedClauseIds: ['8.3.3.6', '8.3.3.2'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#92400e', failure: '#dc2626' },
  },
  loadTerminalR: {
    id: 'loadTerminalR', name: 'Load Terminal — Phase R', shortName: 'Load R',
    position: [-2.8, -7.2, 0], dimensions: [1.4, 2.2, 1.4], explosionVector: [-1.5, -2.5, 0],
    linkedClauseIds: ['8.3.3.6'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#92400e', failure: '#dc2626' },
  },
  loadTerminalS: {
    id: 'loadTerminalS', name: 'Load Terminal — Phase S', shortName: 'Load S',
    position: [0, -7.2, 0], dimensions: [1.4, 2.2, 1.4], explosionVector: [0, -2.5, 0],
    linkedClauseIds: ['8.3.3.6'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#92400e', failure: '#dc2626' },
  },
  loadTerminalT: {
    id: 'loadTerminalT', name: 'Load Terminal — Phase T', shortName: 'Load T',
    position: [2.8, -7.2, 0], dimensions: [1.4, 2.2, 1.4], explosionVector: [1.5, -2.5, 0],
    linkedClauseIds: ['8.3.3.6'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#92400e', failure: '#dc2626' },
  },
  mainContacts: {
    id: 'mainContacts', name: 'Main Breaking Contacts', shortName: 'Contacts',
    position: [0, 0.5, 0.5], dimensions: [5, 2, 1.5], explosionVector: [0, 0, 2],
    linkedClauseIds: ['8.3.3.4', '8.3.4', '8.3.5', '8.3.3.9'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#713f12', testing: '#d97706', failure: '#dc2626' },
  },
  arcChute: {
    id: 'arcChute', name: 'Arc Chute & De-ionization Plates', shortName: 'Arc Chute',
    position: [0, 2.2, 0], dimensions: [5.5, 2.5, 2.5], explosionVector: [0, 1.5, 2.5],
    linkedClauseIds: ['8.3.3.2', '8.3.3.4', '8.3.4', '8.3.5'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#1c1917', testing: '#7c2d12', failure: '#dc2626' },
  },
  thermalElement: {
    id: 'thermalElement', name: 'Bimetal Thermal Release Element', shortName: 'Bimetal',
    position: [0, -1.5, 0.8], dimensions: [4.5, 2.5, 0.8], explosionVector: [0, -1.5, 2],
    linkedClauseIds: ['8.3.3.1.3a', '8.3.3.7'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#7c2d12', testing: '#ea580c', failure: '#dc2626', warning: '#f97316' },
  },
  magneticRelease: {
    id: 'magneticRelease', name: 'Magnetic Instantaneous Release', shortName: 'Mag. Release',
    position: [0, -3.2, 0.5], dimensions: [4, 1.8, 1.2], explosionVector: [0, -2, 1.5],
    linkedClauseIds: ['8.3.3.1.2', '8.3.4', '8.3.5'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#1e3a5f', testing: '#1d4ed8' },
  },
  tripUnit: {
    id: 'tripUnit', name: 'Electronic Trip Unit & Protection Module', shortName: 'Trip Unit',
    position: [3.5, -0.5, 1.8], dimensions: [1.2, 5, 1.8], explosionVector: [2.5, 0, 2],
    linkedClauseIds: ['8.3.3.1', '8.3.3.7'],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#064e3b', testing: '#059669' },
  },
  testButton: {
    id: 'testButton', name: 'Integrated Test Function Button', shortName: 'Test Btn',
    position: [3.5, 4.5, 2.2], dimensions: [0.9, 0.9, 0.6], explosionVector: [2.5, 2, 2],
    linkedClauseIds: [],
    colorByStatus: { ...DEFAULT_COLORS, normal: '#ef4444' },
  },
};

export const COMPONENT_IDS = Object.keys(MCCB_COMPONENTS);
