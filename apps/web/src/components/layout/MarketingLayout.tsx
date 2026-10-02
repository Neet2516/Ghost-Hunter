import React from 'react';
import { MarketingNavbar } from './MarketingNavbar';
import { Grain } from '@/components/primitives';

export interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col relative selection:bg-signal selection:text-paper">
      <Grain />
      <MarketingNavbar />
      <main className="flex-1 w-full">{children}</main>
      <footer className="w-full bg-ink text-paper py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="font-display text-2xl font-black uppercase tracking-tight">
              Ghost-Hunter
            </span>
            <span className="font-mono text-xs text-ash tracking-widest uppercase mt-1">
              Local-first durable follow-up sentinel.
            </span>
          </div>
          <div className="font-mono text-xs text-ash">
            Powered by Temporal TypeScript SDK &amp; Local Gemma
          </div>
        </div>
      </footer>
    </div>
  );
}
