export interface CreateRoleDTO {
  name: string;
  description: string;
  priority?: number;
  color?: string;
  permissionIds?: string[];
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  priority?: number;
  color?: string;
  permissionIds?: string[];
}

export interface CloneRoleDTO {
  newRoleName: string;
  newDescription?: string;
}

export interface AssignRoleUsersDTO {
  userIds: string[];
}
