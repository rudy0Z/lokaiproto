import React, { useState } from 'react';
import { ArrowLeft, Download, Pencil, Paperclip, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SERIF, SANS, C, GRAD, SHADOW, Btn } from '../components/shared';
import { ReviewGate } from '../components/LokAIWorkflow';

// ─── Scrollbar CSS ────────────────────────────────────────────────────────────
const DRAFT_CSS = `
  .draft-scroll::-webkit-scrollbar       { width: 4px; }
  .draft-scroll::-webkit-scrollbar-track { background: transparent; }
  .draft-scroll::-webkit-scrollbar-thumb { background: #E0DDD5; border-radius: 2px; }
  .draft-scroll::-webkit-scrollbar-thumb:hover { background: #E8832A; }

  /* Print / Save-as-PDF — show only the document, drop all app chrome */
  @media print {
    body::before { display: none !important; }
    aside, .no-print { display: none !important; }
    .draft-scroll { overflow: visible !important; padding: 0 !important; }
    .draft-document-card { box-shadow: none !important; border: none !important; }
    @page { margin: 18mm; }
  }
`;

// ─── Section label — 10px uppercase #8A8880 ───────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ marginBottom: '8px', marginTop: '2px' }}>
      <span style={{
        fontFamily: SANS, fontSize: '10px', fontWeight: 600,
        color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {label}
      </span>
    </div>
  );
}

function SectionRule() {
  return <div style={{ height: '1px', background: '#E8E4DC', margin: '24px 0 20px' }} />;
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
        background: (focused || hovered) ? '#FFF8F2' : 'transparent',
        borderBottom: '1.5px dashed #E8832A',
        padding: '6px 10px 4px',
        borderRadius: '4px 4px 0 0',
        marginBottom: '18px',
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        fontFamily: SANS, fontSize: '10px', fontWeight: 600,
        color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.08em',
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
          fontFamily: SANS, fontSize: '14px', fontWeight: 400,
          color: '#1A1916', lineHeight: 1.6, width: '100%',
          background: 'transparent', border: 'none', outline: 'none', padding: 0,
        }}
      />
    </div>
  );
}

