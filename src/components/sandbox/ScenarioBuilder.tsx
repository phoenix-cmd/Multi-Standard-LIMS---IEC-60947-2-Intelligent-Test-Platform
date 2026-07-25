import React, { useState, useEffect } from 'react';
import type { ScenarioConfig, EngineerConfig, EquipmentConfig } from '../../sandbox/ScenarioTypes';
import { Settings2, Users, Cpu, Wind, Clock, Zap, Save, Plus, Trash2 } from 'lucide-react';

interface ScenarioBuilderProps {
  pendingConfig: Partial<ScenarioConfig> | null;
  onSave(config: Omit<ScenarioConfig, 'id'>): void;
}

const DEFAULT_CONFIG: Omit<ScenarioConfig, 'id'> = {
  name: 'New Scenario',
  description: '',
  engineers: [
    { id: 'eng-01', name: 'Dr. Arjun Mehta', role: 'senior', specializations: ['IEC 60947-2'], availableHours: 8, errorRate: 0.02 },
  ],
  equipment: [
    { id: 'eq-01', name: 'Short Circuit Test Bench', type: 'test-bench', failureProbability: 0.05, calibrationStatus: 'valid' },
    { id: 'eq-02', name: 'Oscilloscope', type: 'measurement', failureProbability: 0.02, calibrationStatus: 'valid' },
  ],
  environment: { temperature: 25, humidity: 55, powerAvailable: true, networkAvailable: true, emergencyPower: false },
  workingHours: { startHour: 8, endHour: 17, daysPerWeek: 5, overtimeAllowed: false },
  sampleCount: 5,
  standardId: 'IEC60947-2',
  simulationDurationHours: 8,
  failureInjectionEnabled: false,
  aiInterventionEnabled: true,
  tags: [],
};

