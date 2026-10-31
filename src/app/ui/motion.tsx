/**
 * LokAI motion primitives — the motion layer of the design system.
 *
 * MOTION tokens (durations, the ease) exist in shared.tsx but were barely
 * used: the mobile chat stream mounted instantly, the Turn's three zones
 * popped in via conditional render, and the only spring in the app lived
 * inside <Sheet>. This layer is the fix. It exists so that "how the
 * interface moves" is decided once, here, and every surface consumes the
 * same recipes.
 *
 * Three rules, all enforced by how these primitives are written:
 *
 * 1. Reduced motion is a pairing, not a kill-switch. Transforms and loops
 *    collapse; short opacity transitions survive so state changes still
 *    read. (index.css's global reduced-motion block does the same for CSS.)
 * 2. motion/react cannot interpolate `var(...)` — anything these
 *    primitives ANIMATE is a literal from `C`, never a role token. Static
 *    styling on the wrappers goes through `T`/roles like everywhere else.
 * 3. Springs are reserved for surfaces the user summoned (sheets, the
 *    drawer — bounce 0.2, per <Sheet>); state changes the product drove
 *    (stage swaps, zone reveals) are critically damped (bounce 0).
 *    Overshoot on a refusal would be unearned.
 *
 * The entrance recipe is deliberately one: fade + 8px rise, ~240ms, the
 * app's ease. One entrance, everywhere, reads as a system; five variants
 * read as five components.
 */

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LAYOUT, useLokaiSharedStyles } from '../components/shared';

/* ───────────────────────────────────────────────────────────────────────────
 * Style injection — keyframes this layer owns
 * ─────────────────────────────────────────────────────────────────────────── */

const MOTION_CSS = `
  @keyframes lokaiShimmer {
    0%  { background-position: -400px 0; }
    100%{ background-position:  400px 0; }
  }
  .lokai-shimmer-line {
    background: linear-gradient(90deg, #F2EDE6 25%, #E8E2D8 50%, #F2EDE6 75%);
    background-size: 400px 100%;
    animation: lokaiShimmer 1.6s ease-in-out infinite;
    border-radius: 3px;
  }
`;

let motionStylesInjected = false;

