import type { Equipment } from '../../../types';

export interface EquipmentValidationResult {
  valid: boolean;
  reason?: string;
  code?: 'EXPIRED_CALIBRATION' | 'OUT_OF_SERVICE' | 'MAINTENANCE' | 'QUARANTINED' | 'OK';
}

export class EquipmentGuard {
  static validateForTestRun(equipment: Equipment): EquipmentValidationResult {
    if (equipment.status === 'OutOfService') {
      return { valid: false, reason: `Equipment ${equipment.assetTag} (${equipment.name}) is OUT OF SERVICE.`, code: 'OUT_OF_SERVICE' };
    }

    if (equipment.status === 'Maintenance') {
      return { valid: false, reason: `Equipment ${equipment.assetTag} (${equipment.name}) is currently undergoing MAINTENANCE.`, code: 'MAINTENANCE' };
    }

    if (equipment.status === 'Quarantined') {
      return { valid: false, reason: `Equipment ${equipment.assetTag} (${equipment.name}) is QUARANTINED due to quality audit failure.`, code: 'QUARANTINED' };
    }

    const dueTime = new Date(equipment.nextCalibrationDue).getTime();
    const now = Date.now();

    if (dueTime < now) {
      return {
        valid: false,
        reason: `Equipment ${equipment.assetTag} calibration expired on ${equipment.nextCalibrationDue}. Testing blocked until re-calibrated by accredited NABL body.`,
        code: 'EXPIRED_CALIBRATION',
      };
    }

    return { valid: true, code: 'OK' };
  }
}
