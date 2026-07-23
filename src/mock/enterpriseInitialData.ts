import type {
  StandardMetadata, Sample, Equipment, User, AuditEvent,
  Notification, TestRun, ClauseResult, Attachment, FormSchema
} from '../types';
import { StreamSimulator } from '../engine/drivers/StreamSimulator';

// ── Users ─────────────────────────────────────────────────────────────────────
export const USERS: User[] = [
  {
    id: 'u1', name: 'Dr. Arjun Menon', email: 'arjun.menon@lab.in', role: 'LabDirector',
    department: 'Testing & Certification', avatarInitials: 'AM',
    permissions: ['sample:create','sample:edit','sample:delete','sample:inspect','test:execute','test:override','test:view_all','report:generate','report:sign','report:approve','report:export','equipment:view','equipment:edit','equipment:calibrate','standard:manage','standard:install','audit:view','audit:export','admin:users','admin:settings'],
  },
  {
    id: 'u2', name: 'Priya Sharma', email: 'priya.sharma@lab.in', role: 'LeadEngineer',
    department: 'HV Testing', avatarInitials: 'PS',
    permissions: ['sample:create','sample:edit','sample:inspect','test:execute','test:override','report:generate','report:sign','equipment:view','equipment:calibrate','audit:view'],
  },
  {
    id: 'u3', name: 'Rahul Verma', email: 'rahul.verma@lab.in', role: 'Technician',
    department: 'LV Switchgear', avatarInitials: 'RV',
    permissions: ['sample:inspect','test:execute','report:generate','equipment:view'],
  },
  {
    id: 'u4', name: 'Sunita Krishnan', email: 'sunita@lab.in', role: 'QualityInspector',
    department: 'Quality Assurance', avatarInitials: 'SK',
    permissions: ['test:view_all','report:approve','report:export','audit:view','audit:export'],
  },
];

export const CURRENT_USER = USERS[1]; // Logged in as LeadEngineer

// ── Standards ─────────────────────────────────────────────────────────────────
export const STANDARDS: StandardMetadata[] = [
  {
    id: 'iec60947-2', name: 'IEC 60947-2', installed: true, active: true,
    scope: 'Moulded-Case Circuit Breakers (MCCBs)',
    activeRevision: '2016',
    revisions: [
      { version: '2003', label: 'Ed 4.0 (2003)', publishedDate: '2003-06-01' },
      { version: '2016', label: 'Ed 5.0 (2016)', publishedDate: '2016-10-01' },
      { version: '2020', label: 'Ed 5.1 (2020 AMD)', publishedDate: '2020-03-01' },
    ],
  },
  {
    id: 'iec60898-1', name: 'IEC 60898-1', installed: false, active: false,
    scope: 'Circuit Breakers for Overcurrent Protection in Households',
    activeRevision: '2015',
    revisions: [{ version: '2015', label: 'Ed 2.1 (2015)', publishedDate: '2015-09-01' }],
  },
  {
    id: 'iec61439-1', name: 'IEC 61439-1', installed: false, active: false,
    scope: 'Low-Voltage Switchgear and Controlgear Assemblies',
    activeRevision: '2011',
    revisions: [{ version: '2011', label: 'Ed 2.0 (2011)', publishedDate: '2011-08-01' }],
  },
  {
    id: 'ul489', name: 'UL 489', installed: false, active: false,
    scope: 'Molded-Case Circuit Breakers (USA/ANSI)',
    activeRevision: '2016',
    revisions: [{ version: '2016', label: '11th Edition (2016)', publishedDate: '2016-01-01' }],
  },
];

