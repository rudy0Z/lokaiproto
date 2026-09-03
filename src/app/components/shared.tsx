import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

// ─── Font constants ───────────────────────────────────────────────────────────
export const EDITORIAL = '"Fraunces Variable", "Fraunces", Georgia, serif';
export const SANS = '"Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", monospace';
export const DEVANAGARI = '"Noto Sans Devanagari", "Hanken Grotesk", sans-serif';
export const TAMIL = '"Noto Sans Tamil", "Hanken Grotesk", sans-serif';
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
  // Fraunces Variable, softened: SOFT rounds the terminals and a moderate opsz
  // drops the stroke contrast so the display serif reads warm, not brittle, on a
  // calm page. wght is carried here too so font-variation-settings doesn't reset it.
  display1:    { family: EDITORIAL, size: '3.5rem',    weight: 300, lineHeight: 1.05, letterSpacing: '-0.02em',  fontVariationSettings: "'wght' 300, 'opsz' 40, 'SOFT' 55, 'WONK' 0" },
  display2:    { family: EDITORIAL, size: '2.25rem',   weight: 300, lineHeight: 1.1,  letterSpacing: '-0.015em', fontVariationSettings: "'wght' 300, 'opsz' 36, 'SOFT' 55, 'WONK' 0" },
  editorial:   { family: EDITORIAL, size: '1.75rem',   weight: 400, lineHeight: 1.2,  letterSpacing: '-0.01em',  fontVariationSettings: "'wght' 400, 'opsz' 30, 'SOFT' 60, 'WONK' 0" },
  editorialSm: { family: EDITORIAL, size: '1.375rem',  weight: 400, lineHeight: 1.25, letterSpacing: '-0.01em',  fontVariationSettings: "'wght' 400, 'opsz' 28, 'SOFT' 60, 'WONK' 0" },
  // UI hierarchy — Hanken Grotesk. One size = one role. Do not invent px at call sites.
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
    ...('fontVariationSettings' in t && t.fontVariationSettings ? { fontVariationSettings: t.fontVariationSettings } : {}),
    ...overrides,
  };
}

// ─── Color system (mirrors CSS tokens in src/styles/index.css) ────────────────
/* C — the palette bridge.
 *
 * Every SEMANTIC entry is a var(--role-*) reference, not a hex: re-pointing
 * the role layer in index.css ([data-theme="dark"]) re-themes every call
 * site in the app with zero edits here. This completes the rule theme.ts
 * states — C names colors by appearance but now resolves them by JOB, so a
 * theme change cannot leave a call site behind.
 *
 * The literal exceptions, deliberately:
 *   - saffron / saffronDark / the washes — decorative accents and the
 *     dev-canvas planes; the orb's animated surface reads these as literals
 *     (motion cannot interpolate var()), see VoiceOrb.
 *   - onDark is a ROLE (ink-inverse): it pairs with navy FILLS, and both
 *     ends invert together in dark (fill→cream, ink→navy). */
