import { getDemoScenario, type DemoFact } from './demoScenarios';
export type WorkflowStage =
  | 'intake'
  | 'clarify'
  | 'verify'
  | 'triage'
  | 'retrieve'
  | 'assess'
  | 'plan'
  | 'packet'
  | 'escalation'
  | 'failure'
  | 'audit';

export type VerificationStatus = 'confirmed' | 'needs_review';

export interface VerificationFact {
  id: string;
  label: string;
  value: string;
  status: VerificationStatus;
  /** Why LokAI flagged this fact for the citizen to check. */
  hint?: string;
}

export type SourceCoverage = 'direct' | 'related' | 'missing' | 'conflicting';
export type RiskLevel = 'self_service' | 'review_recommended' | 'human_required';
export type ActionStepStatus = 'locked' | 'current' | 'done' | 'blocked' | 'waiting';

export type FailureKind =
  | 'missing_facts'
  | 'source_gap'
  | 'conflicting_jurisdiction'
  | 'ocr_unreadable'
  | 'language_uncertain'
  | 'model_timeout'
  | 'out_of_scope'
  | 'high_risk';

export type FactCompleteness = 'complete' | 'needs_one_detail' | 'insufficient';
export type JurisdictionClarity = 'confirmed' | 'assumed' | 'unknown';
export type DraftStatus = 'ai_draft' | 'user_reviewed' | 'ready_to_use';

export interface WorkflowSource {
  id: string;
  title: string;
  section: string;
  jurisdiction: string;
  excerpt: string;
  coverage: SourceCoverage;
  lastReviewed: string;
  howUsed: string;
}

export interface WorkflowActionStep {
  id: string;
  title: string;
  description: string;
  status: ActionStepStatus;
  blockedReason?: string;
  rerouteLabel?: string;
}

export interface FilingPacketField {
  id: string;
  label: string;
  value: string;
  editable: boolean;
}

export interface FilingPacket {
  title: string;
  status: DraftStatus;
  fields: FilingPacketField[];
  evidenceChecklist: string[];
  copySummary: string;
  reviewNotice: string;
}

export interface AuditEvent {
  id: string;
  label: string;
  detail: string;
  /** Wall-clock label for the PREPARED illustration. Live events carry a
   *  logical turn ordinal instead — a legal product's audit trail must never
   *  show a clock time a deterministic demo cannot have actually kept. */
  time?: string;
}

export interface TrustSignals {
  sourceCoverage: SourceCoverage;
  factCompleteness: FactCompleteness;
  jurisdictionClarity: JurisdictionClarity;
  riskLevel: RiskLevel;
  draftStatus: DraftStatus;
  /**
   * Inspectable claim coverage — never model confidence.
   * Prefer groundedClaims/totalClaims in UI; claimRatio is derived (0–1).
   */
  groundedClaims: number;
  totalClaims: number;
}

export interface CaseWorkflowState {
  matterId: 'consumer';
  title: string;
  stage: WorkflowStage;
  stageLabel: string;
  summary: string;
  clarificationQuestion?: string;
  currentUserStep: string;
  trust: TrustSignals;
  sources: WorkflowSource[];
  actionPlan: WorkflowActionStep[];
  filingPacket: FilingPacket;
  auditTrail: AuditEvent[];
  progressEvents: string[];
  humanReviewSummary: string;
}

export interface FailureState {
  kind: FailureKind;
  title: string;
  body: string;
  nextAction: string;
  riskLevel: RiskLevel;
  safeFallback: string;
  /**
   * The named human channel for this stop (behavioral audit P1-4: stops never
   * left the user with a person to call — the single highest-leverage copy
   * change in the product). Every stop names at least one real, free channel;
   * human-required stops name two.
   */
  channels: Array<{ label: string; detail: string }>;
}

type FailureTrustPatch = Pick<
  TrustSignals,
  | 'sourceCoverage'
  | 'factCompleteness'
  | 'jurisdictionClarity'
  | 'riskLevel'
  | 'groundedClaims'
  | 'totalClaims'
>;

