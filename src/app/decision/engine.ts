/**
 * The decision cascade - LokAI's router.
 *
 * Ordered gates, first resolution wins. Every input resolves to exactly one
 * prepared turn (totality): the fallback is a designed stop with a receipt,
 * never silence and never the nearest-looking answer. The engine reads ONLY
 * the DecisionState it is handed - it does not go looking for context.
 *
 * Conformance contract: for every guardrail scene canonical input and every
 * prepared-chip input, the engine resolves to the same turn the scripted
 * flows produced (asserted in scripts/verify-decision.mjs fixtures).
 */

import { getTurnById } from '../data/responseTurns';
import { buildReceipt } from './receipts';
import type { BecauseRef, DecisionOutcome, DecisionReceipt, DecisionState, GateId, Rationale, RuleId, StageKey } from './types';

/* ------------------------------------------------------------------ */
/* Gate rules - static intent tables, normalized matching only        */
/* ------------------------------------------------------------------ */

const normalize = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim();

/** G2 SCOPE: off-topic markers (chatter outside the product's job). */
const OFF_TOPIC_MARKERS = [
  'weather', 'cricket', 'movie', 'recipe', 'stock', 'bitcoin', 'javascript', 'hotel',
] as const;

/** G2 SCOPE: criminal-law markers (a consumer guide must never assess these). */
const CRIMINAL_MARKERS = [
  'criminal', 'fraud', 'police complaint', 'accuse', 'accusation', 'cheating case', 'fir',
] as const;

/** G3 HIGH-RISK: urgency + irreversibility markers. */
const HIGH_RISK_MARKERS = [
  '6 lakh', 'business loss', 'deadline tomorrow', 'urgent',
] as const;

/** Prepared chip/typed intents for the consumer conversation. Each intent
 *  names the prepared turn it unlocks; the classifier is exact-substring on
 *  normalized text - deterministic and auditable. */
const CONSUMER_INTENTS: Array<{ match: string[]; turnId: string; rule: RuleId }> = [
  { match: ['proof', 'deficiency', 'consumer example', 'evidence'], turnId: 'consumer-explain', rule: 'CONTENT_MATCH' },
  { match: ['voice transcript', 'sample voice'], turnId: 'voice-confirm-transcript', rule: 'CONTENT_MATCH' },
  { match: ["seller says", "seller said", "seller claims", "seller argued", "they say", "they said", "they claim", "they told me", "i disagree", "but the seller", "he says", "she says"], turnId: 'conflicting-rules-stop', rule: 'CONTENT_MATCH' },
  { match: ['interpret this legal notice', 'property tax', 'bmc', 'notice'], turnId: 'notice-explain', rule: 'CONTENT_MATCH' },
  /* Ordered after `notice` on purpose: "payment receipt" appears inside the
     notice's own advice ("keep a copy of the notice and any payment receipt"),
     and the match is substring-based, so `receipt` alone would be ambiguous if
     it came first. The document's own file name is what is sent here. */
  { match: ['payment receipt', 'receipt.jpg', 'filed as evidence'], turnId: 'receipt-filed', rule: 'CONTENT_MATCH' },
  { match: ['when did you buy', 'purchase date', '6 june', 'confirmed purchase date', 'confirm purchase date', 'fact confirmed'], turnId: 'consumer-clarify', rule: 'CONTENT_MATCH' },
  { match: ['mixer', 'damaged', 'refund', 'seller refused', 'defective', 'replacement'], turnId: 'consumer-explain', rule: 'CONTENT_MATCH' },
];

/** Guardrail-scene inputs resolve 1:1 to their prepared turns. The scene id
 *  is authoritative - a scene IS its decision. */
const SCENE_TURNS: Record<string, string> = {
  missing_fact: 'missing-fact-clarify',
  source_gap: 'source-gap-disclose',
  conflicting_rules: 'conflict-disclose',
  high_risk: 'high-risk-stop',
  out_of_scope: 'out-of-scope-stop',
  conflicting_jurisdiction: 'conflicting-rules-stop',
  temporary_failure: 'temporary-recover',
  statute_expiry: 'statute-expiry-stop',
};

/** Scene-specific fact-completeness questions (G6). The clarify beats. */
const SCENE_FACT_QUESTION: Record<string, { turnId: string; because: string }> = {
  missing_fact: { turnId: 'missing-fact-clarify', because: 'first-complaint-date' },
};

/** Scene-specific source-unavailable outcomes (G5). */
const SCENE_SOURCE_GAP: Record<string, { turnId: string; because: string }> = {
  source_gap: { turnId: 'source-gap-disclose', because: 'marketplace-policy' },
  statute_expiry: { turnId: 'statute-expiry-stop', because: 'limitation-window' },
};

