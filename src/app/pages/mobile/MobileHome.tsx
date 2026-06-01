import React, { useState } from 'react';
import { ChevronDown, Home, MessageSquare, FileText, User, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SERIF, SANS, C, GRAD, SHADOW, BrandLogo } from '../../components/shared';

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED CHROME — exported for all mobile screens
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Status Bar ───────────────────────────────────────────────────────────────
export function StatusBar({ light = false }: { light?: boolean }) {
  const fg = light ? '#FFFFFF' : C.ink;
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
  { key: 'chat',    label: 'Chat',    Icon: MessageSquare, route: '/mobile/chat/hindi' },
  { key: 'docs',    label: 'Draft',   Icon: FileText,      route: '/desktop/document-draft' },
  { key: 'profile', label: 'Profile', Icon: User,          route: '/mobile/profile'    },
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
];

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
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: C.navy,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.saffron }} />
          Prototype source trail
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
    id: 2,
    dotColor: C.navy,
    title: 'Boundary example',
    snippet: 'See how LokAI responds when the question is outside Indian legal guidance.',
    time: 'Demo',
    lang: 'Prototype',
    route: '/mobile/chat/out-of-scope',
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
    route: '/desktop/notice-interpreter',
  },
  {
    id: 2,
    badge: 'Municipal',
    badgeColor: C.navy,
    title: 'Development Plan Amendment',
    location: 'H/West Ward',
    date: '22 Mar',
    urgent: false,
    route: '/desktop/notice-interpreter',
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
    <button onClick={() => navigate('/mobile/chat/hindi')} style={{
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
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [selectedLang,  setSelectedLang]  = useState('en');
  const navigate = useNavigate();

  return (
    <div style={{
      width: '390px', height: '844px',
      background: [
        'radial-gradient(ellipse 100% 42% at 50% 0%, rgba(221,231,255,0.60), transparent 70%)',
        'linear-gradient(180deg, #FBF8F1 0%, #F8F5EE 100%)',
      ].join(', '),
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      position: 'relative',   // allows FloatingInput position:absolute
    }}>
      <StatusBar />
      <TopNav onLanguageTap={() => setLangSheetOpen(true)} bg="transparent" />

      {/* ── Scrollable body — content ends 136px from bottom for floating input ── */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        background: '#F5F2EC', scrollbarWidth: 'none',
      } as React.CSSProperties}>

        {/* Greeting — 32px top padding, no input here */}
        <GreetingSection />
        <LegalSignalBand />

        {/* Content sections — 20px margins each side */}
        <div style={{ padding: '0 20px 136px' }}>

          {/* Your Conversations */}
          <div style={{ marginBottom: '24px' }}>
            <SectionHead title="Your Conversations" action="See all" onAction={() => navigate('/mobile/chat/hindi')} />
            <div style={{
              background: '#FFFFFF', borderRadius: '16px',
              padding: '0 16px', border: '1px solid #E8E4DC',
            }}>
              {CONVERSATIONS.map((conv, i) => (
                <div key={conv.id} onClick={() => navigate(conv.route)}>
                  <ConversationRow conv={conv} isLast={i === CONVERSATIONS.length - 1} onOpen={() => navigate(conv.route)} />
                </div>
              ))}
            </div>
          </div>

          {/* Notices Near You — list style, not cards */}
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

      {/* ── Fixed chrome at bottom ── */}
      <BottomNav active="home" />
      <HomeIndicator />

      {/* ── Floating pill input — sits above bottom nav ── */}
      <FloatingInput />

      {/* ── Language bottom sheet ── */}
      {langSheetOpen && (
        <LanguageBottomSheet
          selected={selectedLang}
          onSelect={(code) => { setSelectedLang(code); setLangSheetOpen(false); }}
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
