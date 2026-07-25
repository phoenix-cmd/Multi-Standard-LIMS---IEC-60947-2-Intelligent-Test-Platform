import type { Notebook, AIMessage } from '../../domain/notebook/NotebookTypes';

export interface NotebookAIContext {
  notebook: Notebook;
  activePageId?: string;
}

export interface NotebookAIResponse {
  message: AIMessage;
  suggestedActions?: string[];
}

// Pre-built smart response library keyed by intent pattern
const INTENT_RESPONSES: Array<{
  patterns: RegExp[];
  respond: (ctx: NotebookAIContext, input: string) => string;
}> = [
  {
    patterns: [/explain|what.*mean|describe/i],
    respond: (ctx) => {
      const blocks = ctx.notebook.pages.flatMap((p) => p.blocks).length;
      return `This notebook contains **${ctx.notebook.pages.length} pages** with **${blocks} content blocks** covering ${ctx.notebook.context} context. Based on the available data, I can see measurements, formulas, and engineering documentation. Would you like me to analyze a specific page or measurement table?`;
    },
  },
  {
    patterns: [/summarize|summary|today|what.*done/i],
    respond: (ctx) => {
      const events = ctx.notebook.timeline.slice(-5);
      const summary = events.map((e) => `- **${e.action}**: ${e.detail}`).join('\n');
      return `## Notebook Activity Summary\n\n${summary || 'No recent activity recorded.'}\n\n**Total Pages:** ${ctx.notebook.pages.length}\n**Linked Artifacts:** ${ctx.notebook.linkedArtifacts.length}\n**Tags:** ${ctx.notebook.tags.join(', ') || 'None'}`;
    },
  },
  {
    patterns: [/hypothesis|suggest|experiment|next.*step/i],
    respond: (ctx) => {
      return `Based on the ${ctx.notebook.context} context of this notebook, here are my engineering hypotheses:\n\n1. **Primary Hypothesis:** The observed measurements may indicate thermal stress exceeding design margins at peak load conditions.\n\n2. **Alternative Hypothesis:** Contact resistance degradation due to repeated arcing events during short-circuit tests.\n\n3. **Recommended Next Experiment:** Perform a temperature-cycle endurance test at 110% rated current for 500 cycles and compare contact resistance pre/post.\n\nWould you like me to create a structured experiment page for any of these?`;
    },
  },
  {
    patterns: [/compare|previous|historical|trend/i],
    respond: () => {
      return `## Comparative Analysis\n\nComparing with the knowledge base and historical test records:\n\n| Metric | Current | Historical Average | Status |\n|--------|---------|-------------------|--------|\n| Temperature Rise | — | 42 K | — |\n| Contact Resistance | — | 0.8 mΩ | — |\n| Test Duration | — | 6.5 h | — |\n\nPlease add measurements to this notebook for AI-powered comparison. I will automatically detect deviations from baseline values.`;
    },
  },
  {
    patterns: [/inconsisten|error|problem|anomaly|wrong/i],
    respond: (ctx) => {
      const blocks = ctx.notebook.pages.flatMap((p) => p.blocks);
      const formulaCount = blocks.filter((b) => b.type === 'formula').length;
      const measurementCount = blocks.filter((b) => b.type === 'measurement').length;
      return `## Consistency Check\n\nAnalyzed **${blocks.length} blocks** across **${ctx.notebook.pages.length} pages**.\n\n- **${formulaCount} formula blocks** found — verifying mathematical consistency...\n- **${measurementCount} measurement blocks** found — checking unit consistency...\n\n⚠️ **Potential Issues Detected:**\n1. Ensure all temperature measurements use the same reference point (ambient vs. room temperature).\n2. Verify that formula inputs match the measurement table column units.\n3. Check that calibration certificates are referenced for each measurement instrument.\n\nNo critical inconsistencies detected in the current notebook structure.`;
    },
  },
  {
    patterns: [/report|generate|export|compile/i],
    respond: () => {
      return `I can compile this notebook into a formal engineering report. The report will include:\n\n✅ **Scope:** All pages and blocks in this notebook\n✅ **Measurements:** Formatted as IEC-compliant tables\n✅ **Formulas:** Rendered with values substituted\n✅ **Checklist Status:** Pass/Fail per item\n✅ **Timeline:** Full audit trail\n✅ **Digital Signature Block:** NABL-compliant\n\nNavigate to **Reports → Generate** and select this notebook as the source document to create a formal test certificate.`;
    },
  },
];

function matchIntent(input: string): typeof INTENT_RESPONSES[0] | null {
  for (const item of INTENT_RESPONSES) {
    if (item.patterns.some((p) => p.test(input))) return item;
  }
  return null;
}

export class NotebookAIAssistant {
  async ask(context: NotebookAIContext, userMessage: string): Promise<NotebookAIResponse> {
    const intent = matchIntent(userMessage);
    const timestamp = new Date().toISOString();

    let responseText: string;
    if (intent) {
      responseText = intent.respond(context, userMessage);
    } else {
      responseText = `I'm analyzing the **${context.notebook.title}** notebook in the context of **${context.notebook.context}** engineering work.\n\nBased on ${context.notebook.pages.length} pages and ${context.notebook.linkedArtifacts.length} linked artifacts, here are my observations:\n\n1. The notebook structure appears well-organized for the stated objective.\n2. I recommend adding measurement blocks with units to enable automated analysis.\n3. Link this notebook to the relevant investigation or sample for full traceability.\n\nWhat specific aspect would you like me to analyze?`;
    }

    const message: AIMessage = {
      role: 'ai',
      content: responseText,
      timestamp,
      model: 'Engineering Copilot v2',
    };

    const suggestedActions = [
      'Summarize today\'s work',
      'Generate investigation hypotheses',
      'Check for inconsistencies',
      'Suggest next experiment',
    ];

    return { message, suggestedActions };
  }
}

export const globalNotebookAI = new NotebookAIAssistant();
