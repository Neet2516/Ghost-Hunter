import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  color?: 'paper' | 'ink' | 'signal' | 'moss' | 'phantom' | 'bone';
  container?: boolean;
  borderTop?: boolean;
  borderBottom?: boolean;
  children: React.ReactNode;
}

export function Section({
  color = 'paper',
  container = true,
  borderTop = false,
  borderBottom = false,
  className,
  children,
  ...props
}: SectionProps) {
  const colorStyles = {
    paper: 'bg-paper text-ink',
    ink: 'bg-ink text-paper',
    signal: 'bg-signal text-paper',
    moss: 'bg-moss text-paper',
    phantom: 'bg-phantom text-ink',
    bone: 'bg-bone text-ink',
  };

  return (
    <section
      className={cn(
        'w-full py-12 md:py-20',
        colorStyles[color],
        borderTop && 'border-t hairline',
        borderBottom && 'border-b hairline',
        className
      )}
      {...props}
    >
      {container ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
