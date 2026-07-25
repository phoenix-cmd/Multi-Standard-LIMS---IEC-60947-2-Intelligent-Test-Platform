import type { Equipment } from '../../types';

export interface EquipmentRepository {
  findById(id: string): Promise<Equipment | null>;
  findAll(): Promise<Equipment[]>;
  findDueForCalibration(): Promise<Equipment[]>;
  save(equipment: Equipment): Promise<Equipment>;
}
