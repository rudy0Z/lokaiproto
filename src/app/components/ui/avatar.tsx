import React from 'react';
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
