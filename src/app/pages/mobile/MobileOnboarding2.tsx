import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { SANS, C, GRAD, SHADOW } from '../../components/shared';
import { StatusBar, HomeIndicator, MobileRouteCanvas } from './MobileHome';
import { OnboardingDots } from './MobileOnboarding1';

// ─── 12 supported languages ────────────────────────────────────────────────────
const LANGUAGES = [
  { native: 'हिंदी',    english: 'Hindi'     },
  { native: 'বাংলা',    english: 'Bengali'   },
  { native: 'தமிழ்',   english: 'Tamil'     },
  { native: 'తెలుగు',  english: 'Telugu'    },
  { native: 'मराठी',   english: 'Marathi'   },
  { native: 'ਪੰਜਾਬੀ',  english: 'Punjabi'   },
  { native: 'ગુજરાતી', english: 'Gujarati'  },
  { native: 'ಕನ್ನಡ',   english: 'Kannada'   },
  { native: 'Odia',    english: 'Odia'      },
  { native: 'മലയാളം',  english: 'Malayalam' },
  { native: 'অসমীয়া', english: 'Assamese'  },
  { native: 'English', english: 'English'   },
];

// ─── Onboarding 2 Artboard ────────────────────────────────────────────────────
export function Onboarding2Artboard() {
  const navigate   = useNavigate();
  const [selected, setSelected] = useState('Hindi');

  return (
    <div style={{
      width: '390px', height: '844px', background: '#F5F2EC',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      position: 'relative',
    }}>

      {/* ── STATUS BAR ── */}
      <StatusBar />

      {/* ── TOP SECTION — non-scrollable, ~28% height ── */}
      <div style={{
        flexShrink: 0,
        padding: '28px 24px 20px',
        background: '#F5F2EC',
      }}>
        {/* Progress dots — dot 2 active */}
        <div style={{ marginBottom: '22px' }}>
          <OnboardingDots active={2} />
        </div>

        {/* Heading — Plus Jakarta Sans 22px weight 700 (NOT DM Serif) */}
        <h1 style={{
          fontFamily: SANS, fontSize: '22px', fontWeight: 700,
          color: '#1A1916', margin: '0 0 8px', lineHeight: 1.25,
        }}>
          How should LokAI speak to you?
        </h1>

        {/* Sub — 14px #8A8880 */}
        <p style={{
          fontFamily: SANS, fontSize: '14px', color: '#8A8880',
          margin: 0, lineHeight: 1.5,
        }}>
          You can change this anytime
        </p>
      </div>

      {/* ── SCROLLABLE LANGUAGE GRID ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '4px 24px 148px',   // 148px bottom clearance for fixed footer
        scrollbarWidth: 'none',
        background: '#F5F2EC',
      } as React.CSSProperties}>

        {/* Language grid — 3×4 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '16px',
        }}>
          {LANGUAGES.map(lang => {
            const isSelected = selected === lang.english;
            return (
              <button
                key={lang.english}
                onClick={() => setSelected(lang.english)}
                style={{
                  background:   isSelected ? '#EEF2F8' : '#FFFFFF',
                  border:       isSelected ? '2px solid #132846' : '1px solid #E8E4DC',
                  borderRadius: '12px',
                  padding:      '14px 8px',
                  cursor:       'pointer',
                  display:      'flex', flexDirection: 'column',
                  alignItems:   'center', gap: '4px',
                  transition:   'all 0.15s ease',
                  position:     'relative',
                }}
              >
                {/* Native script */}
                <span style={{
                  fontFamily: SANS,
                  fontSize: '16px', fontWeight: 600,
                  color: isSelected ? '#132846' : '#1A1916',
                  lineHeight: 1.2,
                }}>
                  {lang.native}
                </span>
                {/* English name */}
                <span style={{
                  fontFamily: SANS, fontSize: '11px', fontWeight: 400,
                  color: isSelected ? '#132846' : '#8A8880',
                  lineHeight: 1.2,
                }}>
                  {lang.english}
                </span>
                {/* Selected check dot */}
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: '5px', right: '5px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: '#132846',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                      <path d="M1 2.5L2.8 4L6 1" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Auto-detect note */}
        <p style={{
          fontFamily: SANS, fontSize: '12px', color: '#8A8880',
          textAlign: 'center', margin: '0 0 8px', lineHeight: 1.55,
        }}>
          LokAI also auto-detects the language you type or speak
        </p>
      </div>

      {/* ── FIXED BOTTOM — white bar, full width ── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        background: '#FFFFFF',
        borderTop: `1px solid ${C.border}`,
        padding: '16px 24px 36px',
        zIndex: 10,
      }}>
        {/* Set Language → gradient button */}
        <button
          onClick={() => navigate('/mobile/onboarding/3')}
          style={{
            width: '100%', height: '52px',
            background: GRAD.buttonPrimary,
            border: 'none', borderRadius: '999px',
            fontFamily: SANS, fontSize: '15px', fontWeight: 600,
            color: '#FFFFFF', cursor: 'pointer',
            boxShadow: SHADOW.sm,
          }}
        >
          Set Language →
        </button>

        {/* Use English for now */}
        <p
          onClick={() => navigate('/mobile/onboarding/3')}
          style={{
            fontFamily: SANS, fontSize: '14px', color: '#8A8880',
            textAlign: 'center', margin: '12px 0 0',
            cursor: 'pointer', lineHeight: 1.4,
          }}
        >
          Use English for now
        </p>

      </div>

    </div>
  );
}

// ─── Route page ────────────────────────────────────────────────────────────────
export default function MobileOnboarding2() {
  return (
    <MobileRouteCanvas>
      <Onboarding2Artboard />
    </MobileRouteCanvas>
  );
}
