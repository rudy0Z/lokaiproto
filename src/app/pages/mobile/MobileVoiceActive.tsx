import React, { useState } from 'react';
import { SANS, MONO } from '../../components/shared';
import { StatusBar, HomeIndicator, MobileRouteCanvas } from './MobileHome';
import { callSarvamSTT } from '../../services/api';

// ─── CSS ───────────────────────────────────────────────────────────────────────
const VOICE_CSS = `
  @keyframes voicePulse {
    0%   { transform: scale(1);   opacity: 0.5; }
    100% { transform: scale(1.4); opacity: 0;   }
  }

  @keyframes voiceBarBounce {
    0%, 100% { transform: scaleY(0.4); }
    50%      { transform: scaleY(1.0); }
  }

  @keyframes voiceBreath {
    0%, 100% { transform: scale(1);     }
    50%      { transform: scale(1.055); }
  }

  @keyframes voiceBarListen {
    0%   { transform: scaleY(0.25); }
    20%  { transform: scaleY(0.9);  }
    45%  { transform: scaleY(0.4);  }
    65%  { transform: scaleY(1.0);  }
    85%  { transform: scaleY(0.5);  }
    100% { transform: scaleY(0.25); }
  }

  /* Noise overlay via SVG turbulence */
  .voice-screen-noise::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    background-repeat: repeat;
    pointer-events: none;
    z-index: 0;
  }
`;

// ─── Transcription text ────────────────────────────────────────────────────────
const TRANSCRIPTION = 'My delivery ID has been blocked...';

// ─── Voice Active Artboard ────────────────────────────────────────────────────
export function VoiceActiveArtboard() {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState('Tap mic to start speaking...');
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setLoading(true);
        setTranscription('Transcribing...');
        try {
          const text = await callSarvamSTT(audioBlob);
          setTranscription(text || 'No speech detected');
        } catch (err) {
          console.error('STT failed:', err);
          setTranscription('Error: Transcription failed');
        } finally {
          setLoading(false);
        }
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setRecording(true);
      setTranscription('Listening...');
    } catch (err) {
      console.error('Mic access denied:', err);
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  return (
    <div
      className="voice-screen-noise"
      style={{
        width: '390px',
        height: '844px',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 55% at 50% 40%, rgba(232,131,42,0.18) 0%, transparent 58%), radial-gradient(ellipse 100% 70% at 50% 0%, rgba(19,40,70,0.7) 0%, transparent 65%), #0D1117',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{VOICE_CSS}</style>

      {/* Everything sits above the noise pseudo-element (z-index: 1+) */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Status bar */}
        <StatusBar light />

        {/* Top bar — 56px */}
        <div style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 0 4px',
          flexShrink: 0,
        }}>
          {/* Back arrow — 44×44 tap target */}
          <button
            style={{
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Language selector chip */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '999px',
            padding: '6px 14px',
            cursor: 'pointer',
          }}>
            <span style={{
              fontFamily: SANS,
              fontSize: '13px',
              fontWeight: 500,
              color: '#FFFFFF',
            }}>
              English ▾
            </span>
          </div>
        </div>

        {/* Spacer — pushes orb area to ~40% from top */}
        <div style={{ flex: 1 }} />

        {/* Orb area — centered horizontally */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}>
          {/* Pulse rings + orb container */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px',
            height: '96px',
          }}>
            {/* Pulse rings — recording state only */}
            {recording && (
              <>
                {/* Outer ring: saffron 28% opacity, 1.8s, 0.5s delay */}
                <div style={{
                  position: 'absolute',
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'rgba(232,131,42,0.28)',
                  animation: 'voicePulse 1.8s ease-out infinite',
                  animationDelay: '0.5s',
                }} />
                {/* Inner ring: saffron 45% opacity, 1.8s, no delay */}
                <div style={{
                  position: 'absolute',
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'rgba(232,131,42,0.45)',
                  animation: 'voicePulse 1.8s ease-out infinite',
                }} />
              </>
            )}

            {/* Orb */}
            <button
              onClick={toggleRecording}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: recording
                  ? 'linear-gradient(135deg, #E8832A 0%, #C4620A 100%)'
                  : '#FFFFFF',
                boxShadow: recording
                  ? '0 8px 24px rgba(232,131,42,0.45), 0 2px 8px rgba(0,0,0,0.2)'
                  : '0 8px 24px rgba(26,25,22,0.2), 0 2px 8px rgba(26,25,22,0.1)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                flexShrink: 0,
              }}
            >
              {/* Mic SVG — 32px */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="11" y="3" width="10" height="17" rx="5" fill={recording ? 'white' : '#132846'} />
                <path
                  d="M6 16C6 21.52 10.48 26 16 26C21.52 26 26 21.52 26 16"
                  stroke={recording ? 'white' : '#132846'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line x1="16" y1="26" x2="16" y2="30" stroke={recording ? 'white' : '#132846'} strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="30" x2="22" y2="30" stroke={recording ? 'white' : '#132846'} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Language chip */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: recording ? '#EEF2F8' : 'rgba(255,255,255,0.1)',
            border: recording ? '1px solid #132846' : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '999px',
            padding: '6px 14px',
          }}>
            {recording && (
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#1F6B3A',
                display: 'inline-block',
                flexShrink: 0,
              }} />
            )}
            <span style={{
              fontFamily: SANS,
              fontSize: '13px',
              fontWeight: 500,
              color: recording ? '#132846' : '#FFFFFF',
            }}>
              {recording ? 'English · Listening' : loading ? 'Processing...' : 'Tap mic to speak'}
            </span>
          </div>

          {/* Transcription text — recording state only */}
            <div style={{
              maxWidth: '280px',
              textAlign: 'center',
              padding: '0 16px',
            }}>
              <p style={{
                fontFamily: SANS,
                fontSize: '15px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.65,
                margin: 0,
              }}>
                "{transcription}"
              </p>
            </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Stop button — recording state only, 56px from bottom */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: '56px',
          minHeight: recording ? 'auto' : '0px',
          visibility: recording ? 'visible' : 'hidden',
        }}>
          <button
            onClick={stopRecording}
            style={{
              fontFamily: SANS,
              fontSize: '15px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 24px',
            }}
          >
            Stop
          </button>
        </div>

        {/* Home indicator area */}
        <HomeIndicator />

      </div>
    </div>
  );
}