const CONSUMER_SOURCES: WorkflowSource[] = [
  {
    id: 'cpa-2-10',
    title: 'Consumer Protection Act, 2019',
    section: 'Section 2(10)',
    jurisdiction: 'India',
    excerpt: 'Defines defect in goods.',
    coverage: 'direct',
    lastReviewed: 'Example — verify with a lawyer',
    howUsed: 'Classifies the damaged mixer as a goods defect, not only a customer-service issue.',
  },
  {
    id: 'cpa-2-11',
    title: 'Consumer Protection Act, 2019',
    section: 'Section 2(11)',
    jurisdiction: 'India',
    excerpt: 'Defines deficiency in service.',
    coverage: 'direct',
    lastReviewed: 'Example — verify with a lawyer',
    howUsed: 'Frames seller refusal as a possible deficiency in service after the user reports the defect.',
  },
  {
    id: 'cpa-35',
    title: 'Consumer Protection Act, 2019',
    section: 'Section 35',
    jurisdiction: 'India',
    excerpt: 'Allows a consumer to file a complaint before the appropriate commission.',
    coverage: 'direct',
    lastReviewed: 'Example — verify with a lawyer',
    howUsed: 'Supports the filing route if the seller ignores the written complaint.',
  },
  {
    id: 'ecom-2020',
    title: 'Consumer Protection (E-Commerce) Rules, 2020',
    section: 'Marketplace duties',
    jurisdiction: 'India',
    excerpt: 'Applies where the purchase was made through an online marketplace.',
    coverage: 'related',
    lastReviewed: 'Example — verify with a lawyer',
    howUsed: 'Used only if the purchase happened through an online marketplace.',
  },
];

const CONSUMER_FACTS = {
  buyerName: 'Priya Sharma',
  sellerName: 'HomeKart',
  platform: 'Online marketplace',
  product: 'Mixer grinder',
  purchaseDate: '6 June 2026',
  defectSummary: 'Mixer arrived with a cracked jar and does not run safely.',
  complaintHistory: 'Seller refused replacement in writing.',
  requestedRemedy: 'Replacement or full refund.',
};

/**
 * Convert a scenario fact (keyed `state`) into a VerificationFact (keyed
 * `status`). A `disputed` fact is the one the gate must catch, so it maps to
 * `needs_review`; everything else is `confirmed`. The `hint` — why LokAI
 * flagged it — carries straight across.
 *
 * This is the seam that unified two once-divergent fact lists (2026-08-27). It
 * takes the structural minimum (`DemoFact`) so a live `MatterFact` from
 * DemoContext maps through it too, which is how confirming a fact on the verify
 * screen propagates to every other screen.
 */
export function factToVerification(f: DemoFact): VerificationFact {
  return {
    id: f.id,
    label: f.label,
    value: f.value,
    status: f.state === 'disputed' ? 'needs_review' : 'confirmed',
    hint: f.hint,
  };
}

/**
 * Facts LokAI extracted from the citizen's intake + uploaded invoice, for the
 * Verification Scratchpad's anti-hallucination gate: the citizen, not the
 * model, owns the facts the legal output is built on.
 *
 * Derived from the consumer scenario's facts — the single canonical source
 * (`demoScenarios.ts`). One is `disputed`, so the gate has a real catch (the
 * "AI misread the date" failure). Live confirm/fix flows through DemoContext,
 * not this static snapshot — this exists for the specimen and for read-only
 * counts (e.g. the drawer's "N facts need your confirmation").
 */
export function getVerificationFacts(): VerificationFact[] {
  return getDemoScenario('consumer').facts.map(factToVerification);
}

// ─── Evidence Locker ───────────────────────────────────────────────────────────
// Grounding has two sides: the law side (sources, coverage, claim counts above)
// and the evidence side — whether the facts LokAI is reasoning over actually hold
// up against each other. This is the evidence side: what's uploaded, what's
// missing, and whether two documents silently disagree.
export type EvidenceStatus = 'uploaded' | 'missing' | 'conflicting';

export interface EvidenceExtractedFact {
  label: string;
  value: string;
}

/**
 * The visual class of an exhibit — drives how the mobile Documents screen draws
 * its paper thumbnail. Kept separate from `id` (which is domain identity) so the
 * thumbnail shape is a stated property, not inferred from a label string.
 */
export type ExhibitKind = 'invoice' | 'chat' | 'photo' | 'receipt' | 'report';

