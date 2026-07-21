import React, { useState, useEffect } from 'react';
import { Upload, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { SERIF, SANS, MONO, C, GRAD, SHADOW, Btn } from '../components/shared';
import { callLokAIDetailed, callSarvamOCR, type LokAIResponse } from '../services/api';

// ─── Animations ───────────────────────────────────────────────────────────────
const NOTICE_CSS = `
  .notice-scroll::-webkit-scrollbar       { width: 4px; }
  .notice-scroll::-webkit-scrollbar-track { background: transparent; }
  .notice-scroll::-webkit-scrollbar-thumb { background: #E0DDD5; border-radius: 2px; }
  .clause-amount {
    text-decoration: underline;
    text-decoration-color: #E8832A;
    text-decoration-thickness: 2px;
    color: #2A2420;
    border-radius: 3px;
    padding: 1px 3px;
    transition: background 0.15s ease;
    cursor: pointer;
  }
  .clause-amount:hover {
    background: rgba(232,131,42,0.12);
  }
  .clause-section {
    text-decoration: underline;
    text-decoration-color: #132846;
    text-decoration-thickness: 2px;
    color: #2A2420;
    border-radius: 3px;
    padding: 1px 3px;
    transition: background 0.15s ease;
    cursor: pointer;
  }
  .clause-section:hover {
    background: rgba(19,40,70,0.08);
  }
`;

// ─── Paper texture — faint grid gives document a scanned feel ─────────────────
function PaperTexture() {
  const lines: React.ReactNode[] = [];
  const step = 22;
  for (let y = 0; y <= 900; y += step)
    lines.push(<line key={`h${y}`} x1="0" y1={y} x2="2000" y2={y} stroke="#1A1916" strokeWidth="0.4" opacity="0.035" />);
  for (let x = 0; x <= 2000; x += step)
    lines.push(<line key={`v${x}`} x1={x} y1="0" x2={x} y2="900" stroke="#1A1916" strokeWidth="0.4" opacity="0.025" />);
  return (
    <svg viewBox="0 0 2000 900" preserveAspectRatio="xMinYMin slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {lines}
    </svg>
  );
}

// ─── Citation stamp (reused from shared design) ────────────────────────────────
function CitationChip({ text }: { text: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: GRAD.oxbloodStamp, borderRadius: '4px', padding: '3px 10px 3px 7px',
      fontFamily: MONO, fontSize: '11px', color: '#FFFFFF',
      marginLeft: '6px', verticalAlign: 'middle', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFFFFF', flexShrink: 0, opacity: 0.85 }} />
      {text}
    </span>
  );
}

// ─── Zone label — 10px uppercase #8A8880 ──────────────────────────────────────
function ZoneLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: SANS, fontSize: '10px', fontWeight: 600,
      color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.1em',
      marginBottom: '8px',
    }}>
      {children}
    </div>
  );
}

// ─── Column header ─────────────────────────────────────────────────────────────
function ColLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: SANS, fontSize: '12px', fontWeight: 600,
      color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.09em',
      marginBottom: '12px',
    }}>
      {children}
    </div>
  );
}

// ─── Urgency card — deadline callout ──────────────────────────────────────────
// Background #FFF3E8, border 1px #E8C4A0, radius 12px
// Heading: DM Serif Display italic 17px #1A1916
function UrgencyCard() {
  return (
    <div style={{
      background: '#FFF3E8',
      border: '1px solid #E8C4A0',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '16px',
    }}>
      <div style={{
        fontFamily: SERIF, fontSize: '16px', fontWeight: 600, fontStyle: 'normal',
        color: '#1A1916', lineHeight: 1.3, marginBottom: '6px',
      }}>
        Action required by 15 April 2026
      </div>
      <div style={{ fontFamily: SANS, fontSize: '12px', color: '#8A8880', lineHeight: 1.5 }}>
        30-day statutory timeline from date of notice (18 March 2026)
      </div>
    </div>
  );
}

