import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, BellRing, Camera, Compass, FileText, Mic, PenLine, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { C, LAYOUT, PLANE, SANS, SERIF, SHADOW, TYPE, VoiceOrb } from '../../components/shared';
import { useVoiceCapture } from '../../hooks/useVoiceCapture';
import { BottomNav, HomeIndicator, MobileRouteCanvas, StatusBar, TopNav, getLangLabel } from './MobileHome';
import { useConversations } from '../../context/ConversationContext';
import {
  AuditTrailList,
  EvidenceLocker,
  FailureStateCard,
  FilingPacketPreview,
  HumanReviewCard,
  LokAIProgressList,
  LokAISourceDrawer,
  NoticeAssessmentCard,
  ReviewGate,
  FirstActionChecklist,
  SourceCard,
  VerificationScratchpad,
  WorkflowActionPlan,
  WorkflowTrustPanel,
} from '../../components/LokAIWorkflow';
import {
  getConsumerWorkflowState,
  getEvidenceLocker,
  getFailureState,
  getFailureTrustSignals,
  getNoticeAssessment,
  getVerificationFacts,
  type FailureKind,
  type FilingPacket,
  type NoticeAssessmentKind,
  type WorkflowStage,
} from '../../data/caseWorkflow';
import { ARTBOARD } from '../../embed';
import { LegalText } from '../../components/demo/LegalTerms';
import { GuardrailGallery } from '../../components/demo/GuardrailGallery';
import { useDemo } from '../../context/DemoContext';
import { turnAsLokAIResponse } from '../../demo/responseEngine';
import type { ResponseTurn } from '../../data/responseTurns';
import { DEMO_PROGRESS_STAGES } from '../../data/responseTurns';
import { TurnStatus } from '../../components/ai/Turn';

/* caseCardIn removed — the stage transition is now AnimatePresence-driven
   (see StageTransition below) so it can have a real exit and a direction,
   which a CSS enter-animation on a keyed remount structurally cannot.
   Focus ring was C.saffron (2.46:1, failed WCAG 2.2 1.4.11) — same fix as
   the global :focus-visible rule in index.css. */
const CASE_CSS = `
  .mobile-case-scroll::-webkit-scrollbar { width: 0; height: 0; }
  .mobile-case-chip:focus-visible,
  .mobile-case-button:focus-visible {
    outline: 2px solid ${C.saffronAccessible};
    outline-offset: 2px;
  }
`;

type MobileStageParam = WorkflowStage | 'blocked' | 'human-review' | 'assessment' | 'sources';

function mapStage(value: string | null): WorkflowStage {
  if (value === 'blocked') return 'packet';
  if (value === 'human-review') return 'escalation';
  if (value === 'sources') return 'retrieve';
  if (value === 'assessment') return 'assess';
  if (value === 'clarify') return 'clarify';
  if (value === 'verify') return 'verify';
  if (value === 'plan') return 'plan';
  if (value === 'packet') return 'packet';
  if (value === 'audit') return 'audit';
  return 'intake';
}

function nextStage(stage: WorkflowStage) {
  const flow: WorkflowStage[] = ['intake', 'clarify', 'verify', 'assess', 'plan', 'packet', 'audit'];
  const index = flow.indexOf(stage);
  return flow[Math.min(index + 1, flow.length - 1)];
}

/** Main journey steps for Goal Gradient rail (excludes failure / human-review). */
const JOURNEY_STEPS: WorkflowStage[] = ['intake', 'clarify', 'verify', 'assess', 'plan', 'packet'];

const STAGE_STEP_LABEL: Partial<Record<WorkflowStage, string>> = {
  intake: 'Describe the issue',
  clarify: 'Answer one question',
  verify: 'Confirming facts',
  assess: 'Review assessment',
  plan: 'Action plan',
  packet: 'Review demand notice',
  audit: 'Audit trail',
  escalation: 'Human review',
  failure: 'Safe recovery',
};

function journeyProgress(stage: WorkflowStage): { n: number; m: number; label: string } | null {
  const idx = JOURNEY_STEPS.indexOf(stage);
  if (idx < 0) return null;
  return {
    n: idx + 1,
    m: JOURNEY_STEPS.length,
    label: STAGE_STEP_LABEL[stage] ?? stage,
  };
}

/**
 * Stage transition — direction-aware, with a real exit.
 *
 * The stage content was a keyed <div> with a CSS enter-animation. Because
 * the key forces a remount, React destroyed the outgoing stage in the same
 * tick, so an exit animation was structurally impossible — and moving
 * backward played the identical entrance as moving forward, giving the user
 * no spatial cue about which way they had just travelled.
 *
 * AnimatePresence mode="wait" lets the old stage leave before the new one
 * enters, and JOURNEY_STEPS gives the ordering needed to flip the slide
 * sign. Non-journey stages (failure, escalation, audit) have no index, so
 * they cross-fade without direction rather than guessing one.
 *
 * Critically damped (bounce: 0) — this is a state change the product drove,
 * not a surface the user flung, so overshoot would be unearned.
 */
