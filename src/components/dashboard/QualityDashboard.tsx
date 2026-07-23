import { useLIMS } from '../../context/LIMSContext';
import { Shield, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, CartesianGrid } from 'recharts';

const clausePassRates = [
  { clause: '8.3.3.1', rate: 92, label: 'Temp Rise' },
  { clause: '8.3.3.2', rate: 96, label: 'Dielectric' },
  { clause: '8.3.3.3', rate: 85, label: 'Trip Char.' },
  { clause: '8.3.4', rate: 96, label: 'Icu' },
  { clause: '8.3.5', rate: 98, label: 'Ics' },
];

const nonConformances = [
  { month: 'Feb', count: 3 }, { month: 'Mar', count: 1 }, { month: 'Apr', count: 4 },
  { month: 'May', count: 2 }, { month: 'Jun', count: 5 }, { month: 'Jul', count: 1 },
];

export function QualityDashboard() {
  const { samples, getPassRate } = useLIMS();
  const passRate = getPassRate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Pass Rate', value: `${passRate}%`, color: 'text-success-400' },
          { label: 'Non-Conformances (MTD)', value: '1', color: 'text-warning-400' },
          { label: 'Open CAPAs', value: '3', color: 'text-danger-400' },
          { label: 'Reports Approved', value: '2', color: 'text-brand-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-surface-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="section-title">Clause Pass Rate (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={clausePassRates}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`, 'Pass Rate']} />
              <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <p className="section-title">Non-Conformances per Month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={nonConformances}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CAPA table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-surface-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-400" />
          <p className="section-title mb-0">Open Corrective Actions (CAPA)</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-surface-800">
              {['ID', 'Sample', 'Clause', 'Root Cause', 'Owner', 'Due', 'Status'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/60">
            {[
              { id: 'CAPA-2026-011', sample: 'LAB-2026-MCCB-00890', clause: '8.3.3.3', cause: 'Bimetal calibration drift', owner: 'Priya Sharma', due: '2026-07-30', status: 'In Progress' },
              { id: 'CAPA-2026-009', sample: 'LAB-2026-MCCB-00887', clause: '8.3.3.1', cause: 'High terminal contact resistance', owner: 'Rahul Verma', due: '2026-07-25', status: 'Open' },
              { id: 'CAPA-2026-007', sample: 'LAB-2026-MCCB-00882', clause: '8.3.3.2', cause: 'Arc chute carbonization', owner: 'Priya Sharma', due: '2026-07-20', status: 'Overdue' },
            ].map((c) => (
              <tr key={c.id} className="hover:bg-surface-800/30">
                <td className="px-4 py-3 font-mono text-brand-400">{c.id}</td>
                <td className="px-4 py-3 text-surface-300">{c.sample}</td>
                <td className="px-4 py-3 text-surface-400">{c.clause}</td>
                <td className="px-4 py-3 text-surface-300">{c.cause}</td>
                <td className="px-4 py-3 text-surface-400">{c.owner}</td>
                <td className="px-4 py-3 text-surface-400">{c.due}</td>
                <td className="px-4 py-3">
                  <span className={c.status === 'Open' ? 'badge-na' : c.status === 'In Progress' ? 'badge-warn' : 'badge-fail'}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
