import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowCounterClockwise, BookOpen, CaretDown, Check, Copy, Flag, Info, SpeakerHigh } from '@phosphor-icons/react';
import { C, EDITORIAL, MONO, SANS, SHADOW, LAYOUT, MOTION, TYPE, COMPOSER, DEVANAGARI, TAMIL, useLokaiSharedStyles } from '../shared';
import { Sheet } from '../Sheet';
import {
  CitationChip,
  AttachmentChip,
  FadeRise,
  Row,
  Rule,
  StreamText,
  Text,
  Badge,
  T,
  M,
  shortStatuteLabel,
  SHADOW_SCALE,
  S,
  useInk,
  typeStyle,
} from '../../ui';
import { LegalText } from '../demo/LegalTerms';
import { clarifyOptionsFor, turnChrome, type ClarifyOption } from '../../data/languagePacks';
import { channelsForTurn } from '../../data/caseWorkflow';
import type { BecauseRef } from '../../decision/types';
import type { ResponseTurn, ResponseMode, ResponseMatter, DemoLanguage, EmotionalIntent, TurnCitation } from '../../data/responseTurns';
import { DEMO_PROGRESS_STAGES, matterOf } from '../../data/responseTurns';
import type { DecisionReceipt } from '../../decision/types';
import { useDemo } from '../../context/DemoContext';
import { useVoiceCapture } from '../../hooks/useVoiceCapture';

/* P3 — Decision receipt surface (DECISION-INTERACTION S4).
 * Collapsed by default (D7). One quiet text-tap, never a button —
 * one-primary-CTA law holds. Provenance, never confidence: gate + rule +
 * because-chips + humanLine + policy version. No numbers. The receipt is an
 * instrument, not a display: because-chips that name a fact or a source are
 * tappable and open that row (live recompute keeps them true after edits). */
