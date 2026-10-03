import React from 'react';
import Link from 'next/link';
import { Button, LinkArrow } from '@/components/primitives';

export function MarketingNavbar() {
  return (
    <header className="w-full bg-paper hairline-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal" aria-label="Ghost-Hunter Home">
            <div className="w-8 h-8 bg-ink text-paper hairline flex items-center justify-center font-black text-sm shadow-sm">
              GH
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight leading-none uppercase">
                Ghost-Hunter
              </span>
              <span className="font-mono text-[10px] text-ash tracking-widest uppercase">
                Silence is data.
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-6" aria-label="Landing Navigation">
            <LinkArrow href="/tokens" className="hidden sm:inline-flex text-xs font-mono">
              Tokens
            </LinkArrow>
            <Link href="/app">
              <Button variant="signal" size="md">
                Launch Sentinel &rarr;
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
