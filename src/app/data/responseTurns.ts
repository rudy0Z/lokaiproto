/**
 * Hybrid response system — every AI reply is a typed mode, not a forced 3-zone card.
 * Three-zone "explain" is one mode among seven.
 */
import type { TrustLevel } from '../data/matterIntelligence';

export type ResponseMode =
  | 'clarify'
  | 'explain'
  | 'disclose'
  | 'stop'
  | 'confirm'
  | 'progress'
  | 'recover';

export type DemoLanguage = 'en' | 'hi' | 'mr' | 'ta';

export type EmotionalIntent =
  | 'cared_friction'
  | 'relief_without_certainty'
  | 'protective_stop'
  | 'trust_repair'
  | 'quiet_ack'
  | 'working'
  | 'honest_gap';

export interface TurnCitation {
  id: string;
  title: string;
  reference: string;
  reviewLabel: 'Example — verify with a lawyer';
}

export interface ExplainPayload {
  ruleMeans: string;
  appliesHere: string;
  nextSteps: string[];
  cta: string;
  glossaryIds?: string[];
  /** Zone 4 (DECISION-INTERACTION §4-S2): the structural "what this doesn't
   *  cover" line — present whenever groundedClaims < totalClaims, naming the
   *  exact claim that lacks a source. Never a generic disclaimer. */
  doesntCover?: string;
}

export interface ClarifyPayload {
  question: string;
  whyItMatters: string;
  unlocks: string;
}

export interface DisclosePayload {
  partialAnswer: string;
  gap: string;
  whatYouCanStillDo: string[];
}

export interface StopPayload {
  reason: string;
  preservedSummary: string;
  stillAvailable: string[];
  systemsNote?: string;
}

export interface ConfirmPayload {
  acknowledgement: string;
  nextHint?: string;
}

export interface ProgressPayload {
  stages: readonly string[];
  activeIndex: number;
}

export interface RecoverPayload {
  message: string;
  retryLabel: string;
  preservedNote: string;
}

export type TurnPayload =
  | { mode: 'explain'; data: ExplainPayload }
  | { mode: 'clarify'; data: ClarifyPayload }
  | { mode: 'disclose'; data: DisclosePayload }
  | { mode: 'stop'; data: StopPayload }
  | { mode: 'confirm'; data: ConfirmPayload }
  | { mode: 'progress'; data: ProgressPayload }
  | { mode: 'recover'; data: RecoverPayload };

/**
 * Which matter an answer belongs to.
 *
 * Needed because `scenarioId` does NOT identify the matter: the notice
 * interpretation is prepared inside the consumer scenario (it is the same
 * demo journey), so `notice-explain` carries `scenarioId: 'consumer'`. Any
 * surface that must say something true about *this* subject — the
 * "what would change this answer" conditions, the consumer fact gate —
 * has to ask this, not the scenario.
 */
export type ResponseMatter = 'consumer' | 'notice';

export interface ResponseTurn {
  id: string;
  scenarioId: string;
  /** Defaults to 'consumer' when absent (see `matterOf`). */
  matter?: ResponseMatter;
  mode: ResponseMode;
  title: string;
  emotionalIntent: EmotionalIntent;
  /** User message / chip that triggers this turn */
  trigger: string | RegExp;
  language: DemoLanguage;
  citations: TurnCitation[];
  groundedClaims: number;
  totalClaims: number;
  /** Policy: does this turn allow drafting? */
  draftAllowed: boolean;
  payload: TurnPayload;
}

/* The working card's stages are the conversation's middle (audit F1/F5) —
   so they speak in ACTIONS LokAI actually takes, naming the statute it
   checks. "Checking the facts" was removed deliberately: in this product
   the facts are the USER's to confirm (the verification gate), and the
   working card must not imply the model verified them. */
export const DEMO_PROGRESS_STAGES = [
  'Reading what you shared',
  'Checking the Consumer Protection Act, 2019',
  'Matching the law to your facts',
  'Preparing your answer',
] as const;

/** The shorter confirm-after-clarify beat — one honest step, not a re-run
 *  of the full arc for an answer the user just steered to. */
