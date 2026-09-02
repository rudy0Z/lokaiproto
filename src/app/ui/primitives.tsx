/**
 * LokAI primitives — LAYER 2 of the design system.
 *
 * The rule this layer exists to enforce: **a screen file never writes
 * `fontFamily`, `fontSize`, `lineHeight`, `color`, or `borderRadius`.** It
 * picks a role and the role knows what it looks like.
 *
 * Before this layer, `LokAIWorkflow.tsx` carried 172 inline style objects and
 * 37 hand-written `lineHeight` values, and the app held 215 raw hex literals.
 * That is not a discipline problem — it is what happens when the only way to
 * render a sentence is to describe it from scratch. Both a human and a model
 * drift the same way, and drift lands wherever the build guard is not looking.
 *
 * Every component here is theme-safe (roles from `T`, never literals) and
 * script-safe (leading and family resolved from the active language). Those
 * two properties are the whole point: they are the two things that were
 * silently wrong on the flagship screens because there was nowhere to put them.
 */

import React, { createContext, useContext, useEffect } from 'react';
import { C, LAYOUT, MOTION, S, SANS, MONO, TYPE, typeStyle, useLokaiSharedStyles } from '../components/shared';
import { T, M, ROLE_TYPE, type TextRole } from './theme';
import { scriptProps, scriptOf, useUiLanguage } from './script';

/* ───────────────────────────────────────────────────────────────────────────
 * Screen tone — how the whole surface is lit
 *
 * A stop state is not "a dark card on a cream page". It is the page going
 * dark (L6/L8). That only works if the chrome knows: today the failure state
 * renders inside `.mobile-case-scroll` with the status bar, top nav, header
 * and cream ground all still lit around it — a dark card in a light sandwich.
 *
 * `<Screen tone="stop">` publishes the tone here; `Text`, `Rule`, `Button`
 * and the mobile chrome read it and invert themselves. No call site passes a
 * `light` prop down a tree. That is the structural fix, not a restyle.
 * ─────────────────────────────────────────────────────────────────────────── */

export type ScreenTone = 'paper' | 'stop';

const ToneContext = createContext<ScreenTone>('paper');

export const ToneProvider = ToneContext.Provider;

export function useTone(): ScreenTone {
  return useContext(ToneContext);
}

/** Ink roles resolved for the current tone. */
export function useInk() {
  const tone = useTone();
  return tone === 'stop'
    ? { primary: T.stopInk, quiet: T.stopInkQuiet, faint: T.stopInkQuiet, hairline: T.stopHairline }
    : { primary: T.ink, quiet: T.inkQuiet, faint: T.inkFaint, hairline: T.hairline };
}

/* ───────────────────────────────────────────────────────────────────────────
 * Text — the workhorse
 * ─────────────────────────────────────────────────────────────────────────── */

export type TextTone = 'default' | 'quiet' | 'faint' | 'anchor' | 'flag' | 'attest' | 'ok' | 'halt';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** What this text is FOR. See ROLE_TYPE in theme.ts for the ladder. */
  role?: TextRole;
  tone?: TextTone;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'li' | 'label' | 'legend';
  /** Constrain to the reading measure (55ch). Default on for `answer`/`body`. */
  measured?: boolean;
  /** Tabular figures — amounts, deadlines, claim counts, reference numbers. */
  numeric?: boolean;
  /** Override the active UI language for this element (specimens, side-by-side
   *  original-vs-translation views where two scripts sit on one screen). */
  lang?: string;
  children?: React.ReactNode;
}

const SERIF_ROLES = new Set<TextRole>(['pronounce', 'answer']);
const MEASURED_BY_DEFAULT = new Set<TextRole>(['pronounce', 'answer', 'body', 'bodyStrong', 'lead']);

