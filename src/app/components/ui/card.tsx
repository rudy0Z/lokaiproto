import React from 'react';
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
