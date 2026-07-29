import { Response } from 'express';
import { AuthenticatedRequest } from '../../../gateway/middleware/auth.middleware.js';
import { SettingsService } from '../services/settings.service.js';
import { SettingsValidator } from '../validators/settings.validator.js';
import { AuditContext } from '../services/audit.admin.service.js';

export class SettingsAdminController {
  private static extractAuditContext(req: AuthenticatedRequest): AuditContext {
    return {
      userId: req.user?.id || 'sys-admin',
      userName: req.user?.name || 'Administrator',
      organizationId: req.user?.organizationId || 'default-org',
      laboratoryId: req.user?.laboratoryId || 'default-lab',
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
    };
  }

  static async getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const settings = await SettingsService.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validation = SettingsValidator.validateSettings(req.body);
      if (!validation.valid) {
        res.status(400).json({ error: 'Validation Error', details: validation.errors });
        return;
      }

      const ctx = SettingsAdminController.extractAuditContext(req);
      const settings = await SettingsService.updateSettings(req.body, ctx);
      res.json(settings);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
