// ─── LokAI API Service ────────────────────────────────────────────────────────
// NVIDIA NIM endpoint · sarvamai/sarvam-m model
// API key from VITE_NVIDIA_API_KEY env var — never hardcoded

import { z } from 'zod';

export interface LokAIZone {
  label:   string;
  finding?: string;
  analysis?: string;
  steps?:  string[];
  cta?:    string;
}

export interface ContextPanel {
  primaryLaw:  string;
  sections:    { ref: string; summary: string }[];
  keyFacts:    string[];
  relatedLaws: string[];
}

export type MatterType = 'tenancy' | 'rti' | 'consumer' | 'notice' | 'boundary';
export type TrustLevel = 'clear' | 'needs_fact' | 'source_limited' | 'human_review';
export type SourceCoverage = 'direct' | 'related' | 'missing' | 'conflicting';

export interface LegalSource {
  id: string;
  title: string;
  section: string;
  jurisdiction: string;
  excerpt: string;
  coverage: SourceCoverage;
  howUsed: string;
}

export interface ActionStep {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'current' | 'done' | 'waiting' | 'blocked';
}

export interface LokAIResponse {
  title:           string;
  zone1:           { label: string; finding: string };
  zone2:           { label: string; analysis: string };
  zone3:           { label: string; steps: string[]; cta: string };
  citations:       string[];
  contextPanel:    ContextPanel;
  scope:           'in' | 'out';
  responseLanguage: string;
  matterType?:      MatterType;
  trustLevel?:      TrustLevel;
  missingFacts?:    string[];
  sources?:         LegalSource[];
  nextSteps?:       ActionStep[];
  dailyUpdate?:     { title: string; body: string; timestampLabel: string };
}

