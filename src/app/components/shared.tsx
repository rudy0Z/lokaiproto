import React, { useState, useEffect, useRef } from 'react';

// ─── Font constants ───────────────────────────────────────────────────────────
export const EDITORIAL = '"Fraunces", Georgia, serif';
export const SANS = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", monospace';
export const DEVANAGARI = '"Noto Sans Devanagari", "Inter", sans-serif';
export const TAMIL = '"Noto Sans Tamil", "Inter", sans-serif';
export const BENGALI = '"Noto Sans Bengali", "Inter", sans-serif';

// Backwards compatibility for now (Step 1)
export const SERIF = EDITORIAL;

export const TYPE = {
  // Display — editorial only
  display1: { family: EDITORIAL, size: '56px', weight: 300, lineHeight: 1.05, letterSpacing: '-0.02em' },
  display2: { family: EDITORIAL, size: '36px', weight: 300, lineHeight: 1.1,  letterSpacing: '-0.015em' },
  // UI
  h3:       { family: SANS, size: '20px', weight: 600, lineHeight: 1.3,  letterSpacing: '-0.01em' },
  h4:       { family: SANS, size: '16px', weight: 600, lineHeight: 1.4  },
  body:     { family: SANS, size: '14px', weight: 400, lineHeight: 1.55 },
  bodyStrong:{ family: SANS, size: '14px', weight: 500, lineHeight: 1.55 },
  small:    { family: SANS, size: '13px', weight: 400, lineHeight: 1.5  },
  micro:    { family: SANS, size: '11px', weight: 500, lineHeight: 1.3, letterSpacing: '0.08em', textTransform: 'uppercase' as const },
} as const;

// ─── Full Color System ────────────────────────────────────────────────────────
export const C = {
  // Canvas
  bg:        '#F8F5EE',
  surface:   '#FFFFFF',
  surface2:  '#FBF8F1',
  washBlue:  '#DDE7FF',
  washGold:  '#FFE3B8',
  washRose:  '#F5D8D4',
  // Ink
  ink:       '#181713',
  inkSoft:   '#48453D',
  muted:     '#858078',
  // Structure
  border:    '#E7E0D4',
  borderStrong: '#CFC5B6',
  // Brand
  navy:      '#102A4C',
  saffron:   '#E9852B',
  oxblood:   '#6B1F1F',
  // Semantic
  green:     '#1F6B3A',
  red:       '#B8361C',
  amber:     '#8A4500',
  
  // Backwards compat aliases to keep build green until Step 3 sweep
  bgRaised:  '#FBF8F1',
  navyDark:  '#0B1E37',
  navySoft:  'rgba(16,42,76,0.08)',
  saffronDark: '#C86712',
  saffronSoft: 'rgba(233,133,43,0.10)',
  deepAmber: '#E9852B',
  terracotta: '#C4724A',
  teal:      '#132846',
  oxbloodDark: '#6B1F1F',
  oxbloodSoft: 'rgba(107,31,31,0.08)',
  text:      '#1A1916',
  textSoft:  '#4A4840',
  textDisabled: '#8A8880',
  onDark:    '#FFFFFF',
  onDarkSoft: 'rgba(255,255,255,0.65)',
  borderLight: '#E5E0D6',
  borderFocus: '#132846',
  rule:      '#E5E0D6',
  successSoft: 'rgba(31,107,58,0.08)',
  cautionSoft: 'rgba(138,69,0,0.08)',
  errorSoft:   'rgba(184,54,28,0.08)',
  badgeBg:     'rgba(19,40,70,0.08)',
  badgeText:   '#132846',
  badgeBorder: '#CDCAC4',
} as const;

// ─── Spacing & Layout System ──────────────────────────────────────────────────
export const S = {
  0:   '0',
  1:   '4px',
  2:   '8px',
  3:   '12px',
  4:   '16px',
  5:   '24px',
  6:   '32px',
  7:   '48px',
  8:   '64px',
  9:   '96px',
  10:  '128px',
} as const;

export const LAYOUT = {
  maxContent:   '1120px',
  maxReading:   '720px',
  sidebarOpen:  '240px',
  sidebarShut:  '64px',
  headerH:      '56px',
  composerH:    '88px',
  sectionGapY:  S[9],
  sectionPadX:  S[7],
  cardGap:      S[4],
  radius: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    pill: '999px',
  },
} as const;