function injectMotionStyles() {
  if (motionStylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.dataset.lokaiMotion = 'v1';
  style.textContent = MOTION_CSS;
  document.head.appendChild(style);
  motionStylesInjected = true;
}

/* ───────────────────────────────────────────────────────────────────────────
 * StreamText — the answer being written, not the answer having arrived
 *
 * The single most recognisable motion in the AI-chat medium, and the one
 * LokAI was entirely missing. `FadeRise` makes a block appear; this makes
 * text *emerge* — which is what tells the eye the words are being produced
 * rather than pasted in. Reference: aicss/streaming-text in the component
 * vault, whose contract is seeded here:
 *
 *   - solid caret while the reveal runs, blinking only once it completes
 *   - reduced motion renders the whole string at once — the reveal is an
 *     affordance, never a gate on reading the answer
 *   - while streaming, the visible text is `aria-hidden`, so a screen reader
 *     is not read a partial sentence on every tick; the full string lands in
 *     the live region once, when the reveal completes
 *
 * Pacing is a function of the text alone (words × wordMs, capped at maxMs),
 * so the same answer always reveals at the same rate — determinism is a
 * product claim in this repo, and a wall-clock-driven reveal would quietly
 * break it. The rate is *paced comprehension*, not simulated latency.
 * ─────────────────────────────────────────────────────────────────────────── */

export interface StreamTextProps {
  children: string;
  /** ms per revealed word. 40 reads as fluid without blurring the words. */
  wordMs?: number;
  /** Ceiling on the whole reveal, so a long passage never stalls the beat. */
  maxMs?: number;
  /** Set false to render whole (confirm mode, tests, non-answer prose). */
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Split keeping the separators, so the reveal rejoins the exact original
 *  string — no double spaces, no lost newlines, byte-identical when done. */
function tokenize(text: string): string[] {
  return text.split(/(\s+)/).filter((t) => t.length > 0);
}

export function StreamText({
  children: text,
  wordMs = 40,
  maxMs = 2800,
  active = true,
  style,
  className,
}: StreamTextProps) {
  const reduce = useReducedMotion();
  const tokens = React.useMemo(() => tokenize(text), [text]);
  const words = React.useMemo(() => tokens.filter((t) => t.trim().length > 0).length, [tokens]);
  const streaming = active && !reduce && words > 1;
  const [count, setCount] = React.useState(streaming ? 0 : words);

  React.useEffect(() => {
    if (!streaming) {
      setCount(words);
      return;
    }
    setCount(0);
    /* One interval, period derived from the text: same words → same period. */
    const period = Math.max(12, Math.min(wordMs, maxMs / words));
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= words) window.clearInterval(id);
    }, period);
    return () => window.clearInterval(id);
  }, [streaming, words, wordMs, maxMs]);

  const visible = React.useMemo(() => {
    if (count >= words) return null;
    let seen = 0;
    const out: string[] = [];
    for (const t of tokens) {
      if (t.trim().length === 0) {
        out.push(t);
        continue;
      }
      seen += 1;
      if (seen > count) break;
      out.push(t);
    }
    return out.join('');
  }, [tokens, count, words]);

  const done = visible === null;
  /* The caret stays a beat after completion, then leaves. A caret that never
     goes away turns every answer into a terminal. */
  const [caretGone, setCaretGone] = React.useState(done);
  React.useEffect(() => {
    if (!done) {
      setCaretGone(false);
      return;
    }
    const id = window.setTimeout(() => setCaretGone(true), 1400);
    return () => window.clearTimeout(id);
  }, [done]);

  const caret = caretGone ? null : (
    <span className="lokai-stream-caret" data-active={done ? 'false' : 'true'} aria-hidden="true" />
  );

  if (done) return <span className={className} style={style}>{text}</span>;

  return (
    <span className={className} style={style}>
      <span aria-hidden="true">{visible}{caret}</span>
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * UserBubble — the other half of the chat medium
 *
 * A chat conversation is readable because the two sides are *asymmetric*:
 * the assistant is bare prose on the ground (L1 — an answer is not an
 * object you can pick up), and the user is a filled, right-aligned object
 * that says "this is what she said". One column of identical left-aligned
 * blocks reads as a document, not as an exchange — which is exactly what
 * the old matter-log treatment produced on the flagship screen.
 *
 * The entrance is a scale-in (opacity + 0.94 scale + 12px rise), the
 * framecn/MESSAGE anatomy from the vault, rather than the flat 8px `FadeRise`
 * rise: a message arriving has mass, and a flat fade does not say so.
 * ─────────────────────────────────────────────────────────────────────────── */

export function UserBubble({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduce
        ? { duration: 0.15, ease: 'linear' }
        : { type: 'spring', bounce: 0, visualDuration: 0.34, stiffness: 460, damping: 30 }}
      style={{ display: 'flex', justifyContent: 'flex-end' }}
    >
      <div className="lokai-chat-bubble-user">
        {children}
      </div>
    </motion.div>
  );
}

/** Call from surfaces that render shimmer. Idempotent. */
export function useMotionStyles() {
  useEffect(() => { injectMotionStyles(); }, []);
}

/* ───────────────────────────────────────────────────────────────────────────
 * FadeRise — THE entrance recipe
 * ─────────────────────────────────────────────────────────────────────────── */

