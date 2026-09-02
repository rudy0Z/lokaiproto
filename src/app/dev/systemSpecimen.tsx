import React from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import {
  Screen, Stack, Row, Rule, Card, HairlineList, HairlineRow,
  Text, Label, Amount, Button, Badge, ICON, ICON_STROKE, T, M,
} from '../ui';
import { MatterDrawer } from '../components/mobile/MatterDrawer';

/**
 * Proof specimens for the design system.
 *
 * Not product screens — the product screens are pending art direction. These
 * exist to demonstrate, at 390px, that the three properties the system claims
 * actually hold, because each of them was silently false before it existed:
 *
 *   tone   — `<Screen tone="stop">` inverts the WHOLE artboard, chrome
 *            included, rather than floating a dark card on a cream page
 *   script — the same component in Hindi picks a different face and leading
 *            with no call-site change
 *   ground — a full answer screen with one container, one caps label, one CTA
 *
 * Every file in `src/app/ui` is exercised here, so a regression in the system
 * shows up as a visibly wrong specimen rather than as drift discovered weeks
 * later on a screenshot.
 *
 * Written with zero inline styles below the layout kit. If a future edit needs
 * one, the system is missing a decision — add it to `ui/`, not here.
 */

/**
 * The drawer, open, over the screen it navigates from.
 *
 * Rendered against a real screen rather than on a bare canvas because a
 * navigation drawer is only judgeable in context — the scrim, the peek of the
 * page behind it, and the edge where paper meets paper are most of the design.
 */
export function SystemDrawerSpecimen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden' }}>
      <SystemAnswerSpecimen />
      <MatterDrawer open onClose={() => {}} />
    </div>
  );
}

const ANSWER_EN = 'The prepared source notes support asking for a refund.';
const ANSWER_HI = 'तैयार स्रोत नोट रिफंड माँगने के पक्ष में हैं।';

const APPLIES_EN = 'The invoice and the technician report confirm the defect, and the seller refused a replacement in writing.';
const APPLIES_HI = 'इनवॉइस और तकनीशियन की रिपोर्ट खराबी की पुष्टि करते हैं, और विक्रेता ने लिखित रूप से बदलने से मना किया।';

/** Slot 1 of the screen grammar — one quiet line, never a card. */
function ContextStrip({ lang }: { lang?: string }) {
  return (
    <Text role="meta" tone="faint" lang={lang}>
      Consumer refund · Karnataka
    </Text>
  );
}

/**
 * The answer screen, composed entirely from primitives.
 *
 * Container count: one (the exhibit card — a document is a discrete object).
 * Caps labels: one. Primary CTAs: one. Compare `AssessmentView` today, which
 * hand-writes eight style objects to reach a weaker version of this.
 */
export function SystemAnswerSpecimen({ lang }: { lang?: 'en' | 'hi' }) {
  const hi = lang === 'hi';
  return (
    <Screen
      context={<ContextStrip lang={lang} />}
      action={<Button iconAfter={<ArrowRight size={ICON.ui} strokeWidth={ICON_STROKE} />}>
        {hi ? 'कार्रवाई योजना देखें' : 'See action plan'}
      </Button>}
      scrollClearance={M.zoneGap}
    >
      {/* Slot 2 — the focal move. The serif IS the label; no eyebrow above it. */}
      <Text role="answer" lang={lang}>{hi ? ANSWER_HI : ANSWER_EN}</Text>

      <Stack gap={3}>
        <Rule />
        <Label lang={lang}>{hi ? 'यह कैसे लागू होता है' : 'How it applies'}</Label>
        <Text tone="quiet" lang={lang}>{hi ? APPLIES_HI : APPLIES_EN}</Text>
      </Stack>

      {/* An exhibit earns its container: the user could pick it up and move it. */}
      <Card>
        <Row gap={3} align="flex-start">
          <FileText size={ICON.row} strokeWidth={ICON_STROKE} color={T.attest} />
          <Stack gap={1}>
            <Text role="title" lang={lang}>invoice_hk48291.pdf</Text>
            <Text role="caption" tone="faint">2 pages · uploaded by you</Text>
          </Stack>
          <Badge tone="attest">EX-01</Badge>
        </Row>
      </Card>

      {/* Key fields as hairline rows: value strong, label quiet beneath it —
          the inversion of the caps-label-shouts pattern on the verify screen. */}
      <HairlineList>
        <HairlineRow trailing={<Amount>₹8,999</Amount>}>
          <Text role="bodyStrong" lang={lang}>{hi ? 'माँगी गई राशि' : 'Amount claimed'}</Text>
        </HairlineRow>
        <HairlineRow trailing={<Amount tone="flag">12 Sep</Amount>} flagged>
          <Text role="bodyStrong" lang={lang}>{hi ? 'जवाब देने की तारीख' : 'Reply by'}</Text>
          <Text role="caption" tone="faint" lang={lang}>{hi ? '15 दिन बचे' : '15 days left'}</Text>
        </HairlineRow>
        <HairlineRow trailing={<Amount>S. 2(6)</Amount>}>
          <Text role="bodyStrong" lang={lang}>{hi ? 'लागू धारा' : 'Section invoked'}</Text>
        </HairlineRow>
      </HairlineList>

      {/* Slot 3 — grounding as one tappable line. Not a card, not a spec table. */}
      <Button variant="quiet" size="sm">
        {hi ? '4 में से 4 दावे स्रोत तक जाते हैं' : '4 of 4 claims trace to a source'} →
      </Button>
    </Screen>
  );
}

/**
 * The same system, refusing.
 *
 * One prop changes — `tone="stop"` — and the ground, the ink, the hairlines and
 * the primary button all invert together (L8). Nothing here passes a `light`
 * flag down a tree, and nothing renders a dark box inside a lit page.
 *
 * `pronounce` (28px) appears here and nowhere else in these specimens: the
 * largest type in the app is reserved for the moment it stops.
 */
export function SystemStopSpecimen() {
  return (
    <Screen
      tone="stop"
      context={<Text role="meta" tone="faint">Stopped · human help available</Text>}
      action={
        <Stack gap={2}>
          <Button>Find legal aid near you</Button>
          <Button variant="quiet">Continue anyway</Button>
        </Stack>
      }
      scrollClearance={M.zoneGap}
    >
      <Text role="pronounce">This looks like a criminal matter. I've stopped here.</Text>
      <Text tone="quiet">
        Threats to your safety are handled by the police, not by a consumer complaint.
        Anything I drafted from here could weaken a real case.
      </Text>
      <Stack gap={3}>
        <Rule />
        <Label>What to do instead</Label>
        <Text tone="quiet">
          Call 112, or reach a legal-aid clinic in Karnataka. I can keep the facts
          you've already confirmed so you don't have to repeat them.
        </Text>
      </Stack>
    </Screen>
  );
}
