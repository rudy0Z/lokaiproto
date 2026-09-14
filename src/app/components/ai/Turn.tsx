import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowCounterClockwise, BookOpen, CaretDown, Check, Copy, Info, SpeakerHigh } from '@phosphor-icons/react';
import { C, EDITORIAL, MONO, SANS, SHADOW, LAYOUT, MOTION, TYPE, COMPOSER, DEVANAGARI, TAMIL, useLokaiSharedStyles } from '../shared';
import { Sheet } from '../Sheet';
import {
  CitationChip,
  AttachmentChip,
  FadeRise,
  Row,
  Text,
  Label,
  Amount,
  Badge,
  T,
  shortStatuteLabel,
  SHADOW_SCALE,
  S,
  useInk,
} from '../../ui';
import { LegalText } from '../demo/LegalTerms';
import type { ResponseTurn, ResponseMode, DemoLanguage, EmotionalIntent, TurnCitation } from '../../data/responseTurns';
import { DEMO_PROGRESS_STAGES } from '../../data/responseTurns';
import { useDemo } from '../../context/DemoContext';
import { useVoiceCapture } from '../../hooks/useVoiceCapture';

/**
 * Emotional intent → concrete Turn craft deltas.
 * Inspectable mapping (journey doc § Emotional intent per mode).
 * Times are ms; denser = fewer simultaneous zones; primaryFirst = CTA/actions lead.
 */
export const EMOTION_CRAFT: Record<EmotionalIntent, {
  statusTone: string;
  revealStepMs: number;
  denser: boolean;
  primaryFirst: boolean;
  statusLine: string;
}> = {
  relief_without_certainty: {
    statusTone: C.navy,
    revealStepMs: 280,
    denser: false,
    primaryFirst: false,
    statusLine: 'Clear next step · sources still illustrative',
  },
  cared_friction: {
    statusTone: C.amber,
    revealStepMs: 200,
    denser: true,
    primaryFirst: true,
    statusLine: 'One detail unlocks the next safe step',
  },
  protective_stop: {
    statusTone: C.oxblood,
    revealStepMs: 160,
    denser: true,
    primaryFirst: true,
    statusLine: 'Stopped to protect you · human help available',
  },
  honest_gap: {
    // Was C.saffronDark (#C86712) — 3.88:1 on white, failed AA for the
    // caption-sized statusLine it colours. C.amber is 7.16:1 and already
    // a legitimate palette member for caution.
    statusTone: C.amber,
    revealStepMs: 220,
    denser: false,
    primaryFirst: false,
    statusLine: 'Partial answer · gap named plainly',
  },
  quiet_ack: {
    statusTone: C.green,
    revealStepMs: 0,
    denser: true,
    primaryFirst: false,
    statusLine: 'Confirmed',
  },
  working: {
    statusTone: C.navy,
    revealStepMs: Number.parseInt(MOTION.state, 10) || 220,
    denser: true,
    primaryFirst: false,
    statusLine: 'Working through the prepared steps',
  },
  trust_repair: {
    statusTone: C.amber,
    revealStepMs: 180,
    denser: true,
    primaryFirst: true,
    statusLine: 'Paused safely · nothing was lost',
  },
};

/* MODE_META — card surface per mode.
   The literal mode tint is gone from the JS and lives in CSS so dark mode
   can re-tint every card from the role block in one place. */
const MODE_META: Record<ResponseMode, { label: string; border: string; bg: string; chip: string }> = {
  explain:  { label: 'Explanation',    border: C.navy,    bg: 'var(--turn-bg-explain)',  chip: C.navySoft },
  clarify:  { label: 'Needs one fact', border: C.amber,   bg: 'var(--turn-bg-clarify)',  chip: C.cautionSoft },
  disclose: { label: 'Partial answer', border: C.saffronDark, bg: 'var(--turn-bg-disclose)', chip: C.saffronSoft },
  stop:     { label: 'Stopped',        border: C.oxblood, bg: 'var(--turn-bg-stop)',     chip: C.oxbloodSoft },
  confirm:  { label: 'Confirmed',      border: C.green,   bg: 'var(--turn-bg-confirm)',  chip: C.successSoft },
  progress: { label: 'Working',        border: C.borderStrong, bg: 'var(--turn-bg-progress)', chip: C.navySoft },
  recover:  { label: 'Paused',         border: C.amber,   bg: 'var(--turn-bg-recover)',  chip: C.cautionSoft },
};

