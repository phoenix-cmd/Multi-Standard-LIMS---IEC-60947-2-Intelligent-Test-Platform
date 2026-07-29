import React, { useState } from 'react';
import { Shield, Plus, Copy, Trash2, Edit3, Check, Users, Lock } from 'lucide-react';

interface RoleItem {
  id: string;
  name: string;
  description: string;
  priority: number;
  color: string;
  userCount: number;
  permissions: string[];
}

const DEFAULT_ROLES: RoleItem[] = [
  { id: 'role-1', name: 'Administrator', description: 'Full system administration and identity control', priority: 1, color: '#dc2626', userCount: 2, permissions: ['user.create', 'user.read', 'user.update', 'user.delete', 'admin.users', 'admin.roles', 'admin.settings', 'admin.audit'] },
  { id: 'role-2', name: 'Lab Director', description: 'Laboratory executive oversight and report approvals', priority: 2, color: '#7c3aed', userCount: 1, permissions: ['report.approve', 'report.sign', 'audit.view', 'standards.execute'] },
  { id: 'role-3', name: 'Quality Manager', description: 'ISO/IEC 17025 compliance, audit exports, and report verification', priority: 3, color: '#2563eb', userCount: 3, permissions: ['report.approve', 'report.export', 'audit.view', 'equipment.calibrate'] },
  { id: 'role-4', name: 'Lead Engineer', description: 'Test execution, digital twin analysis, and investigation workspace', priority: 4, color: '#0284c7', userCount: 4, permissions: ['sample.create', 'sample.edit', 'standards.execute', 'ai.diagnose', 'twin.view', 'twin.edit'] },
  { id: 'role-5', name: 'Technician', description: 'Routine test execution, equipment setup, and data entry', priority: 5, color: '#059669', userCount: 6, permissions: ['standards.execute', 'equipment.edit', 'sample.create'] },
  { id: 'role-6', name: 'Operator', description: 'Basic laboratory equipment operation', priority: 6, color: '#d97706', userCount: 2, permissions: ['standards.execute'] },
  { id: 'role-7', name: 'Auditor', description: 'Read-only access for accreditation and regulatory audits', priority: 7, color: '#4b5563', userCount: 1, permissions: ['audit.view', 'audit.export', 'report.export'] },
];

const ALL_PERMISSIONS = [
  { code: 'user.create', group: 'Users' }, { code: 'user.read', group: 'Users' }, { code: 'user.update', group: 'Users' }, { code: 'user.delete', group: 'Users' },
  { code: 'equipment.create', group: 'Equipment' }, { code: 'equipment.edit', group: 'Equipment' }, { code: 'equipment.calibrate', group: 'Equipment' },
  { code: 'sample.create', group: 'Samples' }, { code: 'sample.edit', group: 'Samples' }, { code: 'sample.delete', group: 'Samples' },
  { code: 'report.create', group: 'Reports' }, { code: 'report.approve', group: 'Reports' }, { code: 'report.sign', group: 'Reports' }, { code: 'report.export', group: 'Reports' },
  { code: 'audit.view', group: 'Audit' }, { code: 'audit.export', group: 'Audit' },
  { code: 'standards.execute', group: 'Standards' }, { code: 'standards.edit', group: 'Standards' },
  { code: 'ai.use', group: 'AI' }, { code: 'ai.diagnose', group: 'AI' },
  { code: 'twin.view', group: 'Digital Twin' }, { code: 'twin.edit', group: 'Digital Twin' },
  { code: 'admin.users', group: 'Administration' }, { code: 'admin.roles', group: 'Administration' }, { code: 'admin.settings', group: 'Administration' }, { code: 'admin.audit', group: 'Administration' },
];