export const CLARIFY_RESOLVE_STAGES = [
  'Recording your answer',
  'Preparing your answer',
] as const;

const CPA_CITATIONS: TurnCitation[] = [
  {
    id: 'cpa-2-10',
    title: 'Consumer Protection Act, 2019',
    reference: 'Section 2(10) — defect in goods',
    reviewLabel: 'Example — verify with a lawyer',
  },
  {
    id: 'cpa-35',
    title: 'Consumer Protection Act, 2019',
    reference: 'Section 35 — complaint before commission',
    reviewLabel: 'Example — verify with a lawyer',
  },
];

/** English prepared turns — 16 curated scenarios for the recruiter demo. */
export const PREPARED_TURNS: ResponseTurn[] = [
  {
    id: 'consumer-explain',
    scenarioId: 'consumer',
    mode: 'explain',
    title: 'Refund for a damaged mixer',
    emotionalIntent: 'relief_without_certainty',
    trigger: /mixer|damaged|refund|seller refused|defective|replacement/i,
    language: 'en',
    citations: CPA_CITATIONS,
    groundedClaims: 4,
    totalClaims: 5,
    draftAllowed: true,
    payload: {
      mode: 'explain',
      data: {
        ruleMeans:
          'When a product arrives damaged, that can count as a consumer issue. You can ask the seller for repair, replacement, or a refund. If they ignore a fair written ask, you can follow up with a legal notice.',
        appliesHere:
          'Your mixer arrived damaged and the seller refused a replacement. The invoice, damage photos, and written refusal give you a solid next step.',
        nextSteps: [
          'Send a written demand notice by registered post with acknowledgement due (AD), and keep the postal receipt.',
          'Save the invoice, WhatsApp or seller-chat screenshots, platform order or ticket ID, defect photos or videos, and warranty details together.',
          'If the seller ignores the notice, prepare a consumer complaint — you can use e-Daakhil, or call National Consumer Helpline (1915), or approach the District Consumer Commission.',
        ],
        cta: 'Prepare demand notice',
        glossaryIds: ['deficiency', 'legalNotice', 'districtCommission'],
        doesntCover:
          'One claim above is not yet sourced: whether the invoice date or the seller-chat date is the one the law counts. That date sets your two-year window, so confirm it before filing.',
      },
    },
  },
  {
    id: 'consumer-clarify',
    scenarioId: 'consumer',
    mode: 'clarify',
    title: 'One date shapes your options',
    emotionalIntent: 'cared_friction',
    trigger: /when did you buy|purchase date/i,
    language: 'en',
    citations: [CPA_CITATIONS[0]],
    groundedClaims: 2,
    totalClaims: 3,
    draftAllowed: false,
    payload: {
      mode: 'clarify',
      data: {
        question: 'When did you buy the mixer?',
        whyItMatters:
          'The law gives you two years from purchase to take a consumer complaint further. Your date decides which doors are still open.',
        unlocks: 'Pick the closest answer below, or type it — LokAI takes the next step from there.',
      },
    },
  },
  {
    id: 'missing-fact-clarify',
    scenarioId: 'missing_fact',
    mode: 'clarify',
    title: 'One detail changes the next step',
    emotionalIntent: 'cared_friction',
    trigger: /when did you|first tell|complaint date|missing|help me file/i,
    language: 'en',
    citations: [CPA_CITATIONS[0]],
    groundedClaims: 2,
    totalClaims: 3,
    draftAllowed: false,
    payload: {
      mode: 'clarify',
      data: {
        question: 'When did you first tell the seller about the damage?',
        whyItMatters:
          'That date affects deadlines and whether LokAI can prepare a complaint draft that matches your timeline.',
        unlocks: 'Once you confirm it, LokAI can prepare the draft for your review.',
      },
    },
  },
  {
    id: 'fact-confirmed',
    scenarioId: 'consumer',
    mode: 'confirm',
    title: 'Fact confirmed',
    emotionalIntent: 'quiet_ack',
    trigger: /confirm(ed)? (purchase )?date|6 june|fact confirmed/i,
    language: 'en',
    citations: [],
    groundedClaims: 5,
    totalClaims: 5,
    draftAllowed: true,
    payload: {
      mode: 'confirm',
      data: {
        acknowledgement: 'Got it — first complaint to seller is recorded as 8 June 2026.',
        nextHint: 'Rechecking the next step with this date in place…',
      },
    },
  },
  {
    id: 'source-gap-disclose',
    scenarioId: 'source_gap',
    mode: 'disclose',
    title: 'Marketplace policy could not be checked',
    emotionalIntent: 'honest_gap',
    trigger: /marketplace|private return|overrides|policy/i,
    language: 'en',
    citations: [CPA_CITATIONS[0]],
    groundedClaims: 1,
    totalClaims: 3,
    draftAllowed: false,
    payload: {
      mode: 'disclose',
      data: {
        partialAnswer:
          'The usual consumer route for a defective product is still open under the Consumer Protection Act.',
        gap: 'This prepared demo has no official record of the marketplace’s private return policy, so LokAI will not say whether that policy overrides your rights.',
        whatYouCanStillDo: [
          'Review the general consumer information shown here.',
          'Add the marketplace policy text if you have it.',
          'Ask a legal professional before relying on any marketplace-policy claim.',
        ],
      },
    },
  },
  {
    id: 'conflict-disclose',
    scenarioId: 'conflicting_rules',
    mode: 'disclose',
    title: 'Two rules may apply',
    emotionalIntent: 'honest_gap',
    trigger: /home business|commercial|personal use|still a consumer/i,
    language: 'en',
    citations: CPA_CITATIONS,
    groundedClaims: 1,
    totalClaims: 3,
    draftAllowed: false,
    payload: {
      mode: 'disclose',
      data: {
        partialAnswer:
          'Personal and commercial use can be treated differently under consumer law.',
        gap: 'The prepared facts do not show how the mixer was used, so LokAI will not recommend a filing route.',
        whatYouCanStillDo: [
          'Clarify whether the mixer was mainly for home use or business.',
          'Compare the two source notes in the evidence panel.',
          'Get professional review before filing.',
        ],
      },
    },
  },
  {
    id: 'high-risk-stop',
    scenarioId: 'high_risk',
    mode: 'stop',
    title: 'Professional help required',
    emotionalIntent: 'protective_stop',
    trigger: /6 lakh|business loss|deadline tomorrow|urgent/i,
    language: 'en',
    citations: [],
    groundedClaims: 0,
    totalClaims: 2,
    draftAllowed: false,
    payload: {
      mode: 'stop',
      data: {
        reason:
          'A large claimed loss, business use, and a deadline tomorrow are too consequential for this prototype to assess alone.',
        preservedSummary:
          'Seller failure linked to a large claimed loss with a possible deadline tomorrow. Evidence checklist and matter summary are preserved.',
        stillAvailable: [
          'Review the matter summary',
          'Export the evidence checklist',
          'Take these notes to a qualified professional',
        ],
        systemsNote:
          'The seller, any insurer, and a lawyer or legal-aid worker all play a part here. Delays in filing can change outcomes — LokAI stops rather than guessing.',
      },
    },
  },
  {
    id: 'out-of-scope-stop',
    scenarioId: 'out_of_scope',
    mode: 'stop',
    title: 'Outside supported examples',
    emotionalIntent: 'protective_stop',
    trigger: /criminal|fraud|police complaint|accuse/i,
    language: 'en',
    citations: [],
    groundedClaims: 0,
    totalClaims: 0,
    draftAllowed: false,
    payload: {
      mode: 'stop',
      data: {
        reason:
          'This prototype demonstrates consumer information, not criminal allegations. LokAI will not draft an accusation.',
        preservedSummary: 'Purchase summary for the damaged mixer is kept. The criminal request is not assessed.',
        stillAvailable: [
          'Keep the purchase summary',
          'Return to the consumer refund example',
          'Seek qualified help for criminal matters',
        ],
        systemsNote:
          'Police, courts, and lawyers work on different timelines and proof standards. A consumer guide cannot safely stand in for that system.',
      },
    },
  },
  {
    /* Triggered from chat-first when the user says "the seller says it's
       fine" — the two facts (purchase date / defect) conflict with the
       seller's reported position, and LokAI stops to ask the user which is
       right (the anti-hallucination gate run on the dialogue rather than
       the documents). riskLevel review_recommended. */
    id: 'conflicting-rules-stop',
    scenarioId: 'conflicting_jurisdiction',
    mode: 'stop',
    title: 'Two stories disagree',
    emotionalIntent: 'protective_stop',
    trigger: /seller (says|said|claims|argued)|they (say|said|claim)|i disagree|but the seller|he says|she says|they told me/i,
    language: 'en',
    citations: [],
    groundedClaims: 1,
    totalClaims: 2,
    draftAllowed: false,
    payload: {
      mode: 'stop',
      data: {
        reason:
          'What you described and what the seller has reportedly told you do not line up. LokAI does not draft a complaint from a contested record.',
        preservedSummary:
          'Your intake, the invoice, and the seller-reported position are all preserved. The conflict is the next decision, not an open question.',
        stillAvailable: [
          'Review the evidence locker to see which facts the AI trusted',
          'Open the audit trail to see what LokAI did',
          'Talk to a person to sort the conflict with a human in the loop',
        ],
        systemsNote:
          'Disagreement between the buyer and the seller is the case, not a problem with the data. LokAI hands the choice back to you rather than picking a side.',
      },
    },
  },
  {
    id: 'temporary-recover',
    scenarioId: 'temporary_failure',
    mode: 'recover',
    title: 'Prepared answer paused',
    emotionalIntent: 'trust_repair',
    trigger: /paused|retry|temporary|failed|error/i,
    language: 'en',
    citations: [],
    groundedClaims: 0,
    totalClaims: 0,
    draftAllowed: false,
    payload: {
      mode: 'recover',
      data: {
        message: 'The demo paused before preparing the answer. Your selected sample is still here — nothing was lost.',
        retryLabel: 'Retry the prepared answer',
        preservedNote: 'No data was uploaded or sent. Tap retry to replay the prepared result, or review the evidence checklist offline.',
      },
    },
  },
  {
    id: 'statute-expiry-stop',
    scenarioId: 'statute_expiry',
    mode: 'stop',
    title: 'Limitation may bar this route',
    emotionalIntent: 'protective_stop',
    trigger: /2022|too old|limitation|time.?bar|years ago|january 2022/i,
    language: 'en',
    citations: [
      {
        id: 'cpa-limitation-note',
        title: 'Consumer Protection Act, 2019',
        reference: 'Complaint timelines · illustrative',
        reviewLabel: 'Example — verify with a lawyer',
      },
    ],
    groundedClaims: 1,
    totalClaims: 3,
    draftAllowed: false,
    payload: {
      mode: 'stop',
      data: {
        reason:
          'This example uses a January 2022 purchase — older than the time limit this demo covers. So LokAI will not draft a notice or suggest filing; a lawyer can check the deadline for your real dates.',
        preservedSummary:
          'Damaged mixer purchased January 2022 for ₹8,999; seller still refuses a refund. Evidence checklist and matter summary are preserved.',
        stillAvailable: [
          'Keep the purchase and evidence summary',
          'Ask a lawyer or legal-aid worker about limitation for your facts',
          'Return to a current consumer-refund example',
        ],
        systemsNote:
          'Limitation depends on when your complaint clock started and which forum hears it. Only a court or a lawyer should decide that for your facts — this prototype stops rather than invent a deadline.',
      },
    },
  },
  {
    id: 'progress-default',
    scenarioId: 'consumer',
    mode: 'progress',
    title: 'Working',
    emotionalIntent: 'working',
    trigger: /^__progress__$/,
    language: 'en',
    citations: [],
    groundedClaims: 0,
    totalClaims: 0,
    draftAllowed: false,
    payload: {
      mode: 'progress',
      data: {
        stages: DEMO_PROGRESS_STAGES,
        activeIndex: 0,
      },
    },
  },
  {
    id: 'boundary-stop',
    scenarioId: 'out_of_scope',
    mode: 'stop',
    title: 'Outside LokAI’s prepared examples',
    emotionalIntent: 'protective_stop',
    trigger: /weather|cricket|movie|recipe|stock|bitcoin|javascript|hotel/i,
    language: 'en',
    citations: [],
    groundedClaims: 0,
    totalClaims: 0,
    draftAllowed: false,
    payload: {
      mode: 'stop',
      data: {
        reason: 'This question is outside the prepared LokAI prototype.',
        preservedSummary: 'The complete example covers a consumer refund and a sample notice.',
        stillAvailable: [
          'Open the prepared consumer-refund example',
          'Use the prepared notice interpreter',
          'Explore why missing facts or source gaps make LokAI stop',
        ],
      },
    },
  },
  {
    /* A document with no claim to interpret still gets a real answer.
     *
     * Before this, `sendDocument` sent the same fixed sentence for every
     * attachment, so the engine matched the notice intent and a payment
     * receipt came back with the property-tax notice's answer — deadline,
     * ward office and all. The paper on screen and the paper in the answer
     * were different documents. The document now decides its own reading. */
    id: 'receipt-filed',
    scenarioId: 'consumer',
    mode: 'confirm',
    title: 'Receipt filed',
    emotionalIntent: 'quiet_ack',
    trigger: /receipt|payment receipt|filed as evidence/i,
    language: 'en',
    citations: [],
    groundedClaims: 0,
    totalClaims: 0,
    /* True, and deliberately so: nothing here refuses anything. The fact
       gate is still the authority on drafting (G8), so a receipt cannot
       unlock a draft that the facts have not. */
    draftAllowed: true,
    payload: {
      mode: 'confirm',
      data: {
        acknowledgement:
          'Filed as evidence. This is a payment receipt, so there is no deadline or claim to act on. It is saved to this matter’s documents.',
        nextHint: 'Nothing else is needed for this one.',
      },
    },
  },
  {
    id: 'notice-explain',
    scenarioId: 'consumer',
    /* A different document, and therefore a different matter: this answer is
       about the BMC property-tax notice, not the damaged mixer. */
    matter: 'notice',
    mode: 'explain',
    title: 'Sample notice explained',
    emotionalIntent: 'relief_without_certainty',
    trigger: /interpret this legal notice|property tax|bmc|notice/i,
    language: 'en',
    citations: [
      {
        id: 'mmc-203',
        title: 'Mumbai Municipal Corporation Act, 1888',
        reference: 'Section 203 — recovery (illustrative)',
        reviewLabel: 'Example — verify with a lawyer',
      },
    ],
    groundedClaims: 3,
    totalClaims: 4,
    draftAllowed: false,
    payload: {
      mode: 'explain',
      data: {
        ruleMeans:
          'A property-tax demand notice asks you to pay listed dues by a stated date. Missing the date can lead to recovery steps under the local municipal law.',
        appliesHere:
          'The prepared BMC notice lists ₹32,480 due by 15 April 2026. Check the amount and deadline on the original paper before paying or disputing.',
        nextSteps: [
          'Compare every figure with your property-tax account statement.',
          'If the amount looks wrong, raise a written query with the ward office before the deadline.',
          'Keep a copy of the notice and any payment receipt.',
        ],
        cta: 'Review the original notice',
        glossaryIds: ['legalNotice'],
      },
    },
  },
  {
    /* The honesty stop (behavioral audit T18 / P0-2): an input typed in a
       script with no prepared pack lands here — G0_SCRIPT in the engine —
       instead of an English answer wearing a smile. The four prepared
       languages are named in their own scripts; the stop copy itself stays
       English because writing it in the unprepared language is exactly what
       the prototype cannot honestly do. */
    id: 'language-stop',
    scenarioId: 'out_of_scope',
    mode: 'stop',
    title: 'This language is not prepared yet',
    emotionalIntent: 'protective_stop',
    trigger: /నేను|আমি|મેં|ਮੈਨੇ|ನಾನು|ഞാൻ|ମୁଁ/u,
    language: 'en',
    citations: [],
    groundedClaims: 0,
    totalClaims: 0,
    draftAllowed: false,
    payload: {
      mode: 'stop',
      data: {
        reason:
          'This prototype has prepared answers in English, Hindi, Marathi, and Tamil only. It will not pretend in another language — a wrong legal answer is worse than none.',
        preservedSummary: 'Nothing you wrote was sent or stored. You can continue in any prepared language right now.',
        stillAvailable: [
          'Continue in English',
          'हिन्दी में जारी रखें',
          'मराठीत पुढे जा',
          'தமிழில் தொடரவும்',
          'Talk to a person — National Consumer Helpline 1915 (free)',
        ],
        systemsNote: 'The language picker (top bar) switches the whole conversation, including stop screens.',
      },
    },
  },
  {
    id: 'voice-confirm-transcript',
    scenarioId: 'consumer',
    mode: 'confirm',
    title: 'Voice transcript ready',
    emotionalIntent: 'quiet_ack',
    trigger: /voice transcript|sample voice/i,
    language: 'en',
    citations: [],
    groundedClaims: 0,
    totalClaims: 0,
    draftAllowed: false,
    payload: {
      mode: 'confirm',
      data: {
        acknowledgement:
          'Prepared transcript: “I bought a damaged mixer grinder for ₹8,999 and the seller refused a replacement.”',
        nextHint: 'Confirm the text, then LokAI will prepare the consumer answer.',
      },
    },
  },
];