export interface FadeRiseProps {
  children: React.ReactNode;
  /** Seconds. Staggered lists pass `staggerDelay(i)`. */
  delay?: number;
  /** px of rise. Default 8 — enough to read as arrival, not enough to travel. */
  y?: number;
  /** MS. Default 240. */
  duration?: number;
  /** Inside an <AnimatePresence>, leave with a soft fade instead of snapping. */
  exit?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * The one entrance. Opacity 0→1 with an 8px rise. Under reduced motion the
 * transform drops and a short opacity fade carries the state change.
 */
export function FadeRise({ children, delay = 0, y = 8, duration = 240, exit: withExit, style, className }: FadeRiseProps) {
  const reduce = useReducedMotion();
  const seconds = duration / 1000;

  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={withExit
        ? (reduce
          ? { opacity: 0, transition: { duration: 0.15, ease: 'linear' } }
          : { opacity: 0, y: -4, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } })
        : undefined}
      transition={reduce
        ? { duration: 0.15, ease: 'linear', delay }
        : { duration: seconds, ease: [0.22, 1, 0.36, 1], delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/** Delay for the i-th item of a staggered group. 60ms is the app's step. */
export function staggerDelay(index: number, step = 0.06): number {
  return index * step;
}

/**
 * Renders children as a staggered FadeRise group. For static lists — chips,
 * reveal sequences, checklist rows. Keys come from React.Children; give each
 * child a stable key when the list can reorder.
 */
export function Stagger({ children, step = 0.06, style }: { children: React.ReactNode; step?: number; style?: React.CSSProperties }) {
  return (
    <>
      {React.Children.toArray(children).filter(Boolean).map((child, i) => (
        <FadeRise key={i} delay={staggerDelay(i, step)} style={style}>
          {child}
        </FadeRise>
      ))}
    </>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * WorkingDots / ShimmerLine — the "working" states
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * The three breathing dots — the app's "LokAI is working" state. The
 * `lokaiDot` keyframes are canonical in shared.tsx's injected CSS (single
 * definition; Chat.tsx's desktop copy is retired when its consumers move
 * here), so this hook guarantees they exist wherever the dots render.
 */
export function WorkingDots({ ink = 'var(--role-anchor)', size = 7 }: { ink?: string; size?: number }) {
  useLokaiSharedStyles();
  const dot: React.CSSProperties = {
    width: size, height: size,
    borderRadius: LAYOUT.radius.full,
    background: ink,
  };
  return (
    <div role="status" aria-label="Working" style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      <span className="lokai-dot-1" style={dot} />
      <span className="lokai-dot-2" style={dot} />
      <span className="lokai-dot-3" style={dot} />
    </div>
  );
}

/**
 * A skeleton line that shimmers. Pass a width (px or %) and it reads as
 * "content is coming" rather than "content is missing". Under reduced
 * motion the global CSS block stills the loop; the line stays as a quiet
 * placeholder.
 */
export function ShimmerLine({ width = '100%', height = 10, style }: { width?: number | string; height?: number; style?: React.CSSProperties }) {
  useMotionStyles();
  return (
    <div
      aria-hidden
      className="lokai-shimmer-line"
      style={{ width, height, ...style }}
    />
  );
}

/**
 * A content-shaped placeholder that shimmers — it reads as "coming", not
 * "missing". Shape it roughly like the content it stands in for (a line for
 * a paragraph, a tall block for a card) so the layout doesn't jump on load.
 */
export function Skeleton({
  width = '100%',
  height = 48,
  radius,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: string;
  style?: React.CSSProperties;
}) {
  useMotionStyles();
  return (
    <div
      aria-hidden
      className="lokai-shimmer-line"
      style={{ width, height, borderRadius: radius ?? LAYOUT.radius.sm, ...style }}
    />
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * StageTransition — the product-driven state change
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * Direction-aware crossfade for stage/state swaps (promoted from the case
 * journey, where it was written for the 11-stage flow). `direction` is +1
 * forward / -1 backward / 0 for non-journey changes — non-journey states
 * cross-fade without direction rather than guessing one.
 *
 * Critically damped (bounce 0): this is a state change the product drove,
 * not a surface the user flung, so overshoot would be unearned.
 */
export function StageTransition({
  stageKey,
  direction,
  children,
  style,
}: {
  stageKey: string;
  direction: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  const offset = 16 * direction;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stageKey}
        aria-live="polite"
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: offset }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, x: -offset }}
        transition={
          reduce
            ? { duration: 0.15, ease: 'linear' }
            : { type: 'spring', bounce: 0, duration: 0.32 }
        }
        style={{ display: 'flex', flexDirection: 'column', gap: 14, ...style }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * NumberTicker — count as earned, not asserted
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * Count-up number (promoted from the workflow library). Animates from
 * wherever the number currently sits, not from zero — a live change
 * (4 → 5 when the last claim is grounded) must not read as a collapse to
 * zero and a re-climb, which says the opposite of what the interaction
 * means. Honors reduced motion by snapping.
 */
export function NumberTicker({ value, durationMs = 900, suffix = '' }: { value: number; durationMs?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
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

/* ───────────────────────────────────────────────────────────────────────────
 * Haptics — the touch confirmation
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * A short tactile tick for moments that already earned attention: a fact
 * confirmed, a gate unlocking, a stop acknowledged. A no-op on devices
 * without the API. Motion for the hand, not more motion for the eye.
 */
export function useHaptic(): (pattern?: number | number[]) => void {
  return (pattern: number | number[] = 8) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch { /* ignore */ }
    }
  };
}
