import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { C, EDITORIAL, LAYOUT, MONO, PLANE, SANS, SHADOW, TYPE } from '../components/shared';
import { useSidebar } from '../context/SidebarContext';
import { useConversations } from '../context/ConversationContext';
import type { ContextPanel } from '../services/api';
import { LegalTermPanel } from '../components/demo/LegalTerms';
import { GuardrailGallery } from '../components/demo/GuardrailGallery';
import { useDemo } from '../context/DemoContext';
import { Turn, TurnStatus, Composer } from '../components/ai/Turn';
import { toast } from 'sonner';
import type { ResponseTurn } from '../data/responseTurns';
import { DEMO_PROGRESS_STAGES, getTurnById, resolvePreparedTurn } from '../data/responseTurns';
import { localizeConsumerExplain } from '../data/languagePacks';
import { useLokaiSharedStyles } from '../components/shared';

// ─── Animation styles ─────────────────────────────────────────────────────────
const ANIM = `
  @keyframes lokaiDot {
    0%,70%,100%{opacity:.2;transform:translateY(0)}
    35%{opacity:1;transform:translateY(-4px)}
  }
  @keyframes lokaiSpin {
    to{transform:rotate(360deg)}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(8px)}
    to{opacity:1;transform:translateY(0)}
  }
  @keyframes toastIn {
    from{opacity:0;transform:translateX(-50%) translateY(6px)}
    to{opacity:1;transform:translateX(-50%) translateY(0)}
  }
  @keyframes toastOut {
    from{opacity:1;transform:translateX(-50%) translateY(0)}
    to{opacity:0;transform:translateX(-50%) translateY(-4px)}
  }
  .toast-enter{animation:toastIn 0.2s cubic-bezier(0.22,1,0.36,1) both}
  .toast-exit{animation:toastOut 0.18s ease-in both}
  @keyframes lokaiShimmer {
    0%  {background-position:-400px 0}
    100%{background-position: 400px 0}
  }
  @keyframes thinkAccent {
    0%,100%{opacity:1} 50%{opacity:0.35}
  }
  .shimmer-line {
    background: linear-gradient(90deg,#F2EDE6 25%,#E8E2D8 50%,#F2EDE6 75%);
    background-size: 400px 100%;
    animation: lokaiShimmer 1.6s ease-in-out infinite;
    border-radius: 3px;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  :focus-visible {
    outline: 2px solid ${C.saffron};
    outline-offset: 2px;
  }
  .ld1{animation:lokaiDot 1.3s ease-in-out 0s infinite}
  .ld2{animation:lokaiDot 1.3s ease-in-out .18s infinite}
  .ld3{animation:lokaiDot 1.3s ease-in-out .36s infinite}
  .chat-scroll::-webkit-scrollbar{width:4px}
  .chat-scroll::-webkit-scrollbar-track{background:transparent}
  .chat-scroll::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
  .icon-btn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;
    background:none;border:none;cursor:pointer;color:${C.muted};border-radius:6px;
    transition:background .12s,color .12s}
  .icon-btn:hover{background:#F0EDE8;color:${C.navy}}
  .chip-btn{/* prefer lokai-chip from shared — keep class for motion.button mounts */}
  .lokai-chip.chip-btn:hover{background:rgba(16,42,76,0.08)!important;border-color:${C.navy}!important}
  .input-bar-wrap{transition:border-color .15s,box-shadow .18s}
  .input-bar-wrap:focus-within{
    border-color:${C.navy}!important;
    box-shadow:0 0 0 3px rgba(19,40,70,0.09),0 4px 20px rgba(26,25,22,.10)!important;
  }
  .input-bar-wrap {
    background:
      radial-gradient(ellipse 70% 130% at 12% 0%, rgba(221,231,255,0.38), transparent 58%),
      radial-gradient(ellipse 55% 100% at 88% 100%, rgba(255,227,184,0.34), transparent 62%),
      #FFFFFF;
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function now() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/** Map seeded conversation ids to prepared hybrid turns (no legacy AICard path). */
function seedTurnForConversation(convId: string, language: 'en' | 'hi' | 'mr' | 'ta'): ResponseTurn | null {
  if (convId === 'consumer') {
    return language === 'en'
      ? (getTurnById('consumer-explain') ?? null)
      : localizeConsumerExplain(language);
  }
  if (convId === 'out-of-scope') {
    return getTurnById('out-of-scope-stop') ?? getTurnById('boundary-stop') ?? null;
  }
  return resolvePreparedTurn('', { scenarioId: convId === 'consumer' ? 'consumer' : 'boundary', language });
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  const dot: React.CSSProperties = { width:7, height:7, borderRadius: LAYOUT.radius.full, background:C.navy };
  return (
    <div style={{ display:'flex', gap:5, alignItems:'center', padding:'16px 20px' }}>
      <div className="ld1" style={dot}/><div className="ld2" style={dot}/><div className="ld3" style={dot}/>
    </div>
  );
}

// ─── User bubble ──────────────────────────────────────────────────────────────
function UserBubble({ text, time }: { text: string; time: string }) {
  return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.2}}
      style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
      {/* §3.7: was a filled terracotta bubble with white text — the most saturated
         element on screen, pulling the eye to the question instead of the answer.
         Quieted to a light surface with ink text so the answer stays the focus. */}
      <div style={{ maxWidth:'72%', background:C.surface2, border:`1px solid ${C.border}`, borderRadius: `${LAYOUT.radius.turn} ${LAYOUT.radius.turn} ${LAYOUT.radius.xs} ${LAYOUT.radius.turn}`, padding:'13px 17px' }}>
        <p style={{ fontFamily:SANS, fontSize: TYPE.title.size, color:C.ink, lineHeight:1.55, margin:0 }}>{text}</p>
        <div style={{ marginTop:5, textAlign:'right' }}>
          <span style={{ fontFamily:SANS, fontSize: TYPE.micro.size, color:C.muted }}>{time}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Thinking bubble — branded shimmer skeleton ───────────────────────────────
function ThinkingBubble({ isFollowUp = false }: { isFollowUp?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ marginBottom: 24 }}
    >
      <div style={{ fontFamily:SANS, fontSize: TYPE.micro.size, fontWeight:500, color:C.muted, marginBottom:6 }}>LokAI</div>
      <div style={{
        background: '#fff', border: `1px solid ${C.border}`, borderRadius: LAYOUT.radius.control,
        overflow: 'hidden', position: 'relative',
        boxShadow: SHADOW.xs,
        padding: '18px 22px 18px 26px',
      }}>
        {/* Pulsing saffron left accent — same as real response card */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: `linear-gradient(180deg, ${C.saffron} 0%, #C4620A 100%)`,
          borderRadius: `${LAYOUT.radius.control} ${LAYOUT.radius.none} ${LAYOUT.radius.none} ${LAYOUT.radius.control}`,
          animation: 'thinkAccent 1.5s ease-in-out infinite',
        }}/>
        {/* Label */}
        <div style={{
          fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: 600, color: '#A8A4A0',
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14,
        }}>
          {isFollowUp ? 'Processing follow-up' : 'Analysing your question'}
        </div>
        {/* Shimmer lines mimicking real content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="shimmer-line" style={{ height: 13, width: '88%' }}/>
          <div className="shimmer-line" style={{ height: 13, width: '72%', animationDelay: '0.15s' }}/>
          <div className="shimmer-line" style={{ height: 13, width: '80%', animationDelay: '0.3s' }}/>
          <div style={{ height: 10 }}/>
          <div className="shimmer-line" style={{ height: 13, width: '65%', animationDelay: '0.1s' }}/>
          <div className="shimmer-line" style={{ height: 13, width: '55%', animationDelay: '0.25s' }}/>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Error inline ─────────────────────────────────────────────────────────────
function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ marginBottom:20, padding:'14px 18px', background:'#FFF5F5',
      border:'1px solid #FECACA', borderRadius: LAYOUT.radius.control, display:'flex', alignItems:'center',
      gap:12, justifyContent:'space-between' }}>
      <p style={{ fontFamily:SANS, fontSize: TYPE.body.size, color:'#B91C1C', margin:0, lineHeight:1.5 }}>{message}</p>
      <button onClick={onRetry} style={{ fontFamily:SANS, fontSize: TYPE.small.size, fontWeight:500,
        color:C.navy, background:'none', border:`1px solid ${C.navy}`, borderRadius: LAYOUT.radius.sm,
        padding:'6px 14px', cursor:'pointer', flexShrink:0 }}>Retry</button>
    </div>
  );
}

// ─── Quick action chips ───────────────────────────────────────────────────────
const CHIPS = [
  { label:'Damaged mixer refund', question:'I bought a damaged mixer grinder for ₹8,999 and the seller refused a replacement.' },
  { label:'What proof matters?', question:'What proof should I keep for the damaged mixer refund example?' },
  { label:'Explain deficiency', question:'In the consumer example, what does deficiency mean?' },
];

function QuickChips({ onSelect }: { onSelect: (q: string) => void }) {
  useLokaiSharedStyles();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: '40px 0 0', maxWidth: 540, margin: '0 auto', textAlign: 'center' }}
    >
      {/* Small LokAI mark */}
      <div style={{
        width: 40, height: 40, borderRadius: LAYOUT.radius.full,
        background: `linear-gradient(135deg, ${C.navy} 0%, #1F4070 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
        boxShadow: SHADOW.navySoft,
      }}>
        <span style={{ fontFamily: EDITORIAL, fontSize: TYPE.lead.size, color: '#fff', fontStyle: 'italic', lineHeight: 1 }}>L</span>
      </div>
      <p style={{ fontFamily: EDITORIAL, fontStyle: 'italic', fontWeight: 300, fontSize: TYPE.h3.size, color: C.ink, margin: '0 0 6px', lineHeight: 1.3 }}>
        Choose a prepared consumer question
      </p>
      <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.muted, margin: '0 0 28px' }}>
        This visual prototype uses scripted examples and sends no data.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {CHIPS.map((chip, i) => (
          <motion.button
            key={chip.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.05 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="lokai-chip chip-btn"
            onClick={() => onSelect(chip.question)}
            style={{
              fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 500, color: C.navy,
              background: '#fff', border: `1px solid ${C.border}`, borderRadius: LAYOUT.radius.control,
              padding: '10px 18px', cursor: 'pointer',
            }}
          >
            {chip.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Context panel ────────────────────────────────────────────────────────────
function ContextPanel({ panel }: { panel: ContextPanel | null }) {
  const [copied, setCopied] = useState<string|null>(null);

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref).catch(() => {});
    setCopied(ref);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!panel) {
    return (
      <div style={{ padding:'40px 24px', textAlign:'center' }}>
        <p style={{ fontFamily:SANS, fontSize: TYPE.small.size, color:C.muted, lineHeight:1.7, margin:0 }}>
          Start a conversation to see relevant laws here.
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.25}}
      style={{ padding:'24px 20px 40px', display:'flex', flexDirection:'column', gap:20 }}>
      {/* Primary law */}
      <div>
        <div style={{ fontFamily:SANS, fontSize: TYPE.label.size, fontWeight:600, color:C.muted,
          textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Legal Context</div>
        <p style={{ fontFamily:SANS, fontSize: TYPE.body.size, fontWeight:600, color:C.navy, margin:0, lineHeight:1.4 }}>
          {panel.primaryLaw}
        </p>
        <p style={{ fontFamily:SANS, fontSize: TYPE.label.size, color:C.muted, margin:'6px 0 0', lineHeight:1.45 }}>
          Illustrative source notes · expert review pending
        </p>
      </div>

      {/* Key sections */}
      <div>
        <div style={{ fontFamily:SANS, fontSize: TYPE.label.size, fontWeight:600, color:C.muted,
          textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Key Sections</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {panel.sections.map((s,i) => (
            <button type="button" key={i} onClick={() => handleCopyRef(s.ref)} aria-label={`Copy source reference ${s.ref}`}
              style={{ width:'100%', textAlign:'left', background:C.surface2, borderRadius: LAYOUT.radius.control, border:`1px solid ${C.border}`,
                padding:'10px 12px', cursor:'pointer', position:'relative',
                transition:'background .12s' }}>
              <span style={{ fontFamily:MONO, fontSize: TYPE.micro.size, fontWeight:600, color:C.navy }}>{s.ref}</span>
              {copied === s.ref && (
                <span style={{ position:'absolute', right:8, top:8, fontFamily:SANS, fontSize: TYPE.label.size,
                  color:C.green, background:'#F0FBF4', padding:'2px 6px', borderRadius: LAYOUT.radius.xs }}>Copied!</span>
              )}
              <p style={{ fontFamily:SANS, fontSize: TYPE.caption.size, color:C.inkSoft, margin:'4px 0 0', lineHeight:1.5 }}>{s.summary}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Key facts */}
      {panel.keyFacts.length > 0 && (
        <div>
          <div style={{ fontFamily:SANS, fontSize: TYPE.label.size, fontWeight:600, color:C.muted,
            textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Key Facts</div>
          <ul style={{ margin:0, padding:'0 0 0 16px', display:'flex', flexDirection:'column', gap:6 }}>
            {panel.keyFacts.map((f,i) => (
              <li key={i} style={{ fontFamily:SANS, fontSize: TYPE.small.size, color:C.inkSoft, lineHeight:1.55 }}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Related laws */}
      {panel.relatedLaws.length > 0 && (
        <div>
          <div style={{ fontFamily:SANS, fontSize: TYPE.label.size, fontWeight:600, color:C.muted,
            textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Related Laws</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {panel.relatedLaws.map((l,i) => (
              <span key={i} style={{ fontFamily:SANS, fontSize: TYPE.small.size, color:C.navy, cursor:'default',
                lineHeight:1.5 }}>· {l}</span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Chat page ───────────────────────────────────────────────────────────
export default function Chat() {
  const { chatId }   = useParams();
  const { pathname, state } = useLocation() as { pathname: string; state: { initialQuestion?: string } | null | undefined };
  const navigate     = useNavigate();
  const { collapsed }= useSidebar();
  const sidebarW     = collapsed ? 64 : 240;
  const {
    scenario, runPreparedInput, activeTurn, isProgressing, progressLabel, progressIndex,
    skipProgress, replayProgress, language,
  } = useDemo();

  const { conversations, activeId, setActiveId, getConversation,
    createConversation, addMessage, applyResponse } = useConversations();

  const idFromUrl = chatId || '';
  const convId    = idFromUrl || activeId || 'consumer';
  const conv      = getConversation(convId);

  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string|null>(null);
  const [lastMsg,  setLastMsg]  = useState<string|null>(null);
  const [copyToast, setCopyToast] = useState(false);
  const [hybridTurns, setHybridTurns] = useState<ResponseTurn[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  const showCopyToast = useCallback(() => {
    setCopyToast(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopyToast(false), 2000);
  }, []);

  useEffect(() => {
    if (convId) setActiveId(convId);
  }, [convId, setActiveId]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior:'smooth' }));
  }, [conv?.messages.length, loading, hybridTurns.length, isProgressing]);

  const handleSend = useCallback(async (text: string) => {
    if (!conv || loading || isProgressing) return;
    setError(null);
    setLastMsg(text);

    const userMsg = { role: 'user' as const, content: text };
    addMessage(conv.id, userMsg);
    setLoading(true);

    try {
      const turn = await runPreparedInput(text);
      setHybridTurns((prev) => [...prev, turn]);
      const legacy = await import('../demo/responseEngine').then((m) => m.turnAsLokAIResponse(turn));
      applyResponse(conv.id, legacy);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Chat] handleSend error:', msg);
      setError(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [conv, loading, isProgressing, addMessage, applyResponse, runPreparedInput]);

  const initialQuestion = state?.initialQuestion;

  useEffect(() => {
    if (initialQuestion && conv && conv.messages.length === 0 && !loading) {
      navigate(pathname, { replace: true, state: {} });
      handleSend(initialQuestion);
    }
  }, [initialQuestion, conv, loading, handleSend, navigate, pathname]);

  const handleChipSelect = useCallback((question: string) => {
    if (!conv) {
      const newConv = createConversation();
      setTimeout(() => handleSend(question), 50);
      navigate(`/desktop/chat/${newConv.id}`);
    } else {
      handleSend(question);
    }
  }, [conv, createConversation, handleSend, navigate]);

  const handleRetry = useCallback(() => {
    if (lastMsg) handleSend(lastMsg);
  }, [lastMsg, handleSend]);

  // Prefer hybrid turns; hydrate seeded conversations into Turn anatomy once
  useEffect(() => {
    if (hybridTurns.length > 0) return;
    if (!conv || conv.messages.length === 0) return;
    const hasAssistant = conv.messages.some((m) => m.role === 'assistant');
    if (!hasAssistant) return;
    const seeded = seedTurnForConversation(conv.id, language);
    if (seeded) setHybridTurns([seeded]);
  }, [conv?.id, conv?.messages.length, hybridTurns.length, language]);

  // Prefer hybrid turns when present — one message anatomy only
  const renderedMessages = React.useMemo(() => {
    const out: React.ReactNode[] = [];
    const userMsgs = conv?.messages.filter((m) => m.role === 'user') ?? [];
    hybridTurns.forEach((turn, i) => {
      if (userMsgs[i]) {
        out.push(<UserBubble key={`u-${i}`} text={userMsgs[i].content} time={now()} />);
      }
      out.push(
        <Turn
          key={`t-${turn.id}-${i}`}
          turn={{ ...turn, language }}
          onCopy={showCopyToast}
          onSpeak={() => toast.message('Prepared read-aloud · demo playback')}
        />,
      );
    });
    return out;
  }, [conv?.messages, hybridTurns, language, showCopyToast]);

  const isEmpty = (!conv || conv.messages.length === 0) && hybridTurns.length === 0;
  const panelData = conv?.contextPanel ?? null;
  const showContextPanel = (!!panelData && !isEmpty) || !!activeTurn;

  return (
    <>
      <style>{ANIM}</style>
      <main style={{
        flex:1,
        height:'100vh',
        maxHeight:'100vh',
        display:'flex',
        flexDirection:'column',
        background: PLANE.reading,
        overflow:'hidden',
        paddingRight: showContextPanel ? 300 : 0,
        transition:'padding-right .2s ease',
      }}>

        {/* Breadcrumb */}
        <div style={{ padding:'14px 32px', background:'transparent', flexShrink:0 }}>
          <div style={{ maxWidth:1060, margin:'0 auto', display:'flex', alignItems:'center', gap:6 }}>
            <span onClick={() => navigate('/desktop/dashboard')}
              style={{ fontFamily:SANS, fontSize: TYPE.caption.size, color:C.muted, cursor:'pointer' }}>Dashboard</span>
            <span style={{ fontFamily:SANS, fontSize: TYPE.caption.size, color:C.muted }}>/</span>
            <AnimatePresence mode="wait">
              <motion.span key={conv?.title}
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                transition={{duration:.2}}
                style={{ fontFamily:SANS, fontSize: TYPE.caption.size, color:C.ink, fontWeight:500 }}>
                {conv?.title || 'New conversation'}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, minHeight:0, display:'flex', overflow:'hidden' }}>

          {/* Chat column */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
            <div ref={chatRef} className="chat-scroll"
              style={{ flex:1, overflowY:'auto', padding:'28px 0 176px' }}>
              <div style={{ maxWidth:600, margin:'0 auto', padding:'0 24px' }}>

                {scenario.id !== 'consumer' && (
                  <div style={{ marginBottom: 24 }}>
                    <GuardrailGallery />
                  </div>
                )}

                {isEmpty && !loading && !isProgressing && (
                  <QuickChips onSelect={handleChipSelect}/>
                )}

                {renderedMessages}

                {isProgressing && progressLabel && (
                  <TurnStatus
                    label={progressLabel}
                    stages={DEMO_PROGRESS_STAGES}
                    activeIndex={Math.max(0, progressIndex)}
                    onSkip={skipProgress}
                    onReplay={replayProgress}
                  />
                )}

                {(loading || isProgressing) && !progressLabel && (
                  <ThinkingBubble isFollowUp={conv && conv.messages.filter(m => m.role === 'user').length > 1}/>
                )}

                {error && <InlineError message={error} onRetry={handleRetry}/>}
              </div>
            </div>
          </div>

          {/* Right context panel appears only once the chat has legal context */}
          {showContextPanel && (
            <aside style={{
              position:'fixed',
              top:0,
              right:0,
              bottom:0,
              width:300,
              zIndex:80,
              background:'#fff',
              borderLeft:`1px solid ${C.border}`,
              overflow:'hidden',
              boxShadow: SHADOW.sm }}>
              <div className="chat-scroll" style={{ height:'100%', overflowY:'auto' }}>
                <LegalTermPanel />
                <ContextPanel panel={panelData}/>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Floating input bar */}
      <div style={{ position:'fixed', bottom:28, left:sidebarW, right:showContextPanel ? 300 : 0,
        display:'flex', justifyContent:'center', zIndex:100,
        pointerEvents:'none', transition:'left .2s ease' }}>
        <div className="input-bar-wrap" style={{ maxWidth:740, width:'calc(100% - 56px)',
          borderRadius: LAYOUT.radius.plane, border: `1px solid ${C.borderStrong}`,
          boxShadow: SHADOW.float, padding:'14px 18px 12px',
          pointerEvents:'auto', position:'relative' }}>
          <Composer
            onSubmit={handleSend}
            disabled={loading || isProgressing}
            placeholder="Type a question or use the prepared voice example"
          />
        </div>
      </div>

      {/* Copy toast */}
      <AnimatePresence>
        {copyToast && (
          <div className="toast-enter" style={{
            position:'fixed', bottom:96, left:'50%',
            transform:'translateX(-50%)',
            background:C.navy, color:'#fff',
            fontFamily:SANS, fontSize: TYPE.caption.size, fontWeight:500,
            padding:'7px 16px', borderRadius: LAYOUT.radius.control,
            boxShadow: SHADOW.navy,
            zIndex:200, whiteSpace:'nowrap',
            display:'flex', alignItems:'center', gap:6,
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Copied to clipboard
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
