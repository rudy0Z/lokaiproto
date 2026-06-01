import React from 'react';
import { useNavigate } from 'react-router';
import { FileText, Download, Edit2, ArrowRight, Paperclip } from 'lucide-react';
import { SERIF, SANS, C, GRAD, SHADOW, CitationStamp } from '../components/shared';
import { useSidebar } from '../context/SidebarContext';

// ─── Scrollbar CSS ─────────────────────────────────────────────────────────────
const ANIM_STYLES = `
  .chatdoc-msgs::-webkit-scrollbar       { width: 4px; }
  .chatdoc-msgs::-webkit-scrollbar-track { background: transparent; }
  .chatdoc-msgs::-webkit-scrollbar-thumb { background: #E0DDD5; border-radius: 2px; }
  .chatdoc-msgs::-webkit-scrollbar-thumb:hover { background: ${C.saffron}; }

  .doc-body-scroll::-webkit-scrollbar       { width: 3px; }
  .doc-body-scroll::-webkit-scrollbar-track { background: transparent; }
  .doc-body-scroll::-webkit-scrollbar-thumb { background: #D4D0C8; border-radius: 2px; }
  .doc-body-scroll::-webkit-scrollbar-thumb:hover { background: ${C.saffron}; }

  .lokai-hdr-btn {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: ${SANS}; font-size: 12px; font-weight: 500;
    border-radius: 6px; padding: 5px 12px; cursor: pointer;
    transition: opacity 0.12s ease;
  }
  .lokai-hdr-btn:hover { opacity: 0.82; }

  .doc-open-btn:hover { opacity: 0.88; }
`;

const RIGHT_W = 340; // document panel width

// ─── EditField — saffron dashed underline on editable draft fields ────────────
function EditField({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      borderBottom: '1.5px dashed #E8832A',
      background: 'rgba(232,131,42,0.06)',
      padding: '0 3px',
      borderRadius: '2px',
      color: '#1A1916',
      cursor: 'text',
    }}>
      {children}
    </span>
  );
}