// ─── Gradient & Wash System ───────────────────────────────────────────────────
export const GRAD = {
  heroCanvas: [
    'radial-gradient(ellipse 68% 54% at 50% 18%, rgba(221,231,255,0.90) 0%, rgba(221,231,255,0.38) 35%, transparent 68%)',
    'radial-gradient(ellipse 58% 44% at 46% 72%, rgba(255,179,80,0.36) 0%, rgba(255,227,184,0.20) 46%, transparent 74%)',
    'radial-gradient(ellipse 50% 38% at 68% 68%, rgba(245,216,212,0.30) 0%, transparent 70%)',
    'linear-gradient(180deg, #FFFDFC 0%, #F8F5EE 100%)',
  ].join(', '),
  cardLift: 'linear-gradient(174deg, #FFFFFF 0%, #FBF8F1 100%)',
  oxbloodStamp: 'linear-gradient(135deg, #7A2020 0%, #6B1F1F 100%)',

  // Backwards compat
  brand: 'linear-gradient(160deg, #12110E 0%, #102A4C 100%)',
  verdict: 'linear-gradient(180deg, #F6A13D 0%, #E9852B 100%)',
  language: 'linear-gradient(90deg, #E9852B, #102A4C)',
  buttonPrimary: 'linear-gradient(180deg, #183B6B 0%, #102A4C 100%)',
  buttonHover: 'linear-gradient(180deg, #234B7F 0%, #183B6B 100%)',
} as const;

export const WASH = {
  heroCanvas: GRAD.heroCanvas,
  cardLift: GRAD.cardLift,
  oxbloodStamp: GRAD.oxbloodStamp,
  // Backwards compat
  languageSpectrum: 'linear-gradient(90deg, #E8832A 0%, #132846 100%)',
  sectionFade: 'linear-gradient(to bottom, rgba(245,242,236,0) 0%, #F5F2EC 100%)',
} as const;

// ─── Shadow System ────────────────────────────────────────────────────────────
export const SHADOW = {
  xs:    '0 1px 2px rgba(26,25,22,0.04)',
  sm:    '0 1px 2px rgba(26,25,22,0.035), 0 3px 10px rgba(26,25,22,0.045)',
  md:    '0 2px 5px rgba(26,25,22,0.04), 0 8px 24px rgba(26,25,22,0.065)',
  lg:    '0 14px 42px rgba(26,25,22,0.10), 0 3px 10px rgba(26,25,22,0.04)',
  float: '0 22px 60px rgba(26,25,22,0.13), 0 6px 18px rgba(26,25,22,0.07)',
} as const;

// ─── Card base style ──────────────────────────────────────────────────────────
export const CARD = {
  base: {
    background:   C.surface,
    border:       `1px solid ${C.border}`,
    borderRadius: LAYOUT.radius.md,
    boxShadow:    SHADOW.xs,
  } as React.CSSProperties,

  featured: {
    background:   GRAD.cardLift,
    border:       `1.5px solid ${C.borderStrong}`,
    borderRadius: LAYOUT.radius.md,
    boxShadow:    SHADOW.md,
  } as React.CSSProperties,

  verdict: {
    background:   C.surface,
    border:       `1px solid ${C.border}`,
    borderLeft:   `3px solid ${C.oxblood}`,
    borderRadius: LAYOUT.radius.md,
    boxShadow:    SHADOW.xs,
  } as React.CSSProperties,
} as const;

export const CARD_BASE = CARD.base;

// ─── Badge style token ────────────────────────────────────────────────────────
export const BADGE: React.CSSProperties = {
  fontFamily:  SANS,
  fontSize:    '11px',
  fontWeight:  500,
  color:       C.navy,
  background:  'rgba(19,40,70,0.08)',
  border:      `1px solid ${C.borderStrong}`,
  borderRadius:'6px',
  padding:     '3px 10px',
  display:     'inline-block',
  whiteSpace:  'nowrap',
};

