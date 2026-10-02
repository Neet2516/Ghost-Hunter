import React from 'react';
import { cn } from '@/lib/utils';

export interface MonoDataProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  value: React.ReactNode;
  secondaryValue?: React.ReactNode;
  highlight?: 'signal' | 'moss' | 'phantom' | 'ash' | 'default';
  inline?: boolean;
}

export function MonoData({
  label,
  value,
  secondaryValue,
  highlight = 'default',
  inline = false,
  className,
  ...props
}: MonoDataProps) {
  const highlightStyles = {
    default: 'text-ink',
    signal: 'text-signal font-semibold',
    moss: 'text-moss font-semibold',
    phantom: 'text-phantom',
    ash: 'text-ash',
  };

  if (inline) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-4 font-mono text-xs hairline p-2 bg-paper/60 shadow-sm',
          className
        )}
        {...props}
      >
        {label && <span className="text-ash uppercase">{label}</span>}
        <div className="flex items-center gap-2">
          <span className={cn('tabular-nums font-bold', highlightStyles[highlight])}>
            {value}
          </span>
          {secondaryValue && <span className="text-ash">{secondaryValue}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1 font-mono', className)} {...props}>
      {label && <span className="text-xs uppercase text-ash tracking-wider">{label}</span>}
      <div className="flex items-baseline gap-2">
        <span className={cn('text-sm md:text-base tabular-nums font-bold', highlightStyles[highlight])}>
          {value}
        </span>
        {secondaryValue && <span className="text-xs text-ash">{secondaryValue}</span>}
      </div>
    </div>
  );
}
