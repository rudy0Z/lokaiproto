/**
 * LokAI layout kit — LAYER 3 of the design system.
 *
 * These components encode the composition law (`docs/MOBILE_AI_SYSTEM.md` §1)
 * as structure, so obeying it is the path of least resistance and breaking it
 * takes deliberate effort.
 *
 *   L1  ground, not boxes      → `Card` is the only box, and its docstring
 *                                states the test it has to pass
 *   L2  one focal move         → `Screen` takes exactly one `action`
 *   L3  answer first           → `Screen`'s slot order is fixed
 *   L4  type carries hierarchy → `Rule` and `HairlineList` replace borders
 *   L6/L8 stop is the opposite → `Screen tone="stop"` inverts the whole surface
 *   L7  say it once            → `Screen` takes one `context` line, not a card
 *
 * The five-slot grammar, top to bottom, every mobile screen:
 *
 *   1  context strip   matter · stage · language — one quiet line, never a card
 *   2  focal zone      the answer or the decision, on the ground
 *   3  grounding row   claim count + tappable source line
 *   4  action zone     ONE primary; the second action is a text link
 *   5  composer        chat surfaces only
 */

import React from 'react';
import { LAYOUT, S, SHADOW_SCALE } from '../components/shared';
import { T, M } from './theme';
import { ToneProvider, useInk, useTone, type ScreenTone } from './primitives';
import { ARTBOARD } from '../embed';

/* ───────────────────────────────────────────────────────────────────────────
 * Screen
 * ─────────────────────────────────────────────────────────────────────────── */

export interface ScreenProps {
  /**
   * `paper` — the app.
   * `stop`  — the app refusing. Inverts the ENTIRE surface: ground, chrome,
   *           ink, rules, and the primary button. Not a dark card on a light
   *           page; the page itself changes state (L6/L8).
   */
  tone?: ScreenTone;
  /** Fixed chrome above the scroll area — status bar, top nav, header. */
  chrome?: React.ReactNode;
  /** Slot 1. One quiet line. If this wants to be a card, it is saying too much. */
  context?: React.ReactNode;
  /** Slots 2–3: the content, on the ground. */
  children: React.ReactNode;
  /** Slot 4. Pinned above the composer/footer, never scrolled past. */
  action?: React.ReactNode;
  /** When true, the action slot floats over the ground without a rigid dividing border. */
  floatingAction?: boolean;
  /** Slot 5, plus any bottom nav. Fixed at the bottom of the artboard. */
  footer?: React.ReactNode;
  /** Extra bottom padding on the scroll area — set when a floating composer
   *  overlays the content (default already clears a standard composer). */
  scrollClearance?: string;
  /** Ref to the scroll viewport — chat surfaces read scroll position so
   *  auto-scroll never yanks the user away from content they scrolled up to. */
  scrollViewportRef?: React.RefObject<HTMLDivElement | null>;
  style?: React.CSSProperties;
  className?: string;
}

export function Screen({
  tone = 'paper',
  chrome,
  context,
  children,
  action,
  floatingAction = true,
  footer,
  scrollClearance,
  scrollViewportRef,
  style,
  className,
}: ScreenProps) {
  const onStop = tone === 'stop';

  return (
    <ToneProvider value={tone}>
      <div
        className={className}
        data-tone={tone}
        style={{
          ...ARTBOARD,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          /* The whole artboard takes the tone. This one line is the fix for
             the stop state reading as an uncanny sandwich — previously the
             status bar, top nav and page ground stayed cream while only an
             inner container went dark. */
          background: onStop ? T.stopGround : T.ground,
          color: onStop ? T.stopInk : T.ink,
          ...style,
        }}
      >
        {chrome}

        {context && (
          <div style={{ padding: `${S[3]} ${M.padX} 0`, flexShrink: 0 }}>{context}</div>
        )}

        <div
          ref={scrollViewportRef}
          /* The chat scroll surface is the new-content region; polite
             aria-live so screen readers announce a new turn without
             interrupting mid-read. */
          aria-live="polite"
          aria-label={onStop ? 'Stop state content' : 'Conversation'}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: `${S[5]} ${M.padX} ${scrollClearance ?? M.composerClearance}`,
            display: 'flex',
            flexDirection: 'column',
            gap: M.slotGap,
          }}
        >
          {children}
        </div>

        {action && (
          <div
            style={{
              flexShrink: 0,
              padding: floatingAction ? `0 ${M.padX} ${S[2]}` : `${S[3]} ${M.padX} ${S[4]}`,
              borderTop: floatingAction ? 'none' : `1px solid ${onStop ? T.stopHairline : T.hairline}`,
              background: floatingAction ? 'transparent' : (onStop ? T.stopGround : T.ground),
              position: floatingAction ? 'relative' : undefined,
              zIndex: floatingAction ? 20 : undefined,
            }}
          >
            {action}
          </div>
        )}

        {footer}
      </div>
    </ToneProvider>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * Stack / Row — the only two ways to space things
 * ─────────────────────────────────────────────────────────────────────────── */

type SpaceStep = keyof typeof S;

export function Stack({
  gap = 4,
  align,
  children,
  style,
  ...rest
}: {
  /** Step on the spacing scale. 4 = 16px (within a slot), 6 = 32px (between). */
  gap?: SpaceStep;
  align?: React.CSSProperties['alignItems'];
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      style={{ display: 'flex', flexDirection: 'column', gap: S[gap], alignItems: align, ...style }}
    >
      {children}
    </div>
  );
}

