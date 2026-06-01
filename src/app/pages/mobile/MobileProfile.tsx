import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Settings, ChevronRight, Bell, Shield, HelpCircle } from 'lucide-react';
import { SERIF, SANS, C, GRAD, SHADOW } from '../../components/shared';
import { StatusBar, BottomNav, HomeIndicator, MobileRouteCanvas } from './MobileHome';

// ─── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: on ? '#132846' : '#E8E4DC',
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.2s ease',
      }}
    >
      <div style={{
        position: 'absolute',
        top: '2px', left: on ? '22px' : '2px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#FFFFFF',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
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
      fontFamily: SANS, fontSize: '11px', fontWeight: 600,
      color: '#8A8880', textTransform: 'uppercase', letterSpacing: '0.08em',
    }}>
      {text}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E8E4DC',
      borderRadius: '16px', margin: '0 16px',
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
      background: '#F4F2EE', borderRadius: '12px',
      padding: '16px', marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{
          fontFamily: SANS, fontSize: '16px', fontWeight: 700, color: '#1A1916',
        }}>Free</span>
        <span style={{
          fontFamily: SANS, fontSize: '11px', fontWeight: 500, color: '#8A8880',
          background: '#E8E4DC', borderRadius: '999px', padding: '2px 10px',
        }}>Current plan</span>
      </div>
      <p style={{
        fontFamily: SANS, fontSize: '13px', color: '#4A4840',
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
      background: '#EEF2F8', border: '1px solid #132846',
      borderRadius: '12px', padding: '16px', marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontFamily: SANS, fontSize: '16px', fontWeight: 700, color: '#132846' }}>Citizen</span>
        <span style={{ fontFamily: SANS, fontSize: '14px', fontWeight: 600, color: '#132846' }}>₹199/month</span>
      </div>
      <p style={{
        fontFamily: SANS, fontSize: '13px', color: '#4A4840',
        margin: '0 0 12px', lineHeight: 1.6,
      }}>
        50 questions/day · All 12 languages · 10 documents/month · PDF export
      </p>
      <button style={{
        background: GRAD.buttonPrimary, border: 'none',
        borderRadius: '999px', padding: '10px 20px',
        fontFamily: SANS, fontSize: '14px', fontWeight: 600, color: '#FFFFFF',
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
      background: 'linear-gradient(160deg, #1A1916 0%, #132846 100%)',
      borderRadius: '12px', padding: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{
          fontFamily: SERIF, fontSize: '22px', fontWeight: 400, fontStyle: 'normal', color: '#FFFFFF',
        }}>Counsel</span>
        <span style={{ fontFamily: SANS, fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>₹499/month</span>
      </div>
      <p style={{
        fontFamily: SANS, fontSize: '13px', color: 'rgba(255,255,255,0.75)',
        margin: '0 0 12px', lineHeight: 1.6,
      }}>
        Unlimited · All languages · Unlimited documents · Talk to a lawyer
      </p>
      <button style={{
        background: 'transparent',
        border: '1.5px solid #E8832A',
        borderRadius: '999px', padding: '10px 20px',
        fontFamily: SANS, fontSize: '14px', fontWeight: 600, color: '#E8832A',
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
          width: '36px', height: '36px', borderRadius: '10px',
          background: '#F4F2EE',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon style={{ width: '18px', height: '18px', color: C.navy }} strokeWidth={1.5} />
        </div>
        <span style={{ fontFamily: SANS, fontSize: '14px', color: C.ink, flex: 1 }}>{label}</span>
        {value && (
          <span style={{ fontFamily: SANS, fontSize: '12px', color: C.muted, marginRight: '4px' }}>{value}</span>
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
      width: '390px', height: '844px', background: '#F5F2EC',
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
          fontFamily: SANS, fontSize: '16px', fontWeight: 600, color: '#1A1916',
        }}>Profile</span>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => settingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Settings style={{ width: '20px', height: '20px', color: '#4A4840' }} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        background: '#F5F2EC', scrollbarWidth: 'none',
      } as React.CSSProperties}>

        {/* ── Avatar Section ── */}
        <div style={{
          background: '#FFFFFF', padding: '28px 20px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          borderBottom: `1px solid ${C.border}`, marginBottom: '16px',
        }}>
          {/* Avatar circle — 56px, navy bg, "P" */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: '#132846',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <span style={{
              fontFamily: SERIF, fontSize: '26px', fontWeight: 400,
              color: '#FFFFFF', lineHeight: 1,
            }}>P</span>
          </div>
          {/* Name */}
          <p style={{
            fontFamily: SANS, fontSize: '16px', fontWeight: 600,
            color: '#1A1916', margin: '0 0 4px',
          }}>
            Priya Sharma
          </p>
          {/* Location */}
          <p style={{
            fontFamily: SANS, fontSize: '14px', color: '#4A4840',
            margin: '0 0 10px',
          }}>
            Mumbai, MH
          </p>
          {/* Plan chip — outline style */}
          <div style={{
            border: `1px solid ${C.border}`, borderRadius: '999px',
            padding: '4px 14px', display: 'inline-flex',
          }}>
            <span style={{ fontFamily: SANS, fontSize: '12px', color: '#8A8880' }}>Free Plan</span>
          </div>
        </div>

        {/* ── LANGUAGE Section ── */}
        <SectionLabel text="Language" />
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              {/* Active language chip */}
              <div style={{
                background: '#EEF2F8', border: '1px solid #132846',
                borderRadius: '999px', padding: '5px 14px',
                fontFamily: SANS, fontSize: '14px', fontWeight: 600, color: '#132846',
              }}>
                English
              </div>
              <button style={{
                fontFamily: SANS, fontSize: '14px', fontWeight: 500, color: '#E8832A',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }} onClick={() => navigate('/mobile/onboarding/2')}>
                Change →
              </button>
            </div>
            <p style={{ fontFamily: SANS, fontSize: '13px', color: '#8A8880', margin: 0, lineHeight: 1.5 }}>
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
          fontFamily: SANS, fontSize: '11px', color: '#8A8880',
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
