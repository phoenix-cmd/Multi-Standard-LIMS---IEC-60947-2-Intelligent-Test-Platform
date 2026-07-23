import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  Sample, Equipment, StandardMetadata, User, AuditEvent,
  Notification, SampleLifecycleState, TestRun, Verdict
} from '../types';
import {
  SAMPLES, EQUIPMENT, STANDARDS, USERS, CURRENT_USER,
  NOTIFICATIONS, AUDIT_EVENTS
} from '../mock/enterpriseInitialData';
import { v4 as uuidv4 } from 'uuid';

interface LIMSContextValue {
  // Auth
  currentUser: User;
  users: User[];
  // Samples
  samples: Sample[];
  addSample: (s: Omit<Sample, 'id' | 'reportNo' | 'lifecycleHistory' | 'testRuns' | 'attachments'>) => Sample;
  updateSampleLifecycle: (sampleId: string, state: SampleLifecycleState, notes?: string) => void;
  addTestRun: (sampleId: string, run: TestRun) => void;
  // Equipment
  equipment: Equipment[];
  // Standards
  standards: StandardMetadata[];
  activateStandard: (id: string) => void;
  installStandard: (id: string) => void;
  // Audit
  auditEvents: AuditEvent[];
  logAudit: (action: string, resource: string, resourceId: string, details: string) => void;
  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  // Dashboard analytics
  getPassRate: () => number;
  getSamplesInState: (state: SampleLifecycleState) => Sample[];
  getEquipmentDueForCalibration: () => Equipment[];
}

const LIMSContext = createContext<LIMSContextValue | null>(null);

export function LIMSProvider({ children }: { children: React.ReactNode }) {
  const [samples, setSamples] = useState<Sample[]>(SAMPLES);
  const [equipment] = useState<Equipment[]>(EQUIPMENT);
  const [standards, setStandards] = useState<StandardMetadata[]>(STANDARDS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(AUDIT_EVENTS);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const currentUser = CURRENT_USER;

  const logAudit = useCallback((action: string, resource: string, resourceId: string, details: string) => {
    const event: AuditEvent = {
      id: uuidv4(), timestamp: new Date().toISOString(),
      userId: currentUser.id, userName: currentUser.name,
      action, resource, resourceId, details,
    };
    setAuditEvents((prev) => [event, ...prev]);
  }, [currentUser]);

  const addSample = useCallback((data: Omit<Sample, 'id' | 'reportNo' | 'lifecycleHistory' | 'testRuns' | 'attachments'>): Sample => {
    const id = uuidv4();
    const year = new Date().getFullYear();
    const reportNo = `LAB-${year}-MCCB-${String(Math.floor(Math.random() * 9000) + 1000).padStart(5, '0')}`;
    const newSample: Sample = {
      ...data, id, reportNo, testRuns: [], attachments: [],
      lifecycleHistory: [{ state: 'Received', timestamp: new Date().toISOString(), user: currentUser.name }],
    };
    setSamples((prev) => [newSample, ...prev]);
    logAudit('sample:create', 'Sample', id, `New sample ${reportNo} registered.`);
    return newSample;
  }, [currentUser, logAudit]);

  const updateSampleLifecycle = useCallback((sampleId: string, state: SampleLifecycleState, notes?: string) => {
    setSamples((prev) => prev.map((s) => {
      if (s.id !== sampleId) return s;
      return {
        ...s, lifecycleState: state,
        lifecycleHistory: [...s.lifecycleHistory, { state, timestamp: new Date().toISOString(), user: currentUser.name, notes }],
      };
    }));
    logAudit('sample:edit', 'Sample', sampleId, `Lifecycle → ${state}`);
  }, [currentUser, logAudit]);

  const addTestRun = useCallback((sampleId: string, run: TestRun) => {
    setSamples((prev) => prev.map((s) => s.id === sampleId ? { ...s, testRuns: [...s.testRuns, run] } : s));
    logAudit('test:execute', 'TestRun', run.id, `Sequence ${run.sequenceId} executed. Verdict: ${run.verdict}.`);
  }, [logAudit]);

  const activateStandard = useCallback((id: string) => {
    setStandards((prev) => prev.map((s) => ({ ...s, active: s.id === id })));
    logAudit('standard:install', 'Standard', id, `Standard ${id} activated.`);
  }, [logAudit]);

  const installStandard = useCallback((id: string) => {
    setStandards((prev) => prev.map((s) => s.id === id ? { ...s, installed: true } : s));
    logAudit('standard:install', 'Standard', id, `Standard ${id} installed.`);
  }, [logAudit]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const getPassRate = useCallback((): number => {
    const completed = samples.filter((s) => ['Completed','Review','Approved','Released'].includes(s.lifecycleState));
    if (!completed.length) return 0;
    const passed = completed.filter((s) => s.testRuns.every((r) => r.verdict === 'PASS' || r.verdict === 'NA'));
    return Math.round((passed.length / completed.length) * 100);
  }, [samples]);

  const getSamplesInState = useCallback((state: SampleLifecycleState) =>
    samples.filter((s) => s.lifecycleState === state), [samples]);

  const getEquipmentDueForCalibration = useCallback(() => {
    const today = new Date();
    const in30days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return equipment.filter((e) => new Date(e.nextCalibrationDue) <= in30days);
  }, [equipment]);

  return (
    <LIMSContext.Provider value={{
      currentUser, users: USERS, samples, addSample,
      updateSampleLifecycle, addTestRun, equipment, standards,
      activateStandard, installStandard, auditEvents, logAudit,
      notifications, markNotificationRead, getPassRate,
      getSamplesInState, getEquipmentDueForCalibration,
    }}>
      {children}
    </LIMSContext.Provider>
  );
}

export function useLIMS() {
  const ctx = useContext(LIMSContext);
  if (!ctx) throw new Error('useLIMS must be used inside LIMSProvider');
  return ctx;
}