export interface EvidenceItem {
  id: string;
  label: string;
  status: EvidenceStatus;
  extractedFacts?: EvidenceExtractedFact[];
  /** Only set when status is 'conflicting' — names the other document and what disagrees. */
  conflictNote?: string;
  /**
   * What this exhibit establishes, in one line — the reason it is in the matter
   * at all (documents-as-exhibits, MOBILE_AI_SYSTEM.md §3.9). Honest prepared
   * copy, not derived in the view.
   */
  proves?: string;
  /** Visual class for the paper thumbnail. Defaults to 'report' when unset. */
  kind?: ExhibitKind;
}

/**
 * Matches FilingPacket.evidenceChecklist 1:1 so the locker and the packet never
 * disagree about what "the evidence" means. One item is deliberately marked
 * conflicting: the seller-chat screenshot references a different date than the
 * invoice, which is what the purchaseDate fact above is actually flagging.
 */
export function getEvidenceLocker(): EvidenceItem[] {
  return [
    {
      id: 'invoice',
      label: 'Invoice or payment receipt',
      status: 'uploaded',
      kind: 'invoice',
      proves: 'That Priya paid ₹8,999 for the mixer, and when.',
      extractedFacts: [
        { label: 'Date read from invoice', value: '6 June 2026' },
        { label: 'Amount', value: '₹8,999' },
      ],
    },
    /*
     * The conflicting one — the other half of the purchaseDate flag above.
     * Restored 2026-08-26 alongside it: this item was `uploaded` with no
     * conflictNote, which left EVIDENCE_STATUS_STYLE.conflicting and the
     * isConflict fill path in LokAIWorkflow.tsx as unreachable dead code.
     */
    {
      id: 'whatsapp-chat',
      label: 'WhatsApp or seller-chat screenshots',
      status: 'conflicting',
      extractedFacts: [
        { label: 'Seller refusal received', value: '8 June 2026' },
        { label: 'Order referred to as placed', value: '8 June 2026' },
      ],
      conflictNote: 'This thread refers to the order as placed on 8 June, but the invoice is dated 6 June. Confirm the purchase date before LokAI counts the reply window.',
      kind: 'chat',
      proves: 'That the seller refused a replacement in writing.',
    },
    {
      id: 'order-ticket',
      label: 'Platform order or ticket ID',
      status: 'uploaded',
      kind: 'receipt',
      proves: 'That the order can be traced on the platform.',
      extractedFacts: [{ label: 'Order ID', value: 'HK-48291' }],
    },
    {
      id: 'seller-chat',
      label: 'Seller replies, call logs, or written complaint proof',
      status: 'uploaded',
      kind: 'chat',
      proves: 'That Priya complained and gave the seller a chance to fix it.',
      extractedFacts: [{ label: 'Written refusal', value: '8 June 2026' }],
    },
    {
      id: 'defect-evidence',
      label: 'Photos or video showing the defect',
      status: 'uploaded',
      kind: 'photo',
      proves: 'That the mixer arrived damaged and is unsafe to run.',
      extractedFacts: [{ label: 'Captured', value: 'Today' }],
    },
    { id: 'warranty', label: 'Warranty card or product listing', status: 'missing', kind: 'receipt', proves: 'Would show the warranty terms — strengthens the claim if added.' },
    { id: 'repair-report', label: 'Repair report, if already inspected', status: 'missing', kind: 'report', proves: 'Would confirm the defect independently — optional.' },
  ];
}

// ─── Notice risk classification ────────────────────────────────────────────────
// The other half of "keep me on track": once a reply arrives, LokAI decodes it
// and classifies the risk before treating it as trustworthy input — the same
// discipline the intake side already applies to the citizen's own facts.
export type NoticeRiskLevel = 'looks_genuine' | 'high_risk_signals';
export type NoticeAssessmentKind = 'offer' | 'scam_signals';

export interface NoticeAssessment {
  kind: NoticeAssessmentKind;
  title: string;
  decodedSummary: string;
  riskLevel: NoticeRiskLevel;
  riskExplanation: string;
  deadline: string;
  extractedAmount?: string;
  suggestedReply?: string;
}

