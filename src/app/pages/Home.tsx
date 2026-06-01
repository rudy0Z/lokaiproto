import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, ArrowRight, ChevronRight, Mic } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  EDITORIAL, SANS, MONO, C, GRAD, SHADOW, CARD, LAYOUT, S, TYPE,
} from '../components/shared';
import { CitationStamp } from '../components/ui/CitationStamp';

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  /* Hero gradient — Sarvam-like Indian AI aura, softened for legal trust */
  .home-hero-bg {
    background: ${GRAD.heroCanvas};
    position: relative;
    overflow: hidden;
  }

  .home-hero-bg::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.30;
    background-image:
      linear-gradient(rgba(16,42,76,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(16,42,76,0.05) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(ellipse 60% 55% at 50% 52%, black 0%, transparent 72%);
  }

  .lokai-floret {
    width: 76px;
    height: 26px;
    opacity: 0.68;
    margin-bottom: 18px;
    color: ${C.navy};
  }

  .script-rail {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 18px;
  }

  .script-chip {
    font-family: ${SANS};
    font-size: 11px;
    color: rgba(24,23,19,0.58);
    background: rgba(255,255,255,0.50);
    border: 1px solid rgba(16,42,76,0.08);
    border-radius: 999px;
    padding: 4px 10px;
    backdrop-filter: blur(10px);
  }

  /* Scrollbar */
  .home-scroll::-webkit-scrollbar { width: 4px; }
  .home-scroll::-webkit-scrollbar-track { background: transparent; }
  .home-scroll::-webkit-scrollbar-thumb { background: #D8D4CC; border-radius: 2px; }

  /* Hero textarea */
  .hero-textarea { resize: none; min-height: 48px; max-height: 180px; overflow-y: auto; }
  .hero-textarea::placeholder { color: #A8A4A0; }
  .hero-input-wrap { transition: border-color 0.15s ease, box-shadow 0.18s ease; }
  .hero-input-wrap:focus-within {
    border-color: ${C.navy} !important;
    box-shadow: 0 0 0 4px rgba(16,42,76,0.09), 0 18px 44px rgba(26,25,22,0.13) !important;
  }

  .composer-tools {
    border-top: 1px solid ${C.border};
    margin-top: 10px;
    padding-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  /* Card hover — GPU-composited, specific properties only */
  .matter-card {
    transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s ease;
    cursor: pointer; will-change: transform;
  }
  .matter-card:hover { transform: translateY(-3px); box-shadow: 0 14px 34px rgba(26,25,22,0.11) !important; }
  .matter-card:active { transform: translateY(-1px); }

  .notice-card {
    transition: transform 0.16s cubic-bezier(0.22,1,0.36,1), box-shadow 0.16s ease;
    cursor: pointer; will-change: transform;
  }
  .notice-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(26,25,22,0.10) !important; }

  .right-item { transition: background 0.12s ease, transform 0.12s ease; cursor: pointer; }
  .right-item:hover { background: rgba(19,40,70,0.04) !important; transform: translateX(2px); }

  /* Quick chips — specific properties only, never transition: all */
  .quick-chip {
    transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease,
                transform 0.1s ease, box-shadow 0.12s ease;
  }
  .quick-chip:hover {
    background: #FFFFFF !important; border-color: ${C.navy} !important;
    color: ${C.navy} !important; transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(26,25,22,0.08) !important;
  }
  .quick-chip:active { transform: scale(0.97); }

  /* Focus rings — visible, branded */
  :focus-visible {
    outline: 2px solid ${C.saffron};
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* Notices scroll */
  .notices-row {
    display: flex; gap: 12px;
    overflow-x: auto; padding-bottom: 4px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  .notices-row::-webkit-scrollbar { height: 2px; }
  .notices-row::-webkit-scrollbar-thumb { background: #D8D4CC; border-radius: 2px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Hero entrance — per-element stagger */
  .hero-chip    { animation: fadeUp 0.38s 0.05s cubic-bezier(0.22,1,0.36,1) both; }
  .hero-heading { animation: fadeUp 0.44s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
  .hero-sub     { animation: fadeUp 0.40s 0.22s cubic-bezier(0.22,1,0.36,1) both; }
  .hero-input   { animation: fadeUp 0.42s 0.30s cubic-bezier(0.22,1,0.36,1) both; }
  .hero-chips   { animation: fadeUp 0.38s 0.42s cubic-bezier(0.22,1,0.36,1) both; }

  /* Pulse for status dot */
  @keyframes statusPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(31,107,58,0.5); }
    50%       { box-shadow: 0 0 0 4px rgba(31,107,58,0); }
  }
  .status-dot { animation: statusPulse 2.4s ease-in-out infinite; }

  /* Keyboard shortcut hint */
  .kbd {
    display: inline-flex; align-items: center; justify-content: center;
    fontFamily: ${MONO}; font-size: 10px; font-weight: 500;
    padding: 2px 5px; border-radius: 4px;
    background: rgba(26,25,22,0.06); border: 1px solid rgba(26,25,22,0.12);
    color: ${C.muted}; line-height: 1;
  }

  /* Reduced-motion: kill all animations & transitions */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Quick chips ──────────────────────────────────────────────────────────────
const CHIPS = [
  { label: 'Tenancy issue',      path: '/desktop/chat/deposit' },
  { label: 'File an RTI',        path: '/desktop/chat/rti'     },
  { label: 'Consumer complaint', path: '/desktop/chat/consumer' },
  { label: 'Read a notice',      path: '/desktop/notice-interpreter' },
  { label: 'Boundary example',   path: '/desktop/chat/out-of-scope' },
];

// ─── Hero Input ───────────────────────────────────────────────────────────────
function HeroInput({ inputRef }: { inputRef?: React.RefObject<HTMLTextAreaElement> }) {
  const navigate  = useNavigate();
  const [val, setVal] = useState('');
  const localRef  = useRef<HTMLTextAreaElement>(null);
  const taRef     = inputRef ?? localRef;

  const send = () => {
    if (val.trim()) navigate('/desktop/chat/deposit');
  };

  const autoGrow = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const canSend = val.trim().length > 0;

  return (
    <div className="hero-input-wrap" style={{
      background: '#FFFFFF',
      border: `1px solid ${C.borderStrong}`,
      borderRadius: '22px',
      boxShadow: '0 22px 54px rgba(26,25,22,0.12), 0 2px 8px rgba(26,25,22,0.06)',
      padding: '16px 16px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>

        {/* Mic */}
        <button
          aria-label="Use voice input"
          style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: '#F4F0E8', border: `1px solid ${C.border}`, cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '2px',
            transition: 'transform 0.1s ease, box-shadow 0.12s ease',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(16,42,76,0.12)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.8)'; }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect x="5" y="0.5" width="6" height="9.5" rx="3" stroke={C.navy} strokeWidth="1.2"/>
            <path d="M2.5 7.5C2.5 10.8 5 13.5 8 13.5s5.5-2.7 5.5-6" stroke={C.navy} strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="8" y1="13.5" x2="8" y2="16" stroke={C.navy} strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Textarea */}
        <textarea
          ref={taRef}
          className="hero-textarea"
          value={val}
          onChange={e => { setVal(e.target.value); autoGrow(); }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Tell us your legal issue — in any language"
          rows={1}
          aria-label="Describe your legal issue"
          style={{
            flex: 1, border: 'none', outline: 'none', resize: 'none',
            fontFamily: SANS, fontSize: '17px', lineHeight: 1.55,
            background: 'transparent', color: C.ink, paddingTop: '9px',
          }}
        />

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', paddingTop: '6px', flexShrink: 0 }}>
          <button
            onClick={send}
            aria-label="Send message"
            disabled={!canSend}
            style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: canSend ? C.navy : '#DAD4CB',
              border: 'none', cursor: canSend ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s ease, transform 0.1s ease',
              boxShadow: canSend ? '0 8px 18px rgba(16,42,76,0.26)' : 'none',
            }}
            onMouseDown={e => { if (canSend) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)'; }}
            onMouseUp={e   => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            <ArrowRight size={17} color="#FFFFFF" />
          </button>
        </div>
      </div>
      <div className="composer-tools">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            aria-label="Attach a legal notice"
            style={{
              height: '30px', borderRadius: '999px',
              background: '#FAF8F3', border: `1px solid ${C.border}`, cursor: 'pointer',
              padding: '0 11px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.inkSoft, gap: '6px',
            }}
          >
            <Paperclip size={15} />
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500 }}>Notice</span>
          </button>
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>RTI</span>
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>Tenancy</span>
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>Consumer</span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, whiteSpace: 'nowrap' }}>Prototype source trail</span>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate  = useNavigate();
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const now       = new Date();
  const hour      = now.getHours();
  const greet     = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // ⌘K / Ctrl+K focuses the composer from anywhere on the home page
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="home-hero-bg" style={{
      minHeight: '84vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: `${S[9]} ${S[7]}`,
    }}>
      {/* No wrapper animation — each child staggers independently */}
      <div style={{
        width: '100%', maxWidth: '760px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>

        <svg className="lokai-floret" viewBox="0 0 152 52" fill="none" aria-hidden="true">
          <path d="M16 26H58M94 26H136" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".35"/>
          <path d="M76 8C82 17 82 35 76 44C70 35 70 17 76 8Z" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M59 26C65 18 87 18 93 26C87 34 65 34 59 26Z" stroke="currentColor" strokeWidth="1.4"/>
          <circle cx="76" cy="26" r="3" fill="currentColor" opacity=".48"/>
        </svg>

        {/* Status chip — pulsing green dot */}
        <div className="hero-chip" style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          fontFamily: SANS, fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: C.navy,
          background: 'rgba(255,255,255,0.62)',
          border: '1px solid rgba(16,42,76,0.12)',
          borderRadius: '999px', padding: '7px 16px',
          marginBottom: '24px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
        }}>
          <span className="status-dot" style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: C.saffron, flexShrink: 0, display: 'inline-block',
          }} />
          India-first legal clarity
        </div>

        {/* Heading group */}
        <div className="hero-heading" style={{ width: '100%' }}>
          <p style={{
            fontFamily: SANS, fontSize: '15px', fontWeight: 400,
            color: C.muted, margin: '0 0 10px', textAlign: 'center',
          }}>
            {greet}, Priya
          </p>
          <h1 style={{
            fontFamily: EDITORIAL, fontWeight: 300, fontStyle: 'normal',
            fontSize: 'clamp(46px, 6vw, 76px)', lineHeight: 0.98, letterSpacing: '-0.035em',
            color: C.ink, margin: '0 0 10px', textAlign: 'center',
          }}>
            Your law, in your language.
          </h1>
        </div>

        {/* Subhead */}
        <p className="hero-sub" style={{
          fontFamily: SANS, fontSize: '15px', fontWeight: 400,
          color: C.inkSoft, margin: '0 0 34px', lineHeight: 1.7, maxWidth: '520px',
        }}>
          Explain notices, understand rights, and draft first actions with cited Indian legal sources.
        </p>

        {/* Input */}
        <div className="hero-input" style={{ width: '100%', marginBottom: '20px' }}>
          <HeroInput inputRef={inputRef} />
        </div>

        {/* Quick chips + keyboard hint */}
        <div className="hero-chips" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {CHIPS.map(c => (
              <button
                key={c.label}
                className="quick-chip"
                onClick={() => navigate(c.path)}
                style={{
                  fontFamily: SANS, fontSize: '13px', fontWeight: 500,
                  color: C.inkSoft,
                  background: 'rgba(255,255,255,0.75)',
                  border: `1px solid ${C.border}`,
                  borderRadius: '999px', padding: '6px 16px',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          {/* Keyboard hint */}
          <p style={{ fontFamily: SANS, fontSize: '11px', color: C.muted, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Press <span className="kbd">⌘ K</span> to focus
          </p>
          <div className="script-rail" aria-hidden="true">
            <span className="script-chip">हिन्दी</span>
            <span className="script-chip">मराठी</span>
            <span className="script-chip">தமிழ்</span>
            <span className="script-chip">বাংলা</span>
            <span className="script-chip">English</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHead({ label, meta, action, spectrumRule = false }: {
  label: string; meta?: string; action?: { text: string; path?: string }; spectrumRule?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div style={{ marginBottom: '20px' }}>
      {spectrumRule && (
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, #E9852B 0%, #F5D8D4 28%, #DDE7FF 58%, #102A4C 100%)',
          borderRadius: '999px', marginBottom: '16px', opacity: 0.85,
        }} />
      )}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        borderBottom: spectrumRule ? 'none' : `1px solid ${C.border}`,
        paddingBottom: spectrumRule ? '0' : '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontFamily: SANS, fontSize: '11px', fontWeight: 600,
            color: C.muted, letterSpacing: '0.09em', textTransform: 'uppercase',
          }}>
            {label}
          </span>
          {meta && (
            <span style={{ fontFamily: MONO, fontSize: '11px', color: C.muted }}>
              {meta}
            </span>
          )}
        </div>
        {action && (
          <button
            onClick={() => action.path && navigate(action.path)}
            style={{
              fontFamily: SANS, fontSize: '13px', fontWeight: 500,
              color: C.navy, background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            {action.text}
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Matter data ──────────────────────────────────────────────────────────────
const MATTERS = [
  {
    id: 'rti', topicLabel: 'RTI', topicColor: C.navy,
    issue: 'BMC RTI — Building Permit',
    status: 'Action Required', statusColor: '#E8832A', statusBg: 'rgba(232,131,42,0.10)', statusBorder: 'rgba(232,131,42,0.25)',
    finding: 'The PIO is in statutory default — you have the right to file a first appeal.',
    nextStep: 'File First Appeal with FAA at the Ward Office',
    date: 'Mar 15', citation: 'RTI Act 2005 · s.7(1)', path: '/desktop/chat/rti',
    accentColor: '#E8832A',
  },
  {
    id: 'deposit', topicLabel: 'Tenancy', topicColor: C.navy,
    issue: 'Security Deposit — ₹40,000',
    status: 'In Progress', statusColor: C.navy, statusBg: 'rgba(19,40,70,0.08)', statusBorder: 'rgba(19,40,70,0.18)',
    finding: 'Landlord is 35 days past the legal deadline with no written damage claim on file.',
    nextStep: 'Await the 15-day response window to your demand notice',
    date: 'Mar 18', citation: 'MRC Act 1999 · s.24', path: '/desktop/chat/deposit',
    accentColor: C.navy,
  },
  {
    id: 'consumer', topicLabel: 'Consumer', topicColor: C.navy,
    issue: 'Consumer Complaint — Mobile Phone',
    status: 'Ready to File', statusColor: C.green, statusBg: 'rgba(31,107,58,0.08)', statusBorder: 'rgba(31,107,58,0.20)',
    finding: 'Defective product confirmed — seller refused replacement without legal cause.',
    nextStep: 'File complaint at the District Consumer Commission',
    date: 'Mar 10', citation: 'Consumer Protection Act · s.35', path: '/desktop/chat/consumer',
    accentColor: C.green,
  },
];

function MatterCard({ m }: { m: typeof MATTERS[0] }) {
  const navigate = useNavigate();
  return (
    <div
      className="matter-card"
      onClick={() => navigate(m.path)}
      style={{
        background: GRAD.cardLift,
        border: `1px solid ${C.border}`,
        borderTop: `3px solid ${m.accentColor}`,
        borderRadius: '14px',
        boxShadow: '0 1px 3px rgba(26,25,22,0.035), 0 10px 26px rgba(26,25,22,0.055)',
        padding: '18px 20px 20px',
        display: 'flex', flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{
          fontFamily: SANS, fontSize: '10px', fontWeight: 700,
          color: C.navy, background: 'rgba(19,40,70,0.08)',
          border: '1px solid rgba(19,40,70,0.14)', borderRadius: '4px',
          padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {m.topicLabel}
        </span>
        <span style={{
          fontFamily: SANS, fontSize: '11px', fontWeight: 500,
          color: m.statusColor, background: m.statusBg,
          border: `1px solid ${m.statusBorder}`,
          borderRadius: '4px', padding: '2px 9px',
        }}>
          {m.status}
        </span>
      </div>

      {/* Title */}
      <p style={{
        fontFamily: SANS, fontSize: '14px', fontWeight: 600,
        color: C.ink, lineHeight: 1.35, margin: '0 0 8px',
      }}>
        {m.issue}
      </p>

      {/* Finding */}
      <p style={{
        fontFamily: SANS, fontSize: '13px', color: C.inkSoft,
        lineHeight: 1.6, margin: '0 0 14px', flex: 1,
      }}>
        {m.finding}
      </p>

      {/* Citation */}
      <div style={{ marginBottom: '12px' }}>
        <CitationStamp text={m.citation} />
      </div>

      {/* Next step */}
      <div style={{
        background: 'rgba(255,255,255,0.58)', borderRadius: '10px',
        padding: '9px 12px', marginBottom: '14px',
        border: `1px solid ${C.border}`,
      }}>
        <p style={{
          fontFamily: SANS, fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em',
          textTransform: 'uppercase', color: C.muted, margin: '0 0 3px',
        }}>
          Next step
        </p>
        <p style={{ fontFamily: SANS, fontSize: '12px', color: C.inkSoft, lineHeight: 1.5, margin: 0 }}>
          {m.nextStep}
        </p>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: MONO, fontSize: '10px', color: C.muted }}>{m.date}</span>
        <button
          onClick={e => { e.stopPropagation(); navigate(m.path); }}
          style={{
            fontFamily: SANS, fontSize: '12px', fontWeight: 600,
            color: '#FFFFFF', background: C.navy,
            border: 'none', borderRadius: '6px', padding: '5px 12px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          Continue <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

function MattersSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: '64px' }}
    >
      <SectionHead
        label="Active Matters"
        action={{ text: 'See all', path: '/desktop/chat' }}
        spectrumRule
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', alignItems: 'stretch' }}>
        {MATTERS.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <MatterCard m={m} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Notices ──────────────────────────────────────────────────────────────────
const NOTICES = [
  {
    id: 1, tag: 'Municipal',
    title: 'Property Tax Deadline Extended',
    summary: 'BMC extends property tax payment deadline to 31 March for all residential properties in Mumbai.',
    date: 'Mar 15',
  },
  {
    id: 2, tag: 'Consumer',
    title: 'New E-Commerce Return Policy',
    summary: 'Ministry updates mandatory refund timelines for all registered e-commerce platforms.',
    date: 'Mar 14',
  },
  {
    id: 3, tag: 'Court',
    title: 'Bombay HC Holiday Schedule',
    summary: 'Revised court calendar issued for Holi and Gudi Padwa observances in March 2026.',
    date: 'Mar 12',
  },
  {
    id: 4, tag: 'Labour',
    title: 'PF Withdrawal Rule Update',
    summary: 'EPFO revises partial withdrawal conditions for housing and medical emergencies.',
    date: 'Mar 10',
  },
];

const TAG_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  Municipal: { text: '#8A4500',  bg: 'rgba(138,69,0,0.08)',  border: 'rgba(138,69,0,0.18)'  },
  Consumer:  { text: C.navy,    bg: 'rgba(19,40,70,0.07)',  border: 'rgba(19,40,70,0.16)'  },
  Court:     { text: C.oxblood, bg: 'rgba(107,31,31,0.07)', border: 'rgba(107,31,31,0.18)' },
  Labour:    { text: C.green,   bg: 'rgba(31,107,58,0.07)', border: 'rgba(31,107,58,0.18)' },
};

function NoticeCard({ n }: { n: typeof NOTICES[0] }) {
  const tc = TAG_COLOR[n.tag] || { text: C.navy, bg: 'rgba(19,40,70,0.07)', border: 'rgba(19,40,70,0.16)' };
  return (
    <div className="notice-card" style={{
      ...CARD.base,
      padding: '16px 18px',
      flex: '0 0 248px',
      scrollSnapAlign: 'start',
      display: 'flex', flexDirection: 'column',
      minHeight: '148px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{
          fontFamily: SANS, fontSize: '10px', fontWeight: 700,
          color: tc.text, background: tc.bg, border: `1px solid ${tc.border}`,
          borderRadius: '4px', padding: '2px 8px',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {n.tag}
        </span>
        <span style={{ fontFamily: MONO, fontSize: '10px', color: C.muted }}>{n.date}</span>
      </div>

      <p style={{
        fontFamily: SANS, fontSize: '13px', fontWeight: 600,
        color: C.ink, lineHeight: 1.35, margin: '0 0 7px',
      }}>
        {n.title}
      </p>

      <p style={{
        fontFamily: SANS, fontSize: '12px', color: C.inkSoft,
        lineHeight: 1.6, flex: 1, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      } as React.CSSProperties}>
        {n.summary}
      </p>
    </div>
  );
}

function NoticesSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: '64px' }}
    >
      <SectionHead
        label="Notices in Your Area"
        meta="Mumbai · 2 hrs ago"
        action={{ text: 'Notice Interpreter', path: '/desktop/notice-interpreter' }}
      />
      <div style={{ position: 'relative' }}>
        <div className="notices-row">
          {NOTICES.map(n => <NoticeCard key={n.id} n={n} />)}
          {/* Peek card */}
          <div style={{
            flex: '0 0 44px',
            borderRadius: LAYOUT.radius.md,
            border: `1px dashed ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', opacity: 0.5,
          }}>
            <ChevronRight size={15} color={C.muted} />
          </div>
        </div>
        {/* Fade-out gradient on right edge */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 4,
          width: '56px',
          background: `linear-gradient(to right, transparent, ${C.bg})`,
          pointerEvents: 'none',
        }} />
      </div>
    </motion.section>
  );
}

// ─── Know Your Rights ─────────────────────────────────────────────────────────
const RIGHTS = [
  {
    id: 1, label: 'Tenant Rights', count: '14 topics',
    desc: 'Unlawful eviction, arbitrary rent hikes, deposit disputes.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path d="M10 2.5L17 8.5V17H13V12H7V17H3V8.5L10 2.5Z" stroke={C.navy} strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 2, label: 'File an RTI', count: '7 steps',
    desc: 'Step-by-step guide to Right to Information applications.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="2.5" width="12" height="15" rx="1.5" stroke={C.navy} strokeWidth="1.3" />
        <line x1="7" y1="7" x2="13" y2="7" stroke={C.navy} strokeWidth="1" strokeLinecap="round" />
        <line x1="7" y1="10" x2="13" y2="10" stroke={C.navy} strokeWidth="1" strokeLinecap="round" />
        <line x1="7" y1="13" x2="10" y2="13" stroke={C.navy} strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 3, label: 'Consumer Rights', count: '11 topics',
    desc: 'Defective goods, misleading ads, e-commerce disputes.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
        <path d="M5 8h12l-1.5 8H6.5L5 8Z" stroke={C.navy} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M8 8V6a3 3 0 0 1 6 0v2" stroke={C.navy} strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 4, label: 'Workplace Rights', count: '9 topics',
    desc: 'Wages, leave, harassment, and unfair termination.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="7" width="14" height="10" rx="1.5" stroke={C.navy} strokeWidth="1.3" />
        <path d="M7 7V5.5A3 3 0 0 1 13 5.5V7" stroke={C.navy} strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    id: 5, label: 'Land & Property', count: '12 topics',
    desc: 'Land acquisition, property disputes, construction regulations.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path d="M3 17V10L10 4L17 10V17" stroke={C.navy} strokeWidth="1.3" strokeLinejoin="round" />
        <rect x="7.5" y="12" width="5" height="5" rx="0.5" stroke={C.navy} strokeWidth="1.1" />
      </svg>
    ),
  },
  {
    id: 6, label: "Women's Rights", count: '8 topics',
    desc: 'Harassment, dowry, domestic violence, property rights.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7.5" r="4.5" stroke={C.navy} strokeWidth="1.3" />
        <line x1="10" y1="12" x2="10" y2="17" stroke={C.navy} strokeWidth="1.3" strokeLinecap="round" />
        <line x1="7.5" y1="15" x2="12.5" y2="15" stroke={C.navy} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

function RightItem({ r }: { r: typeof RIGHTS[0] }) {
  const navigate = useNavigate();
  return (
    <div
      className="right-item"
      onClick={() => navigate('/desktop/chat')}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '11px 14px',
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: LAYOUT.radius.sm,
      }}
    >
      <div style={{
        width: '28px', height: '28px', borderRadius: '6px',
        background: 'rgba(19,40,70,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {r.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <p style={{ fontFamily: SANS, fontSize: '13px', fontWeight: 600, color: C.ink, margin: 0 }}>
            {r.label}
          </p>
          <span style={{ fontFamily: MONO, fontSize: '10px', color: C.muted }}>
            {r.count}
          </span>
        </div>
        <p style={{
          fontFamily: SANS, fontSize: '11px', color: C.muted, margin: 0, lineHeight: 1.45,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {r.desc}
        </p>
      </div>
      <ChevronRight size={12} color={C.muted} style={{ flexShrink: 0, opacity: 0.5 }} />
    </div>
  );
}

function RightsSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: '72px' }}
    >
      <SectionHead
        label="Know Your Rights"
        action={{ text: 'All topics', path: '/desktop/chat' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {RIGHTS.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -8 : 8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <RightItem r={r} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <div style={{
      textAlign: 'center', padding: `${S[7]} 0 ${S[8]}`,
      borderTop: `1px solid ${C.border}`,
    }}>
      <p style={{
        fontFamily: EDITORIAL, fontStyle: 'italic', fontWeight: 300,
        fontSize: '13px', color: C.muted, margin: 0, letterSpacing: '0.01em',
      }}>
        Built with respect for Indian jurisprudence.
      </p>
      <p style={{
        fontFamily: SANS, fontSize: '11px', color: C.muted, margin: '8px 0 0',
        opacity: 0.7,
      }}>
        LokAI provides legal information, not legal advice.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg, overflow: 'hidden' }}>
      <style>{CSS}</style>

      <div className="home-scroll" style={{ flex: 1, overflowY: 'auto' }}>

        {/* Hero — full width gradient, centered content */}
        <Hero />

        {/* Sections — individually whileInView animated, no wrapper animation needed */}
        <div style={{ padding: `${S[9]} ${S[7]} 0` }}>
          <div style={{ maxWidth: LAYOUT.maxContent, margin: '0 auto' }}>
            <MattersSection />
            <NoticesSection />
            <RightsSection />
            <Footer />
          </div>
        </div>

      </div>
    </main>
  );
}
