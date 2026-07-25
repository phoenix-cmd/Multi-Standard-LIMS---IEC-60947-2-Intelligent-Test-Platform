import type { ScenarioTemplate, ScenarioConfig } from './ScenarioTypes';

const BASE_ENVIRONMENT = {
  temperature: 25,
  humidity: 55,
  powerAvailable: true,
  networkAvailable: true,
  emergencyPower: false,
};

const BASE_WORKING_HOURS = {
  startHour: 8,
  endHour: 17,
  daysPerWeek: 5,
  overtimeAllowed: false,
};

const SENIOR_ENG = {
  id: 'eng-01',
  name: 'Dr. Arjun Mehta',
  role: 'senior' as const,
  specializations: ['IEC 60947-2', 'Short Circuit', 'Temperature Rise'],
  availableHours: 8,
  errorRate: 0.02,
};

const JUNIOR_ENG = {
  id: 'eng-02',
  name: 'Priya Sharma',
  role: 'junior' as const,
  specializations: ['Dielectric', 'Endurance'],
  availableHours: 8,
  errorRate: 0.08,
};

const BASE_EQUIPMENT = [
  {
    id: 'eq-01',
    name: 'Short Circuit Test Bench',
    type: 'test-bench',
    failureProbability: 0.05,
    calibrationStatus: 'valid' as const,
  },
  {
    id: 'eq-02',
    name: 'Oscilloscope Tektronix',
    type: 'measurement',
    failureProbability: 0.02,
    calibrationStatus: 'valid' as const,
  },
  {
    id: 'eq-03',
    name: 'Temperature Chamber',
    type: 'environmental',
    failureProbability: 0.04,
    calibrationStatus: 'valid' as const,
  },
];

function makeConfig(
  overrides: Partial<Omit<ScenarioConfig, 'id' | 'name'>>
): Omit<ScenarioConfig, 'id' | 'name'> {
  return {
    engineers: [SENIOR_ENG, JUNIOR_ENG],
    equipment: BASE_EQUIPMENT,
    environment: { ...BASE_ENVIRONMENT },
    workingHours: { ...BASE_WORKING_HOURS },
    sampleCount: 5,
    standardId: 'IEC60947-2',
    simulationDurationHours: 8,
    failureInjectionEnabled: false,
    aiInterventionEnabled: true,
    tags: [],
    ...overrides,
  };
}

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'normal-day',
    name: 'Normal Working Day',
    description: 'Standard laboratory operation with typical sample load and full resource availability.',
    icon: '☀️',
    difficulty: 'easy',
    expectedDurationHours: 8,
    defaultConfig: makeConfig({ sampleCount: 5, tags: ['baseline'] }),
  },
  {
    id: 'heavy-workload',
    name: 'Heavy Workload',
    description: 'Peak period with 3× normal sample intake and overtime authorization.',
    icon: '📦',
    difficulty: 'medium',
    expectedDurationHours: 12,
    defaultConfig: makeConfig({
      sampleCount: 15,
      workingHours: { ...BASE_WORKING_HOURS, overtimeAllowed: true, endHour: 21 },
      tags: ['peak', 'overtime'],
    }),
  },
  {
    id: 'equipment-failure',
    name: 'Equipment Failure',
    description: 'Critical test bench failure mid-operation with repair and recovery.',
    icon: '⚠️',
    difficulty: 'medium',
    expectedDurationHours: 8,
    defaultConfig: makeConfig({
      failureInjectionEnabled: true,
      equipment: [
        { ...BASE_EQUIPMENT[0], failureProbability: 0.8, downtimeHours: 2, repairTimeHours: 3 },
        ...BASE_EQUIPMENT.slice(1),
      ],
      tags: ['failure', 'recovery'],
    }),
  },
  {
    id: 'calibration-expired',
    name: 'Calibration Expired',
    description: 'Multiple instruments with expired calibration, triggering compliance holds.',
    icon: '📅',
    difficulty: 'medium',
    expectedDurationHours: 8,
    defaultConfig: makeConfig({
      equipment: BASE_EQUIPMENT.map((e) => ({ ...e, calibrationStatus: 'expired' as const })),
      failureInjectionEnabled: true,
      tags: ['calibration', 'compliance'],
    }),
  },
  {
    id: 'power-outage',
    name: 'Power Outage',
    description: 'Mains power failure with emergency generator switchover scenario.',
    icon: '⚡',
    difficulty: 'hard',
    expectedDurationHours: 8,
    defaultConfig: makeConfig({
      environment: { ...BASE_ENVIRONMENT, powerAvailable: false, emergencyPower: true },
      failureInjectionEnabled: true,
      tags: ['power', 'emergency'],
    }),
  },
  {
    id: 'emergency-shutdown',
    name: 'Emergency Shutdown',
    description: 'Unplanned full laboratory shutdown and safe equipment power-down.',
    icon: '🚨',
    difficulty: 'hard',
    expectedDurationHours: 4,
    defaultConfig: makeConfig({
      failureInjectionEnabled: true,
      simulationDurationHours: 4,
      environment: { ...BASE_ENVIRONMENT, powerAvailable: false, emergencyPower: false },
      tags: ['emergency', 'shutdown'],
    }),
  },
  {
    id: 'mass-sample-intake',
    name: 'Mass Sample Intake',
    description: 'Sudden delivery of 25 samples from a single large client.',
    icon: '🏭',
    difficulty: 'hard',
    expectedDurationHours: 16,
    defaultConfig: makeConfig({
      sampleCount: 25,
      workingHours: { ...BASE_WORKING_HOURS, daysPerWeek: 7, overtimeAllowed: true, endHour: 22 },
      tags: ['mass-intake', 'queue'],
    }),
  },
  {
    id: 'new-engineer-training',
    name: 'New Engineer Training',
    description: 'Onboarding a trainee engineer with supervised testing and knowledge transfer.',
    icon: '🎓',
    difficulty: 'easy',
    expectedDurationHours: 8,
    defaultConfig: makeConfig({
      engineers: [
        SENIOR_ENG,
        JUNIOR_ENG,
        { id: 'eng-03', name: 'Rahul Verma', role: 'trainee', specializations: [], availableHours: 6, errorRate: 0.2 },
      ],
      sampleCount: 3,
      tags: ['training', 'supervision'],
    }),
  },
  {
    id: 'multi-lab-coordination',
    name: 'Multi-Laboratory Coordination',
    description: 'Coordinated testing split across two laboratories with shared sample handoffs.',
    icon: '🌐',
    difficulty: 'hard',
    expectedDurationHours: 10,
    defaultConfig: makeConfig({
      sampleCount: 12,
      tags: ['multi-lab', 'coordination'],
    }),
  },
  {
    id: 'audit-preparation',
    name: 'Audit Preparation',
    description: 'Pre-NABL audit readiness check with documentation, calibration, and traceability verification.',
    icon: '📋',
    difficulty: 'medium',
    expectedDurationHours: 8,
    defaultConfig: makeConfig({
      sampleCount: 6,
      aiInterventionEnabled: true,
      tags: ['audit', 'nabl', 'compliance'],
    }),
  },
];
