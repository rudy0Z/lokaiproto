import React from 'react';
import { useNavigate } from 'react-router';
import { SANS, C, SHADOW } from '../../components/shared';
import { StatusBar, BottomNav, HomeIndicator, MobileRouteCanvas } from './MobileHome';
import { ChatTopBar, ChatInputBar } from './MobileChat';

function UserBubble() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
      <div style={{
        maxWidth: '270px',
        background: C.terracotta,
        borderRadius: '18px 18px 4px 18px',
        padding: '12px 16px',
      }}>
        <p style={{ fontFamily: SANS, fontSize: '14px', color: '#FFFFFF', lineHeight: 1.58, margin: 0 }}>
          Can you tell me tomorrow&apos;s cricket score?
        </p>
        <div style={{ textAlign: 'right', marginTop: '5px' }}>
          <span style={{ fontFamily: SANS, fontSize: '11px', color: 'rgba(255,255,255,0.62)' }}>5:21 PM</span>
        </div>
      </div>
    </div>
  );
}

function BoundaryCard({ onAskLegal }: { onAskLegal: () => void }) {
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
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: '5px', background: 'linear-gradient(180deg, #F6A13D 0%, #C86712 100%)',
        }} />
        <div style={{ padding: '18px 22px 16px 24px' }}>
          <div style={{
            fontFamily: SANS, fontSize: '10px', fontWeight: 700, color: C.amber,
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px',
          }}>
            Boundary
          </div>
          <p style={{
            fontFamily: SANS, fontSize: '18px', fontWeight: 600, color: C.ink,
            lineHeight: 1.42, margin: '0 0 10px',
          }}>
            I can help with Indian legal rights, notices, documents, and next-step guidance.
          </p>
          <p style={{ fontFamily: SANS, fontSize: '14px', color: C.textSoft, lineHeight: 1.68, margin: 0 }}>
            Sports results, weather, medicine, and general trivia are outside LokAI&apos;s scope. Ask a legal question and I&apos;ll switch back into the structured legal format.
          </p>
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, background: '#FFF8F2', padding: '14px 22px 18px 24px' }}>
          <div style={{
            fontFamily: SANS, fontSize: '10px', fontWeight: 700, color: C.muted,
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px',
          }}>
            Try instead
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              'How do I reply to a legal notice?',
              'Can my landlord keep my deposit?',
              'How do I file a consumer complaint?',
            ].map((item) => (
              <button
                key={item}
                onClick={onAskLegal}
                style={{
                  width: '100%',
                  border: `1px solid ${C.border}`,
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  color: C.navy,
                  fontFamily: SANS,
                  fontSize: '13px',
                  fontWeight: 500,
                  textAlign: 'left',
                  padding: '11px 14px',
                  cursor: 'pointer',
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileBoundaryArtboard() {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '390px', height: '844px',
      background: [
        'radial-gradient(ellipse 100% 36% at 50% 0%, rgba(221,231,255,0.42), transparent 70%)',
        'linear-gradient(180deg, #FBF8F1 0%, #F8F5EE 100%)',
      ].join(', '),
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
    }}>
      <StatusBar />
      <ChatTopBar
        title="Boundary Example"
        langLabel="English"
        onBack={() => navigate('/mobile/home')}
        onLangTap={() => navigate('/mobile/chat/hindi')}
      />
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px 16px 152px',
        scrollbarWidth: 'none',
      } as React.CSSProperties}>
        <UserBubble />
        <BoundaryCard onAskLegal={() => navigate('/mobile/chat/hindi')} />
        <p style={{
          fontFamily: SANS, fontSize: '11px', color: C.muted,
          textAlign: 'center', margin: '16px 0 8px', lineHeight: 1.55,
        }}>
          LokAI provides legal information, not legal advice.
        </p>
      </div>
      <ChatInputBar placeholder="Ask a legal question instead..." onSend={() => navigate('/mobile/chat/hindi')} />
      <BottomNav active="chat" />
      <HomeIndicator />
    </div>
  );
}

export default function MobileChatBoundary() {
  return (
    <MobileRouteCanvas>
      <MobileBoundaryArtboard />
    </MobileRouteCanvas>
  );
}