// Alias for MobileCanvas compatibility
export { VoiceActiveArtboard as VoiceArtboard };

// ─── Voice Output Artboard (AI speaking state) ────────────────────────────────
// Full-screen voice mode — AI's turn to speak. No chat thread on screen.
// Mirrors VoiceActiveArtboard layout exactly; only color + icon differ:
//   Saffron orb + mic icon  →  navy orb + waveform bars
//   Green "detected" dot    →  navy "speaking" dot
export function VoiceOutputArtboard() {
  const [speaking, setSpeaking] = useState(true);

  return (
    <div
      className="voice-screen-noise"
      style={{
        width: '390px',
        height: '844px',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 55% at 50% 40%, rgba(232,131,42,0.18) 0%, transparent 58%), radial-gradient(ellipse 100% 70% at 50% 0%, rgba(19,40,70,0.7) 0%, transparent 65%), #0D1117',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{VOICE_CSS}</style>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

        <StatusBar light />

        {/* Top bar — 56px */}
        <div style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 0 4px',
          flexShrink: 0,
        }}>
          {/* Back arrow */}
          <button style={{
            width: '44px', height: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Language selector chip */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '999px', padding: '6px 14px', cursor: 'pointer',
          }}>
            <span style={{ fontFamily: SANS, fontSize: '13px', fontWeight: 500, color: '#FFFFFF' }}>
              English ▾
            </span>
          </div>
        </div>

        {/* Spacer — pushes orb to ~40% from top, same as VoiceActiveArtboard */}
        <div style={{ flex: 1 }} />

        {/* Orb area — centered horizontally */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}>
          {/* Pulse rings + orb container */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px',
            height: '96px',
          }}>
            {/* Pulse rings — navy tint, speaking state only */}
            {speaking && (
              <>
                {/* Outer ring */}
                <div style={{
                  position: 'absolute', width: '96px', height: '96px', borderRadius: '50%',
                  background: 'rgba(34,71,138,0.28)',
                  animation: 'voicePulse 1.8s ease-out infinite',
                  animationDelay: '0.5s',
                }} />
                {/* Inner ring */}
                <div style={{
                  position: 'absolute', width: '96px', height: '96px', borderRadius: '50%',
                  background: 'rgba(34,71,138,0.45)',
                  animation: 'voicePulse 1.8s ease-out infinite',
                }} />
              </>
            )}

            {/* Orb — navy gradient when speaking, white when idle */}
            <div
              style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: speaking
                  ? 'linear-gradient(135deg, #22478A 0%, #132846 100%)'
                  : '#FFFFFF',
                boxShadow: speaking
                  ? '0 8px 24px rgba(34,71,138,0.45), 0 2px 8px rgba(0,0,0,0.2)'
                  : '0 8px 24px rgba(26,25,22,0.2), 0 2px 8px rgba(26,25,22,0.1)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                flexShrink: 0,
                cursor: 'pointer',
              }}
              onClick={() => setSpeaking(!speaking)}
            >
              {/* Waveform bars (speaking) — 5 bars, bouncing */}
              {speaking ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '32px' }}>
                  {[10, 18, 26, 18, 10].map((h, i) => (
                    <div key={i} style={{
                      width: '3px',
                      height: `${h}px`,
                      borderRadius: '2px',
                      background: 'rgba(255,255,255,0.92)',
                      transformOrigin: 'center',
                      animation: 'voiceBarBounce 0.75s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`,
                    }} />
                  ))}
                </div>
              ) : (
                /* Speaker icon when idle */
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#132846" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#132846" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </div>
          </div>

          {/* Status chip — mirrors the "detected" chip from VoiceActiveArtboard */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: speaking ? '#EEF2F8' : 'rgba(255,255,255,0.1)',
            border: speaking ? '1px solid #132846' : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '999px',
            padding: '6px 14px',
          }}>
            {speaking && (
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#132846', display: 'inline-block', flexShrink: 0,
              }} />
            )}
            <span style={{
              fontFamily: SANS, fontSize: '13px', fontWeight: 500,
              color: speaking ? '#132846' : '#FFFFFF',
            }}>
              {speaking ? 'LokAI · Speaking' : 'Tap to replay'}
            </span>
          </div>

          {/* Spoken text — mirrors the transcription line from VoiceActiveArtboard */}
          {speaking && (
            <div style={{ maxWidth: '280px', textAlign: 'center', padding: '0 16px' }}>
              <p style={{
                fontFamily: SANS, fontSize: '15px', fontWeight: 600,
                color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, margin: 0,
              }}>
                "Under e-commerce rules 2020, withholding your ₹3,400 balance is illegal..."
              </p>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Interrupt / stop button — mirrors Stop in VoiceActiveArtboard */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: '56px',
          minHeight: speaking ? 'auto' : '0px',
          visibility: speaking ? 'visible' : 'hidden',
        }}>
          <button
            onClick={() => setSpeaking(false)}
            style={{
              fontFamily: SANS, fontSize: '15px', fontWeight: 500,
              color: 'rgba(255,255,255,0.8)', background: 'transparent',
              border: 'none', cursor: 'pointer', padding: '8px 24px',
            }}
          >
            Stop
          </button>
        </div>

        <HomeIndicator />
      </div>
    </div>
  );
}

