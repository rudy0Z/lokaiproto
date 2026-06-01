import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Copy, BookmarkPlus, Paperclip, ChevronDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { SERIF, SANS, MONO, C, GRAD, SHADOW, Btn } from '../../components/shared';
import { StatusBar, BottomNav, HomeIndicator, MobileRouteCanvas } from './MobileHome';

// ─── Chat Top Bar — back arrow + title + language chip ─────────────────────────
export function ChatTopBar({
  title,
  langLabel = 'English',
  onBack,
  onLangTap,
  detectedOnly = false,
}: {
  title: string;
  langLabel?: string;
  onBack?: () => void;
  onLangTap?: () => void;
  detectedOnly?: boolean;
}) {
  return (
    <div style={{
      height: '56px', background: 'transparent',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: '10px', flexShrink: 0,
    }}>
      {/* Back arrow */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0,
        }}
      >
        <ArrowLeft style={{ width: '20px', height: '20px', color: '#4A4840' }} />
      </button>

      {/* Title/breadcrumb */}
      <span style={{
        fontFamily: SANS, fontSize: '15px', fontWeight: 600,
        color: '#1A1916', flex: 1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {title}
      </span>

      {/* Language chip */}
      <button
        onClick={onLangTap}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: '#EEF2F8', border: `1px solid ${C.navy}`,
          borderRadius: '999px', padding: '5px 10px',
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: '12px', fontWeight: 500, color: C.navy }}>
          {langLabel}
        </span>
        {!detectedOnly && (
          <ChevronDown style={{ width: '10px', height: '10px', color: C.navy }} />
        )}
      </button>
    </div>
  );
}

