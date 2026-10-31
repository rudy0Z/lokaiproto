import React, { useEffect, useState } from 'react';
import { IconArrowRight, IconCheck, IconClose, IconCopy, IconFile, IconPencil, IconPrint, IconShield } from '../ui/icons';
import { C, LAYOUT, MONO, S, SANS, SERIF, SHADOW, TYPE, typeStyle } from './shared';
import { Sheet } from './Sheet';
import type {
  AuditEvent,
  CaseWorkflowState,
  EvidenceItem,
  FailureState,
  NoticeAssessment,
  SourceCoverage,
  VerificationFact,
  WorkflowActionStep,
  WorkflowSource,
} from '../data/caseWorkflow';
import {
  DRAFT_STATUS_LABEL,
  EVIDENCE_STATUS_VIEW,
  FACT_COMPLETENESS_LABEL,
  RISK_VIEW,
  SOURCE_COVERAGE_VIEW,
} from '../data/statusVocabulary';
import {
  Badge,
  Button,
  Stack,
  Text,
  Label,
  Amount,
  HairlineList,
  HairlineRow,
  Meter,
  meterTone,
  meterColor,
  useHaptic,
} from '../ui';

const CSS = `
  @keyframes lokaiProgressIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes lokaiMeterFill {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes lokaiGateIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .lokai-progress-item,
    .lokai-meter-fill,
    .lokai-gate-in {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
  .lokai-verification-input:focus-visible {
    outline: 2px solid ${C.saffronAccessible};
    outline-offset: 2px;
  }
`;

/** Shows observable source coverage, never model confidence.
 *  Ground-level (L1): the meter is a reading, not an object — no box.
 *  Built on the system <Meter> primitive so the tone comes from the
 *  role layer (theme-correct) and the bar geometry is shared. */
export function GroundingMeter({ grounded, total, note, live = false }: { grounded: number; total: number; note?: string; live?: boolean }) {
  const ratio = total > 0 ? grounded / total : 0;
  const tone = meterTone(ratio);
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text role="label" tone="quiet" measured={false}>Claims checked against sources</Text>
        <Text role="bodyStrong" tone="default" measured={false} style={{ color: meterColor(tone), lineHeight: 1, transition: 'color 0.5s ease' }}>
          {grounded} of {total}
        </Text>
      </div>
      <Meter value={grounded} total={total} tone={tone} live={live} />
      <Text role="meta" tone="faint" measured={false} style={{ marginTop: 7 }}>
        {note ?? `${grounded} of ${total} key claims map to an illustrative source note. Expert review is still pending.`}
      </Text>
    </div>
  );
}

/* Labels for coverage, risk, evidence and draft states live in
   data/statusVocabulary.ts — one vocabulary app-wide (audit V4); tones ride
   the Badge primitive. The old COVERAGE_COLOR map died with the left stripe.
   SmallLabel deleted 2026-09-06 — the system's <Label> primitive owns the
   one caps eyebrow a screen is allowed (L7). */

