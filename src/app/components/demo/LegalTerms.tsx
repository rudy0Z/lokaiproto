import React, { useEffect, useMemo, useRef } from 'react';
import { IconBookOpen, IconClose } from '../../ui/icons';
import { C, LAYOUT, MONO, SANS, SHADOW, TYPE } from '../shared';
import { useDemo } from '../../context/DemoContext';
import { LEGAL_GLOSSARY } from '../../data/demoScenarios';

const entries = Object.values(LEGAL_GLOSSARY);
const termPattern = new RegExp(
  `(${entries.map((entry) => entry.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  'gi',
);
const idByTerm = new Map(entries.map((entry) => [entry.term.toLowerCase(), entry.id]));

export function LegalTerm({ id, children }: { id: string; children: React.ReactNode }) {
  const { openTerm } = useDemo();
  return (
    <button
      type="button"
      onClick={() => openTerm(id)}
      aria-haspopup="dialog"
      className="legal-term"
      style={{
        appearance: 'none',
        border: 0,
        borderBottom: `1px dotted ${C.saffronDark}`,
        background: 'rgba(233, 133, 43, 0.08)',
        borderRadius: LAYOUT.radius.xs,
        color: 'inherit',
        cursor: 'help',
        font: 'inherit',
        lineHeight: 'inherit',
        padding: '0 3px',
      }}
    >
      {children}
    </button>
  );
}

export function LegalText({ children }: { children: string }) {
  const parts = useMemo(() => children.split(termPattern), [children]);
  return (
    <>
      {parts.map((part, index) => {
        const id = idByTerm.get(part.toLowerCase());
        return id
          ? <LegalTerm key={`${part}-${index}`} id={id}>{part}</LegalTerm>
          : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
      })}
    </>
  );
}

function TermContent({ compact = false }: { compact?: boolean }) {
  const { selectedTerm } = useDemo();
  if (!selectedTerm) return null;

  return (
    <div>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: C.saffronDark,
        fontFamily: SANS,
        fontSize: TYPE.micro.size,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 10,
      }}>
        <IconBookOpen size={14} aria-hidden="true" />
        Plain-language meaning
      </div>
      <h2 style={{
        color: C.ink,
        fontFamily: SANS,
        fontSize: compact ? 20 : 18,
        lineHeight: 1.25,
        margin: '0 0 10px',
      }}>
        {selectedTerm.term}
      </h2>
      <p style={{ color: C.inkSoft, fontFamily: SANS, fontSize: TYPE.body.size, lineHeight: 1.65, margin: '0 0 14px' }}>
        {selectedTerm.simpleMeaning}
      </p>
      <div style={{
        background: C.surface2,
        border: `1px solid ${C.border}`,
        borderRadius: LAYOUT.radius.control,
        padding: 12,
        marginBottom: 14,
      }}>
        <div style={{ color: C.muted, fontFamily: SANS, fontSize: TYPE.micro.size, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase' }}>
          Example
        </div>
        <p style={{ color: C.inkSoft, fontFamily: SANS, fontSize: TYPE.small.size, lineHeight: 1.55, margin: 0 }}>
          {selectedTerm.example}
        </p>
      </div>
      <p style={{ color: C.muted, fontFamily: MONO, fontSize: TYPE.label.size, lineHeight: 1.55, margin: 0 }}>
        {selectedTerm.sourceNote}
      </p>
    </div>
  );
}

export function LegalTermDialog() {
  const { selectedTerm, closeTerm } = useDemo();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!selectedTerm) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = document.getElementById('legal-term-dialog');
    const focusables = dialog?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeTerm();
        return;
      }
      if (event.key !== 'Tab' || !focusables?.length) return;
      const list = Array.from(focusables);
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [selectedTerm, closeTerm]);

  if (!selectedTerm) return null;

  return (
    <div
      className="legal-term-mobile-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeTerm();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(11, 30, 55, 0.45)',
      }}
    >
      <section
        id="legal-term-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-term-title"
        style={{
          width: 'min(100%, 420px)',
          maxHeight: 'min(70dvh, 560px)',
          overflowY: 'auto',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: `${LAYOUT.radius.turn} ${LAYOUT.radius.turn} ${LAYOUT.radius.panel} ${LAYOUT.radius.panel}`,
          boxShadow: SHADOW.overlay,
          padding: 22,
          position: 'relative',
        }}
      >
        <span id="legal-term-title" className="sr-only">Legal term explanation</span>
        <button
          ref={closeRef}
          type="button"
          onClick={closeTerm}
          aria-label="Close legal term explanation"
          style={{
            width: 44,
            height: 44,
            position: 'absolute',
            right: 8,
            top: 8,
            border: 0,
            borderRadius: LAYOUT.radius.control,
            background: 'transparent',
            color: C.muted,
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <IconClose size={20} aria-hidden="true" />
        </button>
        <div style={{ paddingRight: 30 }}><TermContent compact /></div>
      </section>
    </div>
  );
}

export function LegalTermPanel() {
  const { selectedTerm, closeTerm } = useDemo();
  if (!selectedTerm) return null;

  return (
    <section
      aria-label="Legal term explanation"
      style={{
        borderBottom: `1px solid ${C.border}`,
        background: '#FFF9F1',
        padding: '20px 22px',
        position: 'relative',
      }}
    >
      <button
        type="button"
        onClick={closeTerm}
        aria-label="Close legal term explanation"
        style={{
          width: 36,
          height: 36,
          position: 'absolute',
          right: 8,
          top: 8,
          border: 0,
          borderRadius: LAYOUT.radius.control,
          background: 'transparent',
          color: C.muted,
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <IconClose size={17} aria-hidden="true" />
      </button>
      <div style={{ paddingRight: 24 }}><TermContent /></div>
    </section>
  );
}