/** Map a response mode to a <Badge> tone. Distinct from MODE_META.chip
 *  (which is the older soft-fill chip) so the badge and the per-mode
 *  surface tint stay independently adjustable. */
function badgeToneForMode(mode: ResponseMode): 'neutral' | 'flag' | 'ok' | 'halt' | 'attest' {
  switch (mode) {
    case 'stop':     return 'halt';
    case 'disclose': return 'flag';
    case 'clarify':  return 'flag';
    case 'confirm':  return 'ok';
    case 'recover':  return 'attest';
    case 'progress': return 'neutral';
    case 'explain':
    default:         return 'attest';
  }
}

function scriptProps(lang: DemoLanguage): { lang?: string; style: React.CSSProperties } {
  if (lang === 'hi' || lang === 'mr') {
    return { lang, style: { fontFamily: DEVANAGARI, lineHeight: 1.85, fontSize: 'calc(1em + 1px)' } };
  }
  if (lang === 'ta') {
    return { lang, style: { fontFamily: TAMIL, lineHeight: 1.9, fontSize: 'calc(1em + 1px)' } };
  }
  return { style: {} };
}

export function TurnStatus({
  label,
  stages,
  activeIndex = 0,
  onSkip,
  onReplay,
}: {
  label: string;
  /** Full staged checklist — when omitted, only the active label shows */
  stages?: readonly string[];
  activeIndex?: number;
  onSkip?: () => void;
  onReplay?: () => void;
}) {
  const list = stages && stages.length > 0 ? stages : [label];
  const idx = Math.max(0, Math.min(activeIndex, list.length - 1));
  const currentText = list[idx] || label;

  return (
    <div
      aria-live="polite"
      className="lokai-thinking-capsule"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderRadius: LAYOUT.radius.pill,
        background: C.surface2,
        color: C.inkSoft,
        marginBottom: 12,
        border: 'none',
      }}
    >
      <span
        className="lokai-progress-dot"
        style={{
          width: 7,
          height: 7,
          borderRadius: LAYOUT.radius.full,
          background: C.saffron,
          animation: 'lokaiPulseRing 1.4s ease-out infinite',
          flexShrink: 0,
        }}
      />
      <span style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 500, color: C.inkSoft }}>
        {currentText}
      </span>
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="lokai-pressable"
          style={{
            border: 'none',
            background: 'none',
            fontFamily: SANS,
            fontSize: TYPE.caption.size,
            fontWeight: 600,
            color: C.navy,
            cursor: 'pointer',
            padding: '2px 6px',
            marginLeft: 4,
          }}
        >
          Skip
        </button>
      )}
      {onReplay && (
        <button
          type="button"
          onClick={onReplay}
          aria-label="Replay progress"
          className="lokai-pressable"
          style={{
            border: 'none',
            background: 'none',
            color: C.inkSoft,
            cursor: 'pointer',
            padding: '2px 4px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <ArrowCounterClockwise size={13} />
        </button>
      )}
    </div>
  );
}