export function getNoticeAssessment(kind: NoticeAssessmentKind): NoticeAssessment {
  if (kind === 'scam_signals') {
    return {
      kind: 'scam_signals',
      title: 'A reply notice was uploaded',
      decodedSummary: 'The message claims to be from a "consumer resolution office" and asks for a processing fee before it will release any refund.',
      riskLevel: 'high_risk_signals',
      riskExplanation: 'Genuine consumer forums and companies do not charge an upfront fee to process a refund complaint. The message has no advocate enrollment number, no case number, and no verifiable sender domain — the markers LokAI checks before treating a notice as authentic.',
      deadline: 'Claims a 24-hour deadline — itself a common pressure tactic, not a real statutory window.',
    };
  }
  return {
    kind: 'offer',
    title: 'HomeKart replied',
    decodedSummary: 'The seller offers store credit of ₹4,500 instead of the full refund, citing “opened packaging.”',
    riskLevel: 'looks_genuine',
    riskExplanation: 'The reply comes from the same email thread as the original purchase and references the correct invoice number and defect description.',
    deadline: 'The seller asks for a response within 7 days.',
    extractedAmount: '₹4,500 store credit offered against ₹8,999 paid',
    suggestedReply: 'Decline the partial offer and restate the full refund request, citing the same statutory sections, with a final 7-day deadline before filing.',
  };
}

export function buildFilingPacket(caseFacts = CONSUMER_FACTS): FilingPacket {
  return {
    title: 'Consumer demand notice draft',
    status: 'ai_draft',
    fields: [
      { id: 'buyer', label: 'Buyer details', value: `${caseFacts.buyerName}, Mumbai`, editable: true },
      { id: 'seller', label: 'Seller/platform details', value: caseFacts.sellerName, editable: true },
      { id: 'purchase', label: 'Purchase details', value: `${caseFacts.product} · ${caseFacts.purchaseDate}`, editable: true },
      { id: 'defect', label: 'Defect summary', value: caseFacts.defectSummary, editable: true },
      { id: 'history', label: 'Written complaint history', value: caseFacts.complaintHistory, editable: true },
      { id: 'remedy', label: 'Requested remedy', value: caseFacts.requestedRemedy, editable: true },
      { id: 'basis', label: 'Legal basis', value: 'Consumer Protection Act, 2019 · Sections 2(10), 2(11), 35', editable: false },
    ],
    evidenceChecklist: [
      'Invoice or payment receipt',
      'WhatsApp or seller-chat screenshots',
      'Platform order or ticket ID',
      'Warranty card or product listing',
      'Photos or video showing the defect',
      'Seller replies, call logs, or written complaint proof',
      'Repair report, if already inspected',
    ],
    copySummary:
      'I purchased a mixer grinder that arrived damaged. I asked the seller for replacement or refund, but the request was refused. I am keeping the invoice, WhatsApp or seller-chat screenshots, platform order ID, damage photos, and seller messages ready for a consumer notice.',
    reviewNotice: 'AI draft. Review every field before sending.',
  };
}

const BASE_ACTION_PLAN: WorkflowActionStep[] = [
  {
    id: 'written-complaint',
    title: 'Send written complaint',
    description: 'Ask the seller or manufacturer for repair, replacement, or refund in writing — send by registered post with acknowledgement due (AD) and keep the postal receipt.',
    status: 'current',
  },
  {
    id: 'save-proof',
    title: 'Save proof',
    description: 'Keep invoice, WhatsApp or seller-chat screenshots, platform order or ticket ID, warranty, and defect photos together.',
    status: 'waiting',
  },
  {
    id: 'file-if-ignored',
    title: 'File if ignored',
    description: 'File on e-Daakhil, call National Consumer Helpline (1915), or approach the District Consumer Commission if no response arrives.',
    status: 'waiting',
  },
];

function getStageLabel(stage: WorkflowStage) {
  const labels: Record<WorkflowStage, string> = {
    intake: 'Tell LokAI what happened',
    clarify: 'Confirm one detail',
    verify: 'Verify the facts',
    triage: 'Consumer issue detected',
    retrieve: 'Checking sources',
    assess: 'Review assessment',
    plan: 'Follow the action plan',
    packet: 'Prepare filing packet',
    escalation: 'Human review recommended',
    failure: 'Safe recovery',
    audit: 'Case history',
  };
  return labels[stage];
}

