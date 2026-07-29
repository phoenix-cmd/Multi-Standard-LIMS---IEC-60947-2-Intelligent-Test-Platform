import React, { useState } from 'react';
import {
  Users, Search, Plus, Filter, Lock, Unlock, UserX, UserCheck, KeyRound,
  RotateCcw, Trash2, Edit3, Shield, CheckSquare, Square, ChevronLeft, ChevronRight
} from 'lucide-react';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  position: string;
  phone?: string;
  roles: string[];
  status: 'Active' | 'Disabled' | 'Locked' | 'Deleted' | 'PasswordExpired';
  isDeactivated: boolean;
  avatarInitials: string;
  createdAt: string;
}

const INITIAL_USERS: UserRecord[] = [
  { id: 'usr-1', name: 'Dr. Arjun Menon', email: 'arjun.menon@lab.in', employeeId: 'EMP-1001', department: 'High Power Testing', position: 'Lab Director', roles: ['Lab Director', 'Administrator'], status: 'Active', isDeactivated: false, avatarInitials: 'AM', createdAt: '2025-01-15' },
  { id: 'usr-2', name: 'Priya Sharma', email: 'priya.sharma@lab.in', employeeId: 'EMP-1002', department: 'Quality Assurance', position: 'Quality Manager', roles: ['Quality Manager'], status: 'Active', isDeactivated: false, avatarInitials: 'PS', createdAt: '2025-02-01' },
  { id: 'usr-3', name: 'Vikram Patel', email: 'vikram.patel@lab.in', employeeId: 'EMP-1003', department: 'Short-Circuit Lab', position: 'Lead Engineer', roles: ['Lead Engineer'], status: 'Active', isDeactivated: false, avatarInitials: 'VP', createdAt: '2025-02-10' },
  { id: 'usr-4', name: 'Ananya Rao', email: 'ananya.rao@lab.in', employeeId: 'EMP-1004', department: 'Calibration & Standards', position: 'Senior Technician', roles: ['Technician'], status: 'Locked', isDeactivated: false, avatarInitials: 'AR', createdAt: '2025-03-05' },
  { id: 'usr-5', name: 'Rajesh Kumar', email: 'rajesh.kumar@lab.in', employeeId: 'EMP-1005', department: 'High Power Testing', position: 'Test Operator', roles: ['Operator'], status: 'Disabled', isDeactivated: true, avatarInitials: 'RK', createdAt: '2025-03-12' },
];

