import { useState } from 'react';
import { useLIMS } from '../../context/LIMSContext';
import {
  Bell, CheckCircle2, AlertTriangle, Clock, Wrench, ChevronDown, X
} from 'lucide-react';
import type { Notification } from '../../types';

function NotifIcon({ type }: { type: Notification['type'] }) {
  if (type === 'calibration_due' || type === 'equipment_expired') return <Wrench className="w-4 h-4 text-warning-400" />;
  if (type === 'test_failed') return <AlertTriangle className="w-4 h-4 text-danger-400" />;
  if (type === 'report_approved') return <CheckCircle2 className="w-4 h-4 text-success-400" />;
  return <Clock className="w-4 h-4 text-brand-400" />;
}

export function NotificationCenter() {
  const { notifications, markNotificationRead } = useLIMS();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 card shadow-2xl z-50 animate-fade-in">
          <div className="flex items-center justify-between p-3 border-b border-surface-700">
            <span className="text-sm font-semibold text-surface-100">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-surface-500 hover:text-surface-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-surface-800">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`w-full text-left p-3 flex gap-3 hover:bg-surface-800 transition-colors ${!n.read ? 'bg-surface-800/50' : ''}`}
              >
                <div className="mt-0.5"><NotifIcon type={n.type} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-surface-100 truncate">{n.title}</p>
                    {!n.read && <span className="w-1.5 h-1.5 bg-brand-400 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-surface-600 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
