import React from 'react';
import { C, LAYOUT, SANS, S } from '../shared';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: LAYOUT.radius.md,
        padding: `${S[3]} ${S[4]}`,
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
        e.currentTarget.style.boxShadow = `0 0 0 2px rgba(19,40,70,0.1)`;
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
        border: `1px solid ${C.border}`,
        borderRadius: LAYOUT.radius.md,
        padding: `${S[3]} ${S[4]}`,
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
        e.currentTarget.style.boxShadow = `0 0 0 2px rgba(19,40,70,0.1)`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}
