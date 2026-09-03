import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import { IconArrowRight, IconCheck, IconChevronDown, IconChevronRight, IconFile } from '../../ui/icons';
import { BrandLogo, LogoMark, C, DEVANAGARI, GRAD, LAYOUT, PLANE, SANS, SERIF, SHADOW, TAMIL, TYPE, useLokaiSharedStyles } from '../../components/shared';
import { useConversations, type Conversation } from '../../context/ConversationContext';
import { LANGUAGE_REGISTRY, type LanguageEntry, clarifyOptionsFor, type ClarifyOption } from '../../data/languagePacks';
import { DEMO_JURISDICTION } from '../../data/demoScenarios';
import { Composer, Turn, TurnStatus } from '../../components/ai/Turn';
import { DEMO_PROGRESS_STAGES, type ResponseTurn } from '../../data/responseTurns';
import {
  Screen, Stack, Row, Rule, Card, HairlineList, HairlineRow, FadeRise,
  Text, Label, Amount, Button, T, M, S, ICON, typeStyle, useHaptic, useSystemStyles,
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

// ─── Top Nav — logo left + language chip right ────────────────────────────────
export function TopNav({
  onLanguageTap,
  bg = '#FFFFFF',
  langLabel = 'English',
  showDropdown = true,
}: {
  title?: string;
  onLanguageTap?: () => void;
  bg?: string;
  langLabel?: string;
  showDropdown?: boolean;
}) {
  return (
    <div style={{
      height: '56px', background: bg,
      borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center',
      padding: '0 20px', justifyContent: 'space-between', flexShrink: 0,
    }}>
      <BrandLogo size={32} />

      <button
        onClick={onLanguageTap}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'var(--role-anchor-tint)', border: `1px solid ${C.navy}`,
          borderRadius: LAYOUT.radius.pill, padding: '5px 12px',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 500, color: C.navy }}>
          {langLabel}
        </span>
        {showDropdown && (
          <IconChevronDown style={{ width: '11px', height: '11px', color: C.navy }} />
        )}
      </button>
    </div>
  );
}