// ── Equipment ─────────────────────────────────────────────────────────────────
export const EQUIPMENT: Equipment[] = [
  {
    id: 'eq1', assetTag: 'LAB-EQ-001', name: 'Short-Circuit Test Station', model: 'STS-630',
    manufacturer: 'Schneider Test Systems', serialNo: 'STS630-2021-0084', category: 'High-Power Source',
    location: 'HV Lab Bay 1', status: 'Operational', hoursUsed: 3420, lastUsedDate: '2026-07-22',
    purchaseDate: '2021-03-15', nextCalibrationDue: '2026-09-01',
    currentCertNo: 'NABL-STS-2025-4721', photos: [], qrCode: 'LAB-EQ-001',
    calibrationHistory: [
      { id: 'c1', date: '2025-09-01', nextDue: '2026-09-01', performedBy: 'NABL Lab', certificateNo: 'NABL-STS-2025-4721', result: 'Pass', notes: 'Within spec, ±0.8% current accuracy' },
      { id: 'c2', date: '2024-09-01', nextDue: '2025-09-01', performedBy: 'NABL Lab', certificateNo: 'NABL-STS-2024-3812', result: 'Pass' },
    ],
  },
  {
    id: 'eq2', assetTag: 'LAB-EQ-002', name: 'Digital Storage Oscilloscope', model: 'DPO7354C',
    manufacturer: 'Tektronix', serialNo: 'TEK7354-2022-1103', category: 'Measurement',
    location: 'HV Lab Bay 1', status: 'Operational', hoursUsed: 1820, lastUsedDate: '2026-07-22',
    purchaseDate: '2022-07-10', nextCalibrationDue: '2026-12-01',
    currentCertNo: 'NABL-OSC-2025-9021', photos: [], qrCode: 'LAB-EQ-002',
    calibrationHistory: [
      { id: 'c3', date: '2025-12-01', nextDue: '2026-12-01', performedBy: 'Tektronix Service', certificateNo: 'NABL-OSC-2025-9021', result: 'Pass' },
    ],
  },
  {
    id: 'eq3', assetTag: 'LAB-EQ-003', name: 'Primary Current Injection Set', model: 'PCIS-1200',
    manufacturer: 'Omicron', serialNo: 'OMCR-PCIS-2020-0345', category: 'Calibration',
    location: 'Calibration Lab', status: 'CalibrationDue', hoursUsed: 5100, lastUsedDate: '2026-06-30',
    purchaseDate: '2020-01-20', nextCalibrationDue: '2026-07-28',
    currentCertNo: 'NABL-PCJ-2025-1132', photos: [], qrCode: 'LAB-EQ-003',
    calibrationHistory: [
      { id: 'c4', date: '2025-07-28', nextDue: '2026-07-28', performedBy: 'NABL Lab', certificateNo: 'NABL-PCJ-2025-1132', result: 'Pass' },
    ],
  },
  {
    id: 'eq4', assetTag: 'LAB-EQ-004', name: 'High-Voltage AC Test Set', model: 'HVT-5000',
    manufacturer: 'Haefely', serialNo: 'HAE-5000-2023-0091', category: 'Dielectric',
    location: 'HV Lab Bay 2', status: 'Operational', hoursUsed: 890, lastUsedDate: '2026-07-20',
    purchaseDate: '2023-05-05', nextCalibrationDue: '2027-05-01',
    currentCertNo: 'NABL-HVT-2026-7721', photos: [], qrCode: 'LAB-EQ-004',
    calibrationHistory: [
      { id: 'c5', date: '2026-05-01', nextDue: '2027-05-01', performedBy: 'NABL Lab', certificateNo: 'NABL-HVT-2026-7721', result: 'Pass' },
    ],
  },
];

// ── Sample Data ───────────────────────────────────────────────────────────────
const waveformSC = StreamSimulator.generateShortCircuitSnapshot(50);

const clauseResultsSeqII: ClauseResult[] = [
  { clauseId: '8.3.3.2', clauseTitle: 'Dielectric Withstand (Post Ics)', verdict: 'PASS', measuredValue: 2500, limitValue: 2500, unit: 'V', message: 'No flashover or puncture at 2500V for 60s.', timestamp: '2026-07-20T10:35:00Z' },
  { clauseId: '8.3.3.3', clauseTitle: 'Tripping Characteristics Verification', verdict: 'PASS', measuredValue: 8.2, limitValue: 15, unit: 's', message: 'Trip at 1.30×In within allowed band.', timestamp: '2026-07-20T11:10:00Z' },
  { clauseId: '8.3.5', clauseTitle: 'Service Short-Circuit Breaking (Ics)', verdict: 'PASS', measuredValue: 50, limitValue: 50, unit: 'kA', message: 'O–CO–CO sequence completed. Post-test checks passed.', timestamp: '2026-07-20T09:55:00Z' },
];

