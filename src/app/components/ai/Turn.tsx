import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Check, Copy, Volume2, Info, RotateCcw, ChevronDown } from 'lucide-react';
import { C, MONO, SANS, SHADOW, LAYOUT, MOTION, TYPE, COMPOSER, DEVANAGARI, TAMIL, useLokaiSharedStyles } from '../shared';
import { LegalText } from '../demo/LegalTerms';
import type { ResponseTurn, ResponseMode, DemoLanguage, EmotionalIntent } from '../../data/responseTurns';
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

const MODE_META: Record<ResponseMode, { label: string; border: string; bg: string; chip: string }> = {
  explain:  { label: 'Explanation', border: C.navy, bg: C.surface, chip: C.navySoft },
  clarify:  { label: 'Needs one fact', border: C.amber, bg: '#FFFBF5', chip: C.cautionSoft },
  disclose: { label: 'Partial answer', border: C.saffronDark, bg: '#FFF9F1', chip: C.saffronSoft },
  stop:     { label: 'Stopped', border: C.oxblood, bg: '#FBF6F4', chip: C.oxbloodSoft },
  confirm:  { label: 'Confirmed', border: C.green, bg: '#F4FAF6', chip: C.successSoft },
  progress: { label: 'Working', border: C.borderStrong, bg: C.surface2, chip: C.navySoft },
  recover:  { label: 'Paused', border: C.amber, bg: '#FFFBF5', chip: C.cautionSoft },
};

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

  return (
    <div
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '12px 16px',
        borderRadius: LAYOUT.radius.card,
        border: `1px solid ${C.border}`,
        background: C.surface,
        boxShadow: SHADOW.xs,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            className="lokai-progress-dot"
            style={{
              width: 8,
              height: 8,
              borderRadius: LAYOUT.radius.full,
              background: C.saffron,
              animation: 'lokaiPulseRing 1.4s ease-out infinite',
            }}
          />
          <span style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 600, color: C.inkSoft }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="lokai-chip"
              style={{
                minHeight: 36,
                padding: '0 12px',
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
                width: 36,
                height: 36,
                borderRadius: LAYOUT.radius.control,
                border: `1px solid ${C.border}`,
                background: C.surface,
                color: C.muted,
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {list.length > 1 && (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {list.map((stage, i) => {
            const done = i < idx;
            const active = i === idx;
            return (
              <li
                key={stage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: SANS,
                  fontSize: TYPE.caption.size,
                  fontWeight: active ? 700 : 500,
                  color: done || active ? C.navy : C.muted,
                  opacity: done || active ? 1 : 0.72,
                  transition: `opacity ${MOTION.status} ${MOTION.ease}, color ${MOTION.status} ${MOTION.ease}`,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 14,
                    textAlign: 'center',
                    fontFamily: MONO,
                    fontSize: TYPE.micro.size,
                    color: done ? C.green : active ? C.saffron : C.muted,
                  }}
                >
                  {done ? '✓' : active ? '●' : '○'}
                </span>
                {stage}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function TurnCitations({ turn }: { turn: ResponseTurn }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  if (!turn.citations.length) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
      {turn.citations.map((c) => {
        const copied = copiedId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            className="lokai-chip"
            aria-label={copied ? `Copied ${c.reference}` : `Copy source ${c.reference}`}
            onClick={() => {
              void navigator.clipboard?.writeText(`${c.title} — ${c.reference}`).catch(() => {});
              setCopiedId(c.id);
              window.setTimeout(() => setCopiedId(null), Number.parseInt(MOTION.confirm, 10) + 1200);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: MONO,
              fontSize: TYPE.label.size,
              color: C.navy,
              background: copied ? C.successSoft : C.navySoft,
              border: `1px solid ${C.border}`,
              borderRadius: LAYOUT.radius.sm,
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={11} aria-hidden /> : <BookOpen size={11} aria-hidden />}
            {copied ? 'Copied' : c.reference}
            {!copied && <span style={{ color: C.muted }}>· {c.reviewLabel}</span>}
          </button>
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
        <ChevronDown
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
                <span style={{ color: C.green, fontWeight: 700, flexShrink: 0 }} aria-hidden>✓</span>
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
        <Volume2 size={14} />
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
}: {
  label: string;
  children: React.ReactNode;
  large?: boolean;
  script: ReturnType<typeof scriptProps>;
}) {
  return (
    <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
      <div style={{
        fontFamily: SANS,
        fontSize: TYPE.label.size,
        fontWeight: 700,
        color: C.muted,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div
        {...(script.lang ? { lang: script.lang } : {})}
        style={{
          fontFamily: SANS,
          fontSize: large ? 20 : 14,
          color: large ? C.ink : C.inkSoft,
          lineHeight: large ? 1.45 : 1.65,
          ...script.style,
        }}
      >
        {children}
      </div>
    </div>
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
        {revealed >= 1 && (
          <Zone label="Check this fact" large script={script}>
            {p.data.question}
          </Zone>
        )}
        {revealed >= 2 && (
          <Zone label="Why it matters" script={script}>
            {p.data.whyItMatters}
          </Zone>
        )}
        {revealed >= 3 && (
          <Zone label="What it unlocks" script={script}>
            {p.data.unlocks}
          </Zone>
        )}
      </>
    );
  }

  if (p.mode === 'explain') {
    return (
      <>
        {revealed >= 1 && (
          <Zone label="What the rule means" large script={script}>
            <LegalText>{p.data.ruleMeans}</LegalText>
          </Zone>
        )}
        {revealed >= 2 && (
          <Zone label="How it applies here" script={script}>
            <LegalText>{p.data.appliesHere}</LegalText>
          </Zone>
        )}
        {revealed >= 3 && (
          <Zone label="What you can do next" script={script}>
            <ol style={{ margin: '0 0 10px', padding: '0 0 0 18px' }}>
              {p.data.nextSteps.map((s) => (
                <li key={s} style={{ marginBottom: 6 }}>{s}</li>
              ))}
            </ol>
            <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 700, color: C.navy, margin: 0 }}>
              → {p.data.cta}
            </p>
          </Zone>
        )}
      </>
    );
  }

  if (p.mode === 'disclose') {
    return (
      <>
        {revealed >= 1 && (
          <Zone label="What we can say" large script={script}>
            {p.data.partialAnswer}
          </Zone>
        )}
        {revealed >= 2 && (
          <Zone label="What is missing" script={script}>
            {p.data.gap}
          </Zone>
        )}
        {revealed >= 3 && (
          <Zone label="What you can still do" script={script}>
            <ul style={{ margin: 0, padding: '0 0 0 18px' }}>
              {p.data.whatYouCanStillDo.map((s) => (
                <li key={s} style={{ marginBottom: 6 }}>{s}</li>
              ))}
            </ul>
          </Zone>
        )}
      </>
    );
  }

  if (p.mode === 'stop') {
    return (
      <>
        {revealed >= 1 && (
          <Zone label="Why LokAI stopped" large script={script}>
            {p.data.reason}
          </Zone>
        )}
        {revealed >= 2 && (
          <Zone label="What is preserved" script={script}>
            {p.data.preservedSummary}
          </Zone>
        )}
        {revealed >= 3 && (
          <Zone label="Still available" script={script}>
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
        )}
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
}: {
  turn: ResponseTurn;
  onCopy?: () => void;
  onSpeak?: () => void;
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

  return (
    <article
      aria-label={`${meta.label}: ${turn.title}`}
      data-emotional-intent={turn.emotionalIntent}
      style={{
        background: meta.bg,
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${meta.border}`,
        borderRadius: LAYOUT.radius.turn,
        boxShadow: SHADOW.sm,
        overflow: 'hidden',
        marginBottom: 20,
      }}
    >
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '12px 16px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontFamily: SANS,
            fontSize: TYPE.micro.size,
            fontWeight: 700,
            color: craft.statusTone,
            background: meta.chip,
            borderRadius: LAYOUT.radius.pill,
            padding: '3px 9px',
            marginBottom: 4,
          }}>
            {meta.label}
          </span>
          <h3 style={{
            fontFamily: TYPE.title.family,
            fontSize: craft.denser ? TYPE.body.size : TYPE.title.size,
            fontWeight: 700,
            color: C.ink,
            margin: 0,
          }}>
            {turn.title}
          </h3>
          <p style={{
            fontFamily: TYPE.micro.family,
            fontSize: TYPE.micro.size,
            fontWeight: TYPE.micro.weight,
            letterSpacing: '0.02em',
            textTransform: 'none' as const,
            color: craft.statusTone,
            margin: '4px 0 0',
            opacity: 0.85,
          }}>
            {craft.statusLine}
          </p>
        </div>
        {turn.totalClaims > 0 && (
          <span style={{ fontFamily: MONO, fontSize: TYPE.label.size, color: C.muted, whiteSpace: 'nowrap' }}>
            {turn.groundedClaims} of {turn.totalClaims} claims sourced
          </span>
        )}
      </header>

      <TurnBody turn={turn} revealed={revealed} />

      <div style={{ padding: '0 16px 14px' }}>
        <TurnCitations turn={turn} />
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

/** Compact composer used across Chat, Docs, Notice, Draft, Home. */
export function Composer({
  placeholder = 'Ask about this prepared example…',
  onSubmit,
  disabled,
  suggestions,
  compact,
  showVoice = true,
}: {
  placeholder?: string;
  onSubmit: (text: string) => void;
  disabled?: boolean;
  suggestions?: string[];
  compact?: boolean;
  showVoice?: boolean;
}) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useLokaiSharedStyles();
  const voice = useVoiceCapture({
    initialPhase: 'idle',
    onTranscriptReady: (text) => setValue(text),
  });
  const canSend = !!value.trim() && !disabled && !voice.isBusy;
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
        className="lokai-composer-shell"
        onClick={() => {
          if (!disabled && !voice.isBusy) textareaRef.current?.focus();
        }}
        style={{
          display: 'flex',
          alignItems: compact ? 'center' : 'flex-end',
          gap: 10,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: compact ? LAYOUT.radius.card : LAYOUT.radius.plane,
          padding: compact ? '8px 10px' : '12px 14px',
          boxShadow: SHADOW.sm,
        }}
      >
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
              width: compact ? 36 : 40,
              height: compact ? 36 : 40,
              borderRadius: LAYOUT.radius.full,
              border: `1px solid ${C.border}`,
              background:
                voice.phase === 'listening' || voice.phase === 'transcribing'
                  ? C.navy
                  : C.surface,
              color:
                voice.phase === 'listening' || voice.phase === 'transcribing'
                  ? '#fff'
                  : C.navy,
              cursor: disabled ? 'default' : 'pointer',
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              fontSize: TYPE.body.size,
              fontWeight: 700,
              fontFamily: SANS,
            }}
          >
            {voice.phase === 'listening' || voice.phase === 'transcribing' ? '···' : '🎤'}
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled || voice.isBusy}
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
            minHeight: compact ? 36 : 44,
            maxHeight: maxH,
            overflowY: 'auto',
            fontFamily: SANS,
            fontSize: TYPE.body.size,
            lineHeight: 1.5,
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
            width: 40,
            height: 40,
            borderRadius: LAYOUT.radius.full,
            border: 'none',
            background: canSend ? C.navy : C.border,
            color: '#fff',
            cursor: canSend ? 'pointer' : 'default',
            fontFamily: SANS,
            fontSize: TYPE.h4.size,
            fontWeight: 700,
            flexShrink: 0,
            transition: `background ${MOTION.press} ${MOTION.ease}, opacity ${MOTION.press} ${MOTION.ease}`,
            opacity: voice.isBusy ? 0.85 : 1,
          }}
        >
          {voice.isBusy ? '···' : '→'}
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
        color: '#fff',
        fontFamily: SANS,
        fontSize: TYPE.small.size,
        fontWeight: 700,
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
  if (!open) return null;

  return (
    <div
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(11,30,55,0.4)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          width: 'min(520px, 100%)',
          background: C.surface,
          borderRadius: LAYOUT.radius.turn,
          padding: 20,
          boxShadow: SHADOW.float,
        }}
      >
        <h2 style={{ fontFamily: SANS, fontSize: TYPE.h4.size, fontWeight: 700, color: C.ink, margin: '0 0 12px' }}>
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
      </section>
    </div>
  );
}
