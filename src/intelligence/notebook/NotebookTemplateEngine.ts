import type {
  NotebookTemplate,
  NotebookBlock,
  NotebookTemplateId,
  TextBlockContent,
  HeadingBlockContent,
  MeasurementBlockContent,
  ChecklistBlockContent,
  FormulaBlockContent,
  CodeBlockContent,
  TableBlockContent,
} from '../../domain/notebook/NotebookTypes';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function textBlock(markdown: string): Omit<NotebookBlock, 'id' | 'createdAt' | 'updatedAt' | 'author'> {
  return { type: 'text', content: { markdown } as TextBlockContent };
}

function headingBlock(text: string, level: 1 | 2 | 3 = 2): Omit<NotebookBlock, 'id' | 'createdAt' | 'updatedAt' | 'author'> {
  return { type: 'heading', content: { text, level } as HeadingBlockContent };
}

function measurementBlock(headers: string[], rows: { values: (string | number)[] }[]): Omit<NotebookBlock, 'id' | 'createdAt' | 'updatedAt' | 'author'> {
  return { type: 'measurement', content: { headers, rows } as MeasurementBlockContent };
}

function checklistBlock(items: { text: string; checked: boolean }[]): Omit<NotebookBlock, 'id' | 'createdAt' | 'updatedAt' | 'author'> {
  return {
    type: 'checklist',
    content: {
      items: items.map((it) => ({ id: uid(), text: it.text, checked: it.checked })),
    } as ChecklistBlockContent,
  };
}

function formulaBlock(expression: string, description?: string): Omit<NotebookBlock, 'id' | 'createdAt' | 'updatedAt' | 'author'> {
  return { type: 'formula', content: { expression, description } as FormulaBlockContent };
}

function codeBlock(language: string, code: string): Omit<NotebookBlock, 'id' | 'createdAt' | 'updatedAt' | 'author'> {
  return { type: 'code', content: { language, code } as CodeBlockContent };
}

function tableBlock(headers: string[], rows: string[][]): Omit<NotebookBlock, 'id' | 'createdAt' | 'updatedAt' | 'author'> {
  return { type: 'table', content: { headers, rows } as TableBlockContent };
}

// ── Template Definitions ──────────────────────────────────────

