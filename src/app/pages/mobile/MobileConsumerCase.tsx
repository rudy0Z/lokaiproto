import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BellRinging, Camera, Compass, FileText, Microphone, PencilSimple, ShieldCheck } from '@phosphor-icons/react';
import { IconChevronRight } from '../../ui/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { C, LAYOUT, PLANE, S, SANS, SERIF, SHADOW, TYPE, VoiceOrb, typeStyle } from '../../components/shared';
import { Badge, Button, HairlineList, HairlineRow, ICON, ICON_STROKE, Label, Rule, Stack, StageTransition, Text, Textarea } from '../../ui';
import { VoiceFactChips } from '../../components/mobile/VoiceFactChips';
import { extractEntities } from '../../hooks/useVoiceCapture';
import { useVoiceCapture } from '../../hooks/useVoiceCapture';
import { HomeIndicator, MobileRouteCanvas, StatusBar, getLangLabel } from './MobileHome';
import { useConversations } from '../../context/ConversationContext';
import {
  AuditTrailList,
  EvidenceLocker,
  HumanReviewCard,
  LokAIProgressList,
  LokAISourceDrawer,
  NoticeAssessmentCard,
  ReviewGate,
  FirstActionChecklist,
  SourceCard,
  VerificationScratchpad,
  WorkflowActionPlan,
} from '../../components/LokAIWorkflow';
import {
  getConsumerWorkflowState,
  getEvidenceLocker,
  getFailureState,
  getFailureTrustSignals,
  getNoticeAssessment,
  getVerificationFacts,
  factToVerification,
  type FailureKind,
  type FilingPacket,
  type NoticeAssessmentKind,
  type WorkflowStage,
} from '../../data/caseWorkflow';
import { ARTBOARD } from '../../embed';
import { DemandNoticePaper } from '../../components/mobile/DemandNoticePaper';
import { MobileStopScreen } from '../../components/mobile/MobileStopScreen';
import { MobileTopBar } from '../../components/mobile/MobileTopBar';
import { MatterDrawer } from '../../components/mobile/MatterDrawer';
import { useDrawer } from '../../context/DrawerContext';
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

/* Legacy/friendlier URL spellings that predate the WorkflowStage names.
   Kept so existing deep links (the portfolio tour, the dev catalog, anything
   already shared) keep resolving. */
const STAGE_ALIASES: Record<string, WorkflowStage> = {
  blocked: 'packet',
  'human-review': 'escalation',
  sources: 'retrieve',
  assessment: 'assess',
};

/* Every real WorkflowStage passes through under its own name. This used to be
   a hand-written allowlist of `if`s and it had silently dropped 'assess' — so
   `?stage=assess` fell through to the default and rendered *intake* instead of
   the three-zone answer, which is the single most important screen in the app.
   The in-app Next button hid it (it's disabled on verify, and the verify → assess
   hand-off goes through the 'assessment' alias), so only deep links broke.
   Deriving the set from the union means a new stage can never be forgotten here. */
const STAGE_NAMES = new Set<string>([
  'intake', 'clarify', 'verify', 'triage', 'retrieve',
  'assess', 'plan', 'packet', 'escalation', 'failure', 'audit',
] satisfies WorkflowStage[]);

function mapStage(value: string | null): WorkflowStage {
  if (!value) return 'intake';
  if (value in STAGE_ALIASES) return STAGE_ALIASES[value];
  if (STAGE_NAMES.has(value)) return value as WorkflowStage;
  return 'intake';
}

function nextStage(stage: WorkflowStage) {
  const flow: WorkflowStage[] = ['intake', 'clarify', 'verify', 'assess', 'plan', 'packet', 'audit'];
  const index = flow.indexOf(stage);
  return flow[Math.min(index + 1, flow.length - 1)];
}

/** Main journey steps — the ordering that drives StageTransition's direction
 *  (forward slides right-to-left, backward the reverse). The step COUNTER is
 *  gone: the chat's working card is the journey's arc now, and "Step N of 6"
 *  was the wizard vocabulary inside a chat-first product (audit F3). */
