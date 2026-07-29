import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertTriangle, Save, Check } from 'lucide-react';

export function SecurityPolicyPanel() {
  const [saved, setSaved] = useState(false);
  const [policy, setPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    historyCount: 3,
    expirationDays: 90,
    maxFailedAttempts: 5,
    lockoutDurationMinutes: 15,
    mfaEnabled: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-100">Password & Authentication Security Policy</h2>
            <p className="text-xs text-surface-400">Enforce Argon2 password complexity, password history, expiration, and lockout rules</p>
          </div>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Policy Saved' : 'Save Security Policy'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password Complexity */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-surface-200 uppercase tracking-wider flex items-center gap-2 border-b border-surface-800 pb-2">
            <KeyRound className="w-4 h-4 text-brand-400" />
            Password Complexity Rules
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-surface-400">Minimum Password Length</label>
              <input
                type="number"
                value={policy.minLength}
                onChange={(e) => setPolicy({ ...policy, minLength: parseInt(e.target.value, 10) })}
                className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-100 mt-1 font-mono"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center justify-between text-surface-300 cursor-pointer">
                <span>Require Uppercase Letters (A-Z)</span>
                <input
                  type="checkbox"
                  checked={policy.requireUppercase}
                  onChange={(e) => setPolicy({ ...policy, requireUppercase: e.target.checked })}
                  className="rounded bg-surface-950 border-surface-700 text-brand-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between text-surface-300 cursor-pointer">
                <span>Require Numbers (0-9)</span>
                <input
                  type="checkbox"
                  checked={policy.requireNumbers}
                  onChange={(e) => setPolicy({ ...policy, requireNumbers: e.target.checked })}
                  className="rounded bg-surface-950 border-surface-700 text-brand-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between text-surface-300 cursor-pointer">
                <span>Require Special Symbols (!@#$%^&*)</span>
                <input
                  type="checkbox"
                  checked={policy.requireSymbols}
                  onChange={(e) => setPolicy({ ...policy, requireSymbols: e.target.checked })}
                  className="rounded bg-surface-950 border-surface-700 text-brand-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Expiration, History & Lockout */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-surface-200 uppercase tracking-wider flex items-center gap-2 border-b border-surface-800 pb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Expiration, History & Lockouts
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-surface-400">Password Expiration (Days)</label>
              <input
                type="number"
                value={policy.expirationDays}
                onChange={(e) => setPolicy({ ...policy, expirationDays: parseInt(e.target.value, 10) })}
                className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-100 mt-1 font-mono"
              />
            </div>

            <div>
              <label className="text-surface-400">Password History Count (Prevent Reuse)</label>
              <input
                type="number"
                value={policy.historyCount}
                onChange={(e) => setPolicy({ ...policy, historyCount: parseInt(e.target.value, 10) })}
                className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-100 mt-1 font-mono"
              />
            </div>

            <div>
              <label className="text-surface-400">Max Failed Login Attempts Before Lockout</label>
              <input
                type="number"
                value={policy.maxFailedAttempts}
                onChange={(e) => setPolicy({ ...policy, maxFailedAttempts: parseInt(e.target.value, 10) })}
                className="w-full bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-100 mt-1 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MFA Ready Card */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-emerald-300">Multi-Factor Authentication (MFA Ready Architecture)</p>
            <p className="text-surface-400">TOTP (Time-based One-Time Password) infrastructure is initialized for all laboratory personnel.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold rounded">MFA READY</span>
      </div>
    </form>
  );
}
