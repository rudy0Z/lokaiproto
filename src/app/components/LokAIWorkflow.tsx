import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Copy, FileText, Pencil, Printer, ShieldCheck, X } from 'lucide-react';
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
import { Badge, Button, Stack } from '../ui';

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
 *  Ground-level (L1): the meter is a reading, not an object — no box. */
export function GroundingMeter({ grounded, total, note, live = false }: { grounded: number; total: number; note?: string; live?: boolean }) {
  const ratio = total > 0 ? grounded / total : 0;
  const pct = Math.round(ratio * 100);
  const tone = ratio >= 0.85 ? C.green : ratio >= 0.7 ? C.amber : C.oxblood;
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.inkSoft }}>
          Claims checked against sources
        </span>
        <span style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 700, color: tone, lineHeight: 1, transition: 'color 0.5s ease' }}>
          {grounded} of {total}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: LAYOUT.radius.pill, background: C.surface2, overflow: 'hidden' }}>
        <div
          className="lokai-meter-fill"
          style={{
            height: '100%',
            width: `${pct}%`,
            background: tone,
            borderRadius: LAYOUT.radius.pill,
            transformOrigin: 'left center',
            ...(live
              ? { transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1), background 0.5s ease' }
              : { animation: 'lokaiMeterFill 0.9s cubic-bezier(0.22,1,0.36,1) both' }),
          }}
        />
      </div>
      <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, lineHeight: 1.45, margin: '7px 0 0' }}>
        {note ?? `${grounded} of ${total} key claims map to an illustrative source note. Expert review is still pending.`}
      </p>
    </div>
  );
}

/* Labels for coverage, risk, evidence and draft states live in
   data/statusVocabulary.ts — one vocabulary app-wide (audit V4); tones ride
   the Badge primitive. The old COVERAGE_COLOR map died with the left stripe. */

function SmallLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: SANS,
      fontSize: TYPE.label.size,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: C.muted,
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

