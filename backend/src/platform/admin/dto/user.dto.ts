export interface CreateUserDTO {
  email: string;
  name: string;
  department: string;
  position?: string;
  employeeId?: string;
  phone?: string;
  notes?: string;
  roleIds: string[];
  password?: string;
  forcePasswordChange?: boolean;
}

export interface UpdateUserDTO {
  name?: string;
  department?: string;
  position?: string;
  employeeId?: string;
  phone?: string;
  notes?: string;
  roleIds?: string[];
  isDeactivated?: boolean;
}

export interface ResetPasswordDTO {
  newPassword?: string;
  useTemporaryPassword?: boolean;
  forceChangeOnNextLogin?: boolean;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface BulkUserActionDTO {
  action: 'enable' | 'disable' | 'delete' | 'restore' | 'unlock' | 'reset-password' | 'assign-role';
  userIds: string[];
  roleId?: string;
}
