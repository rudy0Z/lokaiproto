import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

// ─── Font constants ───────────────────────────────────────────────────────────
export const EDITORIAL = '"Fraunces", Georgia, serif';
export const SANS = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", monospace';
export const DEVANAGARI = '"Noto Sans Devanagari", "Inter", sans-serif';
export const TAMIL = '"Noto Sans Tamil", "Inter", sans-serif';
/* No BENGALI const — the face is not loaded in fonts.css, so declaring it
   would promise a script the app cannot actually render. Bengali is listed
   in LANGUAGE_REGISTRY as `prepared: false` instead. Add the const and the
   fonts.css import together, or not at all. */

// Backwards compatibility for now (Step 1)
export const SERIF = EDITORIAL;

/**
 * Type scale — rem, not px.
 *
 * px sizes ignore the OS/browser text-size setting completely. For this
 * product's users — often older, lower-confidence, reading outdoors under
 * stress — that was the single biggest accessibility failure in the app,
 * outranking every color issue. rem scales with the user's own setting.
 *
 * Tracking and leading stay size-specific (tighter/negative as size grows,
 * looser as it shrinks); those are unitless or em-relative so they scale
 * correctly. Do not flatten them to one value.
 *
 * Floor raised 10px → 12px. label / micro / caption now share 0.75rem and
 * differentiate by weight, tracking, and transform rather than by size.
 */
export const TYPE = {
  // Display — editorial (Fraunces) only. Latin-only by design; Indic scripts
  // lead with SANS at raised size/weight (Fraunces has no Devanagari/Tamil).
  display1:    { family: EDITORIAL, size: '3.5rem',    weight: 300, lineHeight: 1.05, letterSpacing: '-0.02em' },
  display2:    { family: EDITORIAL, size: '2.25rem',   weight: 300, lineHeight: 1.1,  letterSpacing: '-0.015em' },
  editorial:   { family: EDITORIAL, size: '1.75rem',   weight: 400, lineHeight: 1.2,  letterSpacing: '-0.01em' },
  editorialSm: { family: EDITORIAL, size: '1.375rem',  weight: 400, lineHeight: 1.25, letterSpacing: '-0.01em' },
  // UI hierarchy — Inter. One size = one role. Do not invent px at call sites.
  h3:          { family: SANS, size: '1.25rem',   weight: 600, lineHeight: 1.3,  letterSpacing: '-0.01em' },
  lead:        { family: SANS, size: '1.125rem',  weight: 500, lineHeight: 1.35 },
  h4:          { family: SANS, size: '1rem',      weight: 600, lineHeight: 1.4  },
  title:       { family: SANS, size: '0.9375rem', weight: 600, lineHeight: 1.4  },
  body:        { family: SANS, size: '0.875rem',  weight: 400, lineHeight: 1.55 },
  bodyStrong:  { family: SANS, size: '0.875rem',  weight: 500, lineHeight: 1.55 },
  small:       { family: SANS, size: '0.8125rem', weight: 400, lineHeight: 1.5  },
  caption:     { family: SANS, size: '0.75rem',   weight: 400, lineHeight: 1.45 },
  captionStrong:{ family: SANS, size: '0.75rem',  weight: 600, lineHeight: 1.45 },
  micro:       { family: SANS, size: '0.75rem', weight: 500, lineHeight: 1.3, letterSpacing: '0.08em', textTransform: 'uppercase' as const },
  label:       { family: SANS, size: '0.75rem', weight: 600, lineHeight: 1.3, letterSpacing: '0.09em', textTransform: 'uppercase' as const },
} as const;

export type TypeRole = keyof typeof TYPE;

/** Spread into a style object. Prefer this over bare fontSize. */
export function typeStyle(
  role: TypeRole,
  overrides: React.CSSProperties = {},
): React.CSSProperties {
  const t = TYPE[role];
  return {
    fontFamily: t.family,
    fontSize: t.size,
    fontWeight: t.weight,
    lineHeight: t.lineHeight,
    ...('letterSpacing' in t && t.letterSpacing ? { letterSpacing: t.letterSpacing } : {}),
    ...('textTransform' in t && t.textTransform ? { textTransform: t.textTransform } : {}),
    ...overrides,
  };
}

