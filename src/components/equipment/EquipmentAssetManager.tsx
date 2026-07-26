import { useState } from 'react';
import { useLIMS } from '../../context/LIMSContext';
import type { Equipment, EquipmentStatus } from '../../types';
import {
  Wrench, AlertTriangle, CheckCircle2, XCircle, Clock,
  QrCode, Calendar, Activity, FileText, Plus, X
} from 'lucide-react';

import { useContextMenu } from '../../desktop/ContextMenuProvider';
import { useDesktopWorkspace } from '../../desktop/DesktopWorkspaceContext';
import { v4 as uuidv4 } from 'uuid';

function statusBadge(status: EquipmentStatus) {
  const map: Record<EquipmentStatus, { cls: string; icon: React.ReactNode; label: string }> = {
    Operational: { cls: 'badge-pass', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Operational' },
    CalibrationDue: { cls: 'badge-warn', icon: <Clock className="w-3 h-3" />, label: 'Cal. Due' },
    Maintenance: { cls: 'badge-warn', icon: <Wrench className="w-3 h-3" />, label: 'Maintenance' },
    OutOfService: { cls: 'badge-fail', icon: <XCircle className="w-3 h-3" />, label: 'Out of Service' },
    Quarantined: { cls: 'badge-fail', icon: <AlertTriangle className="w-3 h-3" />, label: 'Quarantined' },
  };
  const { cls, icon, label } = map[status] || map.Operational;
  return <span className={cls}>{icon}{label}</span>;
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function EquipmentCard({
  eq,
  isSelected,
  onSelect,
}: {
  eq: Equipment;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { showContextMenu } = useContextMenu();
  const { inspectObject } = useDesktopWorkspace();
  const days = daysUntil(eq.nextCalibrationDue);

  const handleClick = () => {
    onSelect();
    inspectObject({
      type: 'equipment',
      id: eq.id,
      title: `${eq.name} (${eq.assetTag})`,
      subtitle: `${eq.manufacturer} ${eq.model} · Location: ${eq.location}`,
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    showContextMenu(e, {
      type: 'equipment',
      id: eq.id,
      title: `${eq.name} (${eq.assetTag})`,
      subtitle: `${eq.manufacturer} ${eq.model}`,
    });
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={`card p-4 text-left w-full hover:border-brand-600/40 transition-all cursor-pointer select-none ${
        isSelected ? 'border-brand-500/50 bg-brand-600/5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-mono text-brand-400">{eq.assetTag}</p>
          <p className="text-sm font-semibold text-surface-100 mt-0.5">{eq.name}</p>
          <p className="text-xs text-surface-400">
            {eq.manufacturer} {eq.model}
          </p>
        </div>
        {statusBadge(eq.status)}
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-surface-500">
        <span>
          <Calendar className="w-3 h-3 inline mr-1" />
          Cal due: {eq.nextCalibrationDue}
        </span>
        <span className={`font-semibold ${days < 14 ? 'text-warning-400' : 'text-surface-400'}`}>
          {days > 0 ? `${days}d left` : 'OVERDUE'}
        </span>
      </div>
      <div className="mt-2 h-1.5 bg-surface-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${days < 14 ? 'bg-warning-500' : 'bg-success-500'}`}
          style={{ width: `${Math.min(Math.max((days / 365) * 100, 5), 100)}%` }}
        />
      </div>
    </div>
  );
}

export function EquipmentAssetManager() {
  const { equipment } = useLIMS();
  const [localEquipment, setLocalEquipment] = useState<Equipment[]>(equipment);
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [tab, setTab] = useState<'list' | 'calibration'>('list');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Measurement');
  const [manufacturer, setManufacturer] = useState('Tektronix');
  const [model, setModel] = useState('MSO-54B');
  const [location, setLocation] = useState('HV Lab Bay 1');
  const [calDue, setCalDue] = useState('2026-12-31');

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tag = `LAB-EQ-00${localEquipment.length + 1}`;
    const newEq: Equipment = {
      id: uuidv4(),
      assetTag: tag,
      name,
      model,
      manufacturer,
      serialNo: `${manufacturer.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      category,
      location,
      status: 'Operational',
      hoursUsed: 120,
      lastUsedDate: new Date().toISOString().split('T')[0],
      purchaseDate: new Date().toISOString().split('T')[0],
      nextCalibrationDue: calDue,
      currentCertNo: `NABL-CERT-${Date.now().toString().slice(-4)}`,
      qrCode: tag,
      photos: [],
      calibrationHistory: [
        {
          id: uuidv4(),
          date: new Date().toISOString().split('T')[0],
          nextDue: calDue,
          performedBy: 'Certified NABL Auditor',
          certificateNo: `NABL-CERT-${Date.now().toString().slice(-4)}`,
          result: 'Pass',
          notes: 'Initial commissioning calibration verified.',
        },
      ],
    };

    setLocalEquipment((prev) => [newEq, ...prev]);
    setName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['list', 'calibration'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={tab === t ? 'btn-primary py-1.5 px-4 text-xs' : 'btn-secondary py-1.5 px-4 text-xs'}>
              {t === 'list' ? 'Asset Register' : 'Calibration Schedule'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Asset
        </button>
      </div>

      {tab === 'list' && (
        <div className="flex gap-4">
          {/* Equipment cards */}
          <div className={`${selected ? 'w-72 flex-shrink-0' : 'flex-1'} space-y-3`}>
            {localEquipment.map((eq) => (
              <EquipmentCard
                key={eq.id}
                eq={eq}
                isSelected={selected?.id === eq.id}
                onSelect={() => setSelected(eq.id === selected?.id ? null : eq)}
              />
            ))}
          </div>

          {/* Equipment detail */}
          {selected && (
            <div className="flex-1 space-y-4 animate-fade-in">
              <div className="card p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-600/10 rounded-xl border border-brand-600/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-surface-100">{selected.name}</p>
                    <p className="text-xs text-surface-400">{selected.manufacturer} · {selected.model} · S/N: {selected.serialNo}</p>
                  </div>
                  <div className="ml-auto">{statusBadge(selected.status)}</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {[
                    ['Asset Tag', selected.assetTag],
                    ['Category', selected.category],
                    ['Location', selected.location],
                    ['Hours Used', `${selected.hoursUsed} h`],
                    ['Last Used', selected.lastUsedDate],
                    ['Purchase Date', selected.purchaseDate],
                    ['Cert. No.', selected.currentCertNo ?? '—'],
                    ['Cal. Due', selected.nextCalibrationDue],
                    ['Days Left', `${daysUntil(selected.nextCalibrationDue)} days`],
                  ].map(([k, v]) => (
                    <div key={k as string} className="bg-surface-800 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-surface-500 uppercase tracking-wide">{k}</p>
                      <p className="text-surface-100 font-medium mt-0.5 truncate">{v as string}</p>
                    </div>
                  ))}
                </div>

                {/* QR code */}
                <div className="mt-4 flex items-center gap-3 p-3 bg-surface-800 rounded-lg">
                  <QrCode className="w-8 h-8 text-brand-400" />
                  <div>
                    <p className="text-xs font-semibold text-surface-200">QR Code: {selected.qrCode}</p>
                    <p className="text-[11px] text-surface-500">Scan to view asset record and calibration status</p>
                  </div>
                </div>
              </div>

              {/* Calibration history */}
              <div className="card p-4">
                <p className="section-title">Calibration History</p>
                <div className="space-y-2">
                  {selected.calibrationHistory.map((c) => (
                    <div key={c.id} className="bg-surface-800 rounded-lg p-3 flex items-center gap-3 text-xs">
                      <span className={c.result === 'Pass' ? 'badge-pass' : 'badge-fail'}>
                        {c.result}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-surface-200">Cert: {c.certificateNo}</p>
                        <p className="text-surface-400">By: {c.performedBy} · {c.date}</p>
                        {c.notes && <p className="text-surface-500 italic mt-0.5">{c.notes}</p>}
                      </div>
                      <div className="text-right text-surface-500">
                        <p>Next due</p>
                        <p className="text-brand-400 font-medium">{c.nextDue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'calibration' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-surface-800">
            <p className="section-title">Calibration Schedule</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-800">
                {['Asset', 'Equipment', 'Due Date', 'Days Left', 'Last Cert', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {[...localEquipment].sort((a, b) => new Date(a.nextCalibrationDue).getTime() - new Date(b.nextCalibrationDue).getTime()).map((eq) => {
                const days = daysUntil(eq.nextCalibrationDue);
                return (
                  <tr key={eq.id} className="hover:bg-surface-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-brand-400">{eq.assetTag}</td>
                    <td className="px-4 py-3 text-xs text-surface-200">{eq.name}</td>
                    <td className="px-4 py-3 text-xs text-surface-300">{eq.nextCalibrationDue}</td>
                    <td className={`px-4 py-3 text-xs font-bold ${days < 0 ? 'text-danger-400' : days < 30 ? 'text-warning-400' : 'text-success-400'}`}>
                      {days < 0 ? `${Math.abs(days)}d OVERDUE` : `${days}d`}
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-400 font-mono">{eq.currentCertNo ?? '—'}</td>
                    <td className="px-4 py-3">{statusBadge(eq.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for adding new equipment */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-800 pb-3">
              <h3 className="text-sm font-bold text-surface-50 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-brand-400" /> Register New Asset
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-surface-400 hover:text-surface-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wide mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. High-Power Injection Transformer"
                  required
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wide mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wide mb-1">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wide mb-1">Location / Bay</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wide mb-1">Calibration Due</label>
                  <input
                    type="date"
                    value={calDue}
                    onChange={(e) => setCalDue(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-surface-800 text-surface-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold shadow"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
