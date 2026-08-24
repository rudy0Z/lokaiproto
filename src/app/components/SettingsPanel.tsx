import React, { useState } from 'react';
import { X } from 'lucide-react';
import { C, GRAD, LAYOUT, PLANE, SANS, SHADOW, TYPE } from './shared';
import { useSidebar } from '../context/SidebarContext';

import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'ta', label: 'Tamil' },
  { id: 'mr', label: 'Marathi' },
];

// ─── Language chip grid ───────────────────────────────────────────────────────
function LangGrid({
  options, selected, onSelect,
}: {
  options: { id: string; label: string }[];
  selected: string;
  onSelect: (l: any) => void;
}) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px', padding: '0 24px',
    }}>
      {options.map(lang => {
        const active = lang.id === selected;
        return (
          <button
            key={lang.id}
            onClick={() => onSelect(lang.id)}
            style={{
              fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: active ? 500 : 400,
              color: active ? C.navy : C.inkSoft,
              background: active ? 'linear-gradient(135deg, rgba(221,231,255,0.72), rgba(255,244,226,0.72))' : '#FFFFFF',
              border: `1px solid ${active ? C.navy : C.border}`,
              borderRadius: LAYOUT.radius.panel, padding: '11px 8px',
              cursor: 'pointer', textAlign: 'center',
              boxShadow: active ? '0 8px 18px rgba(16,42,76,0.08)' : 'none',
              transition: 'background 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease',
            }}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: SANS, fontSize: TYPE.label.size, fontWeight: 500,
      color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em',
      padding: '20px 24px 10px',
    }}>
      {label}
    </div>
  );
}

// ─── Thin divider ─────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: '1px', background: '#EEEBE4', flexShrink: 0 }} />;
}

// ─── Settings Panel ──────────────────────────────────────────────────────────
export function SettingsPanel() {
  const { settingsOpen, closeSettings } = useSidebar();
  const { uiLang, setUiLang } = useLanguage();

  const accountRows = [
    {
      label: 'Prototype guide',
      badge: null,
    },
    {
      label: 'Plain-language legal terms',
      badge: null,
    },
    {
      label: 'Accessibility',
      badge: null,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {settingsOpen && (
        <div
          onClick={closeSettings}
          style={{
            position: 'fixed', inset: 0,
            zIndex: 190,
            background: 'transparent',
          }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 12, left: 12,
        width: '336px',
        height: 'calc(100vh - 24px)',
        zIndex: 200,
        background: PLANE.reading,
        border: '1px solid rgba(16,42,76,0.10)',
        borderRadius: LAYOUT.radius.plane,
        boxShadow: settingsOpen ? '0 28px 70px rgba(16,42,76,0.24)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: settingsOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
        transition: 'transform 0.24s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease',
      }}>

        {/* ── Header ───────────────────────────────────────── */}
        <div style={{
          padding: '24px 24px 18px',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontFamily: SANS, fontSize: TYPE.h3.size, fontWeight: 700,
              color: C.ink, marginBottom: '14px',
            }}>
              Settings
            </div>
            {/* User info row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: LAYOUT.radius.full,
                background: GRAD.buttonPrimary, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
                boxShadow: SHADOW.sm,
              }}>
                <span style={{ fontFamily: SANS, fontSize: TYPE.body.size, color: '#FFFFFF', fontWeight: 800, lineHeight: 1 }}>P</span>
              </div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 700, color: C.ink }}>
                  Priya Sharma
                </div>
                <div style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, marginTop: '2px' }}>
                  Mumbai · Legal prototype
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={closeSettings}
            style={{
              background: '#FFFFFF', border: `1px solid ${C.border}`, cursor: 'pointer',
              width: 34, height: 34, borderRadius: LAYOUT.radius.panel, color: C.muted, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: SHADOW.md,
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <Divider />

        {/* ── Language Preferences ─────────────────────────── */}
        {/* Language gradient: 3px top border — celebratory, language selector only */}
        <div className="settings-scroll" style={{ overflowY: 'auto', flex: 1, paddingBottom: 20 }}>
          <div style={{ height: '3px', background: GRAD.language, flexShrink: 0 }} />
          <SectionHeading label="Language Preferences" />

          {/* Language Preference */}
          <div style={{ padding: '0 24px 14px' }}>
            <div style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 650, color: C.ink, marginBottom: '4px' }}>
              System Language
            </div>
            <div style={{ fontFamily: SANS, fontSize: TYPE.caption.size, color: C.muted, marginBottom: '12px', lineHeight: 1.5 }}>
              Sets menus, labels, and placeholders. Chat answers still adapt to the language you type.
            </div>
          </div>
          <LangGrid options={LANGUAGES} selected={uiLang} onSelect={setUiLang} />

          {/* Info card */}
          <div style={{
            background: 'rgba(255,255,255,0.72)', borderRadius: LAYOUT.radius.card,
            border: `1px solid ${C.border}`,
            padding: '14px 16px', margin: '18px 24px 0',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            flexShrink: 0,
          }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: LAYOUT.radius.full,
              background: GRAD.buttonPrimary,
              flexShrink: 0, marginTop: '1px',
            }} />
            <p style={{
              fontFamily: SANS, fontSize: TYPE.small.size, fontWeight: 400,
              color: C.inkSoft, lineHeight: 1.6, margin: 0,
            }}>
              Chat responses automatically match the language you type or speak in.
            </p>
          </div>

          <div style={{ marginTop: '20px', flexShrink: 0 }}>
            <Divider />
          </div>

          {/* ── Account ──────────────────────────────────────── */}
          <SectionHeading label="Prototype" />

          <div style={{ margin: '0 24px', border: `1px solid ${C.border}`, borderRadius: LAYOUT.radius.card, overflow: 'hidden', background: 'rgba(255,255,255,0.70)' }}>
            {accountRows.map((row) => (
              <div
                key={row.label}
                style={{
                  height: '50px', padding: '0 14px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: row.label === accountRows[accountRows.length - 1].label ? 'none' : '1px solid #F0ECE5',
                  cursor: 'default',
                }}
              >
                <span style={{ fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 500, color: C.ink }}>
                  {row.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {row.badge}
                  <span style={{ fontFamily: SANS, fontSize: TYPE.micro.size, color: C.muted }}>Demo</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Restart demo ──────────────────────────────────── */}
          <div style={{ padding: '24px', flexShrink: 0 }}>
            <button onClick={() => window.location.assign('#/desktop')} style={{
              fontFamily: SANS, fontSize: TYPE.body.size, fontWeight: 600,
              color: C.navy, background: 'rgba(16,42,76,0.06)',
              border: '1px solid rgba(16,42,76,0.12)',
              borderRadius: LAYOUT.radius.panel,
              cursor: 'pointer', padding: '10px 14px', display: 'block',
              width: '100%',
            }}>
              Restart prepared demo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
