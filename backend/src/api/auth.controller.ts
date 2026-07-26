import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PasswordHasher } from '../kernel/identity/PasswordHasher.js';
import { TokenManager } from '../kernel/identity/TokenManager.js';
import { AuthenticatedRequest } from '../gateway/middleware/auth.middleware.js';

const prisma = new PrismaClient();

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      if (user.isDeactivated) {
        res.status(403).json({ error: 'Account has been deactivated' });
        return;
      }

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        res.status(423).json({ error: 'Account temporarily locked due to failed login attempts. Try again later.' });
        return;
      }

      const isValid = await PasswordHasher.verify(password, user.passwordHash);

      if (!isValid) {
        const failedAttempts = user.failedAttempts + 1;
        const lockedUntil = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts, lockedUntil },
        });

        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Reset failed attempts on success
      await prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: 0, lockedUntil: null },
      });

      const session = await prisma.userSession.create({
        data: {
          userId: user.id,
          tokenHash: `token-${Date.now()}-${Math.random()}`,
          deviceName: req.headers['user-agent'] || 'Browser',
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Browser',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const tokenPayload = {
        userId: user.id,
        sessionId: session.id,
        organizationId: user.organizationId,
        laboratoryId: user.laboratoryId,
      };

      const accessToken = TokenManager.generateAccessToken(tokenPayload);
      const refreshToken = TokenManager.generateRefreshToken(tokenPayload);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const roles = user.userRoles.map((ur: any) => ur.role.name);
      const primaryRole = roles[0] || 'Technician';
      const permissions = new Set<string>();

      user.userRoles.forEach((ur: any) => {
        ur.role.rolePermissions.forEach((rp: any) => permissions.add(rp.permission.code));
      });

      // Audit log entry
      await prisma.auditLog.create({
        data: {
          organizationId: user.organizationId,
          laboratoryId: user.laboratoryId,
          userId: user.id,
          userName: user.name,
          action: 'auth:login',
          resource: 'UserSession',
          resourceId: session.id,
          details: `User ${user.email} logged in successfully`,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Browser',
        },
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: primaryRole,
          department: user.department,
          avatarInitials: user.avatarInitials,
          permissions: Array.from(permissions),
        },
        token: accessToken,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error during login' });
    }
  }

  public static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    res.json({ user: req.user });
  }

  public static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (req.sessionId) {
      await prisma.userSession.update({
        where: { id: req.sessionId },
        data: { revokedAt: new Date() },
      }).catch(() => null);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  }
}