// ─── Bottom Nav — RETIRED ─────────────────────────────────────────────────────
/* The tab bar was replaced by the MatterDrawer (chat-first navigation model,
   2026-08-27): the drawer is the app's one nav surface, and a persistent tab
   bar competed with the composer for the thumb zone. No render sites remain.
   TopNav above is likewise kept only for any stray legacy import; new screens
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
      borderTop: `1px solid ${C.border}`, padding: '12px 16px',
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
          <h2 style={{ fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400, color: C.ink, margin: '0 0 6px' }}>
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
                  background: isSel ? 'var(--role-anchor-tint)' : C.bg,
                  border: isSel ? `2px solid ${C.navy}` : `1px solid ${C.border}`,
                  borderRadius: LAYOUT.radius.control,
                  cursor: available ? 'pointer' : 'not-allowed',
                  position: 'relative',
                  opacity: available ? 1 : 0.45,
                  transition: 'background 0.15s ease, border-color 0.15s ease',
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
        <div style={{ height: '60px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
    { label: 'Seller refused my refund',      question: 'The seller refused my refund. Help me file a complaint.' },
  ],
  hi: [
    { label: 'खराब मिक्सर, रिफंड मना',       question: 'मैंने ₹8,999 का मिक्सर खरीदा। खराब पहुँचा और विक्रेता ने रिफंड से मना कर दिया। मैं क्या करूँ?' },
    { label: 'मार्केटप्लेस नीति हावी?',      question: 'मार्केटप्लेस कहता है उसकी निजी रिटर्न नीति मेरे अधिकारों पर हावी है।' },
    { label: 'जनवरी 2022 की खरीद',           question: 'मैंने जनवरी 2022 में खराब मिक्सर खरीदा। विक्रेता अभी भी रिफंड नहीं दे रहा। क्या अब शिकायत दर्ज कर सकता हूँ?' },
    { label: 'रिफंड से इनकार',                question: 'विक्रेता ने मेरे रिफंड से मना कर दिया। शिकायत दर्ज करने में मदद करें।' },
  ],
  mr: [
    { label: 'खराब मिक्सर, परतावा नाही',     question: 'मी ₹8,999 चा मिक्सर विकत घेतला. तो खराब आला आणि विक्रेत्याने परतावा नाकारला. मी काय करू?' },
    { label: 'मार्केटप्लेस धोरण वरचढ?',      question: 'मार्केटप्लेस म्हणतो त्यांचे खाजगी रिटर्न धोरण माझ्या हक्कांवर वरचढ आहे.' },
    { label: 'जानेवारी 2022 ची खरेदी',       question: 'मी जानेवारी 2022 मध्ये खराब मिक्सर विकत घेतला. विक्रेता अजून परतावा देत नाही. आता तक्रार दाखल करता येईल का?' },
    { label: 'परतावा नाकारला',               question: 'विक्रेत्याने माझा परतावा नाकारला. तक्रार दाखल करण्यात मदत करा.' },
  ],
  ta: [
    { label: 'சேத மிக்சர், refund மறுப்பு',  question: 'நான் ₹8,999க்கு மிக்சர் வாங்கினேன். சேதத்துடன் வந்தது; விற்பனையாளர் refund மறுத்தார். நான் என்ன செய்வது?' },
    { label: 'மார்கெட் கொள்கை மேலோங்கும்?', question: 'மார்கெட் பிளேஸ் தன் தனி ரிட்டர்ன் கொள்கை என் உரிமைகளை மீறும் என்கிறது.' },
    { label: 'ஜனவரி 2022 வாங்குதல்',         question: 'ஜனவரி 2022இல் சேதமடைந்த மிக்சர் வாங்கினேன். விற்பனையாளர் இன்னும் refund தரவில்லை. இப்போது புகார் செய்யலாமா?' },
    { label: 'Refund மறுத்தார்',              question: 'விற்பனையாளர் என் refund மறுத்தார். புகார் தாக்கல் செய்ய உதவுங்கள்.' },
  ],
  te: [
    { label: 'పాడైన మిక్సర్, రిఫండ్ నిరాకరణ', question: 'నేను ₹8,999కి మిక్సర్ కొన్నాను. పాడై వచ్చింది; విక్రేత రిఫండ్ ఇవ్వలేదు. నేను ఏమి చేయాలి?' },
    { label: 'మార్కెట్ పాలసీ అధిగమిస్తుందా?', question: 'మార్కెట్‌ప్లేస్ తన ప్రైవేట్ రిటర్న్ పాలసీ నా హక్కులను అధిగమిస్తుందని చెబుతోంది.' },
    { label: 'జనవరి 2022 కొనుగోలు',          question: 'జనవరి 2022లో పాడైన మిక్సర్ కొన్నాను. విక్రేత ఇంకా రిఫండ్ ఇవ్వడం లేదు. ఇప్పుడు ఫిర్యాదు చేయవచ్చా?' },
    { label: 'రిఫండ్ నిరాకరణ',               question: 'విక్రేత నా రిఫండ్ నిరాకరించాడు. ఫిర్యాదు దాఖలు చేయడంలో సహాయం చేయండి.' },
  ],
  bn: [
    { label: 'ভাঙা মিক্সার, রিফান্ড না',     question: 'আমি ₹8,999-এ মিক্সার কিনেছি। ভাঙা অবস্থায় এসেছে আর বিক্রেতা রিফান্ড দিতে রাজি নয়। আমি কী করব?' },
    { label: 'মার্কেটপ্লেস নীতি চাপায়?',     question: 'মার্কেটপ্লেস বলে তাদের ব্যক্তিগত রিটার্ন নীতি আমার অধিকারের উপর চাপা দেয়।' },
    { label: 'জানুয়ারি ২০২২ কেনা',          question: 'জানুয়ারি ২০২২-এ ভাঙা মিক্সার কিনেছি। বিক্রেতা এখনও রিফান্ড দিচ্ছে না। এখন অভিযোগ করা যাবে?' },
    { label: 'রিফান্ড অস্বীকার',              question: 'বিক্রেতা আমার রিফান্ড দিতে অস্বীকার করেছে। অভিযোগ দায়ের করতে সাহায্য করুন।' },
  ],
};

function SuggestionChips({ lang, onSelect }: { lang: string; onSelect: (q: string) => void }) {
  useLokaiSharedStyles();
  const chips = LANG_CHIPS[lang] ?? LANG_CHIPS['en'];
  return (
    <Stack gap={2}>
      <Label>Quick start</Label>
      <Row gap={2} wrap>
        {chips.map(chip => (
          <button
            key={chip.label}
            type="button"
            className="lokai-chip"
            onClick={() => onSelect(chip.question)}
            style={{
              ...typeStyle('small'),
              fontWeight: 500,
              color: T.anchor,
              background: T.raised,
              border: `1px solid ${T.hairline}`,
              borderRadius: LAYOUT.radius.pill,
              padding: '8px 14px',
              cursor: 'pointer',
            }}
          >
            {chip.label}
          </button>
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
type Tool = 'verify' | 'plan' | 'packet' | 'audit' | 'escalation';

const TOOL_LABELS: Record<Tool, string> = {
  verify: 'Verify the facts',
  plan: 'Action plan',
  packet: 'Demand notice',
  audit: 'What LokAI did',
  escalation: 'Talk to a person',
};

function nextStepChips(turn: ResponseTurn): { label: string; tool: Tool }[] {
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
    case 'stop':
      return [{ label: 'Talk to a person', tool: 'escalation' }];
    default:
      return [];
  }
}

function NextSteps({ turn, onOpenTool }: { turn: ResponseTurn; onOpenTool: (tool: Tool) => void }) {
  const chips = nextStepChips(turn);
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
            padding: '9px 16px',
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
  | { id: number; role: 'done'; claims: { grounded: number; total: number } }
  | { id: number; role: 'note'; text: string }
  | { id: number; role: 'turn'; turn: ResponseTurn }
  | { id: number; role: 'clarify'; turn: ResponseTurn; options: ClarifyOption[] };

/**
 * The audit line — the working card's residue.
 *
 * While LokAI works, the card names its stages ("Checking the Consumer
 * Protection Act, 2019…"). When the answer lands, the card does not
 * disappear; it collapses to this one quiet line that stays above the
 * answer as its provenance marker, and opens the full audit trail on tap.
 * Answer modes with grounding get it; a clarify (LokAI asking, not
 * answering) does not. No duration badges — the demo's timing is staging,
 * not latency, and fake precision would say otherwise.
 */
