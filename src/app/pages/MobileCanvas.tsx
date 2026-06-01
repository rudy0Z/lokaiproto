import React from 'react';
import { useNavigate } from 'react-router';
import { SERIF, SANS, C } from '../components/shared';
import { HomeArtboard }             from './mobile/MobileHome';
import { ChatArtboard }             from './mobile/MobileChat';
import { VoiceArtboard }            from './mobile/MobileVoiceActive';
import { RightsArtboard }           from './mobile/MobileRights';
import { ProfileArtboard }          from './mobile/MobileProfile';
import { ErrorsArtboard }           from './mobile/MobileErrorStates';
import { LanguagePaletteArtboard }  from './mobile/MobileLanguagePalette';
import { VerdictArtboard }          from './mobile/MobileVerdict';

const CANVAS_STYLES = `
  @keyframes voicePulse {
    0%   { transform: scale(1);    opacity: 0.6; }
    100% { transform: scale(1.55); opacity: 0;   }
  }
  @keyframes voiceBreathe {
    0%, 100% { transform: scale(1);    box-shadow: 0 0 0  0   rgba(232,131,42,0.25); }
    50%       { transform: scale(1.09); box-shadow: 0 0 0 20px rgba(232,131,42,0);    }
  }
  @keyframes wordFade {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  .mobile-frame:hover .frame-overlay {
    opacity: 1 !important;
  }
`;

