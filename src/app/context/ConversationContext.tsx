import React, { createContext, useContext, useState, useCallback } from 'react';
import type { LokAIResponse, APIMessage, ContextPanel } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Conversation {
  id:           string;
  title:        string;
  messages:     APIMessage[];
  contextPanel: ContextPanel | null;
  createdAt:    Date;
  status:       'Action Required' | 'In Progress' | 'Ready to File' | 'Out of Scope';
  tags:         string[];
  since:        string;
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
}

// ─── Pre-built JSON strings for the dummy conversations ────────────────────────

const RTI_RESPONSE = JSON.stringify({
  title: 'BMC RTI Building Permit',
  zone1: { label: 'THE LAW', finding: 'The Public Information Officer is in statutory default — you have the right to file a First Appeal immediately.' },
  zone2: { label: 'YOUR SITUATION', analysis: 'You filed your RTI application 45 days ago. Under Section 7(1) of the RTI Act, the PIO was required to respond within 30 days. They are now 15 days past the legal deadline with no response or extension communicated.' },
  zone3: { label: 'WHAT YOU CAN DO', steps: ['File a First Appeal with the First Appellate Authority (FAA) at the BMC Ward Office within 30 days.', 'In the appeal, cite Section 19(1) and state the PIO failed to respond within the statutory 30-day period.', 'If the FAA also fails to respond within 30 days, escalate to the Maharashtra State Information Commission.'], cta: 'File your First Appeal now' },
  citations: ['RTI Act 2005 · Section 7(1)', 'RTI Act 2005 · Section 19(1)'],
  contextPanel: {
    primaryLaw: 'Right to Information Act, 2005',
    sections: [
      { ref: 'Section 7(1)', summary: 'Public authority must provide information within 30 days of RTI application.' },
      { ref: 'Section 19(1)', summary: 'Applicant can file first appeal within 30 days of expiry of prescribed period.' },
      { ref: 'Section 19(3)', summary: 'First Appellate Authority shall dispose of appeal within 30 days.' },
    ],
    keyFacts: [
      '30-day mandatory response window for PIO',
      'First Appeal must be filed within 30 days of default',
      'No fees required for First Appeal filing',
      'FAA must acknowledge appeal receipt in writing',
    ],
    relatedLaws: ['Maharashtra Right to Services Act, 2015', 'Prevention of Corruption Act, 1988'],
  },
  scope: 'in',
  responseLanguage: 'en',
} as LokAIResponse);

const DEPOSIT_RESPONSE = JSON.stringify({
  title: 'Security Deposit Dispute',
  zone1: { label: 'THE LAW', finding: 'A landlord has no automatic right to withhold a security deposit. Under the Maharashtra Rent Control Act, it must be returned within 30 days of vacating, minus only documented deductions.' },
  zone2: { label: 'YOUR SITUATION', analysis: 'You vacated 65 days ago and your landlord is still holding ₹40,000. The deposit was legally due within 30 days, making the landlord 35 days past the statutory deadline. Without any written damage claim or check-out inspection report, the landlord\'s legal position is very weak.' },
  zone3: { label: 'WHAT YOU CAN DO', steps: ['Send a formal legal demand notice giving the landlord 15 days to return the full deposit.', 'If ignored, file a complaint at the Mumbai Small Causes Court or District Consumer Commission.', 'For amounts over ₹1 lakh or if the landlord retaliates, consider consulting a lawyer.'], cta: 'Generate a Demand Notice now' },
  citations: ['MRC Act 1999 · Section 24', 'Consumer Protection Act 2019 · Section 35'],
  contextPanel: {
    primaryLaw: 'Maharashtra Rent Control Act, 1999',
    sections: [
      { ref: 'Section 24', summary: 'Landlord must return security deposit within 30 days of tenancy end, minus valid documented deductions.' },
      { ref: 'Section 15', summary: 'Landlord cannot evict or harass tenant over deposit disputes.' },
    ],
    keyFacts: [
      '30-day deposit return window from date of vacating',
      'Written damage claim required before any deduction',
      'Interest accrues on withheld deposits after deadline',
      'Small Causes Court jurisdiction for deposit disputes in Mumbai',
    ],
    relatedLaws: ['Consumer Protection Act, 2019', 'Transfer of Property Act, 1882'],
  },
  scope: 'in',
  responseLanguage: 'en',
} as LokAIResponse);