// ─── Color system (mirrors CSS tokens in src/styles/index.css) ────────────────
export const C = {
  // Canvas
  bg:           '#F8F5EE',
  surface:      '#FFFFFF',
  surface2:     '#FBF8F1',
  washBlue:     '#DDE7FF',
  washGold:     '#FFE3B8',
  washRose:     '#F5D8D4',
  // Ink
  ink:          '#181713',
  inkSoft:      '#48453D',
  /* Was #858078 (3.60:1 on canvas — failed AA at ~160 call sites across 20
     files). Restored to the DTCG step: 5.40:1 canvas / 5.88:1 white. */
  muted:        '#68645D',
  // Structure
  border:       '#E7E0D4',
  borderStrong: '#CFC5B6',
  // Brand
  navy:         '#102A4C',
  saffron:      '#E9852B',
  oxblood:      '#6B1F1F',
  // Semantic
  green:        '#1F6B3A',
  red:          '#B8361C',
  amber:        '#8A4500',
  // Derived / soft fills
  bgRaised:     '#FBF8F1',
  navyDark:     '#0B1E37',
  navySoft:     'rgba(16,42,76,0.08)',
  saffronDark:  '#C86712',
  /* The only saffron legal on a focus ring or any UI boundary:
     3.83:1 on canvas / 4.17:1 on white, clearing WCAG 2.2 1.4.11's 3:1.
     Plain `saffron` is 2.46:1 and must never carry accessibility meaning. */
  saffronAccessible: '#CC5A10',
  saffronSoft:  'rgba(233,133,43,0.10)',
  terracotta:   '#A94F2D',
  oxbloodSoft:  'rgba(107,31,31,0.08)',
  onDark:       '#FFFFFF',
  onDarkSoft:   'rgba(255,255,255,0.65)',
  borderLight:  '#E7E0D4',
  borderFocus:  '#102A4C',
  rule:         '#E7E0D4',
  successSoft:  'rgba(31,107,58,0.08)',
  cautionSoft:  'rgba(138,69,0,0.08)',
  errorSoft:    'rgba(184,54,28,0.08)',
  badgeBg:      'rgba(16,42,76,0.08)',
  badgeText:    '#102A4C',
  badgeBorder:  '#CFC5B6',
  // Legacy aliases (same values — keep call sites compiling)
  teal:         '#102A4C',
  oxbloodDark:  '#6B1F1F',
  text:         '#181713',
  textSoft:     '#48453D',
  textDisabled: '#68645D',
} as const;

export const MOTION = {
  micro: '120ms',
  state: '220ms',
  dialog: '280ms',
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** Named recipes — same ladder, clearer call-site intent */
  press: '120ms',
  expand: '220ms',
  confirm: '180ms',
  status: '220ms',
} as const;

/** Composer autosize clamp — Prompt Kit / AI Elements behavior, LokAI tokens */
export const COMPOSER = {
  maxHeight: 240,
  maxHeightCompact: 120,
  minRows: 1,
} as const;

// ─── Spacing & Layout System ──────────────────────────────────────────────────
export const S = {
  0:   '0',
  1:   '4px',
  2:   '8px',
  3:   '12px',
  4:   '16px',
  5:   '24px',
  6:   '32px',
  7:   '48px',
  8:   '64px',
  9:   '96px',
  10:  '128px',
} as const;