const clauseResultsSeqI: ClauseResult[] = [
  { clauseId: '8.3.3.1', clauseTitle: 'Temperature Rise at In', verdict: 'PASS', measuredValue: 58.4, limitValue: 70, unit: 'K', message: 'Terminal ΔT = 58.4 K ≤ 70 K limit.', timestamp: '2026-07-19T15:30:00Z' },
  { clauseId: '8.3.3.2', clauseTitle: 'Dielectric Withstand (Initial)', verdict: 'PASS', measuredValue: 2500, limitValue: 2500, unit: 'V', message: 'Passed initial 2500V 1-min dielectric.', timestamp: '2026-07-19T16:00:00Z' },
  { clauseId: '8.3.3.3', clauseTitle: 'Tripping Characteristics', verdict: 'PASS', measuredValue: 9.1, limitValue: 15, unit: 's', message: 'Trip at 1.30×In = 9.1s within limits.', timestamp: '2026-07-19T17:05:00Z' },
];

export const SAMPLES: Sample[] = [
  {
    id: 's1',
    reportNo: 'LAB-2026-MCCB-00892',
    receivedDate: '2026-07-18',
    clientName: 'Havells India Ltd.',
    clientRef: 'HVL-TEST-2026-0441',
    specification: {
      frameSize: '250A', poles: 3, ratedCurrent: 250, ratedVoltage: 415,
      insulationVoltage: 750, impulsWithstand: 8, shortCircuitUltimate: 50,
      shortCircuitService: 50, shortTimeDuration: 0.1, category: 'B',
      releaseType: 'Electronic', manufacturer: 'Havells India Ltd.', model: 'HAVELLS-EB250-3P',
      drawingNo: 'HVL-EB250-DRW-002',
    },
    standardId: 'iec60947-2', standardRevision: '2016',
    sequencesToRun: ['seq-I', 'seq-II', 'seq-III'],
    lifecycleState: 'Completed',
    lifecycleHistory: [
      { state: 'Received', timestamp: '2026-07-18T09:00:00Z', user: 'Rahul Verma' },
      { state: 'Accepted', timestamp: '2026-07-18T10:30:00Z', user: 'Dr. Arjun Menon' },
      { state: 'Inspection', timestamp: '2026-07-18T11:00:00Z', user: 'Priya Sharma' },
      { state: 'Waiting', timestamp: '2026-07-18T12:00:00Z', user: 'Priya Sharma' },
      { state: 'Testing', timestamp: '2026-07-19T09:00:00Z', user: 'Priya Sharma' },
      { state: 'Completed', timestamp: '2026-07-20T16:30:00Z', user: 'Priya Sharma' },
    ],
    assignedTo: 'u2',
    testRuns: [
      {
        id: 'tr1', sampleId: 's1', sequenceId: 'seq-I',
        startedAt: '2026-07-19T09:00:00Z', completedAt: '2026-07-19T17:30:00Z',
        executedBy: 'Priya Sharma', verdict: 'PASS',
        inputs: { In: 250, Ue: 415, Ui: 750, dT_terminal: 58.4, dT_handle: 22, dielectric_V: 2500, tripTime_105: 'NT', tripTime_130: 9.1 },
        clauseResults: clauseResultsSeqI, waveformData: undefined, replayLog: [],
      },
      {
        id: 'tr2', sampleId: 's1', sequenceId: 'seq-II',
        startedAt: '2026-07-20T09:00:00Z', completedAt: '2026-07-20T16:00:00Z',
        executedBy: 'Priya Sharma', verdict: 'PASS',
        inputs: { In: 250, Ics: 50, Ue: 415, peakCurrent: waveformSC.peakCurrent!, arcDuration: waveformSC.arcDuration!, arcEnergy: waveformSC.arcEnergy! },
        clauseResults: clauseResultsSeqII, waveformData: waveformSC, replayLog: [],
      },
    ],
    attachments: [
      { id: 'a1', name: 'Sample_Photo_Front.jpg', type: 'photo', size: 2400000, uploadedAt: '2026-07-18T11:15:00Z', uploadedBy: 'Priya Sharma' },
      { id: 'a2', name: 'Waveform_SeqII_ShortCircuit.csv', type: 'csv', size: 450000, uploadedAt: '2026-07-20T16:10:00Z', uploadedBy: 'Priya Sharma' },
      { id: 'a3', name: 'CalibrationCert_STS630.pdf', type: 'certificate', size: 1200000, uploadedAt: '2026-07-19T08:50:00Z', uploadedBy: 'Rahul Verma' },
    ],
  },
  {
    id: 's2', reportNo: 'LAB-2026-MCCB-00893', receivedDate: '2026-07-21',
    clientName: 'Legrand India Pvt. Ltd.', clientRef: 'LGR-IND-2026-0112',
    specification: {
      frameSize: '100A', poles: 4, ratedCurrent: 100, ratedVoltage: 415,
      insulationVoltage: 690, impulsWithstand: 6, shortCircuitUltimate: 25,
      shortCircuitService: 25, category: 'A', releaseType: 'Thermal-Magnetic',
      manufacturer: 'Legrand India', model: 'LGR-DMX-100N-4P', drawingNo: 'LGR-100N-DRW-008',
    },
    standardId: 'iec60947-2', standardRevision: '2016',
    sequencesToRun: ['seq-I', 'seq-II'],
    lifecycleState: 'Testing',
    lifecycleHistory: [
      { state: 'Received', timestamp: '2026-07-21T09:00:00Z', user: 'Rahul Verma' },
      { state: 'Accepted', timestamp: '2026-07-21T10:00:00Z', user: 'Dr. Arjun Menon' },
      { state: 'Inspection', timestamp: '2026-07-21T10:30:00Z', user: 'Rahul Verma' },
      { state: 'Waiting', timestamp: '2026-07-21T14:00:00Z', user: 'Rahul Verma' },
      { state: 'Testing', timestamp: '2026-07-22T09:00:00Z', user: 'Priya Sharma' },
    ],
    assignedTo: 'u3',
    testRuns: [],
    attachments: [
      { id: 'a4', name: 'Sample_Receipt_LGR.pdf', type: 'pdf', size: 520000, uploadedAt: '2026-07-21T09:05:00Z', uploadedBy: 'Rahul Verma' },
    ],
  },
  {
    id: 's3', reportNo: 'LAB-2026-MCCB-00891', receivedDate: '2026-07-10',
    clientName: 'ABB India Ltd.', clientRef: 'ABB-IND-2026-QC-0089',
    specification: {
      frameSize: '630A', poles: 3, ratedCurrent: 630, ratedVoltage: 415,
      insulationVoltage: 1000, impulsWithstand: 12, shortCircuitUltimate: 85,
      shortCircuitService: 50, shortTimeDuration: 0.05, category: 'B',
      releaseType: 'Electronic', manufacturer: 'ABB India', model: 'SACE-T6N-630-3P',
    },
    standardId: 'iec60947-2', standardRevision: '2016',
    sequencesToRun: ['seq-I', 'seq-II', 'seq-III', 'seq-IV'],
    lifecycleState: 'Approved',
    lifecycleHistory: [
      { state: 'Received', timestamp: '2026-07-10T09:00:00Z', user: 'Rahul Verma' },
      { state: 'Accepted', timestamp: '2026-07-10T10:00:00Z', user: 'Dr. Arjun Menon' },
      { state: 'Inspection', timestamp: '2026-07-10T11:00:00Z', user: 'Priya Sharma' },
      { state: 'Waiting', timestamp: '2026-07-10T14:00:00Z', user: 'Priya Sharma' },
      { state: 'Testing', timestamp: '2026-07-11T09:00:00Z', user: 'Priya Sharma' },
      { state: 'Completed', timestamp: '2026-07-14T17:00:00Z', user: 'Priya Sharma' },
      { state: 'Review', timestamp: '2026-07-15T09:00:00Z', user: 'Sunita Krishnan' },
      { state: 'Approved', timestamp: '2026-07-16T14:00:00Z', user: 'Dr. Arjun Menon' },
    ],
    assignedTo: 'u2',
    testRuns: [],
    attachments: [],
  },
];