const CONSUMER_RESPONSE = JSON.stringify({
  title: 'Consumer Phone Complaint',
  zone1: { label: 'THE LAW', finding: 'Under the Consumer Protection Act 2019, a seller cannot refuse replacement or refund for a defective product. This qualifies as "deficiency of service" and an "unfair trade practice."' },
  zone2: { label: 'YOUR SITUATION', analysis: 'Your phone was defective and the seller refused to replace or refund it. Under the Consumer Protection Act 2019, you are entitled to a repair, replacement, or full refund. The seller\'s refusal constitutes an unfair trade practice, and you have strong grounds for a consumer forum complaint.' },
  zone3: { label: 'WHAT YOU CAN DO', steps: ['Send a written complaint to the seller and manufacturer giving 15 days to resolve.', 'File a consumer complaint at the District Consumer Disputes Redressal Commission (DCDRC) — no lawyer needed for claims under ₹50 lakh.', 'You can also file on the National Consumer Helpline (NCH) at consumerhelpline.gov.in for faster resolution.'], cta: 'Draft your consumer complaint' },
  citations: ['Consumer Protection Act 2019 · Section 2(11)', 'Consumer Protection Act 2019 · Section 35'],
  contextPanel: {
    primaryLaw: 'Consumer Protection Act, 2019',
    sections: [
      { ref: 'Section 2(11)', summary: 'Defines "deficiency" — any fault or shortcoming in quality, nature, or manner of service.' },
      { ref: 'Section 35', summary: 'Consumer can file complaint before District Commission for goods/services disputes.' },
      { ref: 'Section 47', summary: 'State Commission has jurisdiction for complaints exceeding ₹1 crore.' },
    ],
    keyFacts: [
      'No lawyer required for DCDRC complaints under ₹50 lakh',
      'Seller and manufacturer are jointly liable for defective products',
      'Filing fee is nominal (₹100-₹200 depending on claim value)',
      'Consumer Forums typically resolve cases in 90-150 days',
    ],
    relatedLaws: ['Sale of Goods Act, 1930', 'Information Technology Act, 2000 (for online purchases)'],
  },
  scope: 'in',
  responseLanguage: 'en',
} as LokAIResponse);

const HINDI_DEPOSIT_RESPONSE = JSON.stringify({
  title: 'Security Deposit — Hindi Demo',
  zone1: { label: 'कानून क्या कहता है', finding: 'मकान मालिक बिना लिखित कारण के सुरक्षा जमा रोक नहीं सकता. किरायेदारी खत्म होने के बाद वैध कटौती छोड़कर जमा राशि लौटानी होती है.' },
  zone2: { label: 'आपकी स्थिति', analysis: 'आपने घर खाली कर दिया है और ₹40,000 अभी भी रोके गए हैं. अगर नुकसान की लिखित सूची या निरीक्षण रिपोर्ट नहीं दी गई है, तो आपका पक्ष मजबूत है.' },
  zone3: { label: 'अब क्या करें', steps: ['मकान मालिक को 15 दिन की समय-सीमा वाला लिखित मांग नोटिस भेजें.', 'भुगतान का तरीका और बैंक विवरण नोटिस में साफ लिखें.', 'जवाब न मिले तो Small Causes Court या Consumer Commission में शिकायत करें.'], cta: 'हिंदी में मांग नोटिस तैयार करें' },
  citations: ['MRC Act 1999 · Section 24', 'Consumer Protection Act 2019 · Section 35'],
  contextPanel: {
    primaryLaw: 'Maharashtra Rent Control Act, 1999',
    sections: [
      { ref: 'Section 24', summary: 'Security deposit return timeline and valid deductions.' },
      { ref: 'Section 35', summary: 'Consumer complaint can be filed for deficient housing-related service.' },
    ],
    keyFacts: ['₹40,000 deposit pending', 'No written damage proof shown', '15-day notice is a practical first step'],
    relatedLaws: ['Consumer Protection Act, 2019', 'Transfer of Property Act, 1882'],
  },
  scope: 'in',
  responseLanguage: 'hi',
} as LokAIResponse);

const MARATHI_NOTICE_RESPONSE = JSON.stringify({
  title: 'मराठी Notice Summary',
  zone1: { label: 'कायदा काय सांगतो', finding: 'नोटीस मिळाली म्हणजे लगेच केस हरली असे होत नाही. आधी मागणी, तारीख, रक्कम आणि उत्तर देण्याची मुदत तपासणे गरजेचे आहे.' },
  zone2: { label: 'तुमची स्थिती', analysis: 'तुमच्या नोटीसमध्ये 15 दिवसांत उत्तर मागितले आहे. रक्कम आणि कारण अस्पष्ट असल्यास तुम्ही स्पष्टीकरण मागू शकता आणि पुरावे मागू शकता.' },
  zone3: { label: 'पुढची पावले', steps: ['नोटीसमधील शेवटची तारीख कॅलेंडरमध्ये मार्क करा.', 'रक्कम, करार आणि पुरावे मागणारे उत्तर तयार करा.', 'उत्तर पाठवताना ईमेल आणि पोस्ट दोन्ही पुरावे ठेवा.'], cta: 'मराठीत उत्तराचा मसुदा तयार करा' },
  citations: ['Civil Procedure Code · Notice Principles', 'Indian Evidence Act · Documentary Proof'],
  contextPanel: {
    primaryLaw: 'Civil Procedure Code and Evidence Principles',
    sections: [
      { ref: 'Notice reply', summary: 'A timely reply helps preserve your factual position.' },
      { ref: 'Document proof', summary: 'Written evidence matters when claims are disputed.' },
    ],
    keyFacts: ['15-day reply window', 'Claim amount unclear', 'Proof should be requested in writing'],
    relatedLaws: ['Indian Contract Act, 1872', 'Indian Evidence Act, 1872'],
  },
  scope: 'in',
  responseLanguage: 'mr',
} as LokAIResponse);