const JOURNEY_STEPS: WorkflowStage[] = ['intake', 'clarify', 'verify', 'assess', 'plan', 'packet'];

/* StageTransition — the direction-aware stage crossfade — was promoted into
   the design system (src/app/ui/motion.tsx) so desktop and any future
   multi-step surface use the same recipe. */

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
  // A quiet line, not a tinted card — informational, never competing with the
  // stage's actual content for attention (§3.6/L3).
  return (
    <p style={{
      ...typeStyle('micro', {
        color: C.muted, margin: 0,
        letterSpacing: 'normal', textTransform: 'none',
        lineHeight: 1.5,
      }),
    }}>
      Prepared example, not legal advice — check every fact and source before using a draft.
    </p>
  );
}

function HeaderBar({
  stageLabel,
  matterLabel = 'Consumer refund case',
}: {
  stageLabel: string;
  matterLabel?: string;
}) {
  const navigate = useNavigate();
  return (
    <div style={{
      padding: '12px 20px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderBottom: `1px solid ${C.border}`,
      /* Translucent header background over the cream (light) / raised (dark)
         ground — drawn from the role layer so dark mode re-paints it. */
      background: 'color-mix(in srgb, var(--role-raised) 75%, transparent)',
    }}>
      <button
        aria-label="Back to mobile home"
        onClick={() => navigate('/mobile/home')}
        style={{
          width: 40,
          height: 40,
          borderRadius: LAYOUT.radius.panel,
          border: `1px solid ${C.border}`,
          background: 'var(--role-raised)',
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
        color: disabled ? C.muted : 'var(--role-on-anchor)',
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
  const intakeTranscriptRef = useRef<HTMLTextAreaElement>(null);

  const tiles: { id: IntakeModality; label: string; Icon: typeof FileText }[] = [
    { id: 'text', label: 'Prepared text', Icon: FileText },
    { id: 'voice', label: 'Sample voice', Icon: Microphone },
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
      /* The founding feature — reading a notice you can't understand — is its
         own in-chat surface (§3.8a), not the seller-reply assessment this tile
         used to open (?stage=packet&notice=offer, a different flow entirely). */
      navigate('/mobile/notice');
    }
  };

  const voiceActive = selected === 'voice' && voice.phase !== 'idle';
  const canContinue = selected === 'text' || (selected === 'voice' && voice.phase === 'confirm');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* De-carded (2026-08-27): content on the ground, no bordered outer box.
          The serif heading is the focal move; the tiles and prepared text sit
          directly on the page. */}
      <div>
        {/* `answer` size (22px), not `pronounce` (28px) — 28 is reserved for the
            refusal sentence and the home greeting. See ROLE_TYPE in ui/theme.ts. */}
        <p style={{ fontFamily: SERIF, fontSize: TYPE.editorialSm.size, lineHeight: 1.15, color: C.ink, margin: '0 0 10px' }}>
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
                  background: isSelected ? 'var(--role-anchor-tint)' : 'var(--role-ground)',
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
            background: 'var(--role-paper)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}>
            {(voice.phase === 'listening' || voice.phase === 'transcribing') && (
              <>
                <VoiceOrb size={64} state={voice.phase === 'listening' ? 'listening' : 'processing'} live />
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
                    this would make voice just another way to be misheard.
                    The chips are what the words contain; tapping one selects
                    its words below. */}
                <VoiceFactChips
                  entities={extractEntities(voice.transcript)}
                  onJump={(entity) => {
                    const el = intakeTranscriptRef.current;
                    if (!el) return;
                    const idx = el.value.toLowerCase().indexOf(entity.value.toLowerCase());
                    el.focus();
                    if (idx >= 0) el.setSelectionRange(idx, idx + entity.value.length);
                  }}
                />
                <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, margin: '10px 0 6px' }}>
                  Check this is what you meant, then continue.
                </p>
                <Textarea
                  ref={intakeTranscriptRef}
                  value={voice.transcript}
                  onChange={(e) => voice.setTranscript(e.target.value)}
                  rows={3}
                  aria-label="Voice transcript"
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
            background: 'var(--role-paper)',
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
  /* De-carded (2026-08-27): the question sits on the ground, the serif IS the
     focal move (L1/L4). One caps label, then the answer options as clean
     rounded controls — the selected one gets the anchor tint, no bordered
     outer card wrapping it all. */
  return (
    <Stack gap={4}>
      <Stack gap={2}>
        <Label>One detail needed</Label>
        <Text role="answer">Have you already complained to the seller in writing?</Text>
      </Stack>
      <Stack gap={2}>
        {/* Answer options as hairline rows — no fake pre-selection; the tap
           IS the answer. */}
        <HairlineList>
          {['Yes, I have proof', 'No, only verbal complaint', 'Not sure'].map((label) => (
            <HairlineRow
              key={label}
              onClick={onNext}
              trailing={<IconChevronRight size={ICON.inline} color="var(--role-ink-faint)" />}
            >
              <Text role="bodyStrong" measured={false}>{label}</Text>
            </HairlineRow>
          ))}
        </HairlineList>
      </Stack>
    </Stack>
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

  /*
   * L1/L3/L4, now built from the system rather than hand-composed.
   *
   * Two things changed on 2026-08-26 beyond the visual:
   *
   * 1. Zone 0 drops from `editorial` (28px) to the `answer` role (22px). At
   *    28px a two-sentence finding ate ~45% of a 390px fold and pushed the
   *    actionable guidance below it. 28px is now the `pronounce` role, reserved
   *    for the refusal sentence and the home greeting — the largest type in the
   *    app appears only when it stops, or when it greets you.
   *
   * 2. <Text> resolves the script. This block previously hardcoded SERIF and
   *    lineHeight 1.28 in every language, so the flagship screen rendered Hindi
   *    in a face with no Devanagari glyphs at Latin leading — the founding
   *    thesis failing on the one screen the case study leads with.
   */
  return (
    <Stack gap={4}>
      {isProgressing && progressLabel && (
        <TurnStatus
          label={progressLabel}
          stages={DEMO_PROGRESS_STAGES}
          activeIndex={Math.max(0, progressIndex)}
        />
      )}

      {zones.map(([label, text], index) =>
        index === 0 ? (
          /* The serif IS the label — no eyebrow above it (L4). */
          <Text key={`${label}-${index}`} role="answer">{text}</Text>
        ) : (
          <Stack key={`${label}-${index}`} gap={2}>
            <Rule />
            <Label>{label}</Label>
            <Text tone="quiet">{text}</Text>
          </Stack>
        ),
      )}

      {/* Grounding leaves as one tappable line, not a card or a spec table. */}
      <Button
        variant="quiet"
        size="sm"
        onClick={onOpenSources}
        iconAfter={<ArrowRight size={ICON.inline} strokeWidth={ICON_STROKE} />}
        style={{ alignSelf: 'flex-start' }}
      >
        View the source trail
      </Button>

      <Text role="meta" tone="faint" style={{ letterSpacing: 'normal', textTransform: 'none' }}>
        Prepared example, not legal advice — check every fact and source before using a draft.
      </Text>
    </Stack>
  );
}

/**
 * The case workspace — the hub the matter opens on (chat-first, 2026-08-28).
 *
 * The case used to LAND on the intake modality picker (three tiles + prefilled
 * text), which read as a form with no clear input. Now the problem is described
 * in the chat, so opening the matter shows where it stands and the tools you can
 * work on — verify, plan, notice, documents, audit — each as a door with its
 * live state, not a linear stepper you are marched through. The steps still
 * exist; they are reached from here or from the chat, on demand.
 */
function OverviewView({ onStage }: { onStage: (stage: MobileStageParam) => void }) {
  const navigate = useNavigate();
  const facts = getVerificationFacts();
  const needsReview = facts.filter((f) => f.status === 'needs_review').length;
  const docs = getEvidenceLocker();
  const gathered = docs.filter((d) => d.status === 'uploaded').length;
  const flagged = docs.filter((d) => d.status === 'conflicting').length;

  const tools: { label: string; note: string; flag?: boolean; onClick: () => void }[] = [
    { label: 'Verify the facts', note: needsReview > 0 ? `${needsReview} to confirm` : `${facts.length} confirmed`, flag: needsReview > 0, onClick: () => onStage('verify') },
    { label: 'Action plan', note: 'Your next steps, in order', onClick: () => onStage('plan') },
    { label: 'Demand notice', note: 'AI draft, ready to review', onClick: () => onStage('packet') },
    { label: 'Documents', note: `${gathered} gathered${flagged ? ` · ${flagged} to check` : ''}`, flag: flagged > 0, onClick: () => navigate('/mobile/files') },
    { label: 'What LokAI did', note: 'The full audit trail', onClick: () => onStage('audit') },
  ];

  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Label>Where your case stands</Label>
        <Text role="answer">
          You can ask the seller for a repair, replacement, or refund, and follow up with a demand notice if they refuse.
        </Text>
      </Stack>

      <HairlineList>
        {tools.map((t) => (
          <HairlineRow
            key={t.label}
            onClick={t.onClick}
            trailing={<IconChevronRight size={ICON.inline} color="var(--role-ink-faint)" />}
          >
            <Text role="bodyStrong" measured={false}>{t.label}</Text>
            <Text role="caption" tone={t.flag ? 'flag' : 'quiet'} measured={false}>{t.note}</Text>
          </HairlineRow>
        ))}
      </HairlineList>
    </Stack>
  );
}

