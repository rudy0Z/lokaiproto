import React, { useState } from 'react';
import { ChevronDown, Home, MessageSquare, FileText, User, Check, ArrowRight, Circle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SERIF, SANS, C, GRAD, SHADOW, BrandLogo } from '../../components/shared';
import { useConversations } from '../../context/ConversationContext';
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
      <span style={{ fontFamily: SANS, fontSize: '14px', fontWeight: 600, color: fg }}>9:41</span>
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
          borderRadius: '999px', padding: '5px 12px',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: '13px', fontWeight: 500, color: C.navy }}>
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
      borderTop: '1px solid #E8E4DC',
      boxShadow: '0 -4px 16px rgba(26,25,22,0.06)',
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
              height: '3px', width: '20px', borderRadius: '2px',
              background: isActive ? C.saffron : 'transparent',
              marginBottom: '6px',
              flexShrink: 0,
            }} />
            <tab.Icon style={{
              width: '22px', height: '22px',
              color: isActive ? C.navy : '#8A8880',
              strokeWidth: isActive ? 2.2 : 1.5,
            }} />
            <span style={{
              fontFamily: SANS, fontSize: '11px', fontWeight: isActive ? 600 : 400,
              color: isActive ? C.navy : '#8A8880',
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
        width: '134px', height: '5px', borderRadius: '3px',
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
      background: [
        'radial-gradient(ellipse 120% 48% at 50% 0%, rgba(221,231,255,0.44), transparent 70%)',
        'linear-gradient(180deg, #FFFDFC 0%, #F8F5EE 100%)',
      ].join(', '),
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
      <span style={{ fontFamily: SANS, fontSize: '12px', color: C.muted }}>{path}</span>
    </div>
  );
}

