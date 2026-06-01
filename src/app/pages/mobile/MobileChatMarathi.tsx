import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Volume2, Copy, BookmarkPlus, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERIF, SANS, MONO, C, GRAD, SHADOW } from '../../components/shared';
import { StatusBar, BottomNav, HomeIndicator, Breadcrumb, MobileRouteCanvas } from './MobileHome';
import { ChatTopBar } from './MobileChat';

// ─── Marathi Chat — completing the signature trio ──────────────────────────────
// User types in Marathi, LokAI responds in Marathi.
// Native script support with specific Marathi legal phrasing.

// ─── User Bubble ──────────────────────────────────────────────────────────────
function MarathiUserBubble({ text, time }: { text: string; time: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
      <div style={{
        maxWidth: '280px',
        background: C.terracotta,
        borderRadius: '18px 4px 18px 18px',
        padding: '12px 16px',
      }}>
        <p style={{ fontFamily: SANS, fontSize: '15px', color: 'white', lineHeight: 1.6, margin: 0 }}>
          {text}
        </p>
        <div style={{ textAlign: 'right', marginTop: '5px' }}>
          <span style={{ fontFamily: SANS, fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{time}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Marathi Verdict Card ─────────────────────────────────────────────────────
function MarathiVerdictCard({ time }: { time: string }) {
  const [revealed, setRevealed] = useState(0);

  const zones = [
    {
      key: 'law',
      label: 'कायदा काय सांगतो',
      findingMarathi: 'घरमालकाला डिपॉझिट रोखून धरण्याचा कोणताही कायदेशीर अधिकार नाही',
      citation: 'MRC Act 1999 · S.24',
    },
    {
      key: 'position',
      label: 'तुमची स्थिती',
      content: 'तुमची बाजू भक्कम आहे. ६५ दिवस उलटून गेले आहेत — कायदेशीर मुदत संपली आहे. नुकसानीचा कोणताही लेखी पुरावा नसल्यास घरमालक कपात करू शकत नाहीत.',
    },
    {
      key: 'action',
      label: 'आता काय करावे',
    },
  ];

  useEffect(() => {
    if (revealed < zones.length) {
      const t = setTimeout(() => setRevealed(r => r + 1), revealed === 0 ? 300 : 420);
      return () => clearTimeout(t);
    }
  }, [revealed]);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontFamily: SANS, fontSize: '11px', color: C.muted, marginBottom: '8px' }}>LokAI</div>

      <div style={{
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: SHADOW.md,
        position: 'relative',
      }}>
        {/* Verdict gradient left bar */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: '5px', background: GRAD.verdict,
          borderRadius: '16px 0 0 16px',
        }} />

        {/* Zone 1 — Law */}
        <AnimatePresence>
          {revealed >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div style={{ padding: '20px 24px' }}>
                <div style={{
                  fontFamily: SANS, fontSize: '10px', fontWeight: 600,
                  color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.12em',
                  marginBottom: '10px',
                }}>
                  {zones[0].label}
                </div>
                <p style={{
                  fontFamily: SERIF, fontSize: '22px', fontWeight: 400, fontStyle: 'normal',
                  color: '#1A1916', lineHeight: 1.45, margin: 0,
                }}>
                  {zones[0].findingMarathi}
                  <span style={{ marginLeft: '10px', display: 'inline-block', verticalAlign: 'middle' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: C.navy, color: '#FFFFFF',
                      fontFamily: MONO, fontSize: '10px', fontWeight: 500,
                      borderRadius: '4px', padding: '3px 8px',
                      whiteSpace: 'nowrap', letterSpacing: '0.01em',
                    }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFFFFF', opacity: 0.8, flexShrink: 0 }} />
                      {zones[0].citation}
                    </span>
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone 2 — Position */}
        <AnimatePresence>
          {revealed >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div style={{ padding: '20px 24px', background: '#FAFAF8', borderTop: '1px solid #E8E4DC' }}>
                <div style={{
                  fontFamily: SANS, fontSize: '10px', fontWeight: 600,
                  color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.12em',
                  marginBottom: '10px',
                }}>
                  {zones[1].label}
                </div>
                <p style={{ fontFamily: SANS, fontSize: '15px', color: '#4A4840', lineHeight: 1.7, margin: 0 }}>
                  {zones[1].content}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone 3 — Action */}
        <AnimatePresence>
          {revealed >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div style={{ padding: '20px 24px', background: '#FAFAF8', borderTop: '1px solid #E8E4DC' }}>
                <div style={{
                  fontFamily: SANS, fontSize: '10px', fontWeight: 600,
                  color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.12em',
                  marginBottom: '12px',
                }}>
                  {zones[2].label}
                </div>
                <button style={{
                  width: '100%', height: '44px',
                  background: GRAD.buttonPrimary, border: 'none',
                  borderRadius: '999px',
                  fontFamily: SANS, fontSize: '15px', fontWeight: 600, color: '#FFFFFF',
                  cursor: 'pointer', marginBottom: '10px',
                  boxShadow: SHADOW.sm,
                }}>
                  डिमांड नोटीस तयार करा
                </button>
                <button style={{
                  width: '100%', background: 'transparent', border: 'none',
                  fontFamily: SANS, fontSize: '13px', color: C.navy,
                  cursor: 'pointer', padding: '4px',
                  display: 'block', textAlign: 'center',
                }}>
                  अधिक जाणून घ्या →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {revealed >= 3 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.25 }}
            style={{
              padding: '10px 16px 12px 18px',
              borderTop: `1px solid ${C.bgRaised}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#FFFFFF',
            }}
          >
            <span style={{ fontFamily: SANS, fontSize: '11px', color: C.muted }}>{time}</span>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Copy         style={{ width: '15px', height: '15px', color: C.muted }} />
              <BookmarkPlus style={{ width: '15px', height: '15px', color: C.muted }} />
              <Volume2      style={{ width: '15px', height: '15px', color: C.muted }} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Marathi Input Bar — floating pill treatment ──────────────────────────────
function MarathiInputBar() {
  return (
    <div style={{
      position: 'absolute',
      bottom: '80px',      // 64px bottom-nav + 16px gap
      left: '16px',
      right: '16px',
      height: '52px',
      background: '#FFFFFF',
      borderRadius: '999px',
      boxShadow: '0 4px 24px rgba(26,25,22,0.10)',
      display: 'flex', alignItems: 'center',
      padding: '0 10px',
      gap: '8px',
      zIndex: 20,
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%',
        background: C.bgRaised, border: `2px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, cursor: 'pointer',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" stroke={C.muted} strokeWidth="1.1" />
          <path d="M3 8.5C3 11.3 5.2 13.5 8 13.5C10.8 13.5 13 11.3 13 8.5" stroke={C.muted} strokeWidth="1.1" strokeLinecap="round" />
          <line x1="8" y1="13.5" x2="8" y2="15.5" stroke={C.muted} strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </div>
      <span style={{ flex: 1, fontFamily: SANS, fontSize: '14px', color: '#8A8880' }}>
        तुमची समस्या सांगा...
      </span>
      <Paperclip style={{ width: '18px', height: '18px', color: C.muted, flexShrink: 0, marginRight: '6px' }} />
    </div>
  );
}

// ─── Marathi Chat Artboard ────────────────────────────────────────────────────
export function MarathiChatArtboard() {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '390px', height: '844px', background: C.bg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      position: 'relative',
    }}>
      <StatusBar />
      <ChatTopBar
        title="Deposit Dispute"
        langLabel="Marathi · Detected"
        detectedOnly={true}
        onBack={() => navigate('/mobile/home')}
        onLangTap={() => navigate('/mobile/chat/hindi')}
      />

      <Breadcrumb path="घर / भाडेकरू समस्या" />

      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        background: C.bg, padding: '20px 16px 140px',
        scrollbarWidth: 'none',
      } as React.CSSProperties}>
        <MarathiUserBubble
          text="माझ्या मालकाने ६५ दिवस उलटूनही माझे डिपॉझिट परत केलेले नाही."
          time="2:45 PM"
        />
        <MarathiVerdictCard time="2:48 PM" />
        {/* Disclaimer */}
        <p style={{
          fontFamily: SANS, fontSize: '11px', color: '#8A8880',
          textAlign: 'center', margin: '16px 0 8px', lineHeight: 1.55,
        }}>
          LokAI provides legal information, not legal advice.
        </p>
        <div style={{ height: '8px' }} />
      </div>

      <MarathiInputBar />
      <BottomNav active="chat" />
      <HomeIndicator />
    </div>
  );
}

export default function MobileChatMarathi() {
  return (
    <MobileRouteCanvas>
      <MarathiChatArtboard />
    </MobileRouteCanvas>
  );
}
