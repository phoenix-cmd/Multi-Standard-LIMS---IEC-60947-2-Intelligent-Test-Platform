import { Response } from 'express';
import { AuthenticatedRequest } from '../../../gateway/middleware/auth.middleware.js';
import { AdminDashboardService } from '../services/admin.dashboard.service.js';

export class AdminDashboardController {
  static async getMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const metrics = await AdminDashboardService.getMetrics();
      res.json(metrics);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
