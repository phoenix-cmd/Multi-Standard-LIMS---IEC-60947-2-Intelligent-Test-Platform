import { PrismaClient } from '@prisma/client';
import { PERMISSION_CATALOG } from '../domain/RBACEngine.js';

const prisma = new PrismaClient();

export class PermissionService {
  /**
   * Synchronizes permission catalog with database table and returns all permissions.
   */
  static async getAllPermissions() {
    for (const p of PERMISSION_CATALOG) {
      await prisma.permission.upsert({
        where: { code: p.code },
        update: { description: p.description },
        create: { code: p.code, description: p.description },
      });
    }

    const dbPermissions = await prisma.permission.findMany({
      orderBy: { code: 'asc' },
    });

    return dbPermissions.map((dbP) => {
      const catalogEntry = PERMISSION_CATALOG.find((c) => c.code === dbP.code);
      return {
        id: dbP.id,
        code: dbP.code,
        description: dbP.description,
        category: catalogEntry?.category || 'General',
      };
    });
  }
}
