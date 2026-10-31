/**
 * Receipts - deterministic audit atoms for the decision layer.
 *
 * A receipt id is a pure hash of the decisive fields plus the logical turn
 * index. No Date.now(), no Math.random(): the same decision under the same
 * policy must produce the same receipt forever (asserted by
 * scripts/verify-decision.mjs).
 */

import { DECISION_POLICY_VERSION, type DecisionOutcome, type DecisionReceipt } from './types';

/** FNV-1a 32-bit hash over the decisive fields - stable across sessions. */
function hash32(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** Build the receipt from an outcome. Pure: input in, receipt out, always. */
export function buildReceipt(outcome: Omit<DecisionOutcome, 'receipt'>, turnIndex: number): DecisionReceipt {
  const decisive = [
    outcome.turnId,
    outcome.kind,
    outcome.rationale.gate,
    outcome.rationale.rule,
    outcome.rationale.because.join('|'),
    outcome.draftComputed ? 'draft-ok' : 'draft-no',
    String(turnIndex),
    DECISION_POLICY_VERSION,
  ].join('\u241f');
  return {
    id: hash32(decisive),
    policyVersion: DECISION_POLICY_VERSION,
    gate: outcome.rationale.gate,
    rule: outcome.rationale.rule,
    because: outcome.rationale.because,
    humanLine: outcome.rationale.humanLine,
    outcomeKind: outcome.kind,
    turnId: outcome.turnId,
  };
}
