import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Microphone, TextT } from '@phosphor-icons/react';
import { VoiceOrb } from '../../components/shared';
import { VoiceFactChips } from '../../components/mobile/VoiceFactChips';
import {
  Stack, Row, Text, Label, Button, IconButton, Textarea,
  T, S, ICON, ICON_WEIGHT, useHaptic, useSystemStyles,
} from '../../ui';
import { MobileRouteCanvas } from './MobileHome';
import { AppScreen } from '../../components/mobile/AppScreen';
import { useDemo } from '../../context/DemoContext';
import { Turn, TurnStatus } from '../../components/ai/Turn';
import type { ResponseTurn } from '../../data/responseTurns';
import { DEMO_PROGRESS_STAGES } from '../../data/responseTurns';
import { extractEntities, useVoiceCapture, type VoiceEntity } from '../../hooks/useVoiceCapture';

/**
 * Voice capture — speak instead of type, and see it caught before it commits.
 *
 * Rebuilt on the system 2026-08-27. The two trust moments the case study leans
 * on stay exactly as they were, now on the primitives:
 *  - `confirm`: the transcript is EDITABLE before it becomes the matter input.
 *    The user owns their words before the model does anything with them.
 *  - `unclear`: LokAI refuses to guess, and always offers the text escape.
 *
 * The listening visual is the shared `<VoiceOrb>` (animated level bars), not the
 * old hand-rolled pulsing circle. Honesty about the prototype (no mic permission,
 * scripted sample) is a quiet line under the action, never the hero.
 */

export function VoiceActiveArtboard() {
  useSystemStyles();
  const navigate = useNavigate();
  const { runPreparedInput, isProgressing, progressLabel, progressIndex, skipProgress } = useDemo();
  const haptic = useHaptic();
  const voice = useVoiceCapture({ initialPhase: 'intent' });
  const [answer, setAnswer] = useState<ResponseTurn | null>(null);
  const phase = voice.phase;
  const transcriptRef = useRef<HTMLTextAreaElement>(null);
  /* Re-derived per edit so a corrected word still yields its chips. */
  const entities = useMemo(() => extractEntities(voice.transcript), [voice.transcript]);

  /* A chip selects its own words in the editable transcript — the fact points
     back at the user's sentence instead of asserting itself. */
  const jumpToEntity = (entity: VoiceEntity) => {
    const el = transcriptRef.current;
    if (!el) return;
    const idx = el.value.toLowerCase().indexOf(entity.value.toLowerCase());
    el.focus();
    if (idx >= 0) el.setSelectionRange(idx, idx + entity.value.length);
  };

  const confirmAndAnswer = async () => {
    /* The commit tick: these words are now the matter input. */
    haptic();
    voice.setPhase('answering');
    const turn = await runPreparedInput(voice.transcript);
    setAnswer(turn);
    voice.setPhase('done');
  };

  // Each phase names its own pinned primary action (Screen's action slot).
  let action: React.ReactNode = null;
  if (phase === 'intent') {
    action = (
      <Button icon={<Microphone size={ICON.ui} weight={ICON_WEIGHT} />} onClick={voice.startSample}>
        Play sample voice note
      </Button>
    );
  } else if (phase === 'unclear') {
    action = (
      <Stack gap={2}>
        <Button onClick={voice.startSample}>Retry sample voice</Button>
        <Button variant="quiet" icon={<TextT size={ICON.ui} weight={ICON_WEIGHT} />} onClick={() => navigate('/mobile/case/consumer?stage=intake')}>
          Type instead
        </Button>
      </Stack>
    );
  } else if (phase === 'confirm') {
    action = <Button onClick={() => void confirmAndAnswer()}>Confirm and continue</Button>;
  } else if (phase === 'done') {
    action = <Button onClick={() => navigate('/mobile/case/consumer?stage=plan')}>Open case journey</Button>;
  }

  return (
    <AppScreen
      onBack={() => navigate('/mobile/home')}
      context={<Text role="meta" tone="faint">Voice input · prepared listening flow</Text>}
      action={action}
      scrollClearance={S[6]}
    >
      {phase === 'intent' && (
        <Stack gap={4}>
          <Stack gap={2}>
            <Text role="answer">Say what happened.</Text>
            <Text tone="quiet">
              Speaking is often easier than typing a legal problem — especially in
              Hindi, Marathi, or Tamil. You'll see the transcript and can correct
              it before anything is used.
            </Text>
          </Stack>
          <Button variant="quiet" size="sm" onClick={voice.simulateUnclear}>
            Simulate unclear audio
          </Button>
          <Text role="meta" tone="faint" style={{ letterSpacing: 'normal', textTransform: 'none' }}>
            Prototype: plays a scripted sample. No microphone permission is
            requested and no audio leaves the device.
          </Text>
        </Stack>
      )}

      {(phase === 'listening' || phase === 'transcribing') && (
        <Stack gap={5} align="center" style={{ paddingTop: S[7] }}>
          <VoiceOrb size={96} state={phase === 'listening' ? 'listening' : 'processing'} live />
          <Text role="bodyStrong" style={{ textAlign: 'center' }}>
            {phase === 'listening' ? 'Playing prepared voice example…' : 'Turning the example into text…'}
          </Text>
          <Button variant="quiet" size="sm" onClick={voice.skipToConfirm} style={{ alignSelf: 'center' }}>
            Skip animation
          </Button>
        </Stack>
      )}

      {phase === 'unclear' && (
        <Stack gap={2}>
          <Text role="lead">That sample was unclear</Text>
          <Text tone="quiet">LokAI will not guess. Retry the sample or type the issue instead.</Text>
        </Stack>
      )}

      {phase === 'confirm' && (
        <Stack gap={3}>
          <Stack gap={1}>
            <Text role="title">Confirm the transcript</Text>
            <Text role="caption" tone="faint" measured={false}>
              Edit if needed, then confirm. This becomes the matter input.
            </Text>
          </Stack>
          <VoiceFactChips entities={entities} onJump={jumpToEntity} />
          <Textarea
            ref={transcriptRef}
            value={voice.transcript}
            onChange={(e) => voice.setTranscript(e.target.value)}
            rows={4}
            aria-label="Edit the transcript before submitting"
          />
        </Stack>
      )}

      {(phase === 'answering' || phase === 'done') && (
        <Stack gap={3}>
          {isProgressing && progressLabel && (
            <TurnStatus
              label={progressLabel}
              stages={DEMO_PROGRESS_STAGES}
              activeIndex={Math.max(0, progressIndex)}
              onSkip={skipProgress}
            />
          )}
          {answer && <Turn turn={answer} />}
        </Stack>
      )}
    </AppScreen>
  );
}

export default function MobileVoiceActive() {
  return (
    <MobileRouteCanvas>
      <VoiceActiveArtboard />
    </MobileRouteCanvas>
  );
}