export function LokAIProgressList({ items }: { items: string[] }) {
  /* Ground-level (L1): a progress reading sits on the page — label + hairline
     rows, no box. */
  return (
    <div aria-live="polite">
      <style>{CSS}</style>
      <SmallLabel>LokAI is checking</SmallLabel>
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
                <Check size={11} color={C.green} strokeWidth={2.4} />
              ) : (
                <span style={{ width: 5, height: 5, borderRadius: LAYOUT.radius.full, background: C.saffron }} />
              )}
            </span>
            <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.45 }}>
              {item}
            </span>
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
        <span style={{ fontFamily: MONO, fontSize: TYPE.label.size, fontWeight: 700, color: C.navy }}>
          {source.section}
        </span>
        <SourceCoveragePill coverage={source.coverage} />
      </div>
      <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700, color: C.ink, margin: '7px 0 4px', lineHeight: 1.35 }}>
        {source.title}
      </p>
      {!compact && (
        <>
          <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.5, margin: '0 0 6px' }}>
            {expanded ? source.excerpt : shortPlain}
          </p>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            style={{
              fontFamily: SANS,
              fontSize: TYPE.micro.size,
              fontWeight: 700,
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
            <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, lineHeight: 1.5, margin: '0 0 5px' }}>
              How LokAI used this: {source.howUsed}
            </p>
          )}
          <p style={{ fontFamily: MONO, fontSize: TYPE.label.size, color: C.muted, margin: 0 }}>
            {source.jurisdiction} · {source.lastReviewed}
          </p>
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
        <div style={{ height: 6, borderRadius: LAYOUT.radius.pill, background: C.surface2, overflow: 'hidden', margin: '10px 0 8px' }}>
          <div
            className="lokai-meter-fill"
            style={{
              height: '100%', width: `${Math.round(ratio * 100)}%`, background: tone,
              borderRadius: LAYOUT.radius.pill, transformOrigin: 'left center',
              animation: 'lokaiMeterFill 0.9s cubic-bezier(0.22,1,0.36,1) both',
            }}
          />
        </div>
        <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, lineHeight: 1.5, margin: 0 }}>
          Coverage is claim counts, not model confidence. Expert review is still pending.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map(([label, value, cap], i) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            padding: '10px 0', borderTop: i ? `1px solid ${C.rule}` : 'none',
          }}>
            <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted }}>{label}</span>
            {typeof value === 'string'
              ? <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700, color: C.ink, textTransform: cap ? 'capitalize' : 'none' }}>{value}</span>
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
            <SmallLabel>Legal basis</SmallLabel>
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
            <X size={17} color={C.inkSoft} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {trust && <ClaimLedger trust={trust} />}
          {trust && <div style={{ borderTop: `1px solid ${C.rule}` }} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trust && <SmallLabel>Sources behind each claim</SmallLabel>}
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
        : '#D8D4CC';

  return (
    <div style={{
      width: 24,
      height: 24,
      borderRadius: LAYOUT.radius.full,
      background: color,
      color: '#FFFFFF',
      fontFamily: MONO,
      fontSize: TYPE.label.size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    }}>
      {step.status === 'done' ? <Check size={13} /> : index + 1}
    </div>
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
      <SmallLabel>Living action plan</SmallLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 12 }}>
        {render.map((step, index) => (
          <React.Fragment key={step.id}>
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 10 }}>
              <StepDot step={step} index={index} />
              <div>
                <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 700, color: C.ink, margin: '0 0 3px' }}>
                  {step.title}
                </p>
                <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.48, margin: 0 }}>
                  {step.description}
                </p>

                {step.status === 'blocked' && step.blockedReason && (
                  <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.amber, lineHeight: 1.45, margin: '6px 0 0', fontWeight: 600 }}>
                    {step.blockedReason}
                  </p>
                )}

                {/* Live controls — the primary is the forward action; blocked
                   is the quiet alternative, never an outlined twin (L5). */}
                {interactive && step.status === 'current' && (
                  <div style={{ display: 'flex', gap: 7, marginTop: 9 }}>
                    <Button
                      size="md"
                      icon={<Check size={13} />}
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
                    iconAfter={<ArrowRight size={13} />}
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
                <p style={{ fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>
                  Plan adapted
                </p>
                <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 700, color: C.ink, margin: '0 0 3px' }}>
                  {reroute.title}
                </p>
                <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.5, margin: 0 }}>
                  {reroute.description}
                </p>
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
          <h3 style={{ fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400, color: C.ink, margin: 0, lineHeight: 1.2 }}>
            Evidence locker
          </h3>
          <span style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
            {uploadedCount} of {items.length} gathered
          </span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.55, margin: '6px 0 0' }}>
          What LokAI checked before trusting the facts below — including whether any two documents disagree.
        </p>
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
                  <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 600, color: C.ink, margin: 0 }}>
                    {item.label}
                  </p>
                  <span style={{ ...typeStyle('label', { color: style.labelColor, whiteSpace: 'nowrap', flexShrink: 0 }) }}>
                    {EVIDENCE_STATUS_VIEW[item.status].label}
                  </span>
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
                  <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.amber, lineHeight: 1.5, margin: '8px 0 0' }}>
                    {item.conflictNote}
                  </p>
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const confirmedCount = facts.filter(i => i.status === 'confirmed').length;
  const allConfirmed = confirmedCount === facts.length;

  const confirm = (id: string) => {
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
        <h3 style={{ fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400, color: C.ink, lineHeight: 1.2, margin: '0 0 6px' }}>
          Are these facts right?
        </h3>
        <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>
          LokAI pulled these from what you shared and your invoice. Confirm or fix each one — your
          guidance is only as accurate as these facts, so you own them, not the AI.
        </p>
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
                      <p style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 600, color: C.ink, margin: 0, lineHeight: 1.35 }}>
                        {fact.value}
                      </p>
                    )}
                    <p style={{ ...typeStyle('caption', { color: C.muted, margin: '2px 0 0' }) }}>
                      {fact.label}
                    </p>
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
                          fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.muted,
                        }}
                      >
                        <Check size={15} color={C.green} strokeWidth={2.6} />
                        <Pencil size={12} color={C.muted} />
                      </button>
                    )
                  )}
                </div>

                {/* Needs-review hint + actions — the forward action is primary,
                   the alternative quiet (L5: no outlined twins). */}
                {needsReview && !isEditing && (
                  <>
                    {fact.hint && (
                      <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.amber, lineHeight: 1.45, margin: '8px 0 10px' }}>
                        {fact.hint}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 7, marginTop: fact.hint ? 0 : 10 }}>
                      <Button
                        size="md"
                        icon={<Check size={13} />}
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
        iconAfter={allConfirmed ? <ArrowRight size={16} /> : undefined}
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

  React.useEffect(() => {
    setReviewed(approved);
  }, [approved]);

  const toggleReviewed = () => {
    const next = !reviewed;
    setReviewed(next);
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
        <ShieldCheck size={16} color={C.oxblood} />
        <SmallLabel>Review before this leaves your hands</SmallLabel>
      </div>
      <h3 style={{ fontFamily: SERIF, fontSize: TYPE.h3.size, fontWeight: 400, color: C.ink, lineHeight: 1.25, margin: '0 0 7px' }}>
        LokAI won't send this for you.
      </h3>
      <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 13px' }}>
        A legal document carries weight, and an AI can misread a date or an amount. You stay
        in control — read each detail, then copy or print it yourself. A lawyer or trusted
        helper can confirm the wording before you use it.
      </p>

      {/* Deliberate consent step — unlocks the export actions */}
      <button
        type="button"
        className="lokai-pressable"
        onClick={toggleReviewed}
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
          {reviewed && <Check size={13} color="var(--role-on-anchor)" strokeWidth={3} />}
        </span>
        <span style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 700, color: C.ink }}>
          I've read the details and I'm ready to send it myself.
        </span>
      </button>

      {/* One primary (copy — the action almost everyone takes), the print
         escape quiet beneath it. Two filled buttons was the form-wizard tell. */}
      <Stack gap={2}>
        <Button
          onClick={reviewed ? handleCopy : undefined}
          disabled={!reviewed}
          icon={copied ? <Check size={15} /> : <Copy size={14} />}
        >
          {copied ? 'Copied' : 'Copy draft'}
        </Button>
        <Button
          variant="quiet"
          onClick={reviewed ? onPrint : undefined}
          disabled={!reviewed}
          icon={<Printer size={14} />}
        >
          Print
        </Button>
      </Stack>

      <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, lineHeight: 1.5, margin: '11px 0 0', textAlign: 'center' }}>
        LokAI prepared this draft. You are the sender. No message leaves the app on its own.
      </p>
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
      <SmallLabel>After you leave LokAI</SmallLabel>
      <h3 style={{
        fontFamily: SERIF,
        fontSize: compact ? 18 : 20,
        fontWeight: 400,
        color: C.ink,
        lineHeight: 1.25,
        margin: '0 0 6px',
      }}>
        Your first actions
      </h3>
      <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 4px' }}>
        The product ends here. These three steps stay with you — mark them as you go.
      </p>
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
                  {on ? <Check size={13} color="var(--role-on-anchor)" strokeWidth={3} /> : i + 1}
                </span>
                <span>
                  <span style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 700, color: C.ink, display: 'block' }}>
                    {action.title}
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, lineHeight: 1.45, display: 'block', marginTop: 2 }}>
                    {action.hint}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p style={{
        fontFamily: SANS,
        fontSize: TYPE.micro.size,
        color: allDone ? C.green : C.muted,
        margin: '12px 0 0',
        fontWeight: allDone ? 700 : 500,
      }}>
        {allDone
          ? 'Exit checklist marked · you own the next steps outside LokAI'
          : `${doneCount} of ${FIRST_ACTIONS.length} marked`}
      </p>
    </div>
  );
}

