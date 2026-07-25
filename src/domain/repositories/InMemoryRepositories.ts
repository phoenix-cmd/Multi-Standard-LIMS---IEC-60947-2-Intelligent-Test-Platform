import type { Sample, Equipment } from '../../types';
import type { SampleRepository } from '../samples/SampleRepository';
import type { EquipmentRepository } from '../equipment/EquipmentRepository';
import { SAMPLES, EQUIPMENT } from '../../mock/enterpriseInitialData';

export class InMemorySampleRepository implements SampleRepository {
  private _data: Map<string, Sample> = new Map();

  constructor() {
    SAMPLES.forEach((s) => this._data.set(s.id, { ...s }));
  }

  async findById(id: string): Promise<Sample | null> {
    return this._data.get(id) ?? null;
  }

  async findByReportNo(reportNo: string): Promise<Sample | null> {
    for (const sample of this._data.values()) {
      if (sample.reportNo === reportNo) return sample;
    }
    return null;
  }

  async findAll(): Promise<Sample[]> {
    return Array.from(this._data.values());
  }

  async save(sample: Sample): Promise<Sample> {
    this._data.set(sample.id, { ...sample });
    return sample;
  }

  async delete(id: string): Promise<boolean> {
    return this._data.delete(id);
  }
}

export class InMemoryEquipmentRepository implements EquipmentRepository {
  private _data: Map<string, Equipment> = new Map();

  constructor() {
    EQUIPMENT.forEach((eq) => this._data.set(eq.id, { ...eq }));
  }

  async findById(id: string): Promise<Equipment | null> {
    return this._data.get(id) ?? null;
  }

  async findAll(): Promise<Equipment[]> {
    return Array.from(this._data.values());
  }

  async findDueForCalibration(): Promise<Equipment[]> {
    const now = new Date();
    return Array.from(this._data.values()).filter((e) => new Date(e.nextCalibrationDue) <= now);
  }

  async save(equipment: Equipment): Promise<Equipment> {
    this._data.set(equipment.id, { ...equipment });
    return equipment;
  }
}

export const globalSampleRepository = new InMemorySampleRepository();
export const globalEquipmentRepository = new InMemoryEquipmentRepository();