// ─── Input dock (exported for re-use in chat screens) ─────────────────────────
export function MobileInputDock({ placeholder = 'Tell us your problem...' }: { placeholder?: string }) {
  return (
    <div style={{
      flexShrink: 0, background: '#FFFFFF',
      borderTop: `1px solid #E8E4DC`, padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
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
        <span style={{ flex: 1, fontFamily: SANS, fontSize: '14px', color: '#8A8880' }}>{placeholder}</span>
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
        borderRadius: '20px 20px 0 0', boxShadow: SHADOW.float,
        display: 'flex', flexDirection: 'column', maxHeight: '520px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: C.border }} />
        </div>
        <div style={{ padding: '20px 20px 14px' }}>
          <h2 style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 400, color: C.ink, margin: '0 0 6px' }}>
            Choose language
          </h2>
          <p style={{ fontFamily: SANS, fontSize: '13px', color: C.muted, margin: 0 }}>
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
                borderRadius: '10px', cursor: 'pointer', position: 'relative',
                transition: 'background 0.15s ease, border-color 0.15s ease',
              }}>
                {isSel && (
                  <div style={{ position: 'absolute', top: '5px', right: '5px', width: '14px', height: '14px', borderRadius: '50%', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check style={{ width: '8px', height: '8px', color: 'white', strokeWidth: 3 }} />
                  </div>
                )}
                <span style={{ fontFamily: SANS, fontSize: '14px', fontWeight: isSel ? 600 : 500, color: isSel ? C.navy : C.ink }}>{lang.name}</span>
                <span style={{ fontFamily: SANS, fontSize: '10px', color: isSel ? C.navy : C.muted }}>{lang.en}</span>
              </button>
            );
          })}
        </div>
        <div style={{ height: '60px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={onClose} style={{ fontFamily: SANS, fontSize: '14px', color: C.textSoft, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 24px' }}>
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
        fontFamily: SERIF, fontSize: '26px', fontWeight: 400,
        color: '#1A1916', margin: '0 0 7px', lineHeight: 1.2,
        letterSpacing: '-0.3px',
      }}>
        <span>Good morning, </span>
        <span style={{ fontWeight: 700 }}>Priya</span>
      </p>
      {/* Date + location — 13px #8A8880 */}
      <p style={{
        fontFamily: SANS, fontSize: '13px', color: '#8A8880',
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
        borderRadius: '20px',
        padding: '16px 18px',
        background: [
          'radial-gradient(ellipse 80% 90% at 0% 100%, rgba(255,227,184,0.52), transparent 68%)',
          '#FFFFFF',
        ].join(', '),
        border: `1.5px solid ${C.navy}`,
        boxShadow: '0 8px 24px rgba(16,42,76,0.10)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>
            Case in progress
          </p>
          <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.ink, margin: 0, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </p>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
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
                  width: 22, height: 22, borderRadius: '50%',
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
                  fontFamily: SANS, fontSize: 9, fontWeight: current || done ? 600 : 400,
                  color: done ? C.navy : current ? C.ink : C.muted,
                  whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </span>
              </div>
              {i < CASE_STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 1.5, borderRadius: 1,
                  background: done ? C.navy : '#E0DDD6',
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
        <p style={{ fontFamily: SANS, fontSize: 11, color: C.red, margin: '10px 0 0', lineHeight: 1.4 }}>
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
    { label: 'My landlord kept my deposit',  question: 'My landlord has not returned my security deposit after I moved out.' },
    { label: 'I got a legal notice',          question: 'I received a legal notice and need to understand what it means.' },
    { label: 'Seller refused my refund',      question: 'I bought a defective product and the seller is refusing a refund.' },
    { label: 'File an RTI',                   question: 'How do I file an RTI application to get government records?' },
  ],
  hi: [
    { label: 'मकान मालिक ने जमा रोका',   question: 'मेरे मकान मालिक ने सिक्योरिटी डिपॉज़िट वापस नहीं किया।' },
    { label: 'कानूनी नोटिस मिला',          question: 'मुझे एक कानूनी नोटिस मिला है, इसे समझने में मदद चाहिए।' },
    { label: 'रिफंड से इनकार',              question: 'विक्रेता ने दोषपूर्ण उत्पाद का रिफंड देने से मना किया।' },
    { label: 'RTI कैसे दर्ज करें',           question: 'मुझे RTI दाखिल करने की जानकारी चाहिए।' },
  ],
  mr: [
    { label: 'ठेव रोखली',                   question: 'मकान मालकाने माझी सुरक्षा ठेव परत केली नाही।' },
    { label: 'नोटिस मिळाली',                 question: 'मला कायदेशीर नोटिस मिळाली आहे, त्याचा अर्थ समजून घ्यायचा आहे।' },
    { label: 'परतावा नाकारला',               question: 'विक्रेत्याने दोषपूर्ण वस्तूचा परतावा देण्यास नकार दिला।' },
    { label: 'RTI अर्ज',                     question: 'RTI अर्ज कसा करायचा?' },
  ],
  ta: [
    { label: 'டெபாசிட் திரும்பவில்லை',      question: 'என் வீட்டு உரிமையாளர் பாதுகாப்பு வைப்பை திரும்பப் தரவில்லை.' },
    { label: 'சட்ட நோட்டீஸ் வந்தது',        question: 'எனக்கு சட்ட நோட்டீஸ் வந்துள்ளது, அதை புரிந்துகொள்ள உதவி வேண்டும்.' },
    { label: 'Refund மறுத்தார்',              question: 'கோளாறு பொருளுக்கு seller refund தர மறுக்கிறார்.' },
    { label: 'RTI எப்படி?',                  question: 'RTI விண்ணப்பம் எப்படி செய்வது?' },
  ],
  te: [
    { label: 'డిపాజిట్ తిరిగి రాలేదు',      question: 'ఇంటి యజమాని నా సెక్యూరిటీ డిపాజిట్ తిరిగి ఇవ్వలేదు.' },
    { label: 'చట్టపరమైన నోటీసు వచ్చింది',   question: 'నాకు చట్టపరమైన నోటీసు వచ్చింది దాన్ని అర్థం చేసుకోవాలి.' },
    { label: 'రిఫండ్ నిరాకరణ',               question: 'లోపభూయిష్ట వస్తువుకు విక్రేత రిఫండ్ ఇవ్వడానికి నిరాకరించాడు.' },
    { label: 'RTI ఎలా దాఖలు చేయాలి',        question: 'RTI అర్జీ ఎలా దాఖలు చేయాలి?' },
  ],
  bn: [
    { label: 'ডিপোজিট ফেরত দেয়নি',          question: 'বাড়ির মালিক আমার সিকিউরিটি ডিপোজিট ফেরত দেননি।' },
    { label: 'আইনি নোটিশ পেয়েছি',            question: 'আমি একটি আইনি নোটিশ পেয়েছি, এর অর্থ বুঝতে সাহায্য দরকার।' },
    { label: 'রিফান্ড অস্বীকার',              question: 'বিক্রেতা ত্রুটিপূর্ণ পণ্যের রিফান্ড দিতে অস্বীকার করেছে।' },
    { label: 'RTI কীভাবে করবেন',              question: 'RTI আবেদন কীভাবে করতে হয়?' },
  ],
};

function SuggestionChips({ lang, onSelect }: { lang: string; onSelect: (q: string) => void }) {
  const chips = LANG_CHIPS[lang] ?? LANG_CHIPS['en'];
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
        Quick start
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {chips.map(chip => (
          <button
            key={chip.label}
            onClick={() => onSelect(chip.question)}
            style={{
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 500,
              color: C.navy,
              background: '#FFFFFF',
              border: `1px solid ${C.border}`,
              borderRadius: '999px',
              padding: '8px 14px',
              cursor: 'pointer',
              lineHeight: 1.3,
              transition: 'border-color 0.15s ease, background 0.15s ease',
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
      borderRadius: '24px',
      padding: '18px 18px 16px',
      background: [
        'radial-gradient(ellipse 90% 80% at 50% 0%, rgba(221,231,255,0.92), transparent 66%)',
        'radial-gradient(ellipse 70% 70% at 45% 100%, rgba(255,227,184,0.72), transparent 72%)',
        '#FFFFFF',
      ].join(', '),
      border: `1px solid ${C.border}`,
      boxShadow: '0 12px 32px rgba(26,25,22,0.08)',
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
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.70)',
          border: '1px solid rgba(16,42,76,0.10)',
          fontFamily: SANS, fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          color: C.navy,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.saffron }} />
          Verified source trail
        </div>
        <p style={{
          fontFamily: SERIF,
          fontSize: '28px',
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
              fontSize: '11px',
              color: C.inkSoft,
              background: 'rgba(255,255,255,0.62)',
              border: `1px solid ${C.border}`,
              borderRadius: '999px',
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
        borderRadius: 18,
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
        borderRadius: 14,
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
          fontSize: 11,
          fontWeight: 700,
          color: C.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 5px',
        }}>
          Guided case
        </p>
        <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.ink, margin: '0 0 5px' }}>
          Start Consumer Refund Case
        </p>
        <p style={{ fontFamily: SANS, fontSize: 12, color: C.inkSoft, lineHeight: 1.45, margin: 0 }}>
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
        fontFamily: SERIF, fontSize: '22px', fontWeight: 400, color: '#1A1916',
        letterSpacing: '-0.15px',
      }}>{title}</span>
      {action && (
        <button onClick={onAction} style={{
          fontFamily: SANS, fontSize: '13px', color: C.navy,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          {action} →
        </button>
      )}
    </div>
  );
}

