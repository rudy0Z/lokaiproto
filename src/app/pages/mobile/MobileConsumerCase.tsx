import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BellRing, Camera, Compass, FileText, Mic, PenLine, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { C, SANS, SERIF, SHADOW } from '../../components/shared';
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

const CASE_CSS = `
  .mobile-case-scroll::-webkit-scrollbar { width: 0; height: 0; }
  .mobile-case-chip:focus-visible,
  .mobile-case-button:focus-visible {
    outline: 2px solid ${C.saffron};
    outline-offset: 2px;
  }
  @keyframes caseCardIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .case-card-enter {
    animation: caseCardIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
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
      borderLeft: `3px solid ${C.saffron}`,
      borderRadius: '0 10px 10px 0',
    }}>
      <p style={{
        fontFamily: SANS, fontSize: 11, fontWeight: 600,
        color: C.amber, margin: '0 0 3px',
      }}>
        AI — verify before acting
      </p>
      <p style={{ fontFamily: SANS, fontSize: 11, color: C.inkSoft, lineHeight: 1.5, margin: 0 }}>
        LokAI identifies likely next steps from facts you share. Always confirm with an original document or lawyer before filing.
      </p>
    </div>
  );
}

function HeaderBar({ stageLabel }: { stageLabel: string }) {
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
          borderRadius: 12,
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
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>
          Consumer refund case
        </p>
        <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.ink, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {stageLabel}
        </p>
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className="mobile-case-button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 48,
        borderRadius: 14,
        border: 'none',
        background: C.navy,
        color: '#FFFFFF',
        fontFamily: SANS,
        fontSize: 14,
        fontWeight: 800,
        cursor: 'pointer',
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

function IntakeView({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: 22,
        padding: 18,
        boxShadow: SHADOW.sm,
      }}>
        <p style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 1.08, color: C.ink, margin: '0 0 10px' }}>
          Start with what happened.
        </p>
        <p style={{ fontFamily: SANS, fontSize: 13, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 16px' }}>
          LokAI will keep this focused on a defective product refund path and ask only for missing facts.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Type', Icon: FileText },
            { label: 'Speak', Icon: Mic },
            { label: 'Upload', Icon: Camera },
          ].map(({ label, Icon }) => {
            return (
              <button
                key={label}
                aria-label={`${label} your issue`}
                style={{
                  minHeight: 64,
                  borderRadius: 14,
                  border: `1px solid ${C.border}`,
                  background: '#F8F5EE',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Icon size={17} color={C.navy} />
                <span style={{ fontFamily: SANS, fontSize: 12, color: C.ink }}>{label}</span>
              </button>
            );
          })}
        </div>
        <div style={{
          minHeight: 86,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          background: '#F8F5EE',
          padding: 12,
          fontFamily: SANS,
          fontSize: 14,
          color: C.ink,
          lineHeight: 1.5,
        }}>
          I bought a mobile phone that is defective. The seller is refusing replacement or refund.
        </div>
      </div>
      <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
    </div>
  );
}

function ClarifyView({ onNext }: { onNext: () => void }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderRadius: 20,
      padding: 18,
      boxShadow: SHADOW.sm,
    }}>
      <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
        One detail needed
      </p>
      <h2 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 400, color: C.ink, lineHeight: 1.12, margin: '0 0 14px' }}>
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
              borderRadius: 14,
              border: `1px solid ${index === 1 ? C.navy : C.border}`,
              background: index === 1 ? '#EEF2F8' : '#FFFFFF',
              color: C.ink,
              fontFamily: SANS,
              fontSize: 14,
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

function AssessmentView({ onOpenSources }: { onOpenSources: () => void }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${C.border}`,
      borderLeft: `4px solid ${C.saffron}`,
      borderRadius: '4px 18px 18px 18px',
      overflow: 'hidden',
      boxShadow: SHADOW.sm,
    }}>
      {[
        ['The law', 'A seller cannot ignore a genuine defective product complaint. You can ask for repair, replacement, or refund.'],
        ['Your situation', 'The defect and seller refusal create a consumer complaint path. LokAI still needs the invoice date before the notice packet is complete.'],
        ['Next step', 'Send a written demand notice first. If ignored, prepare the formal court complaint packet.'],
      ].map(([label, text], index) => (
        <div key={label} style={{ padding: '15px 16px', borderTop: index ? `1px solid ${C.border}` : 'none', background: index ? '#FAF8F3' : '#FFFFFF' }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            {label}
          </p>
          <p style={{ fontFamily: index === 0 ? SERIF : SANS, fontSize: index === 0 ? 21 : 14, color: C.inkSoft, lineHeight: index === 0 ? 1.35 : 1.6, margin: 0 }}>
            {text}
          </p>
        </div>
      ))}
      <div style={{ padding: 14, borderTop: `1px solid ${C.border}`, background: '#FFFFFF' }}>
        <button
          onClick={onOpenSources}
          style={{
            width: '100%',
            minHeight: 44,
            borderRadius: 12,
            border: `1px solid ${C.navy}`,
            background: '#FFFFFF',
            color: C.navy,
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          View source drawer
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
      background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 18,
      padding: 14, boxShadow: SHADOW.xs, display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
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
                padding: '10px 6px', borderRadius: 12,
                border: `1.5px solid ${isActive ? C.navy : C.border}`,
                background: isActive ? '#EEF2F8' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} color={isActive ? C.navy : C.muted} />
              <span style={{
                fontFamily: SANS, fontSize: 10.5, fontWeight: isActive ? 700 : 500,
                color: isActive ? C.navy : C.inkSoft, textAlign: 'center', lineHeight: 1.25,
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {active && (
        <p style={{ fontFamily: SANS, fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5, margin: 0 }}>
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
      background: '#FFFFFF', border: `1.5px solid ${C.navy}`, borderRadius: 20,
      padding: 18, boxShadow: SHADOW.sm, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
        Before LokAI prepares this
      </p>
      <p style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.2, color: C.ink, margin: 0 }}>
        {packet.title}
      </p>
      <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {packet.fields.filter(f => f.id !== 'basis').slice(0, 4).map(f => (
          <li key={f.id} style={{ fontFamily: SANS, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
            <strong style={{ color: C.ink }}>{f.label}:</strong> {f.value}
          </li>
        ))}
        <li style={{ fontFamily: SANS, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
          {packet.evidenceChecklist.length} evidence items checked against what's already confirmed
        </li>
      </ul>
      {basis && (
        <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted, margin: 0 }}>
          Legal basis: {basis}
        </p>
      )}
      <p style={{ fontFamily: SANS, fontSize: 12, color: C.inkSoft, lineHeight: 1.5, margin: 0 }}>
        You'll review and can edit every field before anything is finalized. Nothing sends automatically.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
        <button
          onClick={onBack}
          style={{
            minHeight: 44, borderRadius: 12, border: `1px solid ${C.border}`, background: '#FFFFFF',
            color: C.inkSoft, fontFamily: SANS, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Not yet
        </button>
        <button
          onClick={onApprove}
          style={{
            minHeight: 44, borderRadius: 12, border: 'none', background: C.navy, color: '#FFFFFF',
            fontFamily: SANS, fontSize: 12, fontWeight: 800, cursor: 'pointer',
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
      background: '#F8F5EE', border: `1px solid ${C.border}`, borderRadius: 18,
      padding: 16, display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
        Guide me mode
      </p>
      <p style={{ fontFamily: SANS, fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6, margin: 0 }}>
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
        borderRadius: '0 12px 12px 0', padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
      }}
    >
      <span style={{ fontFamily: SANS, fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}>
        LokAI will flag it here when the seller's response window ends. Tap to see how that looks.
      </span>
      <ArrowRight size={13} color={C.amber} style={{ flexShrink: 0 }} />
    </button>
  );
}

function CaseArtboard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [sourceOpen, setSourceOpen] = useState(false);
  const { selectedLanguage } = useConversations();
  const failure = params.get('failure');
  const notice = params.get('notice') as NoticeAssessmentKind | null;
  const rawStage = params.get('stage');
  const stage = failure ? 'failure' : mapStage(rawStage);
  const showDemoControls = params.get('demo') === '1' || params.get('capture') === '1';
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
  // the packet stage stays locked on "Next" until the intent preview is approved,
  // the same way verify already locks on unconfirmed facts.
  const blocksNext = isVerifyStage || (stage === 'packet' && autonomy !== 'guide' && !previewApproved);

  const goStage = (next: MobileStageParam) => {
    navigate(`/mobile/case/consumer?stage=${next}`);
  };

  const goFailure = (kind: FailureKind) => {
    navigate(`/mobile/case/consumer?failure=${kind}`);
  };

  const goNotice = (kind: NoticeAssessmentKind) => {
    navigate(`/mobile/case/consumer?stage=packet&notice=${kind}`);
  };

  return (
    <div style={{
      ...ARTBOARD,
      background: [
        'radial-gradient(ellipse 105% 42% at 50% 0%, rgba(221,231,255,0.50), transparent 70%)',
        'linear-gradient(180deg, #FFFDFC 0%, #F8F5EE 100%)',
      ].join(', '),
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <style>{CASE_CSS}</style>
      <StatusBar />
      <TopNav bg="transparent" onLanguageTap={() => navigate('/mobile/home')} langLabel={getLangLabel(selectedLanguage)} />
      <HeaderBar stageLabel={workflow.stageLabel} />

      {/* Language continuity note — when a non-English language is chosen, be honest
          that the structured guidance is shown in English while full translation is a
          production step (Sarvam MT). Keeps the preference visible without faking it. */}
      {selectedLanguage !== 'en' && (
        <div style={{
          margin: '10px 20px 0', padding: '8px 12px',
          background: '#EEF2F8', border: `1px solid ${C.border}`,
          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <ShieldCheck size={13} color={C.navy} />
          <span style={{ fontFamily: SANS, fontSize: 11, color: C.inkSoft, lineHeight: 1.4 }}>
            Your language is set to {getLangLabel(selectedLanguage)}. Guidance is shown in English
            here; the read-aloud and chat reply use {getLangLabel(selectedLanguage)}.
          </span>
        </div>
      )}

      <div className="mobile-case-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 104px' }}>
        <div
          key={`${stage}-${failure ?? ''}`}
          className="case-card-enter"
          aria-live="polite"
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div style={{
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: 14,
            boxShadow: SHADOW.xs,
          }}>
            <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: C.navy, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 7px' }}>
              Current step
            </p>
            <p style={{ fontFamily: SANS, fontSize: 13, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>
              {workflow.currentUserStep}
            </p>
          </div>

          {/* AI disclaimer — shown always, calm and informational */}
          <AIDisclaimerBanner />

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
                    'Subject: Re: Defective mobile phone — full refund still requested',
                    '',
                    'Thank you for your response. I do not accept the 50% partial refund, as the',
                    'phone was defective at the time of purchase and I raised the issue promptly.',
                    '',
                    'I am requesting the full refund of ₹28,999 within 7 days. If this is not',
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
                  <AssessmentView onOpenSources={() => setSourceOpen(true)} />
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
                          'Subject: Defective mobile phone — request for repair, replacement, or refund',
                          '',
                          'I purchased a mobile phone from Metro Mobile Store. The phone became',
                          'defective within two days (overheating and shutting down). I asked the',
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
                borderRadius: 12,
                border: 'none',
                background: blocksNext ? C.border : C.navy,
                color: blocksNext ? C.muted : '#FFFFFF',
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 800,
                cursor: blocksNext ? 'not-allowed' : 'pointer',
              }}
            >
              {isVerifyStage ? 'Confirm facts above' : blocksNext ? 'Approve the plan above' : 'Next'}
            </button>
            <button
              onClick={() => goStage('human-review')}
              style={{
                minHeight: 44,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: '#FFFFFF',
                color: C.inkSoft,
                fontFamily: SANS,
                fontSize: 12,
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
                  borderRadius: 999,
                  border: `1px solid ${C.border}`,
                  background: '#FFFFFF',
                  color: C.muted,
                  fontFamily: SANS,
                  fontSize: 10,
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
                  borderRadius: 999,
                  border: `1px solid ${C.saffron}`,
                  background: '#FFFFFF',
                  color: C.amber,
                  fontFamily: SANS,
                  fontSize: 10,
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
        </div>
      </div>

      <BottomNav active="chat" />
      <HomeIndicator />

      <LokAISourceDrawer
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
        title="Source drawer"
        sources={workflow.sources}
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
