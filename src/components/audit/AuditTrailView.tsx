import { useLIMS } from '../../context/LIMSContext';
import { ClipboardList, Shield, User } from 'lucide-react';

const ACTION_LABELS: Record<string, string> = {
  'sample:create': 'Sample Created',
  'sample:edit': 'Sample Updated',
  'test:execute': 'Test Executed',
  'report:approve': 'Report Approved',
  'standard:install': 'Standard Changed',
};

export function AuditTrailView() {
  const { auditEvents } = useLIMS();
  return (
    <div className="space-y-4">
      <div className="card p-4 bg-surface-900/50 flex items-center gap-2">
        <Shield className="w-4 h-4 text-success-400" />
        <p className="text-xs text-surface-300">
          All audit events are immutable, timestamped, and cryptographically chained. Exported in JSONL format for compliance.
        </p>
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-surface-800 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-brand-400" />
          <p className="section-title mb-0">Audit Trail — All Events</p>
        </div>
        <div className="divide-y divide-surface-800/60">
          {auditEvents.map((ev) => (
            <div key={ev.id} className="flex items-start gap-4 px-4 py-3 hover:bg-surface-800/30 transition-colors">
              <div className="w-2 h-2 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-semibold text-surface-100">{ACTION_LABELS[ev.action] ?? ev.action}</span>
                  <span className="badge-na text-[10px]">{ev.resource}</span>
                  <span className="text-[10px] font-mono text-surface-500">{ev.resourceId.slice(0, 8)}…</span>
                </div>
                <p className="text-xs text-surface-400 mt-0.5">{ev.details}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-surface-500 flex items-center gap-1">
                    <User className="w-3 h-3" />{ev.userName} ({ev.userId})
                  </span>
                  <span className="text-[10px] text-surface-600">{new Date(ev.timestamp).toLocaleString()}</span>
                  {ev.ipAddress && <span className="text-[10px] text-surface-600 font-mono">{ev.ipAddress}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