export function getTurnById(id: string): ResponseTurn | undefined {
  return PREPARED_TURNS.find((t) => t.id === id);
}

/** The matter an answer belongs to. Defaults to the consumer journey, which
 *  is every prepared turn except the notice interpretation. */
export function matterOf(turn: Pick<ResponseTurn, 'matter'>): ResponseMatter {
  return turn.matter ?? 'consumer';
}

export function getTurnsForScenario(scenarioId: string): ResponseTurn[] {
  return PREPARED_TURNS.filter((t) => t.scenarioId === scenarioId && t.language === 'en');
}

export function getTurnsByMode(mode: ResponseMode): ResponseTurn[] {
  return PREPARED_TURNS.filter((t) => t.mode === mode);
}

/** Resolve a user message or scenario id to the best prepared turn. */
export function resolvePreparedTurn(
  input: string,
  options?: { scenarioId?: string; language?: DemoLanguage },
): ResponseTurn {
  const language = options?.language ?? 'en';
  const scenarioId = options?.scenarioId;

  if (scenarioId) {
    const byScenario = PREPARED_TURNS.find(
      (t) => t.scenarioId === scenarioId && t.language === language && t.mode !== 'progress' && t.mode !== 'confirm',
    );
    if (byScenario) return byScenario;
  }

  const text = input.trim();
  for (const turn of PREPARED_TURNS) {
    if (turn.language !== language) continue;
    if (turn.mode === 'progress') continue;
    const match =
      typeof turn.trigger === 'string'
        ? text.toLowerCase().includes(turn.trigger.toLowerCase())
        : turn.trigger.test(text);
    if (match) return turn;
  }

  return getTurnById('boundary-stop')!;
}

