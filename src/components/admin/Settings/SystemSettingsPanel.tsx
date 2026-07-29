import React, { useState } from 'react';
import { Sliders, Save, Check, Server, Mail, HardDrive, Shield } from 'lucide-react';

export function SystemSettingsPanel() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    sessionTimeoutMinutes: 30,
    jwtLifetimeHours: 8,
    maxFileUploadMB: 50,
    defaultTheme: 'dark',
    defaultStandardEdition: 'IS/IEC 60947-2:2003',
    smtpHost: 'smtp.lab-lims.internal',
    smtpPort: 587,
    smtpSender: 'notifications@netl-lims.in',
    backupSchedule: 'daily',
    notificationEmailAlerts: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-100">System Configuration & Integration Settings</h2>
            <p className="text-xs text-surface-400">Manage session timeouts, JWT token lifespans, storage quotas, SMTP server config, and backup schedules</p>
          </div>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Settings Saved' : 'Save System Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session & Storage Settings */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-surface-200 uppercase tracking-wider flex items-center gap-2 border-b border-surface-800 pb-2">
            <Server className="w-4 h-4 text-brand-400" />
            Sessions, JWT & Storage Quotas
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-surface-400">Inactivity Session Timeout (Minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeoutMinutes}
                onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: parseInt(e.target.value, 10) })}
                className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-100 mt-1 font-mono"
              />
            </div>

            <div>
              <label className="text-surface-400">JWT Token Lifetime (Hours)</label>
              <input
                type="number"
                value={settings.jwtLifetimeHours}
                onChange={(e) => setSettings({ ...settings, jwtLifetimeHours: parseInt(e.target.value, 10) })}
                className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-100 mt-1 font-mono"
              />
            </div>

            <div>
              <label className="text-surface-400">Max File Upload Size Limit (MB)</label>
              <input
                type="number"
                value={settings.maxFileUploadMB}
                onChange={(e) => setSettings({ ...settings, maxFileUploadMB: parseInt(e.target.value, 10) })}
                className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-100 mt-1 font-mono"
              />
            </div>

            <div>
              <label className="text-surface-400">Default Standard Edition Plugin</label>
              <select
                value={settings.defaultStandardEdition}
                onChange={(e) => setSettings({ ...settings, defaultStandardEdition: e.target.value })}
                className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-100 mt-1 font-semibold"
              >
                <option value="IS/IEC 60947-2:2003">IS/IEC 60947-2:2003 (Canonical Indian Standard)</option>
                <option value="IEC 60947-2:2016">IEC 60947-2:2016 Ed 5.0 (International Standard)</option>
                <option value="UL 489:2019">UL 489 14th Edition (North American Standard)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email & Backup Settings */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-surface-200 uppercase tracking-wider flex items-center gap-2 border-b border-surface-800 pb-2">
            <Mail className="w-4 h-4 text-purple-400" />
            Email SMTP & Database Backup Schedule
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-surface-400">SMTP Host Server</label>
              <input
                type="text"
                value={settings.smtpHost}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-100 mt-1 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-surface-400">SMTP Port</label>
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value, 10) })}
                  className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-100 mt-1 font-mono"
                />
              </div>

              <div>
                <label className="text-surface-400">Backup Schedule</label>
                <select
                  value={settings.backupSchedule}
                  onChange={(e) => setSettings({ ...settings, backupSchedule: e.target.value as any })}
                  className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-100 mt-1 font-semibold"
                >
                  <option value="daily">Daily Automated Backup</option>
                  <option value="weekly">Weekly Automated Backup</option>
                  <option value="monthly">Monthly Automated Backup</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-surface-400">Notification Sender Email</label>
              <input
                type="email"
                value={settings.smtpSender}
                onChange={(e) => setSettings({ ...settings, smtpSender: e.target.value })}
                className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-100 mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
