import { EventEmitter } from 'events';

export interface AdminDomainEvent {
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  actorId: string;
  timestamp: string;
  payload: Record<string, any>;
}

export class DomainEventEmitter extends EventEmitter {
  private static instance: DomainEventEmitter;

  private constructor() {
    super();
  }

  static getInstance(): DomainEventEmitter {
    if (!DomainEventEmitter.instance) {
      DomainEventEmitter.instance = new DomainEventEmitter();
    }
    return DomainEventEmitter.instance;
  }

  emitAdminEvent(eventType: string, aggregateId: string, actorId: string, payload: Record<string, any>): void {
    const event: AdminDomainEvent = {
      eventType,
      aggregateType: 'UserAdmin',
      aggregateId,
      actorId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.emit(eventType, event);
    this.emit('admin_event', event);
  }
}

export const domainEvents = DomainEventEmitter.getInstance();
