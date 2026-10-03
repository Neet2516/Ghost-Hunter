'use client';

import React from 'react';
import {
  Server,
  Lock,
  Cpu,
  Layers,
  Database,
  Radio,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export function ArchitectureSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-ink/10 bg-paper relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink text-paper text-xs font-mono uppercase tracking-widest border border-ink shadow-hard mb-4">
            <span>System Architecture &amp; Privacy</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase tracking-tight leading-none mb-4">
            Built for paranoia. <br />
            Engineered for durability.
          </h2>
          <p className="text-ash text-base sm:text-lg font-sans leading-relaxed">
            Standard job tools rely on fragile cron jobs, in-memory timers, and
            cloud LLMs that surveil your correspondence. Ghost-Hunter is
            architected from the ground up for absolute durability and air-gapped
            privacy.
          </p>
        </div>

        {/* 3 Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Pillar 1: Temporal */}
          <div className="bg-surface border-2 border-ink p-8 shadow-hard flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center mb-6 shadow-hard">
                <Server className="w-6 h-6 text-signal" />
              </div>
              <span className="font-mono text-xs font-bold text-signal uppercase tracking-wider block mb-2">
                DURABILITY ENGINE
              </span>
              <h3 className="font-display text-2xl font-bold text-ink uppercase tracking-tight mb-4">
                Temporal State Machine
              </h3>
              <p className="text-sm text-ash leading-relaxed mb-6 font-sans">
                Every outreach campaign runs as an isolated Temporal workflow.
                If your worker process is killed, memory is cleared, or your
                laptop reboots, the server preserves the countdown in event
                history. When worker restarts, pending tasks drain with zero state loss.
              </p>
            </div>
            <div className="p-3 bg-paper border border-ink/20 font-mono text-xs text-ink">
              <span className="text-ash block text-[10px] uppercase">
                Guarantee:
              </span>
              Exactly-once timer execution &amp; 0 dropped follow-ups.
            </div>
          </div>

          {/* Pillar 2: Local Gemma */}
          <div className="bg-surface border-2 border-ink p-8 shadow-hard flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center mb-6 shadow-hard">
                <Lock className="w-6 h-6 text-signal" />
              </div>
              <span className="font-mono text-xs font-bold text-signal uppercase tracking-wider block mb-2">
                AIR-GAPPED INFERENCE
              </span>
              <h3 className="font-display text-2xl font-bold text-ink uppercase tracking-tight mb-4">
                Local Gemma 2B / 9B
              </h3>
              <p className="text-sm text-ash leading-relaxed mb-6 font-sans">
                Your career history, recruiter names, and interview notes should
                never train proprietary cloud LLMs. Ghost-Hunter invokes Google
                Gemma locally via Ollama. It operates 100% offline with zero
                telemetry, zero API tokens, and zero cloud billing.
              </p>
            </div>
            <div className="p-3 bg-paper border border-ink/20 font-mono text-xs text-ink">
              <span className="text-ash block text-[10px] uppercase">
                Privacy:
              </span>
              0 bytes of candidate outreach data leave localhost.
            </div>
          </div>

          {/* Pillar 3: Human Review Gate */}
          <div className="bg-surface border-2 border-ink p-8 shadow-hard flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center mb-6 shadow-hard">
                <Cpu className="w-6 h-6 text-signal" />
              </div>
              <span className="font-mono text-xs font-bold text-signal uppercase tracking-wider block mb-2">
                REPUTATION SHIELD
              </span>
              <h3 className="font-display text-2xl font-bold text-ink uppercase tracking-tight mb-4">
                Human Review Gate
              </h3>
              <p className="text-sm text-ash leading-relaxed mb-6 font-sans">
                Autonomous email bots ruin professional relationships. Ghost-Hunter
                enforces a strict review gate at <code className="bg-phantom px-1 text-ink font-bold">AWAITING_REVIEW</code>.
                Drafts are delivered directly to your dashboard and desktop alerts.
                You approve, edit, or snooze before any action is taken.
              </p>
            </div>
            <div className="p-3 bg-paper border border-ink/20 font-mono text-xs text-ink">
              <span className="text-ash block text-[10px] uppercase">
                Safety:
              </span>
              120-word maximum limit &amp; anti-hallucination sanitization.
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Table */}
        <div className="bg-paper border-2 border-ink shadow-hard-lg overflow-hidden">
          <div className="bg-ink text-paper p-6 border-b border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-black uppercase tracking-tight">
                Architectural Breakdown
              </h3>
              <p className="font-mono text-xs text-paper/70 tracking-wider uppercase mt-1">
                Ghost-Hunter vs. Conventional Cloud Outreach Tools
              </p>
            </div>
            <span className="inline-block px-3 py-1 bg-signal text-paper font-mono text-xs font-bold uppercase tracking-widest self-start sm:self-auto">
              Specification Matrix
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-ink bg-surface font-mono text-xs uppercase tracking-wider text-ink">
                  <th className="p-4 sm:p-5">Capability</th>
                  <th className="p-4 sm:p-5 bg-phantom border-x border-ink/20 text-ink">
                    Ghost-Hunter (This Architecture)
                  </th>
                  <th className="p-4 sm:p-5 text-ash">
                    Standard Web CRM / SaaS Bots
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 font-sans text-sm">
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-ink">
                    Cadence Timing Durability
                  </td>
                  <td className="p-4 sm:p-5 bg-phantom/50 border-x border-ink/20 font-mono text-xs font-medium text-ink">
                    <span className="flex items-center gap-1.5 text-signal font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4" /> Temporal Event Log
                    </span>
                    Survives worker crashes, node failover, and server restarts.
                  </td>
                  <td className="p-4 sm:p-5 text-ash font-mono text-xs">
                    <span className="flex items-center gap-1.5 text-red-600 font-bold mb-1">
                      <XCircle className="w-4 h-4" /> Node.js setTimeout / In-Memory Cron
                    </span>
                    Server restart or OOM kills scheduled timers silently.
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-bold text-ink">
                    Candidate Data Privacy
                  </td>
                  <td className="p-4 sm:p-5 bg-phantom/50 border-x border-ink/20 font-mono text-xs font-medium text-ink">
                    <span className="flex items-center gap-1.5 text-signal font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4" /> 100% Local (Ollama)
                    </span>
                    Runs offline on your laptop. 0 candidate data leaked.
                  </td>
                  <td className="p-4 sm:p-5 text-ash font-mono text-xs">
                    <span className="flex items-center gap-1.5 text-red-600 font-bold mb-1">
                      <XCircle className="w-4 h-4" /> Cloud LLM APIs
                    </span>
                    Recruiter emails and resume notes sent to commercial clouds.
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-bold text-ink">
                    Recruiter Reply Handling
                  </td>
                  <td className="p-4 sm:p-5 bg-phantom/50 border-x border-ink/20 font-mono text-xs font-medium text-ink">
                    <span className="flex items-center gap-1.5 text-signal font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4" /> Real-Time Signal Interrupt
                    </span>
                    Immediate halt with race guard discarding in-flight drafts.
                  </td>
                  <td className="p-4 sm:p-5 text-ash font-mono text-xs">
                    <span className="flex items-center gap-1.5 text-red-600 font-bold mb-1">
                      <XCircle className="w-4 h-4" /> Polled Cron
                    </span>
                    Risk of sending embarrassing automated email after reply.
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-bold text-ink">
                    Control &amp; Transparency
                  </td>
                  <td className="p-4 sm:p-5 bg-phantom/50 border-x border-ink/20 font-mono text-xs font-medium text-ink">
                    <span className="flex items-center gap-1.5 text-signal font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4" /> Human Review Gate
                    </span>
                    Every draft requires candidate review; inline edits allowed.
                  </td>
                  <td className="p-4 sm:p-5 text-ash font-mono text-xs">
                    <span className="flex items-center gap-1.5 text-red-600 font-bold mb-1">
                      <XCircle className="w-4 h-4" /> Black-Box Auto-Sender
                    </span>
                    Zero review before delivery, risking hallucinated details.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