// ─── Global animation keyframes (inject once) ─────────────────────────────────
const SHARED_ANIM_ID = 'lokai-shared-anim';
const SHARED_ANIM_CSS = `
@keyframes lokaiPulseRing {
  0%   { transform: scale(1);    opacity: 0.5; }
  100% { transform: scale(1.55); opacity: 0;   }
}
@keyframes lokaiBarBounce {
  0%, 100% { transform: scaleY(0.3); }
  50%       { transform: scaleY(1);   }
}
@keyframes lokaiSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes lokaiDot {
  0%, 70%, 100% { opacity: 0.2; transform: translateY(0);   }
  35%            { opacity: 1;   transform: translateY(-4px); }
}
.lokai-dot-1 { animation: lokaiDot 1.3s ease-in-out 0s    infinite; }
.lokai-dot-2 { animation: lokaiDot 1.3s ease-in-out 0.18s infinite; }
.lokai-dot-3 { animation: lokaiDot 1.3s ease-in-out 0.36s infinite; }
.lokai-btn-primary {
  background: ${C.navy};
  box-shadow: ${SHADOW.sm};
  transform: translateY(0);
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;
}
.lokai-btn-primary:hover:not(:disabled) {
  background: ${C.navy} !important;
  box-shadow: ${SHADOW.md} !important;
  transform: translateY(-1px) !important;
}
.lokai-btn-primary:active:not(:disabled) {
  transform: translateY(0) !important;
  box-shadow: ${SHADOW.sm} !important;
}
.lokai-btn-secondary {
  background: transparent;
  border: 1.5px solid ${C.navy};
  transition: background 0.14s ease, border-color 0.14s ease;
}
.lokai-btn-secondary:hover:not(:disabled) {
  background: rgba(19,40,70,0.08) !important;
  border-color: ${C.navy} !important;
}
.lokai-btn-secondary:active:not(:disabled) {
  background: #DDE6F5 !important;
}
.lokai-btn-ghost {
  background: transparent;
  transition: background 0.12s ease;
}
.lokai-btn-ghost:hover:not(:disabled) {
  background: ${C.surface2} !important;
}
.lokai-btn-ghost:active:not(:disabled) {
  background: #EDEAE4 !important;
}
.lokai-btn-destructive {
  background: rgba(184,54,28,0.08);
  border: 1px solid #F0C0BC;
  transition: background 0.14s ease, border-color 0.14s ease;
}
.lokai-btn-destructive:hover:not(:disabled) {
  background: #FFE0DC !important;
  border-color: ${C.red} !important;
}
.lokai-input-field {
  background: #FFFFFF;
  border: 1.5px solid ${C.border};
  border-radius: ${LAYOUT.radius.md};
  box-shadow: ${SHADOW.md};
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.lokai-input-field:focus {
  border-color: ${C.navy} !important;
  box-shadow: 0 0 0 3px rgba(28,58,110,0.12) !important;
  outline: none;
}
.lokai-lang-chip {
  transition: background 0.14s ease, border-color 0.14s ease;
}
.lokai-lang-chip:hover:not(.selected) {
  background: ${C.surface2} !important;
}
`;

function injectSharedStyles() {
  if (typeof document !== 'undefined' && !document.getElementById(SHARED_ANIM_ID)) {
    const style = document.createElement('style');
    style.id = SHARED_ANIM_ID;
    style.textContent = SHARED_ANIM_CSS;
    document.head.appendChild(style);
  }
}

// ─── Citation Stamp — the most important UI component ─────────────────────────
export function CitationStamp({ text }: { text: string }) {
  useEffect(() => { injectSharedStyles(); }, []);
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: GRAD.oxbloodStamp,
      color: '#FFFFFF',
      borderRadius: '4px',
      padding: '3px 10px',
      fontFamily: MONO,
      fontSize: '10px',
      fontWeight: 500,
      letterSpacing: '0.05em',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
      {text}
    </div>
  );
}

// ─── Logo Mark — "L" in a circle ──────────────────────────────────────────────
export function LogoMark({ size = 34, light = false }: { size?: number; light?: boolean }) {
  const borderColor = light ? 'rgba(255,255,255,0.64)' : C.navy;
  const textColor   = light ? '#FFFFFF' : C.navy;
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      border: `1.5px solid ${borderColor}`,
      background: light ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.36)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: light ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : '0 1px 2px rgba(16,42,76,0.08)',
    }}>
      <span style={{
        fontFamily: EDITORIAL, fontSize: '16px', fontWeight: 400,
        color: textColor, lineHeight: 1, userSelect: 'none',
      }}>
        L
      </span>
    </div>
  );
}

