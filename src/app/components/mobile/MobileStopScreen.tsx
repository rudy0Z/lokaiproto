import React from 'react';
import { ArrowLeft, Lifebuoy } from '@phosphor-icons/react';
import {
  Screen, Stack, Row, Rule, Text, Label, Button, IconButton,
  T, S, ICON, ICON_WEIGHT,
} from '../../ui';
import { Wordmark } from '../shared';
import { StatusBar } from '../../pages/mobile/MobileHome';
import type { FailureState } from '../../data/caseWorkflow';

/**
 * A stop state, full-bleed dark (L6/L8).
 *
 * The product's whole thesis is that it knows when to stop, so the refusal
 * screens must be the most designed in the app, not the least. The old failure
 * rendering was a `FailureStateCard` sitting inside the normal lit chrome —
 * status bar, top nav, header and cream ground all still bright around a dark
 * card: an "uncanny sandwich", a dark box in a light page.
 *
 * This is the fix `Screen tone="stop"` was built for: the WHOLE artboard goes
 * dark, so the refusal reads as the app changing state rather than an error
 * card. Three rules, all from the composition law:
 *
 *  - the refusal sentence is `pronounce` (28px) — the largest type in the app
 *    appears only when it refuses (or greets). That is L2 as a number.
 *  - the SAFE action is the primary, brightest button. "Continue anyway" is a
 *    quiet text link, and for an absolute stop (human review required) it is
 *    absent — you cannot make a navy "Continue" the loud choice under "do not
 *    rely on AI here" (L6).
 *  - one caps label, kind detail below the fold, nothing competing with the stop.
 */
export function MobileStopScreen({
  failure,
  onSafeAction,
  onContinue,
  onBack,
}: {
  failure: FailureState;
  onSafeAction: () => void;
  /** Omit for an absolute stop — then no "continue anyway" is offered. */
  onContinue?: () => void;
  onBack: () => void;
}) {
  const absolute = failure.riskLevel === 'human_required';

  return (
    <Screen
      tone="stop"
      chrome={
        <>
          <StatusBar light />
          <Row justify="between" align="center" style={{ padding: `${S[2]} ${S[4]}`, flexShrink: 0 }}>
            <IconButton label="Back" onClick={onBack}>
              <ArrowLeft size={ICON.row} weight={ICON_WEIGHT} color={T.stopInk} />
            </IconButton>
            <Wordmark size={18} color={T.stopInk} />
            <span style={{ width: ICON.row + S[2] }} />
          </Row>
        </>
      }
      context={<Text role="meta" tone="faint">Stopped · your case is safe</Text>}
      action={
        <Stack gap={2}>
          <Button icon={<Lifebuoy size={ICON.ui} weight={ICON_WEIGHT} />} onClick={onSafeAction}>
            {failure.nextAction}
          </Button>
          {!absolute && onContinue && (
            <Button variant="quiet" onClick={onContinue}>Continue anyway</Button>
          )}
        </Stack>
      }
      scrollClearance={S[6]}
    >
      <Text role="pronounce">{failure.title}</Text>
      <Text tone="quiet">{failure.body}</Text>

      <Stack gap={3}>
        <Rule />
        <Label>What to do instead</Label>
        <Text tone="quiet">{failure.safeFallback}</Text>
      </Stack>
    </Screen>
  );
}
