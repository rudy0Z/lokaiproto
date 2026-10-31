/**
 * Decision Layer types - the vocabulary of LokAI's decision engine.
 *
 * The engine is the product's router: every user input resolves to exactly
 * one prepared turn through an ordered gate cascade, and every resolution
 * emits a DecisionReceipt (what decided, from what state, under which policy
 * version). Same state in, same receipt out - no clock, no randomness.
 *
 * Design law (enforced by review + scripts/verify-decision.mjs):
 * - No numeric confidence ever crosses into user-facing types.
 * - No wall-clock or random sources anywhere in this directory.
 * - The engine selects turns; it never authors content (prepared turns in
 *   ../data/responseTurns.ts remain the render library).
 */

/** Ordered gates of the cascade. The first gate that resolves the input owns
 *  the decision. */
export type GateId =
  | 'G1_SCENE'     /* scene canonical message -> its primary turn */
  | 'G2_SCOPE'     /* out-of-scope markers -> boundary stops */
  | 'G3_HIGH_RISK' /* urgency/irreversibility markers -> protective stops */
  | 'G4_CONFLICT'  /* contested record or conflicting sources */
  | 'G5_SOURCE'    /* required source unavailable in this scene */
  | 'G6_FACTS'     /* required fact unconfirmed and the input asks about it */
  | 'G7_CONTENT'   /* normal prepared-content routing */
  | 'G8_DRAFT'     /* draft permission computed from state, never asserted */
  | 'G9_VERIFY';   /* rendered claim counts consistent with state */

/** Why a gate decided. Machine-checkable ids; humanLine is the one honest
 *  sentence a receipt may show. */
export type RuleId =
  | 'SCENE_PRIMARY'
  | 'SCOPE_CRIMINAL'
  | 'SCOPE_OFF_TOPIC'
  | 'RISK_MARKERS'
  | 'RISK_TIER_HUMAN'
  | 'CONFLICT_DIALOGUE'
  | 'SOURCE_GAP_TOPIC'
  | 'SOURCE_LIMITATION_TOPIC'
  | 'FACT_DATE_MISSING'
  | 'CONTENT_MATCH'
  | 'CONTENT_UNMATCHED'
  | 'PROGRESS_SENTINEL'
  | 'DRAFT_COMPUTED'
  | 'LEDGER_CONSISTENT';

export interface Rationale {
  gate: GateId;
  rule: RuleId;
  /** Machine-checkable reasons: fact ids, source ids, the matched intent id. */
  because: string[];
  /** The one plain sentence a receipt may show the user. No numbers. */
  humanLine: string;
}

/** The state the engine may see. Nothing outside this object exists for the
 *  decision - evidence, not vibes. */
export interface DecisionState {
  /** Guardrail scene id (undefined for generic flows like the notice interpreter). */
  scenarioId?: string;
  /** The scene policy tier, when in a scene. */
  policyTier?: 'self_service' | 'review_recommended' | 'human_help_required';
  /** The scene canonical user message (drives G1 exact-match). */
  userMessage?: string;
  /** Live fact states from DemoContext (the verification gate input). */
  facts?: Array<{ id: string; state: 'confirmed' | 'missing' | 'disputed'; confirmedByUser: boolean }>;
  /** Scene sources (the grounding gate input). */
  sources?: Array<{ id: string; support: 'supports' | 'conflicts' | 'unavailable' }>;
  /** The raw user input (chips send their label; typed text arrives as-is). */
  input: string;
  inputKind: 'chip' | 'typed' | 'voice';
  language?: 'en' | 'hi' | 'mr' | 'ta';
  /** Logical conversation turn index - deterministic, never wall-clock. */
  turnIndex?: number;
}

export type OutcomeKind = 'proceed' | 'clarify' | 'stop' | 'escalate' | 'recover';

/** The engine verdict: which prepared turn renders, why, and the receipt. */
export interface DecisionOutcome {
  /** Prepared turn id - resolved by the caller via getTurnById. */
  turnId: string;
  kind: OutcomeKind;
  rationale: Rationale;
  /** G8: draft permission computed from state (facts confirmed + sources support). */
  draftComputed: boolean;
  receipt: DecisionReceipt;
}

/** Audit atom: one decided turn. Rendered by the audit trail, asserted by
 *  the conformance fixtures. */
export interface DecisionReceipt {
  /** Deterministic: pure hash of decisive fields + turn index. */
  id: string;
  policyVersion: string;
  gate: GateId;
  rule: RuleId;
  because: string[];
  humanLine: string;
  outcomeKind: OutcomeKind;
  turnId: string;
}

/** Current decision-policy version. Bump when gate rules change so receipts
 *  stay historically explainable. */
export const DECISION_POLICY_VERSION = 'dl-1.0.0' as const;