function StageTransition({
  stageKey,
  direction,
  children,
}: {
  stageKey: string;
  direction: number;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const offset = 16 * direction;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stageKey}
        aria-live="polite"
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: offset }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, x: -offset }}
        transition={
          reduce
            ? { duration: 0.15, ease: 'linear' }
            : { type: 'spring', bounce: 0, duration: 0.32 }
        }
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function primaryCtaLabel(stage: WorkflowStage, blocksNext: boolean, isVerifyStage: boolean): string {
  if (isVerifyStage) return 'Confirm these facts';
  if (blocksNext && stage === 'packet') return 'Approve the plan above';
  if (blocksNext) return 'Approve the plan above';
  switch (stage) {
    case 'intake': return 'Continue to clarify';
    case 'clarify': return 'Confirm these facts';
    case 'verify': return 'See the assessment';
    case 'assess': return 'See action plan';
    case 'plan': return 'Review demand notice';
    case 'packet': return 'Finish with next actions';
    case 'audit': return 'Done';
    default: return 'Continue';
  }
}

// ─── AI Disclaimer Banner — always visible, calm, not alarming ─────────────────────
// Decision: We want users to trust the AI but understand it can miss details.
// We show this always — not only in error states — so it’s educational, not alarming.
function AIDisclaimerBanner() {
  return (
    <div style={{
      margin: '0 0 14px',
      padding: '10px 14px',
      background: '#FFF8F0',
      border: '1px solid rgba(233,133,43,0.22)',
      borderRadius: LAYOUT.radius.panel,
    }}>
      <p style={{
        fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 600,
        color: C.amber, margin: '0 0 3px',
      }}>
        Check before you use this
      </p>
      <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.inkSoft, lineHeight: 1.5, margin: 0 }}>
        This is a prepared example, not legal advice. Check every fact and source note before using a draft.
      </p>
    </div>
  );
}

function HeaderBar({
  stageLabel,
  matterLabel = 'Consumer refund case',
  stepRail,
}: {
  stageLabel: string;
  matterLabel?: string;
  stepRail?: { n: number; m: number; label: string } | null;
}) {
  const navigate = useNavigate();
  return (
    <div style={{
      padding: '12px 20px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderBottom: `1px solid ${C.border}`,
      background: 'rgba(255,255,255,0.74)',
    }}>
      <button
        aria-label="Back to mobile home"
        onClick={() => navigate('/mobile/home')}
        style={{
          width: 40,
          height: 40,
          borderRadius: LAYOUT.radius.panel,
          border: `1px solid ${C.border}`,
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <ArrowLeft size={17} color={C.inkSoft} />
      </button>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>
          {matterLabel}
        </p>
        <p style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 700, color: C.ink, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {stageLabel}
        </p>
        {stepRail && (
          <p style={{
            fontFamily: SANS,
            fontSize: TYPE.micro.size,
            fontWeight: 600,
            color: C.navy,
            margin: '4px 0 0',
            letterSpacing: '0.01em',
          }}>
            Step {stepRail.n} of {stepRail.m} · {stepRail.label}
          </p>
        )}
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      className="mobile-case-button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      style={{
        width: '100%',
        minHeight: 48,
        borderRadius: LAYOUT.radius.panel,
        border: 'none',
        background: disabled ? C.border : C.navy,
        color: disabled ? C.muted : '#FFFFFF',
        fontFamily: SANS,
        fontSize: TYPE.body.size,
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {children}
      <ArrowRight size={16} />
    </button>
  );
}

type IntakeModality = 'text' | 'voice' | 'notice';

function IntakeView({ onNext }: { onNext: () => void }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<IntakeModality | null>(null);
  const voice = useVoiceCapture({ initialPhase: 'idle' });

  const tiles: { id: IntakeModality; label: string; Icon: typeof FileText }[] = [
    { id: 'text', label: 'Prepared text', Icon: FileText },
    { id: 'voice', label: 'Sample voice', Icon: Mic },
    { id: 'notice', label: 'Sample notice', Icon: Camera },
  ];

  /*
   * Voice expands here instead of navigating to /mobile/voice.
   *
   * Voice used to be a *place you went*: picking the tile left the case
   * screen entirely. That framing is why the mic never felt like an input
   * mode. The same shared useVoiceCapture state machine now runs inline, so
   * speaking is a way of answering this question rather than a detour — and
   * the transcript-confirm step still gates what becomes the matter input,
   * which is the part that must not be lost.
   */
  const handleSelect = (id: IntakeModality) => {
    setSelected(id);
    if (id === 'voice') {
      voice.startSample();
      return;
    }
    voice.reset();
    if (id === 'notice') {
      navigate('/mobile/case/consumer?stage=packet&notice=offer');
    }
  };

  const voiceActive = selected === 'voice' && voice.phase !== 'idle';
  const canContinue = selected === 'text' || (selected === 'voice' && voice.phase === 'confirm');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: LAYOUT.radius.plane,
        padding: 18,
        boxShadow: SHADOW.sm,
      }}>
        <p style={{ fontFamily: SERIF, fontSize: TYPE.editorial.size, lineHeight: 1.08, color: C.ink, margin: '0 0 10px' }}>
          Start with what happened.
        </p>
        <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 16px' }}>
          LokAI will keep this focused on a defective product refund path and ask only for missing facts.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {tiles.map(({ id, label, Icon }) => {
            const isSelected = selected === id;
            return (
              <button
                key={id}
                type="button"
                className="mobile-case-chip"
                aria-pressed={isSelected}
                onClick={() => handleSelect(id)}
                style={{
                  minHeight: 64,
                  borderRadius: LAYOUT.radius.panel,
                  border: `1.5px solid ${isSelected ? C.navy : C.border}`,
                  background: isSelected ? '#EEF2F8' : '#F8F5EE',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Icon size={17} color={C.navy} />
                <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.ink }}>{label}</span>
              </button>
            );
          })}
        </div>
        <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, lineHeight: 1.5, margin: '0 0 10px' }}>
          Pick one prepared input to continue — no microphone, file, or network access is requested.
        </p>

        {voiceActive ? (
          <div style={{
            border: `1px solid ${C.border}`,
            borderRadius: LAYOUT.radius.panel,
            background: '#F8F5EE',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}>
            {(voice.phase === 'listening' || voice.phase === 'transcribing') && (
              <>
                <VoiceOrb size={64} state={voice.phase === 'listening' ? 'listening' : 'processing'} />
                <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, margin: 0, textAlign: 'center' }}>
                  {voice.phase === 'listening'
                    ? 'Playing the prepared voice example…'
                    : 'Turning it into text…'}
                </p>
                <button
                  type="button"
                  onClick={voice.skipToConfirm}
                  style={{
                    minHeight: 36, padding: '0 14px', borderRadius: LAYOUT.radius.control,
                    border: `1px solid ${C.border}`, background: C.surface,
                    fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 600,
                    color: C.navy, cursor: 'pointer',
                  }}
                >
                  Skip
                </button>
              </>
            )}

            {voice.phase === 'confirm' && (
              <div style={{ width: '100%' }}>
                {/* The transcript is editable *before* it becomes the matter
                    input — the verification gate applied to speech. Losing
                    this would make voice just another way to be misheard. */}
                <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, margin: '0 0 6px' }}>
                  Check this is what you meant, then continue.
                </p>
                <textarea
                  value={voice.transcript}
                  onChange={(e) => voice.setTranscript(e.target.value)}
                  rows={3}
                  aria-label="Voice transcript"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    borderRadius: LAYOUT.radius.panel,
                    border: `1px solid ${C.border}`, padding: 10,
                    fontFamily: SANS, fontSize: TYPE.body.size, lineHeight: 1.5,
                    color: C.ink, background: C.surface, resize: 'vertical',
                  }}
                />
              </div>
            )}

            {voice.phase === 'unclear' && (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.ink, fontWeight: 600, margin: '0 0 4px' }}>
                  That sample was unclear
                </p>
                <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.5, margin: '0 0 10px' }}>
                  LokAI will not guess. Retry, or use the prepared text instead.
                </p>
                <button
                  type="button"
                  onClick={voice.startSample}
                  style={{
                    minHeight: 36, padding: '0 14px', borderRadius: LAYOUT.radius.control,
                    border: `1px solid ${C.border}`, background: C.surface,
                    fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 600,
                    color: C.navy, cursor: 'pointer',
                  }}
                >
                  Retry sample
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            minHeight: 86,
            border: `1px solid ${C.border}`,
            borderRadius: LAYOUT.radius.panel,
            background: '#F8F5EE',
            padding: 12,
            fontFamily: SANS,
            fontSize: TYPE.body.size,
            color: C.ink,
            lineHeight: 1.5,
          }}>
            I bought a mixer grinder for ₹8,999. It arrived damaged and the seller refused a replacement.
          </div>
        )}
      </div>
      <PrimaryButton onClick={onNext} disabled={!canContinue}>
        {selected === 'voice' ? 'Confirm transcript' : 'Confirm prepared text'}
      </PrimaryButton>
    </div>
  );
}

