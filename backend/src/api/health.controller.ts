import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { KernelManifest } from '../kernel/KernelManifest.js';
import { WSServer } from '../infrastructure/messaging/WebSocketServer.js';

const prisma = new PrismaClient();

export class HealthController {
  public static async getHealth(req: Request, res: Response): Promise<void> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: 'connected',
        webSockets: WSServer.getInstance().getActiveConnectionsCount(),
      });
    } catch {
      res.status(503).json({ status: 'DOWN', database: 'disconnected' });
    }
  }

  public static async getMetrics(req: Request, res: Response): Promise<void> {
    const manifest = KernelManifest.getInstance().getManifest();
    const memory = process.memoryUsage();

    res.json({
      uptimeSeconds: process.uptime(),
      memoryUsageMB: {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      },
      webSocketConnections: WSServer.getInstance().getActiveConnectionsCount(),
      kernelServices: manifest,
    });
  }
}
