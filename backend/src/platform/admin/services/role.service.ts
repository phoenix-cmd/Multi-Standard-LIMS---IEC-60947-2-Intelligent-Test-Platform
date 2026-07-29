import { PrismaClient } from '@prisma/client';
import { CreateRoleDTO, UpdateRoleDTO, CloneRoleDTO, AssignRoleUsersDTO } from '../dto/role.dto.js';
import { AuditAdminService, AuditContext } from './audit.admin.service.js';
import { domainEvents } from '../domain/DomainEvents.js';

const prisma = new PrismaClient();

const SUGGESTED_ROLE_PRESETS: Record<string, { priority: number; color: string }> = {
  Administrator: { priority: 1, color: '#dc2626' },
  'Lab Director': { priority: 2, color: '#7c3aed' },
  'Quality Manager': { priority: 3, color: '#2563eb' },
  'Lead Engineer': { priority: 4, color: '#0284c7' },
  Technician: { priority: 5, color: '#059669' },
  Operator: { priority: 6, color: '#d97706' },
  Auditor: { priority: 7, color: '#4b5563' },
  Guest: { priority: 8, color: '#6b7280' },
};

export class RoleService {
  /**
   * Retrieves list of all roles with associated permission codes and user counts.
   */
  static async getRoles() {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: { permission: true },
        },
        userRoles: {
          include: { user: true },
        },
      },
    });

    return roles.map((r) => {
      const preset = SUGGESTED_ROLE_PRESETS[r.name] || { priority: 10, color: '#64748b' };
      return {
        id: r.id,
        name: r.name,
        description: r.description,
        priority: preset.priority,
        color: preset.color,
        permissions: r.rolePermissions.map((rp) => rp.permission.code),
        userCount: r.userRoles.length,
        users: r.userRoles.map((ur) => ({
          id: ur.user.id,
          name: ur.user.name,
          email: ur.user.email,
        })),
      };
    });
  }

  /**
   * Creates a new security role.
   */
  static async createRole(dto: CreateRoleDTO, ctx: AuditContext) {
    const existing = await prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) throw new Error('Role with this name already exists');

    const newRole = await prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        rolePermissions: dto.permissionIds
          ? { create: dto.permissionIds.map((pId) => ({ permissionId: pId })) }
          : undefined,
      },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });

    await AuditAdminService.logEvent(ctx, 'ROLE_CREATED', 'Role', newRole.id, `Created role ${newRole.name}`);
    domainEvents.emitAdminEvent('RoleCreated', newRole.id, ctx.userId, { name: newRole.name });

    return {
      ...newRole,
      permissions: newRole.rolePermissions.map((rp) => rp.permission.code),
    };
  }

  /**
   * Updates an existing role.
   */
  static async updateRole(id: string, dto: UpdateRoleDTO, ctx: AuditContext) {
    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.description) updateData.description = dto.description;

    const updatedRole = await prisma.role.update({
      where: { id },
      data: updateData,
    });

    if (dto.permissionIds && Array.isArray(dto.permissionIds)) {
      await prisma.rolePermission.deleteMany({ where: { roleId: id } });
      await prisma.rolePermission.createMany({
        data: dto.permissionIds.map((pId) => ({ roleId: id, permissionId: pId })),
      });
    }

    await AuditAdminService.logEvent(ctx, 'ROLE_UPDATED', 'Role', id, `Updated role ${updatedRole.name}`);
    domainEvents.emitAdminEvent('RoleUpdated', id, ctx.userId, { name: updatedRole.name });

    return updatedRole;
  }

  /**
   * Deletes a role (if no users currently assigned).
   */
  static async deleteRole(id: string, ctx: AuditContext) {
    const assignedUsersCount = await prisma.userRole.count({ where: { roleId: id } });
    if (assignedUsersCount > 0) {
      throw new Error(`Cannot delete role with ${assignedUsersCount} active users assigned.`);
    }

    const role = await prisma.role.delete({ where: { id } });
    await AuditAdminService.logEvent(ctx, 'ROLE_DELETED', 'Role', id, `Deleted role ${role.name}`);
    domainEvents.emitAdminEvent('RoleDeleted', id, ctx.userId, { name: role.name });

    return role;
  }

  /**
   * Clones a role along with all assigned permissions.
   */
  static async cloneRole(sourceRoleId: string, dto: CloneRoleDTO, ctx: AuditContext) {
    const sourceRole = await prisma.role.findUnique({
      where: { id: sourceRoleId },
      include: { rolePermissions: true },
    });
    if (!sourceRole) throw new Error('Source role not found');

    const cloned = await prisma.role.create({
      data: {
        name: dto.newRoleName,
        description: dto.newDescription || `Cloned from ${sourceRole.name}: ${sourceRole.description}`,
        rolePermissions: {
          create: sourceRole.rolePermissions.map((rp) => ({ permissionId: rp.permissionId })),
        },
      },
      include: { rolePermissions: { include: { permission: true } } },
    });

    await AuditAdminService.logEvent(ctx, 'ROLE_CLONED', 'Role', cloned.id, `Cloned role ${sourceRole.name} into ${cloned.name}`);
    domainEvents.emitAdminEvent('RoleCloned', cloned.id, ctx.userId, { sourceRole: sourceRole.name, newRole: cloned.name });

    return cloned;
  }

  /**
   * Updates assigned permissions for a role.
   */
  static async updateRolePermissions(roleId: string, permissionCodes: string[], ctx: AuditContext) {
    const permissions = await prisma.permission.findMany({
      where: { code: { in: permissionCodes } },
    });

    await prisma.rolePermission.deleteMany({ where: { roleId } });
    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId, permissionId: p.id })),
    });

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    await AuditAdminService.logEvent(ctx, 'ROLE_PERMISSIONS_UPDATED', 'Role', roleId, `Updated permissions for ${role?.name}`);
    domainEvents.emitAdminEvent('PermissionUpdated', roleId, ctx.userId, { permissions: permissionCodes });

    return { roleId, permissions: permissionCodes };
  }
}
