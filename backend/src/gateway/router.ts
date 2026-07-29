import { Router } from 'express';
import { AuthController } from '../api/auth.controller.js';
import { SamplesController } from '../api/samples.controller.js';
import { EquipmentController } from '../api/equipment.controller.js';
import { ReportsController } from '../api/reports.controller.js';
import { AuditController } from '../api/audit.controller.js';
import { NotificationsController } from '../api/notifications.controller.js';
import { HealthController } from '../api/health.controller.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { authorize } from './middleware/rbac.middleware.js';

import { UserAdminController } from '../platform/admin/controllers/user.admin.controller.js';
import { RoleAdminController } from '../platform/admin/controllers/role.admin.controller.js';
import { SessionAdminController } from '../platform/admin/controllers/session.admin.controller.js';
import { OrganizationAdminController } from '../platform/admin/controllers/organization.admin.controller.js';
import { SettingsAdminController } from '../platform/admin/controllers/settings.admin.controller.js';
import { AdminAuditController } from '../platform/admin/controllers/audit.admin.controller.js';
import { AdminDashboardController } from '../platform/admin/controllers/dashboard.admin.controller.js';

export function createGatewayRouter(): Router {
  const router = Router();

  // Health & System Telemetry
  router.get('/health', HealthController.getHealth);
  router.get('/ready', HealthController.getHealth);
  router.get('/live', HealthController.getHealth);
  router.get('/admin/metrics', HealthController.getMetrics);

  // Auth Routes
  router.post('/auth/login', AuthController.login);
  router.post('/auth/logout', authMiddleware, AuthController.logout);
  router.get('/auth/me', authMiddleware, AuthController.me);

  // Samples Routes
  router.get('/samples', authMiddleware, SamplesController.getAll);
  router.get('/samples/:id', authMiddleware, SamplesController.getById);
  router.post('/samples', authMiddleware, authorize(['sample.create']), SamplesController.create);
  router.put('/samples/:id/lifecycle', authMiddleware, authorize(['sample.edit']), SamplesController.updateLifecycle);

  // Equipment Routes
  router.get('/equipment', authMiddleware, EquipmentController.getAll);
  router.get('/equipment/:id', authMiddleware, EquipmentController.getById);

  // Reports Routes
  router.get('/reports', authMiddleware, ReportsController.getAll);
  router.post('/reports/:id/sign', authMiddleware, authorize(['report.sign']), ReportsController.signReport);

  // Audit Routes
  router.get('/audit', authMiddleware, authorize(['audit.view', 'admin.audit']), AuditController.getAll);

  // Notifications Routes
  router.get('/notifications', authMiddleware, NotificationsController.getAll);
  router.put('/notifications/:id/read', authMiddleware, NotificationsController.markRead);

  // ── Enterprise Administration & Identity Management Routes ─────────────────
  // Admin Dashboard
  router.get('/admin/dashboard/metrics', authMiddleware, authorize(['admin.users']), AdminDashboardController.getMetrics);

  // User Management
  router.get('/admin/users', authMiddleware, authorize(['admin.users', 'user.read']), UserAdminController.getUsers);
  router.get('/admin/users/:id', authMiddleware, authorize(['admin.users', 'user.read']), UserAdminController.getUserById);
  router.post('/admin/users', authMiddleware, authorize(['admin.users', 'user.create']), UserAdminController.createUser);
  router.patch('/admin/users/:id', authMiddleware, authorize(['admin.users', 'user.update']), UserAdminController.updateUser);
  router.delete('/admin/users/:id', authMiddleware, authorize(['admin.users', 'user.delete']), UserAdminController.softDeleteUser);
  router.post('/admin/users/:id/restore', authMiddleware, authorize(['admin.users', 'user.delete']), UserAdminController.restoreUser);
  router.post('/admin/users/:id/activation', authMiddleware, authorize(['admin.users', 'user.update']), UserAdminController.setActivation);
  router.post('/admin/users/:id/lock', authMiddleware, authorize(['admin.users', 'user.update']), UserAdminController.lockUser);
  router.post('/admin/users/:id/unlock', authMiddleware, authorize(['admin.users', 'user.update']), UserAdminController.unlockUser);
  router.post('/admin/users/:id/reset-password', authMiddleware, authorize(['admin.users', 'user.update']), UserAdminController.resetPassword);
  router.post('/admin/users/bulk', authMiddleware, authorize(['admin.users']), UserAdminController.bulkAction);

  // Role & Permission Management
  router.get('/admin/roles', authMiddleware, authorize(['admin.roles']), RoleAdminController.getRoles);
  router.post('/admin/roles', authMiddleware, authorize(['admin.roles']), RoleAdminController.createRole);
  router.patch('/admin/roles/:id', authMiddleware, authorize(['admin.roles']), RoleAdminController.updateRole);
  router.delete('/admin/roles/:id', authMiddleware, authorize(['admin.roles']), RoleAdminController.deleteRole);
  router.post('/admin/roles/:id/clone', authMiddleware, authorize(['admin.roles']), RoleAdminController.cloneRole);
  router.get('/admin/permissions', authMiddleware, authorize(['admin.roles']), RoleAdminController.getPermissions);
  router.patch('/admin/roles/:id/permissions', authMiddleware, authorize(['admin.roles']), RoleAdminController.updateRolePermissions);

  // Active Session Management
  router.get('/admin/sessions', authMiddleware, authorize(['admin.users']), SessionAdminController.getActiveSessions);
  router.delete('/admin/sessions/:id', authMiddleware, authorize(['admin.users']), SessionAdminController.revokeSession);
  router.post('/admin/sessions/logout-user/:userId', authMiddleware, authorize(['admin.users']), SessionAdminController.revokeAllUserSessions);

  // Organization & Lab Settings
  router.get('/admin/organizations', authMiddleware, authorize(['admin.settings']), OrganizationAdminController.getOrganization);
  router.patch('/admin/organizations', authMiddleware, authorize(['admin.settings']), OrganizationAdminController.updateOrganization);

  // System Configuration
  router.get('/admin/settings', authMiddleware, authorize(['admin.settings']), SettingsAdminController.getSettings);
  router.patch('/admin/settings', authMiddleware, authorize(['admin.settings']), SettingsAdminController.updateSettings);

  // Admin Audit Log
  router.get('/admin/audit', authMiddleware, authorize(['admin.audit', 'audit.view']), AdminAuditController.getAuditLogs);

  return router;
}
