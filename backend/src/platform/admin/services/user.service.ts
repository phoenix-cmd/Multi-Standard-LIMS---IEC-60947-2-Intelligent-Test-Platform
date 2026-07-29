import { PrismaClient } from '@prisma/client';
import { CreateUserDTO, UpdateUserDTO, ResetPasswordDTO, BulkUserActionDTO } from '../dto/user.dto.js';
import { PasswordPolicy } from '../domain/PasswordPolicy.js';
import { UserPolicy } from '../domain/UserPolicy.js';
import { AuditAdminService, AuditContext } from './audit.admin.service.js';
import { domainEvents } from '../domain/DomainEvents.js';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Retrieves users with searching, filtering, sorting, and pagination.
   */
  static async getUsers(params: {
    search?: string;
    department?: string;
    role?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    const where: any = {};

    if (params.department) where.department = params.department;
    if (params.role) {
      where.userRoles = {
        some: {
          role: { name: { equals: params.role, mode: 'insensitive' } },
        },
      };
    }

    if (params.status === 'disabled') where.isDeactivated = true;
    if (params.status === 'active') where.isDeactivated = false;
    if (params.status === 'deleted') where.deletedAt = { not: null };
    else where.deletedAt = null; // default active non-deleted

    if (params.status === 'locked') {
      where.lockedUntil = { gt: new Date() };
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { employeeId: { contains: params.search, mode: 'insensitive' } },
        { department: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          userRoles: {
            include: { role: true },
          },
          organization: true,
          laboratory: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    const formatted = users.map((u) => {
      const status = UserPolicy.getStatus(u);
      const roles = u.userRoles.map((ur) => ur.role.name);
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        employeeId: u.employeeId || `EMP-${u.id.substring(0, 5).toUpperCase()}`,
        department: u.department,
        position: u.position || 'Engineer',
        phone: u.phone,
        notes: u.notes,
        avatarInitials: u.avatarInitials,
        isDeactivated: u.isDeactivated,
        failedAttempts: u.failedAttempts,
        lockedUntil: u.lockedUntil,
        forcePasswordChange: u.forcePasswordChange,
        temporaryPassword: u.temporaryPassword,
        roles,
        status: status.state,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        deletedAt: u.deletedAt,
      };
    });

    return { users: formatted, total, limit, offset };
  }

  /**
   * Retrieves single user details by ID.
   */
  static async getUserById(id: string) {
    const u = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: { include: { role: true } },
        sessions: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!u) throw new Error('User not found');
    const status = UserPolicy.getStatus(u);
    return {
      ...u,
      passwordHash: undefined,
      roles: u.userRoles.map((ur) => ur.role.name),
      status: status.state,
    };
  }

  /**
   * Creates a new user account.
   */
  static async createUser(dto: CreateUserDTO, ctx: AuditContext) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new Error('User with this email already exists');

    const rawPassword = dto.password || PasswordPolicy.generateTemporaryPassword(12);
    const passwordValidation = PasswordPolicy.validateComplexity(rawPassword);
    if (!passwordValidation.valid) {
      throw new Error(`Password complexity failed: ${passwordValidation.errors.join(' ')}`);
    }

    const passwordHash = await PasswordPolicy.hashPassword(rawPassword);
    const initials = dto.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newUser = await prisma.user.create({
      data: {
        organizationId: ctx.organizationId,
        laboratoryId: ctx.laboratoryId,
        email: dto.email,
        name: dto.name,
        employeeId: dto.employeeId,
        department: dto.department,
        position: dto.position,
        phone: dto.phone,
        notes: dto.notes,
        passwordHash,
        avatarInitials: initials,
        temporaryPassword: dto.password ? null : rawPassword,
        forcePasswordChange: dto.forcePasswordChange ?? true,
        userRoles: {
          create: dto.roleIds.map((roleId) => ({ roleId })),
        },
      },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    // Save initial password history
    await prisma.passwordHistory.create({
      data: { userId: newUser.id, passwordHash },
    });

    await AuditAdminService.logEvent(
      ctx,
      'USER_CREATED',
      'User',
      newUser.id,
      `Created user ${newUser.email} with roles: ${newUser.userRoles.map((r) => r.role.name).join(', ')}`,
      null,
      { email: newUser.email, name: newUser.name, department: newUser.department }
    );

    domainEvents.emitAdminEvent('UserCreated', newUser.id, ctx.userId, { email: newUser.email });

    return {
      user: {
        ...newUser,
        passwordHash: undefined,
        roles: newUser.userRoles.map((r) => r.role.name),
      },
      temporaryPassword: dto.password ? undefined : rawPassword,
    };
  }

  /**
   * Updates an existing user account.
   */
  static async updateUser(id: string, dto: UpdateUserDTO, ctx: AuditContext) {
    const beforeUser = await prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    if (!beforeUser) throw new Error('User not found');

    const updateData: any = {};
    if (dto.name) {
      updateData.name = dto.name;
      updateData.avatarInitials = dto.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
    }
    if (dto.department) updateData.department = dto.department;
    if (dto.position !== undefined) updateData.position = dto.position;
    if (dto.employeeId !== undefined) updateData.employeeId = dto.employeeId;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.isDeactivated !== undefined) updateData.isDeactivated = dto.isDeactivated;

    // Update roles if provided
    if (dto.roleIds && Array.isArray(dto.roleIds)) {
      await prisma.userRole.deleteMany({ where: { userId: id } });
      await prisma.userRole.createMany({
        data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { userRoles: { include: { role: true } } },
    });

    await AuditAdminService.logEvent(
      ctx,
      'USER_UPDATED',
      'User',
      id,
      `Updated profile details for ${updatedUser.email}`,
      beforeUser,
      updatedUser
    );

    domainEvents.emitAdminEvent('UserUpdated', id, ctx.userId, { updatedFields: Object.keys(dto) });

    return {
      ...updatedUser,
      passwordHash: undefined,
      roles: updatedUser.userRoles.map((r) => r.role.name),
    };
  }

  /**
   * Toggles account activation (Disable / Enable).
   */
  static async setActivation(id: string, isDeactivated: boolean, ctx: AuditContext) {
    const updated = await prisma.user.update({
      where: { id },
      data: { isDeactivated },
    });

    const action = isDeactivated ? 'USER_DISABLED' : 'USER_ENABLED';
    await AuditAdminService.logEvent(ctx, action, 'User', id, `${action} for ${updated.email}`);
    domainEvents.emitAdminEvent(isDeactivated ? 'UserDisabled' : 'UserEnabled', id, ctx.userId, { email: updated.email });

    return { id, isDeactivated, email: updated.email };
  }

  /**
   * Performs soft deletion of a user.
   */
  static async softDeleteUser(id: string, ctx: AuditContext) {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: ctx.userId,
        isDeactivated: true,
      },
    });

    await AuditAdminService.logEvent(ctx, 'USER_DELETED', 'User', id, `Soft deleted user ${updated.email}`);
    domainEvents.emitAdminEvent('UserDeleted', id, ctx.userId, { email: updated.email });

    return { id, deletedAt: updated.deletedAt };
  }

  /**
   * Restores a soft-deleted user.
   */
  static async restoreUser(id: string, ctx: AuditContext) {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
        isDeactivated: false,
      },
    });

    await AuditAdminService.logEvent(ctx, 'USER_RESTORED', 'User', id, `Restored soft-deleted user ${updated.email}`);
    domainEvents.emitAdminEvent('UserRestored', id, ctx.userId, { email: updated.email });

    return { id, restoredAt: new Date() };
  }

  /**
   * Locks or unlocks an account.
   */
  static async setLockout(id: string, lock: boolean, ctx: AuditContext) {
    const data = lock
      ? { lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), failedAttempts: 5 }
      : { lockedUntil: null, failedAttempts: 0 };

    const updated = await prisma.user.update({ where: { id }, data });

    const action = lock ? 'USER_LOCKED' : 'USER_UNLOCKED';
    await AuditAdminService.logEvent(ctx, action, 'User', id, `${action} user ${updated.email}`);

    return { id, isLocked: lock, email: updated.email };
  }

  /**
   * Resets a user password (Administrator action).
   */
  static async resetPassword(id: string, dto: ResetPasswordDTO, ctx: AuditContext) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { passwordHistory: { orderBy: { createdAt: 'desc' }, take: 3 } },
    });
    if (!user) throw new Error('User not found');

    const rawPassword = dto.useTemporaryPassword || !dto.newPassword
      ? PasswordPolicy.generateTemporaryPassword(12)
      : dto.newPassword;

    const validation = PasswordPolicy.validateComplexity(rawPassword);
    if (!validation.valid) {
      throw new Error(`Password complexity failed: ${validation.errors.join(' ')}`);
    }

    const previousHashes = user.passwordHistory.map((h) => h.passwordHash);
    const reused = await PasswordPolicy.isReusedInHistory(rawPassword, previousHashes);
    if (reused) {
      throw new Error('New password cannot match any of the last 3 previous passwords.');
    }

    const passwordHash = await PasswordPolicy.hashPassword(rawPassword);

    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        temporaryPassword: dto.useTemporaryPassword ? rawPassword : null,
        forcePasswordChange: dto.forceChangeOnNextLogin ?? true,
        passwordChangedAt: new Date(),
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    await prisma.passwordHistory.create({
      data: { userId: id, passwordHash },
    });

    await AuditAdminService.logEvent(ctx, 'PASSWORD_RESET', 'User', id, `Admin reset password for ${user.email}`);
    domainEvents.emitAdminEvent('PasswordReset', id, ctx.userId, { email: user.email });

    return {
      userId: id,
      email: user.email,
      temporaryPassword: dto.useTemporaryPassword ? rawPassword : undefined,
    };
  }

  /**
   * Executes bulk operations across multiple users.
   */
  static async executeBulkAction(dto: BulkUserActionDTO, ctx: AuditContext) {
    const results = [];
    for (const userId of dto.userIds) {
      try {
        if (dto.action === 'enable') await this.setActivation(userId, false, ctx);
        else if (dto.action === 'disable') await this.setActivation(userId, true, ctx);
        else if (dto.action === 'delete') await this.softDeleteUser(userId, ctx);
        else if (dto.action === 'restore') await this.restoreUser(userId, ctx);
        else if (dto.action === 'unlock') await this.setLockout(userId, false, ctx);
        else if (dto.action === 'reset-password') await this.resetPassword(userId, { useTemporaryPassword: true }, ctx);
        else if (dto.action === 'assign-role' && dto.roleId) {
          await this.updateUser(userId, { roleIds: [dto.roleId] }, ctx);
        }
        results.push({ userId, status: 'success' });
      } catch (err: any) {
        results.push({ userId, status: 'error', message: err.message });
      }
    }

    await AuditAdminService.logEvent(
      ctx,
      'BULK_USER_ACTION',
      'User',
      'bulk',
      `Executed bulk ${dto.action} on ${dto.userIds.length} users`
    );

    return { action: dto.action, processed: results.length, results };
  }
}
