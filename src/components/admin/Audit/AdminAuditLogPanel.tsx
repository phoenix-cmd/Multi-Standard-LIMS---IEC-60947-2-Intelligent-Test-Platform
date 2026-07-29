import React, { useState } from 'react';
import { ClipboardList, Search, Eye, Filter, ArrowRight } from 'lucide-react';

interface AuditItem {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  beforeState?: Record<string, any> | null;
  afterState?: Record<string, any> | null;
}

const INITIAL_AUDIT_LOGS: AuditItem[] = [
  { id: 'aud-1', timestamp: '2026-07-29 15:45:10', userName: 'Dr. Arjun Menon', action: 'USER_CREATED', resource: 'User', resourceId: 'usr-5', details: 'Created user rajesh.kumar@lab.in with roles: Operator', ipAddress: '192.168.1.45', beforeState: null, afterState: { email: 'rajesh.kumar@lab.in', name: 'Rajesh Kumar', department: 'High Power Testing', role: 'Operator' } },
  { id: 'aud-2', timestamp: '2026-07-29 14:20:05', userName: 'Dr. Arjun Menon', action: 'ROLE_PERMISSIONS_UPDATED', resource: 'Role', resourceId: 'role-4', details: 'Updated permissions for Lead Engineer: added ai.diagnose, twin.edit', ipAddress: '192.168.1.45', beforeState: { permissions: ['standards.execute'] }, afterState: { permissions: ['standards.execute', 'ai.diagnose', 'twin.edit'] } },
  { id: 'aud-3', timestamp: '2026-07-29 13:12:44', userName: 'Priya Sharma', action: 'PASSWORD_RESET', resource: 'User', resourceId: 'usr-4', details: 'Admin reset temporary password for Ananya Rao', ipAddress: '192.168.1.88', beforeState: { forcePasswordChange: false }, afterState: { forcePasswordChange: true } },
  { id: 'aud-4', timestamp: '2026-07-29 11:05:30', userName: 'Dr. Arjun Menon', action: 'USER_LOCKED', resource: 'User', resourceId: 'usr-4', details: 'USER_LOCKED account due to 5 consecutive failed logins', ipAddress: '192.168.1.150', beforeState: { lockedUntil: null }, afterState: { lockedUntil: '2026-07-30T11:05:30Z' } },
  { id: 'aud-5', timestamp: '2026-07-29 09:30:15', userName: 'System Kernel', action: 'SETTINGS_UPDATED', resource: 'SystemSetting', resourceId: 'global', details: 'Updated password policy minLength to 8', ipAddress: '127.0.0.1', beforeState: { minLength: 6 }, afterState: { minLength: 8 } },
];

export function AdminAuditLogPanel() {
  const [logs, setLogs] = useState<AuditItem[]>(INITIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditItem | null>(null);

  const filtered = logs.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-100">Enterprise Administration Audit Trail</h2>
            <p className="text-xs text-surface-400">Immutable 21 CFR Part 11 and ISO/IEC 17025 compliant administrative action log with state diffs</p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-surface-500" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-950 border border-surface-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-surface-200 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-950 border-b border-surface-800 text-[11px] font-extrabold text-surface-400 uppercase tracking-wider">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor / Admin</th>
              <th className="p-3">Action Event</th>
              <th className="p-3">Target Entity</th>
              <th className="p-3">Details</th>
              <th className="p-3 text-right">State Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/60 text-xs">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-surface-800/40 transition-colors">
                <td className="p-3 font-mono text-surface-400 text-[11px]">{l.timestamp}</td>
                <td className="p-3 font-bold text-surface-100">{l.userName}</td>
                <td className="p-3">
                  <span className="font-mono text-brand-300 font-bold bg-brand-950/40 border border-brand-500/30 px-2 py-0.5 rounded text-[10px]">
                    {l.action}
                  </span>
                </td>
                <td className="p-3 text-surface-300 font-semibold">{l.resource} ({l.resourceId})</td>
                <td className="p-3 text-surface-300 truncate max-w-xs">{l.details}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setSelectedLog(l)}
                    className="px-2.5 py-1 bg-surface-800 hover:bg-surface-700 text-surface-200 rounded text-[11px] font-semibold flex items-center gap-1.5 ml-auto"
                  >
                    <Eye className="w-3.5 h-3.5 text-brand-400" />
                    Inspect Diff
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* State Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 w-full max-w-2xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-surface-100 font-mono">{selectedLog.action} State Transition</h3>
                <p className="text-xs text-surface-400 mt-0.5">Actor: {selectedLog.userName} • {selectedLog.timestamp}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-surface-400 hover:text-white text-sm font-mono">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-surface-950 border border-surface-800 rounded-lg p-3 space-y-2">
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Before State</p>
                <pre className="text-surface-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.beforeState ? JSON.stringify(selectedLog.beforeState, null, 2) : 'null'}
                </pre>
              </div>

              <div className="bg-surface-950 border border-surface-800 rounded-lg p-3 space-y-2">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">After State</p>
                <pre className="text-surface-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.afterState ? JSON.stringify(selectedLog.afterState, null, 2) : 'null'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-1.5 bg-surface-800 text-surface-200 rounded text-xs font-bold">Close Inspector</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
