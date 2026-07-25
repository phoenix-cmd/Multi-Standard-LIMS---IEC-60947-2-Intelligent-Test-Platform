export type CaseStatus = 'open' | 'in_progress' | 'review' | 'approved' | 'archived';

export interface EvidenceItem {
  id: string;
  type: 'measurement' | 'waveform' | 'photo' | 'equipment_log' | 'formula' | '3d_snapshot';
  title: string;
  description: string;
  clauseId?: string;
  componentId?: string;
  equipmentId?: string;
  measuredValue?: number | string;
  limitValue?: number | string;
  unit?: string;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  author: string;
  isAI: boolean;
  title: string;
  details: string;
  linkedEvidenceId?: string;
}

export interface InvestigationCase {
  id: string;
  title: string;
  sampleId: string;
  reportNo: string;
  clauseId: string;
  status: CaseStatus;
  leadEngineer: string;
  assignedEngineers: string[];
  createdAt: string;
  updatedAt: string;
  evidence: EvidenceItem[];
  timeline: TimelineEvent[];
  rootCauses: { cause: string; probability: number; rationale: string }[];
  correctiveActions: string[];
  preventiveActions: string[];
  whiteboardNotes: { id: string; text: string; x: number; y: number; color: string }[];
}
