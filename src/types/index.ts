// ── Core Platform Types ──────────────────────────────────────────────────────

export type Verdict = 'PASS' | 'FAIL' | 'NA' | 'PENDING' | 'IN_PROGRESS';

// ── Standard / Plugin Types ───────────────────────────────────────────────────
export interface StandardRevision {
  version: string;      // e.g. "2020"
  label: string;        // e.g. "Ed 5.0 2020"
  publishedDate: string;
}

export interface StandardMetadata {
  id: string;           // e.g. "iec60947-2"
  name: string;
  scope: string;
  revisions: StandardRevision[];
  activeRevision: string;
  installed: boolean;
  active: boolean;
}

// ── Clause Types ─────────────────────────────────────────────────────────────
export interface ClauseDefinition {
  id: string;            // e.g. "8.3.3.1"
  title: string;
  description: string;
  category: string;
  sequence: string[];   // which sequences include this clause
}

// ── Formula Types ─────────────────────────────────────────────────────────────
export interface FormulaDefinition {
  id: string;
  label: string;
  expression: string;   // e.g. "1.45 * In"
  unit: string;
  description: string;
}

// ── Rule Types ────────────────────────────────────────────────────────────────
export type RuleOperator = 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'neq' | 'between';

export interface RuleCondition {
  parameter: string;
  operator: RuleOperator;
  value: number | [number, number]; // single or [min, max]
  unit?: string;
  formulaRef?: string;             // reference to a formula for computed value
}

export interface RuleDefinition {
  id: string;
  clauseId: string;
  label: string;
  expression: string;  // AST expression string e.g. "TripTime < 0.2 AND Current >= 1.3 * In"
  conditions: RuleCondition[];
  failMessage: string;
  passMessage: string;
  severity: 'critical' | 'major' | 'minor';
}

// ── Rule Evaluation Result ────────────────────────────────────────────────────
export interface ClauseResult {
  clauseId: string;
  clauseTitle: string;
  verdict: Verdict;
  measuredValue?: number | string;
  limitValue?: number | string;
  unit?: string;
  ruleId?: string;
  message: string;
  timestamp: string;
}

// ── Sequence / Workflow Types ─────────────────────────────────────────────────
export interface SequenceStep {
  id: string;
  label: string;
  clauseRefs: string[];
  requiredParams: string[];
  description: string;
  order: number;
}

export interface SequenceDefinition {
  id: string;             // e.g. "seq-I"
  label: string;          // "Sequence I – General Performance"
  description: string;
  steps: SequenceStep[];
}

// ── Dynamic Form Field Types ───────────────────────────────────────────────────
export type FieldType = 'number' | 'text' | 'select' | 'checkbox' | 'textarea' | 'date';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  unit?: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  formulaRef?: string;
  visibleIf?: { field: string; value: string | number | boolean };
  description?: string;
}

export interface FormSchema {
  id: string;
  stepId: string;
  title: string;
  fields: FormField[];
}

// ── Equipment Types ───────────────────────────────────────────────────────────
export type EquipmentStatus = 'Operational' | 'CalibrationDue' | 'Maintenance' | 'OutOfService' | 'Quarantined';

export interface CalibrationRecord {
  id: string;
  date: string;
  nextDue: string;
  performedBy: string;
  certificateNo: string;
  result: 'Pass' | 'Fail';
  notes?: string;
}

export interface Equipment {
  id: string;
  assetTag: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNo: string;
  category: string;
  location: string;
  status: EquipmentStatus;
  hoursUsed: number;
  lastUsedDate: string;
  purchaseDate: string;
  calibrationHistory: CalibrationRecord[];
  currentCertNo?: string;
  nextCalibrationDue: string;
  photos: string[];
  qrCode: string;
}

// ── Sample Lifecycle Types ────────────────────────────────────────────────────
export type SampleLifecycleState =
  | 'Received' | 'Accepted' | 'Inspection' | 'Waiting'
  | 'Testing' | 'Paused' | 'Completed' | 'Review'
  | 'Approved' | 'Released' | 'Archived';

export interface MCCBSpecification {
  frameSize: string;        // e.g. "250A"
  poles: 3 | 4;
  ratedCurrent: number;     // In (A)
  ratedVoltage: number;     // Ue (V)
  insulationVoltage: number; // Ui (V)
  impulsWithstand: number;  // Uimp (kV)
  shortCircuitUltimate: number;  // Icu (kA)
  shortCircuitService: number;   // Ics (kA)
  shortTimeWithstand?: number;   // Icw (kA)
  shortTimeDuration?: number;    // tw (s)
  category: 'A' | 'B';
  releaseType: 'Thermal-Magnetic' | 'Electronic' | 'Motor';
  manufacturer: string;
  model: string;
  drawingNo?: string;
}

