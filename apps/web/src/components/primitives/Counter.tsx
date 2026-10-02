import React from 'react';
import { cn } from '@/lib/utils';

export interface CounterProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number | string;
  label?: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg' | 'giant';
  highlight?: 'signal' | 'moss' | 'phantom' | 'default';
}

export function Counter({
  value,
  label,
  unit,
  size = 'lg',
  highlight = 'default',
  className,
  ...props
}: CounterProps) {
  const sizeStyles = {
    sm: 'text-3xl font-bold',
    md: 'text-5xl font-extrabold',
    lg: 'text-7xl font-black',
    giant: 'text-8xl md:text-9xl font-black leading-none',
  };

  const highlightStyles = {
    default: 'text-ink',
    signal: 'text-signal',
    moss: 'text-moss',
    phantom: 'text-phantom',
  };

  return (
    <div className={cn('flex flex-col select-none', className)} {...props}>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'font-display tabular-nums tracking-tightest',
            sizeStyles[size],
            highlightStyles[highlight]
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="font-mono text-sm uppercase text-ash tracking-widest font-semibold">
            {unit}
          </span>
        )}
      </div>
      {label && (
        <span className="font-mono text-xs uppercase text-ash tracking-wider mt-1">
          {label}
        </span>
      )}
    </div>
  );
}
