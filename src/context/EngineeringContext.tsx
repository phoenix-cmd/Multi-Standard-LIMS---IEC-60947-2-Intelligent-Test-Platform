import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { globalTwinEngine, TwinEngine } from '../engineering/digital-twin/TwinEngine';
import { globalConversation, ConversationManager } from '../engineering/copilot/ConversationManager';
import { CopilotEngine } from '../engineering/copilot/CopilotEngine';
import { ContextBuilder } from '../engineering/copilot/ContextBuilder';
import type { ComponentState } from '../engineering/digital-twin/TwinState';
import type { ChatMessage } from '../engineering/copilot/ConversationManager';
import { useLIMS } from './LIMSContext';

interface EngineeringContextValue {
  // Twin
  twinState: Record<string, ComponentState>;
  twinEngine: TwinEngine;
  overallHealth: number;
  // Viewer
  explosionFactor: number;
  setExplosionFactor: (v: number) => void;
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
  highlightedClauseId: string | null;
  setHighlightedClauseId: (id: string | null) => void;
  viewMode: 'perspective' | 'orthographic';
  setViewMode: (m: 'perspective' | 'orthographic') => void;
  // Active sample
  activeSampleId: string | null;
  setActiveSampleId: (id: string | null) => void;
  // Copilot
  messages: ChatMessage[];
  isCopilotTyping: boolean;
  sendMessage: (text: string) => void;
  clearConversation: () => void;
  starterQuestions: string[];
}

const EngineeringContext = createContext<EngineeringContextValue | null>(null);

const copilotEngine = new CopilotEngine();

export function EngineeringProvider({ children }: { children: React.ReactNode }) {
  const { samples } = useLIMS();

  const [twinState, setTwinState] = useState<Record<string, ComponentState>>(() => globalTwinEngine.getState());
  const [explosionFactor, setExplosionFactor] = useState(0);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [highlightedClauseId, setHighlightedClauseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'perspective' | 'orthographic'>('perspective');
  const [activeSampleId, setActiveSampleIdState] = useState<string | null>(samples[0]?.id ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>(globalConversation.getMessages());
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to twin engine updates
  useEffect(() => {
    const unsub = globalTwinEngine.subscribe(() => {
      setTwinState(globalTwinEngine.getState());
    });
    return () => { unsub(); };
  }, []);

  // Subscribe to conversation updates
  useEffect(() => {
    const unsub = globalConversation.subscribe(() => {
      setMessages(globalConversation.getMessages());
    });
    return () => { unsub(); };
  }, []);

  // When active sample changes, reset twin and apply test run data
  const setActiveSampleId = useCallback((id: string | null) => {
    setActiveSampleIdState(id);
    globalTwinEngine.reset();
    globalConversation.clear();
    if (id) {
      const sample = samples.find((s) => s.id === id);
      if (sample && sample.testRuns.length > 0) {
        globalTwinEngine.applyTestRunData(sample.testRuns);
      }
    }
  }, [samples]);

  // Highlight clause in twin when highlightedClauseId changes
  useEffect(() => {
    globalTwinEngine.setHighlightedClause(highlightedClauseId);
  }, [highlightedClauseId]);

  // Mark selected component as selected
  useEffect(() => {
    const currentState = globalTwinEngine.getState();
    // Reset previous selection
    Object.keys(currentState).forEach((id) => {
      if (currentState[id].status === 'selected') {
        globalTwinEngine.setComponentStatus(id, 'normal');
      }
    });
    if (selectedComponentId) {
      globalTwinEngine.setComponentStatus(selectedComponentId, 'selected');
    }
  }, [selectedComponentId]);

  // Initialize twin with first sample on mount
  useEffect(() => {
    if (samples[0] && samples[0].testRuns.length > 0) {
      globalTwinEngine.applyTestRunData(samples[0].testRuns);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback((text: string) => {
    globalConversation.addUserMessage(text);
    setIsCopilotTyping(true);

    const activeSample = samples.find((s) => s.id === activeSampleId) ?? samples[0];
    const selectedComp = selectedComponentId ? globalTwinEngine.getComponent(selectedComponentId) ?? null : null;

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if (!activeSample) {
        globalConversation.addAssistantMessage('No sample selected. Please select a sample from the top bar.', {
          answer: 'No sample selected.',
          reasoning: '',
          affectedComponentIds: [],
          confidence: 0,
          relatedTests: [],
          followUpQuestions: [],
        });
        setIsCopilotTyping(false);
        return;
      }
      const ctx = ContextBuilder.build(activeSample, selectedComp, highlightedClauseId ?? undefined);
      const response = copilotEngine.generate(text, ctx);
      globalConversation.addAssistantMessage(response.answer, response);

      // Auto-highlight components mentioned in response
      if (response.affectedComponentIds.length > 0) {
        response.affectedComponentIds.forEach((id) => {
          const current = globalTwinEngine.getComponent(id);
          if (current && current.status === 'normal') {
            globalTwinEngine.setComponentStatus(id, 'hovered');
          }
        });
        // Reset after 3 seconds
        setTimeout(() => {
          if (response.affectedComponentIds) {
            response.affectedComponentIds.forEach((id) => {
              const current = globalTwinEngine.getComponent(id);
              if (current && current.status === 'hovered') {
                globalTwinEngine.setComponentStatus(id, 'normal');
              }
            });
          }
        }, 3000);
      }

      setIsCopilotTyping(false);
    }, 800 + Math.random() * 600); // simulate thinking delay
  }, [activeSampleId, samples, selectedComponentId, highlightedClauseId]);

  const clearConversation = useCallback(() => {
    globalConversation.clear();
  }, []);

  const value: EngineeringContextValue = {
    twinState,
    twinEngine: globalTwinEngine,
    overallHealth: globalTwinEngine.getOverallHealth(),
    explosionFactor, setExplosionFactor,
    selectedComponentId, setSelectedComponentId,
    highlightedClauseId, setHighlightedClauseId,
    viewMode, setViewMode,
    activeSampleId, setActiveSampleId,
    messages, isCopilotTyping,
    sendMessage, clearConversation,
    starterQuestions: globalConversation.getStarterQuestions(),
  };

  return <EngineeringContext.Provider value={value}>{children}</EngineeringContext.Provider>;
}

export function useEngineering() {
  const ctx = useContext(EngineeringContext);
  if (!ctx) throw new Error('useEngineering must be used inside <EngineeringProvider>');
  return ctx;
}
