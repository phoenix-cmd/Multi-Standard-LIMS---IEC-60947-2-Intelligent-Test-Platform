import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../gateway/middleware/auth.middleware.js';

const prisma = new PrismaClient();

export class EquipmentController {
  public static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const equipment = await prisma.equipment.findMany({
        where: { deletedAt: null },
        include: {
          calibrationHistory: true,
          attachments: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch equipment' });
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    try {
      const item = await prisma.equipment.findUnique({
        where: { id },
        include: {
          calibrationHistory: true,
          attachments: true,
        },
      });

      if (!item || item.deletedAt) {
        res.status(404).json({ error: 'Equipment not found' });
        return;
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch equipment item' });
    }
  }
}