// ─── User Text Bubble ─────────────────────────────────────────────────────────
function UserTextBubble({ text, time }: { text: string; time: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
      <div style={{
        maxWidth: '72%',
        background: '#C4724A',
        borderRadius: '18px 18px 4px 18px',
        padding: '14px 18px',
      }}>
        <p style={{
          fontFamily: SANS, fontSize: '15px', color: '#FFFFFF',
          lineHeight: 1.55, margin: 0,
        }}>
          {text}
        </p>
        <div style={{ marginTop: '5px', textAlign: 'right' }}>
          <span style={{ fontFamily: SANS, fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── AI Label ─────────────────────────────────────────────────────────────────
function AILabel() {
  return (
    <div style={{
      fontFamily: SANS, fontSize: '11px', fontWeight: 500,
      color: C.muted, marginBottom: '6px', letterSpacing: '0.01em',
    }}>
      LokAI
    </div>
  );
}

// ─── Static AI Response Card ──────────────────────────────────────────────────
// All zones rendered immediately (document already generated — past tense state)
interface StaticZone {
  label: string;
  content: React.ReactNode;
  citation?: string;
  isAction?: boolean;
}

const _isLawLabel = (s: string): boolean => {
  const l = s.toUpperCase();
  return l.includes('LAW') || l.includes('कानून') || l.includes('कायदा') || l.includes('சட்டம்');
};

function StaticAICard({
  zones, time, actionButton,
}: {
  zones: StaticZone[];
  time: string;
  actionButton?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '14px', width: '100%' }}>
      <AILabel />
      <div style={{
        width: '100%',
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: '16px',
        boxShadow: SHADOW.md,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Saffron gradient left border */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: '5px',
          background: 'linear-gradient(180deg, #E8832A 0%, #C4620A 100%)',
          borderRadius: '16px 0 0 16px',
          zIndex: 2,
        }} />

        {zones.map((zone, i) => {
          const isLawZone = _isLawLabel(zone.label);
          const isLast    = i === zones.length - 1;
          const zoneBg    = isLawZone ? '#FFFFFF' : '#FAFAF8';

          return (
            <div key={i} style={{
              background: zoneBg,
              borderTop: i > 0 ? `1px solid ${C.border}` : 'none',
              padding: '20px 24px 20px 30px',
            }}>
              {/* Zone label */}
              <div style={{
                fontFamily: SANS, fontSize: '10px', fontWeight: 600,
                color: '#8A8880', textTransform: 'uppercase',
                letterSpacing: '0.12em', paddingBottom: '10px',
              }}>
                {zone.label}
              </div>

              {/* Zone 1 (LAW) — DM Serif, visual peak */}
              {isLawZone ? (
                <div>
                  <p style={{
                    fontFamily: SERIF, fontSize: '22px',
                    fontWeight: 400,
                    fontStyle:  'normal',
                    color: '#1A1916', lineHeight: 1.45, margin: 0,
                  }}>
                    {zone.content}
                    {zone.citation && (
                      <span style={{ marginLeft: '10px', display: 'inline-block', verticalAlign: 'middle' }}>
                        <CitationStamp text={zone.citation} />
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                /* Zone 2+ — Plus Jakarta Sans body copy */
                <div>
                  <p style={{
                    fontFamily: SANS, fontSize: '15px', color: '#4A4840',
                    lineHeight: 1.75, margin: 0,
                  }}>
                    {zone.content}
                    {zone.citation && (
                      <span style={{ marginLeft: '8px', display: 'inline' }}>
                        <CitationStamp text={zone.citation} />
                      </span>
                    )}
                  </p>
                  {isLast && actionButton && (
                    <div style={{ marginTop: '16px' }}>{actionButton}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Card footer */}
        <div style={{
          padding: '8px 20px 10px 30px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: `1px solid ${C.border}`,
          background: '#FFFFFF',
        }}>
          <span style={{ fontFamily: SANS, fontSize: '11px', color: '#8A8880' }}>{time}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Document Generated Confirmation Row ─────────────────────────────────────
function DocGeneratedRow() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 0 24px',
    }}>
      {/* Green dot */}
      <div style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: '#1F6B3A', flexShrink: 0,
      }} />
      <FileText style={{ width: '14px', height: '14px', color: '#8A8880', flexShrink: 0 }} />
      <span style={{ fontFamily: SANS, fontSize: '12px', color: '#8A8880' }}>
        Demand Notice Draft ready
      </span>
    </div>
  );
}

// ─── Document Panel Header ────────────────────────────────────────────────────
function DocPanelHeader({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      flexShrink: 0,
      padding: '10px 16px 12px',
      borderBottom: `1px solid ${C.border}`,
      background: '#FFFFFF',
    }}>
      {/* Row 1: back link + action buttons */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '9px',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: SANS, fontSize: '13px', color: C.muted,
            display: 'flex', alignItems: 'center', gap: '3px',
            transition: 'color 0.12s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
          onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
        >
          ← Back to context
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Edit — outline */}
          <button
            className="lokai-hdr-btn"
            style={{
              color: C.navy,
              background: 'transparent',
              border: `1px solid ${C.navy}`,
            }}
          >
            <Edit2 style={{ width: '11px', height: '11px' }} />
            Edit
          </button>
          {/* Text packet export */}
          <button
            className="lokai-hdr-btn"
            style={{
              color: '#FFFFFF',
              background: GRAD.buttonPrimary,
              border: 'none',
            }}
          >
            <Download style={{ width: '11px', height: '11px' }} />
            Download Text Packet
          </button>
        </div>
      </div>

      {/* Row 2: document title */}
      <div style={{
        fontFamily: SANS, fontSize: '15px', fontWeight: 600, color: '#1A1916',
      }}>
        Demand Notice — Draft
      </div>
    </div>
  );
}

// ─── Document Body Content ────────────────────────────────────────────────────
// Realistic Maharashtra Rent Control Act demand notice
// EditField marks fields the user must verify / replace
function DocContent() {
  const para: React.CSSProperties = {
    fontFamily: SANS, fontSize: '13px', color: '#4A4840',
    lineHeight: 1.8, margin: '0 0 10px',
  };
  const sectionLabel: React.CSSProperties = {
    fontFamily: SANS, fontSize: '10px', fontWeight: 600,
    color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.1em',
    margin: '18px 0 6px',
  };
  const citationPill: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center',
    background: '#EEF1F8', borderRadius: '4px',
    padding: '3px 8px', marginBottom: '10px',
    fontFamily: SANS, fontSize: '11px', color: C.navy,
  };

  return (
    <div style={{ padding: '20px 20px 28px' }}>

      {/* Document title */}
      <p style={{
        fontFamily: SANS, fontSize: '14px', fontWeight: 600,
        color: '#1A1916', textAlign: 'center', lineHeight: 1.4,
        margin: '0 0 14px',
      }}>
        Demand Notice under Maharashtra Rent Control Act, 1999
      </p>

      {/* AI Draft caution banner */}
      <div style={{
        background: '#FFF3E8',
        borderLeft: '3px solid #E8832A',
        borderRadius: '0 4px 4px 0',
        padding: '8px 12px',
        marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span style={{
          fontFamily: SANS, fontSize: '12px', color: '#8A4500', lineHeight: 1.5,
        }}>
          AI Draft — review carefully before sending
        </span>
      </div>

      {/* Date */}
      <p style={para}>Date: <EditField>April 4, 2026</EditField></p>

      {/* From */}
      <p style={sectionLabel}>From</p>
      <p style={{ ...para, marginBottom: '3px' }}>
        <EditField>Priya Sharma</EditField>
      </p>
      <p style={{ ...para, marginBottom: '3px' }}>
        <EditField>12, Marigold CHS, Andheri East</EditField>
      </p>
      <p style={para}>Mumbai – <EditField>400 069</EditField></p>

      {/* To */}
      <p style={sectionLabel}>To</p>
      <p style={{ ...para, marginBottom: '3px' }}>
        <EditField>Rajesh Mehta</EditField>
      </p>
      <p style={{ ...para, marginBottom: '3px' }}>
        <EditField>204, Seaview Apartments, Bandra West</EditField>
      </p>
      <p style={para}>Mumbai – <EditField>400 050</EditField></p>

      {/* Divider */}
      <div style={{ height: '1px', background: '#E0DDD5', margin: '14px 0' }} />

      {/* Subject */}
      <p style={{ ...para, fontWeight: 600, color: '#1A1916' }}>
        Sub: Demand for Refund of Security Deposit — ₹<EditField>40,000</EditField>
      </p>

      {/* Salutation */}
      <p style={para}>Dear <EditField>Mr. Rajesh Mehta</EditField>,</p>

      {/* Opening */}
      <p style={para}>
        I, <EditField>Priya Sharma</EditField>, was a tenant at the premises located at{' '}
        <EditField>204, Seaview Apartments, Bandra West, Mumbai</EditField>{' '}
        (hereinafter "the Premises") under a tenancy agreement dated{' '}
        <EditField>February 1, 2023</EditField>. I vacated the Premises on{' '}
        <EditField>January 29, 2026</EditField> after providing due notice and fulfilling
        all obligations, including payment of all rent dues up to the date of vacation.
      </p>

      {/* Legal basis */}
      <p style={sectionLabel}>Legal Basis</p>
      <p style={para}>
        Pursuant to{' '}
        <strong style={{ color: C.navy }}>
          Section 24 of the Maharashtra Rent Control Act, 1999
        </strong>
        , you are legally obligated to return the security deposit, after making only such
        deductions as are <em>documented</em>, <em>reasonable</em>, and <em>agreed upon</em>,
        within <strong>30 (thirty) days</strong> of the tenant vacating the premises.
      </p>
      <span style={citationPill}>§ MRC Act 1999 · Section 24</span>

      {/* Facts */}
      <p style={{ ...sectionLabel, marginTop: '6px' }}>Statement of Facts</p>
      {([
        <>I vacated the Premises on <EditField>January 29, 2026</EditField> — <strong>65 days ago</strong> as of this notice.</>,
        <>The security deposit of{' '}<strong>₹<EditField>40,000</EditField>{' '}(Rupees Forty Thousand Only)</strong> remains unreturned.</>,
        <>No written damage assessment, inspection report, or move-out checklist has been provided to me.</>,
        <>No written notice of any specific damage claim has been communicated within the statutory period.</>,
        <>All keys were returned and physical possession of the Premises was handed over on{' '}<EditField>January 29, 2026</EditField>.</>,
      ] as React.ReactNode[]).map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: SANS, fontSize: '13px', color: C.muted,
            flexShrink: 0, lineHeight: 1.8,
          }}>
            {i + 1}.
          </span>
          <p style={{ ...para, margin: 0 }}>{item}</p>
        </div>
      ))}

      {/* Demand */}
      <p style={{ ...sectionLabel, marginTop: '16px' }}>Demand</p>
      <p style={para}>
        You are hereby called upon to refund the security deposit of{' '}
        <strong>₹<EditField>40,000</EditField> (Rupees Forty Thousand Only)</strong> within{' '}
        <strong>15 (fifteen) days</strong> from the date of receipt of this notice.
      </p>
      <p style={para}>
        Failure to comply within the stipulated period shall constrain me to initiate appropriate legal
        proceedings before the{' '}
        <strong>Small Causes Court, Mumbai</strong> and/or the{' '}
        <strong>District Consumer Commission</strong> for recovery of the said deposit amount, together
        with interest at <strong>18% per annum</strong>, litigation costs, and compensation for mental
        harassment caused by undue withholding.
      </p>
      <p style={para}>
        This notice is served without prejudice to any and all legal rights and remedies available to me.
      </p>

      {/* Divider */}
      <div style={{ height: '1px', background: '#E0DDD5', margin: '18px 0' }} />

      {/* Signature block */}
      <p style={{ ...para, fontWeight: 500, color: C.ink }}>Yours faithfully,</p>
      {/* Signature line */}
      <div style={{
        height: '34px',
        borderBottom: '1px solid #B8B4AC',
        width: '148px',
        margin: '10px 0 8px',
      }} />
      <p style={{ ...para, marginBottom: '2px' }}><EditField>Priya Sharma</EditField></p>
      <p style={{ ...para, color: C.muted }}>
        Mumbai · <EditField>April 4, 2026</EditField>
      </p>

      {/* Enclosures */}
      <p style={{ ...sectionLabel, marginTop: '18px' }}>Enclosures</p>
      {[
        'Copy of tenancy agreement dated February 1, 2023',
        'Photographs of Premises condition at vacation',
        'Key handover receipt dated January 29, 2026',
      ].map((item, i) => (
        <p key={i} style={{ ...para, margin: '0 0 4px', display: 'flex', gap: '8px' }}>
          <span style={{ color: C.muted, flexShrink: 0 }}>({i + 1})</span>
          {item}
        </p>
      ))}
    </div>
  );
}

// ─── Document Panel Footer ────────────────────────────────────────────────────
function DocPanelFooter() {
  return (
    <div style={{
      flexShrink: 0,
      padding: '12px 16px',
      borderTop: `1px solid ${C.border}`,
      background: '#FFFFFF',
    }}>
      <button
        className="doc-open-btn"
        style={{
          width: '100%', height: '44px',
          background: GRAD.buttonPrimary,
          border: 'none', borderRadius: '999px',
          fontFamily: SANS, fontSize: '14px', fontWeight: 600,
          color: '#FFFFFF', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: SHADOW.sm,
          transition: 'opacity 0.15s ease',
        }}
      >
        Open full document
        <ArrowRight style={{ width: '15px', height: '15px' }} />
      </button>
    </div>
  );
}

// ─── Floating Input Bar Content ───────────────────────────────────────────────
function InputBarContent() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Voice orb */}
      <button style={{
        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
        background: '#FFFFFF', border: `1px solid ${C.border}`,
        boxShadow: SHADOW.sm,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="5.5" y="1" width="5" height="8" rx="2.5" stroke={C.navy} strokeWidth="1.15" />
          <path d="M2.5 8C2.5 11.3 4.95 14 8 14C11.05 14 13.5 11.3 13.5 8"
            stroke={C.navy} strokeWidth="1.15" strokeLinecap="round" />
          <line x1="8" y1="14" x2="8" y2="15.5" stroke={C.navy} strokeWidth="1.15" strokeLinecap="round" />
        </svg>
      </button>

      {/* Text input */}
      <input
        type="text"
        placeholder="Ask about the document or continue your matter…"
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          fontFamily: SANS, fontSize: '15px', color: C.muted,
        }}
      />

      {/* Paperclip */}
      <button style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', color: C.muted,
        padding: '4px', flexShrink: 0,
        transition: 'color 0.14s ease',
      }}
        onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
        onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
        title="Attach file"
      >
        <Paperclip style={{ width: '17px', height: '17px' }} />
      </button>
    </div>
  );
}

