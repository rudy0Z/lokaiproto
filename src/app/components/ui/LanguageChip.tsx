import React from 'react';
import { TYPE, C, S } from '../shared';

export function LanguageChip({ lang }: { lang: 'EN' | 'HI' | 'TA' | 'BN' }) {
  return (
    <div style={{
      ...TYPE.micro,
      background: C.surface,
      color: C.navy,
      border: `1px solid ${C.border}`,
      borderRadius: '4px',
      padding: `${S[1]} ${S[2]}`,
      display: 'inline-flex',
      alignItems: 'center',
    }}>
      {lang}
    </div>
  );
}