// ─── Voice Listening Artboard v2 (immersive redesign) ────────────────────────
// Bigger orb · 3 pulse rings · breathing animation · saffron box-shadow glow
// Waveform bars visualise the user's voice · transcript in a glass card
export function VoiceListeningArtboard() {
  const [recording, setRecording] = useState(true);

  return (
    <div className="voice-screen-noise" style={{
      width: '390px', height: '844px', position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(ellipse 80% 55% at 50% 40%, rgba(232,131,42,0.18) 0%, transparent 58%), radial-gradient(ellipse 100% 70% at 50% 0%, rgba(19,40,70,0.7) 0%, transparent 65%), #0D1117',
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{VOICE_CSS}</style>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

        <StatusBar light />

        {/* Top bar */}
        <div style={{
          height: '56px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px 0 4px', flexShrink: 0,
        }}>
          <button style={{
            width: '44px', height: '44px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span style={{
            fontFamily: SANS, fontSize: '14px', fontWeight: 600,
            color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em',
          }}>
            Delivery Issue
          </span>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '999px', padding: '5px 12px', cursor: 'pointer',
          }}>
            <span style={{ fontFamily: SANS, fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.88)' }}>
              English ▾
            </span>
          </div>
        </div>

        {/* Spacer — top */}
        <div style={{ flex: 1 }} />

        {/* ── Orb section ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Rings + orb */}
          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            justifyContent: 'center', width: '128px', height: '128px',
          }}>
            {recording && (
              <>
                <div style={{
                  position: 'absolute', width: '128px', height: '128px', borderRadius: '50%',
                  background: 'rgba(232,131,42,0.1)',
                  animation: 'voicePulse 2.5s ease-out infinite', animationDelay: '1s',
                }} />
                <div style={{
                  position: 'absolute', width: '128px', height: '128px', borderRadius: '50%',
                  background: 'rgba(232,131,42,0.2)',
                  animation: 'voicePulse 2.5s ease-out infinite', animationDelay: '0.5s',
                }} />
                <div style={{
                  position: 'absolute', width: '128px', height: '128px', borderRadius: '50%',
                  background: 'rgba(232,131,42,0.35)',
                  animation: 'voicePulse 2.5s ease-out infinite',
                }} />
              </>
            )}

            <button onClick={() => setRecording(!recording)} style={{
              width: '128px', height: '128px', borderRadius: '50%',
              background: recording
                ? 'linear-gradient(135deg, #F0922A 0%, #C4620A 100%)'
                : 'rgba(255,255,255,0.08)',
              /* Multi-layer shadow creates the ambient glow without extra divs */
              boxShadow: recording
                ? '0 0 80px rgba(232,131,42,0.28), 0 0 40px rgba(232,131,42,0.18), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                : '0 8px 24px rgba(26,25,22,0.2)',
              border: recording ? 'none' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', position: 'relative', zIndex: 1, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: recording ? 'voiceBreath 3s ease-in-out infinite' : 'none',
            }}>
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                <rect x="11" y="3" width="10" height="17" rx="5"
                  fill={recording ? 'white' : 'rgba(255,255,255,0.35)'} />
                <path d="M6 16C6 21.52 10.48 26 16 26C21.52 26 26 21.52 26 16"
                  stroke={recording ? 'white' : 'rgba(255,255,255,0.35)'}
                  strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="26" x2="16" y2="30"
                  stroke={recording ? 'white' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="30" x2="22" y2="30"
                  stroke={recording ? 'white' : 'rgba(255,255,255,0.35)'} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Status label */}
          <div style={{ height: '20px' }} />
          <span style={{
            fontFamily: SANS, fontSize: '18px', fontWeight: 500,
            color: recording ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.3)',
            letterSpacing: '-0.015em',
          }}>
            {recording ? 'Listening...' : 'Speak'}
          </span>

          {/* Waveform — 12 saffron bars representing user's voice */}
          {recording && (
            <>
              <div style={{ height: '16px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '28px' }}>
                {[6, 12, 18, 24, 16, 22, 14, 20, 10, 24, 14, 8].map((h, i) => (
                  <div key={i} style={{
                    width: '3px', height: `${h}px`, borderRadius: '2px',
                    background: 'rgba(232,131,42,0.68)',
                    transformOrigin: 'center',
                    animation: 'voiceBarListen 0.9s ease-in-out infinite',
                    animationDelay: `${i * 0.075}s`,
                  }} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Transcript glass card */}
        {recording && (
          <>
            <div style={{ height: '24px' }} />
            <div style={{
              margin: '0 24px',
              background: 'rgba(255,255,255,0.055)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '18px',
              padding: '18px 20px',
            }}>
              <p style={{
                fontFamily: SANS, fontSize: '16px', fontWeight: 500,
                color: 'rgba(255,255,255,0.88)', lineHeight: 1.65,
                margin: 0, textAlign: 'center',
              }}>
                "{TRANSCRIPTION}"
              </p>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(232,131,42,0.12)', border: '1px solid rgba(232,131,42,0.26)',
                  borderRadius: '999px', padding: '4px 12px',
                }}>
                  <span style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: '#E8832A', display: 'inline-block', flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: SANS, fontSize: '11px', fontWeight: 500,
                    color: 'rgba(232,131,42,0.88)',
                  }}>
                    English · Detected
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Spacer — bottom */}
        <div style={{ flex: 1 }} />

        {/* Stop button */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          paddingBottom: '52px', minHeight: '72px',
          visibility: recording ? 'visible' : 'hidden',
        }}>
          <button onClick={() => setRecording(false)} style={{
            fontFamily: SANS, fontSize: '14px', fontWeight: 500,
            color: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '999px', cursor: 'pointer', padding: '12px 36px',
          }}>
            Stop
          </button>
        </div>

        <HomeIndicator />
      </div>
    </div>
  );
}

