import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../gateway/middleware/auth.middleware.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class ReportsController {
  public static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const reports = await prisma.report.findMany({
        where: { deletedAt: null },
        include: {
          sample: true,
          signatures: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  }

  public static async signReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = req.params.id as string;
    const { stage, comment } = req.body;

    try {
      const report = await prisma.report.findUnique({
        where: { id },
        include: { sample: true },
      });

      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      // Compute Canonical JSON SHA-256 Hash
      const canonicalData = JSON.stringify({
        reportNo: report.reportNo,
        title: report.title,
        sampleId: report.sampleId,
        stage: stage || 'Technician',
        signedAt: new Date().toISOString(),
      });
      const hash = crypto.createHash('sha256').update(canonicalData).digest('hex');

      const signature = await prisma.digitalSignature.create({
        data: {
          reportId: report.id,
          userId: req.user!.id,
          userName: req.user!.name,
          userRole: req.user!.role,
          stage: stage || 'LeadEngineer',
          signedAt: new Date(),
          contentHash: hash,
          comment: comment || 'Signed and approved report.',
          ipAddress: req.ip || '127.0.0.1',
        },
      });

      const updatedReport = await prisma.report.update({
        where: { id: report.id },
        data: {
          approvalStage: 'LeadEngineer_Approved',
          status: 'Signed',
        },
        include: { signatures: true },
      });

      res.json({ report: updatedReport, signature });
    } catch (error) {
      res.status(500).json({ error: 'Failed to sign report' });
    }
  }
}