/**
 * StopState (FailureStateCard) — §3.4/L6/L8. The product's whole thesis is that
 * it knows when to stop, so the refusal is the most designed screen in the app,
 * not the least. It was a pale Bootstrap alert (pink box, red left border) with
 * the app's usual navy "Continue" sitting right underneath — the highest-
 * affordance control inviting the user *past* the refusal it was refusing.
 *
 * Now it goes full-bleed dark: the one place mobile inverts tone, so a stop
 * reads as a different kind of moment rather than another card. The SAFE action
 * is the only prominent control; there is no "continue anyway." In a dark theme
 * this same relationship flips to warm-and-luminous (L8) — the contrast is the
 * constant, the direction follows the theme.
 */
export function StopState({
  failure,
  onSafeAction,
}: {
  failure: FailureState;
  /** The safe path out — escalate to a human for human_required, recover otherwise. */
  onSafeAction?: () => void;
}) {
  const needsHuman = failure.riskLevel === 'human_required';
  const actionLabel = needsHuman ? 'Find legal-aid help' : failure.nextAction;

  return (
    <div style={{
      background: C.navyDark,
      borderRadius: LAYOUT.radius.turn,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      boxShadow: SHADOW.lg,
    }}>
      <span style={{
        alignSelf: 'flex-start',
        display: 'inline-flex', alignItems: 'center', gap: 7,
        ...typeStyle('label', { color: needsHuman ? '#F3B0A2' : '#F2C79A' }),
      }}>
        <ShieldCheck size={14} />
        {needsHuman ? 'LokAI is stopping here' : 'LokAI paused'}
      </span>

      <h3 style={{ fontFamily: SERIF, fontSize: TYPE.editorial.size, fontWeight: 400, color: C.onDark, lineHeight: 1.2, margin: 0 }}>
        {failure.title}
      </h3>

      <p style={{ fontFamily: SANS, fontSize: TYPE.body.size, color: C.onDarkSoft, lineHeight: 1.6, margin: 0 }}>
        {failure.body}
      </p>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.14)',
        paddingTop: 14,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <p style={{ ...typeStyle('captionStrong', { color: C.onDark, margin: 0 }) }}>
          What to do instead
        </p>
        <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.onDarkSoft, lineHeight: 1.55, margin: 0 }}>
          {failure.safeFallback}
        </p>
      </div>

      {onSafeAction && (
        <button
          onClick={onSafeAction}
          style={{
            minHeight: 48, marginTop: 2,
            borderRadius: LAYOUT.radius.panel, border: 'none',
            background: C.bg, color: C.navy,
            fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {actionLabel}
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

/** @deprecated legacy name — kept so any old import keeps compiling. Use StopState. */
export const FailureStateCard = StopState;

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
      <h3 style={{ fontFamily: SERIF, fontSize: TYPE.h3.size, fontWeight: 400, color: C.ink, margin: 0, lineHeight: 1.25 }}>
        {assessment.title}
      </h3>
      <p style={{ fontFamily: SANS, fontSize: TYPE.body.size, color: C.inkSoft, lineHeight: 1.6, margin: 0 }}>
        {assessment.decodedSummary}
      </p>
      <div style={{ background: isRisky ? 'var(--role-halt-fill)' : 'var(--role-ok-fill)', borderRadius: LAYOUT.radius.control, padding: '10px 12px' }}>
        <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: isRisky ? C.red : C.green, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Why LokAI flagged this
        </p>
        <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>
          {assessment.riskExplanation}
        </p>
      </div>
      {assessment.extractedAmount && (
        <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.ink, margin: 0 }}>
          <strong>Offer:</strong> {assessment.extractedAmount}
        </p>
      )}
      <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, margin: 0 }}>
        {assessment.deadline}
      </p>
      {!isRisky && assessment.suggestedReply && onPrepareReply && (
        <Button
          onClick={onPrepareReply}
          iconAfter={<ArrowRight size={14} />}
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
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, ...typeStyle('label', { color: C.oxblood }) }}>
          <ShieldCheck size={14} />
          Professional guidance recommended
        </span>
        <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.55, margin: '8px 0 0' }}>
          {workflow.humanReviewSummary}
        </p>
      </div>
      <div style={{
        background: C.surface2,
        borderRadius: LAYOUT.radius.panel,
        padding: 14,
        display: 'flex', flexDirection: 'column', gap: 9,
      }}>
        <p style={{ ...typeStyle('captionStrong', { color: C.ink, margin: 0 }) }}>
          Ready to hand off
        </p>
        {['Issue summary', 'Evidence collected', 'Sources checked', 'Draft packet'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Check size={14} color={C.green} strokeWidth={2.4} />
            <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.ink }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditTrailList({ events }: { events: AuditEvent[] }) {
  // §3.6: ground-level timeline — the serif header is the divider, the events are
  // a plain vertical list, no outer card.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S[3] }}>
      <h3 style={{ fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400, color: C.ink, margin: 0, lineHeight: 1.2 }}>
        Case history
      </h3>
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
              <FileText size={12} color={C.navy} />
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700, color: C.ink, margin: '0 0 2px' }}>
                  {event.label}
                </p>
                <span style={{ fontFamily: MONO, fontSize: TYPE.label.size, color: C.muted }}>{event.time}</span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.45, margin: 0 }}>
                {event.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
