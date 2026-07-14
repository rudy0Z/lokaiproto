import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, FileText, Mic, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { C, SANS, SERIF, SHADOW } from '../../components/shared';
import { BottomNav, HomeIndicator, MobileRouteCanvas, StatusBar, TopNav, getLangLabel } from './MobileHome';
import { useConversations } from '../../context/ConversationContext';
import {
  AuditTrailList,
  FailureStateCard,
  FilingPacketPreview,
  HumanReviewCard,
  LokAIProgressList,
  LokAISourceDrawer,
  ReviewGate,
  SourceCard,
  VerificationScratchpad,
  WorkflowActionPlan,
  WorkflowTrustPanel,
} from '../../components/LokAIWorkflow';
import {
  getConsumerWorkflowState,
  getFailureState,
  getFailureTrustSignals,
  getVerificationFacts,
  type FailureKind,
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

function CaseArtboard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [sourceOpen, setSourceOpen] = useState(false);
  const { selectedLanguage } = useConversations();
  const failure = params.get('failure');
  const rawStage = params.get('stage');
  const stage = failure ? 'failure' : mapStage(rawStage);
  const showDemoFailures = params.get('demo') === '1' || params.get('capture') === '1';
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

  const goStage = (next: MobileStageParam) => {
    navigate(`/mobile/case/consumer?stage=${next}`);
  };

  const goFailure = (kind: FailureKind) => {
    navigate(`/mobile/case/consumer?failure=${kind}`);
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
          {stage === 'intake'     && <IntakeView onNext={() => goStage('clarify')} />}
          {stage === 'clarify'    && <ClarifyView onNext={() => goStage('verify')} />}
          {stage === 'verify'     && (
            <VerificationScratchpad
              facts={getVerificationFacts()}
              onConfirmed={() => goStage('assessment')}
            />
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
            </>
          )}
          {stage === 'audit'      && <AuditTrailList events={workflow.auditTrail} />}
          {stage === 'escalation' && <HumanReviewCard workflow={workflow} />}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              onClick={() => goStage(nextStage(stage))}
              disabled={isVerifyStage}
              aria-disabled={isVerifyStage}
              style={{
                minHeight: 44,
                borderRadius: 12,
                border: 'none',
                background: isVerifyStage ? C.border : C.navy,
                color: isVerifyStage ? C.muted : '#FFFFFF',
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 800,
                cursor: isVerifyStage ? 'not-allowed' : 'pointer',
              }}
            >
              {isVerifyStage ? 'Confirm facts above' : 'Next'}
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

          {showDemoFailures && (
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
