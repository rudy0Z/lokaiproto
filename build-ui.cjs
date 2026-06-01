const fs = require('fs');
const path = require('path');
const uiDir = path.join(__dirname, 'src', 'app', 'components', 'ui');

if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

const files = {
  'Button.tsx': `import React from 'react';
import { C, LAYOUT, SANS, SHADOW } from '../shared';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', style, ...props }: ButtonProps) {
  const padMap = { sm: '8px 16px', md: '12px 24px', lg: '16px 32px' };
  const hMap = { sm: '32px', md: '40px', lg: '48px' };

  const base: React.CSSProperties = {
    height: hMap[size],
    padding: padMap[size],
    borderRadius: LAYOUT.radius.md,
    fontFamily: SANS,
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    outline: 'none',
  };

  let variantStyles: React.CSSProperties = {};
  if (variant === 'primary') {
    variantStyles = { background: C.navy, color: '#FFFFFF' };
  } else if (variant === 'secondary') {
    variantStyles = { background: '#FFFFFF', border: \`1px solid \${C.border}\`, color: C.ink };
  } else if (variant === 'ghost') {
    variantStyles = { background: 'transparent', color: C.ink };
  } else if (variant === 'danger') {
    variantStyles = { background: C.red, color: '#FFFFFF' };
  }

  return (
    <button
      {...props}
      style={{ ...base, ...variantStyles, ...style }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = \`0 0 0 2px #fff, 0 0 0 4px \${C.navy}\`;
        if (props.onFocus) props.onFocus(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        if (props.onBlur) props.onBlur(e);
      }}
    />
  );
}
`,

  'Card.tsx': `import React from 'react';
import { CARD, LAYOUT } from '../shared';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'featured' | 'verdict';
  interactive?: boolean;
}

export function Card({ variant = 'base', interactive, style, ...props }: CardProps) {
  return (
    <div
      {...props}
      style={{
        ...CARD[variant],
        cursor: interactive ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (interactive) e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        if (interactive) e.currentTarget.style.transform = 'translateY(0)';
      }}
    />
  );
}
`,

  'Input.tsx': `import React from 'react';
import { C, LAYOUT, SANS, S } from '../shared';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        border: \`1px solid \${C.border}\`,
        borderRadius: LAYOUT.radius.md,
        padding: \`\${S[3]} \${S[4]}\`,
        fontFamily: SANS,
        fontSize: '14px',
        color: C.ink,
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        ...props.style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = C.navy;
        e.currentTarget.style.boxShadow = \`0 0 0 2px rgba(19,40,70,0.1)\`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        border: \`1px solid \${C.border}\`,
        borderRadius: LAYOUT.radius.md,
        padding: \`\${S[3]} \${S[4]}\`,
        fontFamily: SANS,
        fontSize: '14px',
        color: C.ink,
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        resize: 'vertical',
        ...props.style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = C.navy;
        e.currentTarget.style.boxShadow = \`0 0 0 2px rgba(19,40,70,0.1)\`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}
`,

  'Chip.tsx': `import React from 'react';
import { C, LAYOUT, TYPE, S } from '../shared';

interface ChipProps {
  label: string;
  variant?: 'neutral' | 'navy' | 'saffron' | 'oxblood' | 'green' | 'red';
  size?: 'micro' | 'small';
}

export function Chip({ label, variant = 'neutral', size = 'micro' }: ChipProps) {
  let bg = C.bg;
  let color = C.ink;
  
  if (variant === 'navy') { bg = 'rgba(19,40,70,0.08)'; color = C.navy; }
  else if (variant === 'saffron') { bg = 'rgba(232,131,42,0.1)'; color = C.saffron; }
  else if (variant === 'oxblood') { bg = 'rgba(107,31,31,0.08)'; color = C.oxblood; }
  else if (variant === 'green') { bg = 'rgba(31,107,58,0.08)'; color = C.green; }
  else if (variant === 'red') { bg = 'rgba(184,54,28,0.08)'; color = C.red; }

  return (
    <span style={{
      ...TYPE[size],
      background: bg,
      color: color,
      padding: \`\${S[1]} \${S[3]}\`,
      borderRadius: LAYOUT.radius.pill,
      display: 'inline-flex',
      alignItems: 'center',
    }}>
      {label}
    </span>
  );
}
`,

  'Avatar.tsx': `import React from 'react';
import { C, SANS } from '../shared';

export function Avatar({ fallback, size = 32 }: { fallback: string; size?: 24 | 32 | 40 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: C.navy,
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: SANS,
      fontSize: size === 24 ? '10px' : size === 32 ? '12px' : '14px',
      fontWeight: 600,
      flexShrink: 0,
    }}>
      {fallback.substring(0, 2).toUpperCase()}
    </div>
  );
}
`,

  'SectionHeader.tsx': `import React from 'react';
import { TYPE, C } from '../shared';

export function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
      <div>
        <div style={{ ...TYPE.micro, color: C.muted, marginBottom: '8px' }}>
          {eyebrow}
        </div>
        <h2 style={{ ...TYPE.display2, color: C.ink, margin: 0 }}>
          {title}
        </h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
`,

  'CitationStamp.tsx': `import React from 'react';
import { GRAD, MONO } from '../shared';

export function CitationStamp({ text }: { text: string }) {
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
`,

  'LanguageChip.tsx': `import React from 'react';
import { TYPE, C, S } from '../shared';

export function LanguageChip({ lang }: { lang: 'EN' | 'HI' | 'TA' | 'BN' }) {
  return (
    <div style={{
      ...TYPE.micro,
      background: C.surface,
      color: C.navy,
      border: \`1px solid \${C.border}\`,
      borderRadius: '4px',
      padding: \`\${S[1]} \${S[2]}\`,
      display: 'inline-flex',
      alignItems: 'center',
    }}>
      {lang}
    </div>
  );
}
`,

  'ChatInput.tsx': `import React, { useState } from 'react';
import { C, LAYOUT, SHADOW, S } from '../shared';
import { LanguageChip } from './LanguageChip';
import { ArrowRight } from 'lucide-react';

interface ChatInputProps {
  placeholder?: string;
  onSend?: (text: string) => void;
  showLanguageChip?: boolean;
}

export function ChatInput({ placeholder = 'Message LokAI...', onSend, showLanguageChip }: ChatInputProps) {
  const [val, setVal] = useState('');

  return (
    <div style={{
      background: '#FFFFFF',
      border: \`1px solid \${C.border}\`,
      borderRadius: LAYOUT.radius.md,
      boxShadow: SHADOW.sm,
      padding: S[3],
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: S[3] }}>
        <textarea
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            minHeight: '40px',
            fontFamily: 'inherit',
            fontSize: '15px',
            lineHeight: 1.5,
            background: 'transparent',
            color: C.ink,
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (val.trim() && onSend) {
                onSend(val.trim());
                setVal('');
              }
            }
          }}
        />
        {showLanguageChip && <LanguageChip lang="EN" />}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: S[2] }}>
        <button
          onClick={() => {
            if (val.trim() && onSend) {
              onSend(val.trim());
              setVal('');
            }
          }}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: val.trim() ? C.navy : C.border,
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: val.trim() ? 'pointer' : 'default',
            color: '#FFFFFF'
          }}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
`
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(uiDir, name), content);
}
console.log('UI Components generated.');
