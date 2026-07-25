import React, { useState } from 'react';
import { useDesktopWorkspace } from '../../desktop/DesktopWorkspaceContext';
import { useLIMS } from '../../context/LIMSContext';
import { X, Bell, CheckCheck, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export function NotificationCenter() {
  const { notificationDrawerOpen, setNotificationDrawerOpen, openTab } = useDesktopWorkspace();
  const { notifications, markNotificationRead } = useLIMS();
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  if (!notificationDrawerOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'critical') return n.type === 'test_failed' || n.type === 'equipment_expired' || n.type === 'calibration_due';
    return true;
  });

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-surface-900 border-l border-surface-800 shadow-2xl flex flex-col backdrop-blur-md">
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-800 flex items-center justify-between bg-surface-950">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-400" />
          <h3 className="font-bold text-surface-100 text-sm">Notification Center</h3>
        </div>
        <button onClick={() => setNotificationDrawerOpen(false)} className="text-surface-500 hover:text-surface-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-950/60 border-b border-surface-800">
        <div className="flex gap-1">
          {(['all', 'unread', 'critical'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase transition-colors ${
                filter === f ? 'bg-brand-600 text-white' : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => notifications.forEach((n) => markNotificationRead(n.id))}
          className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 font-semibold"
        >
          <CheckCheck className="w-3 h-3" /> Mark all read
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-surface-500 text-xs">No notifications found in this view.</div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                !n.read ? 'bg-brand-600/10 border-brand-500/30' : 'bg-surface-800/40 border-surface-800 hover:bg-surface-800/70'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {(n.type === 'test_failed' || n.type === 'equipment_expired') && (
                  <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                {n.type === 'calibration_due' && <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />}
                {n.type === 'report_approved' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                {(n.type === 'sample_waiting' || n.type === 'sign_pending') && (
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-surface-100">{n.title}</p>
                  <p className="text-[11px] text-surface-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[9px] text-surface-600 mt-1 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
