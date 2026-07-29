import { CreateRoleDTO, UpdateRoleDTO } from '../dto/role.dto.js';

export class RoleValidator {
  static validateCreateRole(dto: Partial<CreateRoleDTO>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.name || dto.name.trim().length < 2) {
      errors.push('Role name must be at least 2 characters.');
    }
    if (!dto.description || dto.description.trim().length < 5) {
      errors.push('Role description must be at least 5 characters.');
    }

    return { valid: errors.length === 0, errors };
  }

  static validateUpdateRole(dto: Partial<UpdateRoleDTO>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (dto.name !== undefined && dto.name.trim().length < 2) {
      errors.push('Role name must be at least 2 characters.');
    }

    return { valid: errors.length === 0, errors };
  }
}