function uid(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function ScenarioBuilder({ pendingConfig, onSave }: ScenarioBuilderProps) {
  const [config, setConfig] = useState<Omit<ScenarioConfig, 'id'>>({ ...DEFAULT_CONFIG });

  useEffect(() => {
    if (pendingConfig) {
      setConfig({ ...DEFAULT_CONFIG, ...pendingConfig });
    }
  }, [pendingConfig]);

  const update = <K extends keyof typeof config>(key: K, value: typeof config[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const addEngineer = () => {
    const eng: EngineerConfig = {
      id: `eng-${uid()}`, name: 'New Engineer', role: 'junior',
      specializations: [], availableHours: 8, errorRate: 0.08,
    };
    update('engineers', [...config.engineers, eng]);
  };

  const removeEngineer = (id: string) => {
    update('engineers', config.engineers.filter((e) => e.id !== id));
  };

  const updateEngineer = (id: string, field: keyof EngineerConfig, value: unknown) => {
    update('engineers', config.engineers.map((e) => e.id === id ? { ...e, [field]: value } : e));
  };

  const addEquipment = () => {
    const eq: EquipmentConfig = {
      id: `eq-${uid()}`, name: 'New Equipment', type: 'measurement',
      failureProbability: 0.05, calibrationStatus: 'valid',
    };
    update('equipment', [...config.equipment, eq]);
  };

  const removeEquipment = (id: string) => {
    update('equipment', config.equipment.filter((e) => e.id !== id));
  };

  const updateEquipment = (id: string, field: keyof EquipmentConfig, value: unknown) => {
    update('equipment', config.equipment.map((e) => e.id === id ? { ...e, [field]: value } : e));
  };

  const inputCls = 'w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-xs text-surface-200 focus:outline-none focus:border-brand-500 placeholder-surface-600';
  const labelCls = 'block text-[10px] text-surface-500 uppercase tracking-wide font-semibold mb-1';

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* Basic Info */}
        <section className="bg-surface-900 rounded-2xl border border-surface-800 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="w-4 h-4 text-brand-400" />
            <h3 className="font-bold text-surface-200 text-sm">Basic Configuration</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Scenario Name</label>
              <input value={config.name} onChange={(e) => update('name', e.target.value)} className={inputCls} placeholder="My Scenario" />
            </div>
            <div>
              <label className={labelCls}>Standard</label>
              <select value={config.standardId} onChange={(e) => update('standardId', e.target.value)} className={inputCls}>
                <option value="IEC60947-2">IEC 60947-2</option>
                <option value="UL489">UL 489</option>
                <option value="IEC60898-1">IEC 60898-1</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Sample Count</label>
              <input type="number" min={1} max={50} value={config.sampleCount} onChange={(e) => update('sampleCount', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Simulation Duration (hours)</label>
              <input type="number" min={1} max={48} value={config.simulationDurationHours} onChange={(e) => update('simulationDurationHours', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <input value={config.description ?? ''} onChange={(e) => update('description', e.target.value)} className={inputCls} placeholder="Optional description" />
            </div>
          </div>
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.failureInjectionEnabled} onChange={(e) => update('failureInjectionEnabled', e.target.checked)} className="accent-brand-500" />
              <span className="text-xs text-surface-400">Failure Injection</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.aiInterventionEnabled} onChange={(e) => update('aiInterventionEnabled', e.target.checked)} className="accent-brand-500" />
              <span className="text-xs text-surface-400">AI Intervention</span>
            </label>
          </div>
        </section>

        {/* Engineers */}
        <section className="bg-surface-900 rounded-2xl border border-surface-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-surface-200 text-sm">Engineers</h3>
            </div>
            <button onClick={addEngineer} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {config.engineers.map((eng) => (
            <div key={eng.id} className="grid grid-cols-12 gap-2 items-center bg-surface-800 rounded-xl p-3">
              <div className="col-span-4">
                <input value={eng.name} onChange={(e) => updateEngineer(eng.id, 'name', e.target.value)} className={inputCls} />
              </div>
              <div className="col-span-3">
                <select value={eng.role} onChange={(e) => updateEngineer(eng.id, 'role', e.target.value)} className={inputCls}>
                  <option value="senior">Senior</option>
                  <option value="junior">Junior</option>
                  <option value="trainee">Trainee</option>
                </select>
              </div>
              <div className="col-span-2">
                <input type="number" min={1} max={16} value={eng.availableHours} onChange={(e) => updateEngineer(eng.id, 'availableHours', Number(e.target.value))} className={inputCls} title="Available hours" />
              </div>
              <div className="col-span-2">
                <input type="number" min={0} max={1} step={0.01} value={eng.errorRate} onChange={(e) => updateEngineer(eng.id, 'errorRate', Number(e.target.value))} className={inputCls} title="Error rate (0–1)" />
              </div>
              <div className="col-span-1 flex justify-center">
                <button onClick={() => removeEngineer(eng.id)} className="text-surface-600 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-surface-600">Columns: Name · Role · Hours · Error Rate</p>
        </section>

        {/* Equipment */}
        <section className="bg-surface-900 rounded-2xl border border-surface-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-surface-200 text-sm">Equipment</h3>
            </div>
            <button onClick={addEquipment} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {config.equipment.map((eq) => (
            <div key={eq.id} className="grid grid-cols-12 gap-2 items-center bg-surface-800 rounded-xl p-3">
              <div className="col-span-4">
                <input value={eq.name} onChange={(e) => updateEquipment(eq.id, 'name', e.target.value)} className={inputCls} />
              </div>
              <div className="col-span-3">
                <select value={eq.calibrationStatus} onChange={(e) => updateEquipment(eq.id, 'calibrationStatus', e.target.value)} className={inputCls}>
                  <option value="valid">Cal. Valid</option>
                  <option value="due">Due Soon</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="col-span-3">
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="text-[10px] text-surface-500">Fail %</span>
                  <input type="range" min={0} max={1} step={0.05} value={eq.failureProbability} onChange={(e) => updateEquipment(eq.id, 'failureProbability', Number(e.target.value))} className="flex-1 accent-orange-500" />
                  <span className="text-xs text-orange-400 w-8 text-right">{Math.round(eq.failureProbability * 100)}%</span>
                </div>
              </div>
              <div className="col-span-2 flex justify-center">
                <button onClick={() => removeEquipment(eq.id)} className="text-surface-600 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Environment & Working Hours */}
        <div className="grid grid-cols-2 gap-4">
          <section className="bg-surface-900 rounded-2xl border border-surface-800 p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-surface-200 text-sm">Environment</h3>
            </div>
            <div>
              <label className={labelCls}>Temperature (°C)</label>
              <input type="number" value={config.environment.temperature} onChange={(e) => update('environment', { ...config.environment, temperature: Number(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Humidity (%)</label>
              <input type="number" value={config.environment.humidity} onChange={(e) => update('environment', { ...config.environment, humidity: Number(e.target.value) })} className={inputCls} />
            </div>
            <div className="space-y-2">
              {[
                { key: 'powerAvailable', label: 'Mains Power Available' },
                { key: 'networkAvailable', label: 'Network Available' },
                { key: 'emergencyPower', label: 'Emergency Generator' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.environment[key as keyof typeof config.environment] as boolean}
                    onChange={(e) => update('environment', { ...config.environment, [key]: e.target.checked })}
                    className="accent-teal-500"
                  />
                  <span className="text-xs text-surface-400">{label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-surface-900 rounded-2xl border border-surface-800 p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-400" />
              <h3 className="font-bold text-surface-200 text-sm">Working Hours</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Start Hour</label>
                <input type="number" min={0} max={23} value={config.workingHours.startHour} onChange={(e) => update('workingHours', { ...config.workingHours, startHour: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>End Hour</label>
                <input type="number" min={0} max={23} value={config.workingHours.endHour} onChange={(e) => update('workingHours', { ...config.workingHours, endHour: Number(e.target.value) })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Days per Week</label>
              <input type="number" min={1} max={7} value={config.workingHours.daysPerWeek} onChange={(e) => update('workingHours', { ...config.workingHours, daysPerWeek: Number(e.target.value) })} className={inputCls} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.workingHours.overtimeAllowed} onChange={(e) => update('workingHours', { ...config.workingHours, overtimeAllowed: e.target.checked })} className="accent-yellow-500" />
              <span className="text-xs text-surface-400">Overtime Allowed</span>
            </label>
          </section>
        </div>

        {/* Save */}
        <button
          onClick={() => onSave(config)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          Save & Add to Scenarios
        </button>
      </div>
    </div>
  );
}