const TAMIL_CONSUMER_RESPONSE = JSON.stringify({
  title: 'Tamil Consumer Complaint',
  zone1: { label: 'சட்டம் என்ன சொல்கிறது', finding: 'குறைபாடுள்ள பொருளுக்கு மாற்று, சரிசெய்தல் அல்லது பணத்தைத் திருப்பிக் கொடுப்பதை விற்பனையாளர் மறுக்க முடியாது.' },
  zone2: { label: 'உங்கள் நிலை', analysis: 'பொருள் குறைபாடுள்ளதாக இருந்தும் விற்பனையாளர் மாற்ற மறுத்தால், இது Consumer Protection Act கீழ் deficiency of service ஆக கருதப்படலாம்.' },
  zone3: { label: 'அடுத்த படிகள்', steps: ['விற்பனையாளருக்கு 15 நாட்கள் அவகாசம் கொடுத்து எழுத்து புகார் அனுப்பவும்.', 'பில், warranty card, புகைப்படங்கள் ஆகியவற்றை சேர்க்கவும்.', 'பதில் வராவிட்டால் District Consumer Commission-ல் புகார் செய்யலாம்.'], cta: 'Consumer complaint draft செய்யுங்கள்' },
  citations: ['Consumer Protection Act 2019 · Section 2(11)', 'Consumer Protection Act 2019 · Section 35'],
  contextPanel: {
    primaryLaw: 'Consumer Protection Act, 2019',
    sections: [
      { ref: 'Section 2(11)', summary: 'Deficiency means fault or shortcoming in quality or service.' },
      { ref: 'Section 35', summary: 'Consumer can file a complaint before the District Commission.' },
    ],
    keyFacts: ['Defective product', 'Seller refused replacement', 'Bill and warranty proof available'],
    relatedLaws: ['Sale of Goods Act, 1930', 'E-commerce Rules, 2020'],
  },
  scope: 'in',
  responseLanguage: 'ta',
} as LokAIResponse);

const OUT_OF_SCOPE_RESPONSE = JSON.stringify({
  title: 'Outside LokAI Scope',
  zone1: { label: 'BOUNDARY', finding: 'This question is outside LokAI’s role. LokAI is designed for Indian legal rights, notices, complaints, tenancy issues, and guided document drafting.' },
  zone2: { label: 'WHY', analysis: 'General questions like sports, weather, entertainment, coding, or health advice do not use the legal reasoning flow that LokAI is built for. The product stays narrow so the output remains structured and reliable.' },
  zone3: { label: 'TRY THIS INSTEAD', steps: ['Ask about a legal notice or government communication.', 'Describe a tenancy, consumer, employment, or police-related issue.', 'Paste the document or message you want explained in plain language.'], cta: 'Switch to a legal question' },
  citations: ['LokAI Prototype Boundary'],
  contextPanel: {
    primaryLaw: 'LokAI handles Indian legal information only',
    sections: [
      { ref: 'Supported scope', summary: 'Legal notices, citizen rights, RTI, consumer complaints, tenancy disputes, and draft documents.' },
    ],
    keyFacts: ['Current question is non-legal', 'Structured legal response resumes once the user asks a legal question'],
    relatedLaws: [],
  },
  scope: 'out',
  responseLanguage: 'en',
} as LokAIResponse);

// ─── Seed data — portfolio demo conversations ────────────────────────────────