export const LAYOUT = {
  maxContent:   '1120px',
  maxReading:   '720px',
  maxChat:      '600px',
  maxComposer:  '740px',
  sidebarOpen:  '240px',
  sidebarShut:  '64px',
  headerH:      '56px',
  composerH:    '88px',
  touchTarget:  '44px',
  sectionGapY:  S[9],
  sectionPadX:  S[7],
  cardGap:      S[4],
  /**
   * Role radius — never invent px at call sites.
   * none → hairline corners | xs → tiny chips | sm → badges
   * control → buttons/inputs | panel → nested cards/list rows
   * card → primary content cards | turn → AI Turn only
   * plane → composers/hero | pill → full pills
   */
  radius: {
    none:    '0',
    xs:      '4px',
    sm:      '6px',
    control: '10px',
    panel:   '12px',
    card:    '16px',
    turn:    '18px',
    plane:   '22px',
    pill:    '999px',
    full:    '50%', // avatars, orbs, dots — true circles
    // Legacy aliases (same values) — prefer role names above
    md: '10px',
    lg: '16px',
    xl: '18px',
  },
} as const;

export type RadiusRole = keyof typeof LAYOUT.radius;

// ─── Gradient & Wash System ───────────────────────────────────────────────────
export const GRAD = {
  heroCanvas: [
    'radial-gradient(ellipse 68% 54% at 50% 18%, rgba(221,231,255,0.90) 0%, rgba(221,231,255,0.38) 35%, transparent 68%)',
    'radial-gradient(ellipse 58% 44% at 46% 72%, rgba(255,179,80,0.36) 0%, rgba(255,227,184,0.20) 46%, transparent 74%)',
    'radial-gradient(ellipse 50% 38% at 68% 68%, rgba(245,216,212,0.30) 0%, transparent 70%)',
    'linear-gradient(180deg, #FFFDFC 0%, #F8F5EE 100%)',
  ].join(', '),
  /**
   * Reading surfaces — flat warm paper.
   *
   * Was three stacked radial washes (cool blue + hot saffron + rose) on
   * eight surfaces. Read as a tricolour glow rather than a material, and
   * fought the "chrome should recede" rule in .design-os/03-direction.md,
   * which explicitly rejects decorative gradients. Stamp-paper direction:
   * the page is paper, not a lit stage. Kept as a token (not deleted) so
   * every call site changes at once and nothing needs touching.
   */
  readingCanvas: 'linear-gradient(180deg, #FFFDFC 0%, #F8F5EE 100%)',
  cardLift: 'linear-gradient(174deg, #FFFFFF 0%, #FBF8F1 100%)',
  oxbloodStamp: 'linear-gradient(135deg, #7A2020 0%, #6B1F1F 100%)',

  /* `language` (saffron→navy, 90deg) removed — it was the tricolour drawn
     as a literal stripe. Do not reintroduce a two-pole brand gradient;
     if a spectrum is ever wanted it must be one hue interpolation used
     as state, never as chrome. */
  brand: 'linear-gradient(160deg, #12110E 0%, #102A4C 100%)',
  verdict: 'linear-gradient(180deg, #F6A13D 0%, #E9852B 100%)',
  buttonPrimary: 'linear-gradient(180deg, #183B6B 0%, #102A4C 100%)',
  buttonHover: 'linear-gradient(180deg, #234B7F 0%, #183B6B 100%)',
} as const;

/** Page-plane backgrounds — one composition language across Home and workspace */
export const PLANE = {
  hero: GRAD.heroCanvas,
  reading: GRAD.readingCanvas,
  flat: C.bg,
} as const;

export const WASH = {
  heroCanvas: GRAD.heroCanvas,
  cardLift: GRAD.cardLift,
  oxbloodStamp: GRAD.oxbloodStamp,
  sectionFade: `linear-gradient(to bottom, rgba(248,245,238,0) 0%, ${C.bg} 100%)`,
} as const;