// ─── Feedback row — thumbs up/down ────────────────────────────────────────────
// 32px buttons, #F4F2EE background, radius 999px
function FeedbackRow() {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  return (
    <div style={{
      padding: '14px 24px 16px',
      borderTop: '1px solid #F0EDE8',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <span style={{ fontFamily: SANS, fontSize: '13px', color: '#8A8880', flex: 1 }}>
        Was this interpretation helpful?
      </span>
      <button
        onClick={() => setVoted(v => v === 'up' ? null : 'up')}
        title="Yes, helpful"
        style={{
          width: '32px', height: '32px', borderRadius: '999px',
          background: voted === 'up' ? '#EEF2F8' : '#F4F2EE',
          border: voted === 'up' ? '1px solid #B8C8E0' : '1px solid #E8E4DC',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.14s ease, border-color 0.14s ease', flexShrink: 0,
        }}
      >
        <ThumbsUp style={{ width: '14px', height: '14px', color: voted === 'up' ? '#132846' : '#8A8880' }} strokeWidth={1.8} />
      </button>
      <button
        onClick={() => setVoted(v => v === 'down' ? null : 'down')}
        title="Not helpful"
        style={{
          width: '32px', height: '32px', borderRadius: '999px',
          background: voted === 'down' ? '#FFF3E8' : '#F4F2EE',
          border: voted === 'down' ? '1px solid #E8C4A0' : '1px solid #E8E4DC',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.14s ease, border-color 0.14s ease', flexShrink: 0,
        }}
      >
        <ThumbsDown style={{ width: '14px', height: '14px', color: voted === 'down' ? '#8A4500' : '#8A8880' }} strokeWidth={1.8} />
      </button>
    </div>
  );
}

// ─── Left panel — Original Notice ─────────────────────────────────────────────
// Document card: #F9F7F3 (paper feel), shadow-md, radius 12px, padding 32px
// Highlights: amounts = saffron underline, dates/sections = navy underline
function OriginalNoticeColumn({ parsedText }: { parsedText: string | null }) {
  return (
    <div style={{ flex: 55, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <ColLabel>Original Notice</ColLabel>

      {/* Status chip — standalone above document card */}
      <div style={{ marginBottom: '12px' }}>
        <span style={{
          fontFamily: SANS, fontSize: '12px', fontWeight: 500,
          color: C.navy, background: '#EEF2F8',
          border: '1px solid #B8C8E0', borderRadius: '6px',
          padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#1F6B3A', display: 'inline-block', flexShrink: 0,
          }} />
          {parsedText ? 'Your uploaded document' : 'Example notice · Marathi document detected'}
        </span>
      </div>

      {parsedText ? (
        <UploadedNoticeCard text={parsedText} />
      ) : (
        <ExampleNoticeCard />
      )}
    </div>
  );
}

/** The real, uploaded document — plain extracted text, no fabricated highlighting. */
function UploadedNoticeCard({ text }: { text: string }) {
  return (
    <div style={{
      background: '#F9F7F3',
      borderRadius: '12px',
      boxShadow: SHADOW.md,
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <PaperTexture />
      <div style={{ position: 'relative', zIndex: 1, padding: '32px', flex: 1, overflowY: 'auto' }}>
        <pre style={{
          fontFamily: MONO, fontSize: '13px', color: '#3A3630', lineHeight: 1.85,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
        }}>
          {text}
        </pre>
      </div>
      <div style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid #E8E4DC',
        padding: '12px 32px',
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#F9F7F3',
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="#8A8880" strokeWidth="0.9" />
          <path d="M4 6L5.5 7.5L8 4.5" stroke="#8A8880" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: SANS, fontSize: '11px', color: '#8A8880' }}>
          OCR complete · {text.length} characters
        </span>
      </div>
    </div>
  );
}

/** The pre-built example — kept exactly as designed, now only shown before an upload. */
function ExampleNoticeCard() {
  return (
      /* Document card — paper feel */
      <div style={{
        background: '#F9F7F3',
        borderRadius: '12px',
        boxShadow: SHADOW.md,
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <PaperTexture />

        {/* Document content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '32px', flex: 1 }}>

          {/* Government letterhead */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{
              fontFamily: MONO, fontSize: '12px', fontWeight: 700,
              color: '#2A2420', letterSpacing: '0.04em', marginBottom: '4px',
            }}>
              महाराष्ट्र शासन — बृहन्मुंबई महानगरपालिका
            </div>
            <div style={{ fontFamily: MONO, fontSize: '11px', color: '#5A5650', letterSpacing: '0.02em', marginBottom: '2px' }}>
              Government of Maharashtra · Brihanmumbai Municipal Corporation
            </div>
            <div style={{ height: '1px', background: '#C4C0B4', margin: '10px auto', width: '80%' }} />
          </div>

          {/* Reference line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
            <span style={{ fontFamily: MONO, fontSize: '12px', color: '#4A4840' }}>
              जा. क्र. / Ref. No: BMC/H-West/2026/0341
            </span>
            <span style={{ fontFamily: MONO, fontSize: '12px', color: '#4A4840' }}>
              दिनांक / Date: 18 मार्च 2026
            </span>
          </div>

          {/* Marathi body — amounts: saffron underline · section refs: navy underline */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontFamily: MONO, fontSize: '13px', color: '#3A3630', lineHeight: 1.85, letterSpacing: '0.01em' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>विषय:</strong> मालमत्ता कर थकबाकीबाबत नोटीस — मालमत्ता क्र. ४५२/बी, पाली हिल, बांद्रा (प).
              </div>
              <div style={{ marginBottom: '8px' }}>
                श्रीमती रिया शर्मा,<br />
                १४बी, पाली हिल, बांद्रा (पश्चिम), मुंबई — ४०००५०.
              </div>
              <div>
                आपणास कळविण्यात येते की, उपरोक्त मालमत्तेसंदर्भात आर्थिक वर्ष २०२५–२६ करिता देय
                मालमत्ता कर{' '}
                {/* Amount → saffron hover highlight */}
                <span className="clause-amount">
                  रु. ३२,४८०/– (अक्षरी: बत्तीस हजार चारशे ऐंशी रुपये)
                </span>{' '}
                अदा केला नसल्याने,{' '}
                {/* Section reference → navy hover highlight */}
                <span className="clause-section">
                  महाराष्ट्र महानगरपालिका अधिनियम, १८८८ च्या कलम १४९
                </span>{' '}
                अन्वये आपणास ही नोटीस देण्यात येत आहे.
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#D8D4CC', margin: '16px 0', opacity: 0.6 }} />

          {/* English continuation */}
          <div style={{ fontFamily: MONO, fontSize: '13px', color: '#4A4840', lineHeight: 1.85, letterSpacing: '0.005em' }}>
            <div style={{ marginBottom: '10px' }}>
              You are hereby directed to clear the outstanding property tax dues of{' '}
              {/* Amount → interactive saffron highlight */}
              <strong className="clause-amount">₹32,480</strong> for the financial year 2025–26 within{' '}
              {/* Date/period → interactive navy highlight */}
              <strong className="clause-section">30 days</strong> from the date of this notice, i.e., on or before{' '}
              {/* Date → navy highlight */}
              <strong className="clause-section">15 April 2026</strong>.
            </div>
            <div style={{ marginBottom: '10px' }}>
              Failure to comply shall result in recovery proceedings under Section 203 of the
              Mumbai Municipal Corporation Act, 1888, including attachment of the said property.
            </div>
            <div>
              Payment may be made at the Ward Office, H/West, or via the BMC portal at{' '}
              <span style={{ color: C.navy, textDecoration: 'underline' }}>mcgm.gov.in</span>.
              Quote reference number in all communications.
            </div>
          </div>

          {/* Signature block */}
          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: MONO, fontSize: '11px', color: '#8A8880', marginBottom: '24px' }}>
                अधिकृत स्वाक्षरी / Authorised Signatory
              </div>
              <div style={{ height: '1px', width: '120px', background: '#B8B4AC' }} />
              <div style={{ fontFamily: MONO, fontSize: '11px', color: '#8A8880', marginTop: '4px' }}>
                कर निरीक्षक, H/West वॉर्ड
              </div>
            </div>
          </div>
        </div>

        {/* OCR bottom bar — border-top 1px #E8E4DC */}
        <div style={{
          position: 'relative', zIndex: 1,
          borderTop: '1px solid #E8E4DC',
          padding: '12px 32px',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#F9F7F3',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#8A8880" strokeWidth="0.9" />
            <path d="M4 6L5.5 7.5L8 4.5" stroke="#8A8880" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: SANS, fontSize: '11px', color: '#8A8880' }}>
            OCR complete · 847 characters · Translated from Marathi
          </span>
        </div>
      </div>
  );
}

// ─── Interpretation zones ─────────────────────────────────────────────────────
// Fallback content for the example notice, shown until a real upload exists.
interface Zone { label: string; content: React.ReactNode; citation?: string; }

const EXAMPLE_ZONES: Zone[] = [
  {
    label: 'WHAT THIS SAYS',
    content: (
      <>
        This is a property tax demand notice from the Brihanmumbai Municipal Corporation (BMC). You owe{' '}
        <strong style={{ color: '#1A1916' }}>₹32,480</strong> in unpaid property tax for financial year
        2025–26 on your property at 14B, Pali Hill, Bandra West.
      </>
    ),
    citation: 'MMC Act, 1888 · Section 149',
  },
  {
    label: 'YOUR SITUATION',
    content: (
      <>
        The notice was served on 18 March 2026. You have a{' '}
        <strong style={{ color: '#1A1916' }}>30-day window</strong> to pay before recovery action
        begins. BMC can legally attach your property if you don&apos;t respond. This is a standard
        first-stage notice — no court proceedings have started yet.
      </>
    ),
  },
  {
    label: 'WHAT YOU MUST DO',
    content: (
      <>
        Pay the outstanding ₹32,480 via the BMC portal (mcgm.gov.in) or at the H/West Ward Office.
        Always quote reference number{' '}
        <strong style={{ color: '#1A1916' }}>BMC/H-West/2026/0341</strong> and save your payment
        receipt. If you believe the amount is incorrect, you can file an objection with the Ward
        Officer in writing before the deadline.
      </>
    ),
  },
];

// Rebuilds the same Zone[] shape from a live/demo LokAIResponse so the
// example's layout and the real interpretation are visually identical —
// only the source of the content changes.
function zonesFromInterpretation(response: LokAIResponse): Zone[] {
  return [
    { label: response.zone1.label, content: response.zone1.finding, citation: response.citations[0] },
    { label: response.zone2.label, content: response.zone2.analysis },
    {
      label: response.zone3.label,
      content: (
        <>
          {response.zone3.steps.map((step, i) => (
            <div key={i} style={{ marginBottom: i < response.zone3.steps.length - 1 ? '6px' : 0 }}>
              {i + 1}. {step}
            </div>
          ))}
        </>
      ),
    },
  ];
}

function copyTextFromInterpretation(response: LokAIResponse): string {
  return [
    `NOTICE SUMMARY — ${response.title}`,
    '',
    `${response.zone1.label}:`,
    response.zone1.finding,
    '',
    `${response.zone2.label}:`,
    response.zone2.analysis,
    '',
    `${response.zone3.label}:`,
    ...response.zone3.steps.map((step, i) => `${i + 1}. ${step}`),
    '',
    response.citations.length > 0 ? `RELEVANT LAW: ${response.citations.join(', ')}` : '',
    '',
    '⚠ This summary is provided for legal information only. Consult a lawyer before taking action.',
  ].filter(Boolean).join('\n');
}

const EXAMPLE_COPY_TEXT = [
  'NOTICE SUMMARY — BMC Property Tax Demand 2025-26',
  '',
  'WHAT THIS SAYS:',
  'This is a property tax demand notice from the Brihanmumbai Municipal Corporation (BMC). You owe ₹32,480 in unpaid property tax for FY 2025–26.',
  '',
  'YOUR SITUATION:',
  'Notice date: 18 March 2026. You have a 30-day window (by 15 April 2026) to pay before recovery action begins.',
  '',
  'WHAT YOU MUST DO:',
  '1. Pay ₹32,480 via the BMC portal (mcgm.gov.in) or at the H/West Ward Office.',
  '2. Always quote reference number BMC/H-West/2026/0341.',
  '3. Save your payment receipt.',
  '4. If you believe the amount is incorrect, file an objection in writing before the deadline.',
  '',
  'RELEVANT LAW: MMC Act, 1888 · Section 149',
  '',
  '⚠ This summary is provided for legal information only. Consult a lawyer before taking action.',
].join('\n');

// ─── Right panel — "What This Means" ─────────────────────────────────────────
function InterpretationColumn({ parsedText, interpretation }: { parsedText: string | null; interpretation: LokAIResponse | null }) {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(0);
  const [copied, setCopied] = useState(false);

  const isInterpreting = !!parsedText && !interpretation;
  const zones = interpretation ? zonesFromInterpretation(interpretation) : EXAMPLE_ZONES;
  const COPY_TEXT = interpretation ? copyTextFromInterpretation(interpretation) : EXAMPLE_COPY_TEXT;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(COPY_TEXT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Stagger zone reveals — 0ms, 220ms, 440ms after mount, and again whenever
  // a real interpretation replaces the example so the transition gets the
  // same reveal instead of the new content just snapping in.
  useEffect(() => {
    setRevealed(0);
    const timers = [0, 220, 440].map((delay, i) =>
      setTimeout(() => setRevealed(r => Math.max(r, i + 1)), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [interpretation]);

  return (
    <div style={{ flex: 45, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <ColLabel>What This Means</ColLabel>

      {/* Interpretation card */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8E4DC',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '14px',
        flex: 1,
        display: 'flex', flexDirection: 'column',
        boxShadow: SHADOW.md,
      }}>
        {/* Zones — staggered reveal, or a plain loading state between upload and interpretation */}
        <div style={{ flex: 1 }}>
          {isInterpreting && (
            <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontFamily: SANS, fontSize: '13px', color: C.muted }}>
                Interpreting your document…
              </span>
            </div>
          )}
          {!isInterpreting && zones.map((zone, i) => (
            <AnimatePresence key={zone.label}>
              {i < revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div>
                    <div style={{ padding: '20px 24px' }}>
                      <ZoneLabel>{zone.label}</ZoneLabel>
                      <div style={{ fontFamily: SANS, fontSize: '15px', fontWeight: 400, color: '#4A4840', lineHeight: 1.75 }}>
                        {zone.content}
                        {zone.citation && <CitationChip text={zone.citation} />}
                      </div>
                      {/* Urgency card appears after WHAT YOU MUST DO zone */}
                      {zone.label === 'WHAT YOU MUST DO' && <UrgencyCard />}
                    </div>
                    {i < zones.length - 1 && (
                      <div style={{ height: '1px', background: '#E8E4DC', margin: '0 24px' }} />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Footer row */}
        <div style={{
          padding: '10px 24px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid #F0EDE8',
        }}>
          <span style={{ fontFamily: SANS, fontSize: '11px', color: '#8A8880' }}>
            {interpretation ? 'Interpreted just now' : 'Example interpretation'}
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={handleCopy}
              style={{
                fontFamily: SANS, fontSize: '11px', fontWeight: 500,
                color: copied ? C.green : C.navy, background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Thumbs feedback */}
        <FeedbackRow />
      </div>

      {/* Action area — Guided Clipboard (no direct-send) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
        {/* PRIMARY: Copy guidance to clipboard — human reviews before any action */}
        <button
          onClick={handleCopy}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: copied ? '#1F6B3A' : C.navy,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontFamily: SANS,
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s ease',
          }}
        >
          {copied ? '✓ Copied to clipboard' : 'Copy Notice Summary'}
        </button>
        {/* SECONDARY: Ask a follow-up — routes to chat, not a direct send */}
        <button
          onClick={() => navigate('/desktop/chat')}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: 'transparent',
            color: C.navy,
            border: `1.5px solid ${C.navy}`,
            borderRadius: '8px',
            fontFamily: SANS,
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          Ask a follow-up question
        </button>
      </div>

      {/* Hallucination disclaimer — explicit, calm, not hidden */}
      <div style={{
        background: '#FFF8F0',
        border: '1px solid rgba(233,133,43,0.24)',
        borderLeft: `3px solid ${C.saffron}`,
        borderRadius: '0 10px 10px 0',
        padding: '12px 14px',
        marginBottom: '14px',
      }}>
        <p style={{
          fontFamily: SANS, fontSize: '12px', fontWeight: 600,
          color: C.amber, margin: '0 0 4px',
        }}>
          Review before acting
        </p>
        <p style={{
          fontFamily: SANS, fontSize: '12px', color: C.inkSoft, lineHeight: 1.55, margin: 0,
        }}>
          LokAI can misread amounts or deadlines in scanned documents. Always check the original notice
          before paying or responding. This is legal information, not legal advice.
        </p>
      </div>

      {/* Disclaimer */}
      <p style={{ fontFamily: SANS, fontSize: '11px', color: '#8A8880', lineHeight: 1.6, margin: 0 }}>
        LokAI provides legal information, not legal advice. Consult a lawyer before taking action.
      </p>
    </div>
  );
}

// ─── Notice Page ───────────────────────────────────────────────────────────────
export default function Notice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [parsedText, setParsedText] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<LokAIResponse | null>(null);
  const [noticeStatus, setNoticeStatus] = useState<{
    tone: 'idle' | 'success' | 'error';
    message: string;
  }>({ tone: 'idle', message: 'Upload any government or legal notice. LokAI will extract the text and keep the next step calm.' });

  // Until an upload succeeds, both panels show the worked BMC example so the
  // interaction pattern is visible before anyone uploads anything. The moment
  // real text exists, both panels switch to it — previously they never did,
  // so the upload's only visible effect was a one-line text preview in the
  // status banner while the rest of the page stayed frozen on the example.
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setNoticeStatus({ tone: 'idle', message: 'Reading the notice. This may take a moment.' });
    try {
      const ocr = await callSarvamOCR(file);
      setParsedText(ocr.data);
      setNoticeStatus({
        tone: 'success',
        // Demo mode fires for two different reasons — no key configured, or a
        // real request that failed (confirmed: it's the latter against the
        // live Sarvam endpoint right now, a 404). Don't claim a specific
        // cause the code can't actually verify; state the fact plainly.
        message: ocr.mode === 'demo'
          ? "Text extracted (demo — live OCR unavailable right now). Here's how LokAI would interpret it."
          : 'Text extracted. Review the summary, then ask a follow-up if anything looks unclear.',
      });

      const result = await callLokAIDetailed([
        { role: 'user', content: `Interpret this legal notice for the recipient:\n\n${ocr.data}` },
      ]);
      setInterpretation(result.data);
    } catch (err) {
      console.error('OCR failed:', err);
      setNoticeStatus({ tone: 'error', message: 'LokAI could not read this clearly. Upload a sharper image or type the notice text into chat.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: '#F5F2EC', overflow: 'hidden',
    }}>
      <style>{NOTICE_CSS}</style>

      <div className="notice-scroll" style={{ flex: 1, overflowY: 'auto', padding: '36px 44px 48px' }}>

        {/* ── Top bar: breadcrumb + upload button ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '28px',
        }}>
          <span style={{ fontFamily: SANS, fontSize: '12px', color: '#8A8880' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
            <span style={{ margin: '0 6px' }}>/</span>
            <span style={{ color: '#1A1916', fontWeight: 500 }}>Notice Interpreter</span>
          </span>
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              accept="image/*,application/pdf"
            />
            <Btn variant="secondary" size="sm" style={{ fontWeight: 500, borderRadius: '10px', padding: '10px 20px', fontSize: '14px' }} disabled={loading}>
              <Upload style={{ width: '16px', height: '16px' }} />
              {loading ? 'Processing...' : 'Upload Notice'}
            </Btn>
          </div>
        </div>

        {/* ── Page heading ── */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontFamily: SERIF, fontSize: '26px', fontWeight: 400,
            color: '#1A1916', margin: '0 0 6px', letterSpacing: '-0.2px',
          }}>
            Notice Interpreter
          </h1>
          <p style={{ fontFamily: SANS, fontSize: '13px', color: '#8A8880', margin: 0 }}>
            Upload any government or legal notice — LokAI reads and explains it in plain language.
          </p>
        </div>

        <div style={{
          background: noticeStatus.tone === 'error' ? '#FFF5F2' : noticeStatus.tone === 'success' ? '#F1F8F3' : '#FFF8F0',
          border: noticeStatus.tone === 'error' ? '1px solid rgba(184,54,28,0.22)' : noticeStatus.tone === 'success' ? '1px solid rgba(31,107,58,0.20)' : '1px solid rgba(233,133,43,0.24)',
          borderLeft: noticeStatus.tone === 'error' ? `3px solid ${C.red}` : noticeStatus.tone === 'success' ? `3px solid ${C.green}` : `3px solid ${C.saffron}`,
          borderRadius: '0 10px 10px 0',
          padding: '12px 14px',
          marginBottom: '22px',
        }}>
          <p style={{
            fontFamily: SANS,
            fontSize: '13px',
            color: noticeStatus.tone === 'error' ? C.red : noticeStatus.tone === 'success' ? C.green : C.amber,
            lineHeight: 1.55,
            margin: 0,
          }}>
            {noticeStatus.message}
          </p>
          {parsedText && (
            <p style={{ fontFamily: SANS, fontSize: '12px', color: C.muted, lineHeight: 1.55, margin: '6px 0 0' }}>
              Extracted preview: {parsedText.slice(0, 160)}{parsedText.length > 160 ? '...' : ''}
            </p>
          )}
        </div>

        {/* ── Two-panel layout: left ~55%, right ~45% ── */}
        <div style={{ display: 'flex', gap: '28px', alignItems: 'stretch' }}>
          <OriginalNoticeColumn parsedText={parsedText} />
          <InterpretationColumn parsedText={parsedText} interpretation={interpretation} />
        </div>
      </div>
    </main>
  );
}
