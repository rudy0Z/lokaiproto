import React, { useState } from 'react';
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
      border: `1px solid ${C.border}`,
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
