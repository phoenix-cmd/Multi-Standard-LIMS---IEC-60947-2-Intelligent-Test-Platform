import React from 'react';
import type { InvestigationCase } from '../../investigation/CaseTypes';
import { Bot, User, Clock, Sparkles } from 'lucide-react';

export function AITimelineView({ caseData }: { caseData: InvestigationCase }) {
  return (
    <div className="h-full bg-surface-900 border border-surface-800 rounded-xl p-5 overflow-y-auto space-y-4">
      <div>
        <h3 className="text-sm font-bold text-surface-100">Chronological Event & AI Observation Timeline</h3>
        <p className="text-xs text-surface-400">Integrated timeline combining test run events, engineer notes, and AI diagnostic insights</p>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-800">
        {caseData.timeline.map((evt) => (
          <div key={evt.id} className="relative flex items-start gap-3">
            {/* Timeline node icon */}
            <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              evt.isAI ? 'bg-brand-600 text-white ring-4 ring-surface-900' : 'bg-surface-700 text-surface-300 ring-4 ring-surface-900'
            }`}>
              {evt.isAI ? <Sparkles className="w-3 h-3 text-brand-300" /> : <User className="w-3 h-3 text-surface-300" />}
            </div>

            <div className={`flex-1 rounded-xl p-3 border text-xs ${
              evt.isAI ? 'bg-brand-950/40 border-brand-500/30' : 'bg-surface-800 border-surface-700'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-surface-100">{evt.title}</span>
                <span className="text-[10px] text-surface-500 font-mono">{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-surface-300 leading-relaxed">{evt.details}</p>
              <p className="text-[9px] text-surface-500 mt-1 font-semibold">Author: {evt.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