function toneColor(tone: TextTone, ink: ReturnType<typeof useInk>): string {
  switch (tone) {
    case 'quiet':  return ink.quiet;
    case 'faint':  return ink.faint;
    case 'anchor': return T.anchor;
    case 'flag':   return T.flag;
    case 'attest': return T.attest;
    case 'ok':     return T.ok;
    case 'halt':   return T.halt;
    default:       return ink.primary;
  }
}

export function Text({
  role = 'body',
  tone = 'default',
  as = 'p',
  measured,
  numeric = false,
  lang,
  style,
  children,
  ...rest
}: TextProps) {
  const ink = useInk();
  const activeLang = useUiLanguage();
  const useLang = lang ?? activeLang;
  const script = scriptOf(useLang);
  const wantsSerif = SERIF_ROLES.has(role);
  const sp = scriptProps(useLang, { serif: wantsSerif });

  /* Decision 1 in script.ts: the display register has no Indic serif. Indic
     scripts hold it with weight instead — 500 against Fraunces' 400. Without
     this the serif roles simply look like body copy in Hindi and Tamil, and
     the "the serif IS the label" rule (L4) quietly stops being true. */
  const displayWeight = wantsSerif && script !== 'latin' ? { fontWeight: 500 } : {};

  const wantsMeasure = measured ?? MEASURED_BY_DEFAULT.has(role);

  return React.createElement(
    as,
    {
      ...rest,
      ...(sp.lang ? { lang: sp.lang } : {}),
      style: {
        ...typeStyle(ROLE_TYPE[role]),
        color: toneColor(tone, ink),
        margin: 0,
        ...(wantsMeasure ? { maxWidth: M.measure } : {}),
        ...(numeric ? { fontVariantNumeric: 'tabular-nums' } : {}),
        ...sp.style,
        ...displayWeight,
        ...style,
      },
    },
    children,
  );
}

/**
 * The one caps eyebrow a screen is allowed (L7).
 *
 * If you are writing a second `<Label>` on the same screen, the screen has
 * two ideas and needs to be two screens, or the second label is restating
 * something the content already says. Both were true across this app: the
 * `CURRENT STEP` card restated the header, and the verify screen ran two
 * progress readouts back to back.
 */
export function Label({ children, style, ...rest }: Omit<TextProps, 'role'>) {
  return (
    <Text role="label" tone="faint" as="p" measured={false} style={style} {...rest}>
      {children}
    </Text>
  );
}

/**
 * A number that carries legal weight — an amount, a deadline, a section
 * reference, a claim count.
 *
 * Always mono, always tabular, always ink-strong. A column of ₹ figures that
 * does not align is the detail that separates a designed legal tool from a
 * generated one, and it costs nothing.
 */