export const C = {
  // Canvas — roles
  bg:           'var(--role-ground)',
  surface:      'var(--role-raised)',
  surface2:     'var(--role-sunken)',
  washBlue:     '#DDE7FF',
  washGold:     '#FFE3B8',
  washRose:     '#F5D8D4',
  // Ink — roles
  ink:          'var(--role-ink)',
  inkSoft:      'var(--role-ink-quiet)',
  /* Was a literal #858078 (3.60:1 on canvas — failed AA at ~160 call sites).
     The role restores the DTCG step: 5.40:1 canvas / 5.88:1 white, and the
     contrast gate holds it there in BOTH themes. */
  muted:        'var(--role-ink-faint)',
  // Structure — roles
  border:       'var(--role-hairline)',
  borderStrong: 'var(--role-hairline-firm)',
  // Brand — navy becomes the anchor ROLE (inverts in dark)
  navy:         'var(--role-anchor)',
  saffron:      '#E9852B',
  oxblood:      'var(--role-attest)',
  // Semantic — roles
  green:        'var(--role-ok)',
  red:          'var(--role-halt)',
  amber:        'var(--role-flag)',
  // Derived / soft fills — roles
  bgRaised:     'var(--role-sunken)',
  navyDark:     'var(--role-anchor-deep)',
  navySoft:     'var(--role-anchor-tint)',
  saffronDark:  '#C86712',
  /* The only saffron legal on a focus ring or any UI boundary:
     3.83:1 on canvas / 4.17:1 on white, clearing WCAG 2.2 1.4.11's 3:1.
     Plain `saffron` is 2.46:1 and must never carry accessibility meaning. */
  saffronAccessible: 'var(--role-focus)',
  saffronSoft:  'rgba(233,133,43,0.10)',
  terracotta:   'var(--role-flag)',
  oxbloodSoft:  'var(--role-attest-fill)',
  onDark:       'var(--role-on-anchor)',
  onDarkSoft:   'var(--role-anchor-quiet)',
  borderLight:  'var(--role-hairline)',
  borderFocus:  'var(--role-anchor)',
  rule:         'var(--role-hairline)',
  successSoft:  'var(--role-ok-fill)',
  cautionSoft:  'var(--role-flag-fill)',
  errorSoft:    'var(--role-halt-fill)',
  badgeBg:      'var(--role-anchor-tint)',
  badgeText:    'var(--role-anchor)',
  badgeBorder:  'var(--role-hairline-firm)',
  // Legacy aliases (same roles — keep call sites compiling)
  teal:         'var(--role-anchor)',
  oxbloodDark:  'var(--role-attest)',
  text:         'var(--role-ink)',
  textSoft:     'var(--role-ink-quiet)',
  textDisabled: 'var(--role-ink-faint)',
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
/*
 * Contact shadows, not glows (reworked 2026-08-27).
 *
 * The old scale leaned on wide, soft blurs — `0 8px 24px` on every card — which
 * is the generic "Material float" look and one of the clearest tells of
 * vibecoded UI. Real paper on a desk casts a TIGHT contact shadow: the object
 * sits close to the surface, the shadow hugs its edge, and it is warm, not grey.
 *
 * The rule these enforce: a surface gets a border OR a shadow, never both. An
 * outline plus a drop shadow is two separators doing one job — decoration. A
 * card is either a flat outlined plane (border, no shadow) or a physical object
 * resting on the page (contact shadow, no border). We chose the latter for
 * cards and paper, so the border comes off wherever one of these lands.
 *
 * Every value is a two-layer shadow: a 1px key that draws the contact edge, and
 * one soft ambient layer kept deliberately tight (≤12px) so nothing floats.
 */
export const SHADOW = {
  xs:    '0 1px 1px rgba(26,25,22,0.05)',
  /** Contact — a card or exhibit resting on the page. */
  sm:    '0 1px 1px rgba(26,25,22,0.05), 0 2px 4px rgba(26,25,22,0.05)',
  /** Lifted — a document raised a little off the page. */
  md:    '0 1px 2px rgba(26,25,22,0.06), 0 4px 10px rgba(26,25,22,0.06)',
  /** A drawer or sheet over the page. */
  lg:    '0 2px 6px rgba(26,25,22,0.06), 0 10px 28px rgba(26,25,22,0.10)',
  float: '0 4px 10px rgba(26,25,22,0.07), 0 16px 36px rgba(26,25,22,0.12)',
  /** Specialty elevations — still tokens, never raw strings at call sites */
  inset: 'inset 0 1px 0 rgba(255,255,255,0.8)',
  insetSoft: 'inset 0 1px 0 rgba(255,255,255,0.7)',
  insetEdge: 'inset -1px 0 rgba(255,255,255,0.05)',
  navySoft: '0 4px 14px rgba(16,42,76,0.2)',
  navy: '0 4px 12px rgba(16,42,76,0.28)',
  overlay: '0 24px 72px rgba(11,30,55,0.24)',
} as const;

// ─── Device chrome ────────────────────────────────────────────────────────────
/**
 * The phone the mobile screens are drawn on, in the dev/standalone view only.
 *
 * Deliberately NOT part of LAYOUT.radius or SHADOW. Those scales describe UI
 * surfaces inside the product; this describes a physical object the product is
 * displayed on. Mixing them would put a 56px radius in a scale whose largest
 * real value is 22px, and the next person would reach for it on a card.
 *
 * Why it exists: the artboard is 390x844 — 19.5:9, the exact logical viewport
 * of an iPhone 12-14 — but it was rendered as a hard-edged rectangle sitting
 * directly on a cream gradient. With nothing to give it scale it read as a
 * tall web column rather than a phone. The ratio was never the problem.
 *
 * Never applied when IS_EMBED: inside the portfolio the iframe *is* the phone
 * and PrototypeFrame draws its own bezel, so this would double-frame.
 */
export const DEVICE = {
  bezel:        '12px',
  radiusOuter:  '56px',
  radiusScreen: '44px',
  /** Off-axis so the bezel catches light along one edge like a machined case. */
  surface:      'linear-gradient(152deg, #33333A 0%, #141417 46%, #0E0E11 72%, #26262C 100%)',
  rim:          'inset 0 0 0 1px rgba(255,255,255,0.09)',
  shadow:       '0 34px 84px -30px rgba(14,18,26,0.58), 0 10px 28px -14px rgba(14,18,26,0.38)',
  islandW:      110,
  islandH:      32,
  islandTop:    11,
  islandFill:   '#08080A',
  buttonFill:   'rgba(255,255,255,0.14)',
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
/* Tap-row feedback for HairlineRow. The surface lives on the <button> itself
   with NO inline background, so these :active rules actually win — the row
   previously set background:'none' inline, which beat every class and made the
   press state impossible to see (feels laggy before the sheet springs). Two
   variants because a flagged row already carries a fill it must darken from,
   not replace. Uses role tokens so it re-themes with everything else. */
.lokai-row {
  background: transparent;
  transition: background ${MOTION.press} ${MOTION.ease};
}
.lokai-row:active:not(:disabled) {
  background: var(--role-sunken);
}
.lokai-row-flag {
  background: var(--role-flag-fill);
  transition: background ${MOTION.press} ${MOTION.ease};
}
.lokai-row-flag:active:not(:disabled) {
  background: rgba(138,69,0,0.16);
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

/* CitationStamp deleted 2026-08-28 — it had zero consumers. Citations render
   through <CitationChip> in ui/primitives (section-first, Perplexity-pattern)
   via TurnCitations and the notice reader's surfaced fields. */

// ─── Logo Mark — "L" in a circle ──────────────────────────────────────────────
/**
 * The mark — a navy rounded-square tile carrying a serif "L".
 *
 * Replaces the floret-in-a-circle, which read as fussy and generic at any size.
 * A confident monogram tile is the app-icon shape a phone user expects, ties
 * directly to the Fraunces "Lok" of the wordmark, and holds up from 20px in the
 * drawer to a 96px onboarding hero without redrawing. On a dark ground the tile
 * lightens rather than inverting, so the mark never becomes a hole in the page.
 */
export function LogoMark({ size = 40, light = false }: { size?: number; light?: boolean }) {
  const tile  = light ? 'rgba(255,255,255,0.14)' : C.navy;
  const glyph = light ? '#FFFFFF' : '#F7F4ED';
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`,
      borderRadius: `${Math.round(size * 0.28)}px`,
      background: tile,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: light ? 'inset 0 0 0 1px rgba(255,255,255,0.14)' : '0 2px 6px rgba(16,42,76,0.18)',
    }}>
      <span style={{
        fontFamily: EDITORIAL,
        fontSize: `${Math.round(size * 0.6)}px`,
        fontWeight: 500,
        lineHeight: 1,
        color: glyph,
        transform: `translateY(${Math.round(size * 0.02)}px)`,
      }}>
        L
      </span>
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

/** Google's four-colour "G", for the prepared "Continue with Google" button on
 *  onboarding. Lives here (a token-definition file) so the brand hexes don't
 *  read as drifted palette colour at a screen call site. Demo only — the button
 *  runs no real OAuth. */
export function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// ─── Voice Orb — full 4-state component ──────────────────────────────────────
export type VoiceOrbState = 'idle' | 'listening' | 'processing' | 'error';

export function VoiceOrb({
  size  = 52,
  state = 'idle',
  onClick,
  live = false,
}: {
  size?:    number;
  state?:   VoiceOrbState;
  onClick?: () => void;
  /** While listening, the level bars follow a simulated amplitude envelope
   *  instead of a uniform loop — the demo requests no microphone, so the
   *  envelope is choreographed over the prepared sample, and the honesty
   *  line on the voice screen says so. */
  live?: boolean;
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
  const reduce = useReducedMotion();

  /* The amplitude envelope the bars follow when `live`: a gentle random walk
     per bar, spring-smoothed. Deliberately NOT a uniform loop — real speech
     breathes, and the listening state is the one moment the app should feel
     like it is hearing you. */
  const [barLevels, setBarLevels] = useState<number[]>([0.5, 0.8, 1, 0.8, 0.5]);
  useEffect(() => {
    if (!live || !isListening || reduce) return;
    const id = window.setInterval(() => {
      setBarLevels((prev) => prev.map((v) => Math.min(1, Math.max(0.22, v + (Math.random() - 0.5) * 0.5))));
    }, 130);
    return () => window.clearInterval(id);
  }, [live, isListening, reduce]);

  /* Motion requires a literal hex (var() does not interpolate). Resolve the
     role to its concrete value at animation time, then animate THAT. The
     shape of the animation is theme-correct because the role layers the
     theme mapping; the orb just can't read the mapping through the JS bridge. */
  const resolveRole = (cssVar: string): string => {
    if (typeof window === 'undefined') return cssVar;
    const m = cssVar.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    if (!m) return cssVar;
    return getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() || cssVar;
  };
  const surface = isListening
    ? resolveRole(C.saffron)
    : isProcessing
      ? resolveRole(C.navy)
      : isError
        ? resolveRole(C.errorSoft)
        : resolveRole(C.surface2);

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
                live && !reduce ? (
                  <motion.span
                    key={i}
                    style={{
                      width: '3px', height: `${h}px`,
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: LAYOUT.radius.xs,
                      transformOrigin: 'center',
                      display: 'block',
                    }}
                    animate={{ scaleY: barLevels[i] ?? 0.6 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                  />
                ) : (
                  <span key={i} style={{
                    width: '3px', height: `${h}px`,
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: LAYOUT.radius.xs,
                    transformOrigin: 'center bottom',
                    animation: `lokaiBarBounce ${0.5 + i * 0.12}s ease-in-out ${i * 0.1}s infinite`,
                  }} />
                )
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
