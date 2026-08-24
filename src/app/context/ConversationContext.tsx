import React, { createContext, useContext, useState, useCallback } from 'react';
import type { LokAIResponse, APIMessage, ContextPanel } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Conversation {
  id:             string;
  title:          string;
  messages:       APIMessage[];
  contextPanel:   ContextPanel | null;
  createdAt:      Date;
  status:         'Action Required' | 'In Progress' | 'Ready to File' | 'Out of Scope';
  tags:           string[];
  since:          string;
  completedSteps: string[];   // milestone IDs that are done
  isBlocked:      boolean;    // whether current case hit a blocker
}

interface ConversationCtx {
  conversations:      Conversation[];
  activeId:           string | null;
  setActiveId:        (id: string) => void;
  getConversation:    (id: string) => Conversation | undefined;
  createConversation: () => Conversation;
  updateConversation: (id: string, patch: Partial<Conversation>) => void;
  addMessage:         (id: string, msg: APIMessage) => void;
  applyResponse:      (id: string, response: LokAIResponse) => void;
  // ── Language preference — shared across all screens ──────────────────────────
  selectedLanguage:   string;
  setSelectedLanguage:(lang: string) => void;
  // ── Per-conversation milestone tracking ──────────────────────────────────────
  markStepComplete:   (convId: string, stepId: string) => void;
  setBlocked:         (convId: string, blocked: boolean) => void;
}

// ─── Pre-built JSON strings for the dummy conversations ────────────────────────

const CONSUMER_RESPONSE = JSON.stringify({
  title: 'Consumer Refund — Damaged Mixer',
  zone1: { label: 'WHAT THE RULE MEANS', finding: 'When a product arrives damaged, that can count as a consumer issue. You can ask the seller for repair, replacement, or a refund. If they ignore a fair written ask, you can follow up with a legal notice.' },
  zone2: { label: 'HOW IT APPLIES HERE', analysis: 'Your mixer arrived damaged and the seller refused a replacement. The invoice, damage photos, and written refusal give you a solid next step.' },
  zone3: { label: 'WHAT YOU CAN DO', steps: ['Send a written demand notice by registered post with acknowledgement due (AD), and keep the postal receipt.', 'Save the invoice, WhatsApp or seller-chat screenshots, platform order or ticket ID, defect photos or videos, and warranty details together.', 'If the seller ignores the notice, prepare a consumer complaint — you can use e-Daakhil, or call National Consumer Helpline (1915), or approach the District Consumer Commission.'], cta: 'Prepare demand notice' },
  citations: ['Consumer Protection Act 2019 · Section 2(10)', 'Consumer Protection Act 2019 · Section 2(11)', 'Consumer Protection Act 2019 · Section 35'],
  contextPanel: {
    primaryLaw: 'Consumer Protection Act, 2019',
    sections: [
      { ref: 'Section 2(10)', summary: 'Defines defect in goods.' },
      { ref: 'Section 2(11)', summary: 'Defines deficiency in service.' },
      { ref: 'Section 35', summary: 'Allows a consumer to file a complaint before the appropriate commission.' },
    ],
    keyFacts: [
      'Damaged mixer grinder reported',
      'Seller refused replacement or refund',
      'Written refusal is available',
      'Invoice date is 6 June 2026',
    ],
    relatedLaws: ['Consumer Protection (E-Commerce) Rules, 2020, if the purchase was online'],
  },
  scope: 'in',
  responseLanguage: 'en',
} as LokAIResponse);

const OUT_OF_SCOPE_RESPONSE = JSON.stringify({
  title: 'Outside LokAI Scope',
  zone1: { label: 'BOUNDARY', finding: 'This question is outside what this prototype covers. LokAI here only walks through consumer refund examples — a damaged product, a seller refusal, and the next practical step.' },
  zone2: { label: 'WHY', analysis: 'Sports, weather, recipes, coding, RTI, tenancy, and employment are not built into this demo. Keeping the surface narrow keeps the prepared answers honest.' },
  zone3: { label: 'TRY THIS INSTEAD', steps: ['Open the prepared consumer-refund example.', 'Ask about a damaged product or a refused refund.', 'Explore why missing facts or source gaps make LokAI stop.'], cta: 'Open consumer example' },
  citations: ['LokAI Knowledge Base'],
  contextPanel: {
    primaryLaw: 'This prototype covers consumer refund examples only',
    sections: [
      { ref: 'Prototype boundary', summary: 'Consumer refund demos only. RTI, tenancy, and employment are not supported here.' },
    ],
    keyFacts: ['Current question is outside the consumer prototype', 'Structured consumer response resumes once you ask about a refund example'],
    relatedLaws: [],
  },
  scope: 'out',
  responseLanguage: 'en',
} as LokAIResponse);