export function DecisionReceiptView({
  receipt,
  open: controlledOpen,
  onToggle,
  onOpenRef,
  language = 'en',
}: {
  receipt: DecisionReceipt;
  /** Controlled open state (the gate-trail line toggles the same panel). */
  open?: boolean;
  onToggle?: () => void;
  onOpenRef?: (ref: BecauseRef) => void;
  language?: DemoLanguage;
}) {
  const [ownOpen, setOwnOpen] = useState(false);
  const open = controlledOpen ?? ownOpen;
  const setOpen = (v: boolean | ((prev: boolean) => boolean)) => {
    if (onToggle) onToggle();
    else setOwnOpen(v);
  };
  const chrome = turnChrome(language);
  const refs = receipt.becauseRefs ?? [];
  return (
    <div style={{ marginTop: 8 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="lokai-pressable"
        style={{
          border: 'none',
          background: 'none',
          padding: 0,
          cursor: 'pointer',
          ...typeStyle('caption'),
          color: T.inkFaint,
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        }}
      >
        {open ? chrome.hideWhy : chrome.why}
      </button>
      {open && (
        <div
          aria-live="polite"
          style={{
            marginTop: 8,
            borderRadius: LAYOUT.radius.panel,
            background: T.sunken,
            padding: `${S[3]} ${S[3]}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge tone="attest">{chrome.decided}</Badge>
            <Text role="caption" tone="quiet">{receipt.turnId} · {receipt.outcomeKind}</Text>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {refs.length > 0 ? refs.map((b) => {
              const tappable = (b.kind === 'fact' || b.kind === 'source' || b.kind === 'scene') && !!onOpenRef;
              return (
                <button
                  key={`${b.kind}:${b.ref}`}
                  type="button"
                  onClick={tappable ? () => onOpenRef?.(b) : undefined}
                  disabled={!tappable}
                  className={tappable ? 'lokai-pressable' : undefined}
                  title={tappable ? undefined : b.label}
                  style={{
                    ...typeStyle('caption'),
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    color: tappable ? T.anchor : T.inkQuiet,
                    background: T.raised,
                    border: 'none',
                    borderRadius: LAYOUT.radius.pill,
          padding: `${S[1]} ${S[3]}`,
                    cursor: tappable ? 'pointer' : 'default',
                    minHeight: 26,
                  }}
                >
                  {b.kind === 'fact' && <span aria-hidden>•</span>}
                  {b.kind === 'source' && <BookOpen size={12} aria-hidden />}
                  {b.label}
                  {tappable && <span aria-hidden>→</span>}
                </button>
              );
            }) : (
              <Text role="caption" tone="quiet">{chrome.matched}</Text>
            )}
          </div>
          <Text role="caption" tone="quiet" style={{ fontFamily: MONO }}>
            {receipt.gate} · {receipt.rule} · {receipt.policyVersion}
          </Text>
          <Text role="body">{receipt.humanLine}</Text>
        </div>
      )}
    </div>
  );
}

/* P3 — gate-trail line (DECISION-INTERACTION S1). The familiar
 * "Thought for Ns" slot, filled with computed truth: what ran, not how long.
 * Localized per script (the chips stay short so Indic lines hold), and the
 * whole line is the receipt's second door — tap it, the receipt opens. */
export function GateTrail({
  receipt,
  ledger,
  language = 'en',
  onOpen,
}: {
  receipt: DecisionReceipt;
  ledger?: string;
  language?: DemoLanguage;
  onOpen?: () => void;
}) {
  const chrome = turnChrome(language);
  const gateName = chrome.gates[receipt.gate] ?? receipt.gate;
  const line = (
    <>
      {gateName} ✓
      {ledger ? ` · ${ledger}` : ''} ▸
    </>
  );
  if (!onOpen) {
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        <Text role="caption" tone="faint" aria-live="polite">{line}</Text>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={false}
      className="lokai-pressable"
      style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8,
        background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
      }}
    >
      <Text role="caption" tone="faint" aria-live="polite">{line}</Text>
    </button>
  );
}

/* P5 — Decision Spine (DECISION-INTERACTION S5). One component, two docks:
 * desktop collapsible panel / mobile Sheet. Rows = DecisionReceipt[] from
 * DemoContext — single source of truth, never mirrored state. Collapsed by
 * default, badge-counted. Failure/Recovery render as states, never skipped. */
export function DecisionSpine({ receipts, factsSummary }: { receipts: DecisionReceipt[]; factsSummary?: string }) {
  const [open, setOpen] = useState(false);
  if (receipts.length === 0) return null;
  return (
    <div
      style={{
        borderRadius: LAYOUT.radius.panel,
        background: T.raised,
        padding: `${S[3]} ${S[3]}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="lokai-pressable"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: 'none',
          background: 'none',
          padding: 0,
          cursor: 'pointer',
          ...typeStyle('label'),
          color: T.inkQuiet,
        }}
      >
        <span>Decision log</span>
        <span
          style={{
            ...typeStyle('caption'),
            color: T.onAnchor,
            background: T.anchor,
            borderRadius: LAYOUT.radius.pill,
              padding: `${S[1]} ${S[3]}`,
          }}
        >
          {receipts.length}
        </span>
      </button>
      {factsSummary && (
        <Text role="caption" tone="quiet">{factsSummary}</Text>
      )}
      {open && (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {receipts.map((r) => (
            <li
              key={r.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            padding: `${S[2]} ${S[3]}`,
                borderRadius: LAYOUT.radius.control,
                background: T.sunken,
              }}
            >
              <Text role="caption" tone="quiet" style={{ fontFamily: MONO }}>
                {r.gate} · {r.rule}
              </Text>
              <Text role="quiet">{r.humanLine}</Text>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

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
          padding: `${S[2]} ${S[3]}`,
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
                padding: `${S[3]} ${S[3]}`,
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
  onFlag,
  primaryFirst = false,
}: {
  onCopy?: () => void;
  onSpeak?: () => void;
  onWhy?: () => void;
  onFlag?: () => void;
  primaryFirst?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const handleCopy = () => {
    onCopy?.();
    setCopied(true);
    window.setTimeout(() => setCopied(false), Number.parseInt(MOTION.confirm, 10) + 1200);
  };

  const handleFlag = () => {
    onFlag?.();
    setFlagged(true);
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
    onFlag && (
      /* The feedback loop a trust product cannot be without: a way to say
         "this missed my situation" that is recorded in the case history, not
         discarded. Never a styled button — a quiet icon beside "Why this
         response?", so flagging costs no more attention than inspecting. */
      <button
        key="flag"
        type="button"
        className="icon-btn lokai-pressable"
        aria-label={flagged ? 'Flagged — added to your case history' : 'This answer missed my situation'}
        onClick={handleFlag}
        style={{ ...actionBtn, color: flagged ? C.amber : C.muted }}
      >
        {flagged ? <Check size={14} /> : <Flag size={14} />}
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
    <>
      <div style={{
        display: 'flex',
        gap: 4,
        marginTop: 10,
        justifyContent: primaryFirst ? 'flex-start' : 'flex-end',
      }}>
        {buttons}
      </div>
      {flagged && (
        <Text role="caption" tone="quiet" measured={false} aria-live="polite" style={{ marginTop: 4 }}>
          Noted in your case history. That record is the kind of thing a reviewer or lawyer can look at.
        </Text>
      )}
    </>
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
  stream = false,
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
  /** Zone 1 streams word-by-word (the medium's signature motion). Zones 2
   *  and 3 arrive as cross-fades: three simultaneous streams would read as
   *  three answers fighting, and only the law-speaking zone is "being
   *  written" in the reader's mental model. */
  stream?: boolean;
}) {
  const seconds = revealMs / 1000;
  const reduce = useReducedMotion();
  /* Label diet (L4/L7): the serif zone IS the law speaking — a caps eyebrow
     above it restates the register the type already carries. The supporting
     zones lost theirs in the same pass: three "HOW IT APPLIES HERE" caps
     labels per answer is what made the flagship screen read as generated.
     Hierarchy now comes from size, weight and contrast alone. `label` stays
     in the signature as the zone's semantic name for the specimen catalog. */
  void label;
  return (
    <motion.div
      /* The zone now owns its own entrance. It used to delegate that to the
         FadeRise wrapper around the whole turn — which is stable now (the
         working row morphs into the answer instead of being removed), so
         without this the answer popped in with no arrival at all. A short
         6px rise plus a fade, on the turn's own revealStepMs beat, so the
         pacing stays the mode's decision rather than a global constant. */
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 6,
      }}
      transition={{ duration: seconds, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div style={{ padding: large ? `${S[1]} 0 ${S[4]}` : `${S[2]} 0 ${S[4]}` }}>
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
            fontSize: large ? 22 : 16,
            fontWeight: large && script.lang ? 500 : 400,
            color: large ? C.ink : C.inkSoft,
            lineHeight: large ? 1.3 : 1.7,
            ...script.style,
          }}
        >
          {stream && typeof children === 'string'
            ? <StreamText active={visible}>{children}</StreamText>
            : children}
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
      <div style={{ padding: `${S[4]} ${S[4]}` }} {...(script.lang ? { lang: script.lang } : {})}>
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
        <Zone label="Check this fact" large script={script} visible={revealed >= 1} stream>
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
        <Zone label="What the rule means" large script={script} visible={revealed >= 1} stream>
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
        {/* Zone 4 (DECISION-INTERACTION §4-S2): the structural gap line. It
           materializes exactly when groundedClaims < totalClaims and names
           the unsourced claim — never a generic disclaimer. */}
        {p.data.doesntCover && (
          <Zone label="What this doesn't cover" script={script} visible={revealed >= 3}>
            {p.data.doesntCover}
          </Zone>
        )}
      </>
    );
  }

  if (p.mode === 'disclose') {
    return (
      <>
        <Zone label="What we can say" large script={script} visible={revealed >= 1} stream>
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
        <Zone label="Why LokAI stopped" large script={script} visible={revealed >= 1} stream>
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
        <Zone label="Paused" large script={script} stream>
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

/* ── Phase 3.1 — What would change this answer ───────────────────────────────
 * The honest answer to the question every careful reader asks and no shipped
 * AI product answers: not "what did you tell me" but "what would have made
 * you tell me something else".
 *
 * The engine is a real gate ladder (`decision/engine.ts` G2–G6), so this is
 * not a disclaimer — each line names a gate that could still fire. That turns
 * a refusal from an arbitrary wall into a legible rule, and it is the piece
 * that makes the trust story read as a product rather than as copy.
 *
 * Only on answer modes (explain / disclose). A stop has already fired a gate;
 * listing the others there would bury the one that mattered. */
function WhatWouldChange({
  language,
  matter,
}: {
  language: DemoLanguage;
  matter: ResponseMatter;
}) {
  const chrome = turnChrome(language);
  const items = chrome.whatWouldChange[matter];
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: S[2] }}>
      <Rule style={{ marginBottom: S[3] }} />
      <ul style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: S[2],
      }}>
        {items.map((line) => (
          <li key={line} style={{ display: 'flex', gap: S[2], alignItems: 'flex-start' }}>
            <span aria-hidden style={{ color: T.inkFaint, flexShrink: 0, ...typeStyle('caption') }}>→</span>
            <Text role="caption" tone="quiet" measured={false} style={{ flex: 1 }}>{line}</Text>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Turn({
  turn,
  receipt,
  onCopy,
  onSpeak,
  onOpenSource,
  onClarifyAnswer,
  onOpenRef,
  onFlagAnswer,
  announce = false,
}: {
  turn: ResponseTurn;
  /** P3: computed receipt for this turn. When the turn id matches, the
      gate-trail line and "Why this response?" render from it. Specimen
      turns without a receipt render exactly as before. */
  receipt?: DecisionReceipt | null;
  onCopy?: () => void;
  onSpeak?: () => void;
  onOpenSource?: (citation: TurnCitation) => void;
  /** 2026-09-14 audit P1 (desktop clarify): when provided, a clarify turn
     renders its tappable answer rows beneath the question — the same
     resolveClarify routing the mobile chat uses. */
  onClarifyAnswer?: (option: ClarifyOption) => void;
  /** The receipt as an instrument: a because-chip naming a fact/source
     opens that row (behavioral audit P1-9, DECISION-INTERACTION S4). */
  onOpenRef?: (ref: BecauseRef) => void;
  /** The correction channel: the user says this answer missed their
      situation. Recorded in the case history, never acted on silently. */
  onFlagAnswer?: (turn: ResponseTurn) => void;
  /** P1-3 (screen-reader answers announced): the latest turn only. */
  announce?: boolean;
}) {
  const meta = MODE_META[turn.mode];
  const craft = EMOTION_CRAFT[turn.emotionalIntent];
  const reduce = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [revealed, setRevealed] = useState(
    reduce || turn.mode === 'confirm' || craft.revealStepMs === 0 ? 3 : 1,
  );
  /* The receipt has two doors — the gate-trail line and the quiet text-tap —
     and they toggle the same panel (D7's "once toggled, never auto-behaves"). */
  const [whyOpen, setWhyOpen] = useState(false);

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
  /* P3 risk chip (D10): silent on self-service. Stop without draft =
     human path; any non-draftable non-stop turn needs a check first. */
  const riskLabel = turn.mode === 'stop' && !turn.draftAllowed
    ? 'Human required'
    : !turn.draftAllowed && turn.mode !== 'progress' && turn.mode !== 'confirm'
      ? 'Needs a check first'
      : null;

  const chrome = turnChrome(turn.language);
  const receiptForTurn = receipt && receipt.turnId === turn.id ? receipt : null;
  const ledger = receiptForTurn?.ledger ?? { grounded: turn.groundedClaims, total: turn.totalClaims };
  const stopChannels = isStop ? channelsForTurn(turn.id) : [];

  /* Phase 2.3 — the stop trigger sentence.
     Only stops carry it: an answer that proceeds has no gate to explain. The
     marker is the user's own word, de-prefixed from its machine key so what
     gets quoted is literally what they typed. */
  const stopTrigger = React.useMemo(() => {
    if (!isStop || !receiptForTurn) return null;
    const markers = receiptForTurn.because ?? [];
    if (markers.length === 0) return null;
    const gateName = chrome.gates[receiptForTurn.gate] ?? receiptForTurn.gate;
    const bare = markers[0].replace(/^(?:fact|source|scene|rule):/, '');
    return chrome.stopTrigger(gateName, bare);
  }, [isStop, receiptForTurn, chrome]);

  return (
    <article
      aria-label={`${meta.label}: ${turn.title}`}
      aria-live={announce ? 'polite' : undefined}
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
      {/* ── The stop trigger ─────────────────────────────────────────────────
          Phase 2.3. Every other AI product renders a refusal as prose, so the
          user learns only WHAT was refused. `decide()` is a substring
          classifier, so we also know WHY this particular message fired — and
          saying so is the strongest trust move available, because it turns
          the engine's real weakness (brittle matching) into its most visible
          property (an inspectable rule). Localized, and the marker is the
          user's own word quoted verbatim. */}
      {isStop && stopTrigger && (
        <p style={{
          ...typeStyle('small', { color: C.oxblood, fontWeight: 600 }),
          margin: `0 0 ${S[3]}`,
        }}>
          {stopTrigger}
        </p>
      )}

      {/* ── ONE grounding line (L7) ───────────────────────────────────────────
          This was a four-element metadata stack: a mode badge, a risk badge, a
          12px caps status line, and a right-aligned claim count. Four pieces of
          chrome above the answer is the loudest reason the flagship screen read
          as generated rather than designed. The load-bearing information — what
          kind of response this is, and how much of it traces to a source — is
          one quiet tappable line, the same shape as the audit line it replaces.
          The risk badge survives only on stops, where "a human must look at
          this" is a fact the user needs before reading anything else. */}
      {isStop ? (
        <Row gap={2} wrap style={{ marginBottom: S[2] }}>
          <Badge tone={badgeToneForMode(turn.mode)}>{meta.label}</Badge>
          {riskLabel && <Badge tone="halt">{riskLabel}</Badge>}
        </Row>
      ) : (
        <button
          type="button"
          onClick={() => receiptForTurn && setWhyOpen((v) => !v)}
          aria-expanded={receiptForTurn ? whyOpen : undefined}
          className={receiptForTurn ? 'lokai-pressable' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: S[2],
            background: 'none', border: 'none', padding: 0,
            marginBottom: S[1], cursor: receiptForTurn ? 'pointer' : 'default',
            textAlign: 'left', width: '100%',
          }}
        >
          <Text role="caption" tone="faint" measured={false} style={{ flex: 1 }}>
            {meta.label}
            {ledger.total > 0 ? ` · ${chrome.sourcedOf(ledger.grounded, ledger.total)}` : ''}
            {receiptForTurn ? ' ▸' : ''}
          </Text>
        </button>
      )}

      <TurnBody turn={turn} revealed={revealed} />
      {(turn.mode === 'explain' || turn.mode === 'disclose') && (
        <WhatWouldChange language={turn.language} matter={matterOf(turn)} />
      )}
      {onClarifyAnswer && turn.mode === 'clarify' && (
        /* 2026-09-14 audit P1: the clarify copy says "pick the closest answer
           below" — on desktop it now means it. The rows are the mobile chat's
           options ported: the tap IS the answer, typing still works. */
        <div style={{ padding: `${S[2]} 0 0` }}>
          {clarifyOptionsFor(turn.language).map((opt) => (
            <button
              key={opt.nextTurnId}
              type="button"
              className="lokai-pressable"
              onClick={() => onClarifyAnswer(opt)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', minHeight: M.tap, padding: `0 ${S[3]}`,
                ...typeStyle('small'), fontWeight: 500,
                color: T.anchor, background: 'transparent',
                borderBottom: `1px solid ${C.border}`, cursor: 'pointer',
              }}
            >
              {opt.label}
              <span style={{ color: 'var(--role-ink-faint)' }} aria-hidden>→</span>
            </button>
          ))}
        </div>
      )}

      {/* Stops name the person (P1-4): every stop turn carries its real,
          free channels between the refusal and the actions.

          L7 + L1: this was a `<Label>` caps heading inside a `C.surface2`
          bordered box — a card inside the stop card, with a second all-caps
          shout. The stop article already carries the surface, so the channels
          are just rows separated by a rule; the label drops to sentence case
          and stops competing with the refusal above it. */}
      {isStop && stopChannels.length > 0 && (
        <div style={{
          margin: `${S[2]} 0 0`,
          display: 'flex', flexDirection: 'column', gap: S[2],
        }}>
          <Rule />
          <Text role="captionStrong" tone="quiet" measured={false}>{chrome.channelLabel}</Text>
          {stopChannels.map((ch) => (
            <div key={ch.label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ ...typeStyle('small'), fontWeight: 600, color: C.ink }}>{ch.label}</span>
              <span style={{ ...typeStyle('caption'), color: C.inkSoft }}>{ch.detail}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ padding: isStop ? `${S[3]} 0 0` : `0 0 ${S[2]}` }}>
        {receiptForTurn && (
          <GateTrail
            receipt={receiptForTurn}
            language={turn.language}
            /* No ledger here. The grounding line at the head of this turn
               already says "4 of 5 sourced"; the gate trail's job is to name
               which gates RAN. Passing the count again printed the same
               sentence twice in one turn — the exact L7 duplication this pass
               exists to remove. */
            onOpen={() => setWhyOpen((v) => !v)}
          />
        )}
        <TurnCitations turn={turn} onOpenSource={onOpenSource} />
        <VerificationTrace turn={turn} />
        {receiptForTurn && (
          <DecisionReceiptView
            receipt={receiptForTurn}
            open={whyOpen}
            onToggle={() => setWhyOpen((v) => !v)}
            onOpenRef={onOpenRef}
            language={turn.language}
          />
        )}
        <TurnActions
          primaryFirst={craft.primaryFirst}
          onCopy={() => {
            void navigator.clipboard?.writeText(copyText).catch(() => {});
            onCopy?.();
          }}
          onSpeak={onSpeak}
          onFlag={() => {
            /* The correction channel (behavioral audit §33): a flagged answer
               lands in the live audit trail, so the case history records that
               the user pushed back — the same record a reviewer or a lawyer
               would read. Nothing leaves the device. */
            onFlagAnswer?.(turn);
          }}
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
  onStop,
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
  /** While LokAI is working, the send slot becomes a Stop control that skips
   *  the staged beat. The working state belongs on the one surface that is
   *  always on screen — not only on a capsule further up the scroll. */
  onStop?: () => void;
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
  /* A disabled composer here means an in-flight turn: that is the working
     state, and it is now visible on the composer itself. */
  const isWorking = voice.isBusy || !!disabled;
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

  /* P4 ask-first classification (mirrors decision/engine markers; the engine
     remains the router — this is the pre-send echo, never a decision). */
  const [armed, setArmed] = useState(false);
  const echo = useMemo(() => {
    const t = value.trim().toLowerCase();
    if (!t) return null;
    if (/criminal|fraud|police complaint|accus|fir\b/.test(t))
      return { label: 'Understood as: outside supported examples — criminal matters', ambiguous: true };
    if (/6 lakh|business loss|deadline tomorrow|urgent/.test(t))
      return { label: 'Understood as: high-stakes — will stop and point to a human', ambiguous: true };
    if (/seller says|seller said|they say|they said|i disagree|but the seller/.test(t))
      return { label: 'Understood as: contested record — will not draft from it', ambiguous: false };
    if (/mixer|damaged|refund|seller refused|defective|replacement|purchase date|when did you buy/.test(t))
      return { label: 'Understood as: consumer refund ✓', ambiguous: false };
    if (/notice|property tax|bmc|interpret/.test(t))
      return { label: 'Understood as: notice reading ✓', ambiguous: false };
    if (/weather|cricket|movie|recipe|stock|bitcoin|javascript|hotel/.test(t))
      return { label: 'Understood as: outside prepared examples', ambiguous: true };
    return { label: 'Outside prepared examples — will stop with options', ambiguous: true };
  }, [value]);
  useEffect(() => { setArmed(false); }, [value]);

  const submit = () => {
    if (!canSend) return;
    /* P4 ask-first (D8): ambiguous input arms first, sends on confirm.
       Clear intents pass through with a silent echo; criminal/high-risk/
       off-example input requires an explicit second tap — inline morph,
       never a modal. Chips bypass (they call onSubmit directly). */
    if (echo && echo.ambiguous && !armed) {
      setArmed(true);
      return;
    }
    onSubmit(value.trim());
    setValue('');
    setArmed(false);
  };

  return (
    <div>
      {/* P4 ask-first echo strip: what the engine understood, before sending. */}
      {echo && value.trim() && (
        <div
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 6,
            ...typeStyle('caption'),
            color: echo.ambiguous ? T.flag : T.inkFaint,
          }}
        >
          <span aria-hidden>{echo.ambiguous ? '!' : '✓'}</span>
          <span>{echo.label}{echo.ambiguous && !armed ? ' — tap send again to confirm' : ''}</span>
        </div>
      )}
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
          padding: `${S[2]} ${S[3]}`,
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
        className={`lokai-composer-shell lokai-composer-floating${isWorking ? ' lokai-composer-working' : ''}`}
        onClick={() => {
          if (!disabled && !voice.isBusy) textareaRef.current?.focus();
        }}
        style={{
          display: 'flex',
          alignItems: compact ? 'center' : 'flex-end',
          gap: 6,
          borderRadius: compact ? LAYOUT.radius.pill : LAYOUT.radius.plane,
          /* Was 5px 8px / 10px 14px — off the 4pt ladder. The round 44px
             buttons set the pill's rhythm, so the horizontal step lands on
             S[2] rather than 14px. */
          padding: compact ? `${S[1]} ${S[2]}` : `${S[3]} ${S[4]}`,
          /* The sweep is a composited gradient on a fixed element, so it never
             trips the mobile GPU-repaint guardrail that bans backdrop-filter
             on scrolling content. Under reduced motion the global block stills
             the keyframe and the composer simply reads as dimmed. */
          opacity: isWorking ? 0.94 : 1,
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
              width: 44,
              height: 44,
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
              width: 44,
              height: 44,
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
            /* input role = 1rem, the iOS anti-zoom floor (P1/P4 craft debt).
               body is prose at 15px; an INPUT at 15px still focus-zooms. */
            fontSize: TYPE.input.size,
            lineHeight: 1.45,
            background: 'transparent',
            color: C.ink,
          }}
        />
        <button
          type="button"
          disabled={isWorking ? !onStop : !canSend}
          aria-label={
            isWorking && onStop
              ? 'Stop — skip the rest of the wait'
              : isWorking
                ? 'Working'
                : echo && echo.ambiguous && !armed && value.trim() ? 'Confirm send' : 'Send'
          }
          title={isWorking && onStop ? 'Skip the rest of the wait' : echo && echo.ambiguous && !armed && value.trim() ? 'Confirm send' : undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (isWorking && onStop) {
              onStop();
              return;
            }
            submit();
          }}
          className={canSend || (isWorking && onStop) ? 'lokai-pressable' : undefined}
          style={{
            width: 44,
            height: 44,
            borderRadius: LAYOUT.radius.full,
            border: 'none',
            background: isWorking && onStop ? T.anchor : canSend ? T.anchor : T.sunken,
            color: isWorking && onStop ? T.onAnchor : canSend ? T.onAnchor : T.inkFaint,
            cursor: canSend || (isWorking && onStop) ? 'pointer' : 'default',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            transition: `background ${MOTION.press} ${MOTION.ease}, transform ${MOTION.press} ${MOTION.ease}`,
            boxShadow: canSend || (isWorking && onStop) ? SHADOW.sm : 'none',
          }}
        >
          {voice.isBusy ? <BusyDots light />
            : isWorking && onStop ? <StopGlyph />
            : <SendGlyph size={compact ? 17 : 19} />}
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
              padding: `0 ${S[4]}`,
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