// ─── Wordmark ─────────────────────────────────────────────────────────────────
export function Wordmark({ size = 22, color = C.ink }: { size?: number; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0px', lineHeight: 1 }}>
      <span style={{ fontFamily: EDITORIAL, fontSize: `${size}px`, fontWeight: 400, color, letterSpacing: '-0.3px' }}>
        Lok
      </span>
      <span style={{ fontFamily: SANS, fontSize: `${Math.round(size * 0.82)}px`, fontWeight: 600, color, letterSpacing: '0.02em' }}>
        AI
      </span>
    </span>
  );
}

export function BrandLogo({ size = 36, light = false }: { size?: number; light?: boolean }) {
  const wordSize = Math.round(size * 0.62);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${Math.max(9, Math.round(size * 0.28))}px` }}>
      <LogoMark size={size} light={light} />
      <Wordmark size={wordSize} color={light ? '#FFFFFF' : C.ink} />
    </div>
  );
}

// ─── Full Logo (mark + wordmark) ──────────────────────────────────────────────
export function Logo({ size = 40, light = false }: { size?: number; light?: boolean }) {
  return <BrandLogo size={size} light={light} />;
}

// ─── Voice Orb — full 4-state component ──────────────────────────────────────
export function VoiceOrb({
  size  = 52,
  state = 'idle',
  onClick,
}: {
  size?:    number;
  state?:   'idle' | 'listening' | 'processing' | 'error';
  onClick?: () => void;
}) {
  useEffect(() => { injectSharedStyles(); }, []);
  const iconSize = Math.round(size * 0.38);

  const MicIcon = () => (
    <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none" style={{ position: 'relative', zIndex: 1 }}>
      <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5"
        stroke={state === 'idle' ? C.muted : '#FFFFFF'} strokeWidth="1.1" />
      <path d="M3 8.5C3 11.3 5.2 13.5 8 13.5C10.8 13.5 13 11.3 13 8.5"
        stroke={state === 'idle' ? C.muted : '#FFFFFF'} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="8" y1="13.5" x2="8" y2="15.5"
        stroke={state === 'idle' ? C.muted : '#FFFFFF'} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );

  // ── IDLE ──
  if (state === 'idle') {
    return (
      <div
        onClick={onClick}
        style={{
          width: `${size}px`, height: `${size}px`, borderRadius: '50%',
          background: C.surface2,
          border: `2px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: onClick ? 'pointer' : 'default',
        }}
      >
        <MicIcon />
      </div>
    );
  }

  // ── LISTENING ──
  if (state === 'listening') {
    const barHeights = [8, 14, 20, 14, 8];
    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
        {/* Pulsing ring */}
        <div style={{
          position: 'absolute',
          width: `${size + 4}px`, height: `${size + 4}px`, borderRadius: '50%',
          border: `1.5px solid ${C.saffron}`,
          opacity: 0.4,
          animation: 'lokaiPulseRing 1.6s ease-out infinite',
        }} />
        {/* Orb */}
        <div onClick={onClick} style={{
          width: `${size}px`, height: `${size}px`, borderRadius: '50%',
          background: C.saffron,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
          boxShadow: `0 4px 16px rgba(232,131,42,0.3)`,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.18) 0%, transparent 55%)',
          }} />
          {/* 3 animated bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', position: 'relative', zIndex: 1 }}>
            {barHeights.map((h, i) => (
              <div key={i} style={{
                width: '3px', height: `${h}px`,
                background: 'rgba(255,255,255,0.9)', borderRadius: '2px',
                transformOrigin: 'center bottom',
                animation: `lokaiBarBounce ${0.5 + i * 0.12}s ease-in-out ${i * 0.1}s infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PROCESSING ──
  if (state === 'processing') {
    return (
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
        {/* Rotating arc */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: 'rgba(255,255,255,0.5)',
          animation: 'lokaiSpin 1s linear infinite',
        }} />
        <div onClick={onClick} style={{
          width: `${size}px`, height: `${size}px`, borderRadius: '50%',
          background: C.navy,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
        }}>
          <MicIcon />
        </div>
      </div>
    );
  }

  // ── ERROR ──
  return (
    <div onClick={onClick} style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      background: 'rgba(184,54,28,0.08)',
      border: `1.5px solid ${C.red}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, cursor: onClick ? 'pointer' : 'default',
    }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none">
        <line x1="4" y1="4" x2="12" y2="12" stroke={C.red} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="12" y1="4" x2="4" y2="12" stroke={C.red} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ─── Button — Primary / Secondary / Ghost / Destructive ───────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  'primary' | 'secondary' | 'ghost' | 'destructive';
  loading?:  boolean;
  size?:     'sm' | 'md' | 'lg';
  children:  React.ReactNode;
}

export function Btn({
  variant  = 'primary',
  loading  = false,
  size     = 'md',
  children,
  disabled,
  style,
  ...props
}: BtnProps) {
  useEffect(() => { injectSharedStyles(); }, []);

  const padMap = { sm: '8px 16px', md: '12px 24px', lg: '14px 32px' };
  const fszMap = { sm: '13px',      md: '14px',      lg: '15px'      };

  const base: React.CSSProperties = {
    fontFamily:   SANS,
    fontSize:     fszMap[size],
    fontWeight:   600,
    borderRadius: LAYOUT.radius.md,
    padding:      padMap[size],
    border:       'none',
    cursor:       disabled || loading ? 'not-allowed' : 'pointer',
    display:      'inline-flex',
    alignItems:   'center',
    justifyContent: 'center',
    gap:          '8px',
    lineHeight:   1.4,
    userSelect:   'none',
    whiteSpace:   'nowrap',
  };

  // Disabled overrides
  const disabledStyle: React.CSSProperties = disabled ? {
    background: C.border,
    color:      C.muted,
    border:     'none',
    boxShadow:  'none',
    opacity:    1,
  } : {};

  const variantStyles: Record<string, React.CSSProperties> = {
    primary:     { color: '#FFFFFF' },
    secondary:   { color: C.navy },
    ghost:       { color: C.inkSoft, padding: padMap[size] },
    destructive: { color: C.red },
  };

  const classMap = {
    primary:     'lokai-btn-primary',
    secondary:   'lokai-btn-secondary',
    ghost:       'lokai-btn-ghost',
    destructive: 'lokai-btn-destructive',
  };

  // Spinner
  const Spinner = () => (
    <div style={{
      width: '16px', height: '16px', borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#FFFFFF',
      animation: 'lokaiSpin 0.8s linear infinite',
    }} />
  );

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${classMap[variant]} ${props.className || ''}`}
      style={{ ...base, ...variantStyles[variant], ...disabledStyle, ...style }}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function InputField({ error = false, style, ...props }: InputFieldProps) {
  useEffect(() => { injectSharedStyles(); }, []);
  return (
    <input
      {...props}
      className={`lokai-input-field ${props.className || ''}`}
      style={{
        width:       '100%',
        fontFamily:  SANS,
        fontSize:    '15px',
        color:       C.ink,
        padding:     '14px 16px',
        boxSizing:   'border-box',
        background:  props.disabled ? C.surface2 : '#FFFFFF',
        border:      `1.5px solid ${error ? C.red : C.border}`,
        borderRadius: LAYOUT.radius.md,
        boxShadow:   error
          ? `0 0 0 3px rgba(200,64,48,0.10), ${SHADOW.sm}`
          : SHADOW.sm,
        outline:     'none',
        ...style,
      }}
    />
  );
}

