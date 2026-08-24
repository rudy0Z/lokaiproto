import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Settings, ChevronRight, Bell, Shield, HelpCircle } from 'lucide-react';
import { C, GRAD, LAYOUT, SANS, SERIF, SHADOW, TYPE } from '../../components/shared';
import { StatusBar, BottomNav, HomeIndicator, MobileRouteCanvas } from './MobileHome';

// ─── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: '44px', height: '24px', borderRadius: LAYOUT.radius.panel,
        background: on ? C.navy : C.border,
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.2s ease',
      }}
    >
      <div style={{
        position: 'absolute',
        top: '2px', left: on ? '22px' : '2px',
        width: '20px', height: '20px', borderRadius: LAYOUT.radius.full,
        background: '#FFFFFF',
        boxShadow: SHADOW.xs,
        transition: 'left 0.2s ease',
      }} />
    </div>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      padding: '20px 20px 8px',
      fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 600,
      color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em',
    }}>
      {text}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#FFFFFF', border: `1px solid ${C.border}`,
      borderRadius: LAYOUT.radius.card, margin: '0 16px',
      overflow: 'hidden',
      boxShadow: SHADOW.sm,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Subscription Plan Cards ───────────────────────────────────────────────────
function FreePlanCard() {
  return (
    <div style={{
      background: C.surface2, borderRadius: LAYOUT.radius.panel,
      padding: '16px', marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{
          fontFamily: SANS, fontSize: TYPE.h4.size, fontWeight: 700, color: C.ink,
        }}>Free</span>
        <span style={{
          fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 500, color: C.muted,
          background: C.border, borderRadius: LAYOUT.radius.pill, padding: '2px 10px',
        }}>Current plan</span>
      </div>
      <p style={{
        fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft,
        margin: 0, lineHeight: 1.6,
      }}>
        5 questions/day · Hindi + English · 1 document/month
      </p>
    </div>
  );
}

function CitizenPlanCard() {
  return (
    <div style={{
      background: '#EEF2F8', border: `1px solid ${C.navy}`,
      borderRadius: LAYOUT.radius.panel, padding: '16px', marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontFamily: SANS, fontSize: TYPE.h4.size, fontWeight: 700, color: C.navy }}>Citizen</span>
        <span style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 600, color: C.navy }}>₹199/month</span>
      </div>
      <p style={{
        fontFamily: SANS, fontSize: TYPE.small.size, color: C.inkSoft,
        margin: '0 0 12px', lineHeight: 1.6,
      }}>
        50 questions/day · All 12 languages · 10 documents/month · PDF export
      </p>
      <button style={{
        background: GRAD.buttonPrimary, border: 'none',
        borderRadius: LAYOUT.radius.pill, padding: '10px 20px',
        fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 600, color: '#FFFFFF',
        cursor: 'pointer', boxShadow: SHADOW.sm,
      }}>
        Upgrade →
      </button>
    </div>
  );
}

function CounselPlanCard() {
  return (
    <div style={{
      background: `linear-gradient(160deg, ${C.ink} 0%, ${C.navy} 100%)`,
      borderRadius: LAYOUT.radius.panel, padding: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{
          fontFamily: SERIF, fontSize: TYPE.editorialSm.size, fontWeight: 400, fontStyle: 'normal', color: '#FFFFFF',
        }}>Counsel</span>
        <span style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 700, color: '#FFFFFF' }}>₹499/month</span>
      </div>
      <p style={{
        fontFamily: SANS, fontSize: TYPE.small.size, color: 'rgba(255,255,255,0.75)',
        margin: '0 0 12px', lineHeight: 1.6,
      }}>
        Unlimited · All languages · Unlimited documents · Talk to a lawyer
      </p>
      <button style={{
        background: 'transparent',
        border: `1.5px solid ${C.saffron}`,
        borderRadius: LAYOUT.radius.pill, padding: '10px 20px',
        fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 600, color: C.saffron,
        cursor: 'pointer',
      }}>
        Upgrade to Counsel →
      </button>
    </div>
  );
}

// ─── Settings Row ──────────────────────────────────────────────────────────────
function SettingsRow({
  Icon, label, value, last = false, rightSlot,
}: {
  Icon: React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>;
  label: string;
  value?: string;
  last?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <>
      <div style={{
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '14px',
        cursor: 'pointer',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: LAYOUT.radius.control,
          background: C.surface2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon style={{ width: '18px', height: '18px', color: C.navy }} strokeWidth={1.5} />
        </div>
        <span style={{ fontFamily: SANS, fontSize: TYPE.body.size, color: C.ink, flex: 1 }}>{label}</span>
        {value && (
          <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, marginRight: '4px' }}>{value}</span>
        )}
        {rightSlot ?? <ChevronRight style={{ width: '16px', height: '16px', color: '#C8C4BC' }} />}
      </div>
      {!last && <div style={{ height: '1px', background: '#F0EDE8', marginLeft: '66px' }} />}
    </>
  );
}

