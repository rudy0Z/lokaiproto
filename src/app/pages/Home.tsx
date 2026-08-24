import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import {
  EDITORIAL, SANS, MONO, C, GRAD, LAYOUT, S, SHADOW, TYPE,
} from '../components/shared';
import { GuardrailGallery } from '../components/demo/GuardrailGallery';
import { useDemo } from '../context/DemoContext';
import { SCRIPT_RAIL, CONSUMER_EXPLAIN_I18N } from '../data/languagePacks';
import type { DemoLanguage } from '../data/responseTurns';

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
    cursor: pointer;
  }
  .script-chip:hover {
    border-color: ${C.navy};
    color: ${C.navy};
    background: #FFFFFF;
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
  { label: 'Consumer refund example', path: '/desktop/chat/consumer' },
  { label: 'Read a sample notice', path: '/desktop/notice-interpreter' },
  { label: 'See a boundary example', path: '/desktop/chat/out-of-scope' },
];

// ─── Hero Input ───────────────────────────────────────────────────────────────
function HeroInput({ inputRef }: { inputRef?: React.RefObject<HTMLTextAreaElement> }) {
  const navigate  = useNavigate();
  const [val, setVal] = useState('');
  const localRef  = useRef<HTMLTextAreaElement>(null);
  const taRef     = inputRef ?? localRef;

  const send = () => {
    if (val.trim()) {
      navigate('/desktop/chat/consumer', { state: { initialQuestion: val.trim() } });
    }
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
      borderRadius: LAYOUT.radius.plane,
      boxShadow: SHADOW.float,
      padding: '16px 16px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>

        {/* Mic */}
        <button
          onClick={() => setVal('I bought a damaged mixer grinder for ₹8,999 and the seller refused a replacement.')}
          aria-label="Use prepared voice example"
          style={{
            width: '42px', height: '42px', borderRadius: LAYOUT.radius.full,
            background: '#F4F0E8', border: `1px solid ${C.border}`, cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '2px',
            transition: 'transform 0.1s ease, box-shadow 0.12s ease',
            boxShadow: SHADOW.inset,
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
            fontFamily: SANS, fontSize: TYPE.lead.size, lineHeight: 1.55,
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
              width: '42px', height: '42px', borderRadius: LAYOUT.radius.full,
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
            onClick={() => navigate('/desktop/notice-interpreter')}
            aria-label="Use the prepared notice"
            style={{
              height: '30px', borderRadius: LAYOUT.radius.pill,
              background: C.surface2, border: `1px solid ${C.border}`, cursor: 'pointer',
              padding: '0 11px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.inkSoft, gap: '6px',
            }}
          >
            <Paperclip size={15} />
            <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, fontWeight: 500 }}>Sample notice</span>
          </button>
        </div>
        <span style={{ fontFamily: MONO, fontSize: TYPE.label.size, color: C.muted, whiteSpace: 'nowrap' }}>Prototype source trail</span>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate  = useNavigate();
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const { setLanguage, runPreparedInput } = useDemo();
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

  const openScript = async (id: DemoLanguage) => {
    setLanguage(id);
    const prompt = CONSUMER_EXPLAIN_I18N[id].userPrompt;
    navigate('/desktop/chat/consumer', { state: { initialQuestion: prompt } });
    void runPreparedInput(prompt);
  };

  return (
    <div className="home-hero-bg" style={{
      minHeight: '68vh',
      boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: `${S[8]} ${S[7]}`,
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
          fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: C.navy,
          background: 'rgba(255,255,255,0.62)',
          border: '1px solid rgba(16,42,76,0.12)',
          borderRadius: LAYOUT.radius.pill, padding: '7px 16px',
          marginBottom: '24px',
          boxShadow: SHADOW.insetSoft,
        }}>
          <span className="status-dot" style={{
            width: '6px', height: '6px', borderRadius: LAYOUT.radius.full,
            background: C.saffron, flexShrink: 0, display: 'inline-block',
          }} />
          Prepared legal guidance demo
        </div>

        {/* Heading group */}
        <div className="hero-heading" style={{ width: '100%' }}>
          <p style={{
            fontFamily: SANS, fontSize: TYPE.title.size, fontWeight: 400,
            color: C.muted, margin: '0 0 10px', textAlign: 'center',
          }}>
            {greet}, Priya
          </p>
          <h1 style={{
            fontFamily: EDITORIAL, fontWeight: 300, fontStyle: 'normal',
            fontSize: 'clamp(46px, 6vw, 76px)', lineHeight: 0.98, letterSpacing: '-0.035em',
            color: C.ink, margin: '0 0 10px', textAlign: 'center',
          }}>
            Understand one legal step at a time.
          </h1>
        </div>

        {/* Subhead */}
        <p className="hero-sub" style={{
          fontFamily: SANS, fontSize: TYPE.title.size, fontWeight: 400,
          color: C.inkSoft, margin: '0 0 34px', lineHeight: 1.7, maxWidth: '520px',
        }}>
          Explore a prepared consumer-refund matter, inspect the source basis, and see when LokAI asks for a check or stops.
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
                  fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 500,
                  color: C.inkSoft,
                  background: 'rgba(255,255,255,0.75)',
                  border: `1px solid ${C.border}`,
                  borderRadius: LAYOUT.radius.pill, padding: '6px 16px',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          {/* Keyboard hint */}
          <p style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Press <span className="kbd">⌘ K</span> to focus
          </p>
          <div className="script-rail" role="group" aria-label="Prepared language packs">
            {SCRIPT_RAIL.map((s) => (
              <button
                key={s.id}
                type="button"
                className="script-chip"
                onClick={() => void openScript(s.id)}
                style={{ cursor: 'pointer' }}
              >
                {s.native}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
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
        fontSize: TYPE.small.size, color: C.muted, margin: 0, letterSpacing: '0.01em',
      }}>
        Built with respect for Indian jurisprudence.
      </p>
      <p style={{
        fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted, margin: '8px 0 0',
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
        <div style={{ padding: `${S[7]} ${S[7]} 0` }}>
          <div style={{ maxWidth: LAYOUT.maxContent, margin: '0 auto' }}>
            <GuardrailGallery />
            <Footer />
          </div>
        </div>

      </div>
    </main>
  );
}
