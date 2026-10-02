import React from 'react';
import { cn } from '@/lib/utils';

export interface HairlineProps extends React.HTMLAttributes<HTMLHRElement | HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  color?: 'ink' | 'ash' | 'signal' | 'moss';
}

export function Hairline({
  orientation = 'horizontal',
  color = 'ink',
  className,
  ...props
}: HairlineProps) {
  const colorStyles = {
    ink: 'border-ink',
    ash: 'border-ash/40',
    signal: 'border-signal',
    moss: 'border-moss',
  };

  if (orientation === 'vertical') {
    return (
      <div
        className={cn('w-[1px] h-full border-l', colorStyles[color], className)}
        {...props}
      />
    );
  }

  return (
    <hr
      className={cn('w-full border-t border-b-0 m-0', colorStyles[color], className)}
      {...props}
    />
  );
}
