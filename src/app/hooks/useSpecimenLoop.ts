import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Drives a looping specimen's frame index.
 *
 * A specimen with N frames advances 0 → 1 → … → N-1 on a timer, then rests
 * on the final (most illustrative) frame after a bounded number of cycles.
 * Bounding the cycles — rather than looping forever or trying to detect
 * visibility across the portfolio's iframe boundary — caps the worst-case
 * cost no matter how many specimens sit on one long case-study page, and the
 * common case (never scrolled into view) is already handled by the parent
 * frame's mount gate.
 *
 * Reduced motion: no cycling at all — hold the first frame, which each
 * specimen orders to be its most legible.
 */
export function useSpecimenLoop(
  frameCount: number,
  opts: { active?: boolean; frameMs?: number; cycles?: number } = {},
): number {
  const { active = true, frameMs = 2200, cycles = 3 } = opts;
  const reduce = useReducedMotion();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active || reduce || frameCount <= 1) return;

    let step = 0;
    const total = frameCount * cycles; // stop after `cycles` full passes
    const id = window.setInterval(() => {
      step += 1;
      if (step >= total - 1) {
        setFrame(frameCount - 1); // rest on the final frame
        window.clearInterval(id);
        return;
      }
      setFrame(step % frameCount);
    }, frameMs);

    return () => window.clearInterval(id);
  }, [active, reduce, frameCount, frameMs, cycles]);

  return reduce ? 0 : frame;
}
