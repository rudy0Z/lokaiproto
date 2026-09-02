/**
 * Status vocabulary — the ONE place a workflow state becomes words.
 *
 * Before this module the same evidence state shipped under two names
 * ("Conflicts a fact" on the verify stage, "Needs a check" on Documents;
 * "Uploaded" vs "Gathered") and risk shipped under three. A reviewer read
 * that as two apps stitched together. It was V4 in the design audit.
 *
 * The rule: citizen voice wins. A badge is a word a stressed person reads
 * in passing, so it says the thing in their words, not the system's —
 * "Needs a check", never "review_recommended". Tone travels WITH the
 * label so a state can never be renamed in one surface and recolored in
 * another.
 *
 * Consumers: EvidenceLocker, SourceCoveragePill, the ClaimLedger, the
 * Documents screen, and any future surface that renders a workflow state.
 * If you are writing a status string by hand, stop and add it here.
 */

export type EvidenceStatusName = 'uploaded' | 'missing' | 'conflicting';
export type SourceCoverageName = 'direct' | 'related' | 'missing' | 'conflicting';
export type RiskLevelName = 'self_service' | 'review_recommended' | 'human_required';
export type FactCompletenessName = 'complete' | 'needs_one_detail' | 'insufficient';
export type DraftStatusName = 'ai_draft' | 'user_reviewed' | 'ready_to_use';

/** Matches the Badge primitive's tone union (kept structural, data stays UI-free). */
export type StatusTone = 'neutral' | 'flag' | 'ok' | 'halt' | 'attest';

export interface StatusView {
  label: string;
  tone: StatusTone;
}

/** The state of a document in the matter. */
export const EVIDENCE_STATUS_VIEW: Record<EvidenceStatusName, StatusView> = {
  uploaded:    { label: 'Gathered',      tone: 'ok' },
  conflicting: { label: 'Needs a check', tone: 'flag' },
  missing:     { label: 'Optional',      tone: 'neutral' },
};

/** How directly a source supports the claim it is cited against. */
export const SOURCE_COVERAGE_VIEW: Record<SourceCoverageName, StatusView> = {
  direct:      { label: 'Direct',      tone: 'ok' },
  related:     { label: 'Related',     tone: 'neutral' },
  missing:     { label: 'Missing',     tone: 'neutral' },
  conflicting: { label: 'Conflicting', tone: 'flag' },
};

/** How much human help the matter needs — the policy tier, in citizen words. */
export const RISK_VIEW: Record<RiskLevelName, StatusView> = {
  self_service:       { label: 'Self-service',         tone: 'neutral' },
  review_recommended: { label: 'Needs a check first',  tone: 'flag' },
  human_required:     { label: 'Human required',       tone: 'halt' },
};

/** Whether the extracted facts are complete enough to assess. */
export const FACT_COMPLETENESS_LABEL: Record<FactCompletenessName, string> = {
  complete:          'Complete',
  needs_one_detail:  'Needs one detail',
  insufficient:      'Insufficient',
};

/** Where the demand notice stands in its review lifecycle. */
export const DRAFT_STATUS_LABEL: Record<DraftStatusName, string> = {
  ai_draft:      'AI draft',
  user_reviewed: 'Reviewed',
  ready_to_use:  'Ready to use',
};