export interface Sample {
  id: string;
  reportNo: string;         // e.g. "LAB-2026-MCCB-00892"
  receivedDate: string;
  clientName: string;
  clientRef: string;
  specification: MCCBSpecification;
  standardId: string;
  standardRevision: string;
  sequencesToRun: string[];
  lifecycleState: SampleLifecycleState;
  lifecycleHistory: { state: SampleLifecycleState; timestamp: string; user: string; notes?: string }[];
  testRuns: TestRun[];
  attachments: Attachment[];
  assignedTo: string;
}

// ── Test Run Types ────────────────────────────────────────────────────────────
export interface TestRun {
  id: string;
  sampleId: string;
  sequenceId: string;
  startedAt: string;
  completedAt?: string;
  executedBy: string;
  verdict: Verdict;
  inputs: Record<string, number | string | boolean>;
  clauseResults: ClauseResult[];
  waveformData?: WaveformSnapshot;
  replayLog: ReplayEvent[];
}

// ── Waveform / Oscillograph Types ─────────────────────────────────────────────
export interface WaveformChannel {
  id: string;
  label: string;
  unit: string;
  color: string;
  data: number[];      // sampled at consistent sampleRate
}

export interface WaveformSnapshot {
  sampleRate: number;  // samples/sec e.g. 100000
  duration: number;    // seconds
  channels: WaveformChannel[];
  peakCurrent?: number;
  arcDuration?: number;
  arcEnergy?: number;
  clearingTime?: number;
  powerFactor?: number;
}

// ── Replay Types ──────────────────────────────────────────────────────────────
export interface ReplayEvent {
  timestamp: string;
  type: 'step_start' | 'step_complete' | 'param_input' | 'rule_eval' | 'verdict' | 'override' | 'note';
  description: string;
  data?: Record<string, unknown>;
}

// ── Attachment Types ──────────────────────────────────────────────────────────
export type AttachmentType = 'photo' | 'video' | 'oscillograph' | 'csv' | 'excel' | 'pdf' | 'cad' | 'certificate' | 'other';

export interface Attachment {
  id: string;
  name: string;
  type: AttachmentType;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
}

// ── Permissions / RBAC Types ───────────────────────────────────────────────────
export type Permission =
  | 'sample:create' | 'sample:edit' | 'sample:delete' | 'sample:inspect'
  | 'test:execute' | 'test:override' | 'test:view_all'
  | 'report:generate' | 'report:sign' | 'report:approve' | 'report:export'
  | 'equipment:view' | 'equipment:edit' | 'equipment:calibrate'
  | 'standard:manage' | 'standard:install'
  | 'audit:view' | 'audit:export'
  | 'admin:users' | 'admin:settings';

export type Role = 'Administrator' | 'LabDirector' | 'LeadEngineer' | 'Technician' | 'QualityInspector' | 'Auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  signature?: string;
  department: string;
  avatarInitials: string;
}

// ── Digital Signature Types ───────────────────────────────────────────────────
export interface SignatureRecord {
  userId: string;
  userName: string;
  role: Role;
  signedAt: string;
  stage: 'Technician' | 'LeadEngineer' | 'QualityManager';
  hash: string;
  comment?: string;
}

// ── Audit Trail Types ─────────────────────────────────────────────────────────
export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress?: string;
}

// ── Notification Types ────────────────────────────────────────────────────────
export type NotificationType = 'calibration_due' | 'sign_pending' | 'test_failed' | 'sample_waiting' | 'report_approved' | 'equipment_expired';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

// ── AI Types ─────────────────────────────────────────────────────────────────
export interface DiagnosisResult {
  failureMechanism: string;
  rootCauses: { cause: string; probability: number }[];
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  correctives: string[];
  preventives: string[];
  clauseContext?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  clauseContext?: string;
}

// ── Report Template Types ─────────────────────────────────────────────────────
export type BlockType = 'header' | 'sample_info' | 'clause_table' | 'waveform_image' | 'equipment_table' | 'signature_block' | 'text' | 'spacer';

export interface ReportBlock {
  id: string;
  type: BlockType;
  order: number;
  visible: boolean;
  config?: Record<string, unknown>;
}

export interface ReportPage {
  id: string;
  pageNo: number;
  title: string;
  blocks: ReportBlock[];
}

export interface ReportTemplate {
  id: string;
  standardId: string;
  name: string;
  pages: ReportPage[];
  labName: string;
  labLogo?: string;
  accreditationNo: string;
}