export function Row({
  gap = 3,
  align = 'center',
  justify,
  wrap = false,
  children,
  style,
  ...rest
}: {
  gap?: SpaceStep;
  align?: React.CSSProperties['alignItems'];
  justify?: 'start' | 'between' | 'end' | 'center';
  wrap?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const justifyMap = { start: 'flex-start', between: 'space-between', end: 'flex-end', center: 'center' } as const;
  return (
    <div
      {...rest}
      style={{
        display: 'flex',
        alignItems: align,
        gap: S[gap],
        ...(justify ? { justifyContent: justifyMap[justify] } : {}),
        ...(wrap ? { flexWrap: 'wrap' } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Escape the screen's horizontal padding — for a full-width rule or image. */
export function Bleed({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ marginLeft: `-${M.padX}`, marginRight: `-${M.padX}`, ...style }}>{children}</div>;
}

/* ───────────────────────────────────────────────────────────────────────────
 * Rule + HairlineList — what replaces boxes
 * ─────────────────────────────────────────────────────────────────────────── */

/** A single hairline. This is the app's separator; a bordered container is not. */
export function Rule({ style }: { style?: React.CSSProperties }) {
  const ink = useInk();
  return <div role="separator" style={{ height: 1, background: ink.hairline, flexShrink: 0, ...style }} />;
}

/**
 * A list of related facts, separated by hairlines rather than boxed.
 *
 * This is the direct replacement for the pattern that made the verify screen
 * read as a KYC form: one bordered panel per fact, each with a coloured left
 * border and a shouting caps label above a whispering value. Here the value
 * takes the strong position, the label sits quiet beneath it, and only the
 * exception gets a fill.
 */
export function HairlineList({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const ink = useInk();
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {items.map((child, i) => (
        <div
          key={i}
          style={{
            borderTop: i === 0 ? 'none' : `1px solid ${ink.hairline}`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/**
 * One row of a `HairlineList`.
 *
 * `flagged` is the only state that gets a fill — the exception is marked, the
 * rule is not. That is L1 applied to state: do not box every row so that the
 * one row that matters can be boxed.
 */
export function HairlineRow({
  children,
  leading,
  trailing,
  flagged = false,
  onClick,
  style,
}: {
  children: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  flagged?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const interactive = !!onClick;

  /* Layout of the surface — shared by the interactive <button> and the static
     <div> so the two render identically. Deliberately no `background` here:
     the interactive case paints it through a CSS class (see .lokai-row in
     shared.tsx) so the :active press state can win, which an inline background
     would block. The static case sets it inline just below. */
  const surface: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: S[3],
    width: '100%',
    minHeight: M.tap,
    padding: `${S[3]} ${flagged ? S[3] : '0'}`,
    margin: flagged ? `0 -${S[3]}` : 0,
    borderRadius: flagged ? LAYOUT.radius.sm : 0,
    textAlign: 'left',
    boxSizing: 'border-box',
    ...style,
  };

  const inner = (
    <>
      {leading && <div style={{ flexShrink: 0, paddingTop: '2px' }}>{leading}</div>}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: S[1] }}>
        {children}
      </div>
      {trailing && <div style={{ flexShrink: 0, paddingTop: '2px' }}>{trailing}</div>}
    </>
  );

  if (!interactive) {
    return <div style={{ ...surface, background: flagged ? T.flagFill : 'transparent' }}>{inner}</div>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      /* .lokai-row / .lokai-row-flag carry rest + :active backgrounds. */
      className={flagged ? 'lokai-row-flag' : 'lokai-row'}
      style={{ ...surface, border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
    >
      {inner}
    </button>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * Card — the only container, and it has to earn itself
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * A raised surface for a DISCRETE OBJECT.
 *
 * The test, and it is not a soft one: could the user pick this thing up and
 * move it somewhere else? A source. An uploaded exhibit. A saved matter. A
 * document.
 *
 * Explanatory prose is never a card. A step description is never a card. A
 * disclaimer is never a card. A "current step" restatement is never a card,
 * or anything at all. **At most two cards visible per screen** — the current
 * mobile screens run five to seven, which is the single loudest reason they
 * read as generated rather than designed.
 *
 * There is no elevation prop, no border-radius prop, and no accent prop. A
 * card that needs to look different from other cards is a different component
 * with a name, not a card with options — that is exactly how the folded-corner
 * treatment on `VerificationScratchpad` came to exist and mean nothing.
 */
export function Card({
  children,
  onClick,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const tone = useTone();
  const ink = useInk();
  /* Border OR shadow, never both. On the paper theme a card is a physical
     object resting on the page — a contact shadow, no outline. On the stop
     ground a shadow is invisible, so a subtle raised fill carries it instead.
     The old both-at-once (1px hairline + implied elevation) was the generic
     outlined-box look; a single separator reads as an object, not a diagram. */
  const surface: React.CSSProperties = tone === 'stop'
    ? {
        background: T.stopRaised,
        borderRadius: LAYOUT.radius.panel,
        padding: S[4],
        boxSizing: 'border-box',
        ...style,
      }
    : {
        background: T.raised,
        borderRadius: LAYOUT.radius.panel,
        boxShadow: SHADOW_SCALE.card,
        padding: S[4],
        boxSizing: 'border-box',
        ...style,
      };

  if (!onClick) return <div style={surface}>{children}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      className="lokai-pressable"
      style={{ ...surface, display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
    >
      {children}
    </button>
  );
}
