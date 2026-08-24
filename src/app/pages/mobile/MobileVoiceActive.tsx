import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Mic, Type } from 'lucide-react';
import { C, LAYOUT, SANS, SERIF, SHADOW, TYPE, VoiceOrb } from '../../components/shared';
import { StatusBar, HomeIndicator, MobileRouteCanvas } from './MobileHome';
import { useDemo } from '../../context/DemoContext';
import { Turn, TurnStatus } from '../../components/ai/Turn';
import type { ResponseTurn } from '../../data/responseTurns';
import { DEMO_PROGRESS_STAGES } from '../../data/responseTurns';
import { useVoiceCapture } from '../../hooks/useVoiceCapture';

/* voicePulse / voiceBarListen removed.
   This screen hand-rolled its own listening visual — a pulsing circle with
   a static mic icon — and defined voiceBarListen for level bars that were
   then never referenced anywhere, so the bars simply did not exist. The
   shared <VoiceOrb> already implements all four states (idle, listening
   with animated bars, processing, error) and now crossfades between them,
   so this screen uses that instead of maintaining a second, less complete
   copy of the same thing. */

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
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <VoiceOrb size={96} state={phase === 'listening' ? 'listening' : 'processing'} />
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
