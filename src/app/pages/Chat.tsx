import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { ArrowRight, Copy, BookmarkPlus, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERIF, EDITORIAL, SANS, MONO, C, GRAD, SHADOW, BADGE, VoiceOrb } from '../components/shared';
import { CitationStamp } from '../components/ui/CitationStamp';
import { Button as Btn } from '../components/ui/button';
import { useSidebar } from '../context/SidebarContext';
import { useConversations } from '../context/ConversationContext';
import { callLokAI, callSarvamTTS, callSarvamSTT } from '../services/api';
import type { LokAIResponse, ContextPanel } from '../services/api';

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
  .chat-scroll::-webkit-scrollbar-thumb{background:#E0DDD5;border-radius:2px}
  .icon-btn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;
    background:none;border:none;cursor:pointer;color:${C.muted};border-radius:6px;
    transition:background .12s,color .12s}
  .icon-btn:hover{background:#F0EDE8;color:${C.navy}}
  .chip-btn{transition:background .12s,border-color .12s,transform .08s}
  .chip-btn:hover{background:#EEF2F8!important;border-color:${C.navy}!important}
  .chip-btn:active{transform:scale(.98)}
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

function parseAssistant(raw: string): LokAIResponse | null {
  try {
    const clean = raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    return JSON.parse(clean) as LokAIResponse;
  } catch { return null; }
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  const dot: React.CSSProperties = { width:7, height:7, borderRadius:'50%', background:C.navy };
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
      <div style={{ maxWidth:'72%', background:'#C4724A', borderRadius:'18px 18px 4px 18px', padding:'14px 18px' }}>
        <p style={{ fontFamily:SANS, fontSize:15, color:'#fff', lineHeight:1.55, margin:0 }}>{text}</p>
        <div style={{ marginTop:5, textAlign:'right' }}>
          <span style={{ fontFamily:SANS, fontSize:11, color:'rgba(255,255,255,.55)' }}>{time}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── AI Card ──────────────────────────────────────────────────────────────────
function AICard({ response, isOutOfScope, onCopy }: { response: LokAIResponse; isOutOfScope?: boolean; onCopy?: () => void }) {
  const [revealed, setRevealed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const t = now();

  useEffect(() => {
    if (revealed < 3) {
      const delays = [0, 150, 300];
      const id = setTimeout(() => setRevealed(r => r+1), delays[revealed] ?? 300);
      return () => clearTimeout(id);
    }
  }, [revealed]);

  const zones = [
    { label: response.zone1.label, content: response.zone1.finding, big: true },
    { label: response.zone2.label, content: response.zone2.analysis, big: false },
    { label: response.zone3.label,
      content: (
        <div>
          <ol style={{ margin:'0 0 12px', padding:'0 0 0 18px', display:'flex', flexDirection:'column', gap:6 }}>
            {response.zone3.steps.map((s,i) => (
              <li key={i} style={{ fontFamily:SANS, fontSize:14, color:'#4A4840', lineHeight:1.65 }}>{s}</li>
            ))}
          </ol>
          <p style={{ fontFamily:SANS, fontSize:13, fontWeight:600, color:C.navy, margin:0 }}>→ {response.zone3.cta}</p>
        </div>
      ), big: false },
  ];

  const borderColor = isOutOfScope ? '#D97706' : '#E8832A';

  const handleCopy = () => {
    const text = [response.zone1.finding, response.zone2.analysis, ...response.zone3.steps].join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
    onCopy?.();
  };

  const handleTTS = async () => {
    if (playing) return;
    setPlaying(true);
    try {
      const textToSpeak = `${response.zone1.finding}. ${response.zone2.analysis}`;
      const base64Audio = await callSarvamTTS(textToSpeak, response.responseLanguage || 'en-IN');
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.onended = () => setPlaying(false);
      audio.play();
    } catch (err) {
      console.error('TTS failed:', err);
      setPlaying(false);
    }
  };

  // Determine if this is a non-Latin script response → needs Noto font + extra line-height
  const lang = response.responseLanguage ?? 'en';
  const isDevanagari = ['hi', 'mr', 'sa'].includes(lang);
  const isTamil      = lang === 'ta';
  const isBengali    = lang === 'bn';
  const isIndic      = isDevanagari || isTamil || isBengali;

  // Indic scripts need more line-height to breathe (matras/vowel marks need vertical space)
  const bodyLineH = isIndic ? 1.95 : 1.75;
  const headLineH = isIndic ? 1.65 : 1.45;
  const headSize  = isIndic ? 20   : 22;   // slightly smaller for Devanagari glyphs

  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontFamily:SANS, fontSize:11, fontWeight:500, color:C.muted, marginBottom:6 }}>LokAI</div>
      <div
        lang={lang !== 'en' ? lang : undefined}
        style={{ background:'#fff', border:`1px solid #E0DDD6`, borderRadius:10, overflow:'hidden',
          boxShadow:'0 1px 3px rgba(26,25,22,.05),0 3px 12px rgba(26,25,22,.06)', position:'relative' }}
      >
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3,
          background:`linear-gradient(180deg,${borderColor} 0%,#C4620A 100%)`, borderRadius:'10px 0 0 10px', zIndex:2 }}/>
        {zones.map((z, i) => (
          <AnimatePresence key={i}>
            {i < revealed && (
              <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                transition={{duration:.28,ease:'easeOut'}}>
                <div style={{ background: i===0 ? '#fff' : '#FAFAF8',
                  borderTop: i>0 ? '1px solid #EEEBE4' : 'none', padding:'16px 22px 16px 26px' }}>
                  <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:'#8A8880',
                    textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10 }}>{z.label}</div>
                  {z.big ? (
                    <p style={{ fontSize:headSize, fontWeight:400, color:'#1A1916', lineHeight:headLineH, margin:0 }}>
                      {z.content}
                    </p>
                  ) : (
                    <div style={{ fontSize:isIndic ? 14 : 15, color:'#4A4840', lineHeight:bodyLineH }}>
                      {z.content}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {revealed >= 3 && response.citations.length > 0 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.45,duration:.2}}
            style={{ padding:'10px 22px 10px 26px', display:'flex', flexWrap:'wrap', gap:8, background:'#FAFAF8', borderTop:'1px solid #EEEBE4' }}>
            {response.citations.map((c,i) => <CitationStamp key={i} text={c}/>)}
          </motion.div>
        )}

        {revealed >= 3 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5,duration:.2}}
            style={{ padding:'8px 16px 10px 26px', display:'flex', alignItems:'center',
              justifyContent:'space-between', borderTop:'1px solid #E8E4DC', background:'#fff' }}>
            <span style={{ fontFamily:SANS, fontSize:11, color:'#8A8880' }}>{t}</span>
            <div style={{ display:'flex', gap:2 }}>
              <button className="icon-btn" title="Speak" onClick={handleTTS} disabled={playing}>
                <Volume2 style={{ width:14, height:14, color: playing ? C.saffron : C.muted }} />
              </button>
              <button className="icon-btn" title="Copy" onClick={handleCopy}><Copy style={{width:14,height:14}}/></button>
              <button className="icon-btn" title="Bookmark"><BookmarkPlus style={{width:14,height:14}}/></button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
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
      <div style={{ fontFamily:SANS, fontSize:11, fontWeight:500, color:C.muted, marginBottom:6 }}>LokAI</div>
      <div style={{
        background: '#fff', border: `1px solid #E0DDD6`, borderRadius: 10,
        overflow: 'hidden', position: 'relative',
        boxShadow: '0 1px 3px rgba(26,25,22,.05), 0 3px 12px rgba(26,25,22,.06)',
        padding: '18px 22px 18px 26px',
      }}>
        {/* Pulsing saffron left accent — same as real response card */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: `linear-gradient(180deg, ${C.saffron} 0%, #C4620A 100%)`,
          borderRadius: '10px 0 0 10px',
          animation: 'thinkAccent 1.5s ease-in-out infinite',
        }}/>
        {/* Label */}
        <div style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 600, color: '#A8A4A0',
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
      border:'1px solid #FECACA', borderRadius:10, display:'flex', alignItems:'center',
      gap:12, justifyContent:'space-between' }}>
      <p style={{ fontFamily:SANS, fontSize:14, color:'#B91C1C', margin:0, lineHeight:1.5 }}>{message}</p>
      <button onClick={onRetry} style={{ fontFamily:SANS, fontSize:13, fontWeight:500,
        color:C.navy, background:'none', border:`1px solid ${C.navy}`, borderRadius:6,
        padding:'6px 14px', cursor:'pointer', flexShrink:0 }}>Retry</button>
    </div>
  );
}