// ─── Autonomy Dial — how much should LokAI do on this matter? ─────────────────
// A guardrail made visible: the user picks how far LokAI goes before the
// drafting stage, instead of the product deciding silently on their behalf.
export type AutonomyLevel = 'guide' | 'prepare' | 'track';

const AUTONOMY_OPTIONS: { level: AutonomyLevel; label: string; hint: string; Icon: typeof Compass }[] = [
  { level: 'guide', label: 'Guide me', hint: "Explain only — LokAI won't draft anything.", Icon: Compass },
  { level: 'prepare', label: 'Prepare with me', hint: 'Review-gated drafts, same as today.', Icon: PencilSimple },
  { level: 'track', label: 'Keep me on track', hint: "Adds a reminder when the seller's response window ends.", Icon: BellRinging },
];

/* Exported for the chat's tool sheets (chat-first, 2026-08-28): the packet
   flow renders inside a bottom sheet on the home surface with the same
   autonomy states it has here. These are pre-migration components — they
   move onto the primitives in the seam pass. */
export function AutonomyDial({ value, onChange }: { value: AutonomyLevel; onChange: (level: AutonomyLevel) => void }) {
  const active = AUTONOMY_OPTIONS.find(o => o.level === value);
  return (
    <div style={{
      background: 'var(--role-raised)', border: `1px solid ${C.border}`, borderRadius: LAYOUT.radius.turn,
      padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
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
                background: isActive ? 'var(--role-anchor-tint)' : 'var(--role-raised)',
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
export function IntentPreviewCard({ packet, onApprove, onBack }: { packet: FilingPacket; onApprove: () => void; onBack: () => void }) {
  const basis = packet.fields.find(f => f.id === 'basis')?.value;
  return (
    <div style={{
      background: 'var(--role-raised)', border: `1.5px solid ${C.navy}`, borderRadius: LAYOUT.radius.card,
      padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
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
      <Stack gap={2} style={{ marginTop: 4 }}>
        <Button onClick={onApprove} iconAfter={<IconChevronRight size={ICON.inline} color="var(--role-on-anchor)" />}>
          Prepare the draft
        </Button>
        <Button variant="quiet" onClick={onBack}>Not yet</Button>
      </Stack>
    </div>
  );
}

// ─── Guide-only mode — explains, never drafts ──────────────────────────────────
export function GuideOnlyCard({ packet }: { packet: FilingPacket }) {
  /* Ground-level (L1): an explanation is prose, not an object — the Rule is
     the separator, matching EvidenceLocker/Scratchpad. */
  return (
    <Stack gap={2}>
      <Rule />
      <Label>Guide me mode</Label>
      <Text role="body" measured={false}>
        A {packet.title.toLowerCase()} for this matter would typically request repair, replacement,
        or refund and cite the sections LokAI found earlier. LokAI won't prepare or send anything in
        this mode — switch to "Prepare with me" when you're ready to draft it.
      </Text>
    </Stack>
  );
}

// ─── Tracking banner — the one deadline-aware moment, layered on Prepare/Track ─
// Clickable once a reply exists, so the "Keep me on track" promise has a real
// destination instead of describing a feature that never arrives.
export function TrackingBanner({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%',
        background: 'var(--role-flag-fill)', border: '1px solid var(--role-flag)',
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
      background: 'var(--role-raised)', border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.turn, padding: 18,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <Badge tone="neutral">{matter?.category ?? 'Matter'}</Badge>
      <h2 style={{ fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400, color: C.ink, margin: 0, lineHeight: 1.22 }}>
        {title}
      </h2>
      <p style={{ fontFamily: SANS, fontSize: TYPE.body.size, color: C.inkSoft, lineHeight: 1.6, margin: 0 }}>
        Only the consumer-refund journey is built end to end in this prototype. LokAI classified
        this matter and found its sources, but the guided steps, verification, and drafting are
        not implemented for it — so it stops here instead of running you through the wrong flow.
      </p>
      {captured.length > 0 && (
        <div style={{ background: 'var(--role-paper)', border: `1px solid ${C.border}`, borderRadius: LAYOUT.radius.panel, padding: '11px 13px' }}>
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
      {/* One primary (the built journey) + the home escape quiet beneath —
         no side-by-side twins (L5). */}
      <Stack gap={2} style={{ marginTop: 2 }}>
        <Button onClick={() => navigate('/mobile/case/consumer?stage=intake')}>
          Open the built journey
        </Button>
        <Button variant="quiet" onClick={() => navigate('/mobile/home')}>
          Back to home
        </Button>
      </Stack>
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
  const { open: drawerOpen, closeDrawer } = useDrawer();
  const {
    scenario,
    facts,
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
  /* Chat-first: opening the matter with no stage (or the retired `intake`
     alias) lands on the workspace hub, not the old modality picker. */
  const isOverview = !failure && !notice && (!rawStage || rawStage === 'intake');
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

  /* A stop state is not a card inside the lit case chrome — it is the whole
     artboard going dark (L6/L8). Early-return the full-bleed stop screen before
     any of the normal StatusBar/TopNav/HeaderBar/cream-ground chrome renders,
     so nothing bright frames the refusal. */
  if (stage === 'failure' && failureState) {
    return (
      <MobileStopScreen
        failure={failureState}
        onBack={() => navigate('/mobile/case/consumer?stage=assess')}
        onSafeAction={() => goStage(
          failureState.riskLevel === 'human_required' ? 'human-review' : 'intake',
        )}
        /* Self-service failures let the user proceed; review-recommended and
           human-required do not offer a loud "continue anyway". */
        onContinue={failureState.riskLevel === 'self_service' ? () => goStage('intake') : undefined}
      />
    );
  }

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
      <MobileTopBar />
      <HeaderBar
        stageLabel={!isSupportedMatter ? 'Not built in this prototype' : isOverview ? 'Consumer refund case' : workflow.stageLabel}
        matterLabel={isSupportedMatter ? (isOverview ? 'Your matter' : 'Consumer refund case') : (UNSUPPORTED_MATTERS[matterId ?? '']?.category ?? 'Matter')}
      />

      {/* Language continuity — prepared packs cover EN/HI/MR/TA for the consumer matter */}
      {selectedLanguage !== 'en' && (
        <div style={{
          margin: '10px 20px 0', padding: '8px 12px',
          background: 'var(--role-anchor-tint)', border: `1px solid ${C.border}`,
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
          ) : isOverview ? (
            <>
              <OverviewView onStage={goStage} />
              {/* One primary (the answer) + one quiet escape — the tool rows above
                 are the rest of the actions, so the bottom does not fight them. */}
              <Stack gap={2}>
                <Button onClick={() => goStage('assessment')}>See the full assessment</Button>
                <Button variant="quiet" onClick={() => goStage('human-review')}>Talk to a person</Button>
              </Stack>
            </>
          ) : (
            <>
          {isGuardrailScene && (
            <div style={{
              background: 'var(--role-anchor-tint)',
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
          {/* L3: on the answer stage the answer leads. The "Current step" card
             restates what the answer's own "what you can do next" zone already
             says, and the glossary hint duplicates the inline LegalText terms —
             both are suppressed here so the answer isn't pushed below the fold.
             They still render on the earlier stages that have no answer yet. */}
          {stage === 'plan' && (
            <Stack gap={2}>
              <Rule />
              <Text role="caption" tone="quiet" measured={false}>
                A <LegalText>deficiency</LegalText> can include a product that arrives damaged or does not work as promised.
                Tap the highlighted term for a simple meaning.
              </Text>
            </Stack>
          )}

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
                    /* Live facts from DemoContext (mapped state→status), not the
                       static snapshot — so confirming a fact here settles it
                       everywhere that reads the matter's facts. */
                    facts={facts.map(factToVerification)}
                    onFactConfirm={(id) => confirmFact(id)}
                    onFactCorrect={(id, value) => correctFact(id, value)}
                    /* Confirming facts advances the stage and nothing else.
                       This used to also call setDraftApproved(true), which
                       pre-approved the draft before one existed and bypassed
                       ReviewGate — the component whose entire purpose is that
                       no draft leaves unread. Approval belongs to the gate. */
                    onConfirmed={() => goStage('assessment')}
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
                  {/* Trust detail (claim ledger + coverage) now lives inside the
                     source sheet, not inline — the assess screen keeps only the
                     one quiet 'source trail' line (§3.1). */}
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
                      {/* §Critique-3 de-box: the packet stage was ~9 stacked
                         containers (a repeated action plan, a bordered field
                         "preview", the gate, a checklist, a tracking banner, a
                         CTA grid) — the most authoritative step read as the
                         most anxious. Now: the notice AS PAPER is the one focal
                         object, the consent gate sits under it, and the exit
                         checklist appears only AFTER approval so nothing stacks
                         ahead of the decision. The action-plan repeat is gone
                         (it belongs to the plan stage). */}
                      <DemandNoticePaper packet={workflow.filingPacket} />
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
                      {/* Only after the gate is approved — the exit steps are a
                         reward for reviewing, not a pre-condition stacked above
                         the notice. */}
                      {draftApproved && (
                        <FirstActionChecklist
                          compact
                          onComplete={() => addAuditEvent('Exit checklist completed — user owns next actions outside LokAI')}
                        />
                      )}
                      {autonomy === 'track' && draftApproved && <TrackingBanner onClick={() => goNotice('offer')} />}
                    </>
                  )}
                </>
              )}
              {stage === 'audit'      && <AuditTrailList events={workflow.auditTrail} />}
              {stage === 'escalation' && <HumanReviewCard workflow={workflow} />}
            </>
          )}

          {/* Disclaimer as one quiet line directly above the CTA (L3, answer-first):
             it no longer sits at the top pushing each stage's content below the fold.
             assess and packet carry their own; failure is the dark stop state. */}
          {!['assess', 'failure', 'packet'].includes(stage) && <AIDisclaimerBanner />}

          {/* The forward/Review CTA row is suppressed on a stop state — a refusal
             must not put a navy "Continue" under "don't rely on AI here" (L6).
             The StopState carries its own safe-action CTA instead. */}
          {stage !== 'failure' && (
            /* One primary CTA; the human-review escape is a quiet text link,
               not an outlined twin (the double-button was the generic tell).
               System Button, so it inherits the app's shape and press. */
            <Stack gap={2}>
              <Button onClick={() => goStage(nextStage(stage))} disabled={blocksNext}>
                {primaryCtaLabel(stage, blocksNext, isVerifyStage)}
              </Button>
              <Button variant="quiet" onClick={() => goStage('human-review')}>
                Ask for human review
              </Button>
            </Stack>
          )}

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
                  background: 'var(--role-raised)',
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
                  background: 'var(--role-raised)',
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

      <HomeIndicator />

      <MatterDrawer open={drawerOpen} onClose={closeDrawer} />

      <LokAISourceDrawer
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
        title="Source trail"
        sources={workflow.sources}
        trust={workflow.trust}
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