export function buildAuditTrail(workflowState: CaseWorkflowState): AuditEvent[] {
  return [
    { id: 'intake', label: 'Issue submitted', detail: 'Damaged mixer and seller refusal recorded.', time: '9:41 AM' },
    { id: 'triage', label: 'Matter classified', detail: 'LokAI matched this to consumer refund / defective product.', time: '9:42 AM' },
    { id: 'clarify', label: 'Missing detail requested', detail: workflowState.clarificationQuestion || 'Purchase date and written complaint status checked.', time: '9:42 AM' },
    { id: 'sources', label: 'Sources checked', detail: 'Illustrative Consumer Protection Act source notes reviewed; expert review remains pending.', time: '9:43 AM' },
    { id: 'packet', label: 'Packet prepared', detail: workflowState.filingPacket.title, time: '9:44 AM' },
  ];
}

/* ── The LIVE audit trail (behavioral audit #1) ─────────────────────────────
 *
 * `buildAuditTrail` above is the prepared illustration — fixed events with
 * fixed clock times, which is exactly the "trust theater" the design exists
 * to avoid: a legal product's audit screen must show what THIS session did,
 * not what the demo's nice version would have done.
 *
 * `liveAuditEvents` projects the real DemoContext log (`auditEvents: string[]`
 * — confirmations, corrections, decision receipts, draft approvals, refusals)
 * into the same render shape. Determinism is preserved: the ordinal is the
 * event's position in the log, never `Date.now()`. When the live log is thin
 * (a fresh session) callers fall back to the prepared trail so the screen is
 * never empty — the fallback is a labelled illustration, not a claim. */

const LIVE_EVENT_PATTERNS: Array<{ test: RegExp; label: string; detail: (raw: string) => string }> = [
  {
    test: /^Prepared consumer-refund example loaded/,
    label: 'Matter opened',
    detail: () => 'Prepared consumer-refund example loaded. Nothing sent, nothing stored.',
  },
  {
    test: /^No network or device permission/,
    label: 'No network or device permission requested',
    detail: () => 'Zero fetch, microphone, recorder, and file-input paths — enforced at build time.',
  },
  {
    test: /^Clarify asked/,
    label: 'One question asked before advising',
    detail: () => 'The purchase date was asked because it routes the next step.',
  },
  {
    test: /^Fact confirmed:/,
    label: 'Fact confirmed by you',
    detail: (raw) => raw.replace(/^Fact confirmed:\s*/, ''),
  },
  {
    test: /^Fact corrected:/,
    label: 'Fact corrected by you',
    detail: (raw) => raw.replace(/^Fact corrected:\s*/, '') + ' — draft approval cleared, re-review required.',
  },
  {
    test: /^Decision /,
    label: 'Decision receipt written',
    detail: (raw) => raw,
  },
  {
    test: /^Response mode:/,
    label: 'Response mode set',
    detail: (raw) => raw.replace(/^Response mode:\s*/, ''),
  },
  {
    test: /^Draft approved by user/,
    label: 'You approved the draft for copy/print',
    detail: () => 'The filing action stays yours: LokAI never sends on your behalf.',
  },
  {
    test: /^Draft approval cleared/,
    label: 'Draft approval cleared',
    detail: () => 'A fact changed after approval, so the review gate re-armed.',
  },
  {
    test: /^Opened guardrail scene:/,
    label: 'Guardrail scene opened',
    detail: (raw) => raw.replace(/^Opened guardrail scene:\s*/, ''),
  },
  {
    test: /^New conversation started/,
    label: 'New conversation started',
    detail: (raw) => raw.replace(/^New conversation started\s*—\s*/, ''),
  },
  {
    test: /^Answer flagged/,
    label: 'Answer flagged by you',
    detail: (raw) => raw.replace(/^Answer flagged by user\s*(—\s*)?/, ''),
  },
  {
    /* Generic fallback — a live log line the map doesn't name still renders,
     * because an audit trail that silently drops entries is worse than one
     * with a plain line. */
    test: /.*/,
    label: 'Activity',
    detail: (raw) => raw,
  },
];

export function liveAuditEvents(log: readonly string[]): AuditEvent[] {
  return log.map((raw, i) => {
    const entry = LIVE_EVENT_PATTERNS.find((p) => p.test.test(raw)) ?? LIVE_EVENT_PATTERNS[LIVE_EVENT_PATTERNS.length - 1];
    return {
      id: `live-${i}`,
      label: entry.label,
      detail: entry.detail(raw),
      time: `#${i + 1}`,
    };
  });
}

