import React, { useState } from 'react';
import { IconBack, IconDownload, IconPencil } from '../ui/icons';
import { useNavigate } from 'react-router';
import { Btn, C, LAYOUT, PLANE, SANS, SERIF, SHADOW, TYPE } from '../components/shared';
import { ReviewGate, FirstActionChecklist } from '../components/LokAIWorkflow';
import { useDemo } from '../context/DemoContext';

// ─── Scrollbar CSS ────────────────────────────────────────────────────────────
const DRAFT_CSS = `
  .draft-scroll::-webkit-scrollbar       { width: 4px; }
  .draft-scroll::-webkit-scrollbar-track { background: transparent; }
  .draft-scroll::-webkit-scrollbar-thumb { background: var(--role-hairline); border-radius: 2px; }
  .draft-scroll::-webkit-scrollbar-thumb:hover { background: ${C.saffron}; }

  /* Print / Save-as-PDF — show only the document, drop all app chrome */
  @media print {
    body::before { display: none !important; }
    aside, .no-print { display: none !important; }
    .draft-scroll { overflow: visible !important; padding: 0 !important; }
    .draft-document-card { box-shadow: none !important; border: none !important; }
    @page { margin: 18mm; }
  }
`;

// ─── Section label — 10px uppercase quiet ink ───────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ marginBottom: '8px', marginTop: '2px' }}>
      <span style={{
        fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: 600,
        color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {label}
      </span>
    </div>
  );
}

function SectionRule() {
  return <div style={{ height: '1px', background: C.border, margin: '24px 0 20px' }} />;
}

// ─── Editable field — saffron dashed bottom border ────────────────────────────
function EditableField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: (focused || hovered) ? 'var(--role-flag-fill)' : 'transparent',
        borderBottom: `1.5px dashed ${C.saffron}`,
        padding: '6px 10px 4px',
        borderRadius: `${LAYOUT.radius.xs} ${LAYOUT.radius.xs} ${LAYOUT.radius.none} ${LAYOUT.radius.none}`,
        marginBottom: '18px',
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: 600,
        color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: '3px',
      }}>
        {label}
      </div>
      <input
        type="text" value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 400,
          color: C.ink, lineHeight: 1.6, width: '100%',
          background: 'transparent', border: 'none', outline: 'none', padding: 0,
        }}
      />
    </div>
  );
}

// ─── Legal text block — body text 14px inkSoft, line-height 1.8 ───────────────
function LegalText({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <p style={{
        fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 400,
        color: C.inkSoft, lineHeight: 1.8, margin: 0,
        whiteSpace: 'pre-line',
      }}>
        {children}
      </p>
    </div>
  );
}

