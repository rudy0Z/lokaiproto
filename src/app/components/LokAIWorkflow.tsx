import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronRight, Copy, FileText, Pencil, Printer, ShieldCheck, X } from 'lucide-react';
import { C, MONO, SANS, SERIF, SHADOW } from './shared';
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

  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setDisplay(value); return; }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, durationMs]);

  return <>{display}{suffix}</>;
}

/**
 * Grounding meter — the visible replacement for "confidence theater".
 * Colour shifts with how much of the assessment is source-backed; below 85
 * it reads amber to signal the verdict should be treated as provisional.
 */
export function GroundingMeter({ score, grounded, total }: { score: number; grounded: number; total: number }) {
  const tone = score >= 85 ? C.green : score >= 70 ? C.saffron : C.oxblood;
  return (
    <div style={{
      background: '#FAF8F3',
      border: `1px solid ${C.border}`,
      borderRadius: 11,
      padding: '11px 12px',
      marginBottom: 11,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.inkSoft }}>
          Grounding score
        </span>
        <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: tone, lineHeight: 1 }}>
          <NumberTicker value={score} suffix="%" />
        </span>
      </div>
      <div style={{ height: 7, borderRadius: 999, background: '#EDE8DF', overflow: 'hidden' }}>
        <div
          className="lokai-meter-fill"
          style={{
            height: '100%',
            width: `${score}%`,
            background: tone,
            borderRadius: 999,
            transformOrigin: 'left center',
            animation: 'lokaiMeterFill 0.9s cubic-bezier(0.22,1,0.36,1) both',
          }}
        />
      </div>
      <p style={{ fontFamily: SANS, fontSize: 10.5, color: C.muted, lineHeight: 1.45, margin: '7px 0 0' }}>
        {grounded} of {total} key claims map to a verified source. Not a model confidence score —
        it measures how much of this answer is backed by law LokAI can show you.
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
      fontSize: 10,
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
        borderRadius: 12,
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
              borderRadius: '50%',
              border: `1px solid ${index === items.length - 1 ? C.saffron : C.borderStrong}`,
              background: index === items.length - 1 ? '#FFF3E8' : '#F4F2EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {index < items.length - 1 ? (
                <Check size={11} color={C.green} strokeWidth={2.4} />
              ) : (
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.saffron }} />
              )}
            </span>
            <span style={{ fontFamily: SANS, fontSize: 12, color: C.inkSoft, lineHeight: 1.45 }}>
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
      fontSize: 10,
      fontWeight: 700,
      color: COVERAGE_COLOR[coverage],
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderRadius: 999,
      padding: '3px 8px',
      whiteSpace: 'nowrap',
    }}>
      {COVERAGE_LABEL[coverage]}
    </span>
  );
}