// ─── Your Conversations — 2 list-style rows ────────────────────────────────────
const CONVERSATIONS = [
  {
    id: 1,
    dotColor: '#C4724A',
    title: 'Landlord deposit issue',
    snippet: 'Your landlord must return ₹40,000 within the statutory period after vacating.',
    time: '2h ago',
    lang: 'Hindi',
    route: '/mobile/chat/hindi',
  },
  {
    id: 3,
    dotColor: C.green,
    title: 'Consumer refund case',
    snippet: 'Defective phone with seller refusal. One detail needed before notice packet is complete.',
    time: 'Today',
    lang: 'English',
    route: '/mobile/case/consumer',
  },
];

function ConversationRow({ conv, isLast, onOpen }: { conv: typeof CONVERSATIONS[0]; isLast: boolean; onOpen: () => void }) {
  return (
    <div style={{
      height: '64px',
      display: 'flex', alignItems: 'center', gap: '12px',
      borderBottom: isLast ? 'none' : '1px solid #E8E4DC',
      cursor: 'pointer',
    }}>
      {/* Colored dot */}
      <div style={{
        width: '10px', height: '10px', borderRadius: '50%',
        background: conv.dotColor, flexShrink: 0,
      }} />

      {/* Text column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: SANS, fontSize: '14px', fontWeight: 600,
          color: '#1A1916', lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {conv.title}
        </div>
        <div style={{
          fontFamily: SANS, fontSize: '11px', color: '#8A8880',
          marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {conv.time} · {conv.lang}
        </div>
      </div>

      {/* Right arrow */}
      <button
        onClick={onOpen}
        style={{
          fontFamily: SANS, fontSize: '16px', color: '#C8C4BC', flexShrink: 0, lineHeight: 1,
          border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
        }}
      >
        ›
      </button>
    </div>
  );
}

// ─── Notices Near You — list items (not cards), 64px, border-bottom ──────────
const NOTICES = [
  {
    id: 1,
    badge: 'BMC',
    badgeColor: '#C4724A',
    title: 'Property Tax Demand 2025–26',
    location: 'Bandra West',
    date: '18 Mar',
    urgent: true,
    route: '/mobile/case/consumer?failure=ocr_unreadable',
  },
  {
    id: 2,
    badge: 'Municipal',
    badgeColor: C.navy,
    title: 'Development Plan Amendment',
    location: 'H/West Ward',
    date: '22 Mar',
    urgent: false,
    route: '/mobile/case/consumer?failure=ocr_unreadable',
  },
];

