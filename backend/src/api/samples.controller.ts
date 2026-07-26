import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../gateway/middleware/auth.middleware.js';
import { WSServer } from '../infrastructure/messaging/WebSocketServer.js';

const prisma = new PrismaClient();

export class SamplesController {
  public static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const samples = await prisma.sample.findMany({
        where: { deletedAt: null },
        include: {
          specification: true,
          lifecycleHistory: true,
          testRuns: true,
          attachments: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = samples.map((s: any) => ({
        id: s.id,
        reportNo: s.reportNo,
        receivedDate: s.receivedDate,
        clientName: s.clientName,
        clientRef: s.clientRef,
        standardId: s.standardId,
        standardRevision: s.standardRevision,
        lifecycleState: s.lifecycleState,
        assignedTo: s.assignedToUserId,
        specification: s.specification,
        lifecycleHistory: s.lifecycleHistory,
        testRuns: s.testRuns,
        attachments: s.attachments,
        sequencesToRun: ['seq-I', 'seq-II', 'seq-III'],
      }));

      res.json(formatted);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch samples' });
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    try {
      const sample = await prisma.sample.findUnique({
        where: { id },
        include: {
          specification: true,
          lifecycleHistory: true,
          testRuns: true,
          attachments: true,
        },
      });

      if (!sample || sample.deletedAt) {
        res.status(404).json({ error: 'Sample not found' });
        return;
      }

      res.json(sample);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sample' });
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { clientName, clientRef, standardId, standardRevision, specification } = req.body;

    if (!clientName || !specification) {
      res.status(400).json({ error: 'Client name and specification are required' });
      return;
    }

    try {
      const year = new Date().getFullYear();
      const reportNo = `LAB-${year}-MCCB-${String(Math.floor(Math.random() * 90000) + 10000)}`;

      const sample = await prisma.sample.create({
        data: {
          organizationId: req.user!.organizationId,
          laboratoryId: req.user!.laboratoryId,
          reportNo,
          receivedDate: new Date().toISOString().split('T')[0],
          clientName,
          clientRef: clientRef || 'PO-DEFAULT',
          standardId: standardId || 'iec60947-2',
          standardRevision: standardRevision || '2016',
          lifecycleState: 'Received',
          assignedToUserId: req.user!.id,
          specification: {
            create: {
              frameSize: specification.frameSize || '250A',
              poles: specification.poles || 3,
              ratedCurrent: specification.ratedCurrent || 100,
              ratedVoltage: specification.ratedVoltage || 415,
              insulationVoltage: specification.insulationVoltage || 690,
              impulsWithstand: specification.impulsWithstand || 8,
              shortCircuitUltimate: specification.shortCircuitUltimate || 36,
              shortCircuitService: specification.shortCircuitService || 36,
              category: specification.category || 'A',
              releaseType: specification.releaseType || 'Thermal-Magnetic',
              manufacturer: specification.manufacturer || 'Generic',
              model: specification.model || 'MCCB-X',
              drawingNo: specification.drawingNo || 'DWG-001',
            },
          },
          lifecycleHistory: {
            create: {
              state: 'Received',
              user: req.user!.name,
              notes: 'Sample received and registered in LIMS',
            },
          },
        },
        include: {
          specification: true,
          lifecycleHistory: true,
          testRuns: true,
          attachments: true,
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          organizationId: req.user!.organizationId,
          laboratoryId: req.user!.laboratoryId,
          userId: req.user!.id,
          userName: req.user!.name,
          action: 'sample:create',
          resource: 'Sample',
          resourceId: sample.id,
          details: `Registered sample ${sample.reportNo}`,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: (req.headers['user-agent'] as string) || 'Browser',
        },
      });

      // Broadcast WebSocket event
      WSServer.getInstance().broadcast({
        type: 'sample:created',
        payload: { sampleId: sample.id, reportNo: sample.reportNo },
        timestamp: new Date().toISOString(),
      });

      res.status(201).json(sample);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create sample' });
    }
  }

  public static async updateLifecycle(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const { state, notes } = req.body;

    try {
      const sample = await prisma.sample.update({
        where: { id },
        data: {
          lifecycleState: state,
          lifecycleHistory: {
            create: {
              state,
              user: req.user!.name,
              notes,
            },
          },
        },
        include: {
          specification: true,
          lifecycleHistory: true,
          testRuns: true,
          attachments: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          organizationId: req.user!.organizationId,
          laboratoryId: req.user!.laboratoryId,
          userId: req.user!.id,
          userName: req.user!.name,
          action: 'sample:edit',
          resource: 'Sample',
          resourceId: sample.id,
          details: `Lifecycle state updated to ${state}`,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: (req.headers['user-agent'] as string) || 'Browser',
        },
      });

      WSServer.getInstance().broadcast({
        type: 'sample:lifecycle_updated',
        payload: { sampleId: sample.id, state },
        timestamp: new Date().toISOString(),
      });

      res.json(sample);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update sample lifecycle' });
    }
  }
}
