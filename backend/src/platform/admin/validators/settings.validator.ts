import { SystemSettingsDTO } from '../dto/settings.dto.js';

export class SettingsValidator {
  static validateSettings(dto: Partial<SystemSettingsDTO>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (dto.passwordMinLength !== undefined && (dto.passwordMinLength < 6 || dto.passwordMinLength > 64)) {
      errors.push('Password min length must be between 6 and 64.');
    }
    if (dto.sessionTimeoutMinutes !== undefined && (dto.sessionTimeoutMinutes < 5 || dto.sessionTimeoutMinutes > 1440)) {
      errors.push('Session timeout must be between 5 and 1440 minutes.');
    }
    if (dto.jwtLifetimeHours !== undefined && (dto.jwtLifetimeHours < 1 || dto.jwtLifetimeHours > 720)) {
      errors.push('JWT lifetime must be between 1 and 720 hours.');
    }

    return { valid: errors.length === 0, errors };
  }
}
