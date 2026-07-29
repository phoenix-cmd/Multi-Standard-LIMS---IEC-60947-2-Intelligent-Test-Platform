import { PrismaClient } from '@prisma/client';
import { AuditAdminService, AuditContext } from './audit.admin.service.js';
import { domainEvents } from '../domain/DomainEvents.js';

const prisma = new PrismaClient();

export class SessionService {
  /**
   * Lists active non-revoked and unexpired user sessions.
   */
  static async getActiveSessions() {
    const sessions = await prisma.userSession.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            department: true,
            userRoles: { include: { role: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      userName: s.user.name,
      userEmail: s.user.email,
      userDepartment: s.user.department,
      userRole: s.user.userRoles[0]?.role.name || 'Technician',
      deviceName: s.deviceName,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    }));
  }

  /**
   * Revokes a specific session by ID.
   */
  static async revokeSession(sessionId: string, ctx: AuditContext) {
    const session = await prisma.userSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
      include: { user: true },
    });

    await AuditAdminService.logEvent(ctx, 'SESSION_REVOKED', 'Session', sessionId, `Revoked active session for ${session.user.email}`);
    domainEvents.emitAdminEvent('SessionRevoked', sessionId, ctx.userId, { userId: session.userId });

    return { sessionId, revokedAt: session.revokedAt };
  }

  /**
   * Forces logout of a user on all devices (revokes all active sessions).
   */
  static async revokeAllUserSessions(userId: string, ctx: AuditContext) {
    const count = await prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    await AuditAdminService.logEvent(ctx, 'USER_SESSIONS_REVOKED_ALL', 'User', userId, `Revoked all ${count.count} active sessions for ${user?.email}`);
    domainEvents.emitAdminEvent('UserSessionsRevokedAll', userId, ctx.userId, { count: count.count });

    return { userId, revokedSessionsCount: count.count };
  }
}
