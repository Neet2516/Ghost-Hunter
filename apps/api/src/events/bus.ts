import { EventEmitter } from 'node:events';

export interface ServerEvent {
  type: string;
  data: unknown;
  id?: string;
  at?: string;
}

export class EventBus extends EventEmitter {
  broadcast(event: ServerEvent): void {
    const enriched: ServerEvent = {
      ...event,
      at: event.at || new Date().toISOString(),
    };
    this.emit('event', enriched);
  }
}

export const globalEventBus = new EventBus();