// ─── Profile Artboard ─────────────────────────────────────────────────────────
export function ProfileArtboard() {
  const navigate = useNavigate();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const settingsRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <div style={{
      width: '390px', height: '844px', background: C.bg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <StatusBar />

      {/* Profile Top Bar — "Profile" centered + gear right */}
      <div style={{
        height: '56px', background: '#FFFFFF',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center',
        padding: '0 20px', flexShrink: 0,
      }}>
        <div style={{ flex: 1 }} />
        <span style={{
          fontFamily: SANS, fontSize: TYPE.h4.size, fontWeight: 600, color: C.ink,
        }}>Profile</span>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => settingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Settings style={{ width: '20px', height: '20px', color: C.inkSoft }} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        background: C.bg, scrollbarWidth: 'none',
      } as React.CSSProperties}>

        {/* ── Avatar Section ── */}
        <div style={{
          background: '#FFFFFF', padding: '28px 20px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          borderBottom: `1px solid ${C.border}`, marginBottom: '16px',
        }}>
          {/* Avatar circle — 56px, navy bg, "P" */}
          <div style={{
            width: '64px', height: '64px', borderRadius: LAYOUT.radius.full,
            background: C.navy,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <span style={{
              fontFamily: SERIF, fontSize: TYPE.editorial.size, fontWeight: 400,
              color: '#FFFFFF', lineHeight: 1,
            }}>P</span>
          </div>
          {/* Name */}
          <p style={{
            fontFamily: SANS, fontSize: TYPE.h4.size, fontWeight: 600,
            color: C.ink, margin: '0 0 4px',
          }}>
            Priya Sharma
          </p>
          {/* Location */}
          <p style={{
            fontFamily: SANS, fontSize: TYPE.body.size, color: C.inkSoft,
            margin: '0 0 10px',
          }}>
            Mumbai, MH
          </p>
          {/* Plan chip — outline style */}
          <div style={{
            border: `1px solid ${C.border}`, borderRadius: LAYOUT.radius.pill,
            padding: '4px 14px', display: 'inline-flex',
          }}>
            <span style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted }}>Free Plan</span>
          </div>
        </div>

        {/* ── LANGUAGE Section ── */}
        <SectionLabel text="Language" />
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              {/* Active language chip */}
              <div style={{
                background: '#EEF2F8', border: `1px solid ${C.navy}`,
                borderRadius: LAYOUT.radius.pill, padding: '5px 14px',
                fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 600, color: C.navy,
              }}>
                English
              </div>
              <button style={{
                fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 500, color: C.saffron,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }} onClick={() => navigate('/mobile/onboarding/2')}>
                Change →
              </button>
            </div>
            <p style={{ fontFamily: SANS, fontSize: TYPE.small.size, color: C.muted, margin: 0, lineHeight: 1.5 }}>
              Responses match the language you type or speak
            </p>
          </div>
        </Card>

        {/* ── SUBSCRIPTION Section ── */}
      <SectionLabel text="Subscription" />
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <FreePlanCard />
        <div onClick={() => navigate('/mobile/login')}><CitizenPlanCard /></div>
        <div onClick={() => navigate('/mobile/login')}><CounselPlanCard /></div>
      </div>

      {/* ── SETTINGS Section ── */}
        <div ref={settingsRef}>
          <SectionLabel text="Settings" />
        </div>
        <Card style={{ marginBottom: '16px' }}>
          <SettingsRow
            Icon={Bell}
            label="Notifications"
            rightSlot={<Toggle on={notificationsOn} onToggle={() => setNotificationsOn(!notificationsOn)} />}
          />
          <SettingsRow Icon={Shield} label="Privacy" />
          <SettingsRow Icon={HelpCircle} label="Help & Support" last />
        </Card>

        {/* ── Disclaimer ── */}
        <p style={{
          fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted,
          textAlign: 'center', padding: '8px 32px 28px', lineHeight: 1.65,
        }}>
          LokAI provides legal information, not legal advice.
        </p>
      </div>

      <BottomNav active="profile" />
      <HomeIndicator />
    </div>
  );
}

// ─── Route page ────────────────────────────────────────────────────────────────
export default function MobileProfile() {
  return (
    <MobileRouteCanvas>
      <ProfileArtboard />
    </MobileRouteCanvas>
  );
}