export function TurnCitations({
  turn,
  onOpenSource,
}: {
  turn: ResponseTurn;
  /** When provided, tapping a chip opens the source detail surface
   *  (mobile sheet / desktop rail scroll) instead of copying. The
   *  citation is the door; what the user reads on the other side is
   *  the source, not a clipboard string. */
  onOpenSource?: (citation: TurnCitation) => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  if (!turn.citations.length) return null;

  /* Section-first chips (the CitationChip upgrade): a legal reader scans the
     provision, not the prose. The full authority + the prepared-example
     review note travel in the chip's title and the source sheet — repeating
     "Example — verify with a lawyer" on every chip was the disclaimer as
     noise (L7). */
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
      {turn.citations.map((c) => {
        const copied = copiedId === c.id;
        return (
          <CitationChip
            key={c.id}
            label={shortStatuteLabel(c.reference)}
            title={`${c.title} — ${c.reference} (${c.reviewLabel})`}
            copied={copied}
            onClick={() => {
              if (onOpenSource) {
                onOpenSource(c);
                return;
              }
              void navigator.clipboard?.writeText(`${c.title} — ${c.reference}`).catch(() => {});
              setCopiedId(c.id);
              window.setTimeout(() => setCopiedId(null), Number.parseInt(MOTION.confirm, 10) + 1200);
            }}
          />
        );
      })}
    </div>
  );
}

