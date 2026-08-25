import React from 'react';
import { GroundingMeter, ReviewGate, VerificationScratchpad } from '../components/LokAIWorkflow';
import { Turn } from '../components/ai/Turn';
import { C, MONO, TYPE, VoiceOrb } from '../components/shared';
import { getTurnById } from '../data/responseTurns';
import { getVerificationFacts } from '../data/caseWorkflow';
import type { ResponseMode } from '../data/responseTurns';
import type { VoiceOrbState } from '../components/shared';

/**
 * Specimen registry — one component, rendered alone at natural size on a bare
 * canvas, for the case study.
 *
 * Full-screen embeds shrink a component's text to illegibility (LokAI's 14px
 * body renders at ~8.6px inside a 240px thumbnail). A specimen shows the one
 * component the decision story is about, at 1:1, so the reader sees the real
 * craft instead of inferring it.
 *
 * `loop` marks specimens that cycle through states on a timer (see
 * useSpecimenLoop) — driven by the parent Specimen page, which passes the
 * current frame index in. A specimen without `loop` is static.
 *
 * All providers are global (App.tsx), so specimens that read context work
 * with no extra wiring.
 */

export interface Specimen {
  id: string;
  label: string;
  group: string;
  note?: string;
  /** Where this lives in the real app — shown on the specimen page so it
   *  never reads as an unexplained form floating in space. */
  source: string;
  /** Natural render width; the frame sizes to this. */
  width?: number;
  /** Frames for a looping specimen. Length drives the loop; index is passed to render. */
  frames?: string[];
  render: (frame: number) => React.ReactNode;
}

/**
 * Mobile stage content width — 390px artboard minus 20px padding each side,
 * per MobileConsumerCase / MobileVoiceActive. Every specimen sourced from a
 * mobile screen renders at this width so its proportions match where it
 * actually lives, not an arbitrary "looks about right" number.
 */
const MOBILE_CONTENT_WIDTH = 350;

/* The response-mode cycle — the single strongest specimen available. Same
   citizen question resolving as different modes: explain, then needing a
   fact, then a partial answer, then a protective stop. No other AI assistant
   surfaces this as a designed taxonomy. */
const MODE_CYCLE: { mode: ResponseMode; turnId: string }[] = [
  { mode: 'explain', turnId: 'consumer-explain' },
  { mode: 'clarify', turnId: 'missing-fact-clarify' },
  { mode: 'disclose', turnId: 'source-gap-disclose' },
  { mode: 'stop', turnId: 'high-risk-stop' },
];

const VOICE_STATES: VoiceOrbState[] = ['idle', 'listening', 'processing', 'error'];

function turnSpecimen(id: string, label: string, turnId: string, note?: string): Specimen {
  return {
    id,
    label,
    group: 'Response modes',
    note,
    source: 'Mobile · case verify/assess stage (also renders in the desktop chat)',
    width: MOBILE_CONTENT_WIDTH,
    render: () => {
      const turn = getTurnById(turnId);
      return turn ? <Turn turn={turn} /> : <MissingTurn id={turnId} />;
    },
  };
}

function MissingTurn({ id }: { id: string }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: TYPE.caption.size, color: C.red, padding: 16 }}>
      No prepared turn: {id}
    </div>
  );
}

export const SPECIMENS: Specimen[] = [
  {
    id: 'response-mode-cycle',
    label: 'Response-mode taxonomy (loop)',
    group: 'Response modes',
    note: 'One question, four modes — the EMOTION_CRAFT system as a designed taxonomy.',
    source: 'Mobile · case verify/assess stage (also renders in the desktop chat)',
    width: MOBILE_CONTENT_WIDTH,
    frames: MODE_CYCLE.map((m) => m.mode),
    render: (frame) => {
      const { turnId } = MODE_CYCLE[frame % MODE_CYCLE.length]!;
      const turn = getTurnById(turnId);
      return turn ? <Turn turn={turn} /> : <MissingTurn id={turnId} />;
    },
  },
  turnSpecimen('turn-explain', 'Explain — three-zone answer', 'consumer-explain', 'Rule / applies / next, with citations.'),
  turnSpecimen('turn-clarify', 'Clarify — needs one fact', 'missing-fact-clarify', 'One question, draft blocked.'),
  turnSpecimen('turn-disclose', 'Disclose — partial answer', 'source-gap-disclose', 'Names the gap plainly.'),
  turnSpecimen('turn-stop', 'Stop — protective refusal', 'high-risk-stop', 'Leaves self-service; human help leads.'),
  turnSpecimen('turn-recover', 'Recover — retry, nothing lost', 'temporary-recover'),

  {
    id: 'voice-orb-cycle',
    label: 'Voice orb states (loop)',
    group: 'Voice',
    note: 'idle → listening → processing → error, crossfading.',
    source: 'Mobile · voice screen and the composer mic on every mobile surface',
    width: 160,
    frames: VOICE_STATES,
    render: (frame) => (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <VoiceOrb size={96} state={VOICE_STATES[frame % VOICE_STATES.length]!} />
      </div>
    ),
  },

  {
    id: 'grounding-meter',
    label: 'Grounding meter',
    group: 'Trust',
    note: 'N of M claims mapped to sources — coverage, not a confidence %.',
    source: 'Mobile/desktop · inside every explain-mode Turn, and the source drawer header',
    width: MOBILE_CONTENT_WIDTH,
    render: () => (
      <div style={{ padding: 16 }}>
        <GroundingMeter grounded={3} total={4} note="One claim awaits a source you can add." />
      </div>
    ),
  },

  {
    id: 'verification-scratchpad',
    label: 'Verification scratchpad',
    group: 'Trust',
    note: 'Confirm-or-fix chips — the citizen owns the facts before the AI interprets them.',
    source: 'Mobile · case verify stage (D-01, the fact-verification gate)',
    width: MOBILE_CONTENT_WIDTH,
    render: () => (
      <div style={{ padding: 16 }}>
        <VerificationScratchpad facts={getVerificationFacts()} onConfirmed={() => {}} />
      </div>
    ),
  },

  {
    id: 'review-gate',
    label: 'Review gate',
    group: 'Trust',
    note: 'Draft unlocks export only after the user reads it — no direct send.',
    source: 'Mobile · case packet stage (D-03, review-gated export)',
    width: MOBILE_CONTENT_WIDTH,
    render: () => (
      <div style={{ padding: 16 }}>
        <ReviewGate draftText={SAMPLE_DRAFT} />
      </div>
    ),
  },
];

const SAMPLE_DRAFT = `To the Seller,

Re: Refund for a damaged mixer grinder (Order HK-48291)

On 6 June 2026 I purchased a mixer grinder for ₹8,999. It arrived damaged and
your team refused a replacement in writing. Under the Consumer Protection Act,
2019, I am entitled to a remedy for a defective product.

I request a full refund within 15 days of this notice, failing which I will
pursue a complaint before the District Consumer Commission.`;

export function getSpecimen(id: string): Specimen | undefined {
  return SPECIMENS.find((s) => s.id === id);
}

export const SPECIMEN_GROUPS = Array.from(new Set(SPECIMENS.map((s) => s.group)));
