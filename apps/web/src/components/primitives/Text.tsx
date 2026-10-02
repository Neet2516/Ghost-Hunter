import React from 'react';
import { cn } from '@/lib/utils';

export type TextVariant = 'lead' | 'body' | 'caption' | 'muted';
export type TextElement = 'p' | 'span' | 'div' | 'label';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: TextElement;
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  as = 'p',
  className,
  children,
  ...props
}: TextProps) {
  const variantStyles: Record<TextVariant, string> = {
    lead: 'text-lg md:text-xl text-ink leading-relaxed',
    body: 'text-base text-ink leading-relaxed',
    caption: 'font-mono text-xs uppercase tracking-wider text-ash',
    muted: 'text-sm text-ash leading-normal',
  };

  return React.createElement(
    as,
    {
      className: cn(variantStyles[variant], className),
      ...props,
    },
    children
  );
}