// ─── Shadow System ────────────────────────────────────────────────────────────
export const SHADOW = {
  xs:    '0 1px 2px rgba(26,25,22,0.04)',
  sm:    '0 1px 2px rgba(26,25,22,0.035), 0 3px 10px rgba(26,25,22,0.045)',
  md:    '0 2px 5px rgba(26,25,22,0.04), 0 8px 24px rgba(26,25,22,0.065)',
  lg:    '0 14px 42px rgba(26,25,22,0.10), 0 3px 10px rgba(26,25,22,0.04)',
  float: '0 22px 60px rgba(26,25,22,0.13), 0 6px 18px rgba(26,25,22,0.07)',
  /** Specialty elevations — still tokens, never raw strings at call sites */
  inset: 'inset 0 1px 0 rgba(255,255,255,0.8)',
  insetSoft: 'inset 0 1px 0 rgba(255,255,255,0.7)',
  insetEdge: 'inset -1px 0 rgba(255,255,255,0.05)',
  navySoft: '0 4px 14px rgba(16,42,76,0.2)',
  navy: '0 4px 12px rgba(16,42,76,0.28)',
  overlay: '0 24px 72px rgba(11,30,55,0.24)',
} as const;

// ─── Badge style token ────────────────────────────────────────────────────────
export const BADGE: React.CSSProperties = {
  ...typeStyle('micro', { letterSpacing: '0.06em' }),
  color:       C.navy,
  background:  C.navySoft,
  border:      `1px solid ${C.borderStrong}`,
  borderRadius: LAYOUT.radius.sm,
  padding:     '3px 10px',
  display:     'inline-block',
  whiteSpace:  'nowrap',
};

// ─── Global animation keyframes (inject once) ─────────────────────────────────
const SHARED_ANIM_ID = 'lokai-shared-anim';
const SHARED_ANIM_CSS = `
@keyframes lokaiPulseRing {
  0%   { transform: scale(1);    opacity: 0.5; }
  100% { transform: scale(1.55); opacity: 0;   }
}
@keyframes lokaiBarBounce {
  0%, 100% { transform: scaleY(0.3); }
  50%       { transform: scaleY(1);   }
}
@keyframes lokaiSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes lokaiDot {
  0%, 70%, 100% { opacity: 0.2; transform: translateY(0);   }
  35%            { opacity: 1;   transform: translateY(-4px); }
}
.lokai-dot-1 { animation: lokaiDot 1.3s ease-in-out 0s    infinite; }
.lokai-dot-2 { animation: lokaiDot 1.3s ease-in-out 0.18s infinite; }
.lokai-dot-3 { animation: lokaiDot 1.3s ease-in-out 0.36s infinite; }
.lokai-btn-primary {
  background: ${C.navy};
  box-shadow: ${SHADOW.sm};
  transform: translateY(0);
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;
}
.lokai-btn-primary:hover:not(:disabled) {
  background: ${C.navyDark} !important;
  box-shadow: ${SHADOW.sm} !important;
}
.lokai-btn-primary:active:not(:disabled) {
  background: ${C.navyDark} !important;
  box-shadow: ${SHADOW.xs} !important;
}
.lokai-btn-secondary {
  background: transparent;
  border: 1.5px solid ${C.navy};
  transition: background 0.14s ease, border-color 0.14s ease;
}
.lokai-btn-secondary:hover:not(:disabled) {
  background: rgba(19,40,70,0.08) !important;
  border-color: ${C.navy} !important;
}
.lokai-btn-secondary:active:not(:disabled) {
  background: #DDE6F5 !important;
}
.lokai-btn-ghost {
  background: transparent;
  transition: background 0.12s ease;
}
.lokai-btn-ghost:hover:not(:disabled) {
  background: ${C.surface2} !important;
}
.lokai-btn-ghost:active:not(:disabled) {
  background: #EDEAE4 !important;
}
.lokai-btn-destructive {
  background: rgba(184,54,28,0.08);
  border: 1px solid #F0C0BC;
  transition: background 0.14s ease, border-color 0.14s ease;
}
.lokai-btn-destructive:hover:not(:disabled) {
  background: #FFE0DC !important;
  border-color: ${C.red} !important;
}
.lokai-input-field {
  background: #FFFFFF;
  border: 1.5px solid ${C.border};
  border-radius: ${LAYOUT.radius.md};
  box-shadow: ${SHADOW.md};
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.lokai-input-field:focus {
  border-color: ${C.navy} !important;
  box-shadow: 0 0 0 3px rgba(28,58,110,0.12) !important;
  outline: none;
}
.lokai-lang-chip {
  transition: background 0.14s ease, border-color 0.14s ease;
}
.lokai-lang-chip:hover:not(.selected) {
  background: ${C.surface2} !important;
}
.lokai-voice-orb:focus-visible {
  outline: 2px solid ${C.saffron};
  outline-offset: 3px;
}

/* Micro-craft: press / chip / composer.
   Hover-lift (translateY(-1px) + shadow bloom) removed — it is
   marketing-button physics inside a legal tool, and it is hover-triggered,
   so on touch it can visually stick after a tap. Feedback is now a surface
   change on press, which works identically on both pointer types. */
.lokai-pressable {
  transition:
    background ${MOTION.press} ${MOTION.ease},
    border-color ${MOTION.press} ${MOTION.ease},
    box-shadow ${MOTION.press} ${MOTION.ease};
}
.lokai-pressable:hover:not(:disabled) {
  background: ${C.surface2};
}
.lokai-pressable:active:not(:disabled) {
  background: #EDEAE4;
}
.lokai-chip {
  transition:
    background ${MOTION.press} ${MOTION.ease},
    border-color ${MOTION.press} ${MOTION.ease};
}
.lokai-chip:hover:not(:disabled) {
  background: ${C.navySoft} !important;
  border-color: ${C.navy} !important;
}
.lokai-chip:active:not(:disabled) {
  background: #DDE6F5 !important;
}
.lokai-composer-shell {
  cursor: text;
  transition:
    border-color ${MOTION.state} ${MOTION.ease},
    box-shadow ${MOTION.state} ${MOTION.ease};
}
.lokai-composer-shell:focus-within {
  border-color: ${C.borderFocus} !important;
  box-shadow: 0 0 0 3px rgba(16,42,76,0.12), ${SHADOW.sm} !important;
}
.lokai-disclose {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows ${MOTION.expand} ${MOTION.ease},
    opacity ${MOTION.expand} ${MOTION.ease};
}
.lokai-disclose.is-open {
  grid-template-rows: 1fr;
  opacity: 1;
}
.lokai-disclose > .lokai-disclose-inner {
  overflow: hidden;
  min-height: 0;
}
@media (prefers-reduced-motion: reduce) {
  /* Keep the colour/opacity transitions — they carry meaning and are not
     vestibular. Only the expanding-height animation is dropped. */
  .lokai-disclose {
    transition: opacity 150ms linear !important;
  }
}
`;