function VerificationTrace({ turn }: { turn: ResponseTurn }) {
  const [open, setOpen] = useState(false);
  const steps = useMemo(() => {
    const fromCitations = turn.citations.map((c) => `Matched ${c.reference}`);
    const base = [
      'Read the prepared facts you confirmed',
      ...fromCitations.slice(0, 2),
      turn.draftAllowed
        ? 'Named one practical next step (draft stays review-gated)'
        : 'Stopped before an unsafe next step',
    ];
    return base.length >= 2 ? base : DEMO_PROGRESS_STAGES;
  }, [turn]);

  if (turn.mode !== 'explain' && turn.mode !== 'disclose') return null;

  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="lokai-pressable"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: LAYOUT.radius.control,
          border: `1px solid ${C.border}`,
          background: C.surface,
          fontFamily: SANS,
          fontSize: TYPE.caption.size,
          fontWeight: 600,
          color: C.navy,
          cursor: 'pointer',
        }}
      >
        How we checked
        <CaretDown
          size={14}
          aria-hidden
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: `transform ${MOTION.expand} ${MOTION.ease}`,
          }}
        />
      </button>
      <div className={`lokai-disclose${open ? ' is-open' : ''}`}>
        <div className="lokai-disclose-inner">
          <ol
            style={{
              listStyle: 'none',
              margin: '8px 0 0',
              padding: '10px 12px',
              borderRadius: LAYOUT.radius.panel,
              border: `1px solid ${C.border}`,
              background: C.surface2,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {steps.map((step) => (
              <li
                key={step}
                style={{
                  display: 'flex',
                  gap: 8,
                  fontFamily: SANS,
                  fontSize: TYPE.caption.size,
                  color: C.inkSoft,
                  lineHeight: 1.45,
                }}
              >
                <span style={{ color: C.green, fontWeight: 600, flexShrink: 0 }} aria-hidden>✓</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function TurnActions({
  onCopy,
  onSpeak,
  onWhy,
  primaryFirst = false,
}: {
  onCopy?: () => void;
  onSpeak?: () => void;
  onWhy?: () => void;
  primaryFirst?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy?.();
    setCopied(true);
    window.setTimeout(() => setCopied(false), Number.parseInt(MOTION.confirm, 10) + 1200);
  };

  const buttons = [
    onCopy && (
      <button
        key="copy"
        type="button"
        className="icon-btn lokai-pressable"
        aria-label={copied ? 'Copied' : 'Copy answer'}
        onClick={handleCopy}
        style={{
          ...actionBtn,
          color: copied ? C.green : C.muted,
          ...(primaryFirst ? { background: C.navySoft, color: copied ? C.green : C.navy, borderRadius: LAYOUT.radius.control } : {}),
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    ),
    onSpeak && (
      <button key="speak" type="button" className="icon-btn lokai-pressable" aria-label="Read aloud (prepared)" onClick={onSpeak}
        style={actionBtn}>
        <SpeakerHigh size={14} />
      </button>
    ),
    onWhy && (
      <button key="why" type="button" className="icon-btn lokai-pressable" aria-label="Why this answer" onClick={onWhy}
        style={actionBtn}>
        <Info size={14} />
      </button>
    ),
  ].filter(Boolean);

  return (
    <div style={{
      display: 'flex',
      gap: 4,
      marginTop: 10,
      justifyContent: primaryFirst ? 'flex-start' : 'flex-end',
    }}>
      {buttons}
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: C.muted,
  borderRadius: LAYOUT.radius.sm,
};

function Zone({
  label,
  children,
  large,
  script,
  visible = true,
  revealMs = 240,
}: {
  label: string;
  children: React.ReactNode;
  large?: boolean;
  script: ReturnType<typeof scriptProps>;
  /** When false, the zone is mounted but invisible — used for the continuous
   *  reveal so the answer accumulates without layout shifts. */
  visible?: boolean;
  /** Entrance duration — the craft's revealStepMs, so the mode paces its own arrival. */
  revealMs?: number;
}) {
  const seconds = revealMs / 1000;
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 6,
      }}
      transition={{ duration: seconds, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div style={{ padding: large ? `${S[1]} 0 ${S[3]}` : `${S[2]} 0 ${S[3]}` }}>
        {/* Label diet (L4/L7): the serif zone IS the law speaking — a caps
           eyebrow above it restates the register the type already carries.
           Supporting zones keep their quiet label. <Label> is the system's
           one caps eyebrow primitive. */}
        {!large && <Label style={{ marginBottom: 6 }}>{label}</Label>}
        <div
          {...(script.lang ? { lang: script.lang } : {})}
          style={{
            /* Zone 1 is THE LAW SPEAKING — the serif register, same decision
               as the assess screen. Indic scripts have no display serif by
               design (ui/script.ts): they take the script sans at weight 500,
               which the lang-conditional weight below provides. We keep this
               inline because the lang-driven font weight override is a
               script-system property, not a typography property. */
            fontFamily: large ? EDITORIAL : SANS,
            fontSize: large ? 22 : 14,
            fontWeight: large && script.lang ? 500 : 400,
            color: large ? C.ink : C.inkSoft,
            lineHeight: large ? 1.3 : 1.65,
            ...script.style,
          }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export function TurnBody({ turn, revealed = 3 }: { turn: ResponseTurn; revealed?: number }) {
  const script = scriptProps(turn.language);
  const p = turn.payload;

  if (p.mode === 'confirm') {
    return (
      <div style={{ padding: '14px 18px' }} {...(script.lang ? { lang: script.lang } : {})}>
        <p style={{ fontFamily: SANS, fontSize: TYPE.body.size, color: C.ink, margin: 0, lineHeight: 1.55, ...script.style }}>
          {p.data.acknowledgement}
        </p>
        {p.data.nextHint && (
          <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, margin: '6px 0 0' }}>
            {p.data.nextHint}
          </p>
        )}
      </div>
    );
  }

  if (p.mode === 'clarify') {
    return (
      <>
        <Zone label="Check this fact" large script={script} visible={revealed >= 1}>
            {p.data.question}
          </Zone>
        <Zone label="Why it matters" script={script} visible={revealed >= 2}>
            {p.data.whyItMatters}
          </Zone>
        <Zone label="What it unlocks" script={script} visible={revealed >= 3}>
            {p.data.unlocks}
          </Zone>
      </>
    );
  }

  if (p.mode === 'explain') {
    return (
      <>
        <Zone label="What the rule means" large script={script} visible={revealed >= 1}>
            <LegalText>{p.data.ruleMeans}</LegalText>
          </Zone>
        <Zone label="How it applies here" script={script} visible={revealed >= 2}>
            <LegalText>{p.data.appliesHere}</LegalText>
          </Zone>
        <Zone label="What you can do next" script={script} visible={revealed >= 3}>
            <ol style={{ margin: '0 0 10px', padding: '0 0 0 18px' }}>
              {p.data.nextSteps.map((s) => (
                <li key={s} style={{ marginBottom: 6 }}>{s}</li>
              ))}
            </ol>
            <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 600, color: C.navy, margin: 0 }}>
              → {p.data.cta}
            </p>
          </Zone>
      </>
    );
  }

  if (p.mode === 'disclose') {
    return (
      <>
        <Zone label="What we can say" large script={script} visible={revealed >= 1}>
            {p.data.partialAnswer}
          </Zone>
        <Zone label="What is missing" script={script} visible={revealed >= 2}>
            {p.data.gap}
          </Zone>
        <Zone label="What you can still do" script={script} visible={revealed >= 3}>
            <ul style={{ margin: 0, padding: '0 0 0 18px' }}>
              {p.data.whatYouCanStillDo.map((s) => (
                <li key={s} style={{ marginBottom: 6 }}>{s}</li>
              ))}
            </ul>
          </Zone>
      </>
    );
  }

  if (p.mode === 'stop') {
    return (
      <>
        <Zone label="Why LokAI stopped" large script={script} visible={revealed >= 1}>
            {p.data.reason}
          </Zone>
        <Zone label="What is preserved" script={script} visible={revealed >= 2}>
            {p.data.preservedSummary}
          </Zone>
        <Zone label="Still available" script={script} visible={revealed >= 3}>
            <ul style={{ margin: 0, padding: '0 0 0 18px' }}>
              {p.data.stillAvailable.map((s) => (
                <li key={s} style={{ marginBottom: 6 }}>{s}</li>
              ))}
            </ul>
            {p.data.systemsNote && (
              <p style={{
                marginTop: 12,
                padding: 10,
                background: C.surface2,
                borderRadius: LAYOUT.radius.control,
                fontSize: TYPE.caption.size,
                color: C.inkSoft,
                lineHeight: 1.55,
              }}>
                {p.data.systemsNote}
              </p>
            )}
          </Zone>
      </>
    );
  }

  if (p.mode === 'recover') {
    return (
      <>
        <Zone label="Paused" large script={script}>
          {p.data.message}
        </Zone>
        <Zone label="Your data" script={script}>
          {p.data.preservedNote}
        </Zone>
      </>
    );
  }

  // progress
  return (
    <div style={{ padding: 16 }}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {p.data.stages.map((stage, i) => (
          <li
            key={stage}
            style={{
              fontFamily: SANS,
              fontSize: TYPE.small.size,
              color: i <= p.data.activeIndex ? C.navy : C.muted,
              fontWeight: i === p.data.activeIndex ? 700 : 500,
              padding: '6px 0',
            }}
          >
            {i <= p.data.activeIndex ? '●' : '○'} {stage}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Turn({
  turn,
  onCopy,
  onSpeak,
  onOpenSource,
}: {
  turn: ResponseTurn;
  onCopy?: () => void;
  onSpeak?: () => void;
  onOpenSource?: (citation: TurnCitation) => void;
}) {
  const meta = MODE_META[turn.mode];
  const craft = EMOTION_CRAFT[turn.emotionalIntent];
  const reduce = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [revealed, setRevealed] = useState(
    reduce || turn.mode === 'confirm' || craft.revealStepMs === 0 ? 3 : 1,
  );

  useEffect(() => {
    if (reduce || turn.mode === 'confirm' || turn.mode === 'progress' || craft.revealStepMs === 0) {
      setRevealed(3);
      return;
    }
    // denser intents reveal zone 1 first and hold longer before expanding
    setRevealed(1);
    const step = craft.revealStepMs;
    const hold = craft.denser ? step * 1.4 : step;
    const t1 = window.setTimeout(() => setRevealed(2), hold);
    const t2 = window.setTimeout(() => setRevealed(3), hold + step);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [turn.id, reduce, turn.mode, craft.revealStepMs, craft.denser]);

  const copyText = useMemo(() => {
    const p = turn.payload;
    if (p.mode === 'explain') return [p.data.ruleMeans, p.data.appliesHere, ...p.data.nextSteps].join('\n');
    if (p.mode === 'clarify') return [p.data.question, p.data.whyItMatters, p.data.unlocks].join('\n');
    if (p.mode === 'disclose') return [p.data.partialAnswer, p.data.gap, ...p.data.whatYouCanStillDo].join('\n');
    if (p.mode === 'stop') return [p.data.reason, p.data.preservedSummary, ...p.data.stillAvailable].join('\n');
    if (p.mode === 'confirm') return p.data.acknowledgement;
    if (p.mode === 'recover') return p.data.message;
    return turn.title;
  }, [turn]);

  const isStop = turn.mode === 'stop';

  return (
    <article
      aria-label={`${meta.label}: ${turn.title}`}
      data-emotional-intent={turn.emotionalIntent}
      style={{
        background: isStop ? meta.bg : 'transparent',
        borderRadius: isStop ? LAYOUT.radius.turn : 0,
        boxShadow: isStop ? SHADOW_SCALE.card : 'none',
        border: isStop ? `1px solid ${C.border}` : 'none',
        overflow: 'hidden',
        marginBottom: S[4],
        padding: isStop ? `${S[4]} ${S[4]}` : 0,
      }}
    >
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: S[2],
        padding: isStop ? `0 0 ${S[3]}` : `0 0 ${S[2]}`,
        borderBottom: isStop ? `1px solid ${C.border}` : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: S[2], flexWrap: 'wrap' }}>
          <Badge
            tone={badgeToneForMode(turn.mode)}
          >
            {meta.label}
          </Badge>
          <Text
            role="meta"
            tone="faint"
            measured={false}
            style={{ opacity: 0.95 }}
          >
            {craft.statusLine}
          </Text>
        </div>
        {turn.totalClaims > 0 && (
          <Amount tone="faint" style={{ whiteSpace: 'nowrap' }}>
            {turn.groundedClaims} of {turn.totalClaims} sourced
          </Amount>
        )}
      </header>

      <TurnBody turn={turn} revealed={revealed} />

      <div style={{ padding: isStop ? `${S[3]} 0 0` : `0 0 ${S[2]}` }}>
        <TurnCitations turn={turn} onOpenSource={onOpenSource} />
        <VerificationTrace turn={turn} />
        <TurnActions
          primaryFirst={craft.primaryFirst}
          onCopy={() => {
            void navigator.clipboard?.writeText(copyText).catch(() => {});
            onCopy?.();
          }}
          onSpeak={onSpeak}
        />
      </div>
    </article>
  );
}

/* ── Composer glyphs — bespoke, not the icon set ───────────────────────────────
   The three highest-touch controls in the app get hand-drawn glyphs rather than
   a stock icon: a chat send should feel like this product's send. Stroke-based,
   currentColor, so they invert cleanly on the navy send button and the light
   mic. Press feedback comes from `.lokai-pressable`; the fill/lift is the state. */
function SendGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19.5V5.5" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  );
}

function MicGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5v4" />
    </svg>
  );
}

function StopGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
    </svg>
  );
}

/* The paperclip, drawn to the same stroke weight as the mic and send — a stock
   clip icon reads heavier than the bespoke glyphs beside it. */
function AttachGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 11.5l-7.6 7.6a5 5 0 0 1-7.1-7.1l8-8a3.4 3.4 0 0 1 4.8 4.8l-7.9 7.9a1.8 1.8 0 0 1-2.5-2.5l7.2-7.2" />
    </svg>
  );
}

/* Working indicator — three dots breathing in sequence. Reuses the existing
   pulse keyframe so it matches the progress dot elsewhere. */
function BusyDots({ light = false }: { light?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 4, height: 4, borderRadius: LAYOUT.radius.full,
            background: light ? T.onAnchor : C.navy,
            animation: 'lokaiPulseRing 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </span>
  );
}

/** Compact composer used across Chat, Docs, Notice, Draft, Home. */
export function Composer({
  placeholder = 'Ask about this prepared example…',
  onSubmit,
  disabled,
  suggestions,
  compact,
  showVoice = true,
  attachments,
  onRemoveAttachment,
  onAttach,
}: {
  placeholder?: string;
  onSubmit: (text: string) => void;
  disabled?: boolean;
  suggestions?: string[];
  compact?: boolean;
  showVoice?: boolean;
  /** Pending attachments — rendered as a removable tray above the input, and
   *  counted by canSend so a document alone can be sent. */
  attachments?: { id: string; label: string }[];
  onRemoveAttachment?: (id: string) => void;
  /** Renders the attach affordance in the leading slot (paperclip). */
  onAttach?: () => void;
}) {
  const [value, setValue] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useLokaiSharedStyles();
  const voice = useVoiceCapture({
    initialPhase: 'idle',
    onTranscriptReady: (text) => setValue(text),
  });
  const hasAttachments = !!attachments?.length;
  const canSend = (!!value.trim() || hasAttachments) && !disabled && !voice.isBusy;
  const isWorking = voice.isBusy || (!!disabled && !!value.trim());
  const maxH = compact ? COMPOSER.maxHeightCompact : COMPOSER.maxHeight;

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
  };

  useEffect(() => {
    adjustHeight(textareaRef.current);
  }, [value, maxH]);

  const voiceHint =
    voice.phase === 'listening'
      ? 'Playing the prepared voice example…'
      : voice.phase === 'transcribing'
        ? 'Turning the prepared voice example into text…'
        : voice.error;

  const resolvedPlaceholder =
    voice.phase === 'listening' || voice.phase === 'transcribing'
      ? 'Prepared voice example is playing…'
      : placeholder;

  const submit = () => {
    if (!canSend) return;
    onSubmit(value.trim());
    setValue('');
  };

  return (
    <div>
      {hasAttachments && onRemoveAttachment && (
        <Row gap={2} wrap style={{ marginBottom: 8 }}>
          {attachments!.map((a) => (
            <AttachmentChip key={a.id} label={a.label} onRemove={() => onRemoveAttachment(a.id)} />
          ))}
        </Row>
      )}
      {suggestions && suggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="lokai-chip"
              onClick={() => onSubmit(s)}
              style={{
                minHeight: 36,
                padding: '6px 12px',
                borderRadius: LAYOUT.radius.pill,
                border: `1px solid ${C.border}`,
                background: C.surface,
                fontFamily: SANS,
                fontSize: TYPE.caption.size,
                fontWeight: 600,
                color: C.navy,
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div
        className="lokai-composer-shell lokai-composer-floating"
        onClick={() => {
          if (!disabled && !voice.isBusy) textareaRef.current?.focus();
        }}
        style={{
          display: 'flex',
          alignItems: compact ? 'center' : 'flex-end',
          gap: 6,
          borderRadius: compact ? LAYOUT.radius.pill : LAYOUT.radius.plane,
          padding: compact ? '5px 8px' : '10px 14px',
        }}
      >
        {onAttach && (
          <button
            type="button"
            aria-label="Attach a document"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onAttach();
            }}
            className="lokai-pressable"
            style={{
              width: compact ? 38 : 42,
              height: compact ? 38 : 42,
              borderRadius: LAYOUT.radius.full,
              border: 'none',
              background: 'transparent',
              color: C.muted,
              cursor: disabled ? 'default' : 'pointer',
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <AttachGlyph size={compact ? 17 : 19} />
          </button>
        )}
        {showVoice && (
          <button
            type="button"
            aria-label={
              voice.phase === 'listening' || voice.phase === 'transcribing'
                ? 'Stop prepared voice example'
                : 'Play prepared voice example'
            }
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              voice.toggleDesktopMic();
            }}
            className="lokai-pressable"
            style={{
              width: compact ? 38 : 42,
              height: compact ? 38 : 42,
              borderRadius: LAYOUT.radius.full,
              border: 'none',
              background:
                voice.phase === 'listening' || voice.phase === 'transcribing'
                  ? C.navy
                  : 'transparent',
              color:
                voice.phase === 'listening' || voice.phase === 'transcribing'
                  ? T.onAnchor
                  : C.muted,
              cursor: disabled ? 'default' : 'pointer',
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {voice.phase === 'listening' || voice.phase === 'transcribing'
              ? <StopGlyph />
              : <MicGlyph size={compact ? 18 : 20} />}
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled || voice.isBusy}
          aria-label="Message LokAI"
          placeholder={resolvedPlaceholder}
          rows={COMPOSER.minRows}
          onChange={(e) => {
            setValue(e.target.value);
            adjustHeight(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            /* Single-row height that matches the round buttons so the placeholder
               sits on their centre line; grows to maxH as the user types. */
            minHeight: compact ? 24 : 28,
            maxHeight: maxH,
            padding: 0,
            overflowY: 'auto',
            fontFamily: SANS,
            fontSize: TYPE.body.size,
            lineHeight: 1.45,
            background: 'transparent',
            color: C.ink,
          }}
        />
        <button
          type="button"
          disabled={!canSend}
          aria-label={isWorking ? 'Working' : 'Send'}
          onClick={(e) => {
            e.stopPropagation();
            submit();
          }}
          className={canSend ? 'lokai-pressable' : undefined}
          style={{
            width: compact ? 38 : 42,
            height: compact ? 38 : 42,
            borderRadius: LAYOUT.radius.full,
            border: 'none',
            background: canSend ? T.anchor : T.sunken,
            color: canSend ? T.onAnchor : T.inkFaint,
            cursor: canSend ? 'pointer' : 'default',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            transition: `background ${MOTION.press} ${MOTION.ease}, transform ${MOTION.press} ${MOTION.ease}`,
            boxShadow: canSend ? SHADOW.sm : 'none',
          }}
        >
          {voice.isBusy ? <BusyDots light /> : <SendGlyph size={compact ? 17 : 19} />}
        </button>
      </div>
      {voiceHint && (
        <p
          aria-live="polite"
          style={{
            fontFamily: SANS,
            fontSize: TYPE.micro.size,
            color: C.muted,
            margin: '8px 0 0',
          }}
        >
          {voiceHint}
        </p>
      )}
    </div>
  );
}

/** Floating ask chip for Documents / Notice / Draft. */
export function ScopedAskButton({
  label = 'Ask about this',
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'fixed',
        right: 28,
        bottom: 28,
        zIndex: 50,
        minHeight: 44,
        padding: '0 18px',
        borderRadius: LAYOUT.radius.pill,
        border: `1px solid ${C.navy}`,
        background: C.navy,
        color: T.onAnchor,
        fontFamily: SANS,
        fontSize: TYPE.small.size,
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: SHADOW.lg,
      }}
    >
      {label}
    </button>
  );
}

export function ScopedAskSheet({
  open,
  onClose,
  title,
  suggestions,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  suggestions?: string[];
  onSubmit: (text: string) => void;
}) {
  const { runPreparedInput } = useDemo();

  /* Presentation and motion live in <Sheet>. Was a hard mount/unmount with
     no transition, and dismissed on onMouseDown — a pointer event that
     never fires on touch — despite being laid out as a mobile bottom
     sheet (alignItems: 'flex-end'). */
  return (
    <Sheet open={open} onClose={onClose} side="bottom" label={title}>
      <div style={{ padding: 20 }}>
        <h2 style={{ fontFamily: SANS, fontSize: TYPE.h4.size, fontWeight: 600, color: C.ink, margin: '0 0 12px' }}>
          {title}
        </h2>
        <Composer
          compact
          suggestions={suggestions}
          onSubmit={async (text) => {
            onSubmit(text);
            await runPreparedInput(text);
            onClose();
          }}
        />
      </div>
    </Sheet>
  );
}
