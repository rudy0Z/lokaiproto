import React from 'react';
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
      padding: `${S[1]} ${S[3]}`,
      borderRadius: LAYOUT.radius.pill,
      display: 'inline-flex',
      alignItems: 'center',
    }}>
      {label}
    </span>
  );
}
