import { Response } from 'express';
import { AuthenticatedRequest } from '../../../gateway/middleware/auth.middleware.js';
import { SessionService } from '../services/session.service.js';
import { AuditContext } from '../services/audit.admin.service.js';

export class SessionAdminController {
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

  static async getActiveSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sessions = await SessionService.getActiveSessions();
      res.json({ sessions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async revokeSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ctx = SessionAdminController.extractAuditContext(req);
      const result = await SessionService.revokeSession(req.params.id, ctx);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async revokeAllUserSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ctx = SessionAdminController.extractAuditContext(req);
      const result = await SessionService.revokeAllUserSessions(req.params.userId, ctx);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