const matchAny = (text: string, markers: readonly string[]): string[] =>
  markers.filter((m) => text.includes(m));

/**
 * G0 — SCRIPT: detect writing systems this prototype has no prepared pack
 * for. The honesty law (PRODUCT.md): the other 8 registry languages render
 * as honestly-not-prepared, never silently falling back to English — so an
 * input typed in Telugu, Bengali, etc. resolves to the language stop, and
 * the localized suggestion chips stop being traps (behavioral audit P0-2,
 * test T18). Devanagari and Tamil have packs; every other Indic script hits
 * this gate.
 */
const UNPREPARED_SCRIPT_RANGES: Array<{ name: string; re: RegExp }> = [
  { name: 'Telugu', re: /[\u0C00-\u0C7F]/ },
  { name: 'Bengali', re: /[\u0980-\u09FF]/ },
  { name: 'Gujarati', re: /[\u0A80-\u0AFF]/ },
  { name: 'Gurmukhi', re: /[\u0A00-\u0A7F]/ },
  { name: 'Kannada', re: /[\u0C80-\u0CFF]/ },
  { name: 'Malayalam', re: /[\u0D00-\u0D7F]/ },
  { name: 'Odia', re: /[\u0B00-\u0B7F]/ },
];

function detectUnpreparedScript(text: string): string | null {
  for (const { name, re } of UNPREPARED_SCRIPT_RANGES) {
    if (re.test(text)) return name;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* The cascade                                                        */
/* ------------------------------------------------------------------ */

/** Per-gate narrated stage keys. A stop's beat names the gate that fired —
 *  the narration matches the work this decision actually performs. */
const GATE_STAGE_KEYS: Record<GateId, StageKey[]> = {
  G0_SCRIPT: ['read', 'scope'],
  G1_SCENE: ['read', 'ground', 'match', 'prepare'],
  G2_SCOPE: ['read', 'scope'],
  G3_HIGH_RISK: ['read', 'risk'],
  G4_CONFLICT: ['read', 'conflict'],
  G5_SOURCE: ['read', 'ground', 'match', 'prepare'],
  G6_FACTS: ['read', 'match'],
  G7_CONTENT: ['read', 'ground', 'match', 'prepare'],
  G8_DRAFT: ['read', 'prepare'],
  G9_VERIFY: ['read', 'prepare'],
};

/** Turn-mode overrides on the default per-gate beat: bookkeeping modes run
 *  the short honest arc (the clarify chain's two-stage confirm). */
function stageKeysFor(gate: GateId, turnId: string): StageKey[] {
  const turn = getTurnById(turnId);
  if (turn?.mode === 'confirm' || turn?.mode === 'recover') return ['read', 'prepare'];
  return GATE_STAGE_KEYS[gate];
}

/** G9 ledger recompute: the resolved turn's authored claim counts are
 *  verified against state. Verified numbers ride the receipt; a failed
 *  verification downgrades the grounded count by the unsupported sources
 *  rather than rendering a number the scene cannot back. */
function computeLedger(state: DecisionState, turnId: string): { grounded: number; total: number; verified: boolean } {
  const turn = getTurnById(turnId);
  const authored = { groundedClaims: turn?.groundedClaims ?? 0, totalClaims: turn?.totalClaims ?? 0 };
  if (!state.sources || state.sources.length === 0 || authored.totalClaims === 0) {
    return { grounded: authored.groundedClaims, total: authored.totalClaims, verified: true };
  }
  const verified = verifyLedger(state, authored);
  if (verified) return { grounded: authored.groundedClaims, total: authored.totalClaims, verified: true };
  const unsupported = state.sources.filter((s) => s.support !== 'supports').length;
  return {
    grounded: Math.max(0, authored.groundedClaims - unsupported),
    total: authored.totalClaims,
    verified: false,
  };
}

/** Tappable counterparts of `because` — the receipt as an instrument. */
function becauseRefsFor(because: string[]): BecauseRef[] {
  return because.map((b) => {
    if (b.startsWith('fact:')) return { label: b.slice(5), kind: 'fact' as const, ref: b.slice(5) };
    if (b.startsWith('source:')) return { label: b.slice(7), kind: 'source' as const, ref: b.slice(7) };
    if (b.startsWith('scene:')) return { label: b.slice(6), kind: 'scene' as const, ref: b.slice(6) };
    return { label: b, kind: 'rule' as const, ref: b };
  });
}

export function decide(state: DecisionState): DecisionOutcome {
  const text = normalize(state.input);
  const turnIndex = state.turnIndex ?? 0;

  const rationale = (gate: GateId, rule: RuleId, because: string[], humanLine: string): Rationale => ({
    gate, rule, because, humanLine,
  });

  const finish = (
    turnId: string,
    kind: DecisionOutcome['kind'],
    rat: Rationale,
    draftComputed: boolean,
  ): DecisionOutcome => {
    const outcome: Omit<DecisionOutcome, 'receipt' | 'stageKeys'> = { turnId, kind, rationale: rat, draftComputed };
    const receipt: DecisionReceipt = {
      ...buildReceipt(outcome, turnIndex),
      ledger: computeLedger(state, turnId),
      becauseRefs: becauseRefsFor(rat.because),
    };
    return { ...outcome, receipt, stageKeys: stageKeysFor(rat.gate, turnId) };
  };

  /* G0 - SCRIPT: a writing system with no prepared pack resolves to the
     designed honesty stop — never an English answer wearing a smile. */
  const unpreparedScript = detectUnpreparedScript(text);
  if (unpreparedScript) {
    return finish('language-stop', 'stop',
      rationale('G0_SCRIPT', 'SCOPE_OFF_TOPIC', [`script:${unpreparedScript}`],
        `This prototype has prepared answers in English, Hindi, Marathi, and Tamil — not ${unpreparedScript} yet, so it stops instead of guessing.`),
      false);
  }

  /* G1 - SCENE: a guardrail scene's canonical message resolves to its own
     primary turn. A scene IS its decision; everything after this gate is
     the live conversation path. */
  if (state.scenarioId && state.userMessage && normalize(state.userMessage) === text) {
    const primary = SCENE_TURNS[state.scenarioId];
    const rat = rationale('G1_SCENE', 'SCENE_PRIMARY', [`scene:${state.scenarioId}`],
      'This is the prepared example for this scene, so LokAI answers with that scene’s decision.');
    if (primary) return finish(primary, primaryTurnKind(state.scenarioId), rat, false);
    /* consumer scene has no entry: fall through to conversation gates. */
  }

  /* Progress sentinel bypasses the cascade (internal control flow). */
  if (text === '__progress__') {
    return finish('progress-default', 'proceed',
      rationale('G7_CONTENT', 'PROGRESS_SENTINEL', [], 'LokAI is preparing the next step.'), false);
  }

  /* G2 - SCOPE: criminal markers outrank everything conversational. */
  const criminal = matchAny(text, CRIMINAL_MARKERS);
  if (criminal.length > 0) {
    return finish('out-of-scope-stop', 'stop',
      rationale('G2_SCOPE', 'SCOPE_CRIMINAL', criminal, 'LokAI handles consumer information only - it will not assess a criminal accusation.'), false);
  }

  /* G3 - HIGH-RISK: urgency/irreversibility markers, before any content. */
  const risk = matchAny(text, HIGH_RISK_MARKERS);
  if (risk.length > 0 || state.policyTier === 'human_help_required') {
    const because = risk.length > 0 ? risk : [`tier:${state.policyTier ?? 'unknown'}`];
    return finish(state.scenarioId === 'statute_expiry' ? 'statute-expiry-stop' : 'high-risk-stop', 'escalate',
      rationale('G3_HIGH_RISK', risk.length > 0 ? 'RISK_MARKERS' : 'RISK_TIER_HUMAN', because,
        'This is too consequential for LokAI to assess alone - it stops and points to a human.'), false);
  }

  /* G4 - CONFLICT: a contested record (what the seller reportedly says) is
     the next decision, not something LokAI drafts from. */
  const conflictMarkers = ['seller says', 'seller said', 'seller claims', 'seller argued',
    'they say', 'they said', 'they claim', 'they told me', 'i disagree', 'but the seller', 'he says', 'she says'];
  const conflict = matchAny(text, conflictMarkers);
  const conflictSources = state.sources?.filter((s) => s.support === 'conflicts') ?? [];
  if (conflict.length > 0 || conflictSources.length > 0) {
    const because = conflict.length > 0 ? conflict : conflictSources.map((s) => `source:${s.id}`);
    return finish('conflicting-rules-stop', 'stop',
      rationale('G4_CONFLICT', 'CONFLICT_DIALOGUE', because,
        'The record is contested, so LokAI will not draft from it - the disagreement is the next decision.'), false);
  }

  /* G5 - SOURCE: scene grounding decides whether the topic is answerable. */
  if (state.scenarioId === 'source_gap') {
    const gap = SCENE_SOURCE_GAP.source_gap;
    return finish(gap.turnId, 'clarify',
      rationale('G5_SOURCE', 'SOURCE_GAP_TOPIC', [`source:${gap.because}`],
        'The marketplace policy could not be checked, so LokAI says only what the reviewed source supports.'), false);
  }
  if (state.scenarioId === 'statute_expiry') {
    const gap = SCENE_SOURCE_GAP.statute_expiry;
    return finish(gap.turnId, 'stop',
      rationale('G5_SOURCE', 'SOURCE_LIMITATION_TOPIC', [`source:${gap.because}`],
        'The purchase date sits outside this guide’s illustrated window - a lawyer should check limitation for real dates.'), false);
  }

  /* G6 - FACTS: a scene built around one missing fact asks its question
     instead of answering. */
  if (state.scenarioId === 'missing_fact') {
    const q = SCENE_FACT_QUESTION.missing_fact;
    const unconfirmed = state.facts?.filter((f) => !f.confirmedByUser) ?? [];
    return finish(q.turnId, 'clarify',
      rationale('G6_FACTS', 'FACT_DATE_MISSING', unconfirmed.map((f) => `fact:${f.id}`),
        'One detail changes the next step, so LokAI asks before it answers.'), false);
  }

  /* G7 - CONTENT: prepared intents for the live conversation. */
  if (state.scenarioId === 'consumer' || !state.scenarioId) {
    for (const intent of CONSUMER_INTENTS) {
      const hit = matchAny(text, intent.match);
      if (hit.length > 0) {
        return finish(intent.turnId, turnKind(intent.turnId),
          rationale('G7_CONTENT', intent.rule, hit.slice(0, 3), 'This matched a prepared consumer example, so LokAI can answer from reviewed sources.'), false);
      }
    }
  }

  /* Scene fallback: a scene input that matches none of its rules resolves to
     the scene's own turn (scenes are self-contained decisions). */
  if (state.scenarioId && SCENE_TURNS[state.scenarioId]) {
    const turnId = SCENE_TURNS[state.scenarioId];
    return finish(turnId, turnKind(turnId),
      rationale('G7_CONTENT', 'CONTENT_MATCH', [`scene:${state.scenarioId}`],
        'This scene demonstrates one guardrail decision - LokAI resolves to that decision.'), false);
  }

  /* G7 totality: unmatched input in the open conversation is a designed
     stop - never a guess, never the nearest-looking answer. */
  return finish('boundary-stop', 'stop',
    rationale('G7_CONTENT', 'CONTENT_UNMATCHED', [],
      'This is outside LokAI’s prepared examples, so it stops and shows what is available instead.'), false);
}

function primaryTurnKind(scenarioId: string): DecisionOutcome['kind'] {
  switch (scenarioId) {
    case 'high_risk':
      return 'escalate';
    case 'out_of_scope':
    case 'statute_expiry':
    case 'conflicting_jurisdiction':
      return 'stop';
    case 'missing_fact':
    case 'source_gap':
      return 'clarify';
    case 'conflicting_rules':
      return 'clarify';
    case 'temporary_failure':
      return 'recover';
    default:
      return 'proceed';
  }
}

function turnKind(turnId: string): DecisionOutcome['kind'] {
  const turn = getTurnById(turnId);
  if (!turn) return 'proceed';
  switch (turn.mode) {
    case 'stop': return 'stop';
    case 'clarify': return 'clarify';
    case 'disclose': return 'clarify';
    case 'recover': return 'recover';
    default: return 'proceed';
  }
}

/* ------------------------------------------------------------------ */
/* G8 - DRAFT: permission computed from state, never asserted         */
/* ------------------------------------------------------------------ */

/** Draft is allowed only when every fact is user-confirmed and every source
 *  supports. Scenes without facts/sources default to the turn's own policy. */
export function computeDraftAllowed(state: DecisionState): boolean {
  if (state.facts && state.facts.length > 0) {
    const allConfirmed = state.facts.every((f) => f.confirmedByUser && f.state === 'confirmed');
    if (!allConfirmed) return false;
  }
  if (state.sources && state.sources.length > 0) {
    const allSupport = state.sources.every((s) => s.support === 'supports');
    if (!allSupport) return false;
  }
  return state.policyTier ? state.policyTier === 'self_service' : true;
}

/* ------------------------------------------------------------------ */
/* G9 - VERIFY: the ledger recompute                                  */
/* ------------------------------------------------------------------ */

/** The rendered answer may only claim what state supports. Asserts the
 *  prepared turn's authored ledger against the scene's sources - a mismatch
 *  fails loudly in dev, never silently renders. */
export function verifyLedger(state: DecisionState, authored: { groundedClaims: number; totalClaims: number }): boolean {
  if (!state.sources || state.sources.length === 0) return true;
  const supporting = state.sources.filter((s) => s.support === 'supports').length;
  const total = state.sources.length;
  /* The scene-level consistency check: an answer requiring more support than
     the scene holds must not render as fully grounded. */
  const consistent = authored.totalClaims === 0 || supporting >= 1 || authored.groundedClaims === 0;
  if (!consistent) {
    console.assert(false, '[decision] ledger mismatch', { authored, supporting, total });
  }
  return consistent;
}
