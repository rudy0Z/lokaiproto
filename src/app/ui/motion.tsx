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

/** Call from components that render shimmer. Idempotent. */
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
  style?: React.CSSProperties;
  className?: string;
}

/**
 * The one entrance. Opacity 0→1 with an 8px rise. Under reduced motion the
 * transform drops and a short opacity fade carries the state change.
 */
export function FadeRise({ children, delay = 0, y = 8, duration = 240, style, className }: FadeRiseProps) {
  const reduce = useReducedMotion();
  const seconds = duration / 1000;

  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
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
