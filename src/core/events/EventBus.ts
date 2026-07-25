// Strongly-Typed Decoupled Event Bus for the Engineering Operating System

export type EventCallback<T = any> = (payload: T) => void;

export class EventBus {
  private _listeners: Map<string, Set<EventCallback>> = new Map();

  subscribe<T>(eventType: string, callback: EventCallback<T>): () => void {
    if (!this._listeners.has(eventType)) {
      this._listeners.set(eventType, new Set());
    }
    const set = this._listeners.get(eventType)!;
    set.add(callback);

    return () => {
      set.delete(callback);
      if (set.size === 0) {
        this._listeners.delete(eventType);
      }
    };
  }

  emit<T>(eventType: string, payload: T): void {
    const set = this._listeners.get(eventType);
    if (!set) return;
    set.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`[EventBus] Error handling event '${eventType}':`, err);
      }
    });
  }

  clear(): void {
    this._listeners.clear();
  }
}

export const globalEventBus = new EventBus();
