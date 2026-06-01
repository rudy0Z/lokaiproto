import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { SERIF, SANS, GRAD, SHADOW, C } from '../../components/shared';
import { MobileRouteCanvas, StatusBar } from './MobileHome';

// ─── Noise texture overlay (3% opacity) ────────────────────────────────────────
const NOISE_DATA = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`;

// ─── Google logo (colored G) ────────────────────────────────────────────────────
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.053 17.64 11.745 17.64 9.2z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.705A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.705V4.963H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.037l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.963L3.964 6.295C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Login artboard ────────────────────────────────────────────────────────────
export function LoginArtboard() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');

  return (
    <div style={{
      width: '390px', height: '844px',
      background: 'linear-gradient(160deg, #1A1916 0%, #132846 100%)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Noise texture — 3% opacity */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        pointerEvents: 'none', opacity: 0.03,
        backgroundImage: NOISE_DATA,
      }} />

      {/* ── Top section — ~40% height (338px) ── */}
      <div style={{
        height: '338px', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 1,
      }}>
        <StatusBar light />

        {/* Logo + tagline */}
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 32px 20px',
        }}>
          {/* Logo: L mark + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '22px' }}>
            {/* L lettermark circle */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: SERIF, fontSize: '22px', fontWeight: 400,
                fontStyle: 'normal', color: '#FFFFFF', lineHeight: 1,
              }}>L</span>
            </div>
            {/* Wordmark */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0px' }}>
              <span style={{
                fontFamily: SERIF, fontSize: '28px', fontWeight: 400,
                color: '#FFFFFF', letterSpacing: '-0.3px',
              }}>Lok</span>
              <span style={{
                fontFamily: SANS, fontSize: '23px', fontWeight: 600,
                color: '#FFFFFF', letterSpacing: '0.02em',
              }}>AI</span>
            </div>
          </div>

          {/* Tagline — DM Serif italic 18px white 0.9 */}
          <p style={{
            fontFamily: SERIF, fontSize: '22px', fontWeight: 400, fontStyle: 'normal',
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center', margin: '0 0 10px', lineHeight: 1.45,
          }}>
            Understand your situation.<br />Know your rights.
          </p>

          {/* Subline — Plus Jakarta Sans 12px white 0.6 */}
          <p style={{
            fontFamily: SANS, fontSize: '12px', fontWeight: 400,
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center', margin: 0, letterSpacing: '0.04em',
          }}>
            Speak, write, understand
          </p>
        </div>
      </div>

      {/* ── Bottom sheet — slides up from bottom ── */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 1,
        background: '#FFFFFF',
        borderRadius: '24px 24px 0 0',
        padding: '8px 28px 32px',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Sheet drag handle */}
        <div style={{
          width: '36px', height: '4px', borderRadius: '2px',
          background: '#D8D5CF', margin: '0 auto 24px',
          flexShrink: 0,
        }} />

        {/* Heading */}
        <h2 style={{
          fontFamily: SANS, fontSize: '16px', fontWeight: 600,
          color: '#1A1916', margin: '0 0 20px', flexShrink: 0,
        }}>
          Start with your situation
        </h2>

        {/* Phone field */}
        <div style={{
          height: '56px', border: '1px solid #E8E4DC',
          borderRadius: '12px', overflow: 'hidden',
          display: 'flex', alignItems: 'center',
          marginBottom: '12px', flexShrink: 0,
          background: '#FAFAF8',
        }}>
          <span style={{
            fontFamily: SANS, fontSize: '15px', fontWeight: 500,
            color: '#4A4840',
            padding: '0 14px',
            borderRight: '1px solid #E8E4DC',
            height: '100%', display: 'flex', alignItems: 'center',
            flexShrink: 0,
          }}>+91</span>
          <input
            type="tel" value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            style={{
              flex: 1, height: '100%',
              border: 'none', outline: 'none',
              background: 'transparent',
              fontFamily: SANS, fontSize: '15px', color: '#1A1916',
              padding: '0 16px',
            }}
          />
        </div>

        {/* Continue CTA */}
        <button
          onClick={() => navigate('/mobile/onboarding/1')}
          style={{
            width: '100%', height: '52px',
            background: GRAD.buttonPrimary,
            border: 'none', borderRadius: '999px',
            fontFamily: SANS, fontSize: '16px', fontWeight: 600, color: '#FFFFFF',
            cursor: 'pointer', marginBottom: '20px', flexShrink: 0,
            boxShadow: SHADOW.sm,
          }}
        >
          Continue →
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '16px', flexShrink: 0,
        }}>
          <div style={{ flex: 1, height: '1px', background: '#E8E4DC' }} />
          <span style={{ fontFamily: SANS, fontSize: '12px', color: '#8A8880' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#E8E4DC' }} />
        </div>

        {/* Google sign-in */}
        <button style={{
          width: '100%', height: '52px',
          background: '#FFFFFF', border: '1px solid #E8E4DC',
          borderRadius: '999px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          cursor: 'pointer', marginBottom: '20px', flexShrink: 0,
        }}>
          <GoogleG />
          <span style={{
            fontFamily: SANS, fontSize: '15px', fontWeight: 500, color: '#1A1916',
          }}>
            Continue with Google
          </span>
        </button>

        {/* Trust note */}
        <p style={{
          fontFamily: SANS, fontSize: '12px', color: '#8A8880',
          textAlign: 'center', margin: '0 0 8px', lineHeight: 1.55,
          flexShrink: 0,
        }}>
          We'll never take action without your confirmation.
        </p>

        {/* Terms */}
        <p style={{
          fontFamily: SANS, fontSize: '12px', color: '#8A8880',
          textAlign: 'center', margin: 0, lineHeight: 1.55,
          flexShrink: 0,
        }}>
          By continuing, you agree to our{' '}
          <span style={{ color: C.navy, textDecoration: 'underline', cursor: 'pointer' }}>Terms</span>
        </p>
      </div>
    </div>
  );
}

// ─── Route page ────────────────────────────────────────────────────────────────
export default function MobileLogin() {
  return (
    <MobileRouteCanvas>
      <LoginArtboard />
    </MobileRouteCanvas>
  );
}