// ─── Legal text block — body text 14px #4A4840, line-height 1.8 ───────────────
function LegalText({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <p style={{
        fontFamily: SANS, fontSize: '14px', fontWeight: 400,
        color: '#4A4840', lineHeight: 1.8, margin: 0,
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
    date:           'March 25, 2026',
    buyerName:      'Priya Sharma',
    buyerAddr:      '14B, Pali Hill, Bandra West, Mumbai — 400050',
    buyerPhone:     '+91 98200 XXXXX',
    buyerEmail:     'priya.sharma@email.com',
    sellerName:     'Metro Mobile Store',
    sellerAddr:     'Linking Road, Bandra West, Mumbai',
    productName:    'Mobile phone',
    purchaseDate:   'Add invoice date',
    invoiceAmount:  '₹28,999',
    defectSummary:  'Phone overheats and shuts down within two days of purchase.',
    complaintHistory: 'Seller refused replacement verbally. Written complaint not confirmed yet.',
    requestedRemedy: 'Repair, replacement, or full refund.',
  });
  const set = (key: keyof typeof fields) => (v: string) => setFields(f => ({ ...f, [key]: v }));

  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E0DDD6',
      borderRadius: '12px', padding: '40px 48px',
      marginBottom: '32px', boxShadow: SHADOW.md,
    }}>

      {/* Document title — DM Serif Display 22px centered */}
      <h2 style={{
        fontFamily: SERIF, fontSize: '22px', fontWeight: 400,
        color: '#1A1916', margin: '0 0 28px',
        textAlign: 'center', letterSpacing: '-0.1px',
      }}>
        Consumer Demand Notice
      </h2>

      <div style={{ height: '1px', background: '#E8E4DC', marginBottom: '24px' }} />

      {/* TO section */}
      <SectionLabel label="To" />
      <LegalText>
        <strong style={{ fontFamily: SANS, fontSize: '13px', color: '#1A1916', fontWeight: 600 }}>To,</strong>
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
        <strong style={{ fontFamily: SANS, fontSize: '13px', color: '#1A1916', fontWeight: 600 }}>Subject:</strong>
        {' '}Notice regarding defective{' '}
        <span style={{ color: '#1A1916', fontWeight: 500 }}>{fields.productName}</span>
        {' '}purchased on{' '}
        <span style={{ color: '#1A1916', fontWeight: 500 }}>{fields.purchaseDate}</span>
        {' '}and request for refund/replacement.
      </LegalText>

      {/* Salutation */}
      <LegalText>
        Dear Sir/Madam,{'\n\n'}I,{' '}
        <strong style={{ color: '#1A1916' }}>{fields.buyerName}</strong>, am writing to formally notify you regarding a defect in the{' '}
        <strong style={{ color: '#1A1916' }}>{fields.productName}</strong> purchased from your store. The product developed the following defect within two days of use:
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
        <span style={{ color: '#132846', textDecoration: 'underline', textDecorationColor: '#7B9EC4', cursor: 'pointer' }}>
          Section 2(10) of the Consumer Protection Act, 2019
        </span>
        {' '}for defect in goods,{' '}
        <span style={{ color: '#132846', textDecoration: 'underline', textDecorationColor: '#7B9EC4', cursor: 'pointer' }}>
          Section 2(11)
        </span>
        {' '}for deficiency in service, and{' '}
        <span style={{ color: '#132846', textDecoration: 'underline', textDecorationColor: '#7B9EC4', cursor: 'pointer' }}>
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
          <strong style={{ color: '#1A1916' }}>{fields.buyerName}</strong>
          {'\n'}{fields.buyerPhone}
          {'\n'}{fields.buyerEmail}
        </LegalText>
        <div style={{ textAlign: 'right', marginBottom: '18px' }}>
          <div style={{ fontFamily: SANS, fontSize: '12px', color: '#8A8880', marginBottom: '32px' }}>
            Signature / Thumb impression
          </div>
          <div style={{ height: '1px', width: '160px', background: '#C4C0B8' }} />
          <div style={{ fontFamily: SANS, fontSize: '11px', color: '#8A8880', marginTop: '6px' }}>
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
// Legal strip: 13px secondary, 3px navy left border, #F4F2EE background
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
        fontFamily: SERIF, fontSize: '22px', fontWeight: 400,
        color: '#1A1916', margin: '0 0 24px',
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
          borderTop: '1px dashed #D8D4CC', zIndex: 0, pointerEvents: 'none',
        }} />

        {steps.map(step => (
          <div key={step.num} style={{
            background: '#FFFFFF', border: '1px solid #E8E4DC',
            borderRadius: '16px', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '12px',
            position: 'relative', zIndex: 1,
            boxShadow: '0 1px 2px rgba(26,25,22,0.04), 0 2px 8px rgba(26,25,22,0.05)',
          }}>
            {/* Step circle — 24px navy, white number */}
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: '#132846',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: SANS, fontSize: '12px', fontWeight: 600,
                color: '#FFFFFF', lineHeight: 1,
              }}>
                {step.num}
              </span>
            </div>

            <div>
              {/* Step title — 14px weight 600 Plus Jakarta Sans */}
              <div style={{
                fontFamily: SANS, fontSize: '14px', fontWeight: 600,
                color: '#1A1916', marginBottom: '6px', lineHeight: 1.3,
              }}>
                {step.title}
              </div>
              {/* Description — 13px secondary */}
              <p style={{
                fontFamily: SANS, fontSize: '13px', fontWeight: 400,
                color: '#4A4840', lineHeight: 1.65, margin: 0,
              }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom legal strip — 13px secondary, 3px navy left border, #F4F2EE background */}
      <div style={{
        background: '#F4F2EE',
        borderLeft: '3px solid #132846',
        borderRadius: '0 8px 8px 0',
        padding: '14px 20px',
      }}>
        <p style={{
          fontFamily: SANS, fontSize: '13px', fontWeight: 400,
          color: '#4A4840', lineHeight: 1.65, margin: 0,
        }}>
          LokAI provides legal information, not legal advice. This packet is an AI draft and should be reviewed before filing or sharing.
        </p>
      </div>
    </div>
  );
}

