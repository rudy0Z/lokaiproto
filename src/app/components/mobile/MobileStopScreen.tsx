import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Lifebuoy } from '@phosphor-icons/react';
import {
  Screen, Stack, Row, Rule, Text, Label, Button, IconButton,
  T, S, M, ICON, ICON_WEIGHT, useHaptic,
} from '../../ui';
import { Wordmark } from '../shared';
import { StatusBar } from '../../pages/mobile/MobileHome';
import type { FailureState } from '../../data/caseWorkflow';
import { useDemo } from '../../context/DemoContext';
import { turnChrome } from '../../data/languagePacks';
import { HandoverScreen } from './HandoverPacket';

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
  const haptic = useHaptic();
  const navigate = useNavigate();
  const { facts, receipts, lastReceipt, language } = useDemo();
  const [showPacket, setShowPacket] = useState(false);
  const chrome = turnChrome(language);

  /* Phase 2.3 — the trigger. Only when the last computed receipt actually
     stopped: the matter journey can open this screen without a fresh decision
     (a deep link, a scene swap), and inventing a trigger there would be a
     fabricated provenance claim — the exact thing the gates ban. */
  const stopTrigger = React.useMemo(() => {
    const r = lastReceipt;
    if (!r || r.outcomeKind !== 'stop') return null;
    const markers = r.because ?? [];
    if (markers.length === 0) return null;
    const gateName = chrome.gates[r.gate] ?? r.gate;
    return chrome.stopTrigger(gateName, markers[0].replace(/^(?:fact|source|scene|rule):/, ''));
  }, [lastReceipt, chrome]);

  if (showPacket) {
    return (
      <HandoverScreen
        facts={facts}
        receipts={receipts}
        language={language}
        onBack={() => setShowPacket(false)}
      />
    );
  }

  return (
    <Screen
      tone="stop"
      chrome={
        <>
          <StatusBar light />
          <Row justify="between" align="center" style={{ padding: `${S[2]} ${S[4]}`, flexShrink: 0 }}>
            <IconButton label="Back" onClick={() => { haptic(); onBack(); }}>
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
          <Button icon={<Lifebuoy size={ICON.ui} weight={ICON_WEIGHT} />} onClick={() => { haptic(); onSafeAction(); }}>
            {failure.nextAction}
          </Button>
          {!absolute && onContinue && (
            <Button variant="quiet" onClick={() => { haptic(); onContinue(); }}>Continue anyway</Button>
          )}
          {/* The exit artifact (PRODUCT-JOURNEY §4.3): the receipt trail +
              confirmed facts + evidence checklist as one carried page. A stop
              is a change of venue with the paperwork intact — this is the
              paperwork. */}
          <Button
            variant="quiet"
            onClick={() => { haptic(); setShowPacket(true); }}
          >
            {chrome.handover}
          </Button>
          {/* The third exit: ask a different question. The user landed here
              from the matter journey; the chat home is the place to start a
              new conversation without abandoning the prepared matter. */}
          <Button variant="quiet" onClick={() => { haptic(); navigate('/mobile/home'); }}>
            Ask a different question
          </Button>
        </Stack>
      }
      scrollClearance={S[6]}
    >
      <Text role="pronounce">{failure.title}</Text>
      <Text tone="quiet" style={{ maxWidth: M.measure }}>{failure.body}</Text>

      {/* Phase 2.3 — the trigger sentence, same as the in-chat stop. A refusal
          that names the gate and quotes the user's own word is inspectable;
          one that doesn't is a wall. */}
      {stopTrigger && (
        <Text role="captionStrong" tone="quiet" measured={false} style={{ paddingTop: S[2] }}>
          {stopTrigger}
        </Text>
      )}

      {/* P1-4: every stop names the person. These are real, free channels —
          the refusal is never a dead end.

          L7: the stop screen gets ONE caps label, and the context strip ("Stopped
          · your case is safe") already spends it. These two section heads were
          a second and third <Label>, which is the redundancy that makes a refusal
          read as a form. The hairline does the separating; the type does the
          ranking. */}
      <Stack gap={2}>
        <Rule />
        <Text role="captionStrong" tone="quiet" measured={false}>{chrome.channelLabel}</Text>
        {failure.channels.map((ch) => (
          <Stack gap={1} key={ch.label}>
            <Text role="quiet" measured={false}>{ch.label}</Text>
            <Text role="caption" tone="quiet" measured={false}>{ch.detail}</Text>
          </Stack>
        ))}
      </Stack>

      <Stack gap={3}>
        <Rule />
        <Text role="captionStrong" tone="quiet" measured={false}>What to do instead</Text>
        <Text tone="quiet" style={{ maxWidth: M.measure }}>{failure.safeFallback}</Text>
      </Stack>
    </Screen>
  );
}