// ─── Chat Doc Page ─────────────────────────────────────────────────────────────
export default function ChatDoc() {
  const navigate  = useNavigate();
  const { collapsed } = useSidebar();
  const sidebarW  = collapsed ? 64 : 260;

  // The 3-zone response for the deposit dispute (English content)
  const zones: StaticZone[] = [
    {
      label: 'What the Law Says',
      content: "A landlord has no automatic right to withhold a security deposit. It must be returned within 30 days of vacating, minus only documented and agreed-upon deductions. At 65 days with no written damage claim, the landlord's legal position is weak.",
      citation: 'MRC Act 1999 · Section 24',
    },
    {
      label: 'Your Situation',
      content: (
        <>
          You vacated <strong style={{ color: C.ink }}>65 days ago</strong> and your landlord is
          holding <strong style={{ color: C.ink }}>₹40,000</strong> in security deposit. Under
          the Maharashtra Rent Control Act, the deposit should have been returned within 30 days.
          The landlord is now <strong style={{ color: C.ink }}>35 days past</strong> the legal deadline.
        </>
      ),
    },
    {
      label: 'What You Can Do',
      content: 'Send a formal demand notice giving the landlord 15 days to return the deposit. If ignored, file at the Small Causes Court or District Consumer Commission, Mumbai.',
      isAction: true,
    },
  ];

  return (
    <>
      <style>{ANIM_STYLES}</style>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg }}>

        {/* ── Breadcrumb — transparent (FIX 3) ── */}
        <div style={{ padding: '14px 32px', background: 'transparent', flexShrink: 0 }}>
          <div style={{ maxWidth: '1060px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              onClick={() => navigate('/')}
              style={{ fontFamily: SANS, fontSize: '12px', color: C.muted, cursor: 'pointer' }}
            >Home</span>
            <span style={{ fontFamily: SANS, fontSize: '12px', color: C.muted }}>/</span>
            <span
              onClick={() => navigate('/ask/3')}
              style={{ fontFamily: SANS, fontSize: '12px', color: C.muted, cursor: 'pointer' }}
            >Security Deposit Dispute</span>
            <span style={{ fontFamily: SANS, fontSize: '12px', color: C.muted }}>/</span>
            <span style={{ fontFamily: SANS, fontSize: '12px', color: C.ink, fontWeight: 500 }}>
              Demand Notice Draft
            </span>
          </div>
        </div>

        {/* ── Main row: [chat column flex:1] [document panel 340px] ── */}
        {/* FIX 2: no overflow:hidden on row — lives on chat column */}
        <div style={{ flex: 1, display: 'flex' }}>

          {/* ── Chat column ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

            {/* Messages scroll area — FIX 1: 120px bottom padding for floating bar */}
            <div
              className="chatdoc-msgs"
              style={{ flex: 1, overflowY: 'auto', padding: '28px 0 120px' }}
            >
              <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>

                {/* User bubble — deposit dispute query */}
                <UserTextBubble
                  text="My landlord is refusing to return my ₹40,000 deposit. It has been 65 days since I vacated. What can I do?"
                  time="4:12 PM"
                />

                {/* AI response card — all 3 zones visible (document already generated) */}
                <StaticAICard
                  zones={zones}
                  time="4:12 PM"
                  actionButton={
                    /* The button that was clicked — now shows as "tapped" state */
                    <button style={{
                      width: '100%', height: '44px',
                      background: 'linear-gradient(180deg, #22478A 0%, #132846 100%)',
                      border: 'none', borderRadius: '999px',
                      fontFamily: SANS, fontSize: '15px', fontWeight: 600,
                      color: '#FFFFFF', cursor: 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: SHADOW.sm,
                      opacity: 0.65, // dimmed — already activated
                    }}>
                      Generate Demand Notice Draft
                    </button>
                  }
                />

                {/* Document generated confirmation */}
                <DocGeneratedRow />

              </div>
            </div>
            {/* FIX 1: no input bar here — floating fixed bar below */}
          </div>

          {/* ── Document panel — FIX 2: sticky centered ── */}
          <div style={{
            width: `${RIGHT_W}px`, flexShrink: 0,
            background: '#FFFFFF',
            borderLeft: `1px solid ${C.border}`,
          }}>
            {/* Sticky wrapper: positions panel at vertical center of viewport */}
            <div style={{
              position: 'sticky',
              top: '50%',
              transform: 'translateY(-50%)',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              {/* Header — always visible at top */}
              <DocPanelHeader onBack={() => navigate('/ask/3')} />

              {/* Document body — scrollable paper area */}
              <div
                className="doc-body-scroll"
                style={{ flex: 1, overflowY: 'auto', background: '#F9F7F3' }}
              >
                <DocContent />
              </div>

              {/* Footer — always visible at bottom */}
              <DocPanelFooter />
            </div>
          </div>

        </div>
      </main>

      {/* ── FIX 1: Floating input bar ──
           Positioned between sidebar and document panel with 24px gaps on each side  ── */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: `${sidebarW + 24}px`,
        right: `${RIGHT_W + 24}px`,
        zIndex: 100,
        background: '#FFFFFF',
        borderRadius: '16px',
        border: `1px solid ${C.border}`,
        boxShadow: '0 4px 24px rgba(26,25,22,0.10), 0 1px 4px rgba(26,25,22,0.06)',
        padding: '12px 16px',
        transition: 'left 0.2s ease',
      }}>
        <InputBarContent />
      </div>
    </>
  );
}
