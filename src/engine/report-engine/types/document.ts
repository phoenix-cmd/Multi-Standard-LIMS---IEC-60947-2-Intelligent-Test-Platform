import type { Verdict, Sample, Equipment, User, AuditEvent } from '../../../types';

export interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  tableHeaderBg: string;
  tableHeaderColor: string;
  borderColor: string;
  fontFamily: string;
  accentColor: string;
  logoText: string;
  compactPadding: boolean;
}

export interface CrossRefEntry {
  id: string;
  type: 'table' | 'figure' | 'equation' | 'clause' | 'appendix';
  label: string;      // e.g. "Table 3.1"
  title: string;      // e.g. "Calibration Equipment List"
  pageNo?: number;
}

export type CrossRefMap = Record<string, CrossRefEntry>;

export interface ValidationError {
  code: string;
  severity: 'error' | 'warning';
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  canExport: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ReportDocumentData {
  sample: Sample;
  equipmentList: Equipment[];
  users: User[];
  auditLog: AuditEvent[];
  generatedAt: string;
  revision: number;
  hash: string;
  themeId: string;
}

export interface TOCItem {
  id: string;
  title: string;
  level: number;
  sectionId: string;
  pageNumber?: number;
}