function injectSharedStyles() {
  if (typeof document !== 'undefined' && !document.getElementById(SHARED_ANIM_ID)) {
    const style = document.createElement('style');
    style.id = SHARED_ANIM_ID;
    style.textContent = SHARED_ANIM_CSS;
    document.head.appendChild(style);
  }
}

/** Call from surfaces that use lokai-chip / lokai-pressable / composer shell. */
export function useLokaiSharedStyles() {
  useEffect(() => { injectSharedStyles(); }, []);
}

// ─── Citation Stamp — the most important UI component ─────────────────────────
export function CitationStamp({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => { injectSharedStyles(); }, []);

  const handleCopy = () => {
    void navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), Number.parseInt(MOTION.confirm, 10) + 1200);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied citation' : `Copy citation ${text}`}
      className="lokai-pressable"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: GRAD.oxbloodStamp,
        color: '#FFFFFF',
        borderRadius: LAYOUT.radius.xs,
        border: 'none',
        padding: '3px 10px',
        fontFamily: MONO,
        fontSize: TYPE.label.size,
        fontWeight: 500,
        letterSpacing: '0.05em',
        cursor: 'pointer',
      }}
    >
      <span style={{
        width: 5, height: 5, borderRadius: LAYOUT.radius.full,
        background: copied ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
        flexShrink: 0,
        transition: `background ${MOTION.confirm} ${MOTION.ease}`,
      }} />
      {copied ? 'Copied' : text}
    </button>
  );
}

