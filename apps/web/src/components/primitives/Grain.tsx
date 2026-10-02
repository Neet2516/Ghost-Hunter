import React from 'react';
import { cn } from '@/lib/utils';

export interface GrainProps extends React.HTMLAttributes<HTMLDivElement> {
  opacity?: number;
}

export function Grain({ opacity = 0.045, className, ...props }: GrainProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('fixed inset-0 pointer-events-none z-[9999] select-none', className)}
      style={{ opacity }}
      {...props}
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>
    </div>
  );
}
