// Deterministic compatibility adapter — routes through the prepared-turn library.

import {
  resolvePreparedTurn,
  turnToLegacyLokAIResponse,
  type DemoLanguage,
} from '../data/responseTurns';

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
  /** Hybrid response mode id when served from prepared turns */
  responseMode?:    string;
  turnId?:          string;
  draftAllowed?:    boolean;
  groundedClaims?:  number;
  totalClaims?:     number;
}

export interface APIMessage {
  role:    'user' | 'assistant' | 'system';
  content: string;
}

export type ApiMode = 'demo';

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

function buildFromPrepared(
  messages: APIMessage[],
  opts?: { scenarioId?: string; language?: DemoLanguage },
): LokAIResponse {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const turn = resolvePreparedTurn(lastUser, opts);
  const legacy = turnToLegacyLokAIResponse(turn);
  return {
    ...legacy,
    responseMode: turn.mode,
    turnId: turn.id,
    draftAllowed: turn.draftAllowed,
    groundedClaims: turn.groundedClaims,
    totalClaims: turn.totalClaims,
    matterType: turn.scenarioId === 'consumer' ? 'consumer' : 'boundary',
  };
}

export async function callLokAIDetailed(
  messages: APIMessage[],
  opts?: { scenarioId?: string; language?: DemoLanguage },
): Promise<ServiceResult<LokAIResponse>> {
  await new Promise((resolve) => window.setTimeout(resolve, 280));
  return { mode: 'demo', data: buildFromPrepared(messages, opts) };
}

export async function callLokAI(messages: APIMessage[]): Promise<LokAIResponse> {
  const result = await callLokAIDetailed(messages);
  return result.data;
}

export async function callSarvamSTT(audioBlob: Blob): Promise<string> {
  void audioBlob;
  await new Promise((resolve) => window.setTimeout(resolve, 500));
  return 'I bought a damaged mixer grinder for ₹8,999 and the seller refused a replacement.';
}

export async function callSarvamTTS(text: string, language: string = 'hi-IN'): Promise<string> {
  void text;
  void language;
  await new Promise((resolve) => window.setTimeout(resolve, 500));
  return '';
}

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

export async function callSarvamOCR(file?: File): Promise<ServiceResult<string>> {
  void file;
  await new Promise((resolve) => window.setTimeout(resolve, 650));
  return { mode: 'demo', data: DEMO_OCR_TEXT };
}