export const NOTEBOOK_TEMPLATES: NotebookTemplate[] = [
  {
    id: 'temperature-rise',
    name: 'Temperature Rise Test',
    description: 'IEC 60947-2 Clause 8.3.4 Temperature Rise Test documentation.',
    icon: '🌡️',
    context: 'sample',
    tags: ['temperature', 'iec-60947-2', 'clause-8.3.4'],
    defaultPages: [
      {
        title: 'Test Objective & Setup',
        blocks: [
          headingBlock('Temperature Rise Test — IEC 60947-2 Cl. 8.3.4', 1),
          textBlock('**Objective:** Verify that the temperature rise of the MCCB terminals and internal components does not exceed the limits defined in IEC 60947-2 Table 2.'),
          headingBlock('Test Equipment'),
          checklistBlock([
            { text: 'Thermocouple Type K — Calibration Valid', checked: false },
            { text: 'Short Circuit Test Bench — Calibration Valid', checked: false },
            { text: 'Data Logger — Configured', checked: false },
            { text: 'Ambient Temperature Recorded', checked: false },
          ]),
        ],
      },
      {
        title: 'Measurements',
        blocks: [
          headingBlock('Temperature Measurements'),
          measurementBlock(
            ['Point', 'T_ambient (°C)', 'T_measured (°C)', 'ΔT (K)', 'Limit (K)', 'Status'],
            [
              { values: ['Terminal A', '', '', '', '50', ''] },
              { values: ['Terminal B', '', '', '', '50', ''] },
              { values: ['Terminal C', '', '', '', '50', ''] },
              { values: ['Coil', '', '', '', '75', ''] },
            ]
          ),
          headingBlock('Calculation', 3),
          formulaBlock('ΔT = T_measured − T_ambient', 'Temperature rise above ambient'),
        ],
      },
      {
        title: 'Conclusion',
        blocks: [
          headingBlock('Conclusion & Verdict'),
          textBlock('Based on the measurements above, the MCCB **[ PASSES / FAILS ]** the temperature rise test in accordance with IEC 60947-2 Clause 8.3.4.'),
          textBlock('**Engineer Signature:** _________________________\n\n**Date:** _________________________'),
        ],
      },
    ],
  },
  {
    id: 'dielectric',
    name: 'Dielectric Test',
    description: 'Dielectric withstand and impulse voltage test documentation.',
    icon: '⚡',
    context: 'sample',
    tags: ['dielectric', 'impulse', 'iec-60947-2'],
    defaultPages: [
      {
        title: 'Dielectric Test Setup',
        blocks: [
          headingBlock('Dielectric Withstand Test — IEC 60947-2 Cl. 8.3.3', 1),
          textBlock('**Purpose:** Verify insulation integrity between live parts and accessible conductive parts.'),
          checklistBlock([
            { text: 'HV Test Set Calibration Valid', checked: false },
            { text: 'Test voltage set to 2000 V AC / 50 Hz', checked: false },
            { text: 'Test duration: 1 minute', checked: false },
            { text: 'No flashover / no puncture observed', checked: false },
          ]),
        ],
      },
      {
        title: 'Test Results',
        blocks: [
          headingBlock('Results'),
          tableBlock(
            ['Phase', 'Applied Voltage (V)', 'Duration (s)', 'Leakage (mA)', 'Outcome'],
            [['L1-PE', '2000', '60', '', ''], ['L2-PE', '2000', '60', '', ''], ['L3-PE', '2000', '60', '', '']]
          ),
        ],
      },
    ],
  },
  {
    id: 'calibration',
    name: 'Calibration Notes',
    description: 'Equipment calibration record and uncertainty calculation.',
    icon: '📐',
    context: 'equipment',
    tags: ['calibration', 'uncertainty', 'traceability'],
    defaultPages: [
      {
        title: 'Calibration Record',
        blocks: [
          headingBlock('Equipment Calibration Record', 1),
          tableBlock(
            ['Equipment', 'Serial No.', 'Calibrated On', 'Due Date', 'Certificate No.', 'Status'],
            [['', '', '', '', '', '']]
          ),
          headingBlock('Measurement Uncertainty'),
          formulaBlock('U = k × u_c', 'Combined standard uncertainty × coverage factor (k=2 for 95% confidence)'),
        ],
      },
    ],
  },
  {
    id: 'failure-investigation',
    name: 'Failure Investigation',
    description: 'Structured failure investigation following 5-Why and Ishikawa methodology.',
    icon: '🔬',
    context: 'investigation',
    tags: ['failure', 'root-cause', '5-why', 'ishikawa'],
    defaultPages: [
      {
        title: 'Failure Description',
        blocks: [
          headingBlock('Failure Investigation Report', 1),
          textBlock('**Failure Date:**\n**Sample ID:**\n**Clause:**\n**Test Engineer:**'),
          headingBlock('Failure Description'),
          textBlock('_Describe the observed failure in detail, including measurements, deviation from expected values, and any environmental conditions._'),
        ],
      },
      {
        title: '5-Why Analysis',
        blocks: [
          headingBlock('5-Why Root Cause Analysis'),
          tableBlock(
            ['Why #', 'Question', 'Answer'],
            [['1', 'Why did the failure occur?', ''], ['2', 'Why?', ''], ['3', 'Why?', ''], ['4', 'Why?', ''], ['5', 'Root Cause:', '']]
          ),
        ],
      },
      {
        title: 'Corrective Actions',
        blocks: [
          headingBlock('Corrective & Preventive Actions'),
          tableBlock(
            ['Action', 'Owner', 'Due Date', 'Status'],
            [['', '', '', ''], ['', '', '', '']]
          ),
        ],
      },
    ],
  },
  {
    id: 'root-cause',
    name: 'Root Cause Analysis',
    description: 'Formal RCA with evidence collection and CAPA.',
    icon: '🌳',
    context: 'investigation',
    tags: ['rca', 'capa', 'corrective-action'],
    defaultPages: [
      {
        title: 'RCA Overview',
        blocks: [
          headingBlock('Root Cause Analysis', 1),
          textBlock('**Problem Statement:**\n\n**Scope:**\n\n**Investigation Team:**'),
          checklistBlock([
            { text: 'Evidence collected', checked: false },
            { text: 'Timeline established', checked: false },
            { text: 'Root cause identified', checked: false },
            { text: 'CAPA defined', checked: false },
            { text: 'CAPA verified effective', checked: false },
          ]),
        ],
      },
    ],
  },
  {
    id: 'research-experiment',
    name: 'Research Experiment',
    description: 'Free-form engineering research and experimentation log.',
    icon: '🧪',
    context: 'project',
    tags: ['research', 'experiment', 'hypothesis'],
    defaultPages: [
      {
        title: 'Hypothesis',
        blocks: [
          headingBlock('Research Experiment Log', 1),
          headingBlock('Hypothesis', 2),
          textBlock('_State your hypothesis here._'),
          headingBlock('Experiment Design', 2),
          textBlock('**Independent Variables:**\n\n**Dependent Variables:**\n\n**Controls:**'),
        ],
      },
      {
        title: 'Data Collection',
        blocks: [
          headingBlock('Observations & Data'),
          codeBlock('python', '# Data analysis script\nimport numpy as np\n\n# measurements = [...]\n'),
          headingBlock('Analysis', 3),
          textBlock('_Record your analysis and findings here._'),
        ],
      },
    ],
  },
  {
    id: 'engineering-meeting',
    name: 'Engineering Meeting',
    description: 'Meeting minutes with action items and decisions log.',
    icon: '📋',
    context: 'project',
    tags: ['meeting', 'minutes', 'decisions'],
    defaultPages: [
      {
        title: 'Meeting Minutes',
        blocks: [
          headingBlock('Engineering Meeting — Minutes', 1),
          textBlock('**Date:**\n**Attendees:**\n**Agenda:**'),
          headingBlock('Discussion Points', 2),
          textBlock('_Record key discussion points here._'),
          headingBlock('Decisions', 2),
          tableBlock(['Decision', 'Owner', 'Deadline'], [['', '', '']]),
          headingBlock('Action Items', 2),
          checklistBlock([{ text: 'Action item 1', checked: false }]),
        ],
      },
    ],
  },
  {
    id: 'short-circuit',
    name: 'Short Circuit Test',
    description: 'IEC 60947-2 short circuit making and breaking capacity test.',
    icon: '💥',
    context: 'sample',
    tags: ['short-circuit', 'ics', 'icu', 'iec-60947-2'],
    defaultPages: [
      {
        title: 'Short Circuit Test Setup',
        blocks: [
          headingBlock('Short Circuit Test — IEC 60947-2', 1),
          textBlock('**Clause:** 8.3.5 — Short-circuit making and breaking capacity\n**Rated Current (In):**\n**Rated Ics:** kA\n**Rated Icu:** kA'),
          checklistBlock([
            { text: 'Prospective short circuit current verified', checked: false },
            { text: 'Power factor within range (cos φ = 0.05–0.15)', checked: false },
            { text: 'Peak value ratio verified', checked: false },
            { text: 'Recovery voltage applied', checked: false },
          ]),
        ],
      },
      {
        title: 'Test Sequence O-t-CO',
        blocks: [
          headingBlock('Test Sequence'),
          tableBlock(
            ['Operation', 'Current (kA)', 'cos φ', 'O-t-CO', 'Result'],
            [['O', '', '', 'O', ''], ['CO', '', '', 'CO', ''], ['CO', '', '', 'CO', '']]
          ),
        ],
      },
    ],
  },
  {
    id: 'endurance',
    name: 'Endurance Test',
    description: 'Mechanical and electrical endurance test documentation.',
    icon: '🔄',
    context: 'sample',
    tags: ['endurance', 'cycles', 'mechanical', 'electrical'],
    defaultPages: [
      {
        title: 'Endurance Test Log',
        blocks: [
          headingBlock('Endurance Test — IEC 60947-2', 1),
          textBlock('**Rated Mechanical Operations:** \n**Rated Electrical Operations:**'),
          measurementBlock(
            ['Phase', 'Cycles Completed', 'Contact Resistance (mΩ)', 'Temperature Rise (K)', 'Status'],
            [{ values: ['Mechanical', '0', '', '', ''] }, { values: ['Electrical', '0', '', '', ''] }]
          ),
        ],
      },
    ],
  },
  {
    id: 'product-validation',
    name: 'Product Validation',
    description: 'Complete product validation checklist across all applicable clauses.',
    icon: '✅',
    context: 'product',
    tags: ['validation', 'type-test', 'checklist'],
    defaultPages: [
      {
        title: 'Validation Checklist',
        blocks: [
          headingBlock('Product Validation Report', 1),
          textBlock('**Product:**\n**Model:**\n**Manufacturer:**\n**Standard:** IEC 60947-2'),
          checklistBlock([
            { text: 'Clause 8.3.3 — Dielectric Tests', checked: false },
            { text: 'Clause 8.3.4 — Temperature Rise', checked: false },
            { text: 'Clause 8.3.5 — Short Circuit', checked: false },
            { text: 'Clause 8.3.6 — Endurance', checked: false },
            { text: 'Clause 8.3.7 — EMC', checked: false },
          ]),
        ],
      },
    ],
  },
];

export class NotebookTemplateEngine {
  getAll(): NotebookTemplate[] {
    return NOTEBOOK_TEMPLATES;
  }

  getById(id: NotebookTemplateId): NotebookTemplate | null {
    return NOTEBOOK_TEMPLATES.find((t) => t.id === id) ?? null;
  }

  getByContext(context: string): NotebookTemplate[] {
    return NOTEBOOK_TEMPLATES.filter((t) => t.context === context);
  }
}

export const globalNotebookTemplateEngine = new NotebookTemplateEngine();