// ─── Draft Input Bar — follow-up questions ────────────────────────────────────
function DraftInputBar() {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const showSend = !!(value.trim()) || focused;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: '#FFFFFF', border: `1px solid ${C.border}`,
      borderRadius: '16px', padding: '8px 12px',
      boxShadow: '0 1px 2px rgba(26,25,22,0.04), 0 2px 8px rgba(26,25,22,0.05)',
    }}>
      {/* Voice orb — 40px white circle, shadow-sm, navy mic */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
        background: '#FFFFFF', border: `1px solid ${C.border}`,
        boxShadow: '0 1px 2px rgba(26,25,22,0.04), 0 2px 8px rgba(26,25,22,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="5.5" y="1" width="5" height="8" rx="2.5" stroke={C.navy} strokeWidth="1.15" />
          <path d="M2.5 8C2.5 11.3 4.95 14 8 14C11.05 14 13.5 11.3 13.5 8" stroke={C.navy} strokeWidth="1.15" strokeLinecap="round" />
          <line x1="8" y1="14" x2="8" y2="15.5" stroke={C.navy} strokeWidth="1.15" strokeLinecap="round" />
        </svg>
      </div>

      {/* Input */}
      <input
        type="text" value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={e => { if (e.key === 'Enter' && value.trim()) setValue(''); }}
        placeholder="Ask a follow-up question about this draft..."
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          fontFamily: SANS, fontSize: '15px', color: C.muted,
        }}
      />

      {/* Send — fades in on focus */}
      <button
        onClick={() => { if (value.trim()) setValue(''); }}
        style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: GRAD.buttonPrimary, border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, opacity: showSend ? 1 : 0, transition: 'opacity 0.15s ease',
          boxShadow: SHADOW.sm,
        }}
      >
        <ArrowRight style={{ width: '14px', height: '14px', color: 'white' }} />
      </button>

      {/* Paperclip — always visible, rightmost */}
      <button style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', color: C.muted,
        padding: '4px', flexShrink: 0,
      }}>
        <Paperclip style={{ width: '17px', height: '17px' }} />
      </button>
    </div>
  );
}

// ─── Draft Page ────────────────────────────────────────────────────────────────
export default function Draft() {
  const navigate = useNavigate();
  const documentRef = React.useRef<HTMLDivElement | null>(null);

  // Save as PDF — uses the browser's native print-to-PDF with a print stylesheet
  // that strips app chrome, so the citizen gets a clean filing-ready document.
  const handleDownload = () => {
    window.print();
  };

  const handleEdit = () => {
    documentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg, overflow: 'hidden' }}>
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
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#FFFFFF', border: '1px solid #E8E4DC',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#4A4840', flexShrink: 0,
                zIndex: 1,
              }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
            </button>

            {/* Center: document title — absolutely centered */}
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <h1 style={{
                fontFamily: SERIF, fontSize: '22px', fontWeight: 400,
                color: '#1A1916', margin: 0, letterSpacing: '-0.1px',
                whiteSpace: 'nowrap',
              }}>
                Consumer Demand Notice
              </h1>
            </div>

            {/* Right: Edit + Download text buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
              <Btn variant="secondary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleEdit}>
                <Pencil style={{ width: '13px', height: '13px' }} />
                Edit
              </Btn>
              <Btn variant="primary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleDownload}>
                <Download style={{ width: '13px', height: '13px' }} />
                Save as PDF
              </Btn>
            </div>
          </div>

          {/* ── AI draft review banner — #FFF3E8, 3px saffron left border, 13px ── */}
          <div style={{
            background: '#FFF3E8',
            borderLeft: '3px solid #E8832A',
            borderRadius: '0 8px 8px 0',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="6" stroke="#E8832A" strokeWidth="1.2" />
              <line x1="7" y1="4.5" x2="7" y2="7.5" stroke="#E8832A" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="7" cy="9.5" r="0.7" fill="#E8832A" />
            </svg>
            <span style={{ fontFamily: SANS, fontSize: '13px', fontWeight: 400, color: '#8A4500' }}>
              AI draft — review all details before sending
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
                'To: Metro Mobile Store',
                'Address: Linking Road, Bandra West, Mumbai',
                'Subject: Defective mobile phone — request for repair, replacement, or refund',
                '',
                'I purchased a mobile phone from Metro Mobile Store. The phone became defective',
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
              onPrint={() => window.print()}
            />
          </div>

          {/* ── What to do next ── */}
          <WhatNext />
        </div>
      </div>

      {/* ── Fixed bottom input bar ── */}
      <div className="no-print" style={{
        flexShrink: 0,
        background: '#FFFFFF',
        borderTop: '1px solid #E8E4DC',
        boxShadow: '0 -1px 4px rgba(26,25,22,0.04), 0 -4px 12px rgba(26,25,22,0.04)',
        padding: '14px 48px 20px',
      }}>
        <div style={{ maxWidth: '740px', margin: '0 auto' }}>
          <DraftInputBar />
        </div>
      </div>
    </main>
  );
}
