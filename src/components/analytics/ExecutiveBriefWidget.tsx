import React from 'react';
import { globalExecutiveBriefGenerator } from '../../intelligence/executive/ExecutiveBriefGenerator';
import { Bot, Sparkles, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';

export function ExecutiveBriefWidget() {
  const brief = globalExecutiveBriefGenerator.generateBrief();

  return (
    <div className="bg-gradient-to-r from-brand-950/60 via-surface-900 to-surface-900 border border-brand-500/30 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3 border-b border-surface-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600/30 border border-brand-500/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-100">{brief.summaryTitle}</h3>
            <p className="text-[10px] text-brand-400 font-mono">{brief.periodText}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
          AI Generated Brief
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Key Insights */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-surface-300 uppercase tracking-wide">Key Performance Insights</p>
          <ul className="space-y-1.5">
            {brief.keyInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-surface-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: AI Recommendations */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-surface-300 uppercase tracking-wide">AI Corrective & Preventive Advice</p>
          <ul className="space-y-1.5">
            {brief.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
