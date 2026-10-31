import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import { IconArrowRight, IconCheck, IconChevronDown, IconFile } from '../../ui/icons';
import { BrandLogo, LogoMark, C, DEVANAGARI, GRAD, LAYOUT, PLANE, SANS, SHADOW, SHADOW_SCALE, TAMIL, TYPE, useLokaiSharedStyles } from '../../components/shared';
import { useConversations, type Conversation } from '../../context/ConversationContext';
import { LANGUAGE_REGISTRY, type LanguageEntry, clarifyOptionsFor, turnChrome, type ClarifyOption } from '../../data/languagePacks';
import { HandoverPacket } from '../../components/mobile/HandoverPacket';
import { DEMO_JURISDICTION } from '../../data/demoScenarios';
import { Composer, Turn, TurnStatus, DecisionSpine } from '../../components/ai/Turn';
import { InlineFactCheck } from '../../components/ai/FactCheck';
import { DEMO_PROGRESS_STAGES, matterOf, type ResponseTurn, type TurnCitation } from '../../data/responseTurns';
import type { BecauseRef } from '../../decision/types';
import {
  Screen, Stack, Row, Rule, Card, HairlineList, HairlineRow, FadeRise, Stagger, WorkingDots,
  UserBubble, Skeleton,
  Text, Label, Amount, Badge, Button, T, M, S, ICON, typeStyle, useHaptic, useSystemStyles,
} from '../../ui';
import { Sheet } from '../../components/Sheet';
import { useDemo } from '../../context/DemoContext';
import { ARTBOARD, IS_EMBED } from '../../embed';
import { DeviceFrame } from '../../components/mobile/DeviceFrame';
import { AppScreen } from '../../components/mobile/AppScreen';
import { DemandNoticePaper } from '../../components/mobile/DemandNoticePaper';
import {
  AuditTrailList,
  EvidenceLocker,
  FirstActionChecklist,
  HumanReviewCard,
  ReviewGate,
  VerificationScratchpad,
  WorkflowActionPlan,
} from '../../components/LokAIWorkflow';
import {
  AutonomyDial,
  GuideOnlyCard,
  IntentPreviewCard,
  TrackingBanner,
  type AutonomyLevel,
} from './MobileConsumerCase';
import { AttachSheet } from './MobileNoticeInterpret';
import type { PreparedDocument } from '../../data/noticeInterpretation';
import { getPreparedDocument } from '../../data/noticeInterpretation';
import { QuickRecapPanel } from '../../components/mobile/FlashcardDeck';
import { FLASHCARD_LABELS, getConsumerFlashcards } from '../../data/flashcards';
import { factToVerification, getConsumerWorkflowState, getEvidenceLocker } from '../../data/caseWorkflow';

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED CHROME — exported for all mobile screens
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Status Bar ───────────────────────────────────────────────────────────────
export function StatusBar({ light = false }: { light?: boolean }) {
  /* `light` = sitting on the stop ground. stop-ink is white in light theme
     and navy in dark (where the stop ground is cream) — the role, not a
     literal, is what keeps this legible in both. */
  const fg = light ? 'var(--role-stop-ink)' : C.ink;
  /* The portfolio embed frame provides its own device chrome. */
  if (IS_EMBED) return null;
  return (
    <div style={{
      height: '44px', display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', padding: '0 20px 6px', flexShrink: 0,
    }}>
      <span style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 600, color: fg }}>9:41</span>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <rect x="0"   y="3"   width="3" height="9"    rx="1" fill={fg} />
          <rect x="4.5" y="1.5" width="3" height="10.5" rx="1" fill={fg} />
          <rect x="9"   y="0"   width="3" height="12"   rx="1" fill={fg} />
          <rect x="13"  y="3"   width="3" height="9"    rx="1" fill={fg} opacity="0.3" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path d="M7.5 3.5C9.3 3.5 10.9 4.2 12 5.3L13.5 3.8C12 2.3 9.9 1.5 7.5 1.5C5.1 1.5 3 2.3 1.5 3.8L3 5.3C4.1 4.2 5.7 3.5 7.5 3.5Z" fill={fg} />
          <circle cx="7.5" cy="9" r="2" fill={fg} />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0" y="1" width="21" height="10" rx="2" stroke={fg} strokeWidth="1" />
          <rect x="22" y="4" width="2" height="4" rx="0.5" fill={fg} />
          <rect x="1.5" y="2.5" width="14" height="7" rx="1" fill={fg} />
        </svg>
      </div>
    </div>
  );
}


// ─── Bottom Nav — RETIRED ─────────────────────────────────────────────────────
/* The tab bar was replaced by the MatterDrawer (chat-first navigation model,
   2026-08-27): the drawer is the app's one nav surface, and a persistent tab
   bar competed with the composer for the thumb zone. No render sites remain.
   TopNav is deleted outright (2026-09-06 audit finding 6); new screens
   use MobileTopBar. */

// ─── Home Indicator ────────────────────────────────────────────────────────────
export function HomeIndicator({ light = false }: { light?: boolean }) {
  if (IS_EMBED) return null;
  return (
    <div style={{
      height: '20px', background: light ? 'transparent' : 'var(--role-ground)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <div style={{
        width: '134px', height: '5px', borderRadius: LAYOUT.radius.xs,
        background: light ? 'var(--role-stop-ink)' : 'var(--role-ink)',
        opacity: light ? 0.4 : 0.24,
      }} />
    </div>
  );
}

/**
 * Scales the phone mock down to fit whatever viewport it is shown in.
 *
 * The artboard is a true 844px-tall device viewport. On a short laptop that is
 * taller than the window, so the old fixed frame ran off the top and bottom and
 * collided with the browser chrome. Here the frame renders at natural size and
 * the whole thing is `transform: scale()`d to the largest factor that still fits
 * (never above 1 — we scale down, never up). `offsetWidth/Height` report the
 * unscaled layout size even while transformed, so the measurement is stable.
 */
function FrameScaler({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h) return;
      const margin = 24;
      const k = Math.min(1, (window.innerWidth - margin) / w, (window.innerHeight - margin) / h);
      setNat({ w, h });
      setScale(k);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div style={nat ? { width: nat.w * scale, height: nat.h * scale, flexShrink: 0 } : { flexShrink: 0 }}>
      <div ref={ref} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 'max-content' }}>
        {children}
      </div>
    </div>
  );
}