// ─── Quick action chips ───────────────────────────────────────────────────────
const CHIPS = [
  { label:'Tenancy issue',       question:'My landlord is refusing to let me leave and is not returning my deposit.' },
  { label:'File an RTI',         question:'How do I file an RTI application to get government records?' },
  { label:'Consumer complaint',  question:'I bought a defective product and the seller refuses to give a refund.' },
  { label:'Read a notice',       question:'I received a legal notice and I need help understanding what it means.' },
];

function QuickChips({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: '40px 0 0', maxWidth: 540, margin: '0 auto', textAlign: 'center' }}
    >
      {/* Small LokAI mark */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.navy} 0%, #1F4070 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
        boxShadow: '0 4px 14px rgba(19,40,70,0.2)',
      }}>
        <span style={{ fontFamily: EDITORIAL, fontSize: 18, color: '#fff', fontStyle: 'italic', lineHeight: 1 }}>L</span>
      </div>
      <p style={{ fontFamily: EDITORIAL, fontStyle: 'italic', fontWeight: 300, fontSize: 20, color: C.ink, margin: '0 0 6px', lineHeight: 1.3 }}>
        How can I help you today?
      </p>
      <p style={{ fontFamily: SANS, fontSize: 13, color: C.muted, margin: '0 0 28px' }}>
        Ask in any of 11 Indian languages
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {CHIPS.map((chip, i) => (
          <motion.button
            key={chip.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.05 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="chip-btn"
            onClick={() => onSelect(chip.question)}
            style={{
              fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.navy,
              background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8,
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
        <p style={{ fontFamily:SANS, fontSize:13, color:C.muted, lineHeight:1.7, margin:0 }}>
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
        <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:C.muted,
          textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Legal Context</div>
        <p style={{ fontFamily:SANS, fontSize:14, fontWeight:600, color:C.navy, margin:0, lineHeight:1.4 }}>
          {panel.primaryLaw}
        </p>
      </div>

      {/* Key sections */}
      <div>
        <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:C.muted,
          textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Key Sections</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {panel.sections.map((s,i) => (
            <div key={i} onClick={() => handleCopyRef(s.ref)}
              style={{ background:'#F4F2EE', borderRadius:8, borderLeft:`3px solid ${C.navy}`,
                padding:'10px 12px', cursor:'pointer', position:'relative',
                transition:'background .12s' }}>
              <span style={{ fontFamily:MONO, fontSize:11, fontWeight:600, color:C.navy }}>{s.ref}</span>
              {copied === s.ref && (
                <span style={{ position:'absolute', right:8, top:8, fontFamily:SANS, fontSize:10,
                  color:C.green, background:'#F0FBF4', padding:'2px 6px', borderRadius:4 }}>Copied!</span>
              )}
              <p style={{ fontFamily:SANS, fontSize:12, color:'#4A4840', margin:'4px 0 0', lineHeight:1.5 }}>{s.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key facts */}
      {panel.keyFacts.length > 0 && (
        <div>
          <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:C.muted,
            textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Key Facts</div>
          <ul style={{ margin:0, padding:'0 0 0 16px', display:'flex', flexDirection:'column', gap:6 }}>
            {panel.keyFacts.map((f,i) => (
              <li key={i} style={{ fontFamily:SANS, fontSize:13, color:'#4A4840', lineHeight:1.55 }}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Related laws */}
      {panel.relatedLaws.length > 0 && (
        <div>
          <div style={{ fontFamily:SANS, fontSize:10, fontWeight:600, color:C.muted,
            textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Related Laws</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {panel.relatedLaws.map((l,i) => (
              <span key={i} style={{ fontFamily:SANS, fontSize:13, color:C.navy, cursor:'default',
                lineHeight:1.5 }}>· {l}</span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Input bar ────────────────────────────────────────────────────────────────
function InputBar({ onSend, loading }: { onSend:(t:string)=>void; loading:boolean }) {
  const [value, setValue]   = useState('');
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const submit = useCallback(() => {
    const v = value.trim();
    if (!v || loading) return;
    onSend(v);
    setValue('');
    if (textRef.current) { textRef.current.style.height = 'auto'; }
  }, [value, loading, onSend]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const applyTranscription = useCallback((text: string) => {
    setValue(text);
    requestAnimationFrame(() => {
      if (!textRef.current) return;
      textRef.current.style.height = 'auto';
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 100) + 'px';
      textRef.current.focus();
    });
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceError('Voice capture is not available in this browser.');
      setVoiceState('error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        setVoiceState('processing');
        setVoiceError(null);
        const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        try {
          const transcript = await callSarvamSTT(audioBlob);
          if (!transcript.trim()) {
            setVoiceError('No speech detected.');
            setVoiceState('error');
          } else {
            applyTranscription(transcript);
            setVoiceState('idle');
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Voice transcription failed.';
          setVoiceError(msg);
          setVoiceState('error');
        } finally {
          mediaStreamRef.current?.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
          mediaRecorderRef.current = null;
          chunksRef.current = [];
        }
      };

      recorder.start();
      setVoiceError(null);
      setVoiceState('listening');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Microphone access failed.';
      setVoiceError(msg);
      setVoiceState('error');
    }
  }, [applyTranscription]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleVoice = useCallback(async () => {
    if (voiceState === 'processing' || loading) return;
    if (voiceState === 'listening') {
      stopRecording();
      return;
    }
    if (voiceState === 'error') {
      setVoiceError(null);
      setVoiceState('idle');
    }
    await startRecording();
  }, [voiceState, loading, startRecording, stopRecording]);

  useEffect(() => {
    if (voiceState !== 'error') return;
    const id = window.setTimeout(() => {
      setVoiceState('idle');
      setVoiceError(null);
    }, 2400);
    return () => window.clearTimeout(id);
  }, [voiceState]);

  useEffect(() => {
    if (loading && voiceState === 'listening') stopRecording();
  }, [loading, voiceState, stopRecording]);

  const voiceHint = voiceState === 'listening'
    ? 'Listening... tap again to stop'
    : voiceState === 'processing'
      ? 'Transcribing your voice...'
      : voiceError;

  const placeholder = voiceState === 'listening'
    ? 'Listening for your legal question...'
    : 'Type your legal question — in any Indian language';

  useEffect(() => {
    if (voiceState === 'listening') textRef.current?.blur();
  }, [voiceState]);

  const clearVoiceError = () => {
    if (!voiceError) return;
    setVoiceError(null);
    if (voiceState === 'error') setVoiceState('idle');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const handleInput = () => {
    if (!textRef.current) return;
    textRef.current.style.height = 'auto';
    textRef.current.style.height = Math.min(textRef.current.scrollHeight, 100) + 'px';
  };

  const canSend = value.trim().length > 0 && !loading;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <VoiceOrb size={44} state={voiceState} onClick={() => { void handleVoice(); }} />
        </div>

        {/* Textarea */}
        <textarea ref={textRef} value={value}
          onChange={e => { clearVoiceError(); setValue(e.target.value); }}
          onInput={handleInput}
          onKeyDown={handleKey}
          disabled={loading}
          placeholder={placeholder}
          rows={1}
          style={{ flex:1, resize:'none', background:'transparent', border:'none', outline:'none',
            fontFamily:SANS, fontSize:16, color:C.ink, lineHeight:1.55,
            padding:'9px 0 4px', maxHeight:110, overflow:'auto',
            opacity: loading ? 0.5 : 1 }}/>

        {/* Send */}
        <button onClick={submit} disabled={!canSend}
          style={{ width:44, height:44, borderRadius:'50%',
            background: canSend ? GRAD.buttonPrimary : '#E5E0D6',
            border:'none', cursor: canSend ? 'pointer' : 'not-allowed',
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0, opacity: canSend ? 1 : 0.5,
            transition:'background .15s, opacity .15s',
            transform:'scale(1)', boxShadow: canSend ? '0 8px 20px rgba(16,42,76,0.22)' : 'none' }}
          onMouseDown={e => { if (canSend) (e.currentTarget as HTMLButtonElement).style.transform='scale(.97)'; }}
          onMouseUp={e   => { (e.currentTarget as HTMLButtonElement).style.transform='scale(1)'; }}>
          {loading
            ? <div style={{ width:14, height:14, border:'2px solid white', borderTopColor:'transparent',
                borderRadius:'50%', animation:'lokaiSpin .7s linear infinite' }}/>
            : <ArrowRight style={{ width:14, height:14, color:'white' }}/>
          }
        </button>
      </div>
      <div style={{ margin:'10px 0 0', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <p style={{ fontFamily:SANS, fontSize:11, color:C.muted, margin:0, textAlign:'center', flex:1 }}>
          {voiceHint ?? 'LokAI provides legal information, not legal advice.'}
        </p>
      </div>
    </div>
  );
}

// ─── Main Chat page ───────────────────────────────────────────────────────────
export default function Chat() {
  const { chatId }   = useParams();
  const { pathname, state } = useLocation() as { pathname: string; state: { initialQuestion?: string } | null | undefined };
  const navigate     = useNavigate();
  const { collapsed }= useSidebar();
  const sidebarW     = collapsed ? 64 : 240;

  const { conversations, activeId, setActiveId, getConversation,
    createConversation, addMessage, applyResponse } = useConversations();

  const idFromUrl = chatId || '';
  const convId    = idFromUrl || activeId || 'deposit';
  const conv      = getConversation(convId);

  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string|null>(null);
  const [lastMsg,  setLastMsg]  = useState<string|null>(null); // for retry
  const [copyToast, setCopyToast] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const showCopyToast = useCallback(() => {
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  }, []);

  useEffect(() => {
    if (convId) setActiveId(convId);
  }, [convId, setActiveId]);



  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior:'smooth' }));
  }, [conv?.messages.length, loading]);

  const handleSend = useCallback(async (text: string) => {
    if (!conv || loading) return;
    setError(null);
    setLastMsg(text);

    const userMsg = { role: 'user' as const, content: text };
    addMessage(conv.id, userMsg);
    setLoading(true);

    try {
      // Keep last 8 message pairs for API context
      const history = [...conv.messages, userMsg].slice(-16).map(m => ({
        role: m.role as 'user'|'assistant',
        content: m.content,
      }));
      const response = await callLokAI(history);
      applyResponse(conv.id, response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Chat] handleSend error:', msg);
      if (msg.includes('timed out')) {
        setError('Request timed out after 15 seconds. Check your connection and try again.');
      } else if (msg.includes('parse') || msg.includes('JSON')) {
        setError('Response formatting error. Try again.');
      } else if (msg.includes('API error')) {
        setError(`API error — ${msg}. Check the console for details.`);
      } else {
        setError(`Error: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }, [conv, loading, addMessage, applyResponse]);

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
      // navigate then send — state update needed
      setTimeout(() => handleSend(question), 50);
      navigate(`/desktop/chat/${newConv.id}`);
    } else {
      handleSend(question);
    }
  }, [conv, createConversation, handleSend, navigate]);

  const handleRetry = useCallback(() => {
    if (lastMsg) handleSend(lastMsg);
  }, [lastMsg, handleSend]);

  // Build rendered messages from API message pairs
  const renderedMessages = React.useMemo(() => {
    if (!conv) return [];
    const out: React.ReactNode[] = [];
    conv.messages.forEach((msg, i) => {
      if (msg.role === 'user') {
        out.push(<UserBubble key={i} text={msg.content} time={now()}/>);
      } else {
        const parsed = parseAssistant(msg.content);
        if (parsed) {
          out.push(<AICard key={i} response={parsed} isOutOfScope={parsed.scope === 'out'} onCopy={showCopyToast}/>);
        }
      }
    });
    return out;
  }, [conv?.messages]);

  const isEmpty = !conv || conv.messages.length === 0;
  const panelData = conv?.contextPanel ?? null;
  const showContextPanel = !!panelData && !isEmpty;

  return (
    <>
      <style>{ANIM}</style>
      <main style={{
        flex:1,
        height:'100vh',
        maxHeight:'100vh',
        display:'flex',
        flexDirection:'column',
        background:C.bg,
        overflow:'hidden',
        paddingRight: showContextPanel ? 300 : 0,
        transition:'padding-right .2s ease',
      }}>

        {/* Breadcrumb */}
        <div style={{ padding:'14px 32px', background:'transparent', flexShrink:0 }}>
          <div style={{ maxWidth:1060, margin:'0 auto', display:'flex', alignItems:'center', gap:6 }}>
            <span onClick={() => navigate('/desktop/dashboard')}
              style={{ fontFamily:SANS, fontSize:12, color:C.muted, cursor:'pointer' }}>Dashboard</span>
            <span style={{ fontFamily:SANS, fontSize:12, color:C.muted }}>/</span>
            <AnimatePresence mode="wait">
              <motion.span key={conv?.title}
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                transition={{duration:.2}}
                style={{ fontFamily:SANS, fontSize:12, color:C.ink, fontWeight:500 }}>
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
              style={{ flex:1, overflowY:'auto', padding:'28px 0 140px' }}>
              <div style={{ maxWidth:600, margin:'0 auto', padding:'0 24px' }}>

                {isEmpty && !loading && (
                  <QuickChips onSelect={handleChipSelect}/>
                )}

                {renderedMessages}

                {loading && <ThinkingBubble isFollowUp={conv && conv.messages.filter(m => m.role === 'user').length > 1}/>}

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
              boxShadow:'-10px 0 34px rgba(26,25,22,0.035)' }}>
              <div className="chat-scroll" style={{ height:'100%', overflowY:'auto' }}>
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
          borderRadius:22, border:'1px solid #D8D4CC',
          boxShadow:'0 18px 48px rgba(26,25,22,.14), 0 2px 8px rgba(26,25,22,.06)', padding:'14px 18px 12px',
          pointerEvents:'auto', position:'relative' }}>
          <InputBar onSend={handleSend} loading={loading}/>
        </div>
      </div>

      {/* Copy toast */}
      <AnimatePresence>
        {copyToast && (
          <div className="toast-enter" style={{
            position:'fixed', bottom:96, left:'50%',
            transform:'translateX(-50%)',
            background:C.navy, color:'#fff',
            fontFamily:SANS, fontSize:12, fontWeight:500,
            padding:'7px 16px', borderRadius:8,
            boxShadow:'0 4px 12px rgba(19,40,70,0.28)',
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
