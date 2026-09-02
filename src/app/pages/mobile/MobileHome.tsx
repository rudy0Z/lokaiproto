import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Home, MessageSquare, FileText, User, Check, ArrowRight, Circle, MapPin } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { BrandLogo, LogoMark, C, DEVANAGARI, GRAD, LAYOUT, PLANE, SANS, SERIF, SHADOW, TAMIL, TYPE, useLokaiSharedStyles } from '../../components/shared';
import { useConversations, type Conversation } from '../../context/ConversationContext';
import { LANGUAGE_REGISTRY, type LanguageEntry } from '../../data/languagePacks';
import { DEMO_JURISDICTION } from '../../data/demoScenarios';
import { Composer, Turn, TurnStatus } from '../../components/ai/Turn';
import { IconArrowRight } from '../../ui/icons';
import { DEMO_PROGRESS_STAGES, type ResponseTurn } from '../../data/responseTurns';
import {
  Screen, Stack, Row, Rule, Card, HairlineList, HairlineRow,
  Text, Label, Amount, Button, T, M, S, ICON, ICON_STROKE, typeStyle, useSystemStyles,
} from '../../ui';
import { Sheet } from '../../components/Sheet';
import { useDemo } from '../../context/DemoContext';
import { ARTBOARD, IS_EMBED } from '../../embed';
import { DeviceFrame } from '../../components/mobile/DeviceFrame';
import { AppScreen } from '../../components/mobile/AppScreen';

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED CHROME — exported for all mobile screens
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Status Bar ───────────────────────────────────────────────────────────────
export function StatusBar({ light = false }: { light?: boolean }) {
  const fg = light ? '#FFFFFF' : C.ink;
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
          background: '#EEF2F8', border: `1px solid ${C.navy}`,
          borderRadius: LAYOUT.radius.pill, padding: '5px 12px',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 500, color: C.navy }}>
          {langLabel}
        </span>
        {showDropdown && (
          <ChevronDown style={{ width: '11px', height: '11px', color: C.navy }} />
        )}
      </button>
    </div>
  );
}

// ─── Bottom Nav — 64px ────────────────────────────────────────────────────────
const NAV_TABS = [
  { key: 'home',    label: 'Home',    Icon: Home,          route: '/mobile/home'       },
  { key: 'chat',    label: 'Case',    Icon: MessageSquare, route: '/mobile/case/consumer' },
  { key: 'docs',    label: 'Files',   Icon: FileText,      route: '/mobile/files' },
  { key: 'profile', label: 'Help',    Icon: User,          route: '/mobile/profile'    },
];

