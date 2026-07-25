export type BlockType =
  | 'title'
  | 'table'
  | 'formula'
  | 'image'
  | 'evidence'
  | 'signature'
  | 'manifest'
  | 'paragraph';

export interface ReportBlockConfig {
  id: string;
  type: BlockType;
  visibleIf?: string; // e.g. "hasWaveform == true"
  props: Record<string, any>;
}

export interface ReportSectionDSL {
  id: string;
  title: string;
  order: number;
  visibleIf?: string;
  blocks: ReportBlockConfig[];
}

export interface ReportTemplateDSL {
  id: string;
  name: string;
  version: string;
  standardId: string;
  sections: ReportSectionDSL[];
}

export interface EvidenceItem {
  id: string;
  type: 'oscillograph' | 'certificate' | 'photo' | 'formula';
  label: string;
  referenceCode: string;
  checksum?: string;
}

export interface FormulaTraceability {
  formulaId: string;
  sourceClause: string;
  variables: Record<string, number | string>;
  expression: string;
  substitution: string;
  result: string;
  tolerance: string;
  verdict: 'PASS' | 'FAIL' | 'NA';
  evidenceRefs: EvidenceItem[];
}

export interface DigitalManifestEntry {
  filename: string;
  type: string;
  timestamp: string;
  sizeBytes: number;
  sha256Checksum: string;
}
