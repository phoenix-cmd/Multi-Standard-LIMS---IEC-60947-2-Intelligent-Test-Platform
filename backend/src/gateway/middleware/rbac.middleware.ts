import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';

export function authorize(requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userPerms = new Set(req.user.permissions);
    const hasPermission = requiredPermissions.every((perm) => userPerms.has(perm));

    if (!hasPermission) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions', requiredPermissions });
      return;
    }

    next();
  };
}