function NoticeListItem({ notice, isLast, onOpen }: { notice: typeof NOTICES[0]; isLast: boolean; onOpen: () => void }) {
  return (
    <div style={{
      height: '64px',
      borderBottom: isLast ? 'none' : `1px solid #E8E4DC`,
      display: 'flex', alignItems: 'center', gap: '12px',
      cursor: 'pointer',
    }}>
      {/* Source badge */}
      <span style={{
        fontFamily: SANS, fontSize: '10px', fontWeight: 600,
        color: '#FFFFFF', background: notice.badgeColor,
        borderRadius: '4px', padding: '3px 7px',
        textTransform: 'uppercase', letterSpacing: '0.04em',
        flexShrink: 0,
      }}>
        {notice.badge}
      </span>

      {/* Title + location */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: SANS, fontSize: '14px', fontWeight: 600,
          color: '#1A1916', lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {notice.title}
        </div>
        <div style={{
          fontFamily: SANS, fontSize: '12px', color: '#8A8880',
          marginTop: '2px',
        }}>
          {notice.location}
        </div>
      </div>

      {/* Date + arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {notice.urgent && (
          <span style={{
            fontFamily: SANS, fontSize: '10px', fontWeight: 600,
            color: '#8A4500', background: '#FFF3E8',
            borderRadius: '4px', padding: '2px 6px',
          }}>
            !</span>
        )}
        <span style={{ fontFamily: SANS, fontSize: '11px', color: '#8A8880' }}>{notice.date}</span>
        <button
          onClick={onOpen}
          style={{
            fontFamily: SANS, fontSize: '16px', color: '#C8C4BC', lineHeight: 1,
            border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
          }}
        >
          ›
        </button>
      </div>
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
      borderRadius: '999px',
      boxShadow: `0 12px 30px rgba(26,25,22,0.16), 0 0 0 4px rgba(16,42,76,0.06)`,
      display: 'flex', alignItems: 'center',
      padding: '0 10px',
      gap: '8px',
      zIndex: 20,
      cursor: 'pointer',
      textAlign: 'left',
    }}>
      {/* Voice orb — 36px, navy mic */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
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
      <span style={{ flex: 1, fontFamily: SANS, fontSize: '14px', color: '#8A8880' }}>
        Tell us your problem...
      </span>

      {/* Send arrow — 36px gradient circle */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
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
  const { selectedLanguage, setSelectedLanguage, conversations } = useConversations();
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const navigate = useNavigate();

  // Find the most recent in-progress case for the Active Case Card
  const activeCase = conversations.find(c =>
    c.status === 'In Progress' || c.status === 'Action Required'
  );

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
        background: '#F5F2EC', scrollbarWidth: 'none',
      } as React.CSSProperties}>

        {/* Greeting */}
        <GreetingSection />
        <LegalSignalBand />

        {/* Content sections — 20px margins each side */}
        <div style={{ padding: '0 0 136px' }}>

          {/* Active Case Timeline Card — only shown when a case is in progress */}
          {activeCase && activeCase.id === 'consumer' && (
            <ActiveCaseCard
              convId={activeCase.id}
              title={activeCase.title}
              completedSteps={activeCase.completedSteps}
              isBlocked={activeCase.isBlocked}
            />
          )}

          {/* Language-Aware Suggestion Chips */}
          <SuggestionChips lang={selectedLanguage} onSelect={handleSuggestionTap} />

          <div style={{ padding: '0 20px' }}>
            <ConsumerCaseStart />

            {/* Your Conversations */}
            <div style={{ marginBottom: '24px' }}>
              <SectionHead title="Your Conversations" action="See all" onAction={() => navigate('/mobile/case/consumer?stage=assess')} />
              <div style={{
                background: '#FFFFFF', borderRadius: '16px',
                padding: '0 16px', border: '1px solid #E8E4DC',
              }}>
                {CONVERSATIONS.map((conv, i) => {
                  // Route conversations into the stateful case stepper rather than the
                  // legacy static chat screens, so progress, language, and trust state persist.
                  const stage = ['assess', 'plan', 'clarify'][i % 3];
                  const toCase = () => navigate(`/mobile/case/consumer?stage=${stage}`);
                  return (
                    <div key={conv.id} onClick={toCase}>
                      <ConversationRow conv={conv} isLast={i === CONVERSATIONS.length - 1} onOpen={toCase} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notices Near You */}
            <div style={{ marginBottom: '24px' }}>
              <SectionHead title="Notices Near You" />
              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '0 16px', border: `1px solid ${C.border}`, boxShadow: '0 1px 2px rgba(26,25,22,0.04)' }}>
                {NOTICES.map((n, i) => (
                  <div key={n.id} onClick={() => navigate(n.route)}>
                    <NoticeListItem notice={n} isLast={i === NOTICES.length - 1} onOpen={() => navigate(n.route)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
