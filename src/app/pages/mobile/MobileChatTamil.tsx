import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Volume2, Copy, BookmarkPlus, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERIF, SANS, MONO, C, GRAD, SHADOW } from '../../components/shared';
import { StatusBar, BottomNav, HomeIndicator, MobileRouteCanvas } from './MobileHome';
import { ChatTopBar } from './MobileChat';

// ─── Tamil Chat — cross-script capability proof ───────────────────────────────
// User types in Tamil → LokAI responds in Tamil.
// Zone labels remain English (universal). Plus Jakarta Sans throughout
// (DM Serif Display does not cover Tamil Unicode block).
// ─────────────────────────────────────────────────────────────────────────────

// ─── User Bubble — Tamil input, terracotta ────────────────────────────────────
function TamilUserBubble({ text, time }: { text: string; time: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
      <div style={{
        maxWidth: '285px',
        background: C.terracotta,
        borderRadius: '18px 18px 4px 18px',
        padding: '12px 16px',
      }}>
        <p style={{ fontFamily: SANS, fontSize: '15px', color: 'white', lineHeight: 1.7, margin: 0 }}>
          {text}
        </p>
        <div style={{ textAlign: 'right', marginTop: '5px' }}>
          <span style={{ fontFamily: SANS, fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{time}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tamil Response Card ───────────────────────────────────────────────────────
// Left border 5px saffron gradient · shadow-md · radius 16px
// Zone labels: English ("THE LAW" / "YOUR POSITION" / "WHAT YOU CAN DO")
// Zone content: Tamil throughout (Plus Jakarta Sans — covers all Indian scripts)
// DM Serif Display is NOT used here — no Tamil Unicode coverage
function TamilResponseCard({ time }: { time: string }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed < 3) {
      const t = setTimeout(() => setRevealed(r => r + 1), revealed === 0 ? 250 : 380);
      return () => clearTimeout(t);
    }
  }, [revealed]);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontFamily: SANS, fontSize: '11px', color: C.muted, marginBottom: '8px' }}>
        LokAI
      </div>

      <div style={{
        background: '#FFFFFF', border: `1px solid ${C.border}`,
        borderRadius: '16px', overflow: 'hidden',
        boxShadow: SHADOW.md, position: 'relative',
      }}>
        {/* Saffron gradient left border — 5px */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: '5px', background: GRAD.verdict,
          borderRadius: '16px 0 0 16px',
        }} />

        {/* Zone 1 — சட்டம் என்ன சொல்கிறது */}
        <AnimatePresence>
          {revealed >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <div style={{ padding: '20px 24px' }}>
                <div style={{
                  fontFamily: SANS, fontSize: '10px', fontWeight: 600,
                  color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.12em',
                  marginBottom: '10px',
                }}>
                  What the Law Says
                </div>
                {/* Zone 1 main content — 22px, system font fallback for Tamil glyphs */}
                <p style={{
                  fontFamily: SERIF, fontSize: '22px', fontWeight: 400, fontStyle: 'normal',
                  color: '#1A1916', lineHeight: 1.45, margin: 0,
                }}>
                  மின்-வணிக விதிகள் 2020 இன் படி, முன்னறிவிப்பு இல்லாமல் கணக்கை முடக்குவது நியாயமற்ற வர்த்தக முறையாகும்.
                  <span style={{ marginLeft: '10px', display: 'inline-block', verticalAlign: 'middle' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: C.navy, color: '#FFFFFF',
                      fontFamily: MONO, fontSize: '10px', fontWeight: 500,
                      borderRadius: '4px', padding: '3px 8px',
                      whiteSpace: 'nowrap', letterSpacing: '0.01em',
                    }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFFFFF', opacity: 0.8, flexShrink: 0 }} />
                      Consumer Protection (E-Commerce) Rules · 2020
                    </span>
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone 2 — உங்கள் நிலை (#FAFAF8 bg) */}
        <AnimatePresence>
          {revealed >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <div style={{ padding: '20px 24px', background: '#FAFAF8', borderTop: '1px solid #E8E4DC' }}>
                <div style={{
                  fontFamily: SANS, fontSize: '10px', fontWeight: 600,
                  color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.12em',
                  marginBottom: '10px',
                }}>
                  Your Position
                </div>
                <p style={{ fontFamily: SANS, fontSize: '15px', color: '#4A4840', lineHeight: 1.7, margin: 0 }}>
                  உங்கள் ₹3,400 நிலுவைத் தொகையை நிறுத்தி வைக்க தளத்திற்கு உரிமை இல்லை.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone 3 — அடுத்த நடவடிக்கை (#FAFAF8 bg) */}
        <AnimatePresence>
          {revealed >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <div style={{ padding: '20px 24px', background: '#FAFAF8', borderTop: '1px solid #E8E4DC' }}>
                <div style={{
                  fontFamily: SANS, fontSize: '10px', fontWeight: 600,
                  color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.12em',
                  marginBottom: '12px',
                }}>
                  What You Can Do
                </div>
                {/* Gradient CTA full width */}
                <button style={{
                  width: '100%', height: '44px',
                  background: GRAD.buttonPrimary, border: 'none',
                  borderRadius: '999px',
                  fontFamily: SANS, fontSize: '15px', fontWeight: 600, color: '#FFFFFF',
                  cursor: 'pointer', marginBottom: '10px',
                  boxShadow: SHADOW.sm,
                }}>
                  Draft Complaint Letter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {revealed >= 3 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            style={{
              padding: '10px 16px 12px 20px',
              borderTop: `1px solid ${C.bgRaised}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#FFFFFF',
            }}
          >
            <span style={{ fontFamily: SANS, fontSize: '11px', color: C.muted }}>{time}</span>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Copy         style={{ width: '14px', height: '14px', color: C.muted }} />
              <BookmarkPlus style={{ width: '14px', height: '14px', color: C.muted }} />
              <Volume2      style={{ width: '14px', height: '14px', color: C.muted }} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Tamil Input Bar — floating pill treatment ───────────────────────────────
function TamilInputBar() {
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
        width: '36px', height: '36px', borderRadius: '50%',
        background: C.bgRaised, border: `1.5px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, cursor: 'pointer',
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" stroke={C.navy} strokeWidth="1.2" />
          <path d="M3 8.5C3 11.3 5.2 13.5 8 13.5C10.8 13.5 13 11.3 13 8.5" stroke={C.navy} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="8" y1="13.5" x2="8" y2="15.5" stroke={C.navy} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
      {/* Tamil placeholder */}
      <span style={{ flex: 1, fontFamily: SANS, fontSize: '14px', color: '#8A8880' }}>
        Tell us your problem...
      </span>
      <Paperclip style={{ width: '18px', height: '18px', color: C.muted, flexShrink: 0, marginRight: '6px' }} />
    </div>
  );
}

// ─── Tamil Chat Artboard ──────────────────────────────────────────────────────
export function TamilChatArtboard() {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '390px', height: '844px', background: '#F5F2EC',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <StatusBar />

      {/* Top bar: back + "டெலிவரி சிக்கல்" + "தமிழ் கண்டறியப்பட்டது" chip — transparent bg */}
      <ChatTopBar
        title="Delivery Issue"
        langLabel="Tamil · Detected"
        detectedOnly={true}
        onBack={() => navigate('/mobile/home')}
        onLangTap={() => navigate('/mobile/chat/marathi')}
      />

      {/* Chat scroll — bottom padding for floating bar */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        background: '#F5F2EC', padding: '20px 16px 140px',
        scrollbarWidth: 'none',
      } as React.CSSProperties}>
        <TamilUserBubble
          text="என் டெலிவரி ஐடி திடீரென முடக்கப்பட்டுள்ளது. என் ₹3,400 நிலுவைத் தொகையும் தடுக்கப்பட்டுள்ளது."
          time="3:45 PM"
        />
        <TamilResponseCard time="3:48 PM" />
        {/* Disclaimer */}
        <p style={{
          fontFamily: SANS, fontSize: '11px', color: '#8A8880',
          textAlign: 'center', margin: '16px 0 8px', lineHeight: 1.55,
        }}>
          LokAI provides legal information, not legal advice.
        </p>
        <div style={{ height: '8px' }} />
      </div>

      <TamilInputBar />
      <BottomNav active="chat" />
      <HomeIndicator />
    </div>
  );
}

// ─── Route page ────────────────────────────────────────────────────────────────
export default function MobileChatTamil() {
  return (
    <MobileRouteCanvas>
      <TamilChatArtboard />
    </MobileRouteCanvas>
  );
}
