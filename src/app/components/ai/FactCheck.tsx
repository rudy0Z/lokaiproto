/**
 * InlineFactCheck — the verification gate, moved into the conversation.
 *
 * The product's signature decision is unchanged: LokAI will not draft from
 * facts the user has not confirmed (`computeDraftAllowed`, engine.ts:329).
 * What changes is *where* that decision happens.
 *
 * It used to happen in a sheet: you answered a question, then opened "Verify
 * the facts", and were handed a full panel of labelled fields — a KYC form
 * reached through a chat. That is the "fill out a full form system" the
 * product owner rejected: the aim is to gather enough information to suggest a
 * first course of action, not to complete a form.
 *
 * So the gate now lives in the stream, directly under the answer that depends
 * on it:
 *
 *   - collapsed: ONE quiet line — "3 of 4 facts confirmed — confirm the rest so
 *     I can prepare the notice ▾". Not a card (L1: a summary is not an object).
 *   - expanded: a hairline list, value in the strong position, label quiet
 *     beneath, only the flagged row filled (L1/L4)
 *   - confirmed: one line that says what unlocked
 *
 * The unlock still recomputes and still clears draft approval when a fact is
 * corrected — the product decision travels intact; only the chrome moves.
 */

import React, { useState } from 'react';
import { IconCheck, IconChevronDown, IconWarning } from '../../ui/icons';
import { HairlineList, HairlineRow, Row, Rule, Stack, Text, T, S, LAYOUT, typeStyle, useHaptic } from '../../ui';
import { turnChrome } from '../../data/languagePacks';
import type { DemoLanguage } from '../../data/responseTurns';

export interface InlineFactCheckProps {
  facts: ReadonlyArray<{
    id: string;
    label: string;
    value: string;
    state: string;
    confirmedByUser?: boolean;
    hint?: string;
  }>;
  onConfirm: (id: string) => void;
  onCorrect: (id: string) => void;
  language: DemoLanguage;
}

/**
 * THE GATE'S OWN PREDICATE — do not substitute a cheaper one.
 *
 * `computeDraftAllowed` (engine.ts:329) unlocks on
 * `confirmedByUser && state === 'confirmed'`. The count shown here must be
 * computed the same way, or the interface can promise an unlock the engine
 * refuses — the exact class of fabricated-confidence bug the gates exist to
 * prevent. It reads two fields instead of one, and it can never disagree with
 * the thing it is describing.
 */
function isConfirmed(f: { state: string; confirmedByUser?: boolean }): boolean {
  return !!f.confirmedByUser && f.state === 'confirmed';
}

export function InlineFactCheck({ facts, onConfirm, onCorrect, language }: InlineFactCheckProps) {
  const [open, setOpen] = useState(false);
  const haptic = useHaptic();
  const chrome = turnChrome(language);

  if (facts.length === 0) return null;

  const confirmed = facts.filter(isConfirmed).length;
  const allConfirmed = confirmed === facts.length;
  const flagged = facts.filter((f) => !isConfirmed(f) && f.state === 'disputed');

  /* Once everything is confirmed, the block collapses to the one line that
     matters — what it unlocked — and stays out of the way. */
  if (allConfirmed) {
    return (
      <Row gap={2} align="flex-start" style={{ padding: `${S[1]} 0` }}>
        <IconCheck size={14} color="var(--role-ok)" style={{ flexShrink: 0, paddingTop: 3 }} />
        {/* No count here either: the matter card and the decision log both
           already report it, and this line's job is to name what unlocked. */}
        <Text role="caption" tone="quiet" measured={false}>
          {chrome.factGateDone}
        </Text>
      </Row>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="lokai-pressable"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: S[2],
          width: '100%',
          background: 'none',
          border: 'none',
          padding: `${S[2]} 0`,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <IconWarning size={14} color="var(--role-flag)" style={{ flexShrink: 0 }} />
        <Text role="caption" tone="quiet" measured={false} style={{ flex: 1 }}>
          {chrome.factGatePrompt}
        </Text>
        <IconChevronDown
          size={13}
          color="var(--role-ink-faint)"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: `transform 220ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        />
      </button>

      {open && (
        <>
          <Rule />
          <HairlineList style={{ marginTop: S[1] }}>
            {facts.map((f) => {
              const isFlagged = f.state === 'disputed';
              return (
                <HairlineRow
                  key={f.id}
                  flagged={isFlagged}
                  leading={isFlagged
                    ? <IconWarning size={14} color="var(--role-flag)" style={{ marginTop: 3 }} />
                    : undefined}
                  trailing={
                    isConfirmed(f) ? (
                      <IconCheck size={14} color="var(--role-ok)" style={{ marginTop: 3 }} />
                    ) : (
                      <Row gap={2}>
                        <button
                          type="button"
                          className="lokai-pressable"
                          onClick={() => { onConfirm(f.id); haptic(); }}
                          style={{
                            ...typeStyle('caption', { fontWeight: 600, color: T.anchor }),
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: `${S[1]} ${S[2]}`,
                            borderRadius: LAYOUT.radius.sm,
                            minHeight: 32,
                          }}
                        >
                          {chrome.factConfirm}
                        </button>
                        <button
                          type="button"
                          className="lokai-pressable"
                          onClick={() => { onCorrect(f.id); haptic(); }}
                          style={{
                            ...typeStyle('caption', { fontWeight: 600, color: T.inkQuiet }),
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: `${S[1]} ${S[2]}`,
                            borderRadius: LAYOUT.radius.sm,
                            minHeight: 32,
                          }}
                        >
                          {chrome.factFix}
                        </button>
                      </Row>
                    )
                  }
                >
                  {/* Value in the strong position, label quiet beneath — the
                      inversion of the old caps-label-shouts / value-whispers
                      form row. */}
                  <Text role="bodyStrong" measured={false}>{f.value}</Text>
                  <Text role="caption" tone="quiet" measured={false}>{f.label}</Text>
                  {isFlagged && f.hint && (
                    <Text role="caption" tone="flag" measured={false} style={{ marginTop: S[1] }}>
                      {f.hint}
                    </Text>
                  )}
                </HairlineRow>
              );
            })}
          </HairlineList>
          {flagged.length > 0 && (
            <Stack gap={1} style={{ paddingTop: S[3] }}>
              <Text role="caption" tone="quiet" measured={false}>
                {chrome.factDisputed(flagged.length)}
              </Text>
            </Stack>
          )}
        </>
      )}
    </div>
  );
}