export function getConsumerWorkflowState(
  stage: WorkflowStage | string | null = 'assess',
  overrides: Partial<CaseWorkflowState> = {},
): CaseWorkflowState {
  const normalizedStage = isWorkflowStage(stage) ? stage : 'assess';
  const isBlocked = normalizedStage === 'packet';
  const isEscalation = normalizedStage === 'escalation';
  const isClarify = normalizedStage === 'clarify';
  const isVerify = normalizedStage === 'verify';
  const isAudit = normalizedStage === 'audit';
  const defaultFailureTrust = normalizedStage === 'failure'
    ? getFailureTrustSignals('missing_facts')
    : null;

  const actionPlan = BASE_ACTION_PLAN.map(step => {
    if (isBlocked && step.id === 'written-complaint') {
      return {
        ...step,
        status: 'blocked' as const,
        blockedReason: 'Seller ignored the written complaint window.',
        rerouteLabel: 'Prepare demand notice',
      };
    }
    if (isBlocked && step.id === 'file-if-ignored') return { ...step, status: 'current' as const };
    if (isAudit && step.id === 'written-complaint') return { ...step, status: 'done' as const };
    return step;
  });

  const state: CaseWorkflowState = {
    matterId: 'consumer',
    title: 'Consumer refund case',
    stage: normalizedStage,
    stageLabel: getStageLabel(normalizedStage),
    summary: 'Damaged mixer with a written seller refusal. LokAI is keeping the path narrow: organise proof, send a written complaint, then review a demand notice if needed.',
    clarificationQuestion: 'Have you already complained to the seller in writing?',
    currentUserStep: isClarify
      ? 'Answer the written-complaint question.'
      : isVerify
        ? 'Confirm the extracted facts before LokAI prepares the assessment.'
        : normalizedStage === 'failure'
          ? 'Answer one question'
        : isBlocked
          ? 'Prepare the demand notice.'
          : 'Send a written complaint with invoice proof.',
    trust: {
      sourceCoverage: defaultFailureTrust?.sourceCoverage ?? 'direct',
      factCompleteness: defaultFailureTrust?.factCompleteness ?? (isClarify || isVerify ? 'needs_one_detail' : 'complete'),
      jurisdictionClarity: defaultFailureTrust?.jurisdictionClarity ?? 'confirmed',
      riskLevel: defaultFailureTrust?.riskLevel ?? (isEscalation ? 'human_required' : 'self_service'),
      draftStatus: isBlocked ? 'ready_to_use' : 'ai_draft',
      // Grounding drops while a fact is missing, recovers once the case is complete,
      // and collapses in the source-gap failure path.
      groundedClaims: defaultFailureTrust?.groundedClaims ?? (isClarify || isVerify ? 3 : 4),
      totalClaims: defaultFailureTrust?.totalClaims ?? 4,
    },
    sources: CONSUMER_SOURCES,
    actionPlan,
    filingPacket: buildFilingPacket(),
    auditTrail: [],
    progressEvents: [
      'Reading your issue',
      'Checking if LokAI can help',
      'Looking for a relevant source',
      'Preparing the next step',
    ],
    humanReviewSummary:
      'A reviewer would receive the issue summary, invoice status, seller refusal details, evidence checklist, sources used, and the generated demand notice.',
  };

  state.auditTrail = buildAuditTrail(state);
  return { ...state, ...overrides };
}

export function markActionStepDone(stepId: string, state = getConsumerWorkflowState()): CaseWorkflowState {
  return {
    ...state,
    actionPlan: state.actionPlan.map(step => step.id === stepId ? { ...step, status: 'done' } : step),
  };
}

export function markActionStepBlocked(stepId: string, state = getConsumerWorkflowState()): CaseWorkflowState {
  return {
    ...state,
    actionPlan: state.actionPlan.map(step => step.id === stepId ? {
      ...step,
      status: 'blocked',
      blockedReason: 'The other side has not responded within the expected window.',
      rerouteLabel: 'Prepare next packet',
    } : step),
  };
}