function buildDummyConversations(): Conversation[] {
  const rtiParsed     = JSON.parse(RTI_RESPONSE)     as LokAIResponse;
  const depositParsed = JSON.parse(DEPOSIT_RESPONSE) as LokAIResponse;
  const consumerParsed= JSON.parse(CONSUMER_RESPONSE)as LokAIResponse;
  const hindiDepositParsed = JSON.parse(HINDI_DEPOSIT_RESPONSE) as LokAIResponse;
  const marathiNoticeParsed = JSON.parse(MARATHI_NOTICE_RESPONSE) as LokAIResponse;
  const tamilConsumerParsed = JSON.parse(TAMIL_CONSUMER_RESPONSE) as LokAIResponse;
  const outOfScopeParsed = JSON.parse(OUT_OF_SCOPE_RESPONSE) as LokAIResponse;

  return [
    {
      id:      'out-of-scope',
      title:   'Boundary Example',
      tags:    ['Prototype', 'Scope'],
      since:   'Demo · Just now',
      status:  'Out of Scope',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      contextPanel: outOfScopeParsed.contextPanel,
      messages: [
        { role: 'user',      content: 'Can you tell me tomorrow’s cricket score?' },
        { role: 'assistant', content: OUT_OF_SCOPE_RESPONSE },
      ],
    },
    {
      id:      'hindi-deposit',
      title:   'हिंदी Deposit Notice',
      tags:    ['Hindi', 'Tenancy'],
      since:   'Today · 5:06 PM · Mumbai',
      status:  'Ready to File',
      createdAt: new Date(Date.now() - 35 * 60 * 1000),
      contextPanel: hindiDepositParsed.contextPanel,
      messages: [
        { role: 'user',      content: 'मेरे landlord ने ₹40,000 security deposit वापस नहीं किया. मुझे हिंदी में notice चाहिए.' },
        { role: 'assistant', content: HINDI_DEPOSIT_RESPONSE },
      ],
    },
    {
      id:      'marathi-notice',
      title:   'मराठी Notice Reply',
      tags:    ['Marathi', 'Notice'],
      since:   'Today · 12:20 PM · Pune',
      status:  'In Progress',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      contextPanel: marathiNoticeParsed.contextPanel,
      messages: [
        { role: 'user',      content: 'मला मराठीत legal notice चे उत्तर तयार करायचे आहे. 15 दिवसांची deadline आहे.' },
        { role: 'assistant', content: MARATHI_NOTICE_RESPONSE },
      ],
    },
    {
      id:      'tamil-consumer',
      title:   'Tamil Consumer Refund',
      tags:    ['Tamil', 'Consumer'],
      since:   'Yesterday · Chennai',
      status:  'Action Required',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      contextPanel: tamilConsumerParsed.contextPanel,
      messages: [
        { role: 'user',      content: 'நான் வாங்கிய product defective. Seller refund தர மாட்டேன் சொல்கிறார்.' },
        { role: 'assistant', content: TAMIL_CONSUMER_RESPONSE },
      ],
    },
    {
      id:      'rti',
      title:   'BMC RTI — Building Permit',
      tags:    ['RTI', 'Municipal', 'BMC'],
      since:   'Mar 15 · 2:14 PM · Mumbai',
      status:  'Action Required',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      contextPanel: rtiParsed.contextPanel,
      messages: [
        { role: 'user',      content: 'I filed an RTI with BMC about my building permit 45 days ago and got no response.' },
        { role: 'assistant', content: RTI_RESPONSE },
      ],
    },
    {
      id:      'deposit',
      title:   'Security Deposit — ₹40,000',
      tags:    ['Tenancy', 'Deposit', 'Mumbai'],
      since:   'Today · 4:12 PM · Mumbai',
      status:  'Action Required',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      contextPanel: depositParsed.contextPanel,
      messages: [
        { role: 'user',      content: 'My landlord is not returning my ₹40,000 security deposit. It has been 35 days since I moved out.' },
        { role: 'assistant', content: DEPOSIT_RESPONSE },
      ],
    },
    {
      id:      'consumer',
      title:   'Consumer Complaint — Mobile Phone',
      tags:    ['Consumer', 'Electronics'],
      since:   'Mar 10 · Mumbai',
      status:  'In Progress',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      contextPanel: consumerParsed.contextPanel,
      messages: [
        { role: 'user',      content: 'I bought a phone that turned out to be defective. The seller is refusing to replace or refund it.' },
        { role: 'assistant', content: CONSUMER_RESPONSE },
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
});

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(buildDummyConversations);
  const [activeId,      setActiveId]      = useState<string | null>('deposit');

  const getConversation = useCallback(
    (id: string) => conversations.find(c => c.id === id),
    [conversations],
  );

  const createConversation = useCallback((): Conversation => {
    const newConv: Conversation = {
      id:           `conv-${Date.now()}`,
      title:        'New conversation',
      tags:         [],
      since:        'Just now',
      status:       'In Progress',
      createdAt:    new Date(),
      contextPanel: null,
      messages:     [],
    };
    setConversations(prev => {
      const updated = [newConv, ...prev];
      return updated.slice(0, 10); // cap at 10
    });
    return newConv;
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
    }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversations() {
  return useContext(ConversationContext);
}
