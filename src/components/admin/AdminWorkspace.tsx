import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Shield, Key, Lock, Monitor, Building2, Sliders, ClipboardList
} from 'lucide-react';
import { AdminDashboardPanel } from './Dashboard/AdminDashboardPanel';
import { UserManagementPanel } from './Users/UserManagementPanel';
import { RoleManagementPanel } from './Roles/RoleManagementPanel';
import { PermissionCatalogPanel } from './Permissions/PermissionCatalogPanel';
import { SecurityPolicyPanel } from './Security/SecurityPolicyPanel';
import { ActiveSessionsPanel } from './Sessions/ActiveSessionsPanel';
import { OrganizationSettingsPanel } from './Organizations/OrganizationSettingsPanel';
import { SystemSettingsPanel } from './Settings/SystemSettingsPanel';
import { AdminAuditLogPanel } from './Audit/AdminAuditLogPanel';

type TabId =
  | 'dashboard'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'security'
  | 'sessions'
  | 'organization'
  | 'settings'
  | 'audit';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'permissions', label: 'Permissions Catalog', icon: Key },
  { id: 'security', label: 'Security Policy', icon: Lock },
  { id: 'sessions', label: 'Active Sessions', icon: Monitor },
  { id: 'organization', label: 'Organization Profile', icon: Building2 },
  { id: 'settings', label: 'System Settings', icon: Sliders },
  { id: 'audit', label: 'Audit Trail', icon: ClipboardList },
];

export function AdminWorkspace() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      {/* Top Header & Navigation Tabs */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-300">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-surface-100 leading-none">Administration & Identity OS</h1>
            <p className="text-[10px] text-surface-400 font-mono mt-0.5">Enterprise RBAC • Audit Trail • Security Policy</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-surface-950 p-1 rounded-lg border border-surface-800">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'dashboard' && <AdminDashboardPanel />}
      {activeTab === 'users' && <UserManagementPanel />}
      {activeTab === 'roles' && <RoleManagementPanel />}
      {activeTab === 'permissions' && <PermissionCatalogPanel />}
      {activeTab === 'security' && <SecurityPolicyPanel />}
      {activeTab === 'sessions' && <ActiveSessionsPanel />}
      {activeTab === 'organization' && <OrganizationSettingsPanel />}
      {activeTab === 'settings' && <SystemSettingsPanel />}
      {activeTab === 'audit' && <AdminAuditLogPanel />}
    </div>
  );
}