/** Chat stop turns map onto the failure taxonomy so the refusal the user
 *  meets IN CONVERSATION carries the same named human channels as the
 *  full-bleed stop screens (behavioral audit P1-4 — one source of channels,
 *  never two vocabularies). */
const TURN_FAILURE_KIND: Record<string, FailureKind> = {
  'boundary-stop': 'out_of_scope',
  'out-of-scope-stop': 'out_of_scope',
  'high-risk-stop': 'high_risk',
  'statute-expiry-stop': 'high_risk',
  'conflicting-rules-stop': 'conflicting_jurisdiction',
  'conflict-disclose': 'conflicting_jurisdiction',
  'source-gap-disclose': 'source_gap',
  'temporary-recover': 'model_timeout',
  'missing-fact-clarify': 'missing_facts',
  'language-stop': 'language_uncertain',
};

export function channelsForTurn(turnId: string): Array<{ label: string; detail: string }> {
  const kind = TURN_FAILURE_KIND[turnId];
  return kind ? getFailureState(kind).channels : [];
}

export function getFailureState(kind: FailureKind | string | null): FailureState {
  const failureKind = isFailureKind(kind) ? kind : 'missing_facts';
  const failures: Record<FailureKind, FailureState> = {
    missing_facts: {
      kind: 'missing_facts',
      title: 'LokAI needs one detail',
      body: 'The next step depends on whether the seller has already received a written complaint.',
      nextAction: 'Answer one question',
      riskLevel: 'self_service',
      safeFallback: 'You can still collect invoice, warranty, and defect proof while confirming this.',
      channels: [{ label: 'National Consumer Helpline — 1915', detail: 'Free. Government of India. A person answers, in your language.' }],
    },
    source_gap: {
      kind: 'source_gap',
      title: 'Source coverage is not enough',
      body: 'This prepared prototype does not have an official source that directly supports the exact claim.',
      nextAction: 'Use a general safe step or request human review',
      riskLevel: 'review_recommended',
      safeFallback: 'Keep records and avoid sending a legal claim until a reliable source is checked.',
      channels: [{ label: 'National Consumer Helpline — 1915', detail: 'Free. They can tell you what the marketplace policy generally requires.' }],
    },
    conflicting_jurisdiction: {
      kind: 'conflicting_jurisdiction',
      title: 'Location or date is unclear',
      body: 'Different rules may apply depending on where the purchase happened and when the complaint was made.',
      nextAction: 'Confirm location and document date',
      riskLevel: 'review_recommended',
      safeFallback: 'Use only a neutral evidence-preservation step until the location is clear.',
      channels: [{ label: 'National Consumer Helpline — 1915', detail: 'Free. They route you to the right commission for your district.' }],
    },
    ocr_unreadable: {
      kind: 'ocr_unreadable',
      title: 'The document is hard to read',
      body: 'LokAI could not reliably read the invoice total and date on the uploaded image.',
      nextAction: 'Enter ₹8,999 and the purchase date manually, or retake a clearer photo',
      riskLevel: 'self_service',
      safeFallback: 'Capture the date, seller name, amount, and deadline yourself before LokAI builds an assessment.',
      channels: [{ label: 'National Consumer Helpline — 1915', detail: 'Free. If the paper is urgent and unreadable, a person can read it with you.' }],
    },
    language_uncertain: {
      kind: 'language_uncertain',
      title: 'Confirm the language',
      body: 'LokAI is not fully sure which language to use for the response.',
      nextAction: 'Choose English, Hindi, Marathi, or Tamil',
      riskLevel: 'self_service',
      safeFallback: 'Continue in English until you confirm.',
      channels: [{ label: 'National Consumer Helpline — 1915', detail: 'Free. Answers in Indian languages.' }],
    },
    model_timeout: {
      kind: 'model_timeout',
      title: 'LokAI paused before finishing',
      body: 'Your sample is still here. Nothing was uploaded or sent.',
      nextAction: 'Retry the prepared answer, or review the evidence checklist offline',
      riskLevel: 'self_service',
      safeFallback: 'Save invoice, defect photos, warranty, and seller messages while you wait.',
      channels: [{ label: 'National Consumer Helpline — 1915', detail: 'Free. Available while LokAI is paused.' }],
    },
    out_of_scope: {
      kind: 'out_of_scope',
      title: 'This is outside LokAI’s scope',
      body: 'This prototype only covers consumer refund examples — a damaged product, a seller refusal, and the next practical step. It does not handle RTI, tenancy, employment, or criminal matters.',
      nextAction: 'Open the prepared consumer-refund example',
      riskLevel: 'review_recommended',
      safeFallback: 'If this is urgent or unsafe, contact the appropriate official or professional help.',
      channels: [
        { label: 'National Consumer Helpline — 1915', detail: 'Free. They point you to the right authority for matters LokAI does not cover.' },
        { label: 'District Legal Services Authority', detail: 'Free legal aid. Every district has one.' },
      ],
    },
    high_risk: {
      kind: 'high_risk',
      title: 'This needs a person, not this app',
      body: 'The amount, the business use, or the deadline creates consequences this prototype should not assess alone. LokAI preserved your summary — a person should take it from here.',
      nextAction: 'Talk to a person who can take this on',
      riskLevel: 'human_required',
      safeFallback: 'Do not rely on AI-generated strategy for this matter.',
      channels: [
        { label: 'National Consumer Helpline — 1915', detail: 'Free. Government of India. Explains your route in your language.' },
        { label: 'District Legal Services Authority', detail: 'Free legal aid. Every district has one — ask at the court complex.' },
      ],
    },
  };
  return failures[failureKind];
}