// ── Notifications ─────────────────────────────────────────────────────────────
export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'calibration_due', title: 'Calibration Due', message: 'Primary Current Injection Set (LAB-EQ-003) calibration expires in 5 days.', timestamp: '2026-07-23T06:00:00Z', read: false },
  { id: 'n2', type: 'sign_pending', title: 'Signature Required', message: 'Report LAB-2026-MCCB-00892 is awaiting your signature as Lead Engineer.', timestamp: '2026-07-22T17:30:00Z', read: false },
  { id: 'n3', type: 'sample_waiting', title: 'Sample Waiting', message: 'LGR-DMX-100N-4P (LAB-2026-MCCB-00893) is ready to begin Sequence I testing.', timestamp: '2026-07-22T09:00:00Z', read: true },
  { id: 'n4', type: 'report_approved', title: 'Report Approved', message: 'Report LAB-2026-MCCB-00891 (ABB T6N 630A) approved by Dr. Arjun Menon.', timestamp: '2026-07-16T14:05:00Z', read: true },
];

// ── Audit Events ──────────────────────────────────────────────────────────────
export const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'ae1', timestamp: '2026-07-22T09:15:00Z', userId: 'u2', userName: 'Priya Sharma', action: 'test:execute', resource: 'TestRun', resourceId: 'tr2', details: 'Executed Sequence II (Ics 50 kA) for sample LAB-2026-MCCB-00892. Verdict: PASS.', ipAddress: '192.168.1.102' },
  { id: 'ae2', timestamp: '2026-07-21T11:00:00Z', userId: 'u1', userName: 'Dr. Arjun Menon', action: 'standard:install', resource: 'Standard', resourceId: 'iec60947-2', details: 'Activated IEC 60947-2 Ed 5.0 (2016) as primary standard.', ipAddress: '192.168.1.100' },
  { id: 'ae3', timestamp: '2026-07-20T16:30:00Z', userId: 'u2', userName: 'Priya Sharma', action: 'sample:edit', resource: 'Sample', resourceId: 's1', details: 'Lifecycle transitioned: Testing → Completed for LAB-2026-MCCB-00892.', ipAddress: '192.168.1.102' },
  { id: 'ae4', timestamp: '2026-07-16T14:00:00Z', userId: 'u1', userName: 'Dr. Arjun Menon', action: 'report:approve', resource: 'Sample', resourceId: 's3', details: 'Report LAB-2026-MCCB-00891 approved. Lifecycle → Approved.', ipAddress: '192.168.1.100' },
  { id: 'ae5', timestamp: '2026-07-18T09:00:00Z', userId: 'u3', userName: 'Rahul Verma', action: 'sample:create', resource: 'Sample', resourceId: 's1', details: 'New sample LAB-2026-MCCB-00892 registered — Havells EB250.', ipAddress: '192.168.1.105' },
];