// ─── User Bubble — terracotta, right-aligned ───────────────────────────────────
// Spec: radius 18px 18px 4px 18px
function UserBubble({ text, time }: { text: string; time: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
      <div style={{
        maxWidth: '285px',
        background: C.terracotta,
        borderRadius: '18px 18px 4px 18px',
        padding: '11px 15px',
      }}>
        <p style={{ fontFamily: SANS, fontSize: '14px', color: 'white', lineHeight: 1.58, margin: 0 }}>
          {text}
        </p>
        <div style={{ textAlign: 'right', marginTop: '5px' }}>
          <span style={{ fontFamily: SANS, fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{time}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Response Card — mobile adapted ───────────────────────────────────────────
// Left border 5px saffron gradient · shadow-md · radius 16px
// Zone 1 "THE LAW": DM Serif italic 18px · padding 16px
// Zone 2 "YOUR POSITION": 14px Plus Jakarta Sans · #FAFAF8 bg
// Zone 3 "WHAT YOU CAN DO": 14px · #FAFAF8 bg · gradient CTA full width
function ResponseCard({ time }: { time: string }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed < 3) {
      const t = setTimeout(() => setRevealed(r => r + 1), revealed === 0 ? 250 : 380);
      return () => clearTimeout(t);
    }
  }, [revealed]);

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* LokAI label */}
      <div style={{ fontFamily: SANS, fontSize: '11px', color: C.muted, marginBottom: '8px' }}>
        LokAI
      </div>

      {/* Card */}
      <div style={{
        background: '#FFFFFF', border: `1px solid ${C.border}`,
        borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 12px 34px rgba(26,25,22,0.10)', position: 'relative',
      }}>
        {/* Saffron gradient left border — 5px */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: '5px', background: GRAD.verdict,
          borderRadius: '16px 0 0 16px',
        }} />

        {/* Zone 1 — THE LAW */}
        <AnimatePresence>
          {revealed >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <div style={{ padding: '16px 22px 15px' }}>
                <div style={{
                  fontFamily: SANS, fontSize: '10px', fontWeight: 600,
                  color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.12em',
                  marginBottom: '8px',
                }}>
                  What the Law Says
                </div>
                {/* Heading — DM Serif 22px weight 400, NOT italic */}
                <p style={{
                  fontFamily: SERIF, fontSize: '20px', fontWeight: 400, fontStyle: 'normal',
                  color: '#1A1916', lineHeight: 1.34, margin: 0,
                }}>
                  A landlord cannot withhold a ₹40,000 security deposit
                  <span style={{ marginLeft: '10px', display: 'inline-block', verticalAlign: 'middle' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: C.navy, color: '#FFFFFF',
                      fontFamily: MONO, fontSize: '10px', fontWeight: 500,
                      borderRadius: '4px', padding: '3px 8px',
                      whiteSpace: 'nowrap', letterSpacing: '0.01em',
                    }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFFFFF', opacity: 0.8, flexShrink: 0 }} />
                      MRC Act · S.24
                    </span>
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone 2 — YOUR POSITION (#FAFAF8 bg) */}
        <AnimatePresence>
          {revealed >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <div style={{ padding: '15px 22px', background: '#FAFAF8', borderTop: '1px solid #E8E4DC' }}>
                <div style={{
                  fontFamily: SANS, fontSize: '10px', fontWeight: 600,
                  color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.12em',
                  marginBottom: '8px',
                }}>
                  Your Position
                </div>
                <p style={{ fontFamily: SANS, fontSize: '14px', color: '#4A4840', lineHeight: 1.58, margin: 0 }}>
                  Your position is strong. 65 days have passed — exceeding the statutory deadline. Without written proof of damage, the landlord cannot make deductions.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone 3 — WHAT YOU CAN DO (#FAFAF8 bg) */}
        <AnimatePresence>
          {revealed >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <div style={{ padding: '15px 22px 14px', background: '#FAFAF8', borderTop: '1px solid #E8E4DC' }}>
                <div style={{
                  fontFamily: SANS, fontSize: '10px', fontWeight: 600,
                  color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.12em',
                  marginBottom: '8px',
                }}>
                  What you can do
                </div>
                {/* Primary CTA — gradient full width */}
                <button style={{
                  width: '100%', height: '40px',
                  background: GRAD.buttonPrimary, border: 'none',
                  borderRadius: '999px',
                  fontFamily: SANS, fontSize: '15px', fontWeight: 600, color: '#FFFFFF',
                  cursor: 'pointer', marginBottom: '10px',
                  boxShadow: SHADOW.sm,
                }}>
                  Draft Demand Notice
                </button>
                <button style={{
                  width: '100%', background: 'transparent', border: 'none',
                  fontFamily: SANS, fontSize: '13px', color: C.navy,
                  cursor: 'pointer', padding: '4px', textAlign: 'center', display: 'block',
                }}>
                  Learn More →
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
              padding: '8px 16px 9px 20px',
              borderTop: `1px solid ${C.bgRaised}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#FFFFFF',
            }}
          >
            <span style={{ fontFamily: SANS, fontSize: '11px', color: C.muted }}>{time}</span>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Copy        style={{ width: '14px', height: '14px', color: C.muted }} />
              <BookmarkPlus style={{ width: '14px', height: '14px', color: C.muted }} />
              <Volume2     style={{ width: '14px', height: '14px', color: C.muted }} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Input Bar — floating pill treatment ──────────────────────────────────────
export function ChatInputBar({ placeholder = 'Tell us your problem...', onSend }: { placeholder?: string; onSend?: () => void }) {
  return (
    <button onClick={onSend} style={{
      position: 'absolute',
      bottom: '80px',      // 64px bottom-nav + 16px gap
      left: '16px',
      right: '16px',
      height: '56px',
      background: '#FFFFFF',
      borderRadius: '999px',
      border: `1.5px solid ${C.navy}`,
      boxShadow: '0 14px 34px rgba(26,25,22,0.16), 0 0 0 4px rgba(16,42,76,0.055)',
      display: 'flex', alignItems: 'center',
      padding: '0 10px',
      gap: '8px',
      zIndex: 20,
      cursor: 'pointer',
      textAlign: 'left',
    }}>
      {/* Voice orb — 36px, navy mic */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
        background: C.bgRaised, border: `1.5px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" stroke={C.navy} strokeWidth="1.2" />
          <path d="M3 8.5C3 11.3 5.2 13.5 8 13.5C10.8 13.5 13 11.3 13 8.5" stroke={C.navy} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="8" y1="13.5" x2="8" y2="15.5" stroke={C.navy} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Placeholder */}
      <span style={{ flex: 1, fontFamily: SANS, fontSize: '14px', color: '#8A8880' }}>
        {placeholder}
      </span>

      {/* Send arrow — 32px gradient circle */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
        background: GRAD.buttonPrimary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}>
        <ArrowRight style={{ width: '14px', height: '14px', color: '#FFFFFF' }} />
      </div>

      {/* Paperclip */}
      <Paperclip style={{ width: '18px', height: '18px', color: C.muted, flexShrink: 0, marginRight: '6px' }} />
    </button>
  );
}

// ─── Chat Artboard ────────────────────────────────────────────────────────────
export function ChatArtboard() {
  const navigate = useNavigate();
  const [continued, setContinued] = useState(false);

  return (
    <div style={{
      width: '390px', height: '844px',
      background: [
        'radial-gradient(ellipse 100% 36% at 50% 0%, rgba(221,231,255,0.54), transparent 70%)',
        'linear-gradient(180deg, #FBF8F1 0%, #F8F5EE 100%)',
      ].join(', '),
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      position: 'relative',
    }}>
      <StatusBar />
      <ChatTopBar
        title="Tenancy Issue"
        langLabel="English"
        onBack={() => navigate('/mobile/home')}
        onLangTap={() => navigate('/mobile/chat/tamil')}
      />

      {/* Chat scroll area — bottom padding for floating bar */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        background: 'transparent', padding: '14px 16px 156px',
        scrollbarWidth: 'none',
      } as React.CSSProperties}>
        <UserBubble
          text="My landlord hasn't returned my ₹40,000 deposit after 65 days."
          time="4:12 PM"
        />
        <ResponseCard time="4:16 PM" />
        {continued && (
          <>
            <UserBubble
              text="Can you draft the notice in Hindi as well?"
              time="4:17 PM"
            />
            <div style={{
              marginBottom: '16px',
              background: '#FFFFFF',
              border: `1px solid ${C.border}`,
              borderRadius: '16px',
              boxShadow: '0 12px 34px rgba(26,25,22,0.10)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 5,
                background: GRAD.verdict,
              }} />
              <div style={{ padding: '16px 20px 16px 24px' }}>
                <div style={{
                  fontFamily: SANS,
                  fontSize: '10px',
                  fontWeight: 700,
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: 8,
                }}>
                  Draft Ready
                </div>
                <p lang="hi" style={{
                  fontFamily: SANS,
                  fontSize: '14px',
                  lineHeight: 1.82,
                  color: C.ink,
                  margin: 0,
                }}>
                  हाँ. मैं 15 दिन की समय-सीमा वाला मांग नोटिस बना सकता हूँ, जिसमें जमा राशि, खाली करने की तारीख और भुगतान का तरीका साफ लिखा होगा.
                </p>
              </div>
            </div>
          </>
        )}
        {/* Disclaimer */}
        <p style={{
          fontFamily: SANS, fontSize: '11px', color: '#8A8880',
          textAlign: 'center', margin: '16px 0 8px', lineHeight: 1.55,
        }}>
          LokAI provides legal information, not legal advice.
        </p>
        <div style={{ height: '8px' }} />
      </div>

      {/* Input bar — Hindi placeholder */}
      <ChatInputBar
        placeholder={continued ? 'Continue the conversation...' : 'Tap to continue — any language'}
        onSend={() => setContinued(true)}
      />
      <BottomNav active="chat" />
      <HomeIndicator />
    </div>
  );
}

// ─── Route page ────────────────────────────────────────────────────────────────
export default function MobileChat() {
  return (
    <MobileRouteCanvas>
      <ChatArtboard />
    </MobileRouteCanvas>
  );
}