export function getFailureTrustSignals(kind: FailureKind | string | null): FailureTrustPatch {
  const failureKind = isFailureKind(kind) ? kind : 'missing_facts';
  const patches: Record<FailureKind, FailureTrustPatch> = {
    missing_facts: {
      sourceCoverage: 'related',
      factCompleteness: 'needs_one_detail',
      jurisdictionClarity: 'confirmed',
      riskLevel: 'self_service',
      groundedClaims: 3,
      totalClaims: 4,
    },
    source_gap: {
      sourceCoverage: 'missing',
      factCompleteness: 'complete',
      jurisdictionClarity: 'confirmed',
      riskLevel: 'review_recommended',
      groundedClaims: 2,
      totalClaims: 4,
    },
    conflicting_jurisdiction: {
      sourceCoverage: 'conflicting',
      factCompleteness: 'needs_one_detail',
      jurisdictionClarity: 'unknown',
      riskLevel: 'review_recommended',
      groundedClaims: 2,
      totalClaims: 4,
    },
    ocr_unreadable: {
      sourceCoverage: 'related',
      factCompleteness: 'insufficient',
      jurisdictionClarity: 'assumed',
      riskLevel: 'self_service',
      groundedClaims: 2,
      totalClaims: 4,
    },
    language_uncertain: {
      sourceCoverage: 'related',
      factCompleteness: 'needs_one_detail',
      jurisdictionClarity: 'confirmed',
      riskLevel: 'self_service',
      groundedClaims: 3,
      totalClaims: 4,
    },
    model_timeout: {
      sourceCoverage: 'related',
      factCompleteness: 'complete',
      jurisdictionClarity: 'confirmed',
      riskLevel: 'self_service',
      groundedClaims: 3,
      totalClaims: 4,
    },
    out_of_scope: {
      sourceCoverage: 'missing',
      factCompleteness: 'insufficient',
      jurisdictionClarity: 'unknown',
      riskLevel: 'review_recommended',
      groundedClaims: 1,
      totalClaims: 4,
    },
    high_risk: {
      sourceCoverage: 'related',
      factCompleteness: 'insufficient',
      jurisdictionClarity: 'unknown',
      riskLevel: 'human_required',
      groundedClaims: 2,
      totalClaims: 4,
    },
  };

  return patches[failureKind];
}

function isWorkflowStage(value: unknown): value is WorkflowStage {
  return typeof value === 'string' && [
    'intake', 'clarify', 'verify', 'triage', 'retrieve', 'assess', 'plan', 'packet', 'escalation', 'failure', 'audit',
  ].includes(value);
}

function isFailureKind(value: unknown): value is FailureKind {
  return typeof value === 'string' && [
    'missing_facts', 'source_gap', 'conflicting_jurisdiction', 'ocr_unreadable',
    'language_uncertain', 'model_timeout', 'out_of_scope', 'high_risk',
  ].includes(value);
}