// ─── Logo Mark — "L" in a circle ──────────────────────────────────────────────
export function LogoMark({ size = 34, light = false }: { size?: number; light?: boolean }) {
  const borderColor = light ? 'rgba(255,255,255,0.64)' : C.navy;
  const textColor   = light ? '#FFFFFF' : C.navy;
  const floretSize = Math.round(size * 0.58);
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      border: `1.5px solid ${borderColor}`,
      background: light ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.36)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: light ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : '0 1px 2px rgba(16,42,76,0.08)',
    }}>
      <svg
        width={floretSize}
        height={floretSize}
        viewBox="58 6 36 40"
        fill="none"
        style={{ flexShrink: 0, color: textColor }}
      >
        <path d="M76 8C82 17 82 35 76 44C70 35 70 17 76 8Z" stroke="currentColor" strokeWidth="2.0" />
        <path d="M59 26C65 18 87 18 93 26C87 34 65 34 59 26Z" stroke="currentColor" strokeWidth="2.0" />
        <circle cx="76" cy="26" r="3.2" fill="currentColor" opacity={0.65} />
      </svg>
    </div>
  );
}

// ─── Wordmark ─────────────────────────────────────────────────────────────────
export function Wordmark({ size = 22, color = C.ink }: { size?: number; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0px', lineHeight: 1 }}>
      <span style={{ fontFamily: EDITORIAL, fontSize: `${size}px`, fontWeight: 400, color, letterSpacing: '-0.3px' }}>
        Lok
      </span>
      <span style={{ fontFamily: SANS, fontSize: `${Math.round(size * 0.82)}px`, fontWeight: 600, color, letterSpacing: '0.02em' }}>
        AI
      </span>
    </span>
  );
}