export function Amount({
  children,
  tone = 'default',
  style,
  ...rest
}: { children: React.ReactNode; tone?: TextTone; style?: React.CSSProperties } & React.HTMLAttributes<HTMLSpanElement>) {
  const ink = useInk();
  return (
    <span
      {...rest}
      style={{
        fontFamily: MONO,
        fontSize: TYPE.bodyStrong.size,
        fontWeight: 500,
        lineHeight: TYPE.bodyStrong.lineHeight,
        fontVariantNumeric: 'tabular-nums',
        color: toneColor(tone, ink),
        letterSpacing: '-0.01em',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * Button
 *
 * Three variants, and the constraint is the design:
 *   primary — anchored, filled, ONE per screen (L5)
 *   quiet   — the second action, always a text link, never an outlined twin
 *   danger  — destructive confirmations only
 *
 * There is deliberately no "secondary outlined button". Two same-shaped
 * buttons side by side is the pattern that makes a screen look like a form
 * wizard, and it is what made "Continue" as loud as "Find legal aid" on the
 * high-risk stop state.
 * ─────────────────────────────────────────────────────────────────────────── */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'quiet' | 'danger';
  /** `cta` is the 50px full-width primary. `md` is an inline control. */
  size?: 'cta' | 'md' | 'sm';
  icon?: React.ReactNode;
  /** Icon after the label instead of before — for forward motion. */
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'cta',
  icon,
  iconAfter,
  disabled,
  style,
  children,
  ...rest
}: ButtonProps) {
  useLokaiSharedStyles();
  const tone = useTone();
  const ink = useInk();
  const onStop = tone === 'stop';

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S[2],
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    fontFamily: SANS,
    lineHeight: 1.3,
    transition: `background ${MOTION.press} ${MOTION.ease}, color ${MOTION.press} ${MOTION.ease}, opacity ${MOTION.press} ${MOTION.ease}`,
  };

  const sizing: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
    cta: {
      width: '100%',
      minHeight: M.ctaHeight,
      padding: `0 ${S[5]}`,
      fontSize: TYPE.h4.size,
      fontWeight: 600,
      borderRadius: LAYOUT.radius.control,
    },
    md: {
      minHeight: M.tap,
      padding: `0 ${S[4]}`,
      fontSize: TYPE.body.size,
      fontWeight: 600,
      borderRadius: LAYOUT.radius.control,
    },
    sm: {
      minHeight: M.tap,
      padding: `0 ${S[2]}`,
      fontSize: TYPE.body.size,
      fontWeight: 600,
      borderRadius: LAYOUT.radius.sm,
      background: 'none',
    },
  };

  /* On a stop ground the anchor colour IS the ground, so a navy fill would
     vanish. The safe action inverts to the warm ink instead — which also
     makes it the brightest thing on the screen, exactly as L6 requires. */
  const variants: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
    primary: onStop
      ? { background: T.stopInk, color: T.stopGround }
      : { background: T.anchor, color: T.onAnchor },
    quiet: {
      background: 'none',
      color: onStop ? T.stopInkQuiet : T.anchor,
      minHeight: M.tap,
      padding: `0 ${S[1]}`,
      fontWeight: 500,
      textDecoration: 'underline',
      textUnderlineOffset: '3px',
      textDecorationThickness: '1px',
      textDecorationColor: onStop ? T.stopHairline : T.hairlineFirm,
    },
    danger: { background: 'none', color: T.halt, fontWeight: 600 },
  };

  const disabledStyle: React.CSSProperties = disabled
    ? { background: variant === 'primary' ? T.hairline : 'none', color: ink.faint, cursor: 'not-allowed' }
    : {};

  return (
    <button
      {...rest}
      disabled={disabled}
      className={`lokai-pressable ${rest.className ?? ''}`}
      style={{ ...base, ...sizing[size], ...variants[variant], ...disabledStyle, ...style }}
    >
      {icon}
      {children}
      {iconAfter}
    </button>
  );
}