export function BottomNav({ active = 'home' }: { active?: string }) {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '64px', background: '#FFFFFF',
      borderTop: `1px solid ${C.border}`,
      boxShadow: SHADOW.sm,
      display: 'flex', alignItems: 'stretch', flexShrink: 0,
      paddingBottom: '8px',
    }}>
      {NAV_TABS.map(tab => {
        const isActive = active === tab.key;
        return (
          <button key={tab.key} onClick={() => navigate(tab.route)} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-start',
            paddingTop: '8px',
            gap: '3px',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
          }}>
            {/* Active indicator bar */}
            <div style={{
              height: '3px', width: '20px', borderRadius: LAYOUT.radius.xs,
              background: isActive ? C.saffron : 'transparent',
              marginBottom: '6px',
              flexShrink: 0,
            }} />
            <tab.Icon style={{
              width: '22px', height: '22px',
              color: isActive ? C.navy : C.muted,
              strokeWidth: isActive ? 2.2 : 1.5,
            }} />
            <span style={{
              fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: isActive ? 600 : 400,
              color: isActive ? C.navy : C.muted,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Home Indicator ────────────────────────────────────────────────────────────
export function HomeIndicator({ light = false }: { light?: boolean }) {
  if (IS_EMBED) return null;
  return (
    <div style={{
      height: '20px', background: light ? 'transparent' : '#FFFFFF',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <div style={{
        width: '134px', height: '5px', borderRadius: LAYOUT.radius.xs,
        background: light ? 'rgba(255,255,255,0.3)' : C.ink,
        opacity: light ? 1 : 0.12,
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
      flexShrink: 0, background: '#FFFFFF',
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
                  background: isSel ? '#EEF2F8' : C.bg,
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
                    <Check style={{ width: '8px', height: '8px', color: 'white', strokeWidth: 3 }} />
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
          <FileText size={ICON.feature} strokeWidth={ICON_STROKE} />
        </span>
        <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
          <Label>Guided case</Label>
          <Text role="title" measured={false}>Start Consumer Refund Case</Text>
          <Text role="caption" tone="quiet" measured={false}>Step-by-step help for a defective product or refund refusal.</Text>
        </Stack>
        <ArrowRight size={ICON.ui} strokeWidth={ICON_STROKE} color="var(--role-anchor)" />
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
function nextStepChips(turn: ResponseTurn): { label: string; route: string }[] {
  switch (turn.mode) {
    case 'explain':
    case 'disclose':
      return [
        { label: 'Verify the facts', route: '/mobile/case/consumer?stage=verify' },
        { label: 'See the action plan', route: '/mobile/case/consumer?stage=plan' },
      ];
    case 'stop':
      return [{ label: 'Talk to a person', route: '/mobile/case/consumer?stage=escalation' }];
    default:
      return [];
  }
}

function NextSteps({ turn }: { turn: ResponseTurn }) {
  const navigate = useNavigate();
  const chips = nextStepChips(turn);
  if (chips.length === 0) return null;
  return (
    <Row gap={2} wrap>
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          className="lokai-pressable"
          onClick={() => navigate(c.route)}
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
  | { id: number; role: 'status' }
  | { id: number; role: 'turn'; turn: ResponseTurn };

/**
 * Home IS the conversation (chat-first, resolved 2026-08-28).
 *
 * The old home resolved the user's message into a real three-tiered response
 * and then threw them into a fixed `?stage=clarify` step — so the answer they
 * came for was never shown, and the app read as a prefilled wizard. Now the
 * message and the response live here: you type, LokAI replies inline with the
 * `Turn` (the three named zones + sources + grounding), and the guided steps
 * appear as chips you *open* from the reply. The stepper is a set of tools, not
 * a gate.
 */
export function HomeArtboard() {
  useSystemStyles();
  const { selectedLanguage } = useConversations();
  const { runPreparedInput, progressLabel, progressIndex } = useDemo();
  const navigate = useNavigate();
  const [items, setItems] = useState<ChatItem[]>([]);
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [items]);

  const send = async (text: string) => {
    const statusId = nextId();
    setItems((prev) => [...prev, { id: nextId(), role: 'user', text }, { id: statusId, role: 'status' }]);
    const turn = await runPreparedInput(text);
    setItems((prev) => [...prev.filter((i) => i.id !== statusId), { id: nextId(), role: 'turn', turn }]);
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

  return (
    <AppScreen
      action={<Composer compact placeholder="Describe what happened…" onSubmit={send} />}
      scrollClearance={M.zoneGap}
      showWordmark={false}
      showNewChat={!empty}
      onNewChat={() => setItems([])}
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
          {items.map((item) => {
            if (item.role === 'user') {
              return (
                <Row key={item.id} justify="end">
                  <div style={{ background: T.anchorTint, borderRadius: LAYOUT.radius.card, padding: `${S[2]} ${S[3]}`, maxWidth: '82%' }}>
                    <Text role="body" tone="anchor" measured={false}>{item.text}</Text>
                  </div>
                </Row>
              );
            }
            if (item.role === 'status') {
              return (
                <TurnStatus
                  key={item.id}
                  label={progressLabel ?? 'Working through the prepared steps'}
                  stages={DEMO_PROGRESS_STAGES}
                  activeIndex={Math.max(0, progressIndex)}
                />
              );
            }
            return (
              <Stack key={item.id} gap={3}>
                <Turn turn={item.turn} />
                <NextSteps turn={item.turn} />
              </Stack>
            );
          })}
          <div ref={bottomRef} />
        </Stack>
      )}
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
