import React from 'react';
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
