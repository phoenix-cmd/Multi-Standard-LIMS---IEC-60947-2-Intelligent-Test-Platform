import React, { useState } from 'react';
import { Building2, Globe, Save, Check } from 'lucide-react';

export function OrganizationSettingsPanel() {
  const [saved, setSaved] = useState(false);
  const [org, setOrg] = useState({
    name: 'National Electrical Testing Laboratories Inc.',
    code: 'NETL-HQ',
    labName: 'High-Power Short-Circuit & IEC 60947-2 Test Facility',
    address: 'Plot 42, Tech Park, Industrial Corridor, Bangalore 560066, India',
    contactEmail: 'admin@netl-lims.in',
    contactPhone: '+91 80 2845 9900',
    timezone: 'Asia/Kolkata (IST)',
    logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&auto=format&fit=crop&q=80',
    brandingColor: '#0284c7',
    defaultLanguage: 'English (US)',
    defaultUnits: 'SI Metric (A, V, K, ms)',
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
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-100">Organization & Laboratory Profile</h2>
            <p className="text-xs text-surface-400">Configure accredited laboratory identity, branding, timezone, contact info, and default units</p>
          </div>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Profile Saved' : 'Save Organization Profile'}
        </button>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-surface-400 font-medium">Organization Legal Name</label>
            <input
              type="text"
              value={org.name}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
              className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2.5 text-surface-100 mt-1 font-semibold"
            />
          </div>

          <div>
            <label className="text-surface-400 font-medium">Organization Code</label>
            <input
              type="text"
              value={org.code}
              onChange={(e) => setOrg({ ...org, code: e.target.value })}
              className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2.5 text-surface-100 mt-1 font-mono"
            />
          </div>

          <div>
            <label className="text-surface-400 font-medium">Laboratory Facility Name</label>
            <input
              type="text"
              value={org.labName}
              onChange={(e) => setOrg({ ...org, labName: e.target.value })}
              className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2.5 text-surface-100 mt-1"
            />
          </div>

          <div>
            <label className="text-surface-400 font-medium">Primary Contact Email</label>
            <input
              type="email"
              value={org.contactEmail}
              onChange={(e) => setOrg({ ...org, contactEmail: e.target.value })}
              className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2.5 text-surface-100 mt-1"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-surface-400 font-medium">Facility Address</label>
            <input
              type="text"
              value={org.address}
              onChange={(e) => setOrg({ ...org, address: e.target.value })}
              className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2.5 text-surface-100 mt-1"
            />
          </div>

          <div>
            <label className="text-surface-400 font-medium">Timezone</label>
            <input
              type="text"
              value={org.timezone}
              onChange={(e) => setOrg({ ...org, timezone: e.target.value })}
              className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2.5 text-surface-100 mt-1 font-mono"
            />
          </div>

          <div>
            <label className="text-surface-400 font-medium">Default Measurement Units</label>
            <input
              type="text"
              value={org.defaultUnits}
              onChange={(e) => setOrg({ ...org, defaultUnits: e.target.value })}
              className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2.5 text-surface-100 mt-1 font-mono"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
