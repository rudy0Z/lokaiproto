import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronRight, Copy, FileText, Pencil, Printer, ShieldCheck, X } from 'lucide-react';
import { C, LAYOUT, MONO, S, SANS, SERIF, SHADOW, TYPE, typeStyle } from './shared';
import { Sheet } from './Sheet';
import type {
  AuditEvent,
  CaseWorkflowState,
  EvidenceItem,
  FailureState,
  FilingPacket,
  NoticeAssessment,
  RiskLevel,
  SourceCoverage,
  VerificationFact,
  WorkflowActionStep,
  WorkflowSource,
} from '../data/caseWorkflow';

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
    outline: 2px solid ${C.saffron};
    outline-offset: 2px;
    box-shadow: 0 0 0 3px rgba(232,131,42,0.16);
  }
`;

/**
 * Count-up number. Deliberately animates the grounding score so trust reads as
 * *earned* rather than asserted. Honors prefers-reduced-motion by snapping.
 */
export function NumberTicker({ value, durationMs = 900, suffix = '' }: { value: number; durationMs?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  // Animate from wherever the number currently sits, not from zero. Without
  // this, a live score change (74 → 88 when the last fact is confirmed) reads
  // as a collapse to zero and a re-climb, which says the opposite of what the
  // interaction means.
  const fromRef = useRef(0);

  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setDisplay(value); fromRef.current = value; return; }

    const from = fromRef.current;
    const delta = value - from;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + eased * delta);
      setDisplay(next);
      fromRef.current = next;
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, durationMs]);

  return <>{display}{suffix}</>;
}

/** Shows observable source coverage, never model confidence. */
export function GroundingMeter({ grounded, total, note, live = false }: { grounded: number; total: number; note?: string; live?: boolean }) {
  const ratio = total > 0 ? grounded / total : 0;
  const pct = Math.round(ratio * 100);
  const tone = ratio >= 0.85 ? C.green : ratio >= 0.7 ? C.saffron : C.oxblood;
  return (
    <div style={{
      background: C.surface2,
      border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.control,
      padding: '11px 12px',
      marginBottom: 11,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.inkSoft }}>
          Claims checked against sources
        </span>
        <span style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 700, color: tone, lineHeight: 1, transition: 'color 0.5s ease' }}>
          {grounded} of {total}
        </span>
      </div>
      <div style={{ height: 7, borderRadius: LAYOUT.radius.pill, background: C.surface2, overflow: 'hidden' }}>
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

const COVERAGE_LABEL: Record<SourceCoverage, string> = {
  direct: 'Direct',
  related: 'Related',
  missing: 'Missing',
  conflicting: 'Conflicting',
};

const COVERAGE_COLOR: Record<SourceCoverage, string> = {
  direct: C.green,
  related: C.navy,
  missing: C.amber,
  conflicting: C.oxblood,
};

const RISK_LABEL: Record<RiskLevel, string> = {
  self_service: 'Self-service',
  review_recommended: 'Review recommended',
  human_required: 'Human required',
};

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
  return (
    <div
      aria-live="polite"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: LAYOUT.radius.panel,
        padding: 12,
        boxShadow: SHADOW.xs,
      }}
    >
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
              background: index === items.length - 1 ? '#FFF3E8' : C.surface2,
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

export function SourceCoveragePill({ coverage }: { coverage: SourceCoverage }) {
  return (
    <span style={{
      fontFamily: SANS,
      fontSize: TYPE.label.size,
      fontWeight: 700,
      color: COVERAGE_COLOR[coverage],
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.pill,
      padding: '3px 8px',
      whiteSpace: 'nowrap',
    }}>
      {COVERAGE_LABEL[coverage]}
    </span>
  );
}

export function SourceCard({ source, compact = false }: { source: WorkflowSource; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const plain = source.howUsed || source.excerpt;
  const shortPlain = plain.length > 110 ? `${plain.slice(0, 108)}…` : plain;

  return (
    <div style={{
      background: compact ? '#FFFFFF' : C.surface2,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${COVERAGE_COLOR[source.coverage]}`,
      borderRadius: `${LAYOUT.radius.none} ${LAYOUT.radius.control} ${LAYOUT.radius.control} ${LAYOUT.radius.none}`,
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
  const factValue = trust.factCompleteness === 'needs_one_detail'
    ? 'Needs one detail'
    : trust.factCompleteness === 'insufficient' ? 'Insufficient' : 'Complete';
  const draftValue = trust.draftStatus === 'ai_draft'
    ? 'AI draft'
    : trust.draftStatus === 'user_reviewed' ? 'Reviewed' : 'Ready to use';

  const rows: [string, React.ReactNode, boolean][] = [
    ['What the source supports', <SourceCoveragePill coverage={trust.sourceCoverage} />, false],
    ['Facts needed', factValue, false],
    ['Location rule', trust.jurisdictionClarity, true],
    ['Help needed', RISK_LABEL[trust.riskLevel], false],
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
              background: '#FFFFFF',
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
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.panel,
      padding: compact ? 12 : 14,
      boxShadow: SHADOW.xs,
    }}>
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

                {/* Live controls — only on the active step in interactive mode */}
                {interactive && step.status === 'current' && (
                  <div style={{ display: 'flex', gap: 7, marginTop: 9 }}>
                    <button
                      onClick={() => markDone(step.id)}
                      style={{
                        minHeight: 34, borderRadius: LAYOUT.radius.control, border: 'none',
                        background: C.navy, color: '#FFFFFF',
                        fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700,
                        padding: '0 12px', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <Check size={13} /> Mark done
                    </button>
                    <button
                      onClick={() => markBlocked(step.id)}
                      style={{
                        minHeight: 34, borderRadius: LAYOUT.radius.control,
                        border: `1px solid ${C.borderStrong}`,
                        background: '#FFFFFF', color: C.inkSoft,
                        fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700,
                        padding: '0 12px', cursor: 'pointer',
                      }}
                    >
                      I'm blocked
                    </button>
                  </div>
                )}

                {/* Static reroute button (non-interactive, data-driven blocked state) */}
                {!interactive && step.status === 'blocked' && (
                  <button
                    onClick={onPacket}
                    style={{
                      marginTop: 8, minHeight: 36, borderRadius: LAYOUT.radius.control,
                      border: `1px solid ${C.navy}`, background: '#FFFFFF', color: C.navy,
                      fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700,
                      padding: '0 11px', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {step.rerouteLabel || 'Prepare packet'}
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Adaptive reroute card, inserted live below the blocked step */}
            {interactive && reroute?.afterId === step.id && (
              <div
                className="lokai-gate-in"
                style={{
                  marginLeft: 34,
                  background: '#FFF8F0',
                  border: `1px solid rgba(233,133,43,0.28)`,
                  borderLeft: `3px solid ${C.saffron}`,
                  borderRadius: `${LAYOUT.radius.none} ${LAYOUT.radius.control} ${LAYOUT.radius.control} ${LAYOUT.radius.none}`,
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

export function WorkflowTrustPanel({ workflow, onOpenSources }: { workflow: CaseWorkflowState; onOpenSources?: () => void }) {
  const t = workflow.trust;
  const factValue = t.factCompleteness === 'needs_one_detail'
    ? 'Needs one detail'
    : t.factCompleteness === 'insufficient' ? 'Insufficient' : 'Complete';
  const draftValue = t.draftStatus === 'ai_draft'
    ? 'AI draft'
    : t.draftStatus === 'user_reviewed' ? 'Reviewed' : 'Ready to use';

  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.panel,
      padding: 13,
      boxShadow: SHADOW.xs,
    }}>
      <SmallLabel>Trust check</SmallLabel>

      {/* Observable claim-to-source coverage; never a confidence percentage. */}
      <GroundingMeter grounded={t.groundedClaims} total={t.totalClaims} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Source coverage — colored pill, not plain text */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted }}>What the source supports</span>
          <SourceCoveragePill coverage={t.sourceCoverage} />
        </div>
        {([
          ['Facts needed', factValue],
          ['Location rule', t.jurisdictionClarity],
          ['Help needed', RISK_LABEL[t.riskLevel]],
          ['Draft stage', draftValue],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted }}>{label}</span>
            <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700, color: C.ink, textTransform: label === 'Location rule' ? 'capitalize' : 'none' }}>
              {value}
            </span>
          </div>
        ))}
      </div>
      {onOpenSources && (
        <button
          onClick={onOpenSources}
          style={{
            marginTop: 12,
            width: '100%',
            minHeight: 40,
            borderRadius: LAYOUT.radius.control,
            border: `1px solid ${C.border}`,
            background: C.surface2,
            color: C.navy,
            fontFamily: SANS,
            fontSize: TYPE.caption.size,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          View source trail
        </button>
      )}
    </div>
  );
}

export function FilingPacketPreview({ packet, compact = false }: { packet: FilingPacket; compact?: boolean }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.panel,
      padding: compact ? 12 : 16,
      boxShadow: SHADOW.xs,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div>
          <SmallLabel>Filing packet</SmallLabel>
          <h3 style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 800, color: C.ink, margin: 0 }}>
            {packet.title}
          </h3>
        </div>
        <span style={{
          fontFamily: SANS,
          fontSize: TYPE.label.size,
          fontWeight: 700,
          color: C.amber,
          background: '#FFF3E8',
          border: '1px solid rgba(233,133,43,0.24)',
          borderRadius: LAYOUT.radius.pill,
          padding: '4px 8px',
          whiteSpace: 'nowrap',
        }}>
          AI draft
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {packet.fields.slice(0, compact ? 4 : packet.fields.length).map(field => (
          <div key={field.id} style={{
            background: '#F8F5EE',
            border: `1px solid ${C.border}`,
            borderRadius: LAYOUT.radius.control,
            padding: '8px 10px',
          }}>
            <p style={{ fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>
              {field.label}
            </p>
            <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.45, margin: 0 }}>
              {field.value}
            </p>
          </div>
        ))}
      </div>
      {!compact && (
        <div style={{ marginTop: 12 }}>
          <SmallLabel>Evidence checklist</SmallLabel>
          <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {packet.evidenceChecklist.map(item => (
              <li key={item} style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.45 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, lineHeight: 1.5, margin: '12px 0 0' }}>
        {packet.reviewNotice}
      </p>
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
const EVIDENCE_STATUS_STYLE: Record<EvidenceItem['status'], { border: string; bg: string; label: string; labelColor: string }> = {
  uploaded:    { border: C.green,   bg: '#F5F9F6', label: 'Uploaded',          labelColor: C.green },
  missing:     { border: C.border,  bg: C.surface2, label: 'Not uploaded yet',  labelColor: C.muted },
  conflicting: { border: C.saffron, bg: '#FFF8F0', label: 'Conflicts a fact',  labelColor: C.amber },
};

/**
 * Evidence Locker — the other half of grounding. WorkflowTrustPanel already
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
            {uploadedCount} of {items.length} uploaded
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
                    {style.label}
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
  const [items, setItems] = useState<VerificationFact[]>(() => facts.map(f => ({ ...f })));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const confirmedCount = items.filter(i => i.status === 'confirmed').length;
  const allConfirmed = confirmedCount === items.length;

  const confirm = (id: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, status: 'confirmed' } : i)));
    onFactConfirm?.(id);
  };

  const startEdit = (item: VerificationFact) => { setEditingId(item.id); setDraft(item.value); };

  const saveEdit = (id: string) => {
    const value = draft.trim() || items.find((i) => i.id === id)?.value || '';
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, value, status: 'confirmed' } : i));
    setEditingId(null);
    onFactCorrect?.(id, value);
  };

  const remaining = items.length - confirmedCount;

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
        total={items.length}
        note={allConfirmed
          ? 'These facts are yours now. The assessment is built on what you confirmed, not on what the AI guessed.'
          : `Confirm or fix ${remaining} flagged fact${remaining === 1 ? '' : 's'} before LokAI builds the assessment. Coverage is claim counts, not model confidence.`}
      />

      {/* Fact list — hairline rows, value leads, label quiet beneath */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((fact, i) => {
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

                {/* Needs-review hint + actions */}
                {needsReview && !isEditing && (
                  <>
                    {fact.hint && (
                      <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.amber, lineHeight: 1.45, margin: '8px 0 10px' }}>
                        {fact.hint}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 7, marginTop: fact.hint ? 0 : 10 }}>
                      <button
                        onClick={() => confirm(fact.id)}
                        style={{
                          minHeight: 34, borderRadius: LAYOUT.radius.control, border: 'none',
                          background: C.navy, color: C.onDark,
                          fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700,
                          padding: '0 12px', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        <Check size={13} /> It's correct
                      </button>
                      <button
                        onClick={() => startEdit(fact)}
                        style={{
                          minHeight: 34, borderRadius: LAYOUT.radius.control,
                          border: `1px solid ${C.borderStrong}`, background: C.surface, color: C.inkSoft,
                          fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700,
                          padding: '0 12px', cursor: 'pointer',
                        }}
                      >
                        Fix it
                      </button>
                    </div>
                  </>
                )}

                {isEditing && (
                  <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
                    <button
                      onClick={() => saveEdit(fact.id)}
                      style={{
                        minHeight: 34, borderRadius: LAYOUT.radius.control, border: 'none',
                        background: C.navy, color: C.onDark,
                        fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700,
                        padding: '0 14px', cursor: 'pointer',
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        minHeight: 34, borderRadius: LAYOUT.radius.control,
                        border: `1px solid ${C.borderStrong}`, background: C.surface, color: C.inkSoft,
                        fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700,
                        padding: '0 14px', cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gated generate button */}
      <button
        onClick={allConfirmed ? onConfirmed : undefined}
        disabled={!allConfirmed}
        style={{
          width: '100%', minHeight: 48,
          borderRadius: LAYOUT.radius.panel, border: 'none',
          background: allConfirmed ? C.navy : C.border,
          color: allConfirmed ? C.onDark : C.muted,
          fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 700,
          cursor: allConfirmed ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.18s ease',
        }}
      >
        {allConfirmed ? 'Build my assessment' : `Confirm ${remaining} more to continue`}
        {allConfirmed && <ArrowRight size={16} />}
      </button>
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
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderTop: `3px solid ${C.oxblood}`,
        borderRadius: `${LAYOUT.radius.xs} ${LAYOUT.radius.panel} ${LAYOUT.radius.panel} ${LAYOUT.radius.panel}`,
        padding: 15,
        boxShadow: SHADOW.sm,
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
          background: reviewed ? 'rgba(31,107,58,0.06)' : C.surface2,
          border: `1px solid ${reviewed ? 'rgba(31,107,58,0.4)' : C.border}`,
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
          background: reviewed ? C.green : '#FFFFFF',
          border: `1.5px solid ${reviewed ? C.green : C.borderStrong}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.16s ease, border-color 0.16s ease',
        }}>
          {reviewed && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
        </span>
        <span style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 700, color: C.ink }}>
          I've read the details and I'm ready to send it myself.
        </span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button
          onClick={reviewed ? handleCopy : undefined}
          disabled={!reviewed}
          style={{
            minHeight: 44,
            borderRadius: LAYOUT.radius.control,
            border: 'none',
            background: !reviewed ? C.border : copied ? C.green : C.navy,
            color: !reviewed ? C.muted : '#FFFFFF',
            fontFamily: SANS,
            fontSize: TYPE.small.size,
            fontWeight: 700,
            cursor: reviewed ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            transition: 'background 0.18s ease',
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy draft'}
        </button>
        <button
          onClick={reviewed ? onPrint : undefined}
          disabled={!reviewed}
          style={{
            minHeight: 44,
            borderRadius: LAYOUT.radius.control,
            border: `1.5px solid ${!reviewed ? C.border : C.navy}`,
            background: '#FFFFFF',
            color: !reviewed ? C.muted : C.navy,
            fontFamily: SANS,
            fontSize: TYPE.small.size,
            fontWeight: 700,
            cursor: reviewed ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
          }}
        >
          <Printer size={14} />
          Print
        </button>
      </div>

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
    <div
      style={{
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderTop: `3px solid ${C.terracotta}`,
        borderRadius: LAYOUT.radius.card,
        padding: compact ? 14 : 16,
        boxShadow: SHADOW.sm,
        marginTop: 12,
      }}
    >
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
      <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 12px' }}>
        The product ends here. These three steps stay with you — mark them as you go.
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FIRST_ACTIONS.map((action, i) => {
          const on = checked[action.id];
          return (
            <li key={action.id}>
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
                  background: on ? 'rgba(169,79,45,0.08)' : C.surface2,
                  border: `1px solid ${on ? 'rgba(169,79,45,0.35)' : C.border}`,
                  borderRadius: LAYOUT.radius.control,
                  padding: '11px 12px',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  width: 22,
                  height: 22,
                  borderRadius: LAYOUT.radius.sm,
                  flexShrink: 0,
                  background: on ? C.terracotta : '#FFFFFF',
                  border: `1.5px solid ${on ? C.terracotta : C.borderStrong}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: SANS,
                  fontSize: TYPE.micro.size,
                  fontWeight: 800,
                  color: on ? '#fff' : C.muted,
                }}>
                  {on ? <Check size={13} color="#FFFFFF" strokeWidth={3} /> : i + 1}
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

export function FailureStateCard({ failure }: { failure: FailureState }) {
  return (
    <div style={{
      background: failure.riskLevel === 'human_required' ? '#FFF1EE' : '#FFFFFF',
      border: `1px solid ${failure.riskLevel === 'human_required' ? 'rgba(184,54,28,0.22)' : C.border}`,
      borderLeft: `3px solid ${failure.riskLevel === 'human_required' ? C.red : C.saffron}`,
      borderRadius: `${LAYOUT.radius.none} ${LAYOUT.radius.panel} ${LAYOUT.radius.panel} ${LAYOUT.radius.none}`,
      padding: 14,
      boxShadow: SHADOW.xs,
    }}>
      <SmallLabel>Safe recovery</SmallLabel>
      <h3 style={{ fontFamily: SANS, fontSize: TYPE.title.size, fontWeight: 800, color: C.ink, margin: '0 0 6px' }}>
        {failure.title}
      </h3>
      <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 10px' }}>
        {failure.body}
      </p>
      <div style={{
        background: '#F8F5EE',
        border: `1px solid ${C.border}`,
        borderRadius: LAYOUT.radius.control,
        padding: '9px 10px',
      }}>
        <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700, color: C.navy, margin: '0 0 3px' }}>
          {failure.nextAction}
        </p>
        <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, lineHeight: 1.45, margin: 0 }}>
          {failure.safeFallback}
        </p>
      </div>
    </div>
  );
}

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
      background: isRisky ? '#FFF1EE' : '#FFFFFF',
      border: `1px solid ${isRisky ? 'rgba(184,54,28,0.22)' : C.border}`,
      borderLeft: `4px solid ${isRisky ? C.red : C.green}`,
      borderRadius: `${LAYOUT.radius.xs} ${LAYOUT.radius.card} ${LAYOUT.radius.card} ${LAYOUT.radius.card}`,
      padding: 16,
      boxShadow: SHADOW.sm,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <span style={{
        alignSelf: 'flex-start',
        fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        color: isRisky ? C.red : C.green,
        background: isRisky ? 'rgba(184,54,28,0.08)' : 'rgba(31,107,58,0.08)',
        borderRadius: LAYOUT.radius.pill, padding: '3px 9px',
      }}>
        {isRisky ? 'Verify before trusting' : 'Looks genuine'}
      </span>
      <h3 style={{ fontFamily: SERIF, fontSize: TYPE.h3.size, fontWeight: 400, color: C.ink, margin: 0, lineHeight: 1.25 }}>
        {assessment.title}
      </h3>
      <p style={{ fontFamily: SANS, fontSize: TYPE.body.size, color: C.inkSoft, lineHeight: 1.6, margin: 0 }}>
        {assessment.decodedSummary}
      </p>
      <div style={{ background: isRisky ? '#FDF3F1' : '#F5F9F6', borderRadius: LAYOUT.radius.control, padding: '10px 12px' }}>
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
        <button
          onClick={onPrepareReply}
          style={{
            minHeight: 44, borderRadius: LAYOUT.radius.panel, border: 'none', background: C.navy, color: '#FFFFFF',
            fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4,
          }}
        >
          Prepare a reply <ArrowRight size={14} />
        </button>
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
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.oxblood}`,
      borderRadius: `${LAYOUT.radius.none} ${LAYOUT.radius.panel} ${LAYOUT.radius.panel} ${LAYOUT.radius.none}`,
      padding: 14,
      boxShadow: SHADOW.xs,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
        <ShieldCheck size={17} color={C.oxblood} />
        <SmallLabel>Professional guidance recommended</SmallLabel>
      </div>
      <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 10px' }}>
        {workflow.humanReviewSummary}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Issue summary', 'Evidence collected', 'Sources checked', 'Draft packet'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={13} color={C.green} />
            <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.ink }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditTrailList({ events }: { events: AuditEvent[] }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.panel,
      padding: 13,
      boxShadow: SHADOW.xs,
    }}>
      <SmallLabel>Case history</SmallLabel>
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

export function GuidancePreferences() {
  const items = ['Ask one question at a time', 'Show source before drafting', 'Keep steps phone-friendly'];
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.panel,
      padding: 13,
      boxShadow: SHADOW.xs,
    }}>
      <SmallLabel>Guidance preferences</SmallLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft }}>{item}</span>
            <span style={{
              width: 28,
              height: 16,
              borderRadius: LAYOUT.radius.pill,
              background: '#EEF2F8',
              border: `1px solid ${C.border}`,
              position: 'relative',
              flexShrink: 0,
            }}>
              <span style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 10,
                height: 10,
                borderRadius: LAYOUT.radius.full,
                background: C.navy,
              }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InlineLinkButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        minHeight: 40,
        border: `1px solid ${C.navy}`,
        borderRadius: LAYOUT.radius.control,
        background: '#FFFFFF',
        color: C.navy,
        fontFamily: SANS,
        fontSize: TYPE.caption.size,
        fontWeight: 800,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '0 12px',
        cursor: 'pointer',
      }}
    >
      {children}
      <ChevronRight size={14} />
    </button>
  );
}