// ─── Language Chip ────────────────────────────────────────────────────────────
export function LanguageChip({
  name,
  englishName,
  selected  = false,
  onClick,
}: {
  name:         string;
  englishName?: string;
  selected?:    boolean;
  onClick?:     () => void;
}) {
  useEffect(() => { injectSharedStyles(); }, []);
  return (
    <button
      onClick={onClick}
      className={`lokai-lang-chip${selected ? ' selected' : ''}`}
      style={{
        display:       'flex',
        flexDirection: englishName ? 'column' : 'row',
        alignItems:    'center',
        gap:           '3px',
        padding:       englishName ? '10px 12px' : '8px 14px',
        background:    selected ? 'rgba(19,40,70,0.08)' : C.bg,
        border:        selected ? `1.5px solid ${C.navy}` : `1px solid ${C.border}`,
        borderRadius:  LAYOUT.radius.md,
        cursor:        'pointer',
        fontFamily:    SANS,
      }}
    >
      <span style={{
        fontFamily: SANS,
        fontSize:   englishName ? '14px' : '13px',
        fontWeight: selected ? 600 : 500,
        color:      selected ? C.navy : C.ink,
        lineHeight: 1.3,
      }}>
        {name}
      </span>
      {englishName && (
        <span style={{
          fontFamily: SANS,
          fontSize:   '10px',
          color:      selected ? C.navy : C.muted,
        }}>
          {englishName}
        </span>
      )}
    </button>
  );
}

