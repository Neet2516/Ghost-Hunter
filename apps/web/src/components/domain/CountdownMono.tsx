'use client';

import React from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { Clock } from 'lucide-react';

export interface CountdownMonoProps {
  targetISO?: string | null;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function CountdownMono({
  targetISO,
  label = 'Cadence Sleep',
  size = 'md',
  showIcon = true,
}: CountdownMonoProps) {
  const { formatted, isExpired } = useCountdown(targetISO);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm md:text-base',
    lg: 'text-lg md:text-xl font-bold',
  };

  return (
    <div
      className="inline-flex items-center gap-2 bg-bone hairline px-3 py-1.5 shadow-sm font-mono select-none"
      aria-live="polite"
    >
      {showIcon && (
        <Clock
          className={`w-3.5 h-3.5 ${
            isExpired ? 'text-signal-orange' : 'text-signal animate-spin'
          }`}
          style={{ animationDuration: '4s' }}
        />
      )}

      {label && <span className="text-ash uppercase text-xs">{label}:</span>}

      <span
        className={`font-mono font-bold tracking-wider ${sizeClasses[size]} ${
          isExpired ? 'text-signal-orange' : 'text-ink'
        }`}
      >
        {formatted}
      </span>

      {!isExpired && (
        <span className="w-1.5 h-1.5 rounded-full bg-signal animate-ping inline-block ml-1" />
      )}
    </div>
  );
}