// ─── Seed data — portfolio demo conversations ────────────────────────────────

function buildDummyConversations(): Conversation[] {
  const consumerParsed   = JSON.parse(CONSUMER_RESPONSE)     as LokAIResponse;
  const outOfScopeParsed = JSON.parse(OUT_OF_SCOPE_RESPONSE) as LokAIResponse;

  return [
    {
      id:             'consumer',
      title:          'Refund for a damaged mixer',
      tags:           ['Consumer', 'Prepared demo'],
      since:          'Today · Mumbai',
      status:         'Action Required',
      createdAt:      new Date(Date.now() - 12 * 60 * 1000),
      contextPanel:   consumerParsed.contextPanel,
      completedSteps: ['intake', 'clarify'],
      isBlocked:      false,
      messages: [
        { role: 'user',      content: 'I bought a damaged mixer grinder for ₹8,999. The seller refused a replacement. What can I do?' },
        { role: 'assistant', content: CONSUMER_RESPONSE },
      ],
    },
    {
      id:             'out-of-scope',
      title:          outOfScopeParsed.title,
      tags:           ['Boundary'],
      since:          '3 days ago · Mumbai',
      status:         'Out of Scope',
      createdAt:      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      contextPanel:   outOfScopeParsed.contextPanel,
      completedSteps: ['intake'],
      isBlocked:      false,
      messages: [
        { role: 'user',      content: 'Can you tell me the cricket score from last night?' },
        { role: 'assistant', content: OUT_OF_SCOPE_RESPONSE },
      ],
    },
  ];
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ConversationContext = createContext<ConversationCtx>({
  conversations:      [],
  activeId:           null,
  setActiveId:        () => {},
  getConversation:    () => undefined,
  createConversation: () => { throw new Error('Provider missing'); },
  updateConversation: () => {},
  addMessage:         () => {},
  applyResponse:      () => {},
  selectedLanguage:   'en',
  setSelectedLanguage:() => {},
  markStepComplete:   () => {},
  setBlocked:         () => {},
});

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [conversations,    setConversations]    = useState<Conversation[]>(buildDummyConversations);
  const [activeId,         setActiveId]         = useState<string | null>('consumer');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const getConversation = useCallback(
    (id: string) => conversations.find(c => c.id === id),
    [conversations],
  );

  const createConversation = useCallback((): Conversation => {
    const newConv: Conversation = {
      id:             `conv-${Date.now()}`,
      title:          'New conversation',
      tags:           [],
      since:          'Just now',
      status:         'In Progress',
      createdAt:      new Date(),
      contextPanel:   null,
      messages:       [],
      completedSteps: [],
      isBlocked:      false,
    };
    setConversations(prev => {
      const updated = [newConv, ...prev];
      return updated.slice(0, 10); // cap at 10
    });
    return newConv;
  }, []);

  const markStepComplete = useCallback((convId: string, stepId: string) => {
    setConversations(prev =>
      prev.map(c => c.id !== convId ? c : {
        ...c,
        completedSteps: c.completedSteps.includes(stepId)
          ? c.completedSteps
          : [...c.completedSteps, stepId],
      }),
    );
  }, []);

  const setBlocked = useCallback((convId: string, blocked: boolean) => {
    setConversations(prev =>
      prev.map(c => c.id !== convId ? c : { ...c, isBlocked: blocked }),
    );
  }, []);

  const updateConversation = useCallback((id: string, patch: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, ...patch } : c),
    );
  }, []);

  const addMessage = useCallback((id: string, msg: APIMessage) => {
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, messages: [...c.messages, msg] } : c),
    );
  }, []);

  const applyResponse = useCallback((id: string, response: LokAIResponse) => {
    const assistantMsg: APIMessage = { role: 'assistant', content: JSON.stringify(response) };
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        // Only update title if this is the first assistant message
        const isFirst = c.messages.filter(m => m.role === 'assistant').length === 0;
        return {
          ...c,
          title:        isFirst ? response.title : c.title,
          contextPanel: response.contextPanel,
          status:       response.scope === 'out' ? 'Out of Scope' : 'Action Required',
          messages:     [...c.messages, assistantMsg],
        };
      }),
    );
  }, []);

  return (
    <ConversationContext.Provider value={{
      conversations, activeId, setActiveId,
      getConversation, createConversation, updateConversation,
      addMessage, applyResponse,
      selectedLanguage, setSelectedLanguage,
      markStepComplete, setBlocked,
    }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversations() {
  return useContext(ConversationContext);
}
