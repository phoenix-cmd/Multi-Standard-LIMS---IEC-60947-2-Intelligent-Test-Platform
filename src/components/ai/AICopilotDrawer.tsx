import { useState } from 'react';
import { useLIMS } from '../../context/LIMSContext';
import { ClauseExplainer } from '../../ai/engines';
import { Bot, Send, X, Sparkles, ChevronDown } from 'lucide-react';
import type { AIMessage } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const CLAUSE_OPTIONS = [
  { id: '8.3.3.1', label: 'Cl. 8.3.3.1 — Temperature Rise' },
  { id: '8.3.3.2', label: 'Cl. 8.3.3.2 — Dielectric Withstand' },
  { id: '8.3.3.3', label: 'Cl. 8.3.3.3 — Tripping Characteristics' },
  { id: '8.3.4',   label: 'Cl. 8.3.4 — Ultimate Breaking (Icu)' },
  { id: '8.3.5',   label: 'Cl. 8.3.5 — Service Breaking (Ics)' },
];

const QUICK_QUESTIONS = [
  'Why did this clause fail?',
  'What is the test procedure for this clause?',
  'What corrective action do you recommend?',
  'What equipment is needed for this test?',
  'How is the limit calculated?',
];

const explainer = new ClauseExplainer();

function generateAnswer(question: string, clauseId: string, inputs: Record<string, number>): string {
  const lower = question.toLowerCase();
  if (lower.includes('fail') || lower.includes('why')) {
    return `For **${clauseId}**, a failure typically indicates the measured value exceeded the IEC-specified limit.\n\n${explainer.explain(clauseId, inputs)}\n\nRefer to the AI Diagnosis panel in the Test Wizard for detailed root-cause breakdown.`;
  }
  if (lower.includes('procedure') || lower.includes('test')) {
    return explainer.explain(clauseId, inputs) + '\n\nThe test must be performed per IEC 60947-2 Annex D test sequence with certified equipment traceable to national standards.';
  }
  if (lower.includes('corrective') || lower.includes('recommend')) {
    return 'Based on the clause context, recommended corrective actions include:\n• Verify test specimen condition and assembly quality\n• Recalibrate all measurement instruments\n• Check test circuit parameters against IEC requirements\n• Consult AI Diagnosis panel for specific failure modes';
  }
  if (lower.includes('equipment') || lower.includes('instrument')) {
    return 'Required instruments for ' + clauseId + ':\n• Calibrated current source (± 0.5% accuracy)\n• Digital storage oscilloscope (≥ 1 MS/s)\n• Precision thermocouples (Class 1, IEC 60584)\n• High-voltage test set (certified per IEC 60060-1)';
  }
  if (lower.includes('calculat') || lower.includes('limit') || lower.includes('formula')) {
    return explainer.explain(clauseId, inputs);
  }
  return `Regarding **${clauseId}**: ${explainer.explain(clauseId, inputs)}\n\nFor further details, refer to IEC 60947-2 standard text or ask a more specific question.`;
}

export function AICopilotDrawer() {
  const [open, setOpen] = useState(false);
  const [selectedClause, setSelectedClause] = useState('8.3.3.1');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init', role: 'assistant',
      content: 'Hello! I\'m your IEC 60947-2 AI Copilot. Select a clause and ask me anything — from test procedures and limit calculations to failure diagnosis and corrective actions.',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: AIMessage = { id: uuidv4(), role: 'user', content: text, timestamp: new Date().toISOString() };
    const answer = generateAnswer(text, selectedClause, { In: 250, Ui: 750, Ue: 415 });
    const aiMsg: AIMessage = { id: uuidv4(), role: 'assistant', content: answer, timestamp: new Date().toISOString(), clauseContext: selectedClause };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-500 shadow-2xl glow-brand flex items-center justify-center transition-all z-40 no-print"
      >
        {open ? <X className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 h-[480px] card shadow-2xl flex flex-col z-40 animate-slide-in no-print">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-700 bg-surface-900 rounded-t-xl">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-semibold text-surface-100 flex-1">AI Copilot</span>
            <select
              className="text-xs bg-surface-800 border border-surface-600 text-brand-400 rounded px-2 py-1"
              value={selectedClause}
              onChange={(e) => setSelectedClause(e.target.value)}
            >
              {CLAUSE_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
            </select>
          </div>

          {/* Clause context badge */}
          <div className="px-3 py-1.5 bg-brand-600/10 border-b border-brand-600/20">
            <p className="text-[10px] text-brand-400">Context: {CLAUSE_OPTIONS.find(c => c.id === selectedClause)?.label}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-surface-800 text-surface-200 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Quick questions */}
          <div className="flex gap-1.5 overflow-x-auto px-3 pb-1 no-scrollbar">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} onClick={() => send(q)} className="flex-shrink-0 text-[10px] bg-surface-800 border border-surface-700 text-surface-300 hover:text-brand-400 hover:border-brand-600 px-2 py-1 rounded-full transition-colors">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-surface-700">
            <input
              className="input flex-1 py-1.5 text-xs"
              placeholder="Ask about this clause…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
            />
            <button className="btn-primary py-1.5 px-3" onClick={() => send(input)}>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