export function BrandLogo({ size = 36, light = false }: { size?: number; light?: boolean }) {
  const wordSize = Math.round(size * 0.62);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${Math.max(9, Math.round(size * 0.28))}px` }}>
      <LogoMark size={size} light={light} />
      <Wordmark size={wordSize} color={light ? '#FFFFFF' : C.ink} />
    </div>
  );
}

// ─── Full Logo (mark + wordmark) ──────────────────────────────────────────────
export function Logo({ size = 40, light = false }: { size?: number; light?: boolean }) {
  return <BrandLogo size={size} light={light} />;
}

// ─── Voice Orb — full 4-state component ──────────────────────────────────────
export type VoiceOrbState = 'idle' | 'listening' | 'processing' | 'error';

export function VoiceOrb({
  size  = 52,
  state = 'idle',
  onClick,
}: {
  size?:    number;
  state?:   VoiceOrbState;
  onClick?: () => void;
}) {
  useEffect(() => { injectSharedStyles(); }, []);
  const iconSize = Math.round(size * 0.38);
  const buttonReset: React.CSSProperties = {
    appearance: 'none',
    padding: 0,
    font: 'inherit',
  };
  const voiceLabel = state === 'listening'
    ? 'Stop voice input'
    : state === 'processing'
      ? 'Voice input is processing'
      : state === 'error'
        ? 'Retry voice input'
        : 'Start voice input';

  const MicIcon = () => (
    <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none" style={{ position: 'relative', zIndex: 1 }}>
      <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5"
        stroke={state === 'idle' ? C.muted : '#FFFFFF'} strokeWidth="1.1" />
      <path d="M3 8.5C3 11.3 5.2 13.5 8 13.5C10.8 13.5 13 11.3 13 8.5"
        stroke={state === 'idle' ? C.muted : '#FFFFFF'} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="8" y1="13.5" x2="8" y2="15.5"
        stroke={state === 'idle' ? C.muted : '#FFFFFF'} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );

  /*
   * One persistent button across all four states.
   *
   * Each state used to be its own early-return with a different JSX shape
   * (bare <button> vs. <div>-wrapped), so React tore down and rebuilt the
   * DOM on every change and the orb snapped between states. For a legal
   * product, speaking to it is the single most "alive" moment in the app;
   * it should not flicker.
   *
   * The surface now animates (background, border) while the state-specific
   * decorations — pulse ring, rotating arc, level bars — mount and unmount
   * through AnimatePresence. The ambient loops themselves stay as plain
   * CSS keyframes: they are non-interruptible atmosphere, not gesture
   * response, so they gain nothing from springs.
   */
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const isError = state === 'error';

  const surface = isListening
    ? C.saffron
    : isProcessing
      ? C.navy
      : isError
        ? C.errorSoft
        : C.surface2;

  const borderStyle = isError
    ? `1.5px solid ${C.red}`
    : state === 'idle'
      ? `2px solid ${C.border}`
      : '2px solid transparent';

  const barHeights = [8, 14, 20, 14, 8];

  return (
    <div style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: `${size}px`, height: `${size}px`, flexShrink: 0,
    }}>
      <AnimatePresence>
        {isListening && (
          <motion.span
            key="ring"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              width: `${size + 4}px`, height: `${size + 4}px`,
              borderRadius: LAYOUT.radius.full,
              border: `1.5px solid ${C.saffron}`,
              animation: 'lokaiPulseRing 1.6s ease-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}
        {isProcessing && (
          <motion.span
            key="arc"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: LAYOUT.radius.full,
              border: '2px solid transparent',
              borderTopColor: 'rgba(255,255,255,0.5)',
              animation: 'lokaiSpin 1s linear infinite',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        className="lokai-voice-orb"
        aria-label={voiceLabel}
        onClick={onClick}
        disabled={!onClick}
        animate={{ background: surface, border: borderStyle }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{
          ...buttonReset,
          position: 'relative',
          width: `${size}px`, height: `${size}px`,
          borderRadius: LAYOUT.radius.full,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isListening ? (
            <motion.span
              key="bars"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              style={{ display: 'flex', alignItems: 'center', gap: '3px', position: 'relative', zIndex: 1 }}
            >
              {barHeights.map((h, i) => (
                <span key={i} style={{
                  width: '3px', height: `${h}px`,
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: LAYOUT.radius.xs,
                  transformOrigin: 'center bottom',
                  animation: `lokaiBarBounce ${0.5 + i * 0.12}s ease-in-out ${i * 0.1}s infinite`,
                }} />
              ))}
            </motion.span>
          ) : isError ? (
            <motion.svg
              key="error"
              width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              <line x1="4" y1="4" x2="12" y2="12" stroke={C.red} strokeWidth="1.6" strokeLinecap="round" />
              <line x1="12" y1="4" x2="4" y2="12" stroke={C.red} strokeWidth="1.6" strokeLinecap="round" />
            </motion.svg>
          ) : (
            <motion.span
              key="mic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              style={{ display: 'flex' }}
            >
              <MicIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

// ─── Button — Primary / Secondary / Ghost / Destructive ───────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  'primary' | 'secondary' | 'ghost' | 'destructive';
  loading?:  boolean;
  size?:     'sm' | 'md' | 'lg';
  children:  React.ReactNode;
}

export function Btn({
  variant  = 'primary',
  loading  = false,
  size     = 'md',
  children,
  disabled,
  style,
  ...props
}: BtnProps) {
  useEffect(() => { injectSharedStyles(); }, []);

  const padMap = { sm: '8px 16px', md: '12px 24px', lg: '14px 32px' };
  const fszMap = { sm: '13px',      md: '14px',      lg: '15px'      };

  const base: React.CSSProperties = {
    fontFamily:   SANS,
    fontSize:     fszMap[size],
    fontWeight:   600,
    borderRadius: LAYOUT.radius.md,
    padding:      padMap[size],
    border:       'none',
    cursor:       disabled || loading ? 'not-allowed' : 'pointer',
    display:      'inline-flex',
    alignItems:   'center',
    justifyContent: 'center',
    gap:          '8px',
    lineHeight:   1.4,
    userSelect:   'none',
    whiteSpace:   'nowrap',
  };

  // Disabled overrides
  const disabledStyle: React.CSSProperties = disabled ? {
    background: C.border,
    color:      C.muted,
    border:     'none',
    boxShadow:  'none',
    opacity:    1,
  } : {};

  const variantStyles: Record<string, React.CSSProperties> = {
    primary:     { color: '#FFFFFF' },
    secondary:   { color: C.navy },
    ghost:       { color: C.inkSoft, padding: padMap[size] },
    destructive: { color: C.red },
  };

  const classMap = {
    primary:     'lokai-btn-primary',
    secondary:   'lokai-btn-secondary',
    ghost:       'lokai-btn-ghost',
    destructive: 'lokai-btn-destructive',
  };

  // Spinner
  const Spinner = () => (
    <div style={{
      width: '16px', height: '16px', borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#FFFFFF',
      animation: 'lokaiSpin 0.8s linear infinite',
    }} />
  );

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${classMap[variant]} ${props.className || ''}`}
      style={{ ...base, ...variantStyles[variant], ...disabledStyle, ...style }}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function InputField({ error = false, style, ...props }: InputFieldProps) {
  useEffect(() => { injectSharedStyles(); }, []);
  return (
    <input
      {...props}
      className={`lokai-input-field ${props.className || ''}`}
      style={{
        width:       '100%',
        fontFamily:  SANS,
        fontSize:    '15px',
        color:       C.ink,
        padding:     '14px 16px',
        boxSizing:   'border-box',
        background:  props.disabled ? C.surface2 : '#FFFFFF',
        border:      `1.5px solid ${error ? C.red : C.border}`,
        borderRadius: LAYOUT.radius.md,
        boxShadow:   error
          ? `0 0 0 3px rgba(200,64,48,0.10), ${SHADOW.sm}`
          : SHADOW.sm,
        outline:     'none',
        ...style,
      }}
    />
  );
}