// ─── Document card — white, shadow-md, radius 16px, padding 40px ──────────────
function DocumentCard() {
  const [fields, setFields] = useState({
    date:           '22 July 2026',
    buyerName:      'Priya Sharma',
    buyerAddr:      '14B, Pali Hill, Bandra West, Mumbai — 400050',
    buyerPhone:     '+91 98200 XXXXX',
    buyerEmail:     'priya.sharma@email.com',
    sellerName:     'HomeKart',
    sellerAddr:     'Online marketplace · Mumbai service address',
    productName:    'Mixer grinder',
    purchaseDate:   '6 June 2026',
    invoiceAmount:  '₹8,999',
    defectSummary:  'The jar arrived cracked and the motor is unsafe to run.',
    complaintHistory: 'Seller refused replacement in writing on 8 June 2026.',
    requestedRemedy: 'Replacement or full refund.',
  });
  const set = (key: keyof typeof fields) => (v: string) => setFields(f => ({ ...f, [key]: v }));

  return (
    <div style={{
      background: 'var(--role-raised)', border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.panel, padding: '40px 48px',
      marginBottom: '32px', boxShadow: SHADOW.md,
    }}>

      {/* Document title — DM Serif Display 22px centered */}
      <h2 style={{
        fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400,
        color: C.ink, margin: '0 0 28px',
        textAlign: 'center', letterSpacing: '-0.1px',
      }}>
        Consumer Demand Notice
      </h2>

      <div style={{ height: '1px', background: C.border, marginBottom: '24px' }} />

      {/* TO section */}
      <SectionLabel label="To" />
      <LegalText>
        <strong style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.ink, fontWeight: 600 }}>To,</strong>
      </LegalText>
      <EditableField label="Seller / Store Name" value={fields.sellerName} onChange={set('sellerName')} />
      <EditableField label="Seller Address"     value={fields.sellerAddr} onChange={set('sellerAddr')}  />

      <SectionRule />

      {/* Date — right aligned */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '240px' }}>
          <SectionLabel label="Date" />
          <EditableField label="Date" value={fields.date} onChange={set('date')} />
        </div>
      </div>

      <SectionRule />

      {/* Subject */}
      <SectionLabel label="Subject" />
      <LegalText>
        <strong style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.ink, fontWeight: 600 }}>Subject:</strong>
        {' '}Notice regarding defective{' '}
        <span style={{ color: C.ink, fontWeight: 500 }}>{fields.productName}</span>
        {' '}purchased on{' '}
        <span style={{ color: C.ink, fontWeight: 500 }}>{fields.purchaseDate}</span>
        {' '}and request for refund/replacement.
      </LegalText>

      {/* Salutation */}
      <LegalText>
        Dear Sir/Madam,{'\n\n'}I,{' '}
        <strong style={{ color: C.ink }}>{fields.buyerName}</strong>, am writing to formally notify you regarding a defect in the{' '}
        <strong style={{ color: C.ink }}>{fields.productName}</strong> purchased from your store. The product developed the following defect within two days of use:
        {' '}{fields.defectSummary}
      </LegalText>

      <SectionRule />

      {/* Applicant Details */}
      <SectionLabel label="Sender / Buyer Details" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
        <EditableField label="Your Name"    value={fields.buyerName}  onChange={set('buyerName')}  />
        <EditableField label="Your Phone"   value={fields.buyerPhone} onChange={set('buyerPhone')} />
        <EditableField label="Your Address" value={fields.buyerAddr}  onChange={set('buyerAddr')}  />
        <EditableField label="Your Email"   value={fields.buyerEmail} onChange={set('buyerEmail')} />
      </div>
      <SectionLabel label="Purchase Details" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
        <EditableField label="Product Name"      value={fields.productName} onChange={set('productName')} />
        <EditableField label="Purchase Date"     value={fields.purchaseDate} onChange={set('purchaseDate')} />
        <EditableField label="Invoice Amount"    value={fields.invoiceAmount} onChange={set('invoiceAmount')} />
      </div>

      <SectionRule />

      {/* Complaint Summary */}
      <SectionLabel label="Notice Summary" />
      <LegalText>
        1.&emsp;Product purchased: {fields.productName}
        {'\n'}2.&emsp;Defect reported: {fields.defectSummary}
        {'\n'}3.&emsp;Previous communication: {fields.complaintHistory}
        {'\n'}4.&emsp;Requested resolution: {fields.requestedRemedy}
      </LegalText>
      <EditableField label="Requested Remedy" value={fields.requestedRemedy} onChange={set('requestedRemedy')} />

      <SectionRule />

      {/* Legal Reference */}
      <SectionLabel label="Legal Reference" />
      <LegalText>
        This packet is based on{' '}
        <span style={{ color: C.navy, textDecoration: 'underline', textDecorationColor: 'var(--role-anchor-tint)', cursor: 'pointer' }}>
          Section 2(10) of the Consumer Protection Act, 2019
        </span>
        {' '}for defect in goods,{' '}
        <span style={{ color: C.navy, textDecoration: 'underline', textDecorationColor: 'var(--role-anchor-tint)', cursor: 'pointer' }}>
          Section 2(11)
        </span>
        {' '}for deficiency in service, and{' '}
        <span style={{ color: C.navy, textDecoration: 'underline', textDecorationColor: 'var(--role-anchor-tint)', cursor: 'pointer' }}>
          Section 35
        </span>
        {' '}for complaint filing.
      </LegalText>
      <LegalText>
        If the purchase happened through an online marketplace, the Consumer Protection
        (E-Commerce) Rules, 2020 may also be relevant. LokAI has marked that source as related,
        not direct, until the platform details are confirmed.
      </LegalText>

      {/* Evidence */}
      <SectionLabel label="Evidence Checklist" />
      <LegalText>
        1.&emsp;Invoice or payment receipt
        {'\n'}2.&emsp;Warranty card or product listing
        {'\n'}3.&emsp;Photos or video showing the defect
        {'\n'}4.&emsp;Seller replies, call logs, or written complaint proof
        {'\n'}5.&emsp;Repair report, if already inspected
      </LegalText>

      <SectionRule />

      {/* Signature block */}
      <SectionLabel label="Signature" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <LegalText>
          Yours faithfully,{'\n\n'}
          <strong style={{ color: C.ink }}>{fields.buyerName}</strong>
          {'\n'}{fields.buyerPhone}
          {'\n'}{fields.buyerEmail}
        </LegalText>
        <div style={{ textAlign: 'right', marginBottom: '18px' }}>
          <div style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, marginBottom: '32px' }}>
            Signature / Thumb impression
          </div>
          <div style={{ height: '1px', width: '160px', background: 'var(--role-hairline)' }} />
          <div style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, marginTop: '6px' }}>
            {fields.buyerName} · {fields.date}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── What to do next — 3-step row ─────────────────────────────────────────────
