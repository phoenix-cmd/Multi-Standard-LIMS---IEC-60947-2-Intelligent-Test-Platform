import React from 'react';
import { Key, Shield, Search } from 'lucide-react';
import { PERMISSION_CATALOG } from '../../../../backend/src/platform/admin/domain/RBACEngine';

export function PermissionCatalogPanel() {
  const [filter, setFilter] = React.useState('');

  const filtered = PERMISSION_CATALOG.filter(
    (p) =>
      p.code.toLowerCase().includes(filter.toLowerCase()) ||
      p.category.toLowerCase().includes(filter.toLowerCase()) ||
      p.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-surface-100">Fine-Grained System Permission Catalog</h2>
            <p className="text-xs text-surface-400">Canonical reference of security scope permissions enforced across REST APIs and frontend views</p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-surface-500" />
          <input
            type="text"
            placeholder="Search permission code or scope..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-surface-950 border border-surface-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-surface-200 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-950 border-b border-surface-800 text-[11px] font-extrabold text-surface-400 uppercase tracking-wider">
              <th className="p-3">Permission Code</th>
              <th className="p-3">Functional Module</th>
              <th className="p-3">Description & Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/60 text-xs">
            {filtered.map((p) => (
              <tr key={p.code} className="hover:bg-surface-800/40 transition-colors">
                <td className="p-3">
                  <span className="font-mono text-brand-300 font-bold bg-brand-950/40 border border-brand-500/30 px-2 py-0.5 rounded text-[11px]">
                    {p.code}
                  </span>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-surface-800 text-surface-300 rounded font-semibold text-[10px]">
                    {p.category}
                  </span>
                </td>
                <td className="p-3 text-surface-300">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
