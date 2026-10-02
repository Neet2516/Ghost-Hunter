import React from 'react';
import { AppNavbar } from './AppNavbar';
import { Grain } from '@/components/primitives';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col relative selection:bg-signal selection:text-paper">
      <Grain />
      <AppNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>
      <footer className="w-full bg-paper hairline-t py-6 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-ash">
          Ghost-Hunter &bull; Silence is data &bull; Local &bull; Temporal-Powered
        </span>
      </footer>
    </div>
  );
}
