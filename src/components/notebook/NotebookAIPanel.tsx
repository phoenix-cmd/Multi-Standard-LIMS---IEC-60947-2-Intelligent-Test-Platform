import React, { useState, useRef, useEffect } from 'react';
import type { Notebook } from '../../domain/notebook/NotebookTypes';
import { globalNotebookAI } from '../../intelligence/notebook/NotebookAIAssistant';
import type { AIMessage } from '../../domain/notebook/NotebookTypes';
import { Brain, Send, Sparkles, RotateCcw } from 'lucide-react';

const QUICK_PROMPTS = [
  'Summarize this notebook',
  'Generate hypotheses',
  'Check for inconsistencies',
  'Suggest next experiment',
  'Explain the measurements',
  'Generate a report outline',
];

interface NotebookAIPanelProps {
  notebook: Notebook;
  activePageId?: string;
}

export function NotebookAIPanel({ notebook, activePageId }: NotebookAIPanelProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'ai',
      content: `Hello! I'm your **Engineering Notebook AI**.\n\nI have full context of **${notebook.title}** — ${notebook.pages.length} pages, ${notebook.linkedArtifacts.length} linked artifacts.\n\nHow can I help you today?`,
      timestamp: new Date().toISOString(),
      model: 'Engineering Copilot v2',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: AIMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // simulate network latency
    await new Promise((r) => setTimeout(r, 600));

    const { message } = await globalNotebookAI.ask({ notebook, activePageId }, text);
    setMessages((prev) => [...prev, message]);
    setLoading(false);
  };

  function renderContent(text: string) {
    // Very simple markdown: bold, headings, bullets, code
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^## (.+)$/gm, '<span class="font-bold text-surface-100 block mt-2">$1</span>')
      .replace(/^- (.+)$/gm, '<span class="block pl-3 text-surface-300">• $1</span>')
      .replace(/`([^`]+)`/g, '<code class="bg-surface-800 px-1 rounded text-brand-300 text-xs">$1</code>');
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-surface-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-surface-200">Engineering Copilot</p>
            <p className="text-[10px] text-surface-600">Notebook-aware AI assistant</p>
          </div>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="px-3 py-2 border-b border-surface-800 flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="px-2 py-1 bg-surface-800 hover:bg-brand-600/20 hover:text-brand-300 text-surface-500 text-[10px] rounded-full border border-surface-700 hover:border-brand-500/40 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] text-xs rounded-xl px-3 py-2.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-800 text-surface-300 border border-surface-700'
              }`}
            >
              {msg.role === 'ai' ? (
                <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-800 border border-surface-700 rounded-xl px-3 py-2.5">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-surface-800">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask about this notebook…"
            rows={2}
            className="flex-1 bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-200 placeholder-surface-600 resize-none focus:outline-none focus:border-brand-500"
          />
          <div className="flex flex-col gap-1">
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-8 h-8 flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white rounded-xl disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMessages(messages.slice(0, 1))}
              className="w-8 h-8 flex items-center justify-center text-surface-600 hover:text-surface-400 rounded-xl border border-surface-700"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