// ─── Voice Speaking Artboard v2 (immersive redesign) ─────────────────────────
// Navy orb · waveform bars inside · box-shadow glow · breathing animation
// Glass response card shows legal finding + citation + saffron CTA
export function VoiceSpeakingArtboard() {
  const [speaking, setSpeaking] = useState(true);

  return (
    <div className="voice-screen-noise" style={{
      width: '390px', height: '844px', position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(ellipse 80% 55% at 50% 40%, rgba(232,131,42,0.18) 0%, transparent 58%), radial-gradient(ellipse 100% 70% at 50% 0%, rgba(19,40,70,0.7) 0%, transparent 65%), #0D1117',
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{VOICE_CSS}</style>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

        <StatusBar light />

        {/* Top bar */}
        <div style={{
          height: '56px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px 0 4px', flexShrink: 0,
        }}>
          <button style={{
            width: '44px', height: '44px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span style={{
            fontFamily: SANS, fontSize: '14px', fontWeight: 600,
            color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em',
          }}>
            Delivery Issue
          </span>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '999px', padding: '5px 12px', cursor: 'pointer',
          }}>
            <span style={{ fontFamily: SANS, fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.88)' }}>
              English ▾
            </span>
          </div>
        </div>

        {/* Spacer — top */}
        <div style={{ flex: 1 }} />

        {/* ── Orb section ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Rings + orb */}
          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            justifyContent: 'center', width: '128px', height: '128px',
          }}>
            {speaking && (
              <>
                <div style={{
                  position: 'absolute', width: '128px', height: '128px', borderRadius: '50%',
                  background: 'rgba(34,71,138,0.12)',
                  animation: 'voicePulse 2.5s ease-out infinite', animationDelay: '1s',
                }} />
                <div style={{
                  position: 'absolute', width: '128px', height: '128px', borderRadius: '50%',
                  background: 'rgba(34,71,138,0.22)',
                  animation: 'voicePulse 2.5s ease-out infinite', animationDelay: '0.5s',
                }} />
                <div style={{
                  position: 'absolute', width: '128px', height: '128px', borderRadius: '50%',
                  background: 'rgba(34,71,138,0.38)',
                  animation: 'voicePulse 2.5s ease-out infinite',
                }} />
              </>
            )}

            <div onClick={() => setSpeaking(!speaking)} style={{
              width: '128px', height: '128px', borderRadius: '50%',
              background: speaking
                ? 'linear-gradient(135deg, #2A5AAA 0%, #132846 100%)'
                : 'rgba(255,255,255,0.07)',
              boxShadow: speaking
                ? '0 0 80px rgba(34,71,138,0.45), 0 0 40px rgba(34,71,138,0.25), 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14)'
                : '0 8px 24px rgba(26,25,22,0.2)',
              border: speaking ? 'none' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', position: 'relative', zIndex: 1, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: speaking ? 'voiceBreath 2.8s ease-in-out infinite' : 'none',
            }}>
              {/* 7-bar waveform — mountain silhouette shape when speaking */}
              {speaking ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '40px' }}>
                  {[10, 18, 28, 38, 28, 18, 10].map((h, i) => (
                    <div key={i} style={{
                      width: '3.5px', height: `${h}px`, borderRadius: '2px',
                      background: 'rgba(255,255,255,0.92)',
                      transformOrigin: 'center',
                      animation: 'voiceBarBounce 0.7s ease-in-out infinite',
                      animationDelay: `${i * 0.08}s`,
                    }} />
                  ))}
                </div>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="rgba(255,255,255,0.38)" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="rgba(255,255,255,0.38)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </div>
          </div>

          {/* Status label */}
          <div style={{ height: '20px' }} />
          <span style={{
            fontFamily: SANS, fontSize: '18px', fontWeight: 500,
            color: speaking ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.3)',
            letterSpacing: '-0.015em',
          }}>
            {speaking ? 'LokAI Speaking...' : 'Done'}
          </span>
        </div>

        {/* ── Response card — legal finding being spoken ── */}
        {speaking && (
          <>
            <div style={{ height: '28px' }} />
            <div style={{
              margin: '0 20px',
              background: 'rgba(255,255,255,0.065)',
              border: '1px solid rgba(255,255,255,0.11)',
              borderRadius: '20px',
              overflow: 'hidden',
            }}>
              {/* Saffron accent strip at top */}
              <div style={{
                height: '3px',
                background: 'linear-gradient(90deg, #E8832A 0%, #C4620A 100%)',
              }} />
              <div style={{ padding: '18px 20px' }}>
                <div style={{
                  fontFamily: SANS, fontSize: '10px', fontWeight: 600,
                  color: 'rgba(232,131,42,0.82)', textTransform: 'uppercase',
                  letterSpacing: '0.1em', marginBottom: '10px',
                }}>
                  Legal Finding
                </div>
                <p style={{
                  fontFamily: SANS, fontSize: '15px', fontWeight: 500,
                  color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, margin: 0,
                }}>
                  Under e-commerce rules 2020, withholding your ₹3,400 balance is illegal.
                </p>
                <div style={{
                  marginTop: '14px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: 'rgba(28,58,110,0.55)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '5px', padding: '4px 9px',
                    fontFamily: MONO, fontSize: '10px', fontWeight: 500,
                    color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap',
                  }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                    Consumer Protection (E-Commerce) Rules · 2020
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                    3:48 PM
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Spacer — bottom */}
        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <div style={{
          display: 'flex', gap: '10px',
          padding: '0 20px 52px',
          visibility: speaking ? 'visible' : 'hidden',
        }}>
          <button onClick={() => setSpeaking(false)} style={{
            flex: 1, height: '48px',
            fontFamily: SANS, fontSize: '14px', fontWeight: 500,
            color: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '999px', cursor: 'pointer',
          }}>
            Stop
          </button>
          <button style={{
            flex: 2, height: '48px',
            fontFamily: SANS, fontSize: '14px', fontWeight: 600,
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, #E8832A 0%, #C4620A 100%)',
            border: 'none', borderRadius: '999px', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(232,131,42,0.3)',
          }}>
            Draft Complaint Letter
          </button>
        </div>

        <HomeIndicator />
      </div>
    </div>
  );
}

// ─── Route page ────────────────────────────────────────────────────────────────
export default function MobileVoiceActive() {
  return (
    <MobileRouteCanvas>
      <VoiceSpeakingArtboard />
    </MobileRouteCanvas>
  );
}