export function UserManagementPanel() {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<UserRecord | null>(null);
  const [showResetModal, setShowResetModal] = useState<UserRecord | null>(null);
  const [tempPasswordNotice, setTempPasswordNotice] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '', email: '', employeeId: '', department: 'High Power Testing', position: 'Engineer', role: 'Technician'
  });

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDept = selectedDept === 'ALL' || u.department === selectedDept;
    const matchRole = selectedRole === 'ALL' || u.roles.includes(selectedRole);
    const matchStatus = selectedStatus === 'ALL' || u.status === selectedStatus;

    return matchSearch && matchDept && matchRole && matchStatus;
  });

  const toggleSelectUser = (id: string) => {
    const next = new Set(selectedUserIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUserIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      employeeId: formData.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      department: formData.department,
      position: formData.position,
      roles: [formData.role],
      status: 'Active',
      isDeactivated: false,
      avatarInitials: formData.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([newUser, ...users]);
    setShowCreateModal(false);
    setTempPasswordNotice(`Temporary password for ${newUser.name}: Temp#Pass2026!`);
  };

  const handleToggleLock = (user: UserRecord) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: u.status === 'Locked' ? 'Active' : 'Locked' } : u))
    );
  };

  const handleToggleActivation = (user: UserRecord) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, isDeactivated: !u.isDeactivated, status: !u.isDeactivated ? 'Disabled' : 'Active' } : u
      )
    );
  };

  const handleSoftDelete = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'Deleted' } : u)));
  };

  const handleBulkAction = (action: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (!selectedUserIds.has(u.id)) return u;
        if (action === 'enable') return { ...u, isDeactivated: false, status: 'Active' };
        if (action === 'disable') return { ...u, isDeactivated: true, status: 'Disabled' };
        if (action === 'unlock') return { ...u, status: 'Active' };
        if (action === 'delete') return { ...u, status: 'Deleted' };
        return u;
      })
    );
    setSelectedUserIds(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Temp Password Notice Toast */}
      {tempPasswordNotice && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-lg flex items-center justify-between text-xs font-mono">
          <span>{tempPasswordNotice}</span>
          <button onClick={() => setTempPasswordNotice(null)} className="text-surface-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-900 border border-surface-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-500/10 border border-brand-500/30 rounded-lg text-brand-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-100">User Administration</h2>
            <p className="text-xs text-surface-400">Manage laboratory accounts, roles, lockouts, and security credentials</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Create New User
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-surface-500" />
            <input
              type="text"
              placeholder="Search by name, email, employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-950 border border-surface-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-surface-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-surface-950 border border-surface-800 rounded-lg px-2.5 py-1.5 text-xs text-surface-300"
          >
            <option value="ALL">All Departments</option>
            <option value="High Power Testing">High Power Testing</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="Short-Circuit Lab">Short-Circuit Lab</option>
            <option value="Calibration & Standards">Calibration & Standards</option>
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-surface-950 border border-surface-800 rounded-lg px-2.5 py-1.5 text-xs text-surface-300"
          >
            <option value="ALL">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Lab Director">Lab Director</option>
            <option value="Quality Manager">Quality Manager</option>
            <option value="Lead Engineer">Lead Engineer</option>
            <option value="Technician">Technician</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface-950 border border-surface-800 rounded-lg px-2.5 py-1.5 text-xs text-surface-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Disabled">Disabled</option>
            <option value="Locked">Locked</option>
            <option value="Deleted">Deleted</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedUserIds.size > 0 && (
        <div className="bg-brand-950/40 border border-brand-500/30 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-300">
            {selectedUserIds.size} user(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => handleBulkAction('enable')} className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-semibold">Enable</button>
            <button onClick={() => handleBulkAction('disable')} className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded text-[11px] font-semibold">Disable</button>
            <button onClick={() => handleBulkAction('unlock')} className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded text-[11px] font-semibold">Unlock</button>
            <button onClick={() => handleBulkAction('delete')} className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded text-[11px] font-semibold">Delete</button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-950 border-b border-surface-800 text-[11px] font-extrabold text-surface-400 uppercase tracking-wider">
              <th className="p-3 w-10">
                <button onClick={toggleSelectAll}>
                  {selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-brand-400" />
                  ) : (
                    <Square className="w-4 h-4 text-surface-600" />
                  )}
                </button>
              </th>
              <th className="p-3">User & Profile</th>
              <th className="p-3">Employee ID</th>
              <th className="p-3">Department & Position</th>
              <th className="p-3">Assigned Roles</th>
              <th className="p-3">Account Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/60 text-xs">
            {filteredUsers.map((u) => {
              const isSelected = selectedUserIds.has(u.id);
              return (
                <tr key={u.id} className={`hover:bg-surface-800/40 transition-colors ${isSelected ? 'bg-brand-950/20' : ''}`}>
                  <td className="p-3">
                    <button onClick={() => toggleSelectUser(u.id)}>
                      {isSelected ? <CheckSquare className="w-4 h-4 text-brand-400" /> : <Square className="w-4 h-4 text-surface-600" />}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center font-extrabold text-brand-300 text-xs flex-shrink-0">
                        {u.avatarInitials}
                      </div>
                      <div>
                        <p className="font-bold text-surface-100">{u.name}</p>
                        <p className="text-[11px] text-surface-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-surface-300">{u.employeeId}</td>
                  <td className="p-3">
                    <p className="font-medium text-surface-200">{u.department}</p>
                    <p className="text-[10px] text-surface-400">{u.position}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span key={r} className="px-2 py-0.5 bg-surface-800 text-brand-300 border border-surface-700 rounded text-[10px] font-semibold">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    {u.status === 'Active' && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">Active</span>}
                    {u.status === 'Disabled' && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold">Disabled</span>}
                    {u.status === 'Locked' && <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded text-[10px] font-bold">Locked</span>}
                    {u.status === 'Deleted' && <span className="px-2 py-0.5 bg-surface-800 text-surface-400 border border-surface-700 rounded text-[10px] font-bold">Soft Deleted</span>}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggleLock(u)} title={u.status === 'Locked' ? 'Unlock Account' : 'Lock Account'} className="p-1.5 hover:bg-surface-800 rounded text-surface-400 hover:text-amber-400">
                        {u.status === 'Locked' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleToggleActivation(u)} title={u.isDeactivated ? 'Enable User' : 'Disable User'} className="p-1.5 hover:bg-surface-800 rounded text-surface-400 hover:text-emerald-400">
                        {u.isDeactivated ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => setShowResetModal(u)} title="Reset Password" className="p-1.5 hover:bg-surface-800 rounded text-surface-400 hover:text-purple-400">
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleSoftDelete(u.id)} title="Soft Delete" className="p-1.5 hover:bg-surface-800 rounded text-surface-400 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-surface-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" />
              Create New Laboratory User
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs text-surface-400">Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-xs text-surface-100 mt-1" />
              </div>
              <div>
                <label className="text-xs text-surface-400">Email Address</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-xs text-surface-100 mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-surface-400">Department</label>
                  <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-xs text-surface-100 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-surface-400">Position</label>
                  <input type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-xs text-surface-100 mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs text-surface-400">Primary Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-xs text-surface-100 mt-1">
                  <option value="Administrator">Administrator</option>
                  <option value="Lab Director">Lab Director</option>
                  <option value="Quality Manager">Quality Manager</option>
                  <option value="Lead Engineer">Lead Engineer</option>
                  <option value="Technician">Technician</option>
                  <option value="Operator">Operator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 bg-surface-800 text-surface-300 rounded text-xs">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-bold">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