// ─── Response Card ────────────────────────────────────────────────────────────
export type ResponseCardState = 'verified' | 'guidance' | 'outofscope';

interface ResponseCardProps {
  state?:          ResponseCardState;
  zone1:           React.ReactNode;
  zone1Citation?:  string;
  zone2?:          React.ReactNode;
  zone3?:          React.ReactNode;
  zone1Label?:     string;
  zone2Label?:     string;
  zone3Label?:     string;
  maxWidth?:       string | number;
}

export function ResponseCard({
  state        = 'verified',
  zone1,
  zone1Citation,
  zone2,
  zone3,
  zone1Label   = 'Finding',
  zone2Label   = 'What the Law Says',
  zone3Label   = 'What You Can Do',
  maxWidth     = 540,
}: ResponseCardProps) {
  const cardBg = state === 'outofscope' ? 'rgba(138,69,0,0.08)' : C.surface;
  const shadow = state === 'verified' ? SHADOW.md : SHADOW.sm;

  return (
    <div style={{
      maxWidth,
      background:   cardBg,
      borderTop:    `1px solid ${C.border}`,
      borderRight:  `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      borderLeft:   state === 'verified'
        ? '5px solid transparent'
        : `5px solid ${C.borderStrong}`,
      borderRadius: '4px 16px 16px 16px',
      overflow:     'hidden',
      boxShadow:    shadow,
      position:     'relative',
    }}>
      {state === 'verified' && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: '5px',
          background: C.green,
          borderRadius: '4px 0 0 16px',
        }} />
      )}

      <div style={{ padding: '20px 20px 16px 20px' }}>
        <div style={{
          fontFamily: SANS, fontSize: '10px', fontWeight: 600,
          color: C.muted, letterSpacing: '0.09em', textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          {zone1Label}
        </div>
        <p style={{
          fontFamily: EDITORIAL, fontSize: '22px', fontWeight: 400, fontStyle: 'normal',
          color: C.ink, lineHeight: 1.4, margin: '0 0 10px',
        }}>
          {zone1}
        </p>
        {zone1Citation && <CitationStamp text={zone1Citation} />}
      </div>

      {zone2 && (
        <>
          <div style={{ height: '1px', background: C.border, margin: '0 20px' }} />
          <div style={{ padding: '14px 20px' }}>
            <div style={{
              fontFamily: SANS, fontSize: '10px', fontWeight: 600,
              color: C.muted, letterSpacing: '0.09em', textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              {zone2Label}
            </div>
            <p style={{
              fontFamily: SANS, fontSize: '15px', color: C.ink,
              lineHeight: 1.65, margin: 0,
            }}>
              {zone2}
            </p>
          </div>
        </>
      )}

      {zone3 && (
        <>
          <div style={{ height: '1px', background: C.border, margin: '0 20px' }} />
          <div style={{ padding: '14px 20px 18px' }}>
            <div style={{
              fontFamily: SANS, fontSize: '10px', fontWeight: 600,
              color: C.muted, letterSpacing: '0.09em', textTransform: 'uppercase',
              marginBottom: '10px',
            }}>
              {zone3Label}
            </div>
            {zone3}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Section label (small caps) ───────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: SANS, fontSize: '10px', fontWeight: 600,
      color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em',
      marginBottom: '8px',
    }}>
      {children}
    </div>
  );
}

// ─── Disclaimer Text — present on all screens with legal content ──────────────
export function DisclaimerText({ center = false }: { center?: boolean }) {
  return (
    <p style={{
      fontFamily: SANS, fontSize: '11px', color: C.muted,
      margin: 0, lineHeight: 1.5,
      textAlign: center ? 'center' : 'left',
    }}>
      LokAI provides legal information, not legal advice.
    </p>
  );
}