export function turnToLegacyLokAIResponse(turn: ResponseTurn): {
  title: string;
  zone1: { label: string; finding: string };
  zone2: { label: string; analysis: string };
  zone3: { label: string; steps: string[]; cta: string };
  citations: string[];
  contextPanel: {
    primaryLaw: string;
    sections: { ref: string; summary: string }[];
    keyFacts: string[];
    relatedLaws: string[];
  };
  scope: 'in' | 'out';
  responseLanguage: string;
  /* Was `string`, which silently widened away from the TrustLevel union and
     made this whole object unassignable to LokAIResponse. The three values
     actually produced below are all valid members. */
  trustLevel?: TrustLevel;
  missingFacts?: string[];
} {
  const citations = turn.citations.map((c) => `${c.title} · ${c.reference}`);
  const primaryLaw = turn.citations[0]
    ? `${turn.citations[0].title} · ${turn.citations[0].reviewLabel}`
    : 'No source used';

  if (turn.payload.mode === 'explain') {
    const d = turn.payload.data;
    return {
      title: turn.title,
      zone1: { label: 'WHAT THE RULE MEANS', finding: d.ruleMeans },
      zone2: { label: 'HOW IT APPLIES HERE', analysis: d.appliesHere },
      zone3: { label: 'WHAT YOU CAN DO NEXT', steps: d.nextSteps, cta: d.cta },
      citations,
      contextPanel: {
        primaryLaw,
        sections: turn.citations.map((c) => ({ ref: c.reference, summary: c.title })),
        keyFacts: ['Purchase date', 'Invoice amount', 'Defect description', 'Seller response'],
        relatedLaws: [],
      },
      scope: 'in',
      responseLanguage: turn.language,
    };
  }

  if (turn.payload.mode === 'clarify') {
    const d = turn.payload.data;
    return {
      title: turn.title,
      zone1: { label: 'CHECK THIS FACT', finding: d.question },
      zone2: { label: 'WHY IT MATTERS', analysis: d.whyItMatters },
      zone3: { label: 'WHAT IT UNLOCKS', steps: [d.unlocks], cta: 'Add this detail' },
      citations,
      contextPanel: {
        primaryLaw,
        sections: [],
        keyFacts: [d.question],
        relatedLaws: [],
      },
      scope: 'in',
      responseLanguage: turn.language,
      trustLevel: 'needs_fact',
      missingFacts: [d.question],
    };
  }

  if (turn.payload.mode === 'disclose') {
    const d = turn.payload.data;
    return {
      title: turn.title,
      zone1: { label: 'WHAT WE CAN SAY', finding: d.partialAnswer },
      zone2: { label: 'WHAT IS MISSING', analysis: d.gap },
      zone3: { label: 'WHAT YOU CAN STILL DO', steps: d.whatYouCanStillDo, cta: 'Review carefully' },
      citations,
      contextPanel: { primaryLaw, sections: [], keyFacts: [], relatedLaws: [] },
      scope: 'in',
      responseLanguage: turn.language,
      trustLevel: 'source_limited',
    };
  }

  if (turn.payload.mode === 'stop') {
    const d = turn.payload.data;
    return {
      title: turn.title,
      zone1: { label: 'WHY LOKAI STOPPED', finding: d.reason },
      zone2: { label: 'WHAT IS PRESERVED', analysis: d.preservedSummary },
      zone3: { label: 'STILL AVAILABLE', steps: d.stillAvailable, cta: 'Review summary' },
      citations,
      contextPanel: { primaryLaw: 'No source used for this boundary', sections: [], keyFacts: [], relatedLaws: [] },
      scope: 'out',
      responseLanguage: turn.language,
      trustLevel: 'human_review',
    };
  }

  if (turn.payload.mode === 'confirm') {
    const d = turn.payload.data;
    return {
      title: turn.title,
      zone1: { label: 'CONFIRMED', finding: d.acknowledgement },
      zone2: { label: 'NEXT', analysis: d.nextHint ?? 'Continuing with the updated fact.' },
      zone3: { label: 'ACTIONS', steps: ['Continue'], cta: 'Continue' },
      citations: [],
      contextPanel: { primaryLaw: 'User-confirmed fact', sections: [], keyFacts: [], relatedLaws: [] },
      scope: 'in',
      responseLanguage: turn.language,
    };
  }

  if (turn.payload.mode === 'recover') {
    const d = turn.payload.data;
    return {
      title: turn.title,
      zone1: { label: 'PAUSED', finding: d.message },
      zone2: { label: 'YOUR DATA', analysis: d.preservedNote },
      zone3: { label: 'RETRY', steps: [d.retryLabel], cta: d.retryLabel },
      citations: [],
      contextPanel: { primaryLaw: 'Demo recovery', sections: [], keyFacts: [], relatedLaws: [] },
      scope: 'in',
      responseLanguage: turn.language,
    };
  }

  // progress
  const d = turn.payload.data;
  return {
    title: turn.title,
    zone1: { label: 'WORKING', finding: d.stages[d.activeIndex] ?? d.stages[0] },
    zone2: { label: 'STAGES', analysis: d.stages.join(' → ') },
    zone3: { label: 'WAIT', steps: [...d.stages], cta: 'Skip' },
    citations: [],
    contextPanel: { primaryLaw: '', sections: [], keyFacts: [], relatedLaws: [] },
    scope: 'in',
    responseLanguage: turn.language,
  };
}
