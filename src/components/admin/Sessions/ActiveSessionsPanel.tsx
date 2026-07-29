import React, { useState } from 'react';
import { Monitor, Smartphone, Globe, LogOut, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ActiveSessionItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  lastActivity: string;
}

const INITIAL_SESSIONS: ActiveSessionItem[] = [
  { id: 'sess-101', userId: 'usr-1', userName: 'Dr. Arjun Menon', userEmail: 'arjun.menon@lab.in', userRole: 'Lab Director', deviceName: 'Chrome / macOS Sonoma', ipAddress: '192.168.1.45', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', loginTime: '2026-07-29 09:15:22', lastActivity: '2 mins ago' },
  { id: 'sess-102', userId: 'usr-2', userName: 'Priya Sharma', userEmail: 'priya.sharma@lab.in', userRole: 'Quality Manager', deviceName: 'Edge / Windows 11 Enterprise', ipAddress: '192.168.1.88', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', loginTime: '2026-07-29 10:04:10', lastActivity: '12 mins ago' },
  { id: 'sess-103', userId: 'usr-3', userName: 'Vikram Patel', userEmail: 'vikram.patel@lab.in', userRole: 'Lead Engineer', deviceName: 'Firefox / Ubuntu Linux 22.04', ipAddress: '192.168.1.102', userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64)', loginTime: '2026-07-29 11:30:00', lastActivity: 'Just now' },
  { id: 'sess-104', userId: 'usr-4', userName: 'Ananya Rao', userEmail: 'ananya.rao@lab.in', userRole: 'Technician', deviceName: 'Safari / iPad Pro iOS 17', ipAddress: '192.168.1.150', userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X)', loginTime: '2026-07-29 08:45:11', lastActivity: '45 mins ago' },
];

export function ActiveSessionsPanel() {
  const [sessions, setSessions] = useState<ActiveSessionItem[]>(INITIAL_SESSIONS);
  const [notice, setNotice] = useState<string | null>(null);

  const handleRevokeSession = (sessionId: string, userName: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setNotice(`Revoked active session ${sessionId} for ${userName}`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleRevokeAllForUser = (userId: string, userName: string) => {
    setSessions((prev) => prev.filter((s) => s.userId !== userId));
    setNotice(`Revoked ALL active devices for user ${userName}`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-4">
      {notice && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-lg flex items-center justify-between text-xs font-mono">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-surface-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-100">Active User Sessions</h2>
            <p className="text-xs text-surface-400">Real-time session monitoring, IP tracking, device telemetry, and global emergency logout</p>
          </div>
        </div>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg font-mono font-bold">
          {sessions.length} Active Sessions
        </span>
      </div>

      {/* Sessions Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-950 border-b border-surface-800 text-[11px] font-extrabold text-surface-400 uppercase tracking-wider">
              <th className="p-3">User & Role</th>
              <th className="p-3">Device & Browser</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">Login Time</th>
              <th className="p-3">Last Activity</th>
              <th className="p-3 text-right">Session Revocation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/60 text-xs">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-surface-800/40 transition-colors">
                <td className="p-3">
                  <p className="font-bold text-surface-100">{s.userName}</p>
                  <p className="text-[11px] text-surface-400">{s.userEmail}</p>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2 text-surface-200 font-medium">
                    <Monitor className="w-4 h-4 text-brand-400 flex-shrink-0" />
                    <span>{s.deviceName}</span>
                  </div>
                </td>
                <td className="p-3 font-mono text-cyan-400">{s.ipAddress}</td>
                <td className="p-3 text-surface-400 font-mono">{s.loginTime}</td>
                <td className="p-3 text-emerald-400 font-semibold">{s.lastActivity}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleRevokeSession(s.id, s.userName)}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[11px] font-bold flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      Revoke
                    </button>
                    <button
                      onClick={() => handleRevokeAllForUser(s.userId, s.userName)}
                      className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[11px] font-bold"
                    >
                      Logout All Devices
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
