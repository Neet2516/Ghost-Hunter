'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, StatusChip } from '@/components/primitives';
import { useMotionPreference } from './SmoothScrollProvider';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Clock,
  Zap,
  Terminal,
  VolumeX,
  Volume2,
} from 'lucide-react';

export function HeroSection() {
  const { reducedMotion, setReducedMotion } = useMotionPreference();
  const [seconds, setSeconds] = useState(48);

  // Simulated live countdown tick in hero widget
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 59));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 border-b border-ink/10 overflow-hidden bg-paper">
      {/* Decorative architectural grid background lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top bar: Operational badge & Accessibility Motion Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-ink text-paper text-xs font-mono uppercase tracking-widest border border-ink shadow-hard">
            <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
            <span>Temporal Durable Engine · Local Gemma 2B/9B</span>
          </div>

          <button
            onClick={() => setReducedMotion((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-ink/20 hover:border-ink text-xs font-mono text-ash hover:text-ink transition-colors"
            title="Toggle reduced motion animations"
          >
            {reducedMotion ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-signal" />
                <span>Motion: REDUCED</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-ink" />
                <span>Motion: DYNAMIC</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Display Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col">
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-ink uppercase tracking-tight leading-[0.92] mb-6">
                Silence <br />
                <span className="text-signal underline decoration-ink decoration-4 underline-offset-8">
                  is data.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-ash font-sans leading-relaxed max-w-2xl mb-8">
                Ghost-Hunter is an autonomous, air-gapped follow-up sentinel for
                high-stakes job outreach. It watches recruiter response windows,
                synthesizes context-aware check-in drafts on local hardware, and
                guarantees zero recruiter data ever leaves your computer.
              </p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4 mb-10"
            >
              <Link href="/app">
                <Button size="lg" className="shadow-hard gap-3">
                  <span>Launch Sentinel</span>
                  <ArrowRight className="w-5 h-5 text-signal" />
                </Button>
              </Link>

              <a href="#story">
                <Button variant="ghost" size="lg" className="border border-ink gap-2">
                  <span>5-Step Story</span>
                </Button>
              </a>

              <a
                href="https://github.com/Neet2516/Ghost-Hunter"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-ash hover:text-ink tracking-wider uppercase underline underline-offset-4 py-3 px-2 transition-colors"
              >
                GitHub Repo →
              </a>
            </motion.div>

            {/* 3 Core Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-ink/10">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase text-ink">
                    100% Air-Gapped
                  </h4>
                  <p className="text-xs text-ash leading-snug mt-0.5">
                    Gemma runs locally via Ollama. 0 tokens sent to clouds.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase text-ink">
                    Durable Timers
                  </h4>
                  <p className="text-xs text-ash leading-snug mt-0.5">
                    Temporal orchestrates weeks-long sleeps without memory leaks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Cpu className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase text-ink">
                    Human Review Gate
                  </h4>
                  <p className="text-xs text-ash leading-snug mt-0.5">
                    Nothing sends blindly. Edit, approve, or snooze before flight.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Simulated Sentinel Telemetry Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-paper border-2 border-ink shadow-hard-lg overflow-hidden relative"
            >
              {/* Telemetry card header */}
              <div className="bg-ink text-paper p-4 flex items-center justify-between border-b border-ink">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-signal" />
                  <span className="font-mono text-xs uppercase tracking-wider font-bold">
                    Sentinel Telemetry [SIM-LIVE]
                  </span>
                </div>
                <span className="font-mono text-[10px] text-paper/70 tracking-widest">
                  ID: gh-app-stripe-9481
                </span>
              </div>

              {/* Telemetry card body */}
              <div className="p-6 space-y-6">
                {/* Target context */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-ink/10">
                  <div>
                    <span className="text-[10px] font-mono text-ash uppercase tracking-wider block mb-1">
                      Active Outreach Target
                    </span>
                    <h3 className="font-display text-xl font-bold text-ink">
                      Staff Infrastructure Engineer
                    </h3>
                    <p className="font-sans text-sm text-ash font-medium">
                      Stripe · Core Compute Infrastructure
                    </p>
                  </div>
                  <StatusChip status="HUNTING" subStatus="WAITING" />
                </div>

                {/* Cadence countdown ticker */}
                <div className="bg-surface p-4 border border-ink/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold uppercase text-ink flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-signal" />
                      Stage 1 Cadence Window
                    </span>
                    <span className="font-mono text-[10px] text-signal font-bold uppercase tracking-wider">
                      Durable Temporal Sleep
                    </span>
                  </div>

                  <div className="font-mono text-3xl font-black text-ink tracking-tight flex items-baseline gap-2">
                    <span>02</span>
                    <span className="text-ash text-base font-normal">d</span>
                    <span className="text-signal">:</span>
                    <span>14</span>
                    <span className="text-ash text-base font-normal">h</span>
                    <span className="text-signal">:</span>
                    <span>28</span>
                    <span className="text-ash text-base font-normal">m</span>
                    <span className="text-signal">:</span>
                    <span className="text-signal tabular-nums">
                      {String(seconds).padStart(2, '0')}
                    </span>
                    <span className="text-ash text-base font-normal">s</span>
                  </div>
                </div>

                {/* Progress trail preview */}
                <div>
                  <span className="text-[10px] font-mono text-ash uppercase tracking-wider block mb-2">
                    Cadence Trail Progression
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
                    <div className="bg-ink text-paper p-2 font-bold border border-ink">
                      1. APPLIED
                      <span className="block text-[8px] text-paper/70 font-normal">
                        Day 0 (Sent)
                      </span>
                    </div>
                    <div className="bg-signal text-paper p-2 font-bold border border-ink animate-pulse">
                      2. ORBITING
                      <span className="block text-[8px] text-paper/80 font-normal">
                        Stage 1 Active
                      </span>
                    </div>
                    <div className="bg-surface text-ash p-2 border border-ink/20">
                      3. DRAFT 2
                      <span className="block text-[8px] text-ash/70 font-normal">
                        Day +7
                      </span>
                    </div>
                    <div className="bg-surface text-ash p-2 border border-ink/20">
                      4. FINAL
                      <span className="block text-[8px] text-ash/70 font-normal">
                        Day +14
                      </span>
                    </div>
                  </div>
                </div>

                {/* Local inference & queue status */}
                <div className="flex items-center justify-between pt-2 border-t border-ink/10 text-xs font-mono text-ash">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-ink" />
                    Queue: <strong className="text-ink">ghost-hunter</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-signal" />
                    Model: <strong className="text-ink">Gemma 2B (Local)</strong>
                  </span>
                </div>
              </div>

              {/* Bottom accent ticker banner */}
              <div className="bg-phantom px-4 py-2 border-t border-ink font-mono text-[10px] text-ink/80 flex items-center justify-between">
                <span>REPLY INTERRUPT: ARMED</span>
                <span>FAILOVER: PERSISTENT</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