// ─── Language Chip ────────────────────────────────────────────────────────────
export function LanguageChip({
  name,
  englishName,
  selected  = false,
  onClick,
}: {
  name:         string;
  englishName?: string;
  selected?:    boolean;
  onClick?:     () => void;
}) {
  useEffect(() => { injectSharedStyles(); }, []);
  return (
    <button
      onClick={onClick}
      className={`lokai-lang-chip${selected ? ' selected' : ''}`}
      style={{
        display:       'flex',
        flexDirection: englishName ? 'column' : 'row',
        alignItems:    'center',
        gap:           '3px',
        padding:       englishName ? '10px 12px' : '8px 14px',
        background:    selected ? 'rgba(19,40,70,0.08)' : C.bg,
        border:        selected ? `1.5px solid ${C.navy}` : `1px solid ${C.border}`,
        borderRadius:  LAYOUT.radius.control,
        cursor:        'pointer',
        fontFamily:    SANS,
      }}
    >
      <span style={{
        fontFamily: SANS,
        fontSize:   englishName ? TYPE.body.size : TYPE.small.size,
        fontWeight: selected ? 600 : 500,
        color:      selected ? C.navy : C.ink,
        lineHeight: 1.3,
      }}>
        {name}
      </span>
      {englishName && (
        <span style={{
          fontFamily: SANS,
          fontSize:   TYPE.label.size,
          color:      selected ? C.navy : C.muted,
        }}>
          {englishName}
        </span>
      )}
    </button>
  );
}

// ─── Section label (small caps) ───────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      ...typeStyle('label', { color: C.muted, marginBottom: S[2] }),
    }}>
      {children}
    </div>
  );
}

// ─── Disclaimer Text — present on all screens with legal content ──────────────
export function DisclaimerText({ center = false }: { center?: boolean }) {
  return (
    <p style={{
      ...typeStyle('micro', {
        color: C.muted,
        margin: 0,
        letterSpacing: 'normal',
        textTransform: 'none',
        textAlign: center ? 'center' : 'left',
      }),
    }}>
      LokAI provides legal information, not legal advice.
    </p>
  );
}
