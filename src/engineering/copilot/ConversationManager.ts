import { v4 as uuidv4 } from 'uuid';
import type { CopilotResponse } from './CopilotEngine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  response?: CopilotResponse;
}

const STARTER_QUESTIONS = [
  'Why did the last clause fail?',
  'Summarize this test report.',
  'Explain the temperature rise test.',
  'Show me the dielectric voltage calculation.',
  'What are the failure modes of the arc chute?',
  'Which components were stressed in this test?',
];

export class ConversationManager {
  private _messages: ChatMessage[] = [];
  private _listeners: Set<() => void> = new Set();

  subscribe(cb: () => void) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _notify() {
    this._listeners.forEach((cb) => cb());
  }

  getMessages(): ChatMessage[] {
    return [...this._messages];
  }

  getStarterQuestions(): string[] {
    return STARTER_QUESTIONS;
  }

  addUserMessage(content: string): ChatMessage {
    const msg: ChatMessage = { id: uuidv4(), role: 'user', content, timestamp: new Date().toISOString() };
    this._messages.push(msg);
    this._notify();
    return msg;
  }

  addAssistantMessage(content: string, response: CopilotResponse): ChatMessage {
    const msg: ChatMessage = { id: uuidv4(), role: 'assistant', content, timestamp: new Date().toISOString(), response };
    this._messages.push(msg);
    this._notify();
    return msg;
  }

  clear() {
    this._messages = [];
    this._notify();
  }
}

export const globalConversation = new ConversationManager();
