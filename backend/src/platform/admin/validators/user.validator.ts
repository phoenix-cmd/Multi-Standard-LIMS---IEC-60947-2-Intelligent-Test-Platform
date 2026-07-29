import { CreateUserDTO, UpdateUserDTO, BulkUserActionDTO } from '../dto/user.dto.js';

export class UserValidator {
  static validateCreateUser(dto: Partial<CreateUserDTO>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
      errors.push('Valid email address is required.');
    }
    if (!dto.name || dto.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters.');
    }
    if (!dto.department || dto.department.trim().length === 0) {
      errors.push('Department is required.');
    }
    if (!dto.roleIds || !Array.isArray(dto.roleIds) || dto.roleIds.length === 0) {
      errors.push('At least one role must be assigned.');
    }

    return { valid: errors.length === 0, errors };
  }

  static validateUpdateUser(dto: Partial<UpdateUserDTO>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (dto.name !== undefined && dto.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters.');
    }

    return { valid: errors.length === 0, errors };
  }

  static validateBulkAction(dto: Partial<BulkUserActionDTO>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.action || !['enable', 'disable', 'delete', 'restore', 'unlock', 'reset-password', 'assign-role'].includes(dto.action)) {
      errors.push('Valid bulk action is required.');
    }
    if (!dto.userIds || !Array.isArray(dto.userIds) || dto.userIds.length === 0) {
      errors.push('At least one user ID must be provided.');
    }
    if (dto.action === 'assign-role' && !dto.roleId) {
      errors.push('roleId is required for assign-role bulk action.');
    }

    return { valid: errors.length === 0, errors };
  }
}
