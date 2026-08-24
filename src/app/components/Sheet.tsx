import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { C, LAYOUT, SHADOW } from './shared';

/**
 * One animated sheet/drawer primitive.
 *
 * Three components previously shipped the same `if (!open) return null` hard
 * mount/unmount with no transition at all: ScopedAskSheet (bottom sheet),
 * LokAISourceDrawer (side drawer), and the portfolio's expand overlay. Each
 * appeared and vanished instantly, and none could be dismissed mid-motion.
 *
 * Spring values follow Apple's own reference for a drawer/sheet — damping
 * 0.8, response 0.3 — which maps to motion's { bounce: 0.2, duration: 0.3 }.
 * Bounce is deliberate here and only here: a sheet is a physical surface the
 * user summoned, so a little overshoot reads as momentum. Backdrops and
 * anything not gesture-driven stay critically damped (bounce: 0).
 *
 * Reduced motion: no transform, opacity cross-fade only. The sheet still
 * animates — it just stops travelling, which is the vestibular part.
 *
 * `side="right"` collapses to a bottom sheet under `mobileBreakpoint`. That
 * is not cosmetic: LokAISourceDrawer was `width: min(420px, 100%)` over a
 * full-bleed fixed container, so on a 390px phone it became a full-screen
 * takeover that completely hid the answer it was meant to sit beside —
 * the exact inverse of the inspect-sources-without-losing-context pattern.
 */

type SheetSide = 'bottom' | 'right';

const MOBILE_BREAKPOINT = 640;

function useIsCompact(breakpoint = MOBILE_BREAKPOINT): boolean {
  const [compact, setCompact] = React.useState(
    () => typeof window !== 'undefined' && window.innerWidth < breakpoint,
  );
  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [breakpoint]);
  return compact;
}

export function Sheet({
  open,
  onClose,
  side = 'bottom',
  label,
  width = 420,
  maxHeight = '85vh',
  contain = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: SheetSide;
  label: string;
  /** Side-drawer width on wide viewports. Ignored when collapsed to bottom. */
  width?: number;
  /** Bottom-sheet height ceiling — keeps the surface behind it partly visible. */
  maxHeight?: string;
  /**
   * Contain within the nearest positioned ancestor instead of the viewport.
   *
   * The mobile screens render inside a 390px phone artboard. A `position:
   * fixed` sheet has no transform ancestor there, so in standalone/dev view
   * it resolves to the browser viewport and escapes the phone frame (in the
   * portfolio embed the iframe *is* the phone, so fixed happens to look
   * right — but the dev harness and /p views do not have that). `contain`
   * switches to `position: absolute`, which fills the artboard root (those
   * roots are position: relative). Pass it from any in-artboard call site.
   *
   * It also forces bottom-sheet layout: inside a phone, a "right drawer" is
   * always full-width, so it must behave like the compact case regardless of
   * the browser window width.
   */
  contain?: boolean;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const windowCompact = useIsCompact();
  const compact = contain || windowCompact;
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  /* A right-side drawer on a phone would cover the whole screen, so it
     becomes a bottom sheet with the content still visible above it. */
  const effectiveSide: SheetSide = side === 'right' && compact ? 'bottom' : side;

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    /* Locking document.body scroll only makes sense for a viewport-level
       sheet; a contained sheet lives inside its own scroll context. */
    const previousOverflow = contain ? '' : document.body.style.overflow;
    if (!contain) document.body.style.overflow = 'hidden';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const frame = window.requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      if (!contain) document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus();
    };
  }, [open, onClose, contain]);

  const hidden = effectiveSide === 'bottom' ? { y: '100%' } : { x: '100%' };
  const shown = effectiveSide === 'bottom' ? { y: 0 } : { x: 0 };

  const panelBase: React.CSSProperties = effectiveSide === 'bottom'
    ? {
        width: '100%',
        maxHeight,
        borderTopLeftRadius: LAYOUT.radius.card,
        borderTopRightRadius: LAYOUT.radius.card,
      }
    : {
        width: `min(${width}px, 100%)`,
        height: '100%',
        borderLeft: `1px solid ${C.border}`,
      };

  return (
    <AnimatePresence>
      {open && (
        <div
          role="presentation"
          style={{
            position: contain ? 'absolute' : 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'flex',
            alignItems: effectiveSide === 'bottom' ? 'flex-end' : 'stretch',
            justifyContent: effectiveSide === 'bottom' ? 'center' : 'flex-end',
          }}
        >
          <motion.button
            type="button"
            aria-label={`Close ${label}`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              border: 'none',
              padding: 0,
              background: 'rgba(26,25,22,0.42)',
              cursor: 'pointer',
            }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { ...hidden, opacity: 1 }}
            animate={reduce ? { opacity: 1 } : { ...shown, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { ...hidden, opacity: 1 }}
            transition={
              reduce
                ? { duration: 0.15, ease: 'linear' }
                : { type: 'spring', bounce: 0.2, duration: 0.3 }
            }
            style={{
              position: 'relative',
              zIndex: 1,
              background: C.surface,
              boxShadow: SHADOW.float,
              display: 'flex',
              flexDirection: 'column',
              outline: 'none',
              ...panelBase,
            }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
