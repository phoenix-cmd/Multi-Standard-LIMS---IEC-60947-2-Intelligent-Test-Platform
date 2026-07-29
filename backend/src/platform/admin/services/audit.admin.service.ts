import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditContext {
  userId: string;
  userName: string;
  organizationId: string;
  laboratoryId: string;
  ipAddress: string;
  userAgent: string;
}

export class AuditAdminService {
  /**
   * Records a full audit event with before and after state diffs.
   */
  static async logEvent(
    ctx: AuditContext,
    action: string,
    resource: string,
    resourceId: string,
    details: string,
    beforeState?: Record<string, any> | null,
    afterState?: Record<string, any> | null
  ) {
    try {
      return await prisma.auditLog.create({
        data: {
          organizationId: ctx.organizationId,
          laboratoryId: ctx.laboratoryId,
          userId: ctx.userId,
          userName: ctx.userName,
          action,
          resource,
          resourceId,
          details,
          ipAddress: ctx.ipAddress || '127.0.0.1',
          userAgent: ctx.userAgent || 'Internal API',
          beforeState: beforeState ? JSON.parse(JSON.stringify(beforeState)) : undefined,
          afterState: afterState ? JSON.parse(JSON.stringify(afterState)) : undefined,
        },
      });
    } catch (err) {
      console.error('⚠️ Failed to write audit event:', err);
    }
  }

  /**
   * Retrieves audit logs with optional filters and pagination.
   */
  static async getAuditLogs(params: {
    resource?: string;
    action?: string;
    userId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    const where: any = {};

    if (params.resource) where.resource = params.resource;
    if (params.action) where.action = params.action;
    if (params.userId) where.userId = params.userId;
    if (params.search) {
      where.OR = [
        { userName: { contains: params.search, mode: 'insensitive' } },
        { action: { contains: params.search, mode: 'insensitive' } },
        { resource: { contains: params.search, mode: 'insensitive' } },
        { details: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, limit, offset };
  }
}
