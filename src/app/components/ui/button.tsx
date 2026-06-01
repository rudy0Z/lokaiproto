import React from 'react';
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
    transition: 'background 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
    outline: 'none',
  };

  let variantStyles: React.CSSProperties = {};
  if (variant === 'primary') {
    variantStyles = { background: C.navy, color: '#FFFFFF' };
  } else if (variant === 'secondary') {
    variantStyles = { background: '#FFFFFF', border: `1px solid ${C.border}`, color: C.ink };
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
        e.currentTarget.style.boxShadow = `0 0 0 2px #fff, 0 0 0 4px ${C.navy}`;
        if (props.onFocus) props.onFocus(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        if (props.onBlur) props.onBlur(e);
      }}
    />
  );
}
