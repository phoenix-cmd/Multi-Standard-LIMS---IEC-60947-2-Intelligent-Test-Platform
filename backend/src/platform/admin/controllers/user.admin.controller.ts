import { Response } from 'express';
import { AuthenticatedRequest } from '../../../gateway/middleware/auth.middleware.js';
import { UserService } from '../services/user.service.js';
import { UserValidator } from '../validators/user.validator.js';
import { AuditContext } from '../services/audit.admin.service.js';

export class UserAdminController {
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

  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search, department, role, status, limit, offset } = req.query;
      const result = await UserService.getUsers({
        search: search as string,
        department: department as string,
        role: role as string,
        status: status as string,
        limit: limit ? parseInt(limit as string, 10) : 20,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.json(user);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validation = UserValidator.validateCreateUser(req.body);
      if (!validation.valid) {
        res.status(400).json({ error: 'Validation Error', details: validation.errors });
        return;
      }

      const ctx = UserAdminController.extractAuditContext(req);
      const result = await UserService.createUser(req.body, ctx);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validation = UserValidator.validateUpdateUser(req.body);
      if (!validation.valid) {
        res.status(400).json({ error: 'Validation Error', details: validation.errors });
        return;
      }

      const ctx = UserAdminController.extractAuditContext(req);
      const user = await UserService.updateUser(req.params.id, req.body, ctx);
      res.json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async setActivation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { isDeactivated } = req.body;
      const ctx = UserAdminController.extractAuditContext(req);
      const result = await UserService.setActivation(req.params.id, Boolean(isDeactivated), ctx);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async softDeleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ctx = UserAdminController.extractAuditContext(req);
      const result = await UserService.softDeleteUser(req.params.id, ctx);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async restoreUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ctx = UserAdminController.extractAuditContext(req);
      const result = await UserService.restoreUser(req.params.id, ctx);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async lockUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ctx = UserAdminController.extractAuditContext(req);
      const result = await UserService.setLockout(req.params.id, true, ctx);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async unlockUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ctx = UserAdminController.extractAuditContext(req);
      const result = await UserService.setLockout(req.params.id, false, ctx);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async resetPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ctx = UserAdminController.extractAuditContext(req);
      const result = await UserService.resetPassword(req.params.id, req.body, ctx);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async bulkAction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validation = UserValidator.validateBulkAction(req.body);
      if (!validation.valid) {
        res.status(400).json({ error: 'Validation Error', details: validation.errors });
        return;
      }

      const ctx = UserAdminController.extractAuditContext(req);
      const result = await UserService.executeBulkAction(req.body, ctx);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
