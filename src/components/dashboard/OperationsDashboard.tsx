import { useLIMS } from '../../context/LIMSContext';
import {
  CheckCircle2, XCircle, FlaskConical, Package, Clock, Wrench, TrendingUp, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6'];

const monthlyData = [
  { month: 'Feb', pass: 12, fail: 2 },
  { month: 'Mar', pass: 15, fail: 1 },
  { month: 'Apr', pass: 10, fail: 3 },
  { month: 'May', pass: 18, fail: 2 },
  { month: 'Jun', pass: 14, fail: 4 },
  { month: 'Jul', pass: 8, fail: 1 },
];

const clauseFailures = [
  { clause: '8.3.3.3', count: 7, label: 'Trip Char.' },
  { clause: '8.3.3.1', count: 4, label: 'Temp Rise' },
  { clause: '8.3.4', count: 3, label: 'Icu' },
  { clause: '8.3.3.2', count: 2, label: 'Dielectric' },
  { clause: '8.3.5', count: 1, label: 'Ics' },
];

const verdictData = [
  { name: 'PASS', value: 77 },
  { name: 'FAIL', value: 13 },
  { name: 'Pending', value: 10 },
];

function KPICard({ icon: Icon, label, value, sub, color = 'brand' }: {
  icon: React.FC<{ className?: string }>; label: string; value: string | number; sub?: string; color?: string;
}) {
  const colorMap: { [key: string]: string } = {
    brand: 'text-brand-400 bg-brand-600/10 border-brand-600/20',
    success: 'text-success-400 bg-success-600/10 border-success-600/20',
    danger: 'text-danger-400 bg-danger-600/10 border-danger-600/20',
    warning: 'text-warning-400 bg-warning-600/10 border-warning-600/20',
  };
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-surface-100">{value}</p>
        <p className="text-xs text-surface-400 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-surface-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function OperationsDashboard() {
  const { samples, equipment, getPassRate, getEquipmentDueForCalibration } = useLIMS();
  const passRate = getPassRate();
  const calibDue = getEquipmentDueForCalibration();
  const testing = samples.filter((s) => s.lifecycleState === 'Testing').length;
  const pending = samples.filter((s) => ['Waiting', 'Inspection', 'Accepted', 'Received'].includes(s.lifecycleState)).length;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Package} label="Active Samples" value={samples.length} sub={`${testing} in testing`} color="brand" />
        <KPICard icon={CheckCircle2} label="Overall Pass Rate" value={`${passRate}%`} sub="Last 6 months" color="success" />
        <KPICard icon={FlaskConical} label="Tests This Month" value={monthlyData[monthlyData.length - 1].pass + monthlyData[monthlyData.length - 1].fail} sub="+3 vs last month" color="brand" />
        <KPICard icon={AlertTriangle} label="Calibration Due" value={calibDue.length} sub="Within 30 days" color={calibDue.length > 0 ? 'warning' : 'success'} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly pass/fail */}
        <div className="card p-4 lg:col-span-2">
          <p className="section-title">Monthly Test Results</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="pass" fill="#10b981" radius={[4, 4, 0, 0]} name="PASS" />
              <Bar dataKey="fail" fill="#ef4444" radius={[4, 4, 0, 0]} name="FAIL" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Verdict pie */}
        <div className="card p-4">
          <p className="section-title">Verdict Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={verdictData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {verdictData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {verdictData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-xs text-surface-400">{d.name} {d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clause failure Pareto */}
      <div className="card p-4">
        <p className="section-title">Clause Failure Pareto (All-time)</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={clauseFailures} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Failures" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent samples table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-surface-800">
          <p className="section-title">Recent Samples</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-800">
                {['Report No.', 'Client', 'Model', 'Standard', 'State', 'Assigned'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {samples.map((s) => (
                <tr key={s.id} className="hover:bg-surface-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-brand-400">{s.reportNo}</td>
                  <td className="px-4 py-3 text-xs text-surface-200">{s.clientName}</td>
                  <td className="px-4 py-3 text-xs text-surface-300">{s.specification.model}</td>
                  <td className="px-4 py-3 text-xs text-surface-400">IEC 60947-2</td>
                  <td className="px-4 py-3">
                    <LifecycleBadge state={s.lifecycleState} />
                  </td>
                  <td className="px-4 py-3 text-xs text-surface-400">{s.assignedTo === 'u2' ? 'Priya Sharma' : 'Rahul Verma'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LifecycleBadge({ state }: { state: string }) {
  const map: Record<string, string> = {
    Received: 'badge-warn', Accepted: 'badge-warn', Inspection: 'badge-warn',
    Waiting: 'badge-warn', Testing: 'badge-warn', Paused: 'badge-warn',
    Completed: 'badge-pass', Review: 'badge-pass', Approved: 'badge-pass',
    Released: 'badge-pass', Archived: 'badge-na',
  };
  const stateColor: Record<string, string> = {
    Testing: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-brand-600/20 text-brand-400 border border-brand-600/40',
    Approved: 'badge-pass', Completed: 'badge-pass', Released: 'badge-pass',
    Archived: 'badge-na',
  };
  return <span className={stateColor[state] || map[state] || 'badge-na'}>{state}</span>;
}