// Step circle: navy 24px circle with white number
// Step title: 14px weight 600 Plus Jakarta Sans
// Legal strip: 13px secondary, 3px navy left border, sunken background
const steps = [
  {
    num: '1',
    title: 'Review and edit',
    desc: 'Read every field carefully. Correct any information that LokAI assumed or pre-filled on your behalf.',
  },
  {
    num: '2',
    title: 'Send a written complaint',
    desc: 'Share the issue with the seller or platform first, and keep proof of delivery or acknowledgement.',
  },
  {
    num: '3',
    title: 'File if ignored',
    desc: 'Use the complaint packet if the seller does not respond or refuses a reasonable remedy.',
  },
];

function WhatNext() {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h3 style={{
        fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400,
        color: C.ink, margin: '0 0 24px',
      }}>
        What to do next
      </h3>

      {/* 3-step row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px', marginBottom: '20px', position: 'relative',
      }}>
        {/* Dashed connector line between steps */}
        <div style={{
          position: 'absolute', top: '12px',
          left: 'calc(33.33% + 12px)', right: 'calc(33.33% + 12px)',
          borderTop: '1px dashed var(--role-hairline)', zIndex: 0, pointerEvents: 'none',
        }} />

        {steps.map(step => (
          <div key={step.num} style={{
            background: 'var(--role-raised)', border: `1px solid ${C.border}`,
            borderRadius: LAYOUT.radius.card, padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '12px',
            position: 'relative', zIndex: 1,
            boxShadow: SHADOW.xs,
          }}>
            {/* Step circle — 24px navy, white number */}
            <div style={{
              width: '24px', height: '24px', borderRadius: LAYOUT.radius.full,
              background: C.navy,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 600,
                color: 'var(--role-raised)', lineHeight: 1,
              }}>
                {step.num}
              </span>
            </div>

            <div>
              {/* Step title — 14px weight 600 Plus Jakarta Sans */}
              <div style={{
                fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 600,
                color: C.ink, marginBottom: '6px', lineHeight: 1.3,
              }}>
                {step.title}
              </div>
              {/* Description — 13px secondary */}
              <p style={{
                fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 400,
                color: C.inkSoft, lineHeight: 1.65, margin: 0,
              }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom legal strip — 13px secondary, 3px navy left border, sunken background */}
      <div style={{
        background: C.surface2,
        borderLeft: `3px solid ${C.navy}`,
        borderRadius: `${LAYOUT.radius.none} ${LAYOUT.radius.control} ${LAYOUT.radius.control} ${LAYOUT.radius.none}`,
        padding: '14px 20px',
      }}>
        <p style={{
          fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 400,
          color: C.inkSoft, lineHeight: 1.65, margin: 0,
        }}>
          LokAI provides legal information, not legal advice. This packet is an AI draft and should be reviewed before filing or sharing.
        </p>
      </div>
    </div>
  );
}

// ─── Draft Page ────────────────────────────────────────────────────────────────
export default function Draft() {
  const navigate = useNavigate();
  const documentRef = React.useRef<HTMLDivElement | null>(null);
  const {
    scenario,
    facts,
    draftAllowed,
    draftApproved,
    setDraftApproved,
    language,
    activeTurn,
    addAuditEvent,
  } = useDemo();

  const missingFacts = facts.filter((f) => f.state === 'missing' || f.state === 'disputed');
  const stopReason = activeTurn?.mode === 'stop'
    ? (activeTurn.payload as { reason?: string }).reason
    : scenario.statusBody;

  // Save as PDF — uses the browser's native print-to-PDF with a print stylesheet
  // that strips app chrome, so the citizen gets a clean filing-ready document.
  const handleDownload = () => {
    if (!draftAllowed) return;
    window.print();
  };

  const handleEdit = () => {
    documentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!draftAllowed) {
    return (
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: PLANE.reading, overflow: 'hidden' }}>
        <style>{DRAFT_CSS}</style>
        <div className="draft-scroll" style={{ flex: 1, overflowY: 'auto', padding: '36px 48px 32px' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '36px', height: '36px', borderRadius: LAYOUT.radius.control,
                background: 'var(--role-raised)', border: `1px solid ${C.border}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: C.inkSoft, marginBottom: 24,
              }}
            >
              <IconBack style={{ width: '16px', height: '16px' }} />
            </button>

            <div style={{
              background: 'var(--role-raised)',
              border: `1px solid ${C.border}`,
              borderTop: `3px solid ${C.oxblood}`,
              borderRadius: `${LAYOUT.radius.xs} ${LAYOUT.radius.card} ${LAYOUT.radius.card} ${LAYOUT.radius.card}`,
              padding: 28,
              boxShadow: SHADOW.sm,
            }}>
              <p style={{
                fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 700,
                color: C.oxblood, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px',
              }}>
                Draft held
              </p>
              <h1 style={{
                fontFamily: SERIF, fontSize: TYPE.editorial.size, fontWeight: 400,
                color: C.ink, lineHeight: 1.2, margin: '0 0 12px',
              }}>
                LokAI will not prepare this draft yet
              </h1>
              <p style={{
                fontFamily: SANS, fontSize: TYPE.title.size, color: C.inkSoft, lineHeight: 1.65, margin: '0 0 18px',
              }}>
                {stopReason || scenario.statusTitle}
              </p>

              {missingFacts.length > 0 && (
                <div style={{
                  background: C.surface2, border: `1px solid ${C.border}`,
                  borderRadius: LAYOUT.radius.panel, padding: 14, marginBottom: 18,
                }}>
                  <p style={{
                    fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 700,
                    color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px',
                  }}>
                    What is missing
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {missingFacts.map((f) => (
                      <li key={f.id} style={{ fontFamily: SANS, fontSize: TYPE.body.size, color: C.ink, marginBottom: 6 }}>
                        {f.label}: {f.value || 'not confirmed'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 8px' }}>
                Who to ask: confirm the missing detail with the seller, or bring a lawyer / trusted helper if the matter is contested.
              </p>
              <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 20px' }}>
                What unblocks it: confirm every required fact, then return when the policy tier allows a self-service draft.
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Btn variant="primary" size="sm" onClick={() => navigate('/desktop/chat/consumer')}>
                  Return to the matter
                </Btn>
                <Btn variant="secondary" size="sm" onClick={() => navigate('/desktop/documents')}>
                  View case files
                </Btn>
              </div>
              <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, margin: '16px 0 0' }}>
                Language: {language.toUpperCase()} · Scene: {scenario.label}
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: PLANE.reading, overflow: 'hidden' }}>
      <style>{DRAFT_CSS}</style>

      {/* ── Scrollable content area ── */}
      <div className="draft-scroll" style={{ flex: 1, overflowY: 'auto', padding: '36px 48px 32px' }}>
        <div style={{ maxWidth: '740px', margin: '0 auto' }}>

          {/* ── Header bar: back arrow · centered title · action buttons ── */}
          <div className="no-print" style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            position: 'relative',
          }}>
            {/* Left: back button */}
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '36px', height: '36px', borderRadius: LAYOUT.radius.control,
                background: 'var(--role-raised)', border: `1px solid ${C.border}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: C.inkSoft, flexShrink: 0,
                zIndex: 1,
              }}
            >
              <IconBack style={{ width: '16px', height: '16px' }} />
            </button>

            {/* Center: document title — absolutely centered */}
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <h1 style={{
                fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400,
                color: C.ink, margin: 0, letterSpacing: '-0.1px',
                whiteSpace: 'nowrap',
              }}>
                Consumer Demand Notice
              </h1>
            </div>

            {/* Right: Edit + Download text buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
              <Btn variant="secondary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleEdit}>
                <IconPencil style={{ width: '13px', height: '13px' }} />
                Edit
              </Btn>
              <Btn variant="primary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleDownload}>
                <IconDownload style={{ width: '13px', height: '13px' }} />
                Save as PDF
              </Btn>
            </div>
          </div>

          {/* ── AI draft review banner — var(--role-flag-fill), 3px saffron left border, 13px ── */}
          <div style={{
            background: 'var(--role-flag-fill)',
            borderLeft: `3px solid ${C.saffron}`,
            borderRadius: `${LAYOUT.radius.none} ${LAYOUT.radius.control} ${LAYOUT.radius.control} ${LAYOUT.radius.none}`,
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="6" stroke={C.saffron} strokeWidth="1.2" />
              <line x1="7" y1="4.5" x2="7" y2="7.5" stroke={C.saffron} strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="7" cy="9.5" r="0.7" fill={C.saffron} />
            </svg>
            <span style={{ fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 400, color: 'C.amber' }}>
              AI draft — review all details before sending · {scenario.matterTitle}
              {draftApproved ? ' · Approved for copy/print' : ''}
            </span>
          </div>

          {/* ── Document card ── */}
          <div ref={documentRef} className="draft-document-card">
            <DocumentCard />
          </div>

          {/* ── No-direct-send review gate — visible human-in-the-loop checkpoint ── */}
          <div className="no-print" style={{ margin: '28px 0 8px' }}>
            <ReviewGate
              draftText={[
                'LokAI — Consumer demand notice draft (review before sending)',
                '',
                'To: HomeKart',
                'Address: Linking Road, Bandra West, Mumbai',
                'Subject: Damaged mixer grinder — request for replacement or refund',
                '',
                'I purchased a mixer grinder from HomeKart. It arrived damaged',
                'shortly after purchase. I asked the seller for a repair, replacement, or refund,',
                'and the request was refused.',
                '',
                'Legal basis: Consumer Protection Act, 2019 — Sections 2(10), 2(11), 35.',
                '',
                'I am keeping the invoice, defect photos, warranty, and seller messages as evidence',
                'and request a resolution within a reasonable period.',
                '',
                '— Prepared with LokAI. Please review every detail before sending.',
              ].join('\n')}
              approved={draftApproved}
              onApprove={setDraftApproved}
              onPrint={() => window.print()}
            />
          </div>

          {draftApproved && (
            <div className="no-print" style={{ margin: '16px 0 8px' }}>
              <FirstActionChecklist
                onComplete={() => addAuditEvent('Exit checklist completed — user owns next actions outside LokAI')}
              />
            </div>
          )}

          {/* ── What to do next ── */}
          <WhatNext />
        </div>
      </div>

      {/* ── Compact scoped ask — draft stays the subject of the page ── */}
      <div className="no-print" style={{
        flexShrink: 0,
        background: 'var(--role-raised)',
        borderTop: `1px solid ${C.border}`,
        boxShadow: SHADOW.xs,
        padding: '12px 48px 16px',
      }}>
        <div style={{ maxWidth: '740px', margin: '0 auto', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/desktop/chat/consumer', { state: { initialQuestion: 'Review my demand notice draft for missing facts' } })}
            style={{
              minHeight: 40,
              padding: '0 16px',
              borderRadius: LAYOUT.radius.pill,
              border: `1px solid ${C.navy}`,
              background: C.surface,
              color: C.navy,
              fontFamily: SANS,
              fontSize: TYPE.small.size,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Ask about this draft
          </button>
        </div>
      </div>
    </main>
  );
}
