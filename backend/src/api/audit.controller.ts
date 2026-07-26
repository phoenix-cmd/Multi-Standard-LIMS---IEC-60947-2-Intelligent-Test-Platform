import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../gateway/middleware/auth.middleware.js';

const prisma = new PrismaClient();

export class AuditController {
  public static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 100,
      });

      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
}
