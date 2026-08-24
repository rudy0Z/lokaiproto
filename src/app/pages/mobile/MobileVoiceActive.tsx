import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Mic, Type } from 'lucide-react';
import { C, LAYOUT, SANS, SERIF, SHADOW, TYPE } from '../../components/shared';
import { StatusBar, HomeIndicator, MobileRouteCanvas } from './MobileHome';
import { useDemo } from '../../context/DemoContext';
import { Turn, TurnStatus } from '../../components/ai/Turn';
import type { ResponseTurn } from '../../data/responseTurns';
import { DEMO_PROGRESS_STAGES } from '../../data/responseTurns';
import { useVoiceCapture } from '../../hooks/useVoiceCapture';

const VOICE_CSS = `
  @keyframes voicePulse {
    0%   { transform: scale(1);   opacity: 0.5; }
    100% { transform: scale(1.35); opacity: 0;   }
  }
  @keyframes voiceBarListen {
    0%, 100% { transform: scaleY(0.3); }
    50% { transform: scaleY(1); }
  }
`;

export function VoiceActiveArtboard() {
  const navigate = useNavigate();
  const { runPreparedInput, isProgressing, progressLabel, progressIndex, skipProgress } = useDemo();
  const voice = useVoiceCapture({ initialPhase: 'intent' });
  const [answer, setAnswer] = useState<ResponseTurn | null>(null);

  const confirmAndAnswer = async () => {
    voice.setPhase('answering');
    const turn = await runPreparedInput(voice.transcript);
    setAnswer(turn);
    voice.setPhase('done');
  };

  const phase = voice.phase;

  return (
    <div
      style={{
        width: 390,
        height: 844,
        position: 'relative',
        overflow: 'hidden',
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{VOICE_CSS}</style>
      <StatusBar />
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: `1px solid ${C.border}`,
        background: C.surface,
      }}>
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate('/mobile/home')}
          style={{
            width: 40, height: 40, borderRadius: LAYOUT.radius.panel, border: `1px solid ${C.border}`,
            background: C.surface, display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={17} color={C.inkSoft} />
        </button>
        <div>
          <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Sample voice
          </p>
          <p style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 700, color: C.ink, margin: 0 }}>
            Prepared listening flow
          </p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>
        {phase === 'intent' && (
          <div>
            <h1 style={{ fontFamily: SERIF, fontSize: TYPE.editorial.size, color: C.ink, margin: '0 0 10px', lineHeight: 1.15 }}>
              Use a prepared voice note
            </h1>
            <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 20px' }}>
              No microphone permission is requested. This plays a scripted sample, shows an editable transcript, then feeds the same response engine as text.
            </p>
            <button
              type="button"
              onClick={voice.startSample}
              style={{
                width: '100%', minHeight: 52, borderRadius: LAYOUT.radius.panel, border: 'none',
                background: C.navy, color: '#fff', fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 10,
              }}
            >
              <Mic size={18} /> Play sample voice note
            </button>
            <button
              type="button"
              onClick={voice.simulateUnclear}
              style={{
                width: '100%', minHeight: 44, borderRadius: LAYOUT.radius.panel, border: `1px solid ${C.border}`,
                background: C.surface, color: C.inkSoft, fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Simulate unclear audio
            </button>
          </div>
        )}

        {(phase === 'listening' || phase === 'transcribing') && (
          <div style={{ textAlign: 'center', paddingTop: 48 }}>
            <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 24px' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: LAYOUT.radius.full,
                background: 'rgba(233,133,43,0.25)',
                animation: phase === 'listening' ? 'voicePulse 1.2s ease-out infinite' : undefined,
              }} />
              <div style={{
                position: 'absolute', inset: 16, borderRadius: LAYOUT.radius.full,
                background: C.navy, display: 'grid', placeItems: 'center', color: '#fff',
              }}>
                <Mic size={28} />
              </div>
            </div>
            <p style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 700, color: C.ink }}>
              {phase === 'listening' ? 'Playing prepared voice example…' : 'Turning the example into text…'}
            </p>
            <button
              type="button"
              onClick={voice.skipToConfirm}
              style={{
                marginTop: 16, minHeight: 40, padding: '0 16px', borderRadius: LAYOUT.radius.control,
                border: `1px solid ${C.border}`, background: C.surface, fontFamily: SANS,
                fontSize: TYPE.caption.size, fontWeight: 600, color: C.navy, cursor: 'pointer',
              }}
            >
              Skip animation
            </button>
          </div>
        )}

        {phase === 'unclear' && (
          <div>
            <h2 style={{ fontFamily: SANS, fontSize: TYPE.lead.size, color: C.ink, margin: '0 0 8px' }}>
              That sample was unclear
            </h2>
            <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 16px' }}>
              LokAI will not guess. Retry the sample or type the issue instead.
            </p>
            <button type="button" onClick={voice.startSample} style={primaryBtn}>Retry sample voice</button>
            <button
              type="button"
              onClick={() => navigate('/mobile/case/consumer?stage=intake')}
              style={{ ...secondaryBtn, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Type size={16} /> Type instead
            </button>
          </div>
        )}

        {phase === 'confirm' && (
          <div>
            <h2 style={{ fontFamily: SANS, fontSize: TYPE.h4.size, fontWeight: 700, color: C.ink, margin: '0 0 8px' }}>
              Confirm the transcript
            </h2>
            <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, margin: '0 0 10px' }}>
              Edit if needed, then confirm. This becomes the matter input.
            </p>
            <textarea
              value={voice.transcript}
              onChange={(e) => voice.setTranscript(e.target.value)}
              rows={4}
              style={{
                width: '100%', boxSizing: 'border-box', borderRadius: LAYOUT.radius.panel,
                border: `1px solid ${C.border}`, padding: 12, fontFamily: SANS, fontSize: TYPE.body.size,
                lineHeight: 1.55, color: C.ink, background: C.surface, resize: 'vertical',
                boxShadow: SHADOW.xs,
              }}
            />
            <button type="button" onClick={() => void confirmAndAnswer()} style={{ ...primaryBtn, marginTop: 12 }}>
              Confirm and continue
            </button>
          </div>
        )}

        {(phase === 'answering' || phase === 'done') && (
          <div>
            {isProgressing && progressLabel && (
              <TurnStatus
                label={progressLabel}
                stages={DEMO_PROGRESS_STAGES}
                activeIndex={Math.max(0, progressIndex)}
                onSkip={skipProgress}
              />
            )}
            {answer && <Turn turn={answer} />}
            {phase === 'done' && (
              <button
                type="button"
                onClick={() => navigate('/mobile/case/consumer?stage=plan')}
                style={{ ...primaryBtn, marginTop: 8 }}
              >
                Open case journey
              </button>
            )}
          </div>
        )}
      </div>
      <HomeIndicator />
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  width: '100%',
  minHeight: 48,
  borderRadius: LAYOUT.radius.panel,
  border: 'none',
  background: C.navy,
  color: '#fff',
  fontFamily: SANS,
  fontSize: TYPE.body.size,
  fontWeight: 800,
  cursor: 'pointer',
};

const secondaryBtn: React.CSSProperties = {
  width: '100%',
  minHeight: 44,
  borderRadius: LAYOUT.radius.panel,
  border: `1px solid ${C.border}`,
  background: C.surface,
  color: C.inkSoft,
  fontFamily: SANS,
  fontSize: TYPE.small.size,
  fontWeight: 600,
  cursor: 'pointer',
};

export default function MobileVoiceActive() {
  return (
    <MobileRouteCanvas>
      <VoiceActiveArtboard />
    </MobileRouteCanvas>
  );
}
