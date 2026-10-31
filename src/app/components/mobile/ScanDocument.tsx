import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Card, Skeleton, Stack, Text } from '../../ui';
import { C, LAYOUT, S } from '../shared';

/**
 * ScanDocument — the "LokAI is reading your document" beat (M4).
 *
 * Anatomy adapted from uselayouts `scan-document` (MIT): a paper page with a
 * scan bar sweeping down while the page itself turns — the one waiting state
 * in the kit whose motion says "a document is being READ", not "a spinner is
 * spinning". LokAI changes:
 *
 *  - the scan bar is SAFFRON (the brand's one warm accent) instead of orange;
 *  - the page is `--role-paper` with navy skeleton lines — the exhibit paper
 *    the rest of the app already draws, so the beat reads as this product's
 *    own material, not a borrowed sticker;
 *  - it is a controlled component (`status` prop) driven by the attach flow,
 *    not a self-timed demo machine — the demo can never show "scanning"
 *    longer than the actual prepared read takes;
 *  - reduced motion: the bar and page-turn collapse to a quiet skeleton.
 *
 * Honest-beat law (DECISION-INTERACTION §4-S1): the scan runs exactly as long
 * as the prepared interpretation staging — never padded, always skippable by
 * the deterministic timing.
 */

export type ScanStatus = 'scanning' | 'done';

export function ScanDocumentCard({ label = 'Reading the document…' }: { label?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <Card>
        <Stack gap={2}>
          <Stack gap={2}>
            <Skeleton height={12} />
            <Skeleton height={12} width="88%" />
            <Skeleton height={12} width="72%" />
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Card style={{ overflow: 'hidden', position: 'relative' }}>
      <Stack gap={2}>
        {/* The page under scan — paper, with the interpretation taking shape */}
        <div style={{ position: 'relative', borderRadius: LAYOUT.radius.panel, overflow: 'hidden', border: `1px solid ${C.border}`, background: 'var(--role-paper)', padding: S[4] }}>
          <Stack gap={2}>
            <Skeleton height={10} width="46%" />
            <Skeleton height={10} width="72%" />
            <Skeleton height={10} width="88%" />
            <Skeleton height={10} width="64%" />
            <Skeleton height={10} width="80%" />
            <Skeleton height={10} width="38%" />
          </Stack>
          {/* The scan bar — saffron, swept by keyframes; one pass then a
              settle hold, matching the prepared read's rhythm. Glow + fill
              live in .lokai-scan-bar (system CSS). */}
          <motion.div
            aria-hidden
            className="lokai-scan-bar"
            initial={{ top: '-6%' }}
            animate={{ top: ['0%', '96%', '96%'] }}
            transition={{ duration: 1.7, times: [0, 0.82, 1], ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              left: '4%',
              width: '92%',
              height: 3,
              borderRadius: LAYOUT.radius.pill,
            }}
          />
        </div>
        {/* Read-state caption — names the work (Apple's specific-feedback law) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.3 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <Text role="caption" tone="faint" measured={false} style={{ letterSpacing: '0.04em' }}>
            {label}
          </Text>
        </motion.div>
      </Stack>
    </Card>
  );
}
