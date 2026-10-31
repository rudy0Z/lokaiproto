import React from 'react';
import { useNavigate } from 'react-router';
import {
  Stack, Row, Text, Button,
  T, S, LAYOUT, typeStyle, useSystemStyles,
} from '../../ui';
import { GoogleG } from '../../components/shared';
import { useConversations } from '../../context/ConversationContext';
import { useDemo } from '../../context/DemoContext';
import { StatusBar, HomeIndicator, MobileRouteCanvas } from './MobileHome';
import { ARTBOARD } from '../../embed';

/**
 * Onboarding — the one screen that states LokAI's purpose and sets the two
 * things the rest of the app assumes: the person's language, and that they're
 * signed in. Built 2026-08-28.
 *
 * The visual is coded, not a stock photo: two stacked "papers" where the back
 * one is dense and foreign and the front one is the same document made plain,
 * with the amount pulled out. That IS the product in one image — a notice you
 * can't read, turned into words you can. Sign-in is a prepared "Continue with
 * Google" (the deterministic-demo rule forbids real OAuth); language is chosen
 * here so no screen has to carry a permanent language switch.
 */

/* The prepared four — the languages with real answer packs (LANGUAGE_REGISTRY's
   `prepared` set). Onboarding only offers what the app can actually deliver. */
const LANGS: { code: string; native: string; english: string }[] = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
];

function OnboardingHero() {
  return (
    <svg width="176" height="150" viewBox="0 0 176 150" fill="none" aria-hidden style={{ display: 'block' }}>
      {/* Back page — the dense, foreign original */}
      <g transform="rotate(-7 52 78)">
        <rect x="20" y="26" width="86" height="104" rx="9" fill={T.raised} stroke={T.hairline} strokeWidth="1.5" />
        {[42, 52, 62, 72, 82, 92, 102].map((y, i) => (
          <rect key={y} x="32" y={y} width={i % 2 === 0 ? 62 : 50} height="4" rx="2" fill={T.inkFaint} opacity="0.5" />
        ))}
      </g>
      {/* Front page — the same document, made plain, one figure surfaced */}
      <g transform="rotate(5 120 76)">
        <rect x="74" y="20" width="92" height="112" rx="10" fill={T.paper} stroke={T.hairlineFirm} strokeWidth="1.5" />
        {/* clean lines */}
        {[40, 52, 64].map((y) => (
          <rect key={y} x="86" y={y} width={y === 64 ? 46 : 66} height="5" rx="2.5" fill={T.ink} opacity="0.82" />
        ))}
        {/* the surfaced amount, highlighted in the provenance tone */}
        <rect x="86" y="82" width="68" height="18" rx="5" fill={T.attestFill} />
        <rect x="92" y="88" width="40" height="6" rx="3" fill={T.attest} />
        {/* a small confirming check */}
        <circle cx="150" cy="116" r="11" fill={T.anchor} />
        <path d="M145 116l3.5 3.5 6-6.5" stroke={T.onAnchor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

function OnboardingArtboard() {
  useSystemStyles();
  const navigate = useNavigate();
  const { selectedLanguage, setSelectedLanguage } = useConversations();
  const { setLanguage } = useDemo();

  const pickLanguage = (code: string) => {
    setSelectedLanguage(code);
    /* P0-3: the onboarding choice is the engine language. Two states,
       one truth — DemoContext drives turns, ConversationContext drives chrome. */
    if (code === 'hi' || code === 'mr' || code === 'ta' || code === 'en') setLanguage(code);
  };

  const enter = () => navigate('/mobile/home');

  return (
    <div style={{ ...ARTBOARD, background: T.ground, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <StatusBar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: `${S[4]} ${S[5]} 0`, minHeight: 0, overflowY: 'auto' }}>
        {/* Hero + purpose */}
        <Stack gap={5} align="center" style={{ paddingTop: S[6], textAlign: 'center' }}>
          <OnboardingHero />
          <Stack gap={3} align="center">
            <Text role="pronounce" style={{ textAlign: 'center' }}>Legal help in words you understand</Text>
            <Text tone="quiet" style={{ textAlign: 'center', maxWidth: 320 }}>
              LokAI reads notices, letters, and forms in their own language and explains
              them in yours, with the amounts, deadlines, and next steps pulled out.
            </Text>
            {/* The "prepare, don't send" disclosure — surfaces the product's
                strongest claim at the moment the user forms their first
                expectation. Cements the founding thesis without
                overclaiming. */}
            <Text role="meta" tone="faint" measured={false} style={{ textAlign: 'center' }}>
              LokAI prepares drafts for your review — you are the sender. It never sends anything on your behalf.
            </Text>
          </Stack>
        </Stack>

        {/* Language + sign-in */}
        <Stack gap={4} style={{ paddingBottom: S[3] }}>
          <Stack gap={2}>
            <Text role="label" tone="faint" measured={false} style={{ textAlign: 'center' }}>Choose your language</Text>
            <Row gap={2} justify="center" wrap>
              {LANGS.map((l) => {
                const active = selectedLanguage === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    className="lokai-pressable"
                    aria-pressed={active}
                    onClick={() => pickLanguage(l.code)}
                    style={{
                      ...typeStyle('body'),
                      fontWeight: active ? 700 : 500,
                      color: active ? T.onAnchor : T.ink,
                      background: active ? T.anchor : T.raised,
                      border: `1px solid ${active ? T.anchor : T.hairline}`,
                      borderRadius: LAYOUT.radius.pill,
                      padding: '9px 18px',
                      cursor: 'pointer',
                    }}
                  >
                    {l.native}
                  </button>
                );
              })}
            </Row>
          </Stack>

          <Stack gap={2}>
            {/* Prepared sign-in — a real Google-style button that runs no OAuth. */}
            <button
              type="button"
              onClick={enter}
              className="lokai-pressable"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: S[3],
                width: '100%', minHeight: 52,
                background: T.raised, color: T.ink,
                border: `1px solid ${T.hairlineFirm}`,
                borderRadius: LAYOUT.radius.control,
                cursor: 'pointer',
                ...typeStyle('h4'),
                fontWeight: 600,
              }}
            >
              <GoogleG size={20} />
              Continue with Google
            </button>
            <Text role="meta" tone="faint" measured={false} style={{ textAlign: 'center', letterSpacing: 'normal', textTransform: 'none' }}>
              Prepared demo. No account is created and nothing is sent.
            </Text>
          </Stack>
        </Stack>
      </div>

      <HomeIndicator />
    </div>
  );
}

export default function MobileOnboarding() {
  return (
    <MobileRouteCanvas>
      <OnboardingArtboard />
    </MobileRouteCanvas>
  );
}
