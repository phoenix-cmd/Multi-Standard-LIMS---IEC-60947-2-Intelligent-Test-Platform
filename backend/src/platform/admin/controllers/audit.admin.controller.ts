import { Response } from 'express';
import { AuthenticatedRequest } from '../../../gateway/middleware/auth.middleware.js';
import { AuditAdminService } from '../services/audit.admin.service.js';

export class AdminAuditController {
  static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { resource, action, userId, search, limit, offset } = req.query;
      const result = await AuditAdminService.getAuditLogs({
        resource: resource as string,
        action: action as string,
        userId: userId as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
