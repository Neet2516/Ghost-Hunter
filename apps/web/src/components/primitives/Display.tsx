import React from 'react';
import { cn } from '@/lib/utils';

export type DisplayVariant = 'xl' | 'h1' | 'h2' | 'h3';
export type DisplayElement = 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'span';

export interface DisplayProps extends React.HTMLAttributes<HTMLElement> {
  variant?: DisplayVariant;
  as?: DisplayElement;
  children: React.ReactNode;
}

export function Display({
  variant = 'h1',
  as,
  className,
  children,
  ...props
}: DisplayProps) {
  const defaultElementMap: Record<DisplayVariant, DisplayElement> = {
    xl: 'h1',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
  };

  const Component = as || defaultElementMap[variant];

  const variantStyles: Record<DisplayVariant, string> = {
    xl: 'display-xl',
    h1: 'display-h1 uppercase',
    h2: 'display-h2',
    h3: 'font-display text-2xl font-bold tracking-tight',
  };

  return React.createElement(
    Component,
    {
      className: cn(variantStyles[variant], className),
      ...props,
    },
    children
  );
}
