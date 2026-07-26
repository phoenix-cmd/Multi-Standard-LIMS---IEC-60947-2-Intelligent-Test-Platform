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

export function createGatewayRouter(): Router {
  const router = Router();

  // Health & Admin Telemetry
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
  router.post('/samples', authMiddleware, authorize(['sample:create']), SamplesController.create);
  router.put('/samples/:id/lifecycle', authMiddleware, authorize(['sample:edit']), SamplesController.updateLifecycle);

  // Equipment Routes
  router.get('/equipment', authMiddleware, EquipmentController.getAll);
  router.get('/equipment/:id', authMiddleware, EquipmentController.getById);

  // Reports Routes
  router.get('/reports', authMiddleware, ReportsController.getAll);
  router.post('/reports/:id/sign', authMiddleware, authorize(['report:sign']), ReportsController.signReport);

  // Audit Routes
  router.get('/audit', authMiddleware, authorize(['audit:view']), AuditController.getAll);

  // Notifications Routes
  router.get('/notifications', authMiddleware, NotificationsController.getAll);
  router.put('/notifications/:id/read', authMiddleware, NotificationsController.markRead);

  return router;
}
