import { globalEventBus } from '../events/EventBus';

export interface Command {
  type: string;
  payload: any;
}

export type CommandHandler<T = any> = (command: T) => Promise<any> | any;

export class CommandBus {
  private _handlers: Map<string, CommandHandler> = new Map();

  register<T extends Command>(commandType: string, handler: CommandHandler<T>): void {
    if (this._handlers.has(commandType)) {
      console.warn(`[CommandBus] Overwriting existing handler for command '${commandType}'`);
    }
    this._handlers.set(commandType, handler);
  }

  async dispatch<T extends Command>(command: T): Promise<any> {
    const handler = this._handlers.get(command.type);
    if (!handler) {
      throw new Error(`[CommandBus] No registered handler for command '${command.type}'`);
    }
    const result = await handler(command);
    globalEventBus.emit(`CommandHandled:${command.type}`, { command, result, timestamp: new Date().toISOString() });
    return result;
  }
}

export const globalCommandBus = new CommandBus();
