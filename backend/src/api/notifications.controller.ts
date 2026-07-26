import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../gateway/middleware/auth.middleware.js';

const prisma = new PrismaClient();

export class NotificationsController {
  public static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user!.id },
        orderBy: { timestamp: 'desc' },
      });

      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  public static async markRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    try {
      const notification = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark notification read' });
    }
  }
}
