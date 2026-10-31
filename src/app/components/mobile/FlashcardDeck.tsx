import React, { useMemo, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { C, LAYOUT, MOTION, S, SHADOW, typeStyle } from '../shared';
import { Amount, Badge, Stack, T, Text } from '../../ui';
import {
  flashcardKindLabel,
  type Flashcard,
  type FlashcardLabels,
} from '../../data/flashcards';

/**
 * Quick Recap deck — swipe + flip flashcards (M2, 2026 mobile redesign).
 *
 * Anatomy reference: SmoothUI `card-swipe-deck` (drag rotation with a pivot
 * below the card so tilt reads like a hand swing; velocity commit; stack of
 * three; stamps driven CONTINUOUSLY by drag distance rather than snapped at
 * a threshold) + kokonutui `card-flip` (CSS rotateY reveal). Re-implemented
 * on LokAI tokens — no imported styling, no new dependencies beyond `cn`.
 *
 * Trust rules carried over from the vault source:
 *  - one moving thing at a time: only the top card responds to the gesture;
 *  - completed things go quiet: a "got it" card leaves, a "review" card
 *    returns to the BACK of the deck (recap, never a quiz — nothing scores);
 *  - keyboard-complete: arrows commit, Enter flips, and the count is
 *    announced via aria-live;
 *  - reduced motion: drag is replaced by the two buttons — same outcomes,
 *    no vestibular travel. The buttons are always rendered: gesture and
 *    button are two doors to the same decision, never the only one.
 */

const COMMIT_DISTANCE = 110;
const COMMIT_VELOCITY = 450;

export function FlashcardDeck({
  cards,
  labels,
  lang,
}: {
  cards: Flashcard[];
  labels: FlashcardLabels;
  lang: 'en' | 'hi' | 'mr' | 'ta';
}) {
  const reduce = useReducedMotion();

  /* The live queue: "got it" removes; "review" re-appends to the back.
     State holds Flashcard objects (not ids) so a reviewed card can legally
     appear twice during one pass. */
  const [queue, setQueue] = useState<Flashcard[]>(cards);
  const [flipped, setFlipped] = useState(false);
  const [exitDir, setExitDir] = useState<0 | 1 | -1>(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-12, 12]);
  /* Stamps track the gesture continuously — the vault's premium detail. */
  const gotItOpacity = useTransform(x, [28, 120], [0, 1]);
  const reviewOpacity = useTransform(x, [-120, -28], [1, 0]);

  const total = cards.length;
  const done = total - queue.length;
  const card = queue[0];
  const next = queue[1];
  const after = queue[2];

  const reset = () => {
    setFlipped(false);
    setExitDir(0);
    x.set(0);
  };

  const commit = (dir: 1 | -1) => {
    if (!card || exitDir !== 0) return;
    setExitDir(dir);
  };

  const advance = () => {
    setQueue((prev) => prev.slice(1));
    reset();
  };

  const onDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (Math.abs(info.offset.x) > COMMIT_DISTANCE || Math.abs(info.velocity.x) > COMMIT_VELOCITY) {
      commit(info.offset.x > 0 ? 1 : -1);
    }
  };

  const progress = labels.remaining(queue.length);

  if (!card) {
    return (
      <Stack gap={3} align="center" style={{ padding: `${S[7]} ${S[4]}`, textAlign: 'center' }}>
        <Text role="answer" measured={false}>{labels.empty}</Text>
        <Text tone="quiet" measured={false} style={{ maxWidth: 280 }}>
          {done} of {total} · {labels.title}
        </Text>
      </Stack>
    );
  }

  const rendered = (
    <Stack gap={3} style={{ alignItems: 'stretch' }}>
      {/* Progress + counters — derived from the queue, never passed in
          (the vault's law: a count that drifts from the rows destroys trust). */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text role="caption" tone="quiet" measured={false}>{labels.subtitle}</Text>
        <span aria-live="polite" style={{ ...typeStyle('caption'), fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>
          {progress}
        </span>
      </div>

      {/* The stack — two quiet cards behind the actor (depth, not competition). */}
      <div style={{ position: 'relative', minHeight: 360, perspective: 1200 }}>
        {after && (
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: `0 ${S[4]}`, top: S[5],
              background: C.surface, borderRadius: LAYOUT.radius.card,
              boxShadow: SHADOW.xs, opacity: 0.5,
            }}
          />
        )}
        {next && (
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: `0 ${S[2]}`, top: S[3],
              background: C.surface, borderRadius: LAYOUT.radius.card,
              boxShadow: SHADOW.sm, opacity: 0.8,
            }}
          />
        )}

        {/* Top card — drag + flip */}
        <motion.div
          key={`${card.id}-${done}`}
          drag={reduce ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={onDragEnd}
          style={{
            position: 'relative',
            x,
            rotate,
            cursor: reduce ? 'default' : 'grab',
          }}
          animate={
            reduce
              ? { opacity: exitDir === 0 ? 1 : 0 }
              : exitDir === 0
                ? { x: 0, rotate: 0, opacity: 1 }
                : { x: exitDir * 480, rotate: exitDir * 16, opacity: 0 }
          }
          transition={
            reduce
              ? { duration: 0.15 }
              : exitDir === 0
                ? { type: 'spring', stiffness: 320, damping: 30 }
                /* MOTION.easeEnter as a bezier tuple — motion's Transition
                   types want the numeric form. */
                : { duration: 0.26, ease: [0.23, 1, 0.32, 1] }
          }
          onAnimationComplete={() => { if (exitDir !== 0) advance(); }}
        >
          {/* Flip shell — tap (not drag) turns the card. */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`${flashcardKindLabel(card.kind, lang)}: ${card.front}`}
            onClick={() => { if (Math.abs(x.get()) < 8) setFlipped((f) => !f); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((f) => !f); }
              if (e.key === 'ArrowRight') commit(1);
              if (e.key === 'ArrowLeft') commit(-1);
            }}
            style={{ perspective: 1200, outline: 'none' }}
          >
            <div
              style={{
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: `transform ${MOTION.dialog} ${MOTION.easeEnter}`,
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* FRONT — the question */}
              <div
                className="lokai-bezel"
                style={{
                  minHeight: 360,
                  display: 'flex',
                  flexDirection: 'column',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  boxShadow: SHADOW.md,
                  position: 'relative',
                }}
              >
                <div className="lokai-bezel-core" style={{ minHeight: 346, display: 'flex', flexDirection: 'column', padding: S[5] }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Badge tone="neutral">{flashcardKindLabel(card.kind, lang)}</Badge>
                  </div>
                  <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: `${S[4]} 0` }}>
                    <Text role="title" measured={false} style={{ textAlign: 'center' }}>
                      {card.front}
                    </Text>
                  </div>
                  <Text role="meta" tone="faint" measured={false} style={{ textAlign: 'center' }}>
                    {labels.flipHint}
                  </Text>
                </div>
                {/* Stamps — fade with the drag, continuous (vault detail) */}
                {!reduce && (
                  <>
                    <motion.span
                      aria-hidden
                      style={{
                        position: 'absolute', top: 18, right: 16,
                        opacity: gotItOpacity, rotate: 8,
                        ...typeStyle('label'),
                        color: 'var(--role-ok)',
                        border: '2px solid var(--role-ok)',
                        borderRadius: LAYOUT.radius.sm,
                        padding: '3px 8px',
                        background: 'var(--role-ok-fill)',
                      }}
                    >
                      {labels.gotIt}
                    </motion.span>
                    <motion.span
                      aria-hidden
                      style={{
                        position: 'absolute', top: 18, left: 16,
                        opacity: reviewOpacity, rotate: -8,
                        ...typeStyle('label'),
                        color: 'var(--role-flag)',
                        border: '2px solid var(--role-flag)',
                        borderRadius: LAYOUT.radius.sm,
                        padding: '3px 8px',
                        background: 'var(--role-flag-fill)',
                      }}
                    >
                      {labels.review}
                    </motion.span>
                  </>
                )}
              </div>

              {/* BACK — the answer */}
              <div
                className="lokai-bezel"
                style={{
                  minHeight: 360,
                  display: 'flex',
                  flexDirection: 'column',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  boxShadow: SHADOW.md,
                  position: 'absolute',
                  inset: 0,
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="lokai-bezel-core" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: S[5] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: S[2] }}>
                    <Badge tone="attest">{flashcardKindLabel(card.kind, lang)}</Badge>
                    {card.reference && (
                      <Amount tone="anchor">
                        {card.reference}
                      </Amount>
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: `${S[4]} 0` }}>
                    <Text role="bodyStrong" measured={false} style={{ textAlign: 'center' }}>
                      {card.back}
                    </Text>
                  </div>
                  <Text role="meta" tone="faint" measured={false} style={{ textAlign: 'center' }}>
                    {labels.flipHint}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* The two decisions — always rendered (gesture is never the only door). */}
      <div style={{ display: 'flex', gap: S[3], justifyContent: 'center' }}>
        <button
          type="button"
          className="lokai-pressable"
          disabled={exitDir !== 0}
          onClick={() => commit(-1)}
          style={{
            ...typeStyle('small'),
            fontWeight: 600,
            color: T.inkQuiet,
            background: T.sunken,
            border: 'none',
            borderRadius: LAYOUT.radius.pill,
            padding: '0 20px',
            minHeight: 44,
            cursor: 'pointer',
          }}
        >
          {labels.review}
        </button>
        <button
          type="button"
          className="lokai-pressable"
          disabled={exitDir !== 0}
          onClick={() => commit(1)}
          style={{
            ...typeStyle('small'),
            fontWeight: 600,
            color: T.onAnchor,
            background: T.anchor,
            border: 'none',
            borderRadius: LAYOUT.radius.pill,
            padding: '0 20px',
            minHeight: 44,
            cursor: 'pointer',
          }}
        >
          {labels.gotIt}
        </button>
      </div>
    </Stack>
  );

  return rendered;
}

/** The Quick Recap sheet body: title header + deck, ready to drop into a Sheet. */
export function QuickRecapPanel({
  cards,
  labels,
  lang,
}: {
  cards: Flashcard[];
  labels: FlashcardLabels;
  lang: 'en' | 'hi' | 'mr' | 'ta';
}) {
  const key = useMemo(() => cards.map((c) => c.id).join('|'), [cards]);
  return (
    <div style={{ padding: `${S[4]} ${S[5]} ${S[6]}`, flex: 1, minHeight: 0, overflowY: 'auto' }}>
      <h2 style={{ ...typeStyle('h3'), color: C.ink, margin: `0 0 ${S[1]}` }}>{labels.title}</h2>
      {/* key resets the deck each time the sheet opens — recap is stateless
          between sessions by design. */}
      <FlashcardDeck key={key} cards={cards} labels={labels} lang={lang} />
    </div>
  );
}
