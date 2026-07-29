import { Response } from 'express';
import { AuthenticatedRequest } from '../../../gateway/middleware/auth.middleware.js';
import { RoleService } from '../services/role.service.js';
import { PermissionService } from '../services/permission.service.js';
import { RoleValidator } from '../validators/role.validator.js';
import { AuditContext } from '../services/audit.admin.service.js';

export class RoleAdminController {
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

  static async getRoles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const roles = await RoleService.getRoles();
      res.json({ roles });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async createRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validation = RoleValidator.validateCreateRole(req.body);
      if (!validation.valid) {
        res.status(400).json({ error: 'Validation Error', details: validation.errors });
        return;
      }

      const ctx = RoleAdminController.extractAuditContext(req);
      const role = await RoleService.createRole(req.body, ctx);
      res.status(201).json(role);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async updateRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ctx = RoleAdminController.extractAuditContext(req);
      const role = await RoleService.updateRole(req.params.id, req.body, ctx);
      res.json(role);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async deleteRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ctx = RoleAdminController.extractAuditContext(req);
      const role = await RoleService.deleteRole(req.params.id, ctx);
      res.json(role);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async cloneRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ctx = RoleAdminController.extractAuditContext(req);
      const role = await RoleService.cloneRole(req.params.id, req.body, ctx);
      res.status(201).json(role);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getPermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const permissions = await PermissionService.getAllPermissions();
      res.json({ permissions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateRolePermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { permissionCodes } = req.body;
      const ctx = RoleAdminController.extractAuditContext(req);
      const result = await RoleService.updateRolePermissions(req.params.id, permissionCodes || [], ctx);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
