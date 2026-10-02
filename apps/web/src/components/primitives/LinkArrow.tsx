import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface LinkArrowProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}

export function LinkArrow({
  href,
  external = false,
  className,
  children,
  ...props
}: LinkArrowProps) {
  const content = (
    <span
      className={cn(
        'group inline-flex items-center gap-1.5 font-semibold text-ink hover:text-signal transition-colors underline underline-offset-4 decoration-1 hover:decoration-2',
        className
      )}
    >
      <span>{children}</span>
      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
        &rarr;
      </span>
    </span>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} {...props}>
      {content}
    </Link>
  );
}
