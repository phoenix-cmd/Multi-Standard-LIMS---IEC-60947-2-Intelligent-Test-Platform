import { PrismaClient } from '@prisma/client';
import { SystemSettingsDTO } from '../dto/settings.dto.js';
import { AuditAdminService, AuditContext } from './audit.admin.service.js';

const prisma = new PrismaClient();

const DEFAULT_SYSTEM_SETTINGS: SystemSettingsDTO = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumbers: true,
  passwordRequireSymbols: true,
  passwordExpirationDays: 90,
  passwordHistoryCount: 3,
  maxFailedAttempts: 5,
  sessionTimeoutMinutes: 30,
  jwtLifetimeHours: 8,
  maxFileUploadMB: 50,
  defaultTheme: 'dark',
  defaultStandardEdition: 'IS/IEC 60947-2:2003',
  smtpHost: 'smtp.lab-lims.internal',
  smtpPort: 587,
  smtpSender: 'notifications@netl-lims.in',
  backupSchedule: 'daily',
  notificationEmailAlerts: true,
};

export class SettingsService {
  /**
   * Retrieves system settings.
   */
  static async getSettings(): Promise<SystemSettingsDTO> {
    const record = await prisma.systemSetting.findUnique({ where: { key: 'global' } });
    if (!record) return DEFAULT_SYSTEM_SETTINGS;
    return { ...DEFAULT_SYSTEM_SETTINGS, ...(record.value as any) };
  }

  /**
   * Updates system settings.
   */
  static async updateSettings(dto: SystemSettingsDTO, ctx: AuditContext): Promise<SystemSettingsDTO> {
    const current = await this.getSettings();
    const updated = { ...current, ...dto };

    await prisma.systemSetting.upsert({
      where: { key: 'global' },
      update: { value: updated, updatedBy: ctx.userId },
      create: { key: 'global', category: 'general', value: updated, updatedBy: ctx.userId },
    });

    await AuditAdminService.logEvent(ctx, 'SETTINGS_UPDATED', 'SystemSetting', 'global', `Updated application settings`, current, updated);

    return updated;
  }
}
