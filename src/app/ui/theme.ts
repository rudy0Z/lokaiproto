/**
 * LokAI theme — LAYER 1 of the design system.
 *
 *   1. TOKENS      ← this file (+ shared.tsx's TYPE / S / LAYOUT / SHADOW)
 *   2. PRIMITIVES  ← ui/primitives.tsx
 *   3. LAYOUT KIT  ← ui/layout.tsx
 *   4. DOMAIN      ← Turn, VerificationGate, StopState, NoticeInterpret…
 *
 * `T` is the ONLY color surface a screen or domain component may touch.
 * `C` in shared.tsx is now the palette definition, not the call-site API —
 * it names colors by appearance (navy, saffron) and so cannot survive a
 * theme change. Every value here is a CSS variable, so re-pointing the role
 * layer in index.css re-themes the whole app with zero call-site edits.
 *
 * The one exception: motion/react cannot interpolate `var(...)`. Components
 * that ANIMATE a color import the literal from `C` and say so in a comment.
 */

/** Semantic color roles. Named by job, never by hue. */
export const T = {
  /** Page ground. Body content sits directly on this (L1). */
  ground:       'var(--role-ground)',
  /** A raised surface. Only for discrete objects — a source, an exhibit, a
   *  saved matter. Explanatory prose is never raised. */
  raised:       'var(--role-raised)',
  /** Recessed surface — inputs at rest, inert wells. */
  sunken:       'var(--role-sunken)',

  /** Primary reading ink. */
  ink:          'var(--role-ink)',
  /** Secondary prose — the "how it applies" register. */
  inkQuiet:     'var(--role-ink-quiet)',
  /** Labels, metadata, timestamps. Never body copy. */
  inkFaint:     'var(--role-ink-faint)',
  /** Ink on any dark ground. */
  inkInverse:   'var(--role-ink-inverse)',

  /** The 1px that does the work borders used to do. */
  hairline:     'var(--role-hairline)',
  hairlineFirm: 'var(--role-hairline-firm)',

  /** The single dark, saturated role: composer, ONE primary CTA, stop ground.
   *  If a screen wants a second anchored element, delete one of them (L5). */
  anchor:       'var(--role-anchor)',
  anchorDeep:   'var(--role-anchor-deep)',
  anchorTint:   'var(--role-anchor-tint)',
  onAnchor:     'var(--role-on-anchor)',

  /** Needs-review. The exception gets the fill; the rule does not (L1). */
  flag:         'var(--role-flag)',
  flagFill:     'var(--role-flag-fill)',

  /** Provenance — citations, source trails, grounding. */
  attest:       'var(--role-attest)',
  attestFill:   'var(--role-attest-fill)',

  /** A well/inset surface for a control sitting in a hero canvas. A
   *  hairline warmer than ground, for a button that wants to read as
   *  pressed into the page. */
  micWell:      'var(--role-mic-well)',

  ok:           'var(--role-ok)',
  okFill:       'var(--role-ok-fill)',
  halt:         'var(--role-halt)',
  haltFill:     'var(--role-halt-fill)',

  /** Focus ring. The only saffron that clears WCAG 2.2 1.4.11's 3:1. */
  focus:        'var(--role-focus)',

  /** A rendered document's page — warmer than the ground so it reads as
   *  physical paper laid on the desk rather than a UI surface. */
  paper:        'var(--role-paper)',

  /** Behind a drawer or sheet. Warm-black, so it reads as shade over paper
   *  rather than as a screen dimming. */
  scrim:        'var(--role-scrim)',

  /** Stop states — L8: always the tonal opposite of `ground`. */
  stopGround:   'var(--role-stop-ground)',
  stopInk:      'var(--role-stop-ink)',
  stopInkQuiet: 'var(--role-stop-ink-quiet)',
  stopHairline: 'var(--role-stop-hairline)',
  /** A card surface that sits on the stop ground. On a paper theme the
   *  contact shadow carries the lift; on the stop ground shadows vanish,
   *  so the surface is the lift. */
  stopRaised:   'var(--role-stop-raised)',
} as const;

export type ColorRole = keyof typeof T;

/**
 * Mobile geometry — the numbers behind the five-slot screen grammar.
 *
 * These are not suggestions. A screen that needs a value not in here is
 * either doing something the system has not decided yet (say so, then add
 * it here) or reinventing a decision that already exists (don't).
 */
export const M = {
  /** Horizontal page padding. Every mobile screen, no exceptions. */
  padX:        '20px',
  /** Between the five slots of the screen grammar. */
  slotGap:     '32px',
  /** Within a slot — between a label and its value, rows of a list. */
  zoneGap:     '16px',
  /** Minimum tap target. WCAG 2.5.8 / Apple HIG. */
  tap:         '44px',
  /** The single primary CTA. Taller than a normal control on purpose —
   *  it is the one thing a stressed user must be able to hit. */
  ctaHeight:   '50px',
  /** Composer shell height at one row. */
  composerH:   '56px',
  /** Bottom padding on any scroll container that sits under the composer,
   *  so content is never occluded (the desktop bug in §3.7 item 3). */
  composerClearance: '104px',
  /** Reading measure. Longer than this and the eye loses the line return. */
  measure:     '55ch',
} as const;

/**
 * Type roles, semantic.
 *
 * shared.tsx's `TYPE` names sizes by shape (h3, body, editorial). These name
 * them by JOB, which is what stops a screen from picking `editorial` because
 * it wants something big.
 *
 * The size ladder is deliberately short. Two serif roles exist and they are
 * not interchangeable:
 *
 *   `answer`    — 22px. The law speaking. Zone 1 of any response.
 *   `pronounce` — 28px. Reserved for the moment the app REFUSES, and for the
 *                 home greeting. At most one per screen, and most screens
 *                 have none. Making the refusal the largest type in the app
 *                 is L2 and L6 expressed as a number.
 *
 * On a 390px viewport, 28px of serif eats ~45% of the fold. That is correct
 * for a stop state (there is nothing else to read) and wrong for an answer
 * the user has to act on. If both roles start appearing on the same screen,
 * that screen has two focal moves and one of them is wrong.
 */
export const ROLE_TYPE = {
  pronounce:  'editorial',
  answer:     'editorialSm',
  lead:       'lead',
  title:      'title',
  body:       'body',
  bodyStrong: 'bodyStrong',
  quiet:      'small',
  caption:    'caption',
  captionStrong: 'captionStrong',
  /** The ONE caps label a screen is allowed (L7). */
  label:      'label',
  meta:       'micro',
} as const;

export type TextRole = keyof typeof ROLE_TYPE;
