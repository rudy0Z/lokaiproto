import React, { useState } from 'react';
import { ArrowLeft, Download, Pencil, Paperclip, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SERIF, SANS, C, GRAD, SHADOW, Btn } from '../components/shared';

// ─── Scrollbar CSS ────────────────────────────────────────────────────────────
const DRAFT_CSS = `
  .draft-scroll::-webkit-scrollbar       { width: 4px; }
  .draft-scroll::-webkit-scrollbar-track { background: transparent; }
  .draft-scroll::-webkit-scrollbar-thumb { background: #E0DDD5; border-radius: 2px; }
  .draft-scroll::-webkit-scrollbar-thumb:hover { background: #E8832A; }
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
    applicantName:  'Riya Sharma',
    applicantAddr:  '14B, Pali Hill, Bandra West, Mumbai — 400050',
    applicantPhone: '+91 98200 XXXXX',
    applicantEmail: 'riya.sharma@email.com',
    societyName:    'Pali Hill CHS, Bandra West',
    permitDate:     'October 10, 2025',
    ward:           'H/West Ward, Bandra',
    pioName:        'The Public Information Officer',
    pioOrg:         'Brihanmumbai Municipal Corporation (BMC)',
    feeMode:        'Indian Postal Order / Court Fee Stamp',
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
        सूचना का अधिकार अधिनियम, 2005 के अंतर्गत आवेदन
      </h2>

      <div style={{ height: '1px', background: '#E8E4DC', marginBottom: '24px' }} />

      {/* TO section */}
      <SectionLabel label="To" />
      <LegalText>
        <strong style={{ fontFamily: SANS, fontSize: '13px', color: '#1A1916', fontWeight: 600 }}>To,</strong>
      </LegalText>
      <EditableField label="PIO Name & Designation" value={fields.pioName}  onChange={set('pioName')} />
      <EditableField label="Organisation"           value={fields.pioOrg}   onChange={set('pioOrg')}  />

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
        {' '}Request for information regarding the status of building permit application submitted by{' '}
        <span style={{ color: '#1A1916', fontWeight: 500 }}>{fields.societyName}</span> on{' '}
        <span style={{ color: '#1A1916', fontWeight: 500 }}>{fields.permitDate}</span> to{' '}
        <span style={{ color: '#1A1916', fontWeight: 500 }}>{fields.ward}</span>.
      </LegalText>

      {/* Salutation */}
      <LegalText>
        Respected Sir/Madam,{'\n\n'}I,{' '}
        <strong style={{ color: '#1A1916' }}>{fields.applicantName}</strong>, a citizen of India,
        residing at{' '}
        <strong style={{ color: '#1A1916' }}>{fields.applicantAddr}</strong>, hereby request the
        following information under Section 6(1) of the Right to Information Act, 2005.
      </LegalText>

      <SectionRule />

      {/* Applicant Details */}
      <SectionLabel label="Applicant Details" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
        <EditableField label="Your Name"    value={fields.applicantName}  onChange={set('applicantName')}  />
        <EditableField label="Your Phone"   value={fields.applicantPhone} onChange={set('applicantPhone')} />
        <EditableField label="Your Address" value={fields.applicantAddr}  onChange={set('applicantAddr')}  />
        <EditableField label="Your Email"   value={fields.applicantEmail} onChange={set('applicantEmail')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
        <EditableField label="Society / Property Name" value={fields.societyName} onChange={set('societyName')} />
        <EditableField label="Permit Application Date" value={fields.permitDate}  onChange={set('permitDate')}  />
        <EditableField label="BMC Ward"                value={fields.ward}        onChange={set('ward')}        />
      </div>

      <SectionRule />

      {/* Information Requested */}
      <SectionLabel label="Information Requested" />
      <LegalText>
        1.&emsp;Current status of the building permit application submitted on {fields.permitDate}
        {'\n'}2.&emsp;Reasons for any delay or non-processing of the said application
        {'\n'}3.&emsp;Name and designation of the officer responsible for processing this permit
        {'\n'}4.&emsp;Copy of any communications, orders, or objections raised in connection with this application
      </LegalText>

      <SectionRule />

      {/* Legal Reference */}
      <SectionLabel label="Legal Reference" />
      <LegalText>
        As per{' '}
        <span style={{ color: '#132846', textDecoration: 'underline', textDecorationColor: '#7B9EC4', cursor: 'pointer' }}>
          Section 7(1) of the RTI Act, 2005
        </span>
        , the Public Information Officer is obligated to provide the requested information within{' '}
        <strong style={{ color: '#1A1916' }}>30 days</strong> of receipt of this application.
        Failure to respond within this period shall be deemed a refusal and will entitle me to
        file a First Appeal under Section 19(1) of the Act.
      </LegalText>
      <LegalText>
        If the information requested is denied in full or in part, I request that the reason for
        denial be provided in writing, as mandated by{' '}
        <span style={{ color: '#132846', textDecoration: 'underline', textDecorationColor: '#7B9EC4', cursor: 'pointer' }}>
          Section 7(8) of the RTI Act, 2005
        </span>
        .
      </LegalText>

      {/* Application fee */}
      <LegalText>
        I am enclosing the prescribed application fee of{' '}
        <strong style={{ color: '#1A1916' }}>₹10/–</strong> via:
      </LegalText>
      <EditableField label="Fee Payment Mode" value={fields.feeMode} onChange={set('feeMode')} />

      <SectionRule />

      {/* Signature block */}
      <SectionLabel label="Signature" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <LegalText>
          Yours faithfully,{'\n\n'}
          <strong style={{ color: '#1A1916' }}>{fields.applicantName}</strong>
          {'\n'}{fields.applicantPhone}
          {'\n'}{fields.applicantEmail}
        </LegalText>
        <div style={{ textAlign: 'right', marginBottom: '18px' }}>
          <div style={{ fontFamily: SANS, fontSize: '12px', color: '#8A8880', marginBottom: '32px' }}>
            Signature / Thumb impression
          </div>
          <div style={{ height: '1px', width: '160px', background: '#C4C0B8' }} />
          <div style={{ fontFamily: SANS, fontSize: '11px', color: '#8A8880', marginTop: '6px' }}>
            {fields.applicantName} · {fields.date}
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
    title: 'Submit to the PIO',
    desc: 'Deliver in person, by registered post, or through the rtionline.gov.in portal.',
  },
  {
    num: '3',
    title: 'Wait 30 days',
    desc: 'Legally mandated response window. Keep a copy of your application and acknowledgement.',
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
          Under RTI Act 2005, the PIO must respond within 30 days.
          RTI अधिनियम 2005 के अंतर्गत, लोक सूचना अधिकारी को 30 दिन के भीतर उत्तर देना अनिवार्य है।
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

  const handleDownload = () => {
    const content = documentRef.current?.innerText?.trim() || 'LokAI draft preview';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lokai-draft-preview.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
          <div style={{
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
                RTI Application — Draft
              </h1>
            </div>

            {/* Right: Edit + Download PDF buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
              <Btn variant="secondary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleEdit}>
                <Pencil style={{ width: '13px', height: '13px' }} />
                Edit
              </Btn>
              <Btn variant="primary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleDownload}>
                <Download style={{ width: '13px', height: '13px' }} />
                Download PDF
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
              AI draft — review all details before filing
            </span>
          </div>

          {/* ── Document card ── */}
          <div ref={documentRef}>
            <DocumentCard />
          </div>

          {/* ── What to do next ── */}
          <WhatNext />
        </div>
      </div>

      {/* ── Fixed bottom input bar ── */}
      <div style={{
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