function ScaledFrame({ scale, width, height, label, route, children }: {
  scale: number; width: number; height: number; label: string; route: string; children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const scaledW = Math.round(width * scale);
  const scaledH = Math.round(height * scale);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      <span style={{
        fontFamily: SANS, fontSize: '11px', fontWeight: 500,
        color: '#AAAAAA', letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <div
        className="mobile-frame"
        onClick={() => navigate(route)}
        style={{
          width: `${scaledW}px`, height: `${scaledH}px`, position: 'relative', overflow: 'hidden',
          borderRadius: `${Math.round(44 * scale)}px`, border: '1.5px solid rgba(255,255,255,0.12)',
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        <div style={{
          width: `${width}px`, height: `${height}px`,
          transform: `scale(${scale})`, transformOrigin: 'top left',
          position: 'absolute', top: 0, left: 0, pointerEvents: 'none',
        }}>
          {children}
        </div>
        <div
          className="frame-overlay"
          style={{
            position: 'absolute', inset: 0, background: `${C.navy}22`,
            opacity: 0, transition: 'opacity 0.18s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: `${Math.round(44 * scale)}px`, pointerEvents: 'none',
          }}
        >
          <div style={{
            background: 'rgba(255,255,255,0.92)', borderRadius: '6px', padding: '8px 18px',
            fontFamily: SANS, fontSize: '12px', fontWeight: 500, color: C.navy,
          }}>
            Open full screen →
          </div>
        </div>
      </div>
      <span style={{ fontFamily: SANS, fontSize: '10px', color: '#555', letterSpacing: '0.03em' }}>
        {width} × {height}
      </span>
    </div>
  );
}

// ─── Screen groups ────────────────────────────────────────────────────────────
const CITIZEN_SCREENS = [
  { label: 'Home',              route: '/mobile/home',             width: 390, height: 844,  artboard: <HomeArtboard />            },
  { label: 'Language Palette',  route: '/mobile/language-palette', width: 390, height: 844,  artboard: <LanguagePaletteArtboard /> },
  { label: 'Verdict Screen',    route: '/mobile/verdict',          width: 390, height: 844,  artboard: <VerdictArtboard />         },
  { label: 'Voice Active',      route: '/mobile/voice',            width: 390, height: 844,  artboard: <VoiceArtboard />           },
];

const SECONDARY_SCREENS = [
  { label: 'Chat',         route: '/mobile/chat/hindi', width: 390, height: 844,  artboard: <ChatArtboard />    },
  { label: 'Rights',       route: '/mobile/rights',     width: 390, height: 844,  artboard: <RightsArtboard />  },
  { label: 'Profile',      route: '/mobile/profile',    width: 390, height: 844,  artboard: <ProfileArtboard /> },
];

const ERROR_SCREENS = [
  { label: 'Error States', route: '/mobile/errors',  width: 390, height: 2400, artboard: <ErrorsArtboard />  },
];

export default function MobileCanvas() {
  return (
    <>
      <style>{CANVAS_STYLES}</style>
      <div style={{
        flex: 1, background: '#1A1A1A', overflowY: 'auto', overflowX: 'auto',
        minHeight: '100vh', padding: '60px 56px 80px',
      }}>
        {/* Canvas header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: SERIF, fontSize: '24px', color: 'white',
            margin: '0 0 8px', letterSpacing: '-0.2px',
          }}>
            LokAI · Mobile App
          </h1>
          <p style={{ fontFamily: SANS, fontSize: '13px', color: '#777', margin: 0 }}>
            8 screens · iPhone 14 (390 × 844) · Click any artboard to view full screen
          </p>
        </div>

        {/* Screen index */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {[...CITIZEN_SCREENS, ...SECONDARY_SCREENS].map((page, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px', padding: '6px 12px',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: C.navy }} />
              <span style={{ fontFamily: SANS, fontSize: '11px', color: '#AAA' }}>{page.label}</span>
            </div>
          ))}
        </div>

        {/* ── Citizen Experience (Prompt 2) ─────────────────── */}
        <div style={{
          fontFamily: SANS, fontSize: '11px', color: '#555',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          marginBottom: '24px',
        }}>
          Citizen Experience — Primary Screens
        </div>
        <div style={{
          display: 'flex', gap: '48px', alignItems: 'flex-start',
          flexWrap: 'wrap', marginBottom: '72px',
        }}>
          {CITIZEN_SCREENS.map((page, i) => (
            <ScaledFrame key={i} scale={0.44} width={page.width} height={page.height} label={page.label} route={page.route}>
              {page.artboard}
            </ScaledFrame>
          ))}
        </div>

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontFamily: SANS, fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Secondary screens
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* ── Secondary screens ─────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '48px', alignItems: 'flex-start',
          flexWrap: 'wrap', marginBottom: '72px',
        }}>
          {SECONDARY_SCREENS.map((page, i) => (
            <ScaledFrame key={i} scale={0.44} width={page.width} height={page.height} label={page.label} route={page.route}>
              {page.artboard}
            </ScaledFrame>
          ))}
        </div>

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontFamily: SANS, fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Error states
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* ── Error States ───────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', marginBottom: '72px' }}>
          {ERROR_SCREENS.map((page, i) => (
            <ScaledFrame key={i} scale={0.32} width={page.width} height={page.height} label={page.label} route={page.route}>
              {page.artboard}
            </ScaledFrame>
          ))}
        </div>

        {/* Desktop surfaces callout */}
        <div style={{
          marginTop: '12px', paddingTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            fontFamily: SANS, fontSize: '11px', color: '#555',
            marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Desktop surfaces
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { label: 'Advocate Workspace', route: '/advocate', desc: 'Matter brief + live document composer' },
              { label: 'Language Showcase',  route: '/languages', desc: '12 languages · India\'s full linguistic reality' },
            ].map(s => (
              <a
                key={s.route}
                href={s.route}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '4px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '14px 18px',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontFamily: SANS, fontSize: '13px', color: '#CCC', fontWeight: 500 }}>
                  {s.label} →
                </span>
                <span style={{ fontFamily: SANS, fontSize: '11px', color: '#666' }}>
                  {s.desc}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Design tokens */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            fontFamily: SANS, fontSize: '11px', color: '#555',
            marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Design system tokens
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Background', hex: C.bg },
              { label: 'Navy',       hex: C.navy },
              { label: 'Saffron',    hex: C.saffron },
              { label: 'Terracotta', hex: C.terracotta },
              { label: 'Border',     hex: C.border },
              { label: 'Surface',    hex: C.surface },
            ].map(token => (
              <div key={token.label} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '6px 10px',
              }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '3px',
                  background: token.hex, border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0,
                }} />
                <span style={{ fontFamily: SANS, fontSize: '11px', color: '#888' }}>{token.label}</span>
                <span style={{ fontFamily: SANS, fontSize: '10px', color: '#555' }}>{token.hex}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
