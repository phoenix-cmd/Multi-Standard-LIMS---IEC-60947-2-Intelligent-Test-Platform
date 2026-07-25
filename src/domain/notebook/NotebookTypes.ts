// ─────────────────────────────────────────────────────────────
// Digital Engineering Notebook — Domain Types
// ─────────────────────────────────────────────────────────────

export type NotebookBlockType =
  | 'text'
  | 'heading'
  | 'image'
  | 'checklist'
  | 'formula'
  | 'code'
  | 'measurement'
  | 'oscillograph'
  | 'chart'
  | 'table'
  | 'report-link'
  | 'investigation-link'
  | 'thread-link'
  | 'kg-link'
  | 'component-snapshot'
  | 'ai-conversation'
  | 'sketch';

// ── Block content variants ──────────────────────────────────────

export interface TextBlockContent {
  markdown: string;
}

export interface HeadingBlockContent {
  text: string;
  level: 1 | 2 | 3;
}

export interface ImageBlockContent {
  dataUrl?: string;
  url?: string;
  caption?: string;
  alt?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ChecklistBlockContent {
  items: ChecklistItem[];
}

export interface FormulaBlockContent {
  expression: string;
  description?: string;
  result?: string;
  unit?: string;
}

export interface CodeBlockContent {
  language: string;
  code: string;
}

export interface MeasurementRow {
  values: (string | number)[];
}

export interface MeasurementBlockContent {
  headers: string[];
  rows: MeasurementRow[];
  unit?: string;
  notes?: string;
}

export interface OscillographBlockContent {
  snapshotId: string;
  description?: string;
  capturedAt?: string;
}

export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export interface ChartBlockContent {
  chartType: 'line' | 'bar' | 'scatter';
  title?: string;
  xLabel?: string;
  yLabel?: string;
  series: { name: string; data: ChartDataPoint[]; color?: string }[];
}

export interface TableBlockContent {
  headers: string[];
  rows: string[][];
}

export interface LinkBlockContent {
  refId: string;
  title: string;
  subtitle?: string;
  refType: 'report' | 'investigation' | 'thread' | 'kg-node' | 'component' | 'clause';
  url?: string;
}

export interface AIMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  model?: string;
}

export interface AIConversationBlockContent {
  messages: AIMessage[];
  summary?: string;
}

export interface SketchBlockContent {
  svgData: string;
  description?: string;
}

export type NotebookBlockContent =
  | TextBlockContent
  | HeadingBlockContent
  | ImageBlockContent
  | ChecklistBlockContent
  | FormulaBlockContent
  | CodeBlockContent
  | MeasurementBlockContent
  | OscillographBlockContent
  | ChartBlockContent
  | TableBlockContent
  | LinkBlockContent
  | AIConversationBlockContent
  | SketchBlockContent;

// ── Notebook Block ────────────────────────────────────────────

export interface NotebookBlock {
  id: string;
  type: NotebookBlockType;
  content: NotebookBlockContent;
  createdAt: string;
  updatedAt: string;
  author: string;
  metadata?: Record<string, string>;
}

// ── Page Versioning ───────────────────────────────────────────

export interface NotebookPageSnapshot {
  title: string;
  blocks: NotebookBlock[];
}

export interface NotebookPageVersion {
  version: number;
  snapshot: NotebookPageSnapshot;
  savedAt: string;
  savedBy: string;
  changeNote?: string;
}

export type NotebookPageStatus = 'draft' | 'active' | 'archived';

export interface NotebookPage {
  id: string;
  notebookId: string;
  title: string;
  blocks: NotebookBlock[];
  tags: string[];
  status: NotebookPageStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
  history: NotebookPageVersion[];
}

// ── Linked Artifacts ──────────────────────────────────────────

export type ArtifactType =
  | 'sample'
  | 'report'
  | 'investigation'
  | 'equipment'
  | 'workflow'
  | 'thread'
  | 'clause'
  | 'formula'
  | 'ontology-node';

export interface LinkedArtifact {
  id: string;
  type: ArtifactType;
  title: string;
  subtitle?: string;
  linkedAt: string;
  linkedBy?: string;
}

// ── Timeline ──────────────────────────────────────────────────

export interface NotebookTimelineEvent {
  id: string;
  action: string;
  detail: string;
  actor: string;
  timestamp: string;
  pageId?: string;
  icon?: string;
}

// ── Notebook ──────────────────────────────────────────────────

export type NotebookContext =
  | 'sample'
  | 'investigation'
  | 'product'
  | 'equipment'
  | 'engineer'
  | 'project'
  | 'standard';

export interface Notebook {
  id: string;
  title: string;
  description?: string;
  context: NotebookContext;
  contextId?: string;
  pages: NotebookPage[];
  linkedArtifacts: LinkedArtifact[];
  timeline: NotebookTimelineEvent[];
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

// ── Templates ─────────────────────────────────────────────────

export type NotebookTemplateId =
  | 'temperature-rise'
  | 'dielectric'
  | 'endurance'
  | 'short-circuit'
  | 'calibration'
  | 'failure-investigation'
  | 'product-validation'
  | 'research-experiment'
  | 'engineering-meeting'
  | 'root-cause';

export interface NotebookTemplate {
  id: NotebookTemplateId;
  name: string;
  description: string;
  icon: string;
  context: NotebookContext;
  tags: string[];
  defaultPages: {
    title: string;
    blocks: Omit<NotebookBlock, 'id' | 'createdAt' | 'updatedAt' | 'author'>[];
  }[];
}

// ── Search ────────────────────────────────────────────────────

export interface NotebookSearchResult {
  notebookId: string;
  notebookTitle: string;
  pageId: string;
  pageTitle: string;
  blockId?: string;
  blockType?: NotebookBlockType;
  excerpt: string;
  score: number;
}
