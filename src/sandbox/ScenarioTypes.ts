// ─────────────────────────────────────────────────────────────
// Laboratory Scenario Sandbox — Domain Types
// ─────────────────────────────────────────────────────────────

export type ScenarioTemplateId =
  | 'normal-day'
  | 'heavy-workload'
  | 'equipment-failure'
  | 'calibration-expired'
  | 'power-outage'
  | 'emergency-shutdown'
  | 'mass-sample-intake'
  | 'new-engineer-training'
  | 'multi-lab-coordination'
  | 'audit-preparation';

export type ScenarioStatus = 'draft' | 'ready' | 'running' | 'completed' | 'failed';

// ── Configuration ─────────────────────────────────────────────

export interface EngineerConfig {
  id: string;
  name: string;
  role: 'senior' | 'junior' | 'trainee';
  specializations: string[];
  availableHours: number; // per day
  errorRate: number; // 0–1
}

export interface EquipmentConfig {
  id: string;
  name: string;
  type: string;
  failureProbability: number; // 0–1
  calibrationStatus: 'valid' | 'due' | 'expired';
  downtimeHours?: number;
  repairTimeHours?: number;
}

export interface EnvironmentConfig {
  temperature: number; // °C
  humidity: number; // %
  powerAvailable: boolean;
  networkAvailable: boolean;
  emergencyPower: boolean;
}

export interface WorkingHoursConfig {
  startHour: number; // 0–23
  endHour: number; // 0–23
  daysPerWeek: number;
  overtimeAllowed: boolean;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description?: string;
  templateId?: ScenarioTemplateId;
  engineers: EngineerConfig[];
  equipment: EquipmentConfig[];
  environment: EnvironmentConfig;
  workingHours: WorkingHoursConfig;
  sampleCount: number;
  standardId: string;
  simulationDurationHours: number;
  failureInjectionEnabled: boolean;
  aiInterventionEnabled: boolean;
  tags: string[];
}

// ── Events ────────────────────────────────────────────────────

export type SimEventType =
  | 'lab-open'
  | 'lab-close'
  | 'sample-received'
  | 'test-started'
  | 'test-completed'
  | 'test-failed'
  | 'equipment-failure'
  | 'equipment-repaired'
  | 'calibration-expired'
  | 'calibration-renewed'
  | 'power-failure'
  | 'power-restored'
  | 'network-failure'
  | 'network-restored'
  | 'engineer-assigned'
  | 'engineer-unavailable'
  | 'workflow-triggered'
  | 'investigation-started'
  | 'ai-recommendation'
  | 'emergency-shutdown'
  | 'emergency-resolved'
  | 'queue-backlog'
  | 'bottleneck-detected'
  | 'scenario-complete';

export type SimEventSeverity = 'info' | 'warning' | 'error' | 'success';

export interface SimEvent {
  id: string;
  type: SimEventType;
  timestamp: string; // ISO simulated time
  wallTimestamp: string; // ISO real time
  simHour: number; // 0–N
  title: string;
  detail: string;
  severity: SimEventSeverity;
  engineerId?: string;
  equipmentId?: string;
  sampleId?: string;
  metadata?: Record<string, string | number>;
}

// ── Results ───────────────────────────────────────────────────

export interface Bottleneck {
  id: string;
  type: 'equipment' | 'engineer' | 'queue' | 'calibration' | 'power';
  description: string;
  impactHours: number;
  affectedSamples: number;
  recommendation: string;
}

export interface ResourceUtilization {
  entityId: string;
  entityName: string;
  entityType: 'engineer' | 'equipment';
  utilizationPercent: number;
  idleHours: number;
  activeHours: number;
  failureHours: number;
}

export interface ScenarioMetrics {
  totalSamples: number;
  completedSamples: number;
  failedSamples: number;
  passRate: number;
  averageTestDurationHours: number;
  averageQueueTimeHours: number;
  laboratoryUtilization: number;
  totalDowntimeHours: number;
  totalBottlenecks: number;
  aiInterventions: number;
  costEstimate: number;
  throughputPerDay: number;
}

export interface AIRecommendation {
  id: string;
  category: 'staffing' | 'equipment' | 'workflow' | 'scheduling' | 'maintenance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  rationale: string;
  expectedImprovement: string;
  implementationEffort: 'low' | 'medium' | 'high';
}

export interface ScenarioResult {
  scenarioId: string;
  completedAt: string;
  metrics: ScenarioMetrics;
  events: SimEvent[];
  bottlenecks: Bottleneck[];
  resourceUtilization: ResourceUtilization[];
  aiRecommendations: AIRecommendation[];
  executionDurationMs: number;
}

// ── Full Scenario ─────────────────────────────────────────────

export interface Scenario {
  id: string;
  config: ScenarioConfig;
  status: ScenarioStatus;
  result?: ScenarioResult;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ── Comparison ────────────────────────────────────────────────

export interface ScenarioComparisonResult {
  scenarioA: Scenario;
  scenarioB: Scenario;
  delta: {
    passRate: number;
    throughputPerDay: number;
    laboratoryUtilization: number;
    averageQueueTimeHours: number;
    totalDowntimeHours: number;
    costEstimate: number;
    bottlenecks: number;
  };
  winner: 'A' | 'B' | 'tie';
  aiSummary: string;
}

// ── Templates ─────────────────────────────────────────────────

export interface ScenarioTemplate {
  id: ScenarioTemplateId;
  name: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedDurationHours: number;
  defaultConfig: Omit<ScenarioConfig, 'id' | 'name'>;
}

// ── Playback ──────────────────────────────────────────────────

export interface PlaybackState {
  scenarioId: string;
  currentIndex: number;
  currentEvent: SimEvent | null;
  isPlaying: boolean;
  speed: 1 | 2 | 4 | 8;
  elapsedSimHours: number;
}
