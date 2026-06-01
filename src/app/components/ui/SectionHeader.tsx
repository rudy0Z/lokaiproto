import React from 'react';
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