export function MobileRouteCanvas({ children }: { children: React.ReactNode }) {
  /* Embedded: the iframe IS the phone — fill it edge to edge, no mock canvas. */
  if (IS_EMBED) {
    return (
      <div style={{ width: '100%', height: '100dvh', overflow: 'hidden' }}>
        {children}
      </div>
    );
  }
  return (
    <div style={{
      minHeight: '100vh',
      background: PLANE.reading,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: '12px',
    }}>
      <FrameScaler>
        <DeviceFrame>{children}</DeviceFrame>
      </FrameScaler>
    </div>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
export function Breadcrumb({ path }: { path: string }) {
  return (
    <div style={{
      padding: '10px 16px', background: 'transparent',
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted }}>{path}</span>
    </div>
  );
}

/**
 * Docked composer for chat-style screens.
 *
 * Was a picture of an input — a mic `<svg>` inside a plain `<div>` and a
 * `<span>` of placeholder text, with no textarea and no handlers. Now the
 * real Composer, so the mic is reachable wherever this dock appears.
 */
export function MobileInputDock({
  placeholder = 'Tell us your problem…',
  onSubmit,
}: {
  placeholder?: string;
  onSubmit?: (text: string) => void;
}) {
  const { runPreparedInput } = useDemo();
  return (
    <div style={{
      flexShrink: 0, background: 'var(--role-raised)',
      borderTop: 'none', padding: '12px 16px',
    }}>
      <Composer
        compact
        placeholder={placeholder}
        onSubmit={(text) => {
          if (onSubmit) onSubmit(text);
          else void runPreparedInput(text);
        }}
      />
    </div>
  );
}

// ─── Language Bottom Sheet ────────────────────────────────────────────────────
/* Sourced from LANGUAGE_REGISTRY (data/languagePacks.ts) rather than a local
   literal, so adding a language is one edit in one data file. The registry's
   `prepared` flag is what keeps the picker honest: the full list stays visible
   (India is multilingual — that is the product's founding thesis) but the
   eight without prepared packs are shown as not-yet-available instead of
   silently falling back to English. */
const LANG_ITEMS = LANGUAGE_REGISTRY;

/** Native names must render in their own script — SANS (Inter) has no Indic
 *  glyphs, so without this the picker itself relied on device fallback. */
function scriptFont(script: LanguageEntry['script']): string {
  if (script === 'devanagari') return DEVANAGARI;
  if (script === 'tamil') return TAMIL;
  return SANS;
}

// Shared language-label map so every screen shows the citizen's chosen language
// in its own script — the preference set on Home persists across the whole flow.
export const LANG_LABEL: Record<string, string> = {
  en: 'English', hi: 'हिन्दी', mr: 'मराठी', ta: 'தமிழ்',
  te: 'తెలుగు', bn: 'বাংলা', gu: 'ગુજરાતী', pa: 'ਪੰਜਾਬੀ',
  kn: 'ಕನ್ನಡ', ml: 'മലയാളം', or: 'ଓଡ଼ିଆ', as: 'অসমীয়া',
};
export const getLangLabel = (code: string) => LANG_LABEL[code] ?? 'English';

export function LanguageBottomSheet({ open, selected, onSelect, onClose }: {
  open: boolean; selected: string; onSelect: (code: string) => void; onClose: () => void;
}) {
  /* Migrated to the shared <Sheet> (contained to the phone artboard) — it was
     a hand-rolled absolute overlay that snapped open/closed with no exit
     transition, focus management, or escape handling. `contain` keeps it
     inside the 390px frame rather than escaping to the viewport in dev/p
     views the way a plain fixed sheet would. */
  return (
    <Sheet open={open} onClose={onClose} side="bottom" label="Choose language" contain maxHeight="520px">
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: LAYOUT.radius.xs, background: C.border }} />
        </div>
        <div style={{ padding: '20px 20px 14px' }}>
          <h2 style={{ ...typeStyle('h3'), color: C.ink, margin: '0 0 6px' }}>
            Choose language
          </h2>
          <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.muted, margin: 0 }}>
            Four languages have prepared answers in this prototype. The rest are
            designed, not built.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '0 20px 16px', overflowY: 'auto', flex: 1 }}>
          {LANG_ITEMS.map(lang => {
            const isSel = selected === lang.code;
            const available = lang.prepared;
            return (
              <button
                key={lang.code}
                onClick={() => available && onSelect(lang.code)}
                disabled={!available}
                aria-disabled={!available}
                title={available ? undefined : `${lang.english} is not prepared in this prototype`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  padding: '12px 8px',
                  background: isSel ? 'var(--role-anchor-tint)' : 'var(--role-sunken)',
                  border: 'none',
                  boxShadow: isSel ? SHADOW.xs : 'none',
                  borderRadius: LAYOUT.radius.control,
                  cursor: available ? 'pointer' : 'not-allowed',
                  position: 'relative',
                  opacity: available ? 1 : 0.45,
                  transition: 'background 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {isSel && (
                  <div style={{ position: 'absolute', top: '5px', right: '5px', width: '14px', height: '14px', borderRadius: LAYOUT.radius.full, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconCheck style={{ width: '8px', height: '8px', color: 'white' }} />
                  </div>
                )}
                <span style={{ fontFamily: scriptFont(lang.script), fontSize: TYPE.body.size, fontWeight: isSel ? 600 : 500, color: isSel ? C.navy : C.ink }}>{lang.native}</span>
                <span style={{ fontFamily: SANS, fontSize: TYPE.label.size, color: isSel ? C.navy : C.muted }}>{lang.english}</span>
              </button>
            );
          })}
        </div>
        <div style={{ height: '60px', borderTop: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <button onClick={onClose} style={{ fontFamily: SANS, fontSize: TYPE.body.size, color: C.textSoft, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 24px' }}>
            Close
          </button>
        </div>
      </div>
    </Sheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME SCREEN — redesigned
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Language-Aware Suggestion Chips ──────────────────────────────────────────
// These morph based on selected language so users in regional languages
// see tappable prompts in their own script, lowering the barrier to type.
const LANG_CHIPS: Record<string, { label: string; question: string }[]> = {
  en: [
    { label: 'Damaged mixer, seller refused', question: 'I bought a mixer grinder for ₹8,999. It arrived damaged and the seller refused a refund. What can I do?' },
    { label: 'Marketplace policy overrides?', question: 'The marketplace says its private return policy overrides my rights.' },
    { label: 'Purchase from Jan 2022',        question: 'I bought a damaged mixer in January 2022. The seller still refuses a refund. Can I file a consumer complaint now?' },
  ],
  hi: [
    { label: 'खराब मिक्सर, रिफंड मना',       question: 'मैंने ₹8,999 का मिक्सर खरीदा। खराब पहुँचा और विक्रेता ने रिफंड से मना कर दिया। मैं क्या करूँ?' },
    { label: 'मार्केटप्लेस नीति हावी?',      question: 'मार्केटप्लेस कहता है उसकी निजी रिटर्न नीति मेरे अधिकारों पर हावी है।' },
    { label: 'जनवरी 2022 की खरीद',           question: 'मैंने जनवरी 2022 में खराब मिक्सर खरीदा। विक्रेता अभी भी रिफंड नहीं दे रहा। क्या अब शिकायत दर्ज कर सकता हूँ?' },
  ],
  mr: [
    { label: 'खराब मिक्सर, परतावा नाही',     question: 'मी ₹8,999 चा मिक्सर विकत घेतला. तो खराब आला आणि विक्रेत्याने परतावा नाकारला. मी काय करू?' },
    { label: 'मार्केटप्लेस धोरण वरचढ?',      question: 'मार्केटप्लेस म्हणतो त्यांचे खाजगी रिटर्न धोरण माझ्या हक्कांवर वरचढ आहे.' },
    { label: 'जानेवारी 2022 ची खरेदी',       question: 'मी जानेवारी 2022 मध्ये खराब मिक्सर विकत घेतला. विक्रेता अजून परतावा देत नाही. आता तक्रार दाखल करता येईल का?' },
  ],
  ta: [
    { label: 'சேத மிக்சர், refund மறுப்பு',  question: 'நான் ₹8,999க்கு மிக்சர் வாங்கினேன். சேதத்துடன் வந்தது; விற்பனையாளர் refund மறுத்தார். நான் என்ன செய்வது?' },
    { label: 'மார்கெட் கொள்கை மேலோங்கும்?', question: 'மார்கெட் பிளேஸ் தன் தனி ரிட்டர்ன் கொள்கை என் உரிமைகளை மீறும் என்கிறது.' },
    { label: 'ஜனவரி 2022 வாங்குதல்',         question: 'ஜனவரி 2022இல் சேதமடைந்த மிக்சர் வாங்கினேன். விற்பனையாளர் இன்னும் refund தரவில்லை. இப்போது புகார் செய்யலாமா?' },
  ],
  te: [
    { label: 'పాడైన మిక్సర్, రిఫండ్ నిరాకరణ', question: 'నేను ₹8,999కి మిక్సర్ కొన్నాను. పాడై వచ్చింది; విక్రేత రిఫండ్ ఇవ్వలేదు. నేను ఏమి చేయాలి?' },
    { label: 'మార్కెట్ పాలసీ అధిగమిస్తుందా?', question: 'మార్కెట్‌ప్లేస్ తన ప్రైవేట్ రిటర్న్ పాలసీ నా హక్కులను అధిగమిస్తుందని చెబుతోంది.' },
    { label: 'జనవరి 2022 కొనుగోలు',          question: 'జనవరి 2022లో పాడైన మిక్సర్ కొన్నాను. విక్రేత ఇంకా రిఫండ్ ఇవ్వడం లేదు. ఇప్పుడు ఫిర్యాదు చేయవచ్చా?' },
  ],
  bn: [
    { label: 'ভাঙা মিক্সার, রিফান্ড না',     question: 'আমি ₹8,999-এ মিক্সার কিনেছি। ভাঙা অবস্থায় এসেছে আর বিক্রেতা রিফান্ড দিতে রাজি নয়। আমি কী করব?' },
    { label: 'মার্কেটপ্লেস নীতি চাপায়?',     question: 'মার্কেটপ্লেস বলে তাদের ব্যক্তিগত রিটার্ন নীতি আমার অধিকারের উপর চাপা দেয়।' },
    { label: 'জানুয়ারি ২০২২ কেনা',          question: 'জানুয়ারি ২০২২-এ ভাঙা মিক্সার কিনেছি। বিক্রেতা এখনও রিফান্ড দিচ্ছে না। এখন অভিযোগ করা যাবে?' },
  ],
};

function SuggestionChips({ lang, onSelect }: { lang: string; onSelect: (q: string) => void }) {
  useLokaiSharedStyles();
  const chips = LANG_CHIPS[lang] ?? LANG_CHIPS['en'];
  return (
    <Stack gap={2}>
      <Row gap={2} wrap style={{ justifyContent: 'center' }}>
        {chips.map(chip => (
          <FadeRise key={chip.label} delay={0.04 * chips.indexOf(chip)}>
            <button
              type="button"
              className="lokai-chip lokai-pressable"
              onClick={() => onSelect(chip.question)}
              style={{
                ...typeStyle('small'),
                fontWeight: 500,
                color: T.anchor,
                background: T.anchorTint, /* 2026-09-14 audit P0: sunken-on-ground measured 1.06:1 — the chips read as plain text. The anchor tint is the paired fill for anchor-inked chips and clears 3:1 in both themes. */
                border: 'none',
                borderRadius: LAYOUT.radius.pill,
                padding: '0 16px',
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              {chip.label}
            </button>
          </FadeRise>
        ))}
      </Row>
    </Stack>
  );
}


/* LegalSignalBand deleted — it was a triple-gradient card with a 38px grid
   overlay, the only grid texture on mobile, fighting the paper metaphor and
   adding a fourth stacked block to the empty state. Its one real message is now
   a quiet line in the empty state (see HomeArtboard); the language pills it
   carried duplicated the language chip already in the top nav. */

function ConsumerCaseStart() {
  const navigate = useNavigate();
  return (
    <Card onClick={() => navigate('/mobile/case/consumer')}>
      <Row gap={3} align="center">
        <span style={{
          width: 46, height: 46, borderRadius: LAYOUT.radius.panel,
          background: T.anchorTint, color: T.anchor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <IconFile size={ICON.feature} />
        </span>
        <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
          <Label>Guided case</Label>
          <Text role="title" measured={false}>Start Consumer Refund Case</Text>
          <Text role="caption" tone="quiet" measured={false}>Step-by-step help for a defective product or refund refusal.</Text>
        </Stack>
        <IconArrowRight size={ICON.ui} color="var(--role-anchor)" />
      </Row>
    </Card>
  );
}

/**
 * The next steps offered under a response, as in-chat destinations.
 *
 * This is the chat-first model's key move: the guided stages (verify, plan,
 * packet, escalation) are things you OPEN from the conversation once the answer
 * is on the table — not a wizard you are marched through before you ever see a
 * reply. Which chips appear is driven by the response mode, so a refusal offers
 * a human and an explanation offers the facts + the plan.
 */
/* The tools a response's chips can open. Chat-first (2026-08-28): the guided
   stages are bottom sheets opened FROM the conversation — never routes the
   user is marched through before an answer exists. */
type Tool = 'verify' | 'plan' | 'packet' | 'audit' | 'escalation' | 'handover';

function nextStepChips(turn: ResponseTurn, chrome: ReturnType<typeof turnChrome>): { label: string; tool: Tool }[] {
  switch (turn.mode) {
    case 'explain':
      return [
        { label: 'Verify the facts', tool: 'verify' },
        { label: 'Prepare the demand notice', tool: 'packet' },
        { label: 'See the full plan', tool: 'plan' },
      ];
    case 'confirm':
      return [{ label: 'Prepare the demand notice', tool: 'packet' }];
    case 'disclose':
      return [
        { label: 'Talk to a person', tool: 'escalation' },
        { label: 'What LokAI checked', tool: 'audit' },
      ];
    case 'stop': {
      /* Stops carry the exit artifact first: the handover packet IS the
         human path's paperwork. Human-required stops (high_risk) keep a
         single safe action besides it; review-recommended stops also get
         the "what was checked" door — localized, like every other door. */
      const tools: { label: string; tool: Tool }[] = [
        { label: chrome.handover, tool: 'handover' },
      ];
      if (turn.id !== 'high-risk-stop') {
        tools.push({ label: chrome.whatLokAIDid, tool: 'audit' });
      }
      return tools;
    }
    default:
      return [];
  }
}

function NextSteps({ turn, onOpenTool, language }: { turn: ResponseTurn; onOpenTool: (tool: Tool) => void; language: string }) {
  const chips = nextStepChips(turn, turnChrome(language as 'en' | 'hi' | 'mr' | 'ta'));
  if (chips.length === 0) return null;
  return (
    <Row gap={2} wrap>
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          className="lokai-pressable"
          onClick={() => onOpenTool(c.tool)}
          style={{
            ...typeStyle('small'),
            fontWeight: 600,
            color: T.anchor,
            background: T.anchorTint,
            border: 'none',
            borderRadius: LAYOUT.radius.pill,
            padding: '0 16px',
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          {c.label}
        </button>
      ))}
    </Row>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME ARTBOARD
// ═══════════════════════════════════════════════════════════════════════════════
type ChatItem =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'working' }
  /* A document dropped into the composer (§3.8a). It is a discrete object, so
     it earns a surface — but it is the USER's attachment, so it sits on the
     user side of the stream, not in a left-aligned card. */
  | { id: number; role: 'document'; doc: PreparedDocument }
  | { id: number; role: 'note'; text: string }
  | { id: number; role: 'turn'; turn: ResponseTurn }
  | { id: number; role: 'clarify'; turn: ResponseTurn; options: ClarifyOption[] };

/** The tappable answers under a clarify turn — tap one, or type instead. */
function ClarifyOptions({ options, onAnswer, disabled = false, lang = 'en' }: { options: ClarifyOption[]; onAnswer: (option: ClarifyOption) => void; disabled?: boolean; lang?: string }) {
  return (
    <Stack gap={2}>
      <Row gap={2} wrap>
        {options.map((opt, i) => (
          <FadeRise key={opt.nextTurnId} delay={0.05 * i}>
            <button
              type="button"
              className={disabled ? undefined : 'lokai-pressable'}
              disabled={disabled}
              onClick={() => onAnswer(opt)}
              style={{
                ...typeStyle('small'),
                fontWeight: 500,
                color: disabled ? T.inkFaint : T.anchor,
                background: disabled ? T.sunken : T.anchorTint,
                border: 'none',
                borderRadius: LAYOUT.radius.pill,
                padding: '0 16px',
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              {opt.label}
            </button>
          </FadeRise>
        ))}
      </Row>
      {/* Was <Text role="meta"> — a caps line shouting "…OR TYPE YOUR ANSWER
          BELOW." directly above a composer whose placeholder already says
          "Describe what happened…". The redundant instruction was the last
          all-caps label in the conversation; a quiet sentence-case caption
          says the same thing without competing with LokAI's question. */}
      <Text role="caption" tone="faint" measured={false}>{turnChrome(typeof lang === 'string' ? (lang as 'en' | 'hi' | 'mr' | 'ta') : 'en').orType}</Text>
    </Stack>
  );
}

/**
 * Home IS the conversation (chat-first, resolved 2026-08-28; tool sheets +
 * clarify middle added in the upgrade pass).
 *
 * The full arc now lives in one stream: you describe the problem, the working
 * card names the stages LokAI is running (the conversation's middle, audit
 * F1/F5), ONE clarify question is asked because its answer genuinely routes
 * the next turn (inside the two-year window → full answer; outside → the
 * statute-expiry stop; unsure → the honest partial), and the answer arrives
 * with its provenance line and chips that OPEN the tools — verify, plan,
 * demand notice, audit, escalation — as bottom sheets. The wizard routes
 * still exist for deep links; nothing in the chat navigates to them.
 */
export function HomeArtboard() {
  useSystemStyles();
  const haptic = useHaptic();
  const { selectedLanguage } = useConversations();
  const {
    runPreparedInput, resolveClarify, resetConversation,
    progressLabel, progressIndex, skipProgress, isProgressing,
    facts, confirmFact, correctFact, addAuditEvent,
    draftApproved, setDraftApproved, draftAllowed, draftLockReason,
    language, lastReceipt, receipts, scenarioId, scenario,
  } = useDemo();
  const chrome = turnChrome(language);
  const navigate = useNavigate();
  const [items, setItems] = useState<ChatItem[]>([]);
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;
  const bottomRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const atBottom = useRef(true);
  const [awayFromBottom, setAwayFromBottom] = useState(false);

  /* Auto-scroll only when the user is already at the bottom — scrolling up to
     re-read the answer must never be yanked forward by a new item. When they
     ARE away from the bottom, a quiet "jump to latest" pill appears above the
     composer instead of the app deciding for them. */
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onScroll = () => {
      const next = vp.scrollHeight - vp.scrollTop - vp.clientHeight < 80;
      atBottom.current = next;
      setAwayFromBottom((prev) => (prev === !next ? prev : !next));
    };
    vp.addEventListener('scroll', onScroll, { passive: true });
    return () => vp.removeEventListener('scroll', onScroll);
  }, []);

  const jumpToLatest = () => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    atBottom.current = true;
    setAwayFromBottom(false);
  };

  useEffect(() => {
    if (atBottom.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [items]);

  /* The working row MORPHS in place — it keeps its id and becomes the answer.
     That is deliberate, and it is the fix for a real leak: removing the row
     instead left the dead `TurnStatus` mounted at full opacity forever, because
     `AnimatePresence` never completed the exit for it (the ghost sat above the
     answer saying "Preparing your answer" next to a finished answer). Reusing
     the key means nothing is removed, so there is nothing to exit — React just
     swaps the content. It also removes any scroll jump, and the answer's own
     arrival is already animated by the Turn's zone reveal, so no entrance is
     lost by not remounting the wrapper. */
  const resolveWorking = (workingId: number, turn: ResponseTurn) => {
    setItems((prev) => {
      const tail: ChatItem = turn.mode === 'clarify'
        ? { id: workingId, role: 'clarify', turn, options: clarifyOptionsFor(language) }
        : { id: workingId, role: 'turn', turn };
      const at = prev.findIndex((i) => i.id === workingId);
      if (at === -1) return [...prev, tail];
      const next = prev.slice();
      next[at] = tail;
      return next;
    });
  };

  const send = async (text: string) => {
    const workingId = nextId();
    setItems((prev) => [...prev, { id: nextId(), role: 'user', text }, { id: workingId, role: 'working' }]);
    const turn = await runPreparedInput(text);
    resolveWorking(workingId, turn);
  };

  /* A document enters through the composer and is read IN this conversation.
     This used to `navigate('/mobile/notice?doc=…')`, which broke the app's own
     architecture — MOBILE_AI_SYSTEM §3.8a states plainly that "every document
     enters through the composer; there is no separate upload route" — and it
     meant the interpretation of your notice lived in a different stream from
     the matter it belongs to.

     The response is the SAME deterministic `notice-explain` turn the standalone
     reader produces: one interpretation, two entry points, never two answers
     (and `verify-decision.mjs` still asserts it resolves identically). */
  const sendDocument = async (doc: PreparedDocument) => {
    setAttachOpen(false);
    const docId = nextId();
    const workingId = nextId();
    setItems((prev) => [...prev, { id: docId, role: 'document', doc }, { id: workingId, role: 'working' }]);
    /* The DOCUMENT decides the input, and therefore the reading.
     *
     * This used to be the fixed string `'interpret this legal notice'` for
     * every attachment, which meant the engine matched the notice intent and
     * a payment receipt came back with the property-tax notice's answer —
     * its ₹32,480, its deadline, its ward office. The paper on screen and the
     * paper being answered were different documents, which is the one thing
     * a document interpreter must never do.
     *
     * Sending the document's own file name keeps the whole pipeline intact
     * (engine routing, receipt, audit, staged progress), so one document
     * still has one reading however it arrived, and the routing is pinned by
     * fixtures in `decision/fixtures.ts` rather than by a call-site branch. */
    const turn = await runPreparedInput(doc.fileName);
    resolveWorking(workingId, turn);
  };

  const answerClarify = async (option: ClarifyOption) => {
    const workingId = nextId();
    const confirmId = nextId();
    setItems((prev) => [
      ...prev,
      { id: nextId(), role: 'user', text: option.said ?? option.label },
      { id: workingId, role: 'working' },
    ]);
    const turn = await resolveClarify(option.nextTurnId);
    resolveWorking(workingId, turn);
  };

  /* Tool sheets — the guided stages, opened from the chat. */
  const [tool, setTool] = useState<Tool | null>(null);
  const [recapOpen, setRecapOpen] = useState(false);
  const [autonomy, setAutonomy] = useState<AutonomyLevel>('prepare');
  const [previewApproved, setPreviewApproved] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  /* The correction channel: "this answer missed my situation". Recorded in the
     case history (the live audit trail) — the one thing the product's own
     thesis requires that was missing: a way to push back that leaves a trace. */
  const flagAnswer = (flagged: ResponseTurn) => {
    addAuditEvent(`Answer flagged by user — ${flagged.id} (${flagged.mode})`);
    haptic();
  };
  /* Citation detail — opened by tapping a citation chip in the answer.
     Distinct from `tool` because the sheet body is a single citation,
     not a multi-tool stage. */
  const [openCitation, setOpenCitation] = useState<TurnCitation | null>(null);
  const workflow = getConsumerWorkflowState();

  const finishVerify = () => {
    setTool(null);
    haptic();
    addAuditEvent('All facts confirmed from the chat');
    setItems((prev) => [...prev, {
      id: nextId(),
      role: 'note',
      text: 'All facts confirmed — LokAI can prepare the demand notice for your review.',
    }]);
  };

  /* A guardrail scene swap is a new matter: the log clears with the engine
     state (P2 — stale messages survived the switch before). */
  useEffect(() => {
    setItems([]);
    resetConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  /* Deep-linkable, like ?doc= on the notice reader: ?ask=<text> opens straight
     into the conversation with that message answered — for case-study captures
     and the dev catalog. */
  const [params] = useSearchParams();
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    const ask = params.get('ask');
    if (ask) {
      started.current = true;
      /* ?then=<nextTurnId> answers the clarify in the same breath, so the
         flagship states behind the question — the explained answer with its
         ground line, its "what would change this answer" block, and the
         in-stream fact check — are directly linkable. Without it every
         capture of those states meant clicking through the conversation by
         hand, which is why none of them were in the catalog. */
      const then = params.get('then');
      void (async () => {
        await send(ask);
        if (!then) return;
        const option = clarifyOptionsFor(language).find((o) => o.nextTurnId === then);
        if (option) await answerClarify(option);
      })();
      return;
    }
    /* ?doc=<id> — a document picked in the Documents folder opens the chat
       already holding it, so the interpretation lands in the same conversation
       as the matter it belongs to. The composer is the only door a document
       enters through (§3.8a); this is that door, reached from the folder. */
    const docId = params.get('doc');
    if (docId) {
      const doc = getPreparedDocument(docId);
      if (doc) {
        started.current = true;
        void sendDocument(doc);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const empty = items.length === 0;

  /* The user's words as a matter-log entry, not a chat bubble: one left
     alignment, the log reads like a case file the conversation is building
     (open decision O1 resolved; de-chatbots the skeleton). */
  const [latestTurnId, setLatestTurnId] = useState<number | null>(null);
  useEffect(() => {
    const last = [...items].reverse().find((i) => i.role === 'turn' || i.role === 'clarify');
    setLatestTurnId(last ? last.id : null);
  }, [items]);

  const renderItem = (item: ChatItem) => {
    switch (item.role) {
      case 'user':
        /* The chat medium's other half. This was a caps-labelled sunken box
           with a 3px left border — the "file tab" pattern LLM_DESIGN_SYSTEM.md
           bans as the single most generic pattern in the app, and the exact
           inverse of what the best kit in the component vault (ai-elements)
           ships: the assistant is bare prose on the ground, and the USER turn
           is the filled, right-aligned object. (It also silently rendered
           with square corners, because `var(--radius-control)` was never
           defined.) */
        return (
          <UserBubble>
            <Text role="reading" tone="onAnchor" measured={false}>{item.text}</Text>
          </UserBubble>
        );
      case 'document':
        /* The user's attachment, on the user side. A document is a discrete
           object (L1) so it gets a raised paper surface — but it is what SHE
           handed over, so it aligns with her words rather than sitting in a
           left-aligned card that reads as the app's own output. */
        return (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: S[3],
              background: T.raised,
              borderRadius: LAYOUT.radius.panel,
              boxShadow: SHADOW_SCALE.card,
              padding: `${S[3]} ${S[4]}`,
              maxWidth: '84%',
            }}>
              <span style={{
                width: 36, height: 36, borderRadius: LAYOUT.radius.sm,
                background: T.sunken, color: T.inkQuiet,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <IconFile size={ICON.ui} />
              </span>
              <Stack gap={0} style={{ minWidth: 0 }}>
                <Text role="bodyStrong" measured={false}>{item.doc.fileName}</Text>
                <Text role="caption" tone="faint" measured={false}>
                  {item.doc.pages} {item.doc.pages === 1 ? 'page' : 'pages'} · {item.doc.sourceLangLabel}
                </Text>
              </Stack>
            </div>
          </div>
        );
      case 'working':
        return progressLabel ? (
          <Stack gap={2}>
            <TurnStatus
              label={progressLabel}
              stages={DEMO_PROGRESS_STAGES}
              activeIndex={Math.max(0, progressIndex)}
              onSkip={skipProgress}
            />
            {/* Phase 1.4 — a content-shaped placeholder while LokAI works.
               `Skeleton` has existed in ui/motion.tsx since the first pass and
               was never rendered on the flagship screen, so the 4.2s beat was
               a static capsule over empty paper. Shaped like the answer it
               stands in for, so nothing jumps when the real text lands. */}
            <Skeleton width="92%" height={14} />
            <Skeleton width="78%" height={14} />
          </Stack>
        ) : (
          /* The first beat of the await — no progress label yet, just three
             breathing dots. The user's eyes get something alive on screen
             instead of a static page that pops an answer into later. */
          <Row gap={2} align="center" style={{ padding: '6px 0' }}>
            <WorkingDots />
            <Text role="meta" tone="faint" measured={false}>
              Working through the prepared steps
            </Text>
          </Row>
        );
      case 'note':
        return (
          <Row gap={2} align="flex-start">
            <IconCheck size={14} color="var(--role-ok)" style={{ flexShrink: 0, paddingTop: 2 }} />
            <Text role="caption" tone="quiet" measured={false}>{item.text}</Text>
          </Row>
        );
      case 'clarify':
        return (
          <Stack gap={2}>
            <Turn
              turn={item.turn}
              receipt={lastReceipt && lastReceipt.turnId === item.turn.id ? lastReceipt : null}
              onOpenSource={setOpenCitation}
              onFlagAnswer={flagAnswer}
              announce={item.id === latestTurnId}
            />
            <ClarifyOptions options={item.options} onAnswer={answerClarify} disabled={isProgressing} lang={language} />
          </Stack>
        );
      default:
        return (
          <Stack gap={3}>
            <Turn
              turn={item.turn}
              announce={item.id === latestTurnId}
              receipt={lastReceipt && lastReceipt.turnId === item.turn.id ? lastReceipt : null}
              onOpenSource={setOpenCitation}
              onFlagAnswer={flagAnswer}
              onOpenRef={(ref: BecauseRef) => {
                if (ref.kind === 'source') {
                  const citation = item.turn.citations.find((c) => c.id === ref.ref) ?? item.turn.citations[0];
                  if (citation) setOpenCitation(citation);
                  else setTool('verify');
                } else {
                  setTool('verify');
                }
              }}
            />
            {/* Phase 3.2 — the verification gate, in the stream. It sits
                directly under the answer that depends on it, so "what do you
                need from me" is part of the conversation rather than a form
                behind a chip. The gate itself is unchanged: the draft CTA
                stays locked until every fact is confirmed.

                Only under the LATEST answer (L7): the fact set is the
                matter's, not the turn's, so repeating the same count down the
                whole log would be the duplication this pass exists to remove. */}
            {item.id === latestTurnId
              && (item.turn.mode === 'explain' || item.turn.mode === 'disclose')
              /* And only for the matter these facts belong to. The gate is the
                 consumer refund's — the mixer facts and the demand-notice
                 draft. Rendering it under the property-tax answer implied the
                 notice draft was waiting on the purchase date, which is not a
                 dependency that exists. */
              && matterOf(item.turn) === 'consumer' && (
              <InlineFactCheck
                facts={facts}
                onConfirm={confirmFact}
                onCorrect={() => setTool('verify')}
                language={language}
              />
            )}
            <NextSteps turn={item.turn} onOpenTool={setTool} language={language} />
          </Stack>
        );
    }
  };

  return (
    <AppScreen
      floatingAction
      action={
        <Stack gap={2}>
          {!empty && awayFromBottom && (
            <Row justify="center">
              <button
                type="button"
                onClick={jumpToLatest}
                className="lokai-pressable"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  minHeight: 36, padding: '0 16px',
                  borderRadius: LAYOUT.radius.pill,
                  border: 'none',
                  background: T.raised,
                  boxShadow: SHADOW.sm,
                  ...typeStyle('caption'),
                  fontWeight: 600,
                  color: T.anchor,
                  cursor: 'pointer',
                }}
              >
                <IconArrowRight size={ICON.inline} style={{ transform: 'rotate(90deg)' }} />
                Jump to latest
              </button>
            </Row>
          )}
          <Composer
            compact
            placeholder="Describe what happened…"
            onSubmit={send}
            disabled={isProgressing}
            onStop={skipProgress}
            onAttach={() => setAttachOpen(true)}
          />
        </Stack>
      }
      scrollClearance={M.zoneGap}
      scrollViewportRef={viewportRef}
      showWordmark={false}
      showNewChat={!empty}
      /* Quick Recap — the three-dots door. Only once the conversation has
         something worth recalling; the empty state has no facts yet. */
      showMenu={!empty}
      onMenu={() => setRecapOpen(true)}
      onNewChat={() => {
        setItems([]);
        resetConversation();
      }}
    >
      {empty ? (
        <>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: S[2], textAlign: 'center', minHeight: 0 }}>
            <LogoMark size={52} />
            {/* Vellum: the greeting is LokAI speaking, not the law — sans-tight
               display voice. The serif is reserved for the law register. */}
            <h1 style={{ ...typeStyle('display2'), textAlign: 'center', margin: `${S[2]} 0 0`, color: C.ink }}>
              What can I help you sort out?
            </h1>
            <Text tone="quiet" style={{ textAlign: 'center', maxWidth: 300 }}>
              Plain-language Indian consumer law with citations.
            </Text>
            {/* Script honesty: the greeting stays the product voice, but the
               reader's language shows beside it so the choice is visible. */}
            {language !== 'en' && (
              <Text role="meta" tone="faint" measured={false}>
                {getLangLabel(language)} · {getLangLabel('en')}
              </Text>
            )}
          </div>

          <SuggestionChips lang={selectedLanguage} onSelect={send} />

          {/* The founding feature reached directly — "a notice you can't read" is
              named in the empty state above, so it gets its own quiet door. */}
          <Button
            variant="quiet"
            size="sm"
            onClick={() => navigate('/mobile/notice')}
            iconAfter={<IconArrowRight size={ICON.inline} />}
            align="start"
          >
            Read a notice you can’t understand
          </Button>
        </>
      ) : (
        <Stack gap={4}>
          {/* The matter file frame (de-chatbot move): the state of her case is
             the first strong element above the log — stage, facts, one tap to
             the full guided file. The conversation updates this; it does not
             replace it. */}
          <Card onClick={() => navigate('/mobile/case/consumer')}>
            <Row gap={3} align="center">
              <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
                <Label>{scenario.matterTitle}</Label>
                <Row gap={2} align="center">
                  <Text role="caption" tone="quiet" measured={false}>
                    {chrome.factsConfirmedOf(facts.filter((f) => f.confirmedByUser).length, facts.length)}
                  </Text>
                  <Text role="caption" tone="faint" measured={false}>{scenario.label}</Text>
                </Row>
              </Stack>
              <IconArrowRight size={ICON.ui} color="var(--role-anchor)" />
            </Row>
          </Card>
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <FadeRise key={item.id} exit>
                {renderItem(item)}
              </FadeRise>
            ))}
          </AnimatePresence>
          {receipts.length > 0 && (
            <DecisionSpine
              receipts={receipts}
              factsSummary={chrome.factsConfirmedOf(facts.filter((f) => f.confirmedByUser).length, facts.length)}
            />
          )}
          <div ref={bottomRef} />
        </Stack>
      )}

      <Sheet
        open={tool !== null}
        onClose={() => setTool(null)}
        label={tool ? ({ verify: 'Verify the facts', plan: 'Action plan', packet: 'Demand notice', audit: 'What LokAI did', escalation: 'Talk to a person', handover: 'Handover notes' } as Record<Tool, string>)[tool] : 'Tool'}
        contain
        maxHeight="88%"
      >
        <FadeRise duration={0.22} y={4}>
          <Stack gap={4} style={{ padding: `${S[4]} ${S[5]} ${S[6]}`, flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {tool === 'verify' && (
            <>
              <EvidenceLocker items={getEvidenceLocker()} />
              <VerificationScratchpad
                /* Live facts from DemoContext (mapped state→status) — the same
                   store the case journey reads, so a confirmation settles it
                   everywhere. The gated CTA stays the product decision; here
                   completing it returns to the chat with a confirmation line. */
                facts={facts.map(factToVerification)}
                onFactConfirm={confirmFact}
                onFactCorrect={correctFact}
                onConfirmed={finishVerify}
              />
            </>
          )}
          {tool === 'plan' && (
            <WorkflowActionPlan steps={workflow.actionPlan} interactive onPacket={() => setTool('packet')} />
          )}
          {tool === 'packet' && (
            <>
              <AutonomyDial value={autonomy} onChange={setAutonomy} />
              {/* The stop rule travels with the matter: if the latest answer was
                 a stop (draftAllowed=false), drafting is locked no matter what
                 the dial says — the refusal outranks the preference. */}
              {autonomy === 'guide' || !draftAllowed ? (
                <>
                  {draftLockReason === 'stop' && autonomy !== 'guide' && (
                    <Text role="caption" tone="quiet" measured={false}>
                      Drafting is locked for this matter right now — LokAI's last answer
                      stopped here. Escalate or ask a question it can answer first.
                    </Text>
                  )}
                  {/* The other lock, and the one this prototype is actually
                     about: an answer exists, but a fact in it is not yet
                     confirmed, so the engine will not draft from it. Saying
                     "the last answer stopped here" would have been false —
                     nothing stopped; it is waiting on you. */}
                  {draftLockReason === 'facts' && autonomy !== 'guide' && (
                    <Text role="caption" tone="quiet" measured={false}>
                      Drafting is waiting on you — at least one fact behind this answer is
                      not confirmed yet. LokAI will not draft from a fact you have not
                      checked. Confirm it in the conversation and the draft opens here.
                    </Text>
                  )}
                  <GuideOnlyCard packet={workflow.filingPacket} />
                </>
              ) : !previewApproved ? (
                <IntentPreviewCard
                  packet={workflow.filingPacket}
                  onApprove={() => setPreviewApproved(true)}
                  onBack={() => setTool('plan')}
                />
              ) : (
                <>
                  {/* The notice AS PAPER is the one focal object; the consent
                     gate sits under it; the exit checklist appears only after
                     approval. No-direct-send: the user is the sender. */}
                  <DemandNoticePaper packet={workflow.filingPacket} />
                  <ReviewGate
                    draftText={[
                      'LokAI — Consumer demand notice draft (review before sending)',
                      '',
                      'Subject: Damaged mixer grinder — request for replacement or refund',
                      '',
                      'I purchased a mixer grinder from HomeKart. It arrived with a cracked jar',
                      'and is unsafe to run. I asked the seller for a repair, replacement, or',
                      'refund and the request was refused.',
                      '',
                      'Applicable law: Consumer Protection Act, 2019 — Sections 2(10), 2(11), 35.',
                      '',
                      'I am keeping the invoice, defect photos, warranty, and seller messages as',
                      'evidence and request a resolution within a reasonable period.',
                      '',
                      '— Prepared with LokAI. Please review every detail before sending.',
                    ].join('\n')}
                    onPrint={() => window.print()}
                    approved={draftApproved}
                    onApprove={setDraftApproved}
                  />
                  {draftAllowed && draftApproved && (
                    <FirstActionChecklist
                      compact
                      onComplete={() => addAuditEvent('Exit checklist completed — user owns next actions outside LokAI')}
                    />
                  )}
                  {autonomy === 'track' && draftApproved && (
                    <TrackingBanner onClick={() => { setTool(null); navigate('/mobile/case/consumer?notice=offer'); }} />
                  )}
                </>
              )}
            </>
          )}
          {tool === 'audit' && <AuditTrailList events={workflow.auditTrail} />}
          {tool === 'escalation' && <HumanReviewCard workflow={workflow} />}
          {tool === 'handover' && (
            <Stack gap={3}>
              <HandoverPacket facts={facts} receipts={receipts} language={language} />
              <Button
                variant="quiet"
                onClick={() => {
                  addAuditEvent('Handover notes printed from the chat');
                  window.print();
                }}
              >
                Print these notes
              </Button>
            </Stack>
          )}
          </Stack>
        </FadeRise>
      </Sheet>

      {/* Citation detail — a chip tap opens this. Per the case-study claim
          (D-02), a chip is a door, not a copy control: the user reads the
          source on the other side. */}
      <Sheet
        open={openCitation !== null}
        onClose={() => setOpenCitation(null)}
        label={openCitation ? openCitation.title : 'Source'}
        contain
        maxHeight="78%"
      >
        {openCitation && (
          <Stack gap={3} style={{ padding: `${S[4]} ${S[5]} ${S[6]}`, flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <Row gap={2} align="center">
              <Amount tone="anchor">{openCitation.reference}</Amount>
              <Badge tone="attest">Source</Badge>
            </Row>
            <Text role="answer" as="h3" measured={false}>
              {openCitation.title}
            </Text>
            <Text tone="quiet">
              This is the authority LokAI cited for a claim in the answer above.
              The prepared example is illustrative; expert review is still pending.
            </Text>
            <Stack gap={1}>
              <Label>What this source supports</Label>
              <Text tone="quiet">
                The full provision is consulted to ground the rule that follows in the answer.
                Tap a different chip in the answer to compare authorities; the
                audit line at the top of the answer shows the total coverage.
              </Text>
            </Stack>
            <Text role="meta" tone="faint" measured={false}>
              {openCitation.reviewLabel}
            </Text>
          </Stack>
        )}
      </Sheet>

      {/* Quick Recap — the prepared deck for this matter. Stateless between
          opens: a recap is a pass, not a progress bar. */}
      <Sheet
        open={recapOpen}
        onClose={() => setRecapOpen(false)}
        label="Quick recap"
        contain
        maxHeight="84%"
      >
        <QuickRecapPanel
          cards={getConsumerFlashcards(language)}
          labels={FLASHCARD_LABELS[language] ?? FLASHCARD_LABELS.en}
          lang={language}
        />
      </Sheet>

      {/* Prepared guardrail scenes — the eight decisions the prototype can
          prove. Until now they were reachable only by deep link or by
          already being inside a non-consumer scene, which meant the single
          most persuasive artifact in the product (the refusal taxonomy) had
          no door from the chat. `?scenes=1` renders the full gallery on the
          case screen without preselecting one. */}
      <Stack gap={2} style={{ padding: `0 ${S[5]} ${S[2]}` }}>
        <Button
          variant="quiet"
          size="sm"
          align="start"
          onClick={() => navigate('/mobile/case/consumer?scenes=1')}
        >
          See why LokAI stops — 8 prepared scenes
        </Button>
      </Stack>

      <AttachSheet
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        onPick={sendDocument}
      />
    </AppScreen>
  );
}

// ─── Route page ────────────────────────────────────────────────────────────────
export default function MobileHome() {
  return (
    <MobileRouteCanvas>
      <HomeArtboard />
    </MobileRouteCanvas>
  );
}