export function RoleManagementPanel() {
  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<RoleItem>(DEFAULT_ROLES[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const handleTogglePermission = (permCode: string) => {
    const has = selectedRole.permissions.includes(permCode);
    const updatedPerms = has
      ? selectedRole.permissions.filter((p) => p !== permCode)
      : [...selectedRole.permissions, permCode];

    const updatedRole = { ...selectedRole, permissions: updatedPerms };
    setSelectedRole(updatedRole);
    setRoles((prev) => prev.map((r) => (r.id === selectedRole.id ? updatedRole : r)));
  };

  const handleCloneRole = (role: RoleItem) => {
    const cloned: RoleItem = {
      id: `role-${Date.now()}`,
      name: `${role.name} (Copy)`,
      description: `Cloned from ${role.name}`,
      priority: role.priority + 1,
      color: '#64748b',
      userCount: 0,
      permissions: [...role.permissions],
    };
    setRoles([...roles, cloned]);
    setSelectedRole(cloned);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    const created: RoleItem = {
      id: `role-${Date.now()}`,
      name: newRoleName,
      description: newRoleDesc,
      priority: roles.length + 1,
      color: '#0284c7',
      userCount: 0,
      permissions: ['standards.execute'],
    };
    setRoles([...roles, created]);
    setSelectedRole(created);
    setShowCreateModal(false);
    setNewRoleName('');
    setNewRoleDesc('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-100">Role & Permission Management</h2>
            <p className="text-xs text-surface-400">Define security roles, priorities, color codes, and fine-grained access matrices</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Create Custom Role
        </button>
      </div>

      {/* Main Grid: Left Roles List, Right Permissions Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Roles List */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-3 space-y-2">
          <p className="text-xs font-extrabold text-surface-400 uppercase tracking-wider px-2">Defined Roles ({roles.length})</p>
          <div className="space-y-1">
            {roles.map((r) => {
              const isSelected = selectedRole.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-950/30 border-brand-500/40 shadow-sm'
                      : 'bg-surface-950/50 border-surface-800 hover:bg-surface-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: r.color }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-surface-100">{r.name}</h4>
                      <p className="text-[10px] text-surface-400 truncate max-w-[160px]">{r.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-surface-800 text-surface-300 px-1.5 py-0.5 rounded font-mono">
                      {r.userCount} users
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCloneRole(r); }}
                      title="Clone Role"
                      className="p-1 hover:bg-surface-800 rounded text-surface-400 hover:text-brand-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="lg:col-span-2 bg-surface-900 border border-surface-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedRole.color }} />
                <h3 className="text-sm font-bold text-surface-100">{selectedRole.name} — Permissions Matrix</h3>
              </div>
              <p className="text-xs text-surface-400 mt-0.5">{selectedRole.description}</p>
            </div>
            <span className="text-xs bg-brand-500/10 text-brand-400 border border-brand-500/30 px-2.5 py-1 rounded font-bold font-mono">
              {selectedRole.permissions.length} Permissions Active
            </span>
          </div>

          {/* Grouped Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {Array.from(new Set(ALL_PERMISSIONS.map((p) => p.group))).map((group) => {
              const permsInGroup = ALL_PERMISSIONS.filter((p) => p.group === group);
              return (
                <div key={group} className="bg-surface-950 border border-surface-800 rounded-lg p-3 space-y-2">
                  <p className="text-[11px] font-extrabold text-brand-400 uppercase tracking-wider">{group}</p>
                  <div className="space-y-1.5">
                    {permsInGroup.map((p) => {
                      const isChecked = selectedRole.permissions.includes(p.code);
                      return (
                        <label
                          key={p.code}
                          className="flex items-center justify-between text-xs text-surface-300 cursor-pointer hover:text-white p-1 rounded hover:bg-surface-800/40"
                        >
                          <span className="font-mono text-[11px]">{p.code}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(p.code)}
                            className="rounded bg-surface-900 border-surface-700 text-brand-500 focus:ring-0 w-4 h-4 cursor-pointer"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-surface-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Create Custom Role
            </h3>
            <form onSubmit={handleCreateRole} className="space-y-3">
              <div>
                <label className="text-xs text-surface-400">Role Name</label>
                <input required type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-xs text-surface-100 mt-1" />
              </div>
              <div>
                <label className="text-xs text-surface-400">Description</label>
                <textarea required value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-xs text-surface-100 mt-1 h-20" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 bg-surface-800 text-surface-300 rounded text-xs">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-bold">Create Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
