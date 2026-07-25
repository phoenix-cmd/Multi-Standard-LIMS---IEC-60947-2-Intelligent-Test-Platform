import React, { useRef, useEffect } from 'react';
import { useEngineering } from '../../context/EngineeringContext';
import { Bot, Send, RotateCcw, ChevronRight, Loader2, Cpu, AlertCircle, BookOpen } from 'lucide-react';
import type { ChatMessage } from '../../engineering/copilot/ConversationManager';

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const resp = msg.response;

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5
        ${isUser ? 'bg-brand-600/40' : 'bg-surface-700'}`}>
        {isUser ? <span className="text-[9px] font-bold text-brand-400">U</span> : <Cpu className="w-3 h-3 text-brand-400" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-xl px-3 py-2.5 text-xs leading-relaxed
          ${isUser ? 'bg-brand-600/20 border border-brand-600/30 text-surface-100 rounded-tr-sm' : 'bg-surface-800 border border-surface-700 text-surface-200 rounded-tl-sm'}`}>
          {/* Format markdown-lite: bold */}
          {msg.content.split('\n').map((line, i) => (
            <p key={i} className={line === '' ? 'my-1' : ''}>
              {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                part.startsWith('**') && part.endsWith('**')
                  ? <strong key={j} className="font-bold text-surface-100">{part.slice(2, -2)}</strong>
                  : part
              )}
            </p>
          ))}
        </div>

        {/* Response metadata */}
        {resp && !isUser && (
          <div className="flex flex-col gap-1 w-full">
            {resp.clauseRef && (
              <div className="flex items-center gap-1.5 text-[9px] text-brand-400">
                <BookOpen className="w-2.5 h-2.5" />
                IEC 60947-2 Cl. {resp.clauseRef}
              </div>
            )}
            {resp.formulaSteps && resp.formulaSteps.length > 0 && (
              <div className="bg-surface-900 border border-surface-700 rounded-lg px-2.5 py-2 font-mono">
                {resp.formulaSteps.map((step, i) => (
                  <p key={i} className={`text-[10px] ${i === resp.formulaSteps!.length - 1 ? 'text-brand-400 font-bold' : 'text-surface-400'}`}>
                    {step}
                  </p>
                ))}
              </div>
            )}
            {resp.recommendation && (
              <div className="flex gap-1.5 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1.5">
                <AlertCircle className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{resp.recommendation}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[9px] text-surface-600">
              <span>Confidence: {resp.confidence}%</span>
              <span>·</span>
              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-center">
      <div className="w-6 h-6 rounded-full bg-surface-700 flex items-center justify-center flex-shrink-0">
        <Cpu className="w-3 h-3 text-brand-400" />
      </div>
      <div className="bg-surface-800 border border-surface-700 rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export function EngineeringCopilot() {
  const { messages, isCopilotTyping, sendMessage, clearConversation, starterQuestions } = useEngineering();
  const [input, setInput] = React.useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isCopilotTyping]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isCopilotTyping) return;
    sendMessage(trimmed);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full bg-surface-900 rounded-xl border border-surface-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-800 flex items-center justify-between flex-shrink-0 bg-surface-900">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-surface-100">Engineering Copilot</p>
            <p className="text-[9px] text-brand-400">IEC 60947-2 · Context-Aware</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="flex items-center gap-1 text-[10px] text-surface-500 hover:text-surface-300 transition-colors px-2 py-1 rounded hover:bg-surface-800"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center mb-3">
              <Bot className="w-6 h-6 text-brand-400" />
            </div>
            <p className="text-sm font-bold text-surface-200 mb-1">Engineering AI Copilot</p>
            <p className="text-xs text-surface-500 mb-4 leading-relaxed">
              Ask me anything about this MCCB test — clause failures, waveform analysis, component specs, or formula calculations.
            </p>
            <div className="space-y-1.5 w-full">
              {starterQuestions.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg border border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200 hover:border-brand-500/40 hover:bg-brand-600/10 transition-all flex items-center gap-2"
                >
                  <ChevronRight className="w-3 h-3 text-brand-500 flex-shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            {isCopilotTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Follow-up suggestions */}
      {messages.length > 0 && !isCopilotTyping && (() => {
        const last = messages[messages.length - 1];
        const followUps = last?.response?.followUpQuestions ?? [];
        if (followUps.length === 0) return null;
        return (
          <div className="px-3 py-2 border-t border-surface-800 flex gap-1.5 flex-wrap flex-shrink-0">
            {followUps.slice(0, 2).map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-[10px] px-2 py-1 rounded-lg bg-surface-800 border border-surface-700 text-surface-400 hover:text-brand-400 hover:border-brand-500/30 transition-colors max-w-[160px] truncate"
              >
                {q}
              </button>
            ))}
          </div>
        );
      })()}

      {/* Input */}
      <div className="p-3 border-t border-surface-800 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about clauses, failures, waveforms, components…"
            rows={2}
            className="flex-1 bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-xs text-surface-100 placeholder-surface-500 resize-none focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 leading-relaxed transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isCopilotTyping}
            className="w-9 h-9 rounded-xl bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-500 active:bg-brand-700 flex items-center justify-center transition-colors flex-shrink-0"
          >
            {isCopilotTyping ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}
