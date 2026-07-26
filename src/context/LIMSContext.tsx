import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  Sample, Equipment, StandardMetadata, User, AuditEvent,
  Notification, SampleLifecycleState, TestRun
} from '../types';
import {
  SAMPLES as INITIAL_SAMPLES,
  EQUIPMENT as INITIAL_EQUIPMENT,
  STANDARDS as INITIAL_STANDARDS,
  USERS as INITIAL_USERS,
  CURRENT_USER as INITIAL_CURRENT_USER,
  NOTIFICATIONS as INITIAL_NOTIFICATIONS,
  AUDIT_EVENTS as INITIAL_AUDIT_EVENTS,
} from '../mock/enterpriseInitialData';
import { APIClient } from '../api/client';
import { v4 as uuidv4 } from 'uuid';

interface LIMSContextValue {
  // Auth
  currentUser: User;
  users: User[];
  // Samples
  samples: Sample[];
  addSample: (s: Omit<Sample, 'id' | 'reportNo' | 'lifecycleHistory' | 'testRuns' | 'attachments'>) => Promise<Sample>;
  updateSampleLifecycle: (sampleId: string, state: SampleLifecycleState, notes?: string) => Promise<void>;
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
  const [samples, setSamples] = useState<Sample[]>(INITIAL_SAMPLES);
  const [equipment, setEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [standards, setStandards] = useState<StandardMetadata[]>(INITIAL_STANDARDS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const currentUser = INITIAL_CURRENT_USER;

  // Sync with Backend API on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [fetchedSamples, fetchedEquipment, fetchedNotifications, fetchedAudit] = await Promise.allSettled([
          APIClient.get<Sample[]>('/samples'),
          APIClient.get<Equipment[]>('/equipment'),
          APIClient.get<Notification[]>('/notifications'),
          APIClient.get<AuditEvent[]>('/audit'),
        ]);

        if (fetchedSamples.status === 'fulfilled' && Array.isArray(fetchedSamples.value) && fetchedSamples.value.length > 0) {
          setSamples(fetchedSamples.value);
        }
        if (fetchedEquipment.status === 'fulfilled' && Array.isArray(fetchedEquipment.value) && fetchedEquipment.value.length > 0) {
          setEquipment(fetchedEquipment.value);
        }
        if (fetchedNotifications.status === 'fulfilled' && Array.isArray(fetchedNotifications.value)) {
          setNotifications(fetchedNotifications.value);
        }
        if (fetchedAudit.status === 'fulfilled' && Array.isArray(fetchedAudit.value)) {
          setAuditEvents(fetchedAudit.value);
        }
      } catch {
        // Fall back to initial mock data if API is offline
      }
    }

    loadBackendData();
  }, []);

  // Connect to Live WebSocket for real-time alerts
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket('ws://localhost:5000/ws');
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'sample:created' || data.type === 'sample:lifecycle_updated') {
            APIClient.get<Sample[]>('/samples').then((s) => setSamples(s)).catch(() => null);
          }
        } catch {
          // Ignore invalid WS messages
        }
      };
    } catch {
      // Ignore WS connection errors when offline
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const logAudit = useCallback((action: string, resource: string, resourceId: string, details: string) => {
    const event: AuditEvent = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      resource,
      resourceId,
      details,
    };
    setAuditEvents((prev) => [event, ...prev]);
  }, [currentUser]);

  const addSample = useCallback(async (data: Omit<Sample, 'id' | 'reportNo' | 'lifecycleHistory' | 'testRuns' | 'attachments'>): Promise<Sample> => {
    try {
      const newSample = await APIClient.post<Sample>('/samples', data);
      setSamples((prev) => [newSample, ...prev]);
      logAudit('sample:create', 'Sample', newSample.id, `New sample ${newSample.reportNo} registered.`);
      return newSample;
    } catch {
      // Local fallback
      const id = uuidv4();
      const year = new Date().getFullYear();
      const reportNo = `LAB-${year}-MCCB-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const fallbackSample: Sample = {
        ...data,
        id,
        reportNo,
        testRuns: [],
        attachments: [],
        lifecycleHistory: [{ state: 'Received', timestamp: new Date().toISOString(), user: currentUser.name }],
      };
      setSamples((prev) => [fallbackSample, ...prev]);
      logAudit('sample:create', 'Sample', id, `New sample ${reportNo} registered.`);
      return fallbackSample;
    }
  }, [currentUser, logAudit]);

  const updateSampleLifecycle = useCallback(async (sampleId: string, state: SampleLifecycleState, notes?: string) => {
    try {
      const updated = await APIClient.put<Sample>(`/samples/${sampleId}/lifecycle`, { state, notes });
      setSamples((prev) => prev.map((s) => s.id === sampleId ? updated : s));
    } catch {
      // Local fallback
      setSamples((prev) => prev.map((s) => {
        if (s.id !== sampleId) return s;
        return {
          ...s,
          lifecycleState: state,
          lifecycleHistory: [...s.lifecycleHistory, { state, timestamp: new Date().toISOString(), user: currentUser.name, notes }],
        };
      }));
    }
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
    APIClient.put(`/notifications/${id}/read`).catch(() => null);
  }, []);

  const getPassRate = useCallback((): number => {
    const completed = samples.filter((s) => ['Completed', 'Review', 'Approved', 'Released'].includes(s.lifecycleState));
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
      currentUser,
      users: INITIAL_USERS,
      samples,
      addSample,
      updateSampleLifecycle,
      addTestRun,
      equipment,
      standards,
      activateStandard,
      installStandard,
      auditEvents,
      logAudit,
      notifications,
      markNotificationRead,
      getPassRate,
      getSamplesInState,
      getEquipmentDueForCalibration,
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
