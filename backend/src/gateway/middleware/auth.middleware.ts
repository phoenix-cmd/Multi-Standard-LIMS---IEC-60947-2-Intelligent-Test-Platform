import { Request, Response, NextFunction } from 'express';
import { TokenManager, TokenPayload } from '../../kernel/identity/TokenManager.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    organizationId: string;
    laboratoryId: string;
  };
  sessionId?: string;
  correlationId?: string;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  const payload = TokenManager.verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.isDeactivated) {
      res.status(401).json({ error: 'Unauthorized: Account deactivated or not found' });
      return;
    }

    const roles = user.userRoles.map((ur: any) => ur.role.name);
    const primaryRole = roles[0] || 'Technician';
    const permissions = new Set<string>();

    user.userRoles.forEach((ur: any) => {
      ur.role.rolePermissions.forEach((rp: any) => {
        permissions.add(rp.permission.code);
      });
    });

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: primaryRole,
      permissions: Array.from(permissions),
      organizationId: user.organizationId,
      laboratoryId: user.laboratoryId,
    };
    req.sessionId = payload.sessionId;

    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error verifying session' });
  }
}