// ── Form Schemas (Sequence I) ─────────────────────────────────────────────────
export const FORM_SCHEMAS: FormSchema[] = [
  {
    id: 'fs-seq-i-step1', stepId: 'seq-i-s1', title: 'General Specimen Information',
    fields: [
      { id: 'manufacturer', label: 'Manufacturer', type: 'text', required: true, placeholder: 'e.g. Havells India Ltd.' },
      { id: 'model', label: 'Model / Type Designation', type: 'text', required: true, placeholder: 'e.g. HAVELLS-EB250-3P' },
      { id: 'In', label: 'Rated Current (In)', type: 'number', unit: 'A', required: true, min: 1, max: 1600 },
      { id: 'Ue', label: 'Rated Operational Voltage (Ue)', type: 'number', unit: 'V', required: true, min: 230, max: 1000 },
      { id: 'Ui', label: 'Rated Insulation Voltage (Ui)', type: 'number', unit: 'V', required: true, min: 230, max: 1500 },
      { id: 'poles', label: 'Number of Poles', type: 'select', options: ['3', '4'], required: true },
      { id: 'releaseType', label: 'Release Type', type: 'select', options: ['Thermal-Magnetic', 'Electronic', 'Motor'], required: true },
      { id: 'category', label: 'Category', type: 'select', options: ['A', 'B'], required: true, description: 'Category B supports Icw short-time withstand.' },
    ],
  },
  {
    id: 'fs-seq-i-step2', stepId: 'seq-i-s2', title: 'Temperature Rise Test Data (Cl. 8.3.3.1)',
    fields: [
      { id: 'In_applied', label: 'Applied Test Current', type: 'number', unit: 'A', required: true, description: '= Rated current In' },
      { id: 'T_ambient', label: 'Ambient Temperature', type: 'number', unit: '°C', required: true, min: 10, max: 40 },
      { id: 'dT_terminal_R', label: 'Terminal R Temperature Rise (ΔT)', type: 'number', unit: 'K', required: true },
      { id: 'dT_terminal_S', label: 'Terminal S Temperature Rise (ΔT)', type: 'number', unit: 'K', required: true },
      { id: 'dT_terminal_T', label: 'Terminal T Temperature Rise (ΔT)', type: 'number', unit: 'K', required: true },
      { id: 'dT_handle', label: 'Operating Handle Temperature Rise (ΔT)', type: 'number', unit: 'K', required: true },
      { id: 'test_duration', label: 'Test Duration', type: 'number', unit: 'min', required: true, min: 60 },
    ],
  },
  {
    id: 'fs-seq-i-step3', stepId: 'seq-i-s3', title: 'Dielectric Withstand Test (Cl. 8.3.3.2)',
    fields: [
      { id: 'dielectric_V', label: 'Applied Test Voltage', type: 'number', unit: 'V', required: true, formulaRef: '2 * Ui + 1000', description: 'Typically 2 × Ui + 1000 V (min 2500 V)' },
      { id: 'dielectric_duration', label: 'Test Duration', type: 'number', unit: 's', required: true, min: 60 },
      { id: 'flashover', label: 'Flashover or Puncture Observed?', type: 'select', options: ['No', 'Yes'], required: true },
      { id: 'leakage_current', label: 'Leakage Current', type: 'number', unit: 'mA', required: true, description: 'Must be < 5 mA' },
    ],
  },
  {
    id: 'fs-seq-i-step4', stepId: 'seq-i-s4', title: 'Tripping Characteristic Test (Cl. 8.3.3.3)',
    fields: [
      { id: 'I_105', label: 'Applied Current at 1.05×In', type: 'number', unit: 'A', required: true, formulaRef: '1.05 * In' },
      { id: 'tripOccurred_105', label: 'Trip at 1.05×In?', type: 'select', options: ['No Trip (PASS)', 'Tripped (FAIL)'], required: true },
      { id: 'I_130', label: 'Applied Current at 1.30×In', type: 'number', unit: 'A', required: true, formulaRef: '1.30 * In' },
      { id: 'tripTime_130', label: 'Trip Time at 1.30×In', type: 'number', unit: 's', required: true },
      { id: 'tripLimit_min', label: 'Required Minimum Trip Time', type: 'number', unit: 's', required: false, description: 'Per manufacturer time-current curve' },
      { id: 'tripLimit_max', label: 'Required Maximum Trip Time', type: 'number', unit: 's', required: true },
    ],
  },
];
