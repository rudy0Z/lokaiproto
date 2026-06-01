import React from 'react';
import { useNavigate } from 'react-router';
import { SANS, C, GRAD, SHADOW } from '../../components/shared';
import { MobileRouteCanvas, StatusBar } from './MobileHome';
import { OnboardingDots } from './MobileOnboarding1';

// ─── Balance Scales SVG — 64px, brand navy ───────────────────────────────────
function ScalesIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <line x1="32" y1="8"  x2="32" y2="56" stroke={C.navy} strokeWidth="2"   strokeLinecap="round" />
      <line x1="20" y1="56" x2="44" y2="56" stroke={C.navy} strokeWidth="2"   strokeLinecap="round" />
      <line x1="12" y1="18" x2="52" y2="18" stroke={C.navy} strokeWidth="2"   strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="30" stroke={C.navy} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="52" y1="18" x2="52" y2="30" stroke={C.navy} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8"  y1="30" x2="16" y2="30" stroke={C.navy} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="48" y1="30" x2="56" y2="30" stroke={C.navy} strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="12" cy="32" rx="8" ry="3" stroke={C.navy} strokeWidth="1.5" />
      <ellipse cx="52" cy="32" rx="8" ry="3" stroke={C.navy} strokeWidth="1.5" />
      <circle  cx="32" cy="8"  r="2.5" fill={C.navy} />
    </svg>
  );
}

// ─── Suggestion entry icons (muted #8A8880 per spec) ─────────────────────────
const ICON_COLOR = '#8A8880';

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2L15.5 7.5V16H12V11H6V16H2.5V7.5L9 2Z" stroke={ICON_COLOR} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="2" width="12" height="14" rx="1.5" stroke={ICON_COLOR} strokeWidth="1.2" />
      <line x1="6" y1="6.5" x2="12" y2="6.5" stroke={ICON_COLOR} strokeWidth="1" strokeLinecap="round" />
      <line x1="6" y1="9"   x2="12" y2="9"   stroke={ICON_COLOR} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
// ─── Onboarding 3 Artboard ────────────────────────────────────────────────────
export function Onboarding3Artboard() {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '390px', height: '844px', background: '#F5F2EC',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      position: 'relative',
    }}>
      <StatusBar />

      {/* ── TOP ATMOSPHERIC HALF — scales icon centered at ~35% from top ── */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        paddingTop: '24px',
      }}>
        {/* Progress dots — at top */}
        <OnboardingDots active={3} />

        {/* Scales icon centered vertically in this section */}
        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Saffron glow behind scales */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute',
              width: '96px', height: '96px', borderRadius: '50%',
              background: 'rgba(232,131,42,0.08)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <ScalesIcon />
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM WHITE CARD — anchored to bottom ── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        background: '#FFFFFF',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -4px 24px rgba(26,25,22,0.06)',
        zIndex: 5,
      }}>
        {/* Scrollable content area */}
        <div style={{ padding: '28px 24px 0', overflowY: 'auto', maxHeight: '420px' }}>

          {/* Heading */}
          <h1 style={{
            fontFamily: SANS, fontSize: '20px', fontWeight: 700,
            color: '#1A1916', margin: '0 0 8px', lineHeight: 1.25,
          }}>
            Let's understand your situation
          </h1>

          {/* Sub */}
          <p style={{
            fontFamily: SANS, fontSize: '14px', color: '#4A4840',
            margin: '0 0 20px', lineHeight: 1.6,
          }}>
            Start with a question. We'll guide you.
          </p>

          {/* 2 suggestion rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {[
              { Icon: IconHome, text: "My landlord won't return my deposit" },
              { Icon: IconDoc,  text: "I received an official notice" },
            ].map(s => (
              <button
                key={s.text}
                onClick={() => navigate('/mobile/chat/hindi')}
                style={{
                  height: '60px',
                  background: '#F5F2EC', border: '1px solid #E8E4DC',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '0 16px', cursor: 'pointer', width: '100%', textAlign: 'left',
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#FFFFFF', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <s.Icon />
                </div>
                <span style={{
                  fontFamily: SANS, fontSize: '14px', fontWeight: 500,
                  color: '#1A1916', lineHeight: 1.35, flex: 1,
                }}>
                  {s.text}
                </span>
                <span style={{ fontFamily: SANS, fontSize: '14px', color: '#8A8880', flexShrink: 0 }}>→</span>
              </button>
            ))}
          </div>

          {/* Privacy note */}
          <p style={{
            fontFamily: SANS, fontSize: '11px', color: '#8A8880',
            textAlign: 'center', margin: '0 0 16px', lineHeight: 1.55,
          }}>
            🔒 Your information stays private
          </p>
        </div>

        {/* Fixed CTA area */}
        <div style={{ padding: '16px 24px 40px' }}>
          <button
            onClick={() => navigate('/mobile/onboarding/4')}
            style={{
              width: '100%', height: '52px',
              background: GRAD.buttonPrimary,
              border: 'none', borderRadius: '999px',
              fontFamily: SANS, fontSize: '15px', fontWeight: 600,
              color: '#FFFFFF', cursor: 'pointer',
              boxShadow: SHADOW.sm,
            }}
          >
            Get Started
          </button>
          <p
            onClick={() => navigate('/mobile/onboarding/4')}
            style={{
              fontFamily: SANS, fontSize: '14px', color: '#8A8880',
              textAlign: 'center', margin: '10px 0 0',
              cursor: 'pointer', lineHeight: 1.4,
            }}
          >
            I'll explore on my own
          </p>
        </div>
      </div>

    </div>
  );
}

// ─── Route page ────────────────────────────────────────────────────────────────
export default function MobileOnboarding3() {
  return (
    <MobileRouteCanvas>
      <Onboarding3Artboard />
    </MobileRouteCanvas>
  );
}
