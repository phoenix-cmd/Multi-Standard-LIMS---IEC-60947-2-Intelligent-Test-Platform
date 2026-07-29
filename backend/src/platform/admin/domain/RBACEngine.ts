export interface PermissionDefinition {
  code: string;
  category: 'Users' | 'Equipment' | 'Samples' | 'Reports' | 'Audit' | 'Standards' | 'AI' | 'Digital Twin' | 'Administration';
  description: string;
}

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  // Users
  { code: 'user.create', category: 'Users', description: 'Create new user accounts' },
  { code: 'user.read', category: 'Users', description: 'View user profiles and list' },
  { code: 'user.update', category: 'Users', description: 'Edit user profiles, lock/unlock, reset passwords' },
  { code: 'user.delete', category: 'Users', description: 'Soft delete or restore user accounts' },

  // Equipment
  { code: 'equipment.create', category: 'Equipment', description: 'Register new lab test equipment' },
  { code: 'equipment.edit', category: 'Equipment', description: 'Update equipment specifications and location' },
  { code: 'equipment.calibrate', category: 'Equipment', description: 'Record calibration certificates and due dates' },
  { code: 'equipment.disable', category: 'Equipment', description: 'Change equipment status to out-of-service or quarantine' },

  // Samples
  { code: 'sample.create', category: 'Samples', description: 'Register new specimen samples' },
  { code: 'sample.edit', category: 'Samples', description: 'Update sample lifecycle states and assigned engineer' },
  { code: 'sample.delete', category: 'Samples', description: 'Delete or archive sample records' },

  // Reports
  { code: 'report.create', category: 'Reports', description: 'Generate test result reports' },
  { code: 'report.approve', category: 'Reports', description: 'Review and approve test reports' },
  { code: 'report.sign', category: 'Reports', description: 'Apply digital signature to reports' },
  { code: 'report.export', category: 'Reports', description: 'Export report PDFs and data packages' },

  // Audit
  { code: 'audit.view', category: 'Audit', description: 'View audit logs and system trail' },
  { code: 'audit.export', category: 'Audit', description: 'Export compliance audit logs' },

  // Standards
  { code: 'standards.execute', category: 'Standards', description: 'Execute standard test sequences' },
  { code: 'standards.edit', category: 'Standards', description: 'Modify standard clause definitions' },
  { code: 'standards.install', category: 'Standards', description: 'Install or activate standard plugin revisions' },

  // AI
  { code: 'ai.use', category: 'AI', description: 'Interact with AI Copilot and assistant' },
  { code: 'ai.diagnose', category: 'AI', description: 'Execute AI root cause failure diagnosis' },
  { code: 'ai.train', category: 'AI', description: 'Fine-tune AI prompt templates and knowledge graph' },

  // Digital Twin
  { code: 'twin.view', category: 'Digital Twin', description: 'View 3D digital twin telemetry' },
  { code: 'twin.edit', category: 'Digital Twin', description: 'Modify 3D component mappings and explosion vectors' },

  // Administration
  { code: 'admin.users', category: 'Administration', description: 'Full access to user administration' },
  { code: 'admin.roles', category: 'Administration', description: 'Full access to role and permission management' },
  { code: 'admin.settings', category: 'Administration', description: 'Configure organization profiles and system policies' },
  { code: 'admin.audit', category: 'Administration', description: 'Manage and review full admin audit logs' },
];

export class RBACEngine {
  /**
   * Checks if user has all required permissions.
   */
  static hasPermissions(userPermissions: string[], required: string[]): boolean {
    const permSet = new Set(userPermissions);
    return required.every((req) => permSet.has(req));
  }

  /**
   * Checks if user has any of the required permissions.
   */
  static hasAnyPermission(userPermissions: string[], required: string[]): boolean {
    const permSet = new Set(userPermissions);
    return required.some((req) => permSet.has(req));
  }
}