export function SourceCard({ source, compact = false }: { source: WorkflowSource; compact?: boolean }) {
  return (
    <div style={{
      background: compact ? '#FFFFFF' : '#F4F2EE',
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${COVERAGE_COLOR[source.coverage]}`,
      borderRadius: '0 10px 10px 0',
      padding: compact ? '10px 11px' : '12px 13px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: C.navy }}>
          {source.section}
        </span>
        <SourceCoveragePill coverage={source.coverage} />
      </div>
      <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: C.ink, margin: '7px 0 4px', lineHeight: 1.35 }}>
        {source.title}
      </p>
      {!compact && (
        <>
          <p style={{ fontFamily: SANS, fontSize: 12, color: C.inkSoft, lineHeight: 1.5, margin: '0 0 6px' }}>
            {source.excerpt}
          </p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: C.muted, lineHeight: 1.5, margin: '0 0 5px' }}>
            How LokAI used this: {source.howUsed}
          </p>
          <p style={{ fontFamily: MONO, fontSize: 10, color: C.muted, margin: 0 }}>
            {source.jurisdiction} · {source.lastReviewed}
          </p>
        </>
      )}
    </div>
  );
}

export function LokAISourceDrawer({
  open,
  onClose,
  title = 'Source trail',
  sources,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  sources: WorkflowSource[];
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <button
        aria-label="Close source drawer"
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, border: 'none', background: 'rgba(26,25,22,0.42)', cursor: 'pointer' }}
      />
      <aside style={{
        position: 'relative',
        zIndex: 1,
        width: 'min(420px, 100%)',
        height: '100%',
        background: C.surface,
        borderLeft: `1px solid ${C.border}`,
        boxShadow: '-18px 0 42px rgba(26,25,22,0.16)',
        display: 'flex',
        flexDirection: 'column',
      }}>
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
            <h2 style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 400, color: C.ink, margin: 0 }}>
              {title}
            </h2>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
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
        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sources.map(source => <SourceCard key={source.id} source={source} />)}
        </div>
      </aside>
    </div>
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
      borderRadius: '50%',
      background: color,
      color: '#FFFFFF',
      fontFamily: MONO,
      fontSize: 10,
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
      borderRadius: 12,
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
                <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.ink, margin: '0 0 3px' }}>
                  {step.title}
                </p>
                <p style={{ fontFamily: SANS, fontSize: 12, color: C.inkSoft, lineHeight: 1.48, margin: 0 }}>
                  {step.description}
                </p>

                {step.status === 'blocked' && step.blockedReason && (
                  <p style={{ fontFamily: SANS, fontSize: 11.5, color: C.amber, lineHeight: 1.45, margin: '6px 0 0', fontWeight: 600 }}>
                    {step.blockedReason}
                  </p>
                )}

                {/* Live controls — only on the active step in interactive mode */}
                {interactive && step.status === 'current' && (
                  <div style={{ display: 'flex', gap: 7, marginTop: 9 }}>
                    <button
                      onClick={() => markDone(step.id)}
                      style={{
                        minHeight: 34, borderRadius: 9, border: 'none',
                        background: C.navy, color: '#FFFFFF',
                        fontFamily: SANS, fontSize: 12, fontWeight: 700,
                        padding: '0 12px', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <Check size={13} /> Mark done
                    </button>
                    <button
                      onClick={() => markBlocked(step.id)}
                      style={{
                        minHeight: 34, borderRadius: 9,
                        border: `1px solid ${C.borderStrong}`,
                        background: '#FFFFFF', color: C.inkSoft,
                        fontFamily: SANS, fontSize: 12, fontWeight: 700,
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
                      marginTop: 8, minHeight: 36, borderRadius: 9,
                      border: `1px solid ${C.navy}`, background: '#FFFFFF', color: C.navy,
                      fontFamily: SANS, fontSize: 12, fontWeight: 700,
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
                  borderRadius: '0 11px 11px 0',
                  padding: '10px 12px',
                  animation: 'lokaiGateIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
                }}
              >
                <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>
                  Plan adapted
                </p>
                <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.ink, margin: '0 0 3px' }}>
                  {reroute.title}
                </p>
                <p style={{ fontFamily: SANS, fontSize: 12, color: C.inkSoft, lineHeight: 1.5, margin: 0 }}>
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
      borderRadius: 12,
      padding: 13,
      boxShadow: SHADOW.xs,
    }}>
      <SmallLabel>Trust check</SmallLabel>

      {/* Grounding score — leads the panel, replaces any single confidence % */}
      <GroundingMeter score={t.groundingScore} grounded={t.groundedClaims} total={t.totalClaims} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Source coverage — colored pill, not plain text */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>Source coverage</span>
          <SourceCoveragePill coverage={t.sourceCoverage} />
        </div>
        {([
          ['Fact completeness', factValue],
          ['Jurisdiction', t.jurisdictionClarity],
          ['Risk level', RISK_LABEL[t.riskLevel]],
          ['Draft status', draftValue],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>{label}</span>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: C.ink, textTransform: label === 'Jurisdiction' ? 'capitalize' : 'none' }}>
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
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: '#F4F2EE',
            color: C.navy,
            fontFamily: SANS,
            fontSize: 12,
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
      borderRadius: 12,
      padding: compact ? 12 : 16,
      boxShadow: SHADOW.xs,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div>
          <SmallLabel>Filing packet</SmallLabel>
          <h3 style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: C.ink, margin: 0 }}>
            {packet.title}
          </h3>
        </div>
        <span style={{
          fontFamily: SANS,
          fontSize: 10,
          fontWeight: 700,
          color: C.amber,
          background: '#FFF3E8',
          border: '1px solid rgba(233,133,43,0.24)',
          borderRadius: 999,
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
            borderRadius: 9,
            padding: '8px 10px',
          }}>
            <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>
              {field.label}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12, color: C.inkSoft, lineHeight: 1.45, margin: 0 }}>
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
              <li key={item} style={{ fontFamily: SANS, fontSize: 12, color: C.inkSoft, lineHeight: 1.45 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p style={{ fontFamily: SANS, fontSize: 11, color: C.muted, lineHeight: 1.5, margin: '12px 0 0' }}>
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
  missing:     { border: C.border,  bg: '#FAF8F3', label: 'Not uploaded yet',  labelColor: C.muted },
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
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderRadius: 18,
      padding: 15,
      boxShadow: SHADOW.sm,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h3 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400, color: C.ink, margin: 0, lineHeight: 1.25 }}>
          Evidence locker
        </h3>
        <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.muted }}>
          {uploadedCount} of {items.length} uploaded
        </span>
      </div>
      <p style={{ fontFamily: SANS, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>
        What LokAI checked before trusting the facts below — including whether any two documents disagree.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => {
          const style = EVIDENCE_STATUS_STYLE[item.status];
          return (
            <div key={item.id} style={{
              background: style.bg,
              border: `1px solid ${item.status === 'conflicting' ? 'rgba(233,133,43,0.32)' : C.border}`,
              borderLeft: `3px solid ${style.border}`,
              borderRadius: '0 10px 10px 0',
              padding: '9px 11px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.ink, margin: 0 }}>
                  {item.label}
                </p>
                <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: style.labelColor, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {style.label}
                </span>
              </div>
              {item.extractedFacts && item.extractedFacts.length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {item.extractedFacts.map(f => (
                    <span key={f.label} style={{
                      fontFamily: SANS, fontSize: 11, color: C.inkSoft,
                      background: '#FFFFFF', border: `1px solid ${C.border}`,
                      borderRadius: 999, padding: '2px 9px',
                    }}>
                      {f.label}: <strong style={{ color: C.ink }}>{f.value}</strong>
                    </span>
                  ))}
                </div>
              )}
              {item.conflictNote && (
                <p style={{ fontFamily: SANS, fontSize: 11.5, color: C.amber, lineHeight: 1.5, margin: '7px 0 0' }}>
                  {item.conflictNote}
                </p>
              )}
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
}: {
  facts: VerificationFact[];
  onConfirmed: () => void;
}) {
  const [items, setItems] = useState<VerificationFact[]>(() => facts.map(f => ({ ...f })));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const confirmedCount = items.filter(i => i.status === 'confirmed').length;
  const allConfirmed = confirmedCount === items.length;

  const confirm = (id: string) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, status: 'confirmed' } : i)));

  const startEdit = (item: VerificationFact) => { setEditingId(item.id); setDraft(item.value); };

  const saveEdit = (id: string) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, value: draft.trim() || i.value, status: 'confirmed' } : i));
    setEditingId(null);
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderTop: `3px solid ${C.navy}`,
      borderRadius: '3px 12px 12px 12px',
      padding: 15,
      boxShadow: SHADOW.sm,
    }}>
      <style>{CSS}</style>
      <SmallLabel>Verify before LokAI builds your assessment</SmallLabel>
      <h3 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400, color: C.ink, lineHeight: 1.25, margin: '0 0 6px' }}>
        Are these facts right?
      </h3>
      <p style={{ fontFamily: SANS, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 12px' }}>
        LokAI pulled these from what you shared and your invoice. Confirm or fix each one — your
        guidance is only as accurate as these facts, so you own them, not the AI.
      </p>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EDE8DF', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${(confirmedCount / items.length) * 100}%`,
            background: allConfirmed ? C.green : C.saffron, borderRadius: 999,
            transition: 'width 0.25s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
        <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
          {confirmedCount} of {items.length} confirmed
        </span>
      </div>

      {/* Fact chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(fact => {
          const isEditing = editingId === fact.id;
          const needsReview = fact.status === 'needs_review';
          return (
            <div key={fact.id} style={{
              background: needsReview ? '#FFF8F0' : '#FAF8F3',
              border: `1px solid ${needsReview ? 'rgba(233,133,43,0.32)' : C.border}`,
              borderLeft: `3px solid ${needsReview ? C.saffron : C.green}`,
              borderRadius: '0 10px 10px 0',
              padding: '9px 11px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>
                    {fact.label}
                  </p>
                  {isEditing ? (
                    <input
                      className="lokai-verification-input"
                      aria-label={`Correct ${fact.label}`}
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(fact.id); }}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.ink,
                        border: `1.5px solid ${C.navy}`, borderRadius: 7,
                        padding: '5px 8px', background: '#FFFFFF',
                      }}
                    />
                  ) : (
                    <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.ink, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {fact.value}
                    </p>
                  )}
                </div>

                {/* Status / actions */}
                {!isEditing && fact.status === 'confirmed' && (
                  <button
                    onClick={() => startEdit(fact)}
                    aria-label={`Edit ${fact.label}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.muted,
                    }}
                  >
                    <Check size={14} color={C.green} strokeWidth={2.6} />
                    <Pencil size={12} color={C.muted} />
                  </button>
                )}
              </div>

              {/* Needs-review hint + actions */}
              {needsReview && !isEditing && (
                <>
                  {fact.hint && (
                    <p style={{ fontFamily: SANS, fontSize: 11, color: C.amber, lineHeight: 1.45, margin: '6px 0 8px' }}>
                      {fact.hint}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 7 }}>
                    <button
                      onClick={() => confirm(fact.id)}
                      style={{
                        minHeight: 32, borderRadius: 8, border: 'none',
                        background: C.navy, color: '#FFFFFF',
                        fontFamily: SANS, fontSize: 12, fontWeight: 700,
                        padding: '0 12px', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <Check size={13} /> It's correct
                    </button>
                    <button
                      onClick={() => startEdit(fact)}
                      style={{
                        minHeight: 32, borderRadius: 8,
                        border: `1px solid ${C.borderStrong}`, background: '#FFFFFF', color: C.inkSoft,
                        fontFamily: SANS, fontSize: 12, fontWeight: 700,
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
                      minHeight: 32, borderRadius: 8, border: 'none',
                      background: C.navy, color: '#FFFFFF',
                      fontFamily: SANS, fontSize: 12, fontWeight: 700,
                      padding: '0 14px', cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      minHeight: 32, borderRadius: 8,
                      border: `1px solid ${C.borderStrong}`, background: '#FFFFFF', color: C.inkSoft,
                      fontFamily: SANS, fontSize: 12, fontWeight: 700,
                      padding: '0 14px', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Gated generate button */}
      <button
        onClick={allConfirmed ? onConfirmed : undefined}
        disabled={!allConfirmed}
        style={{
          width: '100%', minHeight: 46, marginTop: 14,
          borderRadius: 12, border: 'none',
          background: allConfirmed ? C.navy : C.border,
          color: allConfirmed ? '#FFFFFF' : C.muted,
          fontFamily: SANS, fontSize: 14, fontWeight: 700,
          cursor: allConfirmed ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.18s ease',
        }}
      >
        {allConfirmed ? 'Build my assessment' : `Confirm ${items.length - confirmedCount} more to continue`}
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
}: {
  draftText: string;
  onCopy?: () => void;
  onPrint?: () => void;
}) {
  const [reviewed, setReviewed] = useState(false);
  const [copied, setCopied] = useState(false);

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
        borderRadius: '3px 12px 12px 12px',
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
      <h3 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400, color: C.ink, lineHeight: 1.25, margin: '0 0 7px' }}>
        LokAI won't send this for you.
      </h3>
      <p style={{ fontFamily: SANS, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 13px' }}>
        A legal document carries weight, and an AI can misread a date or an amount. You stay
        in control — read each detail, then copy or print it yourself. A lawyer or trusted
        helper can confirm the wording before you use it.
      </p>

      {/* Deliberate consent step — unlocks the export actions */}
      <button
        onClick={() => setReviewed(r => !r)}
        aria-pressed={reviewed}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textAlign: 'left',
          background: reviewed ? 'rgba(31,107,58,0.06)' : '#FAF8F3',
          border: `1px solid ${reviewed ? 'rgba(31,107,58,0.4)' : C.border}`,
          borderRadius: 11,
          padding: '11px 12px',
          cursor: 'pointer',
          marginBottom: 11,
          transition: 'background 0.16s ease, border-color 0.16s ease',
        }}
      >
        <span style={{
          width: 20,
          height: 20,
          borderRadius: 6,
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
        <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: C.ink }}>
          I've read the details and I'm ready to send it myself.
        </span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button
          onClick={reviewed ? handleCopy : undefined}
          disabled={!reviewed}
          style={{
            minHeight: 44,
            borderRadius: 11,
            border: 'none',
            background: !reviewed ? C.border : copied ? C.green : C.navy,
            color: !reviewed ? C.muted : '#FFFFFF',
            fontFamily: SANS,
            fontSize: 13,
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
            borderRadius: 11,
            border: `1.5px solid ${!reviewed ? C.border : C.navy}`,
            background: '#FFFFFF',
            color: !reviewed ? C.muted : C.navy,
            fontFamily: SANS,
            fontSize: 13,
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

      <p style={{ fontFamily: SANS, fontSize: 10.5, color: C.muted, lineHeight: 1.5, margin: '11px 0 0', textAlign: 'center' }}>
        LokAI prepared this draft. You are the sender. No message leaves the app on its own.
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
      borderRadius: '0 12px 12px 0',
      padding: 14,
      boxShadow: SHADOW.xs,
    }}>
      <SmallLabel>Safe recovery</SmallLabel>
      <h3 style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: C.ink, margin: '0 0 6px' }}>
        {failure.title}
      </h3>
      <p style={{ fontFamily: SANS, fontSize: 13, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 10px' }}>
        {failure.body}
      </p>
      <div style={{
        background: '#F8F5EE',
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '9px 10px',
      }}>
        <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: C.navy, margin: '0 0 3px' }}>
          {failure.nextAction}
        </p>
        <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted, lineHeight: 1.45, margin: 0 }}>
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
      borderRadius: '4px 16px 16px 16px',
      padding: 16,
      boxShadow: SHADOW.sm,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <span style={{
        alignSelf: 'flex-start',
        fontFamily: SANS, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        color: isRisky ? C.red : C.green,
        background: isRisky ? 'rgba(184,54,28,0.08)' : 'rgba(31,107,58,0.08)',
        borderRadius: 999, padding: '3px 9px',
      }}>
        {isRisky ? 'Verify before trusting' : 'Looks genuine'}
      </span>
      <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: C.ink, margin: 0, lineHeight: 1.25 }}>
        {assessment.title}
      </h3>
      <p style={{ fontFamily: SANS, fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6, margin: 0 }}>
        {assessment.decodedSummary}
      </p>
      <div style={{ background: isRisky ? '#FDF3F1' : '#F5F9F6', borderRadius: 10, padding: '10px 12px' }}>
        <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: isRisky ? C.red : C.green, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Why LokAI flagged this
        </p>
        <p style={{ fontFamily: SANS, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>
          {assessment.riskExplanation}
        </p>
      </div>
      {assessment.extractedAmount && (
        <p style={{ fontFamily: SANS, fontSize: 13, color: C.ink, margin: 0 }}>
          <strong>Offer:</strong> {assessment.extractedAmount}
        </p>
      )}
      <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted, margin: 0 }}>
        {assessment.deadline}
      </p>
      {!isRisky && assessment.suggestedReply && onPrepareReply && (
        <button
          onClick={onPrepareReply}
          style={{
            minHeight: 44, borderRadius: 12, border: 'none', background: C.navy, color: '#FFFFFF',
            fontFamily: SANS, fontSize: 13, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4,
          }}
        >
          Prepare a reply <ArrowRight size={14} />
        </button>
      )}
      {isRisky && (
        <p style={{ fontFamily: SANS, fontSize: 11.5, color: C.muted, lineHeight: 1.5, margin: 0 }}>
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
      borderRadius: '0 12px 12px 0',
      padding: 14,
      boxShadow: SHADOW.xs,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
        <ShieldCheck size={17} color={C.oxblood} />
        <SmallLabel>Professional guidance recommended</SmallLabel>
      </div>
      <p style={{ fontFamily: SANS, fontSize: 13, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 10px' }}>
        {workflow.humanReviewSummary}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Issue summary', 'Evidence collected', 'Sources checked', 'Draft packet'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={13} color={C.green} />
            <span style={{ fontFamily: SANS, fontSize: 12, color: C.ink }}>{item}</span>
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
      borderRadius: 12,
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
              borderRadius: '50%',
              background: '#F4F2EE',
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
                <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: C.ink, margin: '0 0 2px' }}>
                  {event.label}
                </p>
                <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>{event.time}</span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 12, color: C.inkSoft, lineHeight: 1.45, margin: 0 }}>
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
      borderRadius: 12,
      padding: 13,
      boxShadow: SHADOW.xs,
    }}>
      <SmallLabel>Guidance preferences</SmallLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontFamily: SANS, fontSize: 12, color: C.inkSoft }}>{item}</span>
            <span style={{
              width: 28,
              height: 16,
              borderRadius: 999,
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
                borderRadius: '50%',
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
        borderRadius: 10,
        background: '#FFFFFF',
        color: C.navy,
        fontFamily: SANS,
        fontSize: 12,
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
