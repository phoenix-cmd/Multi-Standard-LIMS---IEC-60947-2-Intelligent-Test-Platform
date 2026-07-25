import { v4 as uuidv4 } from 'uuid';
import { globalEventBus } from '../events/EventBus';

export interface CoreNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'ai_recommendation';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export class NotificationEngine {
  private _notifications: CoreNotification[] = [];
  private _listeners: Set<() => void> = new Set();

  constructor() {
    // Auto-listen to domain events to generate notifications
    globalEventBus.subscribe('ClauseFailed', (payload: any) => {
      this.addNotification({
        type: 'warning',
        title: `Clause ${payload.clauseId} Failed`,
        message: `Sample ${payload.sampleId || 'Specimen'} failed clause evaluation. Root cause: ${payload.rootCause || 'Limit exceeded'}.`,
        actionUrl: '/investigation',
      });
    });

    globalEventBus.subscribe('EquipmentCalibrated', (payload: any) => {
      this.addNotification({
        type: 'info',
        title: 'Equipment Calibration Update',
        message: `Asset ${payload.equipmentId} calibration recorded. Next due: ${payload.nextDueDate}.`,
        actionUrl: '/equipment',
      });
    });
  }

  subscribe(cb: () => void) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _notify() {
    this._listeners.forEach((cb) => cb());
  }

  getNotifications(): CoreNotification[] {
    return [...this._notifications];
  }

  addNotification(n: Omit<CoreNotification, 'id' | 'timestamp' | 'read'>): CoreNotification {
    const notification: CoreNotification = {
      ...n,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    this._notifications.unshift(notification);
    this._notify();
    return notification;
  }

  markRead(id: string) {
    const found = this._notifications.find((n) => n.id === id);
    if (found) {
      found.read = true;
      this._notify();
    }
  }
}

export const globalNotificationEngine = new NotificationEngine();
