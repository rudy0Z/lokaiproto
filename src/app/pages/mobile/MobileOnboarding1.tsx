import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { SERIF, SANS, C, GRAD, SHADOW } from '../../components/shared';
import { HomeIndicator, MobileRouteCanvas, StatusBar } from './MobileHome';

// ─── Progress Dots — exported for Onboarding 2 + 3 ───────────────────────────
// Active: 20px pill, navy. Inactive: 8px circle, #E8E4DC
export function OnboardingDots({
  active,
  total = 3,
  allFilled = false,
}: {
  active: number;
  total?: number;
  allFilled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: total }, (_, i) => i + 1).map(i => {
        const isCurrent = !allFilled && i === active;
        const isDone    = allFilled || i < active;
        return (
          <div key={i} style={{
            width:        isCurrent ? '20px' : '8px',
            height:       '8px',
            borderRadius: '4px',
            background:   isCurrent || isDone ? C.navy : '#E8E4DC',
            transition:   'all 0.25s ease',
            flexShrink:   0,
          }} />
        );
      })}
    </div>
  );
}

// ─── Noise texture overlay (same as desktop sidebar) ─────────────────────────
function NoiseOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '200px 200px',
      opacity: 0.03,
    }} />
  );
}

// ─── Google "G" icon ──────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.232 17.64 11.924 17.64 9.205z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Onboarding 1 Artboard ────────────────────────────────────────────────────
export function Onboarding1Artboard() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');

  return (
    <div style={{
      width: '390px', height: '844px',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: '#F5F2EC',
    }}>

      {/* ── TOP HALF: Brand gradient panel — 422px (50% of 844) ── */}
      <div style={{
        height: '422px', flexShrink: 0,
        background: 'linear-gradient(160deg, #1A1916 0%, #132846 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <NoiseOverlay />

        {/* Status bar — light text */}
        <div style={{ position: 'relative', zIndex: 2, flexShrink: 0 }}>
          <StatusBar light />
        </div>

        {/* Centered brand content */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '10px', padding: '0 32px 16px',
          position: 'relative', zIndex: 2,
        }}>
          {/* Logo mark — 48px white circle */}
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.50)',
            background: 'rgba(255,255,255,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '2px',
          }}>
            <span style={{
              fontFamily: SERIF, fontSize: '24px', fontWeight: 400,
              fontStyle: 'normal', color: '#FFFFFF', lineHeight: 1,
            }}>L</span>
          </div>

          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0px' }}>
            <span style={{
              fontFamily: SERIF, fontSize: '22px', fontWeight: 400,
              color: '#FFFFFF', letterSpacing: '-0.2px',
            }}>Lok</span>
            <span style={{
              fontFamily: SANS, fontSize: '16px', fontWeight: 700,
              color: '#FFFFFF', letterSpacing: '0.02em',
            }}>AI</span>
          </div>

          {/* Tagline — DM Serif italic 20px, white 0.85 */}
          <p style={{
            fontFamily: SANS, fontSize: '20px', fontWeight: 700,
            fontStyle: 'normal',
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center', margin: '4px 0 0',
            lineHeight: 1.35,
          }}>
            Know Your Rights.<br />In Your Language.
          </p>

          {/* Sub-tagline — 12px, white 0.55 */}
          <p style={{
            fontFamily: SANS, fontSize: '13px', fontWeight: 400,
            color: 'rgba(255,255,255,0.55)',
            margin: 0, letterSpacing: '0.02em',
          }}>
            Speak, write, understand
          </p>
        </div>
      </div>

      {/* ── BOTTOM HALF: White card — overlaps gradient by 24px ── */}
      <div style={{
        flex: 1,
        background: '#FFFFFF',
        borderRadius: '24px 24px 0 0',
        marginTop: '-24px',
        zIndex: 2,
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '32px 24px 0', flex: 1 }}>

          {/* Heading */}
          <h2 style={{
            fontFamily: SANS, fontSize: '16px', fontWeight: 700,
            color: '#1A1916', margin: '0 0 10px', lineHeight: 1.3,
          }}>
            India's law. Your language.
          </h2>

          {/* Sub */}
          <p style={{
            fontFamily: SANS, fontSize: '15px', fontWeight: 400,
            color: '#4A4840', lineHeight: 1.6, margin: '0 0 28px',
          }}>
            LokAI helps you understand your legal rights and take the first step.
          </p>

          {/* Phone input */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block', fontFamily: SANS, fontSize: '13px',
              color: '#8A8880', marginBottom: '8px',
            }}>
              Enter your phone number
            </label>
            <div style={{
              height: '56px',
              border: `1px solid #E8E4DC`, borderRadius: '12px',
              display: 'flex', alignItems: 'center',
              padding: '0 16px', gap: '10px',
              background: '#FFFFFF',
            }}>
              <span style={{
                fontFamily: SANS, fontSize: '15px', color: '#8A8880',
                borderRight: `1px solid #E8E4DC`, paddingRight: '10px',
                flexShrink: 0, lineHeight: '56px',
              }}>
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Enter mobile number"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontFamily: SANS, fontSize: '15px',
                  color: '#1A1916', background: 'transparent',
                }}
              />
            </div>
          </div>

          {/* Continue → gradient button */}
          <button
            onClick={() => navigate('/mobile/onboarding/2')}
            style={{
              width: '100%', height: '52px',
              background: GRAD.buttonPrimary,
              border: 'none', borderRadius: '999px',
              fontFamily: SANS, fontSize: '15px', fontWeight: 600,
              color: '#FFFFFF', cursor: 'pointer',
              boxShadow: SHADOW.sm, marginBottom: '8px',
            }}
          >
            Continue →
          </button>

          {/* Continue with Google */}
          <button
            onClick={() => navigate('/mobile/onboarding/2')}
            style={{
              width: '100%', height: '52px',
              background: '#FFFFFF', border: `1px solid #E8E4DC`,
              borderRadius: '999px',
              fontFamily: SANS, fontSize: '15px', fontWeight: 500,
              color: '#1A1916', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              boxShadow: '0 1px 2px rgba(26,25,22,0.04)',
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Terms */}
          <p style={{
            fontFamily: SANS, fontSize: '11px', color: '#8A8880',
            textAlign: 'center', margin: '16px 0 0', lineHeight: 1.5,
          }}>
            By continuing you agree to our{' '}
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms</span>
            {' '}&{' '}
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
          </p>
        </div>

        {/* Home indicator at bottom */}
        <div style={{ paddingTop: '24px' }}>
          <HomeIndicator />
        </div>
      </div>

    </div>
  );
}

// ─── Route page ────────────────────────────────────────────────────────────────
export default function MobileOnboarding1() {
  return (
    <MobileRouteCanvas>
      <Onboarding1Artboard />
    </MobileRouteCanvas>
  );
}
