import { Response } from 'express';
import { AuthenticatedRequest } from '../../../gateway/middleware/auth.middleware.js';
import { OrganizationService } from '../services/organization.service.js';
import { AuditContext } from '../services/audit.admin.service.js';

export class OrganizationAdminController {
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

  static async getOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId || 'default-org';
      const profile = await OrganizationService.getOrganization(orgId);
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId || 'default-org';
      const ctx = OrganizationAdminController.extractAuditContext(req);
      const profile = await OrganizationService.updateOrganization(orgId, req.body, ctx);
      res.json(profile);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
