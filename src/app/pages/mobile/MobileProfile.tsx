import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, CaretRight, GlobeSimple, Moon, ShieldCheck, UserCircle } from '@phosphor-icons/react';
import {
  Stack, Row, HairlineList, HairlineRow,
  Text, Label, Button, Switch, T, S, LAYOUT, ICON, ICON_WEIGHT, useSystemStyles,
} from '../../ui';
import { MobileRouteCanvas } from './MobileHome';
import { AppScreen } from '../../components/mobile/AppScreen';
import { useConversations } from '../../context/ConversationContext';

/**
 * Help & account.
 *
 * The tab is named "Help", so the screen leads with reaching a human — for a
 * stressed user that is the job, not settings. Rebuilt on the system 2026-08-27.
 *
 * What the old screen had and this drops:
 *  - a hardcoded 390×844 artboard (it ignored `ARTBOARD` and clipped in the
 *    portfolio embed); `Screen` uses the shared constant.
 *  - two dead links — `/mobile/onboarding/2` and `/mobile/login` — to routes
 *    that do not exist.
 *  - three stacked subscription cards, one a navy gradient. Navy is the anchor
 *    and the stop ground (L5), never a pricing decoration. Plan becomes one
 *    quiet row.
 *  - five cards total → zero. Settings are hairline rows; the one focal move is
 *    the human-help primary.
 */

const chevron = <CaretRight size={ICON.inline} weight={ICON_WEIGHT} color="var(--role-ink-faint)" />;

function ProfileArtboard() {
  useSystemStyles();
  const navigate = useNavigate();
  const { selectedLanguage } = useConversations();
  const [notificationsOn, setNotificationsOn] = useState(true);

  const langLabel = { en: 'English', hi: 'हिन्दी', mr: 'मराठी', ta: 'தமிழ்' }[selectedLanguage] ?? 'English';
  const goHuman = () => navigate('/mobile/case/consumer?stage=escalation');

  return (
    <AppScreen
      context={
        <Row gap={3} align="center">
          <span style={{
            width: 40, height: 40, borderRadius: LAYOUT.radius.full,
            background: T.anchorTint, color: T.anchor,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <UserCircle size={ICON.row} weight={ICON_WEIGHT} />
          </span>
          <Stack gap={0}>
            <Text role="bodyStrong" measured={false}>Priya Sharma</Text>
            <Text role="caption" tone="faint" measured={false}>{langLabel} · Mumbai, MH · Free plan</Text>
          </Stack>
        </Row>
      }
      action={<Button onClick={goHuman}>Talk to a person</Button>}
      scrollClearance={S[6]}
    >
      {/* Focal move — the human path. A legal tool's most valuable escape is a
          real person, so it leads rather than hiding in settings. */}
      <Stack gap={2}>
        <Text role="answer">Need a human?</Text>
        <Text tone="quiet">
          LokAI gives legal information, not legal advice. For anything urgent or
          high-stakes, a person from a legal-aid partner can take over — your
          confirmed facts carry across so you don't repeat them.
        </Text>
      </Stack>

      <Stack gap={2}>
        <Label>Preferences</Label>
        <HairlineList>
          <HairlineRow
            leading={<GlobeSimple size={ICON.row} weight={ICON_WEIGHT} color="var(--role-ink-quiet)" />}
            trailing={<Row gap={2} align="center"><Text role="caption" tone="quiet" measured={false}>{langLabel}</Text>{chevron}</Row>}
            onClick={() => navigate('/mobile/home')}
          >
            <Text role="bodyStrong" measured={false}>Language</Text>
          </HairlineRow>
          <HairlineRow
            leading={<Moon size={ICON.row} weight={ICON_WEIGHT} color="var(--role-ink-quiet)" />}
            trailing={<Text role="caption" tone="faint" measured={false}>Light</Text>}
          >
            <Text role="bodyStrong" measured={false}>Appearance</Text>
          </HairlineRow>
          <HairlineRow
            leading={<Bell size={ICON.row} weight={ICON_WEIGHT} color="var(--role-ink-quiet)" />}
            trailing={<Switch on={notificationsOn} onToggle={() => setNotificationsOn(v => !v)} label="Notifications" />}
          >
            <Text role="bodyStrong" measured={false}>Notifications</Text>
          </HairlineRow>
          <HairlineRow
            leading={<ShieldCheck size={ICON.row} weight={ICON_WEIGHT} color="var(--role-ink-quiet)" />}
            trailing={chevron}
            onClick={() => navigate('/mobile/home')}
          >
            <Text role="bodyStrong" measured={false}>Privacy & data</Text>
            <Text role="caption" tone="faint" measured={false}>Nothing is uploaded or sent in this demo</Text>
          </HairlineRow>
        </HairlineList>
      </Stack>

      <Text role="meta" tone="faint" style={{ letterSpacing: 'normal', textTransform: 'none' }}>
        LokAI provides legal information, not legal advice.
      </Text>
    </AppScreen>
  );
}

export default function MobileProfile() {
  return (
    <MobileRouteCanvas>
      <ProfileArtboard />
    </MobileRouteCanvas>
  );
}
