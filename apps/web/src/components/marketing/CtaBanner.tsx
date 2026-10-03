'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/primitives';
import { ArrowRight, ShieldCheck, Terminal, Sparkles } from 'lucide-react';

export function CtaBanner() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-ink text-paper relative overflow-hidden">
      {/* Decorative background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-signal text-paper font-mono text-xs uppercase font-bold tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local-First · Self-Hosted · Open Source</span>
        </div>

        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-6 max-w-4xl">
          Stop losing high-value roles to recruiter silence.
        </h2>

        <p className="text-paper/80 font-sans text-base sm:text-xl leading-relaxed max-w-2xl mb-10">
          Arm your job hunt with cryptographic durability and air-gapped local
          intelligence. Set your cadence once and never drop a thread again.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Link href="/app">
            <Button size="lg" className="bg-signal text-paper hover:bg-signal/90 border-2 border-signal shadow-hard-lg gap-3">
              <span className="font-bold">Open Sentinel App</span>
              <ArrowRight className="w-5 h-5 text-paper" />
            </Button>
          </Link>

          <Link href="/app/applications/new">
            <Button variant="ghost" size="lg" className="border-2 border-paper text-paper hover:bg-paper hover:text-ink gap-2">
              <span>Track New Application</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-paper/10 text-left w-full max-w-3xl font-mono text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-signal shrink-0" />
            <span className="text-paper/70">100% Offline via Ollama</span>
          </div>
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-signal shrink-0" />
            <span className="text-paper/70">Temporal TypeScript SDK</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-signal shrink-0 animate-pulse" />
            <span className="text-paper/70">Durable SQLite WAL Storage</span>
          </div>
        </div>
      </div>
    </section>
  );
}
