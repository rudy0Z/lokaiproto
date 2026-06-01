import React from 'react';
import { useNavigate } from 'react-router';
import { SERIF, SANS, C, GRAD, SHADOW } from '../../components/shared';
import { StatusBar, HomeIndicator, MobileRouteCanvas } from './MobileHome';
import { OnboardingDots } from './MobileOnboarding1';

// ─── Legal Scales SVG illustration (80px, navy) ───────────────────────────────
function ScalesIllustration() {
  return (
    <svg
      width="80" height="80" viewBox="0 0 80 80" fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base pedestal */}
      <rect x="36" y="64" width="8" height="12" rx="2" fill={C.navy} opacity="0.15" />
      <rect x="28" y="74" width="24" height="4" rx="2" fill={C.navy} opacity="0.25" />

      {/* Central pillar */}
      <rect x="38.5" y="18" width="3" height="46" rx="1.5" fill={C.navy} />

      {/* Top pivot bar */}
      <rect x="32" y="16" width="16" height="3" rx="1.5" fill={C.navy} />

      {/* Pivot knob */}
      <circle cx="40" cy="14" r="4" fill={C.navy} />
      <circle cx="40" cy="14" r="2" fill="#F5F2EC" />

      {/* Left arm */}
      <line x1="40" y1="17" x2="16" y2="30" stroke={C.navy} strokeWidth="2" strokeLinecap="round" />
      {/* Left pan strings */}
      <line x1="16" y1="30" x2="10" y2="44" stroke={C.navy} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="30" x2="22" y2="44" stroke={C.navy} strokeWidth="1.5" strokeLinecap="round" />
      {/* Left pan */}
      <path d="M8 44 Q16 52 24 44" stroke={C.navy} strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="8" y1="44" x2="24" y2="44" stroke={C.navy} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

      {/* Right arm */}
      <line x1="40" y1="17" x2="64" y2="26" stroke={C.navy} strokeWidth="2" strokeLinecap="round" />
      {/* Right pan strings */}
      <line x1="64" y1="26" x2="58" y2="40" stroke={C.navy} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="64" y1="26" x2="70" y2="40" stroke={C.navy} strokeWidth="1.5" strokeLinecap="round" />
      {/* Right pan — slightly higher (tilted) */}
      <path d="M56 40 Q64 48 72 40" stroke={C.navy} strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="56" y1="40" x2="72" y2="40" stroke={C.navy} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

      {/* Decorative dot at top */}
      <circle cx="40" cy="8" r="2.5" fill={C.saffron} />
    </svg>
  );
}

// ─── Suggested Question Chip ──────────────────────────────────────────────────
function QuestionChip({
  label, onClick,
}: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: '10px',
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px',
        boxShadow: SHADOW.xs,
        transition: 'border-color 0.15s ease, background 0.15s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = C.navy;
        (e.currentTarget as HTMLButtonElement).style.background = C.navySoft;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
        (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
      }}
    >
      <span style={{
        fontFamily: SANS, fontSize: '14px', fontWeight: 400,
        color: '#1A1916', lineHeight: 1.4, flex: 1,
      }}>
        {label}
      </span>
      {/* Arrow hint */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <path d="M3 7H11M8 4L11 7L8 10" stroke={C.navy} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ─── Artboard ─────────────────────────────────────────────────────────────────
export function Onboarding4Artboard() {
  const navigate = useNavigate();

  // Read selection from Screen 2; default to tenancy for the demo
  let reason = 'tenancy';
  try { reason = sessionStorage.getItem('lokai_ob_reason') || 'tenancy'; } catch (_) {}
  const isTenancy = reason === 'tenancy' || reason === 'notice' || reason === 'other';

  const contextLine = isTenancy
    ? 'LokAI can help you with tenancy issues —'
    : 'LokAI can help you with consumer issues —';

  const chips = isTenancy
    ? [
        'My landlord is not returning my deposit',
        'How to protect yourself from unlawful eviction?',
      ]
    : [
        'My product was defective, what should I do?',
        'How to file a complaint at Consumer Forum?',
      ];

  const goToChat = (q: string) => {
    try { sessionStorage.setItem('lokai_prefill_q', q); } catch (_) {}
    navigate('/mobile/chat/hindi');
  };

  return (
    <div style={{
      width: '390px', height: '844px', background: '#F5F2EC',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <StatusBar />

      {/* ── Main content — vertically centred ── */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '20px 24px 24px',
        display: 'flex', flexDirection: 'column',
        scrollbarWidth: 'none',
      } as React.CSSProperties}>

        {/* Progress dots — all 4 filled navy */}
        <div style={{ marginBottom: '36px' }}>
          <OnboardingDots active={4} allFilled />
        </div>

        {/* Legal scales illustration — 80px, 48px top from dots */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          marginBottom: '28px',
        }}>
          <ScalesIllustration />
        </div>

        {/* "आप तैयार हैं, Priya!" — DM Serif Display 28px #1A1916 centered */}
        <h1 style={{
          fontFamily: SERIF, fontSize: '28px', fontWeight: 400,
          color: '#1A1916', textAlign: 'center',
          margin: '0 0 16px', lineHeight: 1.3, letterSpacing: '-0.3px',
        }}>
          You're all set, Priya!
        </h1>

        {/* Personalised context line — Plus Jakarta Sans 15px #4A4840 centered */}
        <p style={{
          fontFamily: SANS, fontSize: '15px', fontWeight: 400,
          color: '#4A4840', textAlign: 'center', lineHeight: 1.65,
          margin: '0 auto 28px', maxWidth: '300px',
        }}>
          {contextLine}
        </p>

        {/* Suggested question chips — full width, tappable */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {chips.map(q => (
            <QuestionChip key={q} label={q} onClick={() => goToChat(q)} />
          ))}
        </div>

        {/* Legal language badge */}
        <div style={{
          background: C.navySoft, borderRadius: '10px',
          padding: '12px 16px', marginBottom: '8px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>🔒</span>
          <p style={{
            fontFamily: SANS, fontSize: '12px', color: C.navy,
            lineHeight: 1.5, margin: 0,
          }}>
            Your information is safe — LokAI never shares your data.
          </p>
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div style={{
        flexShrink: 0,
        padding: '14px 24px 0',
        borderTop: `1px solid ${C.border}`,
        background: '#F5F2EC',
      }}>
        {/* "शुरू करें" — primary gradient, full width */}
        <button
          onClick={() => navigate('/mobile/home')}
          style={{
            width: '100%', padding: '16px',
            background: GRAD.buttonPrimary,
            border: 'none', borderRadius: '999px',
            fontFamily: SANS, fontSize: '16px', fontWeight: 600, color: '#FFFFFF',
            cursor: 'pointer', marginBottom: '14px',
            letterSpacing: '0.01em',
          }}
        >
          Get Started
        </button>

        {/* Ghost "explore later" link */}
        <p style={{ textAlign: 'center', margin: '0 0 4px' }}>
          <span
            onClick={() => navigate('/mobile/home')}
            style={{
              fontFamily: SANS, fontSize: '13px', color: C.muted,
              cursor: 'pointer',
            }}
          >
            I'll explore later
          </span>
        </p>
      </div>

      <HomeIndicator />
    </div>
  );
}

// ─── Route page ───────────────────────────────────────────────────────────────
export default function MobileOnboarding4() {
  return (
    <MobileRouteCanvas>
      <Onboarding4Artboard />
    </MobileRouteCanvas>
  );
}
