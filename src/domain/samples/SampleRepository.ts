import type { Sample } from '../../types';

export interface SampleRepository {
  findById(id: string): Promise<Sample | null>;
  findByReportNo(reportNo: string): Promise<Sample | null>;
  findAll(): Promise<Sample[]>;
  save(sample: Sample): Promise<Sample>;
  delete(id: string): Promise<boolean>;
}