function AuditLine({ claims, onOpen }: { claims: { grounded: number; total: number }; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="lokai-pressable"
      style={{
        display: 'flex', alignItems: 'center', gap: S[2],
        background: 'none', border: 'none', padding: 0,
        cursor: 'pointer', textAlign: 'left', width: '100%',
      }}
    >
      <IconCheck size={14} color="var(--role-ok)" style={{ flexShrink: 0 }} />
      <Text role="caption" tone="quiet" measured={false} style={{ flex: 1 }}>
        Checked the Consumer Protection Act, 2019 · {claims.grounded} of {claims.total} claims trace to a source
      </Text>
      <IconChevronRight size={13} color="var(--role-ink-faint)" style={{ flexShrink: 0 }} />
    </button>
  );
}

/** The tappable answers under a clarify turn — tap one, or type instead. */
function ClarifyOptions({ options, onAnswer, disabled = false }: { options: ClarifyOption[]; onAnswer: (option: ClarifyOption) => void; disabled?: boolean }) {
  return (
    <Stack gap={2}>
      <Row gap={2} wrap>
        {options.map((opt) => (
          <button
            key={opt.nextTurnId}
            type="button"
            className={disabled ? undefined : 'lokai-pressable'}
            disabled={disabled}
            onClick={() => onAnswer(opt)}
            style={{
              ...typeStyle('small'),
              fontWeight: 600,
              color: disabled ? T.inkFaint : T.anchor,
              background: T.raised,
              border: `1px solid ${T.hairline}`,
              borderRadius: LAYOUT.radius.pill,
              padding: '9px 16px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {opt.label}
          </button>
        ))}
      </Row>
      <Text role="meta" tone="faint" measured={false}>…or type your answer above.</Text>
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
    runPreparedConversation, resolveClarify, resetConversation,
    progressLabel, progressIndex, skipProgress, isProgressing,
    facts, confirmFact, correctFact, addAuditEvent,
    draftApproved, setDraftApproved, draftAllowed,
    language,
  } = useDemo();
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

  /* A working item becomes the audit line for answer modes with grounding;
     for a clarify (LokAI asking, not answering) it simply leaves as the
     question enters. Morphing in place — same id — avoids any scroll jump. */
  const resolveWorking = (workingId: number, turn: ResponseTurn) => {
    setItems((prev) => {
      const resolved: (ChatItem | null)[] = prev.map((i) => {
        if (i.id !== workingId) return i;
        if (turn.mode === 'explain' || turn.mode === 'disclose' || turn.mode === 'stop') {
          return { id: workingId, role: 'done', claims: { grounded: turn.groundedClaims, total: turn.totalClaims } };
        }
        return null;
      });
      const kept = resolved.filter((i): i is ChatItem => i !== null);
      const tail: ChatItem = turn.mode === 'clarify'
        ? { id: nextId(), role: 'clarify', turn, options: clarifyOptionsFor(language) }
        : { id: nextId(), role: 'turn', turn };
      return [...kept, tail];
    });
  };

  const send = async (text: string) => {
    const workingId = nextId();
    setItems((prev) => [...prev, { id: nextId(), role: 'user', text }, { id: workingId, role: 'working' }]);
    const turn = await runPreparedConversation(text);
    resolveWorking(workingId, turn);
  };

  const answerClarify = async (option: ClarifyOption) => {
    const workingId = nextId();
    setItems((prev) => [...prev, { id: nextId(), role: 'user', text: option.label }, { id: workingId, role: 'working' }]);
    const turn = await resolveClarify(option.nextTurnId);
    resolveWorking(workingId, turn);
  };

  /* Tool sheets — the guided stages, opened from the chat. */
  const [tool, setTool] = useState<Tool | null>(null);
  const [autonomy, setAutonomy] = useState<AutonomyLevel>('prepare');
  const [previewApproved, setPreviewApproved] = useState(false);
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

  /* Deep-linkable, like ?doc= on the notice reader: ?ask=<text> opens straight
     into the conversation with that message answered — for case-study captures
     and the dev catalog. */
  const [params] = useSearchParams();
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    const ask = params.get('ask');
    if (!ask) return;
    started.current = true;
    void send(ask);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const empty = items.length === 0;

  const renderItem = (item: ChatItem) => {
    switch (item.role) {
      case 'user':
        return (
          <Row justify="end">
            <div style={{ background: T.anchorTint, borderRadius: LAYOUT.radius.card, padding: `${S[2]} ${S[3]}`, maxWidth: '82%' }}>
              <Text role="body" tone="anchor" measured={false}>{item.text}</Text>
            </div>
          </Row>
        );
      case 'working':
        return (
          <TurnStatus
            label={progressLabel ?? 'Working through the prepared steps'}
            stages={DEMO_PROGRESS_STAGES}
            activeIndex={Math.max(0, progressIndex)}
            onSkip={skipProgress}
          />
        );
      case 'done':
        return <AuditLine claims={item.claims} onOpen={() => setTool('audit')} />;
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
            <Turn turn={item.turn} />
            <ClarifyOptions options={item.options} onAnswer={answerClarify} disabled={isProgressing} />
          </Stack>
        );
      default:
        return (
          <Stack gap={3}>
            <Turn turn={item.turn} />
            <NextSteps turn={item.turn} onOpenTool={setTool} />
          </Stack>
        );
    }
  };

  return (
    <AppScreen
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
                  border: `1px solid ${T.hairline}`,
                  background: T.raised,
                  boxShadow: 'none',
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
          {/* Locked while a working beat is in flight — a second send would
             clobber the progress controller and fork the stream. */}
          <Composer compact placeholder="Describe what happened…" onSubmit={send} disabled={isProgressing} />
        </Stack>
      }
      scrollClearance={M.zoneGap}
      scrollViewportRef={viewportRef}
      showWordmark={false}
      showNewChat={!empty}
      onNewChat={() => {
        setItems([]);
        resetConversation();
      }}
    >
      {empty ? (
        <>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: S[3], textAlign: 'center', minHeight: 0 }}>
            <LogoMark size={52} />
            <Text role="answer" style={{ textAlign: 'center' }}>What can I help you sort out?</Text>
            <Text tone="quiet" style={{ textAlign: 'center' }}>
              Tell me a consumer problem in your own words. A refund refused, a
              damaged product, or a notice you can’t read.
            </Text>
          </div>

          <SuggestionChips lang={selectedLanguage} onSelect={send} />

          {/* The founding feature reached directly — "a notice you can't read" is
              named in the empty state above, so it gets its own quiet door. */}
          <Button
            variant="quiet"
            size="sm"
            onClick={() => navigate('/mobile/notice')}
            iconAfter={<IconArrowRight size={ICON.inline} />}
            style={{ alignSelf: 'flex-start' }}
          >
            Read a notice you can’t understand
          </Button>
        </>
      ) : (
        <Stack gap={4}>
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <FadeRise key={item.id} exit>
                {renderItem(item)}
              </FadeRise>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </Stack>
      )}

      <Sheet
        open={tool !== null}
        onClose={() => setTool(null)}
        label={tool ? TOOL_LABELS[tool] : 'Tool'}
        contain
        maxHeight="88%"
      >
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
                  {!draftAllowed && autonomy !== 'guide' && (
                    <Text role="caption" tone="quiet" measured={false}>
                      Drafting is locked for this matter right now — LokAI's last answer
                      stopped here. Escalate or ask a question it can answer first.
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
        </Stack>
      </Sheet>
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