export function LokAIProgressList({ items }: { items: string[] }) {
  /* Ground-level (L1): a progress reading sits on the page — label + hairline
     rows, no box. */
  return (
    <div aria-live="polite">
      <style>{CSS}</style>
      <Label>LokAI is checking</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, index) => (
          <div
            key={item}
            className="lokai-progress-item"
            style={{
              display: 'grid',
              gridTemplateColumns: '18px 1fr',
              gap: 8,
              alignItems: 'center',
              animation: `lokaiProgressIn 0.22s ${index * 0.08}s ease-out both`,
            }}
          >
            <span style={{
              width: 18,
              height: 18,
              borderRadius: LAYOUT.radius.full,
              border: `1px solid ${index === items.length - 1 ? C.saffron : C.borderStrong}`,
              background: index === items.length - 1 ? 'var(--role-flag-fill)' : C.surface2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {index < items.length - 1 ? (
                <IconCheck size={11} color={C.green} />
              ) : (
                <span style={{ width: 5, height: 5, borderRadius: LAYOUT.radius.full, background: C.saffron }} />
              )}
            </span>
            <Text role="caption" tone="quiet" measured={false} style={{ lineHeight: 1.45 }}>
              {item}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Coverage as a Badge — the vocabulary module owns label AND tone, so the
 *  same state reads identically here, in the ledger, and on Documents. */
export function SourceCoveragePill({ coverage }: { coverage: SourceCoverage }) {
  const view = SOURCE_COVERAGE_VIEW[coverage];
  return <Badge tone={view.tone}>{view.label}</Badge>;
}

export function SourceCard({ source, compact = false }: { source: WorkflowSource; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const plain = source.howUsed || source.excerpt;
  const shortPlain = plain.length > 110 ? `${plain.slice(0, 108)}…` : plain;

  /* A source is a discrete object, so it keeps a card — but the coloured
     left stripe and the asymmetric radius are gone (the stripe was the most
     generic pattern in the app; coverage now travels in the Badge). */
  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.control,
      padding: compact ? '10px 11px' : '12px 13px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Amount tone="anchor">{source.section}</Amount>
        <SourceCoveragePill coverage={source.coverage} />
      </div>
      <Text role="captionStrong" tone="default" measured={false} style={{ margin: '7px 0 4px', lineHeight: 1.35 }}>
        {source.title}
      </Text>
      {!compact && (
        <>
          <Text role="caption" tone="quiet" measured={false} style={{ lineHeight: 1.5, marginBottom: 6 }}>
            {expanded ? source.excerpt : shortPlain}
          </Text>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            style={{
              fontFamily: SANS,
              fontSize: TYPE.micro.size,
              fontWeight: 600,
              color: C.navy,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              marginBottom: 6,
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            {expanded ? 'Hide original legal text' : 'Inspect original legal text'}
          </button>
          {expanded && (
            <Text role="meta" tone="faint" measured={false} style={{ lineHeight: 1.5, marginBottom: 5 }}>
              How LokAI used this: {source.howUsed}
            </Text>
          )}
          <Amount tone="faint" style={{ display: 'block' }}>
            {source.jurisdiction} · {source.lastReviewed}
          </Amount>
        </>
      )}
    </div>
  );
}

/**
 * ClaimLedger — the sheet's lead. LokAI's core bet, made touchable: not a
 * confidence score but a count of how many claims trace to a real source,
 * followed by the coverage detail as a plain ledger. Sits on the sheet's
 * surface (no card of its own — the sheet is the container), separated from
 * the source list by a hairline.
 */
function ClaimLedger({ trust }: { trust: CaseWorkflowState['trust'] }) {
  const ratio = trust.totalClaims > 0 ? trust.groundedClaims / trust.totalClaims : 0;
  const tone = ratio >= 0.85 ? C.green : ratio >= 0.7 ? C.saffron : C.oxblood;
  const factValue = FACT_COMPLETENESS_LABEL[trust.factCompleteness];
  const draftValue = DRAFT_STATUS_LABEL[trust.draftStatus];

  const rows: [string, React.ReactNode, boolean][] = [
    ['What the source supports', <SourceCoveragePill coverage={trust.sourceCoverage} />, false],
    ['Facts needed', factValue, false],
    ['Location rule', trust.jurisdictionClarity, true],
    ['Help needed', RISK_VIEW[trust.riskLevel].label, false],
    ['Draft stage', draftValue, false],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: SERIF, fontSize: TYPE.display2.size, fontWeight: 400, color: tone, lineHeight: 1 }}>
            {trust.groundedClaims}
          </span>
          <span style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 600, color: C.muted }}>
            of {trust.totalClaims} claims trace to a source
          </span>
        </div>
        <Meter value={trust.groundedClaims} total={trust.totalClaims} tone={meterTone(ratio)} />
        <Text role="meta" tone="faint" measured={false} style={{ marginTop: 8 }}>
          Coverage is claim counts, not model confidence. Expert review is still pending.
        </Text>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map(([label, value, cap], i) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            padding: '10px 0', borderTop: i ? `1px solid ${C.rule}` : 'none',
          }}>
            <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted }}>{label}</span>
            {typeof value === 'string'
              ? <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 600, color: C.ink, textTransform: cap ? 'capitalize' : 'none' }}>{value}</span>
              : value}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LokAISourceDrawer({
  open,
  onClose,
  title = 'Source trail',
  sources,
  trust,
  contain = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  sources: WorkflowSource[];
  /** When provided, the sheet leads with a claim ledger summarising coverage —
     the trust detail that used to sit inline on the answer screen (§3.1/§3.3). */
  trust?: CaseWorkflowState['trust'];
  /** True when rendered inside a mobile phone artboard — see Sheet's `contain`. */
  contain?: boolean;
}) {
  /* Presentation (side drawer on desktop, bottom sheet on phones) and its
     motion now live in <Sheet>. Previously this was `width: min(420px,100%)`
     inside a full-bleed fixed container, so at 390px the drawer covered the
     entire screen and hid the answer whose sources it was showing — the
     opposite of inspect-without-losing-context. */
  return (
    <Sheet open={open} onClose={onClose} side="right" label={title} width={420} contain={contain}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
        <div style={{
          minHeight: 64,
          borderBottom: `1px solid ${C.border}`,
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <Label>Legal basis</Label>
            <h2 style={{ fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400, color: C.ink, margin: 0 }}>
              {title}
            </h2>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: LAYOUT.radius.panel,
              border: `1px solid ${C.border}`,
              background: C.surface,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconClose size={17} color={C.inkSoft} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {trust && <ClaimLedger trust={trust} />}
          {trust && <div style={{ borderTop: `1px solid ${C.rule}` }} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trust && <Label>Sources behind each claim</Label>}
            {sources.map(source => <SourceCard key={source.id} source={source} />)}
          </div>
        </div>
      </div>
    </Sheet>
  );
}

function StepDot({ step, index }: { step: WorkflowActionStep; index: number }) {
  const color = step.status === 'done'
    ? C.green
    : step.status === 'blocked'
      ? C.amber
      : step.status === 'current'
        ? C.navy
        : 'var(--role-hairline-firm)';

  return (
    <span style={{
      width: 24,
      height: 24,
      borderRadius: LAYOUT.radius.full,
      background: color,
      color: step.status === 'locked' ? 'var(--role-ink-faint)' : 'var(--role-on-anchor)',
      fontFamily: MONO,
      fontSize: TYPE.label.size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
      flexShrink: 0,
    }}>
      {step.status === 'done' ? <IconCheck size={13} /> : index + 1}
    </span>
  );
}

const REROUTE_FOR: Record<string, { title: string; description: string }> = {
  'written-complaint': {
    title: 'Send notice by Registered Post AD',
    description: 'The friendly email path is blocked, so switch to registered post and keep the postal receipt as statutory proof of delivery.',
  },
};

export function WorkflowActionPlan({
  steps,
  onPacket,
  compact = false,
  interactive = false,
}: {
  steps: WorkflowActionStep[];
  onPacket?: () => void;
  compact?: boolean;
  /** When true, each step gets live Mark done / I'm blocked controls that mutate state in place. */
  interactive?: boolean;
}) {
  const [localSteps, setLocalSteps] = useState<WorkflowActionStep[]>(steps);
  const [reroute, setReroute] = useState<{ afterId: string; title: string; description: string } | null>(null);

  // Keep in sync if the parent swaps the plan (e.g. stage change)
  useEffect(() => { setLocalSteps(steps); setReroute(null); }, [steps]);

  const render = interactive ? localSteps : steps;

  const markDone = (id: string) => {
    setLocalSteps(prev => {
      const idx = prev.findIndex(s => s.id === id);
      return prev.map((s, i) => {
        if (s.id === id) return { ...s, status: 'done' as const };
        if (i === idx + 1 && s.status !== 'done') return { ...s, status: 'current' as const };
        return s;
      });
    });
    setReroute(r => (r?.afterId === id ? null : r));
  };

  const markBlocked = (id: string) => {
    setLocalSteps(prev => prev.map(s => s.id === id ? {
      ...s,
      status: 'blocked' as const,
      blockedReason: 'The other side has not responded within the expected window.',
    } : s));
    const alt = REROUTE_FOR[id];
    if (alt) setReroute({ afterId: id, ...alt });
  };

  return (
    <div>
      <style>{CSS}</style>
      <Label>Living action plan</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 12 }}>
        {render.map((step, index) => (
          <React.Fragment key={step.id}>
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 10 }}>
              <StepDot step={step} index={index} />
              <div>
                <Text role="bodyStrong" tone="default" measured={false} style={{ marginBottom: 3 }}>
                  {step.title}
                </Text>
                <Text role="caption" tone="quiet" measured={false} style={{ lineHeight: 1.48 }}>
                  {step.description}
                </Text>

                {step.status === 'blocked' && step.blockedReason && (
                  <Text role="caption" tone="flag" measured={false} style={{ lineHeight: 1.45, marginTop: 6, fontWeight: 600 }}>
                    {step.blockedReason}
                  </Text>
                )}

                {/* Live controls — the primary is the forward action; blocked
                   is the quiet alternative, never an outlined twin (L5). */}
                {interactive && step.status === 'current' && (
                  <div style={{ display: 'flex', gap: 7, marginTop: 9 }}>
                    <Button
                      size="md"
                      icon={<IconCheck size={13} />}
                      onClick={() => markDone(step.id)}
                    >
                      Mark done
                    </Button>
                    <Button variant="quiet" size="md" onClick={() => markBlocked(step.id)}>
                      I'm blocked
                    </Button>
                  </div>
                )}

                {/* Static reroute button (non-interactive, data-driven blocked state) */}
                {!interactive && step.status === 'blocked' && (
                  <Button
                    variant="quiet"
                    size="md"
                    iconAfter={<IconArrowRight size={13} />}
                    onClick={onPacket}
                    style={{ marginTop: 8, alignSelf: 'flex-start' }}
                  >
                    {step.rerouteLabel || 'Prepare packet'}
                  </Button>
                )}
              </div>
            </div>

            {/* Adaptive reroute, inserted live below the blocked step — a
               flagged exception (the fill marks it), not a striped box. */}
            {interactive && reroute?.afterId === step.id && (
              <div
                className="lokai-gate-in"
                style={{
                  marginLeft: 34,
                  background: 'var(--role-flag-fill)',
                  borderRadius: LAYOUT.radius.control,
                  padding: '10px 12px',
                  animation: 'lokaiGateIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
                }}
              >
                <Text role="label" tone="flag" measured={false} style={{ marginBottom: 4, letterSpacing: '0.07em' }}>
                  Plan adapted
                </Text>
                <Text role="bodyStrong" tone="default" measured={false} style={{ marginBottom: 3 }}>
                  {reroute.title}
                </Text>
                <Text role="caption" tone="quiet" measured={false} style={{ lineHeight: 1.5 }}>
                  {reroute.description}
                </Text>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/**
 * VerificationScratchpad — the anti-hallucination gate. Before LokAI builds the
 * assessment, the citizen confirms (or corrects) every fact the model extracted.
 * One fact starts flagged "needs review" so the catch is visible. The assessment
 * stays locked until all facts are confirmed: the human owns the inputs, which
 * neutralises the AI-misread-a-date liability that sinks legal AI.
 */
/* Colors only — the labels come from data/statusVocabulary.ts so the same
   state never ships under two names (audit V4). Fills are role tokens so
   dark re-tints them. */
const EVIDENCE_STATUS_STYLE: Record<EvidenceItem['status'], { border: string; bg: string; labelColor: string }> = {
  uploaded:    { border: C.green,   bg: 'var(--role-ok-fill)',    labelColor: C.green },
  missing:     { border: C.border,  bg: C.surface2,               labelColor: C.muted },
  conflicting: { border: C.saffron, bg: 'var(--role-flag-fill)',  labelColor: C.amber },
};

/**
 * Evidence Locker — the other half of grounding. The claim ledger already
 * shows whether the *law* is well-sourced; this shows whether the *evidence*
 * holds together. Checked against the same evidenceChecklist the filing
 * packet uses, so "what's needed" never drifts from "what's actually there."
 */
export function EvidenceLocker({ items }: { items: EvidenceItem[] }) {
  const uploadedCount = items.filter(i => i.status !== 'missing').length;
  /*
   * §3.2/§3.6 rebuild: the section sits on the page (serif header is the divider,
   * no outer card). Each evidence item is a discrete object, so it keeps a row —
   * but as a hairline-separated list, not a stack of colored-left-border boxes.
   * Only a conflict (the thing the user must notice) gets a fill.
   */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S[3] }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <Text role="answer" as="h3" measured={false} style={{ lineHeight: 1.2 }}>
            Evidence locker
          </Text>
          <Text role="label" tone="faint" measured={false} style={{ whiteSpace: 'nowrap' }}>
            {uploadedCount} of {items.length} gathered
          </Text>
        </div>
        <Text tone="quiet" style={{ lineHeight: 1.55, marginTop: 6 }}>
          What LokAI checked before trusting the facts below — including whether any two documents disagree.
        </Text>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => {
          const style = EVIDENCE_STATUS_STYLE[item.status];
          const isConflict = item.status === 'conflicting';
          return (
            <div key={item.id} style={{
              borderTop: i ? `1px solid ${C.rule}` : 'none',
              padding: isConflict ? 0 : '11px 0',
            }}>
              <div style={isConflict ? {
                background: C.cautionSoft, borderRadius: LAYOUT.radius.panel, padding: 12, margin: '9px 0',
              } : undefined}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <Text role="bodyStrong" tone="default" measured={false}>{item.label}</Text>
                  <Text role="label" measured={false} style={{ color: style.labelColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {EVIDENCE_STATUS_VIEW[item.status].label}
                  </Text>
                </div>
                {item.extractedFacts && item.extractedFacts.length > 0 && (
                  <div style={{ marginTop: 7, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {item.extractedFacts.map(f => (
                      <span key={f.label} style={{
                        fontFamily: SANS, fontSize: TYPE.micro.size, color: C.inkSoft,
                        background: C.surface2, border: `1px solid ${C.border}`,
                        borderRadius: LAYOUT.radius.pill, padding: '2px 9px',
                      }}>
                        {f.label}: <strong style={{ color: C.ink }}>{f.value}</strong>
                      </span>
                    ))}
                  </div>
                )}
                {item.conflictNote && (
                  <Text role="caption" tone="flag" measured={false} style={{ lineHeight: 1.5, marginTop: 8 }}>
                    {item.conflictNote}
                  </Text>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VerificationScratchpad({
  facts,
  onConfirmed,
  onFactConfirm,
  onFactCorrect,
}: {
  facts: VerificationFact[];
  onConfirmed: () => void;
  onFactConfirm?: (id: string) => void;
  onFactCorrect?: (id: string, value: string) => void;
}) {
  /* Controlled, not copied (2026-08-27). This used to seed a local `items`
     array from the `facts` prop once and mutate that copy, so it ignored every
     later change to the prop — confirming a fact updated the scratchpad's own
     state but nothing else, and a fact corrected elsewhere never reflected
     here. Now `facts` IS the state: confirm/fix call up to DemoContext, which
     re-renders this with the fact settled. Only the edit UI (which row, the
     draft text) is local, because that genuinely belongs to this component. */
  const haptic = useHaptic();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const confirmedCount = facts.filter(i => i.status === 'confirmed').length;
  const allConfirmed = confirmedCount === facts.length;

  const confirm = (id: string) => {
    /* The tick lands with the SETTLE, not the tap: a fact leaving the flagged
       state is the moment the user's ownership got real. */
    haptic();
    onFactConfirm?.(id);
  };

  const startEdit = (item: VerificationFact) => { setEditingId(item.id); setDraft(item.value); };

  const saveEdit = (id: string) => {
    const value = draft.trim() || facts.find((i) => i.id === id)?.value || '';
    setEditingId(null);
    onFactCorrect?.(id, value);
  };

  const remaining = facts.length - confirmedCount;

  /*
   * §3.2 rebuild. The signature component — "the user owns the facts, not the
   * model." Was a folded-corner card (one sharp corner + navy top border — a
   * one-off shape used nowhere else) holding two back-to-back progress bars and
   * a KYC-style stack of bordered fact cards. Now it sits on the page: the serif
   * question is its own header, ONE claim-count indicator, and facts as a
   * hairline list where the value leads and the field label is quiet beneath it.
   * Only a fact that still needs review gets a fill — the exception is flagged,
   * every settled row stays calm.
   */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S[3] }}>
      <style>{CSS}</style>
      <div>
        <Text role="answer" as="h3" measured={false} style={{ lineHeight: 1.2, marginBottom: 6 }}>
          Are these facts right?
        </Text>
        <Text tone="quiet" style={{ lineHeight: 1.55 }}>
          LokAI pulled these from what you shared and your invoice. Confirm or fix each one — your
          guidance is only as accurate as these facts, so you own them, not the AI.
        </Text>
      </div>

      {/* Single claim-count indicator — climbs as facts are confirmed, never a % */}
      <GroundingMeter
        live
        grounded={confirmedCount}
        total={facts.length}
        note={allConfirmed
          ? 'These facts are yours now. The assessment is built on what you confirmed, not on what the AI guessed.'
          : `Confirm or fix ${remaining} flagged fact${remaining === 1 ? '' : 's'} before LokAI builds the assessment. Coverage is claim counts, not model confidence.`}
      />

      {/* Fact list — hairline rows, value leads, label quiet beneath */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {facts.map((fact, i) => {
          const isEditing = editingId === fact.id;
          const needsReview = fact.status === 'needs_review';
          return (
            <div key={fact.id} style={{
              borderTop: i ? `1px solid ${C.rule}` : 'none',
              padding: needsReview ? 0 : '12px 0',
            }}>
              <div style={needsReview ? {
                background: C.cautionSoft,
                borderRadius: LAYOUT.radius.panel,
                padding: 12,
                margin: '10px 0',
              } : undefined}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    {isEditing ? (
                      <input
                        className="lokai-verification-input"
                        aria-label={`Correct ${fact.label}`}
                        value={draft}
                        autoFocus
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(fact.id); }}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 600, color: C.ink,
                          border: `1.5px solid ${C.navy}`, borderRadius: LAYOUT.radius.control,
                          padding: '6px 9px', background: C.surface,
                        }}
                      />
                    ) : (
                      <Text role="bodyStrong" tone="default" measured={false} style={{ lineHeight: 1.35 }}>
                        {fact.value}
                      </Text>
                    )}
                    <Text role="caption" tone="faint" measured={false} style={{ marginTop: 2 }}>
                      {fact.label}
                    </Text>
                  </div>

                  {!isEditing && (
                    needsReview ? (
                      <span aria-hidden style={{
                        width: 8, height: 8, borderRadius: LAYOUT.radius.full,
                        background: C.saffron, flexShrink: 0, marginTop: 6,
                      }} />
                    ) : (
                      <button
                        onClick={() => startEdit(fact)}
                        aria-label={`Edit ${fact.label}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 600, color: C.muted,
                        }}
                      >
                        <IconCheck size={15} color={C.green} />
                        <IconPencil size={12} color={C.muted} />
                      </button>
                    )
                  )}
                </div>

                {/* Needs-review hint + actions — the forward action is primary,
                   the alternative quiet (L5: no outlined twins). */}
                {needsReview && !isEditing && (
                  <>
                    {fact.hint && (
                      <Text role="meta" tone="flag" measured={false} style={{ lineHeight: 1.45, margin: '8px 0 10px' }}>
                        {fact.hint}
                      </Text>
                    )}
                    <div style={{ display: 'flex', gap: 7, marginTop: fact.hint ? 0 : 10 }}>
                      <Button
                        size="md"
                        icon={<IconCheck size={13} />}
                        onClick={() => confirm(fact.id)}
                      >
                        It's correct
                      </Button>
                      <Button variant="quiet" size="md" onClick={() => startEdit(fact)}>
                        Fix it
                      </Button>
                    </div>
                  </>
                )}

                {isEditing && (
                  <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
                    <Button size="md" onClick={() => saveEdit(fact.id)}>Save</Button>
                    <Button variant="quiet" size="md" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gated generate button — the product decision stays exactly as it is:
         the CTA stays locked until every fact is confirmed. Restyled onto the
         Button primitive (disabled = hairline surface, not grey navy). */}
      <Button
        onClick={allConfirmed ? onConfirmed : undefined}
        disabled={!allConfirmed}
        iconAfter={allConfirmed ? <IconArrowRight size={16} /> : undefined}
      >
        {allConfirmed ? 'Build my assessment' : `Confirm ${remaining} more to continue`}
      </Button>
    </div>
  );
}

/**
 * ReviewGate — the visible form of LokAI's strongest product decision:
 * the AI never sends a legal document on the user's behalf. Instead of a bare
 * "copy" button, this is a designed human-in-the-loop checkpoint. The user must
 * consciously confirm they've reviewed the draft before the export actions unlock,
 * and the copy makes the accountability explicit: the citizen is the sender.
 */
export function ReviewGate({
  draftText,
  onCopy,
  onPrint,
  onApprove,
  approved = false,
}: {
  draftText: string;
  onCopy?: () => void;
  onPrint?: () => void;
  onApprove?: (approved: boolean) => void;
  approved?: boolean;
}) {
  const [reviewed, setReviewed] = useState(approved);
  const [copied, setCopied] = useState(false);
  const haptic = useHaptic();

  React.useEffect(() => {
    setReviewed(approved);
  }, [approved]);

  const toggleReviewed = () => {
    const next = !reviewed;
    setReviewed(next);
    /* The unlock moment: the export actions come alive in the user's hand. */
    if (next) haptic();
    onApprove?.(next);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(draftText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
    onCopy?.();
  };

  return (
    <div
      className="lokai-gate-in"
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: LAYOUT.radius.panel,
        padding: 15,
        animation: 'lokaiGateIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
      }}
    >
      <style>{CSS}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <IconShield size={16} color={C.oxblood} />
        <Label>Review before this leaves your hands</Label>
      </div>
      <Text role="lead" as="h3" style={{ lineHeight: 1.25, marginBottom: 7 }}>
        LokAI won't send this for you.
      </Text>
      <Text tone="quiet" style={{ marginBottom: 13, lineHeight: 1.6 }}>
        A legal document carries weight, and an AI can misread a date or an amount. You stay
        in control — read each detail, then copy or print it yourself. A lawyer or trusted
        helper can confirm the wording before you use it.
      </Text>

      {/* Deliberate consent step — press-and-hold to approve (P4).
          900ms hold with consequence copy; keyboard: Enter/Space toggles.
          Tapping again clears approval (undo is easy, approval is weighty). */}
      <Text role="caption" tone="quiet" style={{ marginBottom: 8 }}>
        Copying means you own what you send — check the amount, dates, and names first. LokAI never files anything for you.
      </Text>
      <button
        type="button"
        className="lokai-pressable"
        onPointerDown={(e) => {
          if (reviewed) return;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          const t = window.setTimeout(() => toggleReviewed(), 900);
          (e.currentTarget as HTMLButtonElement).dataset.holdTimer = String(t);
        }}
        onPointerUp={(e) => {
          const t = (e.currentTarget as HTMLButtonElement).dataset.holdTimer;
          if (t) window.clearTimeout(Number(t));
        }}
        onPointerLeave={(e) => {
          const t = (e.currentTarget as HTMLButtonElement).dataset.holdTimer;
          if (t) window.clearTimeout(Number(t));
        }}
        onClick={() => { if (reviewed) toggleReviewed(); }}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !reviewed) { e.preventDefault(); toggleReviewed(); } }}
        aria-pressed={reviewed}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textAlign: 'left',
          background: reviewed ? 'var(--role-ok-fill)' : C.surface2,
          border: `1px solid ${reviewed ? 'var(--role-ok)' : C.border}`,
          borderRadius: LAYOUT.radius.control,
          padding: '11px 12px',
          cursor: 'pointer',
          marginBottom: 11,
        }}
      >
        <span style={{
          width: 20,
          height: 20,
          borderRadius: LAYOUT.radius.sm,
          flexShrink: 0,
          background: reviewed ? C.green : 'var(--role-raised)',
          border: `1.5px solid ${reviewed ? C.green : C.borderStrong}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.16s ease, border-color 0.16s ease',
        }}>
          {reviewed && <IconCheck size={13} color="var(--role-on-anchor)" />}
        </span>
        <span style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 600, color: C.ink }}>
          {reviewed ? "I've read the details and I'm ready to send it myself." : 'Press and hold to approve — you send it yourself.'}
        </span>
      </button>

      {/* One primary (copy — the action almost everyone takes), the print
         escape quiet beneath it. Two filled buttons was the form-wizard tell. */}
      <Stack gap={2}>
        <Button
          onClick={reviewed ? handleCopy : undefined}
          disabled={!reviewed}
          icon={copied ? <IconCheck size={15} /> : <IconCopy size={14} />}
        >
          {copied ? 'Copied' : 'Copy draft'}
        </Button>
        <Button
          variant="quiet"
          onClick={reviewed ? onPrint : undefined}
          disabled={!reviewed}
          icon={<IconPrint size={14} />}
        >
          Print
        </Button>
      </Stack>

      <Text role="meta" tone="faint" style={{ lineHeight: 1.5, marginTop: 11, textAlign: 'center' }}>
        LokAI prepared this draft. You are the sender. No message leaves the app on its own.
      </Text>
    </div>
  );
}

const FIRST_ACTIONS = [
  {
    id: 'save',
    title: 'Save or print the reviewed notice',
    hint: 'Keep a copy you have read. LokAI does not file this for you.',
  },
  {
    id: 'send',
    title: 'Send it yourself',
    hint: 'Email, registered post, or the seller’s support channel — in your name.',
  },
  {
    id: 'remind',
    title: 'Set a personal follow-up reminder',
    hint: 'e.g. 15 days. This demo does not create a calendar event.',
  },
] as const;

/** Peak-End exit beat — owned next actions after ReviewGate. */
export function FirstActionChecklist({
  onComplete,
  compact = false,
}: {
  onComplete?: () => void;
  compact?: boolean;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    save: false,
    send: false,
    remind: false,
  });
  const doneCount = Object.values(checked).filter(Boolean).length;
  const allDone = doneCount === FIRST_ACTIONS.length;

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const complete = FIRST_ACTIONS.every((a) => next[a.id]);
      if (complete && !FIRST_ACTIONS.every((a) => prev[a.id])) {
        onComplete?.();
      }
      return next;
    });
  };

  return (
    <div style={{ marginTop: 12 }}>
      <Label>After you leave LokAI</Label>
      <Text
        role={compact ? 'bodyStrong' : 'title'}
        as="h3"
        measured={false}
        style={{ fontFamily: SERIF, fontWeight: 400, lineHeight: 1.25, marginBottom: 6 }}
      >
        Your first actions
      </Text>
      <Text tone="quiet" style={{ lineHeight: 1.55, marginBottom: 4 }}>
        The product ends here. These three steps stay with you — mark them as you go.
      </Text>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {FIRST_ACTIONS.map((action, i) => {
          const on = checked[action.id];
          return (
            <li key={action.id} style={{ borderTop: i ? `1px solid ${C.rule}` : 'none' }}>
              <button
                type="button"
                onClick={() => toggle(action.id)}
                aria-pressed={on}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  textAlign: 'left',
                  background: on ? 'var(--role-ok-fill)' : 'transparent',
                  /* Checked rows bleed to the padding edge via negative margin
                     so the fill reads as a row highlight, not a boxed tile. */
                  borderRadius: on ? LAYOUT.radius.sm : 0,
                  margin: on ? '0 -8px' : 0,
                  padding: on ? '11px 20px' : '11px 12px',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <span style={{
                  width: 22,
                  height: 22,
                  borderRadius: LAYOUT.radius.sm,
                  flexShrink: 0,
                  background: on ? C.green : 'transparent',
                  border: `1.5px solid ${on ? C.green : C.borderStrong}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: SANS,
                  fontSize: TYPE.micro.size,
                  fontWeight: 800,
                  color: on ? 'var(--role-on-anchor)' : C.muted,
                }}>
                  {on ? <IconCheck size={13} color="var(--role-on-anchor)" /> : i + 1}
                </span>
                <span>
                  <Text role="bodyStrong" measured={false} style={{ display: 'block' }}>{action.title}</Text>
                  <Text role="caption" tone="faint" measured={false} style={{ display: 'block', marginTop: 2, lineHeight: 1.45 }}>{action.hint}</Text>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <Text
        role="meta"
        measured={false}
        style={{ color: allDone ? C.green : C.muted, marginTop: 12, fontWeight: allDone ? 700 : 500 }}
      >
        {allDone
          ? 'Exit checklist marked · you own the next steps outside LokAI'
          : `${doneCount} of ${FIRST_ACTIONS.length} marked`}
      </Text>
    </div>
  );
}

/* StopState (FailureStateCard) deleted 2026-09-06 — no render sites since the
   mobile stop screen moved to <MobileStopScreen> (Screen tone="stop") and the
   desktop stop composition is Phase 7, which will compose its own surface.
   The full-bleed/L6/L8 reasoning lives there, not in a card. */

/**
 * NoticeAssessmentCard — the same "verify before trusting" discipline the
 * intake side applies to the citizen's own facts, applied to whatever the
 * other side sends back. A genuine reply gets a decoded summary and an
 * editable reply draft; scam signals get flagged and stop short of one,
 * the same boundary FailureStateCard draws for high_risk intake.
 */
export function NoticeAssessmentCard({ assessment, onPrepareReply }: { assessment: NoticeAssessment; onPrepareReply?: () => void }) {
  const isRisky = assessment.riskLevel === 'high_risk_signals';
  return (
    <div style={{
      border: `1px solid ${isRisky ? 'var(--role-halt)' : C.border}`,
      borderRadius: LAYOUT.radius.card,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <Badge tone={isRisky ? 'halt' : 'ok'}>{isRisky ? 'Verify before trusting' : 'Looks genuine'}</Badge>
      <Text role="lead" as="h3" measured={false} style={{ lineHeight: 1.25 }}>
        {assessment.title}
      </Text>
      <Text tone="quiet" style={{ lineHeight: 1.6 }}>
        {assessment.decodedSummary}
      </Text>
      <div style={{ background: isRisky ? 'var(--role-halt-fill)' : 'var(--role-ok-fill)', borderRadius: LAYOUT.radius.control, padding: '10px 12px' }}>
        <Text role="label" tone={isRisky ? 'halt' : 'ok'} measured={false} style={{ marginBottom: 4, letterSpacing: '0.05em' }}>
          Why LokAI flagged this
        </Text>
        <Text role="body" tone="quiet" style={{ lineHeight: 1.55 }}>
          {assessment.riskExplanation}
        </Text>
      </div>
      {assessment.extractedAmount && (
        <Text role="bodyStrong" tone="default" measured={false}>
          <strong>Offer:</strong> {assessment.extractedAmount}
        </Text>
      )}
      <Text role="caption" tone="faint" measured={false}>
        {assessment.deadline}
      </Text>
      {!isRisky && assessment.suggestedReply && onPrepareReply && (
        <Button
          onClick={onPrepareReply}
          iconAfter={<IconArrowRight size={14} />}
          style={{ marginTop: 4 }}
        >
          Prepare a reply
        </Button>
      )}
      {isRisky && (
        <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, lineHeight: 1.5, margin: 0 }}>
          LokAI won't prepare a reply to this message. Do not send money or personal documents based on it.
        </p>
      )}
    </div>
  );
}

export function HumanReviewCard({ workflow }: { workflow: CaseWorkflowState }) {
  // §3.6: ground-level, serif header as the divider. The handoff-ready bundle is
  // the one discrete object here, so it keeps a light surface.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S[3] }}>
      <div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: C.oxblood, ...typeStyle('label') }}>
          <IconShield size={14} />
          Professional guidance recommended
        </span>
        <Text tone="quiet" style={{ lineHeight: 1.55, marginTop: 8 }}>
          {workflow.humanReviewSummary}
        </Text>
      </div>
      <div style={{
        background: C.surface2,
        borderRadius: LAYOUT.radius.panel,
        padding: 14,
        display: 'flex', flexDirection: 'column', gap: 9,
      }}>
        <Text role="captionStrong" tone="default" measured={false}>
          Ready to hand off
        </Text>
        {['Issue summary', 'Evidence collected', 'Sources checked', 'Draft packet'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <IconCheck size={14} color={C.green} />
            <Text role="caption" tone="default" measured={false}>{item}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditTrailList({ events, showHeading = true }: { events: AuditEvent[]; showHeading?: boolean }) {
  // §3.6: ground-level timeline — the serif header is the divider, the events are
  // a plain vertical list, no outer card. `showHeading={false}` is for stacked
  // uses (the live trail + the labelled illustration beneath it) where two
  // identical headings on one screen would violate L7 — say it once.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S[3] }}>
      {showHeading && (
        <Text role="answer" as="h3" measured={false} style={{ lineHeight: 1.2 }}>
          Case history
        </Text>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.map(event => (
          <div key={event.id} style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 9 }}>
            <span style={{
              width: 22,
              height: 22,
              borderRadius: LAYOUT.radius.full,
              background: C.surface2,
              border: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 1,
            }}>
              <IconFile size={12} color={C.navy} />
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <Text role="captionStrong" tone="default" measured={false} style={{ marginBottom: 2 }}>
                  {event.label}
                </Text>
                {event.time && <Amount tone="faint">{event.time}</Amount>}
              </div>
              <Text role="caption" tone="quiet" measured={false} style={{ lineHeight: 1.45 }}>
                {event.detail}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