function ClarifyView({ onNext }: { onNext: () => void }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.card,
      padding: 18,
      boxShadow: SHADOW.sm,
    }}>
      <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
        One detail needed
      </p>
      <h2 style={{ fontFamily: SERIF, fontSize: TYPE.editorial.size, fontWeight: 400, color: C.ink, lineHeight: 1.12, margin: '0 0 14px' }}>
        Have you already complained to the seller in writing?
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {['Yes, I have proof', 'No, only verbal complaint', 'Not sure'].map((label, index) => (
          <button
            key={label}
            onClick={onNext}
            style={{
              width: '100%',
              minHeight: 48,
              borderRadius: LAYOUT.radius.panel,
              border: `1px solid ${index === 1 ? C.navy : C.border}`,
              background: index === 1 ? '#EEF2F8' : '#FFFFFF',
              color: C.ink,
              fontFamily: SANS,
              fontSize: TYPE.body.size,
              fontWeight: 700,
              textAlign: 'left',
              padding: '0 14px',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const DEFAULT_ASSESSMENT_ZONES: [string, string][] = [
  ['What the rule means', 'The prepared source notes support asking for repair, replacement, or refund when a product arrives damaged.'],
  ['How it applies here', 'The invoice date, amount, damage photos, and seller refusal are present in this prepared example.'],
  ['What you can do next', 'Review a written complaint first. If the seller does not resolve it, check the filing route and source notes before using the draft.'],
];

function zonesFromTurn(turn: ResponseTurn | null): [string, string][] {
  if (!turn) return DEFAULT_ASSESSMENT_ZONES;
  const legacy = turnAsLokAIResponse(turn);
  const thirdText = legacy.zone3.steps.length > 0
    ? legacy.zone3.steps.join(' ')
    : legacy.zone3.cta;
  return [
    [legacy.zone1.label, legacy.zone1.finding],
    [legacy.zone2.label, legacy.zone2.analysis],
    [legacy.zone3.label, thirdText],
  ];
}

function AssessmentView({
  onOpenSources,
  activeTurn,
  isProgressing,
  progressLabel,
  progressIndex,
}: {
  onOpenSources: () => void;
  activeTurn: ResponseTurn | null;
  isProgressing: boolean;
  progressLabel: string | null;
  progressIndex: number;
}) {
  const zones = zonesFromTurn(activeTurn);

  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.turn,
      overflow: 'hidden',
      boxShadow: SHADOW.sm,
    }}>
      {isProgressing && progressLabel && (
        <div style={{ padding: '4px 8px 0', borderBottom: `1px solid ${C.border}`, background: C.surface2 }}>
          <TurnStatus
            label={progressLabel}
            stages={DEMO_PROGRESS_STAGES}
            activeIndex={Math.max(0, progressIndex)}
          />
        </div>
      )}
      {zones.map(([label, text], index) => (
        <div key={`${label}-${index}`} style={{ padding: '15px 16px', borderTop: index ? `1px solid ${C.border}` : 'none', background: index ? C.surface2 : '#FFFFFF' }}>
          <p style={{ fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            {label}
          </p>
          <p style={{
            fontFamily: index === 0 ? SERIF : SANS,
            fontSize: index === 0 ? TYPE.h3.size : TYPE.body.size,
            color: C.inkSoft,
            lineHeight: index === 0 ? 1.35 : 1.6,
            margin: 0,
          }}>
            {text}
          </p>
        </div>
      ))}
      <div style={{ padding: 14, borderTop: `1px solid ${C.border}`, background: '#FFFFFF' }}>
        <button
          type="button"
          className="lokai-pressable"
          onClick={onOpenSources}
          style={{
            width: '100%',
            minHeight: 44,
            borderRadius: LAYOUT.radius.panel,
            border: `1px solid ${C.navy}`,
            background: '#FFFFFF',
            color: C.navy,
            fontFamily: SANS,
            fontSize: TYPE.small.size,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          View source notes
        </button>
      </div>
    </div>
  );
}

// ─── Autonomy Dial — how much should LokAI do on this matter? ─────────────────
// A guardrail made visible: the user picks how far LokAI goes before the
// drafting stage, instead of the product deciding silently on their behalf.
type AutonomyLevel = 'guide' | 'prepare' | 'track';

const AUTONOMY_OPTIONS: { level: AutonomyLevel; label: string; hint: string; Icon: typeof Compass }[] = [
  { level: 'guide', label: 'Guide me', hint: "Explain only — LokAI won't draft anything.", Icon: Compass },
  { level: 'prepare', label: 'Prepare with me', hint: 'Review-gated drafts, same as today.', Icon: PenLine },
  { level: 'track', label: 'Keep me on track', hint: "Adds a reminder when the seller's response window ends.", Icon: BellRing },
];

function AutonomyDial({ value, onChange }: { value: AutonomyLevel; onChange: (level: AutonomyLevel) => void }) {
  const active = AUTONOMY_OPTIONS.find(o => o.level === value);
  return (
    <div style={{
      background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: LAYOUT.radius.turn,
      padding: 14, boxShadow: SHADOW.xs, display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
        How much should LokAI do?
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {AUTONOMY_OPTIONS.map(({ level, label, Icon }) => {
          const isActive = value === level;
          return (
            <button
              key={level}
              onClick={() => onChange(level)}
              aria-pressed={isActive}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                padding: '10px 6px', borderRadius: LAYOUT.radius.panel,
                border: `1.5px solid ${isActive ? C.navy : C.border}`,
                background: isActive ? '#EEF2F8' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} color={isActive ? C.navy : C.muted} />
              <span style={{
                fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: isActive ? 700 : 500,
                color: isActive ? C.navy : C.inkSoft, textAlign: 'center', lineHeight: 1.25,
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {active && (
        <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.5, margin: 0 }}>
          {active.hint}
        </p>
      )}
    </div>
  );
}

// ─── Intent Preview — the plan, before LokAI acts on it ────────────────────────
function IntentPreviewCard({ packet, onApprove, onBack }: { packet: FilingPacket; onApprove: () => void; onBack: () => void }) {
  const basis = packet.fields.find(f => f.id === 'basis')?.value;
  return (
    <div style={{
      background: '#FFFFFF', border: `1.5px solid ${C.navy}`, borderRadius: LAYOUT.radius.card,
      padding: 18, boxShadow: SHADOW.sm, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
        Before LokAI prepares this
      </p>
      <p style={{ fontFamily: SERIF, fontSize: TYPE.editorialSm.size, lineHeight: 1.2, color: C.ink, margin: 0 }}>
        {packet.title}
      </p>
      <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {packet.fields.filter(f => f.id !== 'basis').slice(0, 4).map(f => (
          <li key={f.id} style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.5 }}>
            <strong style={{ color: C.ink }}>{f.label}:</strong> {f.value}
          </li>
        ))}
        <li style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.5 }}>
          {packet.evidenceChecklist.length} evidence items checked against what's already confirmed
        </li>
      </ul>
      {basis && (
        <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, margin: 0 }}>
          Legal basis: {basis}
        </p>
      )}
      <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.5, margin: 0 }}>
        You'll review and can edit every field before anything is finalized. Nothing sends automatically.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
        <button
          onClick={onBack}
          style={{
            minHeight: 44, borderRadius: LAYOUT.radius.panel, border: `1px solid ${C.border}`, background: '#FFFFFF',
            color: C.inkSoft, fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Not yet
        </button>
        <button
          onClick={onApprove}
          style={{
            minHeight: 44, borderRadius: LAYOUT.radius.panel, border: 'none', background: C.navy, color: '#FFFFFF',
            fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 800, cursor: 'pointer',
          }}
        >
          Prepare the draft
        </button>
      </div>
    </div>
  );
}

// ─── Guide-only mode — explains, never drafts ──────────────────────────────────
function GuideOnlyCard({ packet }: { packet: FilingPacket }) {
  return (
    <div style={{
      background: '#F8F5EE', border: `1px solid ${C.border}`, borderRadius: LAYOUT.radius.turn,
      padding: 16, display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
        Guide me mode
      </p>
      <p style={{ fontFamily: SANS, fontSize: TYPE.body.size, color: C.inkSoft, lineHeight: 1.6, margin: 0 }}>
        A {packet.title.toLowerCase()} for this matter would typically request repair, replacement,
        or refund and cite the sections LokAI found earlier. LokAI won't prepare or send anything in
        this mode — switch to "Prepare with me" when you're ready to draft it.
      </p>
    </div>
  );
}

// ─── Tracking banner — the one deadline-aware moment, layered on Prepare/Track ─
// Clickable once a reply exists, so the "Keep me on track" promise has a real
// destination instead of describing a feature that never arrives.
function TrackingBanner({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%',
        background: '#FFF8F0', border: '1px solid rgba(233,133,43,0.25)', borderLeft: `3px solid ${C.saffron}`,
        borderRadius: `${LAYOUT.radius.none} ${LAYOUT.radius.panel} ${LAYOUT.radius.panel} ${LAYOUT.radius.none}`, padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
      }}
    >
      <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.5 }}>
        LokAI will flag it here when the seller's response window ends. Tap to see how that looks.
      </span>
      <ArrowRight size={13} color={C.amber} style={{ flexShrink: 0 }} />
    </button>
  );
}

// ─── Unsupported matter — the scope boundary, pointed inward ──────────────────
// The prototype only builds the consumer-refund journey end to end. Rather than
// open a tenancy or RTI matter into the consumer stepper under someone else's
// title, this states the limit plainly and still shows what LokAI did capture.
const UNSUPPORTED_MATTERS: Record<string, { title: string; category: string; captured: string[] }> = {
  'hindi-deposit':  { title: 'हिंदी Deposit Notice',        category: 'Tenancy · Hindi',   captured: ['Matter classified as a tenancy deposit dispute', 'Maharashtra Rent Control Act identified as the primary source', 'Language preference set to Hindi'] },
  'marathi-notice': { title: 'मराठी Notice Reply',           category: 'Notice · Marathi',  captured: ['Matter classified as a notice reply', 'A 15-day response window was extracted', 'Language preference set to Marathi'] },
  'tamil-consumer': { title: 'Tamil Consumer Refund',        category: 'Consumer · Tamil',  captured: ['Matter classified as a consumer refund', 'Consumer Protection Act sections identified', 'Language preference set to Tamil'] },
  'rti':            { title: 'BMC RTI — Building Permit',    category: 'RTI · Municipal',   captured: ['Matter classified as an RTI delay', 'RTI Act Sections 7(1) and 19(1) identified', 'A first-appeal deadline was calculated'] },
  'deposit':        { title: 'Security Deposit — ₹40,000',   category: 'Tenancy · Mumbai',  captured: ['Matter classified as a deposit recovery', 'Maharashtra Rent Control Act identified as the primary source', 'A 30-day statutory window was extracted'] },
  'out-of-scope':   { title: 'Outside LokAI Scope',          category: 'Boundary',          captured: ['Question classified as non-legal', 'No legal source was retrieved', 'No draft was prepared'] },
};

function UnsupportedMatterCard({ matterId }: { matterId: string }) {
  const navigate = useNavigate();
  const matter = UNSUPPORTED_MATTERS[matterId];
  const title = matter?.title ?? 'This matter';
  const captured = matter?.captured ?? [];

  return (
    <div style={{
      background: '#FFFFFF', border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.navy}`,
      borderRadius: `${LAYOUT.radius.xs} ${LAYOUT.radius.turn} ${LAYOUT.radius.turn} ${LAYOUT.radius.turn}`, padding: 18, boxShadow: SHADOW.sm,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <span style={{
        alignSelf: 'flex-start', fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em', color: C.navy,
        background: '#EEF2F8', borderRadius: LAYOUT.radius.pill, padding: '3px 9px',
      }}>
        {matter?.category ?? 'Matter'}
      </span>
      <h2 style={{ fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400, color: C.ink, margin: 0, lineHeight: 1.22 }}>
        {title}
      </h2>
      <p style={{ fontFamily: SANS, fontSize: TYPE.body.size, color: C.inkSoft, lineHeight: 1.6, margin: 0 }}>
        Only the consumer-refund journey is built end to end in this prototype. LokAI classified
        this matter and found its sources, but the guided steps, verification, and drafting are
        not implemented for it — so it stops here instead of running you through the wrong flow.
      </p>
      {captured.length > 0 && (
        <div style={{ background: '#F8F5EE', border: `1px solid ${C.border}`, borderRadius: LAYOUT.radius.panel, padding: '11px 13px' }}>
          <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 7px' }}>
            What LokAI captured
          </p>
          <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {captured.map(item => (
              <li key={item} style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.5 }}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 2 }}>
        <button
          onClick={() => navigate('/mobile/home')}
          style={{
            minHeight: 44, borderRadius: LAYOUT.radius.panel, border: `1px solid ${C.border}`, background: '#FFFFFF',
            color: C.inkSoft, fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Back to home
        </button>
        <button
          onClick={() => navigate('/mobile/case/consumer?stage=intake')}
          style={{
            minHeight: 44, borderRadius: LAYOUT.radius.panel, border: 'none', background: C.navy, color: '#FFFFFF',
            fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 800, cursor: 'pointer',
          }}
        >
          Open the built journey
        </button>
      </div>
    </div>
  );
}

function CaseArtboard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { matterId } = useParams();
  // Only 'consumer' has a built journey. Anything else gets the honest
  // boundary instead of the consumer stepper wearing another matter's name.
  const isSupportedMatter = !matterId || matterId === 'consumer';
  const [sourceOpen, setSourceOpen] = useState(false);
  const { selectedLanguage } = useConversations();
  const {
    scenario,
    confirmFact,
    correctFact,
    setDraftApproved,
    draftApproved,
    draftAllowed,
    activeTurn,
    runScenario,
    isProgressing,
    progressLabel,
    progressIndex,
    addAuditEvent,
    selectScenario,
  } = useDemo();
  const isGuardrailScene = scenario.id !== 'consumer';
  const [sceneAcknowledged, setSceneAcknowledged] = useState(!isGuardrailScene);
  const failure = params.get('failure');
  const sceneParam = params.get('scene');
  const notice = params.get('notice') as NoticeAssessmentKind | null;
  const rawStage = params.get('stage');
  const stage = failure ? 'failure' : mapStage(rawStage);
  const showDemoControls = params.get('demo') === '1' || params.get('capture') === '1';

  useEffect(() => {
    if (sceneParam && sceneParam !== scenario.id) {
      selectScenario(sceneParam);
    }
  }, [sceneParam, scenario.id, selectScenario]);
  const workflow = useMemo(() => {
    const base = getConsumerWorkflowState(stage);
    if (!failure) return base;
    const failureState = getFailureState(failure);
    return {
      ...base,
      currentUserStep: failureState.nextAction,
      trust: {
        ...base.trust,
        ...getFailureTrustSignals(failure),
      },
    };
  }, [stage, failure]);
  const failureState = failure ? getFailureState(failure as FailureKind) : null;
  const isVerifyStage = stage === 'verify';
  const [autonomy, setAutonomy] = useState<AutonomyLevel>('prepare');
  // Deep-linkable: ?stage=packet&approved=1 lands straight on the reviewable
  // draft. Without it, the intent-preview gate is real and can't be skipped —
  // see blocksNext below — but a link meant to show the finished packet
  // shouldn't have to describe clicking through a gate to get there.
  const [previewApproved, setPreviewApproved] = useState(() => params.get('approved') === '1');
  const [replyPrepared, setReplyPrepared] = useState(false);
  // In Guide-me mode there's nothing to approve — LokAI never drafts. Otherwise
  // the packet stage stays locked on "Next" until the intent preview is approved.
  // Shared matter store also blocks draft when the active scenario/turn disallows it.
  const blocksNext = isVerifyStage
    || (stage === 'packet' && autonomy !== 'guide' && (!previewApproved || !draftAllowed));

  /* Slide direction for the stage transition: +1 forward, -1 backward.
     Derived from JOURNEY_STEPS order by comparing against the previous
     stage, so going back through the journey visibly reverses instead of
     replaying the same entrance. Stages outside the journey (failure,
     escalation, audit) have no index and cross-fade with direction 0. */
  const previousStageRef = useRef<WorkflowStage>(stage);
  const stageDirection = useMemo(() => {
    const from = JOURNEY_STEPS.indexOf(previousStageRef.current);
    const to = JOURNEY_STEPS.indexOf(stage);
    if (from < 0 || to < 0 || from === to) return 0;
    return to > from ? 1 : -1;
  }, [stage]);
  useEffect(() => { previousStageRef.current = stage; }, [stage]);

  const goStage = (next: MobileStageParam) => {
    navigate(`/mobile/case/consumer?stage=${next}`);
  };

  const goFailure = (kind: FailureKind) => {
    navigate(`/mobile/case/consumer?failure=${kind}`);
  };

  const goNotice = (kind: NoticeAssessmentKind) => {
    navigate(`/mobile/case/consumer?stage=packet&notice=${kind}`);
  };

  useEffect(() => {
    setSceneAcknowledged(scenario.id === 'consumer');
  }, [scenario.id]);

  useEffect(() => {
    if (stage !== 'assess' || isProgressing) return;
    if (scenario.id !== 'consumer' && !activeTurn) {
      void runScenario();
      return;
    }
    if (scenario.id === 'consumer' && !activeTurn) {
      void runScenario('consumer');
    }
  }, [stage, scenario.id, activeTurn, isProgressing, runScenario]);

  return (
    <div style={{
      ...ARTBOARD,
      background: PLANE.reading,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <style>{CASE_CSS}</style>
      <StatusBar />
      <TopNav bg="transparent" onLanguageTap={() => navigate('/mobile/home')} langLabel={getLangLabel(selectedLanguage)} />
      <HeaderBar
        stageLabel={isSupportedMatter ? workflow.stageLabel : 'Not built in this prototype'}
        matterLabel={isSupportedMatter ? 'Consumer refund case' : (UNSUPPORTED_MATTERS[matterId ?? '']?.category ?? 'Matter')}
        stepRail={isSupportedMatter && !failure ? journeyProgress(stage) : null}
      />

      {/* Language continuity — prepared packs cover EN/HI/MR/TA for the consumer matter */}
      {selectedLanguage !== 'en' && (
        <div style={{
          margin: '10px 20px 0', padding: '8px 12px',
          background: '#EEF2F8', border: `1px solid ${C.border}`,
          borderRadius: LAYOUT.radius.control, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <ShieldCheck size={13} color={C.navy} />
          <span style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.inkSoft, lineHeight: 1.4 }}>
            Language set to {getLangLabel(selectedLanguage)}. Consumer answers use a prepared {getLangLabel(selectedLanguage)} pack — not live translation.
          </span>
        </div>
      )}

      <div className="mobile-case-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 104px' }}>
        <StageTransition
          stageKey={`${stage}-${failure ?? ''}`}
          direction={stageDirection}
        >
          {isGuardrailScene && !sceneAcknowledged ? (
            <>
              <GuardrailGallery compact />
              <div style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: LAYOUT.radius.panel,
                padding: 14,
                marginTop: 4,
              }}>
                <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700, color: C.navy, margin: '0 0 6px' }}>
                  {scenario.statusTitle}
                </p>
                <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.55, margin: '0 0 10px' }}>
                  {scenario.statusBody}
                </p>
                <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, margin: 0 }}>
                  Policy: {scenario.policyTier.replace(/_/g, ' ')}. Drafting{' '}
                  {scenario.policyTier === 'self_service' ? 'is available after review.' : 'stays locked in this scene.'}
                </p>
                <ul style={{ margin: '10px 0 0', padding: '0 0 0 16px' }}>
                  {scenario.allowedActions.map((a) => (
                    <li key={a} style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, marginBottom: 4 }}>{a}</li>
                  ))}
                </ul>
              </div>
              <PrimaryButton onClick={() => {
                setSceneAcknowledged(true);
                navigate('/mobile/case/consumer?stage=intake');
              }}>
                Continue with this scene’s constraints
              </PrimaryButton>
            </>
          ) : !isSupportedMatter ? (
            <UnsupportedMatterCard matterId={matterId ?? ''} />
          ) : (
            <>
          {isGuardrailScene && (
            <div style={{
              background: '#EEF2F8',
              border: `1px solid ${C.border}`,
              borderRadius: LAYOUT.radius.panel,
              padding: 12,
            }}>
              <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>
                {scenario.label}
              </p>
              <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.inkSoft, lineHeight: 1.5, margin: 0 }}>
                {scenario.statusTitle}
              </p>
            </div>
          )}
          <div style={{
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: LAYOUT.radius.turn,
            padding: 14,
            boxShadow: SHADOW.xs,
          }}>
            <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700, color: C.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 7px' }}>
              Current step
            </p>
            <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>
              {workflow.currentUserStep}
            </p>
          </div>

          {/* AI disclaimer — shown always, calm and informational */}
          <AIDisclaimerBanner />

          {['assess', 'plan', 'packet'].includes(stage) && (
            <div style={{
              background: '#FFF9F1',
              border: `1px solid ${C.border}`,
              borderRadius: LAYOUT.radius.panel,
              padding: 14,
            }}>
              <p style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.inkSoft, lineHeight: 1.65, margin: 0 }}>
                A <LegalText>deficiency</LegalText> can include a product that arrives damaged or does not work as promised.
                Tap the highlighted term for a simple meaning.
              </p>
            </div>
          )}

          {stage === 'failure' && failureState && <FailureStateCard failure={failureState} />}

          {notice && (
            <>
              <NoticeAssessmentCard
                assessment={getNoticeAssessment(notice)}
                onPrepareReply={notice === 'offer' ? () => setReplyPrepared(true) : undefined}
              />
              {notice === 'offer' && replyPrepared && (
                <ReviewGate
                  draftText={[
                    'LokAI — Reply to seller\'s partial offer (review before sending)',
                    '',
                    'Subject: Re: Damaged mixer grinder — full refund still requested',
                    '',
                    'Thank you for your response. I do not accept the 50% partial refund, as the',
                    'mixer arrived damaged and I raised the issue promptly.',
                    '',
                    'I am requesting the full refund of ₹8,999 within 7 days. If this is not',
                    'resolved, I will file a formal complaint with the District Consumer Commission.',
                    '',
                    'Applicable law: Consumer Protection Act, 2019 — Sections 2(10), 2(11), 35.',
                    '',
                    '— Prepared with LokAI. Please review every detail before sending.',
                  ].join('\n')}
                  onPrint={() => window.print()}
                />
              )}
            </>
          )}

          {!notice && (
            <>
              {stage === 'intake'     && <IntakeView onNext={() => goStage('clarify')} />}
              {stage === 'clarify'    && <ClarifyView onNext={() => goStage('verify')} />}
              {stage === 'verify'     && (
                <>
                  <EvidenceLocker items={getEvidenceLocker()} />
                  <VerificationScratchpad
                    facts={getVerificationFacts()}
                    onFactConfirm={(id) => confirmFact(id)}
                    onFactCorrect={(id, value) => correctFact(id, value)}
                    onConfirmed={() => {
                      setDraftApproved(true);
                      goStage('assessment');
                    }}
                  />
                </>
              )}
              {stage === 'retrieve'   && (
                <>
                  <LokAIProgressList items={workflow.progressEvents} />
                  {workflow.sources.map(source => <SourceCard key={source.id} source={source} compact />)}
                </>
              )}
              {stage === 'assess'     && (
                <>
                  <AssessmentView
                    onOpenSources={() => setSourceOpen(true)}
                    activeTurn={activeTurn}
                    isProgressing={isProgressing}
                    progressLabel={progressLabel}
                    progressIndex={progressIndex}
                  />
                  <WorkflowTrustPanel workflow={workflow} onOpenSources={() => setSourceOpen(true)} />
                </>
              )}
              {stage === 'plan'       && (
                <WorkflowActionPlan steps={workflow.actionPlan} interactive onPacket={() => goStage('packet')} />
              )}
              {stage === 'packet'     && (
                <>
                  <AutonomyDial value={autonomy} onChange={setAutonomy} />
                  {autonomy === 'guide' ? (
                    <GuideOnlyCard packet={workflow.filingPacket} />
                  ) : !previewApproved ? (
                    <IntentPreviewCard
                      packet={workflow.filingPacket}
                      onApprove={() => setPreviewApproved(true)}
                      onBack={() => goStage('plan')}
                    />
                  ) : (
                    <>
                      <WorkflowActionPlan steps={workflow.actionPlan} onPacket={() => goStage('packet')} />
                      <FilingPacketPreview packet={workflow.filingPacket} />
                      {/* No-direct-send review gate — the visible human-in-the-loop checkpoint */}
                      <ReviewGate
                        draftText={[
                          'LokAI — Consumer demand notice draft (review before sending)',
                          '',
                          'Subject: Damaged mixer grinder — request for replacement or refund',
                          '',
                          'I purchased a mixer grinder from HomeKart. It arrived with a cracked jar',
                          'and is unsafe to run. I asked the',
                          'seller for a repair, replacement, or refund and the request was refused.',
                          '',
                          'Applicable law: Consumer Protection Act, 2019 — Sections 2(10), 2(11), 35.',
                          '',
                          'I am keeping the invoice, defect photos, warranty, and seller messages as',
                          'evidence and request a resolution within a reasonable period.',
                          '',
                          '— Prepared with LokAI. Please review every detail before sending.',
                        ].join('\n')}
                        onPrint={() => window.print()}
                        approved={draftApproved}
                        onApprove={setDraftApproved}
                      />
                      <FirstActionChecklist
                        compact
                        onComplete={() => addAuditEvent('Exit checklist completed — user owns next actions outside LokAI')}
                      />
                      {autonomy === 'track' && <TrackingBanner onClick={() => goNotice('offer')} />}
                    </>
                  )}
                </>
              )}
              {stage === 'audit'      && <AuditTrailList events={workflow.auditTrail} />}
              {stage === 'escalation' && <HumanReviewCard workflow={workflow} />}
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              onClick={() => goStage(nextStage(stage))}
              disabled={blocksNext}
              aria-disabled={blocksNext}
              style={{
                minHeight: 44,
                borderRadius: LAYOUT.radius.panel,
                border: 'none',
                background: blocksNext ? C.border : C.navy,
                color: blocksNext ? C.muted : '#FFFFFF',
                fontFamily: SANS,
                fontSize: TYPE.caption.size,
                fontWeight: 800,
                cursor: blocksNext ? 'not-allowed' : 'pointer',
              }}
            >
              {primaryCtaLabel(stage, blocksNext, isVerifyStage)}
            </button>
            <button
              onClick={() => goStage('human-review')}
              style={{
                minHeight: 44,
                borderRadius: LAYOUT.radius.panel,
                border: `1px solid ${C.border}`,
                background: '#FFFFFF',
                color: C.inkSoft,
                fontFamily: SANS,
                fontSize: TYPE.caption.size,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <ShieldCheck size={14} />
              Review
            </button>
          </div>

          {showDemoControls && (
            <div
              aria-label="Failure state demo controls"
              style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}
            >
            {(['source_gap', 'ocr_unreadable', 'language_uncertain', 'model_timeout', 'out_of_scope', 'high_risk'] as FailureKind[]).map(kind => (
              <button
                key={kind}
                onClick={() => goFailure(kind)}
                style={{
                  minHeight: 32,
                  borderRadius: LAYOUT.radius.pill,
                  border: `1px solid ${C.border}`,
                  background: '#FFFFFF',
                  color: C.muted,
                  fontFamily: SANS,
                  fontSize: TYPE.label.size,
                  fontWeight: 700,
                  padding: '0 9px',
                  cursor: 'pointer',
                }}
              >
                {kind.replace(/_/g, ' ')}
              </button>
            ))}
            </div>
          )}

          {showDemoControls && (
            <div
              aria-label="Notice assessment demo controls"
              style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}
            >
            {([
              ['offer', 'seller reply: offer'],
              ['scam_signals', 'seller reply: scam signals'],
            ] as [NoticeAssessmentKind, string][]).map(([kind, label]) => (
              <button
                key={kind}
                onClick={() => goNotice(kind)}
                style={{
                  minHeight: 32,
                  borderRadius: LAYOUT.radius.pill,
                  border: `1px solid ${C.saffron}`,
                  background: '#FFFFFF',
                  color: C.amber,
                  fontFamily: SANS,
                  fontSize: TYPE.label.size,
                  fontWeight: 700,
                  padding: '0 9px',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
            </div>
          )}
            </>
          )}
        </StageTransition>
      </div>

      <BottomNav active="chat" />
      <HomeIndicator />

      <LokAISourceDrawer
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
        title="Source drawer"
        sources={workflow.sources}
        contain
      />
    </div>
  );
}

export default function MobileConsumerCase() {
  return (
    <MobileRouteCanvas>
      <CaseArtboard />
    </MobileRouteCanvas>
  );
}