/** A tap target that is only an icon. Always ≥44px, always labelled. */
export function IconButton({
  label,
  children,
  style,
  ...rest
}: { label: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  useLokaiSharedStyles();
  const ink = useInk();
  return (
    <button
      {...rest}
      aria-label={label}
      className={`lokai-pressable ${rest.className ?? ''}`}
      style={{
        width: M.tap,
        height: M.tap,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        borderRadius: LAYOUT.radius.sm,
        color: ink.quiet,
        cursor: 'pointer',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * Badge — state, not decoration
 *
 * A badge means the thing it sits on is in an exceptional state. `neutral`
 * exists for identity (a document type, a language) — everything else marks
 * an exception, and exceptions must be rare enough to still read as one.
 * ─────────────────────────────────────────────────────────────────────────── */

export function Badge({
  tone = 'neutral',
  children,
  style,
}: {
  tone?: 'neutral' | 'flag' | 'ok' | 'halt' | 'attest';
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const map = {
    neutral: { fill: T.anchorTint, ink: T.anchor },
    flag:    { fill: T.flagFill,   ink: T.flag },
    ok:      { fill: T.okFill,     ink: T.ok },
    halt:    { fill: T.haltFill,   ink: T.halt },
    attest:  { fill: T.attestFill, ink: T.attest },
  }[tone];

  return (
    <span
      style={{
        ...typeStyle('micro', { letterSpacing: '0.06em' }),
        display: 'inline-flex',
        alignItems: 'center',
        gap: S[1],
        background: map.fill,
        color: map.ink,
        /* No border. A fill and a label is enough to mark an exception;
           adding a 1px outline is the reflex that turns every state into a
           box and is why the fact rows read as a KYC form. */
        borderRadius: LAYOUT.radius.sm,
        padding: `3px ${S[2]}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * Field — text input
 *
 * rem-sized, not px. `Btn`/`InputField` in shared.tsx hardcode 13/14/15px,
 * which silently opted every control out of the Dynamic Type work Phase 1
 * did — the type scale scaled with the OS setting and the things the user
 * actually types into did not.
 * ─────────────────────────────────────────────────────────────────────────── */

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Field({ invalid = false, style, ...rest }: FieldProps) {
  useLokaiSharedStyles();
  const activeLang = useUiLanguage();
  const sp = scriptProps(activeLang);
  return (
    <input
      {...rest}
      {...(sp.lang ? { lang: sp.lang } : {})}
      className={`lokai-input-field ${rest.className ?? ''}`}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        minHeight: M.tap,
        fontFamily: SANS,
        fontSize: TYPE.h4.size,
        color: T.ink,
        padding: `${S[3]} ${S[4]}`,
        background: rest.disabled ? T.sunken : T.raised,
        border: `1.5px solid ${invalid ? T.halt : T.hairline}`,
        borderRadius: LAYOUT.radius.control,
        outline: 'none',
        ...sp.style,
        ...style,
      }}
    />
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * Icons
 *
 * One library: **Phosphor** (`@phosphor-icons/react`), replacing Lucide.
 * Lucide is a Feather fork and is the default AI-generated icon set — a
 * recognizable generic tell. Phosphor is a refined, distinctive family with
 * real weights; at `regular` it reads calm and editorial, which suits a legal
 * tool. Import icons from '@phosphor-icons/react'; pass `size` and
 * `weight={ICON_WEIGHT}` (Phosphor uses a weight, not a strokeWidth).
 *
 * Use these sizes so an icon never competes with the type beside it.
 * ─────────────────────────────────────────────────────────────────────────── */

export const ICON = {
  /** Inline with caption/label text. */
  inline: 14,
  /** Inline with body text, and inside buttons. */
  ui: 16,
  /** A list row's leading glyph. */
  row: 18,
  /** The one icon a state screen gets. */
  feature: 24,
} as const;

/** Phosphor weight — the calm default across the app. */
export const ICON_WEIGHT = 'regular' as const;

/** @deprecated Lucide-era strokeWidth. Phosphor uses ICON_WEIGHT. Kept only for
 *  the not-yet-migrated legacy screens that still import Lucide. */
export const ICON_STROKE = 1.75;

/* ───────────────────────────────────────────────────────────────────────────
 * Focus ring
 *
 * `:focus-visible` in index.css handles keyboard focus globally. This is for
 * the rare component that draws its own (a custom-composited control).
 * ─────────────────────────────────────────────────────────────────────────── */

export const FOCUS_RING: React.CSSProperties = {
  outline: `2px solid ${T.focus}`,
  outlineOffset: '2px',
};

/**
 * One-time registration so a screen file can assert it never writes raw
 * colour. Dev-only; compiles away to nothing in production.
 */
export function useSystemStyles() {
  useLokaiSharedStyles();
  useEffect(() => {
    if (import.meta.env?.DEV && typeof document !== 'undefined') {
      document.documentElement.dataset.lokaiUi = 'v1';
    }
  }, []);
}

/** Re-exported so a screen needs exactly one import line for the system. */
export { C, S, LAYOUT, MOTION, TYPE, typeStyle };