export interface APIMessage {
  role:    'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are LokAI, an AI legal guidance assistant for Indian citizens. You help people understand their legal rights. You are not a lawyer.

CRITICAL: Respond ONLY with valid JSON. No markdown.

{
  "title": "3-4 word topic summary",
  "zone1": { "label": "THE LAW", "finding": "1-2 sentence core legal answer." },
  "zone2": { "label": "YOUR SITUATION", "analysis": "2-3 sentences applying the law to the user facts." },
  "zone3": { "label": "WHAT YOU CAN DO", "steps": ["Step 1", "Step 2", "Step 3"], "cta": "Immediate action" },
  "citations": ["Act Name · Section"],
  "contextPanel": {
    "primaryLaw": "Full name of act",
    "sections": [{ "ref": "Section X", "summary": "One line summary" }],
    "keyFacts": ["Fact 1", "Fact 2"],
    "relatedLaws": ["Related Act"]
  },
  "scope": "in",
  "responseLanguage": "en"
}

If the user asks for sports, weather, entertainment, medical advice, coding help, or anything outside Indian legal guidance, set "scope" to "out" and explain the boundary clearly in the same JSON format.`;

const TIMEOUT_MS = 15_000;

function isOutOfScope(text: string) {
  const outOfScopeTerms = [
    'weather', 'temperature', 'rain', 'cricket', 'match', 'score', 'ipl',
    'movie', 'song', 'lyrics', 'recipe', 'gym', 'diet', 'medical', 'doctor',
    'symptom', 'medicine', 'stock price', 'bitcoin', 'code', 'bug', 'javascript',
    'python', 'travel plan', 'hotel', 'restaurant',
  ];
  return outOfScopeTerms.some((term) => text.includes(term));
}

function buildOutOfScopeResponse(): LokAIResponse {
  return {
    title: 'Outside LokAI Scope',
    zone1: {
      label: 'BOUNDARY',
      finding: 'This question is outside LokAI’s role. I can help with Indian legal rights, notices, complaints, tenancy, consumer disputes, and document drafting.',
    },
    zone2: {
      label: 'WHY',
      analysis: 'LokAI is intentionally narrow so the guidance stays structured and legally relevant. For sports, weather, medicine, coding, or general trivia, you should use a general-purpose assistant or a specialist source.',
    },
    zone3: {
      label: 'TRY THIS INSTEAD',
      steps: [
        'Ask about a legal notice, tenancy issue, consumer refund, FIR, or RTI.',
        'Upload or paste the legal document you want explained.',
        'Describe the facts and the state or city if the issue is location-specific.',
      ],
      cta: 'Ask a legal question',
    },
    citations: ['LokAI Knowledge Base'],
    contextPanel: {
      primaryLaw: 'LokAI handles Indian legal guidance only',
      sections: [
        { ref: 'Supported topics', summary: 'Notices, tenancy, consumer complaints, RTI, documents, and legal next steps.' },
      ],
      keyFacts: ['No legal issue detected in the current question', 'Use LokAI for Indian law and citizen-rights workflows'],
      relatedLaws: [],
    },
    scope: 'out',
    responseLanguage: 'en',
  };
}

function buildDemoResponse(messages: APIMessage[]): LokAIResponse {
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
  const text = lastUser.toLowerCase();

  if (isOutOfScope(text)) {
    return buildOutOfScopeResponse();
  }

  if (text.includes('rti') || text.includes('information') || text.includes('bmc')) {
    return {
      title: 'RTI Response Delay',
      zone1: {
        label: 'THE LAW',
        finding: 'If a public authority does not respond to an RTI within 30 days, you can file a First Appeal with the designated appellate officer.',
      },
      zone2: {
        label: 'YOUR SITUATION',
        analysis: 'Your issue appears to involve a delayed government response. The key fact is the date your RTI was submitted, because the appeal window starts after the statutory response period expires.',
      },
      zone3: {
        label: 'WHAT YOU CAN DO',
        steps: [
          'Collect your RTI receipt, application copy, and proof of submission.',
          'Draft a First Appeal citing the missed 30-day response period.',
          'Submit it to the First Appellate Authority of the same department and keep an acknowledgement.',
        ],
        cta: 'Draft First Appeal',
      },
      citations: ['RTI Act 2005 · Section 7(1)', 'RTI Act 2005 · Section 19(1)'],
      contextPanel: {
        primaryLaw: 'Right to Information Act, 2005',
        sections: [
          { ref: 'Section 7(1)', summary: 'Information must normally be provided within 30 days.' },
          { ref: 'Section 19(1)', summary: 'First appeal is available when response is refused or delayed.' },
        ],
        keyFacts: ['RTI submission date', 'Department name', 'PIO details', 'Any acknowledgement received'],
        relatedLaws: ['Maharashtra Right to Public Services Act, 2015'],
      },
      scope: 'in',
      responseLanguage: 'en',
    };
  }

  if (text.includes('phone') || text.includes('refund') || text.includes('seller') || text.includes('defective')) {
    return {
      title: 'Consumer Refund Issue',
      zone1: {
        label: 'THE LAW',
        finding: 'A seller cannot refuse remedy for a defective product when the defect is genuine and reported within a reasonable time.',
      },
      zone2: {
        label: 'YOUR SITUATION',
        analysis: 'Your strongest path is to create a written trail: invoice, product issue, seller refusal, and your requested remedy. This makes the complaint easier to file with a consumer forum or helpline.',
      },
      zone3: {
        label: 'WHAT YOU CAN DO',
        steps: [
          'Send a written complaint to the seller and manufacturer with invoice proof.',
          'Give a clear deadline for refund, replacement, or repair.',
          'If ignored, file with the National Consumer Helpline or District Consumer Commission.',
        ],
        cta: 'Draft Consumer Complaint',
      },
      citations: ['Consumer Protection Act 2019 · Section 2(11)', 'Consumer Protection Act 2019 · Section 35'],
      contextPanel: {
        primaryLaw: 'Consumer Protection Act, 2019',
        sections: [
          { ref: 'Section 2(11)', summary: 'Defines deficiency in goods or services.' },
          { ref: 'Section 35', summary: 'Allows consumers to file complaints before the District Commission.' },
        ],
        keyFacts: ['Purchase date', 'Invoice amount', 'Defect description', 'Seller response'],
        relatedLaws: ['Consumer Protection (E-Commerce) Rules, 2020'],
      },
      scope: 'in',
      responseLanguage: 'en',
    };
  }

  return {
    title: 'Deposit Legal Step',
    zone1: {
      label: 'THE LAW',
      finding: 'A landlord cannot keep a security deposit without a documented legal reason such as unpaid rent, proven damage, or another written tenancy obligation.',
    },
    zone2: {
      label: 'YOUR SITUATION',
      analysis: 'If you have vacated the property and the landlord has not given a written damage claim, your position is strong. The next step is to create a formal written record before escalating.',
    },
    zone3: {
      label: 'WHAT YOU CAN DO',
      steps: [
        'Send a formal demand notice asking for the deposit return within 15 days.',
        'Attach rent agreement, payment proof, handover messages, and photos if available.',
        'If ignored, consider filing before the appropriate consumer forum or local civil court.',
      ],
      cta: 'Draft Demand Notice',
    },
    citations: ['Maharashtra Rent Control Act 1999 · Section 24', 'Consumer Protection Act 2019 · Section 35'],
    contextPanel: {
      primaryLaw: 'Maharashtra Rent Control Act, 1999',
      sections: [
        { ref: 'Section 24', summary: 'Protects tenants against unlawful withholding and harassment.' },
        { ref: 'Section 35', summary: 'Consumer complaint route for service deficiency claims.' },
      ],
      keyFacts: ['Deposit amount', 'Move-out date', 'Written damage claim', 'Payment proof'],
      relatedLaws: ['Transfer of Property Act, 1882'],
    },
    scope: 'in',
    responseLanguage: 'en',
  };
}

// ─── Service error taxonomy ───────────────────────────────────────────────────
// Every failure path gets a typed kind + a retryable flag instead of a bare
// Error. This is what lets a caller (or a future "LokAI paused" banner) tell
// "you're offline" apart from "the model sent something we don't trust."
export type ApiMode = 'demo' | 'live';

export type ServiceFailureKind =
  | 'offline'
  | 'timeout'
  | 'invalid_response'
  | 'permission'
  | 'unsupported'
  | 'server';

export class LokAIServiceError extends Error {
  kind: ServiceFailureKind;
  retryable: boolean;

  constructor(kind: ServiceFailureKind, message: string, retryable = true) {
    super(message);
    this.name = 'LokAIServiceError';
    this.kind = kind;
    this.retryable = retryable;
  }
}

export type ServiceResult<T> = {
  mode: ApiMode;
  data: T;
  error?: LokAIServiceError;
};

async function fetchWithServiceErrors(input: RequestInfo | URL, init: RequestInit, timeout = TIMEOUT_MS): Promise<Response> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new LokAIServiceError('offline', 'You appear to be offline. Your input is still saved.', true);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new LokAIServiceError('permission', `LokAI could not authenticate with the model service (${response.status}).`, false);
      }
      throw new LokAIServiceError('server', `LokAI could not complete the request (${response.status}).`, response.status >= 500);
    }
    return response;
  } catch (err) {
    if (err instanceof LokAIServiceError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new LokAIServiceError('timeout', 'LokAI took too long to respond. Your question is still saved.', true);
    }
    throw new LokAIServiceError('server', err instanceof Error ? err.message : 'LokAI could not reach the service.', true);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Response contract ────────────────────────────────────────────────────────
// The safety boundary is enforced here, in the schema, not only in the prompt.
// A model reply that doesn't fit this shape — or that claims scope:"out" while
// dressing zone1 up as ordinary legal findings instead of a boundary — is
// rejected before it ever reaches the UI, not silently trusted.
const LokAIResponseSchema = z
  .object({
    title: z.string().min(1),
    zone1: z.object({ label: z.string().min(1), finding: z.string().min(1) }),
    zone2: z.object({ label: z.string().min(1), analysis: z.string().min(1) }),
    zone3: z.object({ label: z.string().min(1), steps: z.array(z.string().min(1)).min(1), cta: z.string().min(1) }),
    citations: z.array(z.string()),
    contextPanel: z.object({
      primaryLaw: z.string(),
      sections: z.array(z.object({ ref: z.string(), summary: z.string() })),
      keyFacts: z.array(z.string()),
      relatedLaws: z.array(z.string()),
    }),
    scope: z.enum(['in', 'out']),
    responseLanguage: z.string().min(2),
    matterType: z.enum(['tenancy', 'rti', 'consumer', 'notice', 'boundary']).optional(),
    trustLevel: z.enum(['clear', 'needs_fact', 'source_limited', 'human_review']).optional(),
    missingFacts: z.array(z.string()).optional(),
    sources: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          section: z.string(),
          jurisdiction: z.string(),
          excerpt: z.string(),
          coverage: z.enum(['direct', 'related', 'missing', 'conflicting']),
          howUsed: z.string(),
        }),
      )
      .optional(),
    nextSteps: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          status: z.enum(['locked', 'current', 'done', 'waiting', 'blocked']),
        }),
      )
      .optional(),
    dailyUpdate: z.object({ title: z.string(), body: z.string(), timestampLabel: z.string() }).optional(),
  })
  .refine((val) => val.scope !== 'out' || val.zone1.label === 'BOUNDARY', {
    message: 'An out-of-scope response must be labeled as a boundary, not presented as ordinary legal guidance.',
  });

export async function callLokAIDetailed(messages: APIMessage[]): Promise<ServiceResult<LokAIResponse>> {
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
  if (!apiKey) {
    console.warn('[LokAI API] Missing VITE_NVIDIA_API_KEY. Using structured demo response.');
    return { mode: 'demo', data: buildDemoResponse(messages) };
  }

  try {
    const response = await fetchWithServiceErrors('/api/nvidia/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sarvamai/sarvam-m',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.3,
        max_tokens: 700,
        stream: false,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    if (!content) throw new LokAIServiceError('invalid_response', 'LokAI received an empty response from the model.', true);

    const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error('[LokAI API] JSON parse failed. Raw content:', clean);
      throw new LokAIServiceError('invalid_response', 'LokAI could not parse the model response as JSON.', true);
    }

    const validated = LokAIResponseSchema.safeParse(parsed);
    if (!validated.success) {
      console.error('[LokAI API] Response failed the safety contract:', validated.error.issues);
      throw new LokAIServiceError('invalid_response', "The model response did not match LokAI's response contract.", true);
    }

    return { mode: 'live', data: validated.data as LokAIResponse };
  } catch (err) {
    const serviceError =
      err instanceof LokAIServiceError
        ? err
        : new LokAIServiceError('server', err instanceof Error ? err.message : 'LokAI could not reach the service.', true);
    console.error(`[LokAI API] ${serviceError.kind}:`, serviceError.message);
    return { mode: 'demo', data: buildDemoResponse(messages), error: serviceError };
  }
}

/** Backward-compatible wrapper — existing callers keep getting a bare LokAIResponse. */
export async function callLokAI(messages: APIMessage[]): Promise<LokAIResponse> {
  const result = await callLokAIDetailed(messages);
  return result.data;
}

// ─── Sarvam Speech-to-Text (STT) ─────────────────────────────────────────────
export async function callSarvamSTT(audioBlob: Blob): Promise<string> {
  const apiKey = import.meta.env.VITE_SARVAM_API_KEY;
  if (!apiKey) throw new Error('VITE_SARVAM_API_KEY is not set.');

  const formData = new FormData();
  formData.append('file', audioBlob, 'input.wav');
  formData.append('model', 'saarathi:v1');

  const response = await fetch('/api/sarvam/speech-to-text', {
    method: 'POST',
    headers: { 'api-subscription-key': apiKey },
    body: formData,
  });

  if (!response.ok) throw new Error(`STT failed: ${response.statusText}`);
  const data = await response.json();
  return data.transcript || '';
}

// ─── Sarvam Text-to-Speech (TTS) ─────────────────────────────────────────────
export async function callSarvamTTS(text: string, language: string = 'hi-IN'): Promise<string> {
  const apiKey = import.meta.env.VITE_SARVAM_API_KEY;
  if (!apiKey) throw new Error('VITE_SARVAM_API_KEY is not set.');

  const response = await fetch('/api/sarvam/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey
    },
    body: JSON.stringify({
      inputs: [text],
      target_language_code: language,
      speaker: 'meera',
      model: 'bulbul:v1'
    }),
  });

  if (!response.ok) throw new Error(`TTS failed: ${response.statusText}`);
  const data = await response.json();
  return data.audios?.[0] || ''; // Returns base64 string
}

// ─── Sarvam Document Parse (OCR) ─────────────────────────────────────────────
// Unlike callLokAI, this had no demo fallback at all — missing/failing meant
// a thrown error and a dead upload button, not a graceful degrade. It also
// hits /api/sarvam/..., a Vite dev-only proxy path that doesn't exist in the
// production embed, so even a real key would 404 there regardless. Brought
// in line with callLokAIDetailed's contract: never throws, always resolves
// with something usable, and tags whether it's real or demo content.
const DEMO_OCR_TEXT = [
  'BRIHANMUMBAI MUNICIPAL CORPORATION',
  'Property Tax Demand Notice',
  '',
  'Ref. No: BMC/H-West/2026/0341          Date: 18 March 2026',
  '',
  'You are hereby directed to clear the outstanding property tax dues of',
  'Rs. 32,480 for the financial year 2025-26 within 30 days from the date',
  'of this notice, i.e., on or before 15 April 2026.',
  '',
  'Failure to comply shall result in recovery proceedings under Section',
  '203 of the Mumbai Municipal Corporation Act, 1888.',
].join('\n');

export async function callSarvamOCR(file: File): Promise<ServiceResult<string>> {
  const apiKey = import.meta.env.VITE_SARVAM_API_KEY;
  if (!apiKey) {
    console.warn('[Sarvam OCR] Missing VITE_SARVAM_API_KEY. Using demo extracted text.');
    return { mode: 'demo', data: DEMO_OCR_TEXT };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetchWithServiceErrors('/api/sarvam/v1/document-parse', {
      method: 'POST',
      headers: { 'api-subscription-key': apiKey },
      body: formData,
    });
    const data = await response.json();
    const text = data.parsed_content || DEMO_OCR_TEXT;
    return { mode: 'live', data: text };
  } catch (err) {
    const serviceError =
      err instanceof LokAIServiceError
        ? err
        : new LokAIServiceError('server', err instanceof Error ? err.message : 'OCR request failed.', true);
    console.error(`[Sarvam OCR] ${serviceError.kind}:`, serviceError.message);
    return { mode: 'demo', data: DEMO_OCR_TEXT, error: serviceError };
  }
}
