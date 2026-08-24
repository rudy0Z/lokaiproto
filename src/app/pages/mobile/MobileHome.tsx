import React, { useState } from 'react';
import { ChevronDown, Home, MessageSquare, FileText, User, Check, ArrowRight, Circle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { BrandLogo, C, GRAD, LAYOUT, PLANE, SANS, SERIF, SHADOW, TYPE, useLokaiSharedStyles } from '../../components/shared';
import { useConversations, type Conversation } from '../../context/ConversationContext';
import { ARTBOARD, IS_EMBED } from '../../embed';

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
      overflow: 'auto',
      padding: '24px 0',
    }}>
      {children}
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

// ─── Input dock (exported for re-use in chat screens) ─────────────────────────
export function MobileInputDock({ placeholder = 'Tell us your problem...' }: { placeholder?: string }) {
  return (
    <div style={{
      flexShrink: 0, background: '#FFFFFF',
      borderTop: `1px solid ${C.border}`, padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: LAYOUT.radius.full,
          background: C.bgRaised, border: `2px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" stroke={C.muted} strokeWidth="1.1" />
            <path d="M3 8.5C3 11.3 5.2 13.5 8 13.5C10.8 13.5 13 11.3 13 8.5" stroke={C.muted} strokeWidth="1.1" strokeLinecap="round" />
            <line x1="8" y1="13.5" x2="8" y2="15.5" stroke={C.muted} strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </div>
        <span style={{ flex: 1, fontFamily: SANS, fontSize: TYPE.body.size, color: C.muted }}>{placeholder}</span>
      </div>
    </div>
  );
}

// ─── Language Bottom Sheet ────────────────────────────────────────────────────
const LANG_ITEMS = [
  { code: 'hi', name: 'हिन्दी',  en: 'Hindi'     },
  { code: 'bn', name: 'বাংলা',   en: 'Bengali'   },
  { code: 'ta', name: 'தமிழ்',  en: 'Tamil'     },
  { code: 'te', name: 'తెలుగు', en: 'Telugu'    },
  { code: 'mr', name: 'मराठी',  en: 'Marathi'   },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', en: 'Punjabi'   },
  { code: 'gu', name: 'ગુજરાતી', en: 'Gujarati'  },
  { code: 'kn', name: 'ಕನ್ನಡ',  en: 'Kannada'   },
  { code: 'or', name: 'ଓଡ଼ିଆ',  en: 'Odia'      },
  { code: 'ml', name: 'മലയാളം', en: 'Malayalam' },
  { code: 'as', name: 'অসমীয়া', en: 'Assamese'  },
  { code: 'en', name: 'English', en: 'English'   },
] as const;

// Shared language-label map so every screen shows the citizen's chosen language
// in its own script — the preference set on Home persists across the whole flow.
export const LANG_LABEL: Record<string, string> = {
  en: 'English', hi: 'हिन्दी', mr: 'मराठी', ta: 'தமிழ்',
  te: 'తెలుగు', bn: 'বাংলা', gu: 'ગુજરાતী', pa: 'ਪੰਜਾਬੀ',
  kn: 'ಕನ್ನಡ', ml: 'മലയാളം', or: 'ଓଡ଼ିଆ', as: 'অসমীয়া',
};
export const getLangLabel = (code: string) => LANG_LABEL[code] ?? 'English';

export function LanguageBottomSheet({ selected, onSelect, onClose }: {
  selected: string; onSelect: (code: string) => void; onClose: () => void;
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 30 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(26,25,22,0.5)' }} />
      <div style={{
        position: 'relative', zIndex: 1, background: C.surface,
        borderRadius: `${LAYOUT.radius.card} ${LAYOUT.radius.card} ${LAYOUT.radius.none} ${LAYOUT.radius.none}`, boxShadow: SHADOW.float,
        display: 'flex', flexDirection: 'column', maxHeight: '520px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: LAYOUT.radius.xs, background: C.border }} />
        </div>
        <div style={{ padding: '20px 20px 14px' }}>
          <h2 style={{ fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400, color: C.ink, margin: '0 0 6px' }}>
            Choose language
          </h2>
          <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.muted, margin: 0 }}>
            Responses will adapt to your selection
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '0 20px 16px', overflowY: 'auto', flex: 1 }}>
          {LANG_ITEMS.map(lang => {
            const isSel = selected === lang.code;
            return (
              <button key={lang.code} onClick={() => onSelect(lang.code)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                padding: '12px 8px',
                background: isSel ? '#EEF2F8' : C.bg,
                border: isSel ? `2px solid ${C.navy}` : `1px solid ${C.border}`,
                borderRadius: LAYOUT.radius.control, cursor: 'pointer', position: 'relative',
                transition: 'background 0.15s ease, border-color 0.15s ease',
              }}>
                {isSel && (
                  <div style={{ position: 'absolute', top: '5px', right: '5px', width: '14px', height: '14px', borderRadius: LAYOUT.radius.full, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check style={{ width: '8px', height: '8px', color: 'white', strokeWidth: 3 }} />
                  </div>
                )}
                <span style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: isSel ? 600 : 500, color: isSel ? C.navy : C.ink }}>{lang.name}</span>
                <span style={{ fontFamily: SANS, fontSize: TYPE.label.size, color: isSel ? C.navy : C.muted }}>{lang.en}</span>
              </button>
            );
          })}
        </div>
        <div style={{ height: '60px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={onClose} style={{ fontFamily: SANS, fontSize: TYPE.body.size, color: C.textSoft, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 24px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME SCREEN — redesigned
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Greeting Section ─────────────────────────────────────────────────────────
function GreetingSection() {
  return (
    <div style={{ padding: '28px 20px 16px' }}>
      {/* "Good morning," italic + "Priya" upright bold — DM Serif 26px */}
      <p style={{
        fontFamily: SERIF, fontSize: TYPE.editorial.size, fontWeight: 400,
        color: C.ink, margin: '0 0 7px', lineHeight: 1.2,
        letterSpacing: '-0.3px',
      }}>
        <span>Good morning, </span>
        <span style={{ fontWeight: 700 }}>Priya</span>
      </p>
      {/* Date + location — 13px #8A8880 */}
      <p style={{
        fontFamily: SANS, fontSize: TYPE.small.size, color: C.muted,
        margin: 0, lineHeight: 1.5,
      }}>
        Saturday, 25 March · Mumbai
      </p>
    </div>
  );
}

// ─── Active Case Timeline Card ─────────────────────────────────────────────────
// Shown when the user has a case in progress. Persistent top-of-feed anchor.
const CASE_STEPS = [
  { id: 'intake',  label: 'Intake'   },
  { id: 'clarify', label: 'Clarify'  },
  { id: 'assess',  label: 'Analysis' },
  { id: 'plan',    label: 'Plan'     },
  { id: 'packet',  label: 'Packet'   },
];

function ActiveCaseCard({ convId, title, completedSteps, isBlocked }: {
  convId: string;
  title: string;
  completedSteps: string[];
  isBlocked: boolean;
}) {
  const navigate = useNavigate();
  const lastDone = CASE_STEPS.reduce((acc, s, i) =>
    completedSteps.includes(s.id) ? i : acc, -1);
  const nextStep = CASE_STEPS[lastDone + 1];

  return (
    <div
      onClick={() => navigate(`/mobile/case/consumer?stage=${nextStep?.id || 'intake'}`)}
      style={{
        margin: '0 20px 20px',
        borderRadius: LAYOUT.radius.card,
        padding: '16px 18px',
        background: [
          'radial-gradient(ellipse 80% 90% at 0% 100%, rgba(255,227,184,0.52), transparent 68%)',
          '#FFFFFF',
        ].join(', '),
        border: `1.5px solid ${C.navy}`,
        boxShadow: SHADOW.md,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <p style={{ fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>
            Case in progress
          </p>
          <p style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 700, color: C.ink, margin: 0, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </p>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: LAYOUT.radius.full,
          background: isBlocked ? 'rgba(184,54,28,0.08)' : '#EEF2F8',
          border: `1px solid ${isBlocked ? C.red : C.navy}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <ArrowRight size={14} color={isBlocked ? C.red : C.navy} />
        </div>
      </div>

      {/* Step progress dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {CASE_STEPS.map((step, i) => {
          const done    = completedSteps.includes(step.id);
          const current = i === lastDone + 1;
          const blocked = current && isBlocked;
          return (
            <React.Fragment key={step.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: LAYOUT.radius.full,
                  background: done ? C.navy : blocked ? C.red : current ? 'rgba(16,42,76,0.12)' : '#F0EDE8',
                  border: `1.5px solid ${done ? C.navy : blocked ? C.red : current ? C.navy : C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.2s ease, border-color 0.2s ease',
                }}>
                  {done ? (
                    <Check size={10} color="#FFFFFF" strokeWidth={2.5} />
                  ) : (
                    <Circle size={8} color={current ? C.navy : '#C0BDB6'} strokeWidth={2} />
                  )}
                </div>
                <span style={{
                  fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: current || done ? 600 : 400,
                  color: done ? C.navy : current ? C.ink : C.muted,
                  whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </span>
              </div>
              {i < CASE_STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 1.5, borderRadius: LAYOUT.radius.xs,
                  background: done ? C.navy : C.border,
                  marginBottom: 16,
                  transition: 'background 0.3s ease',
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Blocked warning */}
      {isBlocked && (
        <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.red, margin: '10px 0 0', lineHeight: 1.4 }}>
          ⚠ A detail is needed before LokAI can continue. Tap to resolve.
        </p>
      )}
    </div>
  );
}

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
    <div style={{ padding: '0 20px 20px' }}>
      <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
        Quick start
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {chips.map(chip => (
          <button
            key={chip.label}
            type="button"
            className="lokai-chip"
            onClick={() => onSelect(chip.question)}
            style={{
              fontFamily: SANS,
              fontSize: TYPE.small.size,
              fontWeight: 500,
              color: C.navy,
              background: '#FFFFFF',
              border: `1px solid ${C.border}`,
              borderRadius: LAYOUT.radius.pill,
              padding: '8px 14px',
              cursor: 'pointer',
              lineHeight: 1.3,
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}


// ─── Legal Signal Band — hero card ────────────────────────────────────────────
function LegalSignalBand() {
  return (
    <div style={{
      margin: '0 20px 24px',
      borderRadius: LAYOUT.radius.plane,
      padding: '18px 18px 16px',
      background: [
        'radial-gradient(ellipse 90% 80% at 50% 0%, rgba(221,231,255,0.92), transparent 66%)',
        'radial-gradient(ellipse 70% 70% at 45% 100%, rgba(255,227,184,0.72), transparent 72%)',
        '#FFFFFF',
      ].join(', '),
      border: `1px solid ${C.border}`,
      boxShadow: SHADOW.xs,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.18,
        backgroundImage: 'linear-gradient(rgba(16,42,76,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,42,76,0.08) 1px, transparent 1px)',
        backgroundSize: '38px 38px',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          height: '24px', padding: '0 10px',
          borderRadius: LAYOUT.radius.pill,
          background: 'rgba(255,255,255,0.70)',
          border: '1px solid rgba(16,42,76,0.10)',
          fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          color: C.navy,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: LAYOUT.radius.full, background: C.saffron }} />
          Verified source trail
        </div>
        <p style={{
          fontFamily: SERIF,
          fontSize: TYPE.editorial.size,
          lineHeight: 1.08,
          letterSpacing: '-0.4px',
          color: C.ink,
          margin: '14px 0 10px',
        }}>
          Ask once. Understand the next legal step.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
          {['हिन्दी', 'मराठी', 'தமிழ்', 'বাংলা'].map(label => (
            <span key={label} style={{
              fontFamily: SANS,
              fontSize: TYPE.micro.size,
              color: C.inkSoft,
              background: 'rgba(255,255,255,0.62)',
              border: `1px solid ${C.border}`,
              borderRadius: LAYOUT.radius.pill,
              padding: '4px 9px',
            }}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConsumerCaseStart() {

  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/mobile/case/consumer')}
      style={{
        width: '100%',
        minHeight: 112,
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: LAYOUT.radius.turn,
        boxShadow: SHADOW.sm,
        padding: 16,
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 24,
      }}
    >
      <div style={{
        width: 46,
        height: 46,
        borderRadius: LAYOUT.radius.panel,
        background: '#EEF2F8',
        border: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <FileText size={19} color={C.navy} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: SANS,
          fontSize: TYPE.micro.size,
          fontWeight: 700,
          color: C.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 5px',
        }}>
          Guided case
        </p>
        <p style={{ fontFamily: SANS, fontSize: TYPE.title.size, fontWeight: 700, color: C.ink, margin: '0 0 5px' }}>
          Start Consumer Refund Case
        </p>
        <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.45, margin: 0 }}>
          Step-by-step help for a defective product or refund refusal.
        </p>
      </div>
      <ArrowRight size={17} color={C.navy} />
    </button>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline',
      justifyContent: 'space-between', marginBottom: '12px',
    }}>
      <span style={{
        fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400, color: C.ink,
        letterSpacing: '-0.15px',
      }}>{title}</span>
      {action && (
        <button onClick={onAction} style={{
          fontFamily: SANS, fontSize: TYPE.small.size, color: C.navy,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          {action} →
        </button>
      )}
    </div>
  );
}

// ─── Your Conversations — real matter history, not a status card ──────────────
type ConversationRowItem = { id: string; dotColor: string; title: string; time: string; lang: string };

const STATUS_DOT_COLOR: Record<Conversation['status'], string> = {
  'Ready to File':     C.green,
  'In Progress':       C.navy,
  'Action Required':   '#C4724A',
  'Out of Scope':      C.muted,
};

/** Reads the language off the latest assistant reply so the dot list reflects the real conversation, not invented copy. */
function toConversationRowItem(conv: Conversation): ConversationRowItem {
  const lastAssistant = [...conv.messages].reverse().find(m => m.role === 'assistant');
  let lang = 'English';
  if (lastAssistant) {
    try {
      const parsed = JSON.parse(lastAssistant.content) as { responseLanguage?: string };
      if (parsed.responseLanguage) lang = getLangLabel(parsed.responseLanguage);
    } catch {
      // Non-JSON content (legacy message) — keep the English default.
    }
  }
  return {
    id: conv.id,
    dotColor: STATUS_DOT_COLOR[conv.status],
    title: conv.title,
    time: conv.since,
    lang,
  };
}

// ─── Past Matters — shared between the active-matter and empty-home states ────
function PastMattersList({ items }: { items: ConversationRowItem[] }) {
  const navigate = useNavigate();
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: '24px' }}>
      <SectionHead title="Past Matters" action="See all" onAction={() => navigate('/mobile/case/consumer?stage=audit')} />
      <div style={{ background: '#FFFFFF', borderRadius: LAYOUT.radius.card, padding: '0 16px', border: `1px solid ${C.border}` }}>
        {items.map((conv, i) => {
          // Route to the matter that was actually tapped. Only 'consumer' has a
          // built journey; every other id lands on the designed unsupported-matter
          // boundary rather than opening the consumer case under its title.
          const toCase = () => navigate(`/mobile/case/${conv.id}`);
          return (
            <div key={conv.id} onClick={toCase}>
              <ConversationRow conv={conv} isLast={i === items.length - 1} onOpen={toCase} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConversationRow({ conv, isLast, onOpen }: { conv: ConversationRowItem; isLast: boolean; onOpen: () => void }) {
  return (
    <div style={{
      height: '64px',
      display: 'flex', alignItems: 'center', gap: '12px',
      borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
      cursor: 'pointer',
    }}>
      {/* Colored dot */}
      <div style={{
        width: '10px', height: '10px', borderRadius: LAYOUT.radius.full,
        background: conv.dotColor, flexShrink: 0,
      }} />

      {/* Text column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 600,
          color: C.ink, lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {conv.title}
        </div>
        <div style={{
          fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted,
          marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {conv.time} · {conv.lang}
        </div>
      </div>

      {/* Right arrow */}
      <button
        onClick={onOpen}
        style={{
          fontFamily: SANS, fontSize: TYPE.h4.size, color: '#C8C4BC', flexShrink: 0, lineHeight: 1,
          border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
        }}
      >
        ›
      </button>
    </div>
  );
}


// ─── Floating Pill Input — position:absolute above bottom nav ─────────────────
function FloatingInput() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/mobile/case/consumer')} style={{
      position: 'absolute',
      bottom: '80px',      // 64px bottom-nav + 16px gap
      left: '16px',
      right: '16px',
      height: '56px',
      background: '#FFFFFF',
      border: `1.5px solid ${C.navy}`,
      borderRadius: LAYOUT.radius.pill,
      boxShadow: SHADOW.xs,
      display: 'flex', alignItems: 'center',
      padding: '0 10px',
      gap: '8px',
      zIndex: 20,
      cursor: 'pointer',
      textAlign: 'left',
    }}>
      {/* Voice orb — 36px, navy mic */}
      <div style={{
        width: '36px', height: '36px', borderRadius: LAYOUT.radius.full, flexShrink: 0,
        background: '#EEF2F8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" stroke={C.navy} strokeWidth="1.2" />
          <path d="M3 8.5C3 11.3 5.2 13.5 8 13.5C10.8 13.5 13 11.3 13 8.5" stroke={C.navy} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="8" y1="13.5" x2="8" y2="15.5" stroke={C.navy} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Placeholder */}
      <span style={{ flex: 1, fontFamily: SANS, fontSize: TYPE.body.size, color: C.muted }}>
        Tell us your problem...
      </span>

      {/* Send arrow — 36px gradient circle */}
      <div style={{
        width: '36px', height: '36px', borderRadius: LAYOUT.radius.full, flexShrink: 0,
        background: GRAD.buttonPrimary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}>
        <ArrowRight style={{ width: '14px', height: '14px', color: '#FFFFFF' }} />
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOME ARTBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function HomeArtboard() {
  const { selectedLanguage, setSelectedLanguage, conversations, activeId, getConversation } = useConversations();
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const navigate = useNavigate();

  // The one live matter is whichever the app explicitly activated — not a scan
  // for "any conversation that looks in-progress." A citizen has one case open
  // at a time; the rest is history.
  const activeCase = getConversation(activeId ?? '');

  // Everything else is matter history — most recent first, capped so the list
  // stays a glance, not a second dashboard.
  const historyItems = conversations
    .filter(c => c.id !== activeCase?.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)
    .map(toConversationRowItem);

  // Derive display label for the language chip (shared map — persists across screens)
  const langLabel = getLangLabel(selectedLanguage);

  const handleSuggestionTap = (question: string) => {
    // Navigate to consumer case flow — in a real app this would pre-fill the intake
    void question;
    navigate('/mobile/case/consumer');
  };

  return (
    <div style={{
      ...ARTBOARD,
      background: [
        'radial-gradient(ellipse 100% 42% at 50% 0%, rgba(221,231,255,0.60), transparent 70%)',
        'linear-gradient(180deg, #FBF8F1 0%, #F8F5EE 100%)',
      ].join(', '),
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      position: 'relative',
    }}>
      <StatusBar />
      <TopNav
        onLanguageTap={() => setLangSheetOpen(true)}
        bg="transparent"
        langLabel={langLabel}
      />

      {/* ── Scrollable body — content ends 136px from bottom for floating input ── */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        background: C.bg, scrollbarWidth: 'none',
      } as React.CSSProperties}>

        {/* Greeting */}
        <GreetingSection />

        {activeCase && activeCase.id === 'consumer' ? (
          // Active state: a matter is already open. ActiveCaseCard is the one
          // entry point back into it — the onboarding sections below would
          // just be a second, redundant way in, so they're left out here.
          <div style={{ padding: '0 0 136px' }}>
            <ActiveCaseCard
              convId={activeCase.id}
              title={activeCase.title}
              completedSteps={activeCase.completedSteps}
              isBlocked={activeCase.isBlocked}
            />
            <div style={{ padding: '0 20px' }}>
              <PastMattersList items={historyItems} />
            </div>
          </div>
        ) : (
          // Empty state: nothing active yet. This is the only point where the
          // trust intro, quick-start chips, and the "start a case" CTA earn
          // their place — they're an onboarding surface, not a permanent one.
          <div style={{ padding: '0 0 136px' }}>
            <LegalSignalBand />
            <SuggestionChips lang={selectedLanguage} onSelect={handleSuggestionTap} />
            <div style={{ padding: '0 20px' }}>
              <ConsumerCaseStart />
              <PastMattersList items={historyItems} />
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed chrome at bottom ── */}
      <BottomNav active="home" />
      <HomeIndicator />

      {/* ── Floating pill input — sits above bottom nav ── */}
      <FloatingInput />

      {/* ── Language bottom sheet ── */}
      {langSheetOpen && (
        <LanguageBottomSheet
          selected={selectedLanguage}
          onSelect={(code) => { setSelectedLanguage(code); setLangSheetOpen(false); }}
          onClose={() => setLangSheetOpen(false)}
        />
      )}
    </div>
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
