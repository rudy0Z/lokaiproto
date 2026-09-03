import { useCallback, useEffect, useRef, useState } from 'react';

export type VoicePhase =
  | 'idle'
  | 'intent'
  | 'listening'
  | 'transcribing'
  | 'confirm'
  | 'unclear'
  | 'answering'
  | 'done'
  | 'error';

export const SAMPLE_VOICE_TRANSCRIPT =
  'I bought a damaged mixer grinder for ₹8,999 and the seller refused a replacement.';

export interface VoiceEntity {
  id: string;
  label: string;
  value: string;
}

const PRODUCT_NOUNS =
  /mixer grinder|mixer|pressure cooker|refrigerator|washing machine|television|smartphone|headphones|kettle/i;

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * What the transcript actually says, as scannable facts. Derived by pattern,
 * honestly: no model runs in the demo, so the chips come from regexes over
 * the user's own words (or the prepared sample's) — a chip appears only for
 * something the transcript genuinely contains. Tapping a chip selects those
 * exact words in the editable transcript: the facts point back at the user's
 * own sentence, which is the whole trust argument.
 */
export function extractEntities(transcript: string): VoiceEntity[] {
  const entities: VoiceEntity[] = [];
  const amount = transcript.match(/₹\s?[\d,]+(?:\.\d{1,2})?/);
  if (amount) entities.push({ id: 'amount', label: 'Amount', value: amount[0].replace(/\s/g, '') });
  const product = transcript.match(PRODUCT_NOUNS);
  if (product) entities.push({ id: 'product', label: 'Product', value: titleCase(product[0]) });
  const defect = transcript.match(/damaged|cracked|broken|defective|dented|not working/i);
  if (defect) entities.push({ id: 'defect', label: 'Issue', value: titleCase(defect[0]) });
  const remedy = transcript.match(/refund|replacement|repair/i);
  if (remedy) entities.push({ id: 'remedy', label: 'Ask', value: titleCase(remedy[0]) });
  const date = transcript.match(/\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}\b/i)
    ?? transcript.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s*\d{4}\b/i);
  if (date) entities.push({ id: 'date', label: 'Date mentioned', value: date[0] });
  return entities;
}

export interface UseVoiceCaptureOptions {
  /** Starting phase — mobile opens on intent; desktop starts idle */
  initialPhase?: VoicePhase;
  sampleTranscript?: string;
  onTranscriptReady?: (text: string) => void;
}

export interface UseVoiceCaptureResult {
  phase: VoicePhase;
  transcript: string;
  setTranscript: (text: string) => void;
  error: string | null;
  /** Begin prepared sample (listening → transcribing → confirm) */
  startSample: () => void;
  /** Force the unclear-audio recovery path */
  simulateUnclear: () => void;
  /** Jump from listening/transcribing straight to confirm */
  skipToConfirm: () => void;
  /** Reset to idle/intent */
  reset: () => void;
  /** Mark answering / done after the caller runs the response engine */
  setPhase: (phase: VoicePhase) => void;
  /** Desktop composer: toggle mic — listening ↔ processing into the textarea */
  toggleDesktopMic: () => void;
  isBusy: boolean;
}

/**
 * Single voice state machine for desktop Composer and mobile VoiceActive.
 * No microphone permission is requested — timers drive the prepared demo.
 */
export function useVoiceCapture(options: UseVoiceCaptureOptions = {}): UseVoiceCaptureResult {
  const {
    initialPhase = 'idle',
    sampleTranscript = SAMPLE_VOICE_TRANSCRIPT,
    onTranscriptReady,
  } = options;

  const [phase, setPhase] = useState<VoicePhase>(initialPhase);
  const [transcript, setTranscript] = useState(sampleTranscript);
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const onReadyRef = useRef(onTranscriptReady);
  onReadyRef.current = onTranscriptReady;

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  /* Listening and transcribing are distinct, meaningful states — the user is
     being heard, then what was heard is being turned into words they can
     check. At 900/650ms neither registered before it was gone. Slower so
     each beat is legible; skipToConfirm still short-circuits for anyone who
     does not want to wait, and reduced-motion users get the same content
     without the animated orb. */
  const startSample = useCallback(() => {
    clearTimers();
    setError(null);
    setPhase('listening');
    schedule(() => {
      setPhase('transcribing');
      schedule(() => {
        setTranscript(sampleTranscript);
        setPhase('confirm');
      }, 1100);
    }, 1800);
  }, [clearTimers, schedule, sampleTranscript]);

  const simulateUnclear = useCallback(() => {
    clearTimers();
    setError(null);
    setPhase('listening');
    schedule(() => setPhase('unclear'), 1400);
  }, [clearTimers, schedule]);

  const skipToConfirm = useCallback(() => {
    clearTimers();
    setTranscript(sampleTranscript);
    setPhase('confirm');
  }, [clearTimers, sampleTranscript]);

  const reset = useCallback(() => {
    clearTimers();
    setError(null);
    setTranscript(sampleTranscript);
    setPhase(initialPhase);
  }, [clearTimers, sampleTranscript, initialPhase]);

  /** Desktop: mic press starts listening; second press or auto-timer fills the field */
  const toggleDesktopMic = useCallback(() => {
    if (phase === 'listening' || phase === 'transcribing') {
      clearTimers();
      setTranscript(sampleTranscript);
      onReadyRef.current?.(sampleTranscript);
      setPhase('idle');
      return;
    }
    if (phase === 'error') {
      setError(null);
      setPhase('idle');
      return;
    }
    clearTimers();
    setError(null);
    setPhase('listening');
    schedule(() => {
      setPhase('transcribing');
      schedule(() => {
        setTranscript(sampleTranscript);
        onReadyRef.current?.(sampleTranscript);
        setPhase('idle');
      }, 1100);
    }, 800);
  }, [phase, clearTimers, schedule, sampleTranscript]);

  const isBusy =
    phase === 'listening' ||
    phase === 'transcribing' ||
    phase === 'answering';

  return {
    phase,
    transcript,
    setTranscript,
    error,
    startSample,
    simulateUnclear,
    skipToConfirm,
    reset,
    setPhase,
    toggleDesktopMic,
    isBusy,
  };
}
