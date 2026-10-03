'use client';

import React, { useState } from 'react';
import { Button } from '@/components/primitives';
import { StreamText } from '@/components/animation';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface PresetOutreach {
  company: string;
  role: string;
  recruiter: string;
  stage: number;
  subject: string;
  body: string;
  source: 'gemma' | 'template';
}

const PRESETS: PresetOutreach[] = [
  {
    company: 'Anthropic',
    role: 'Distributed Systems Engineer',
    recruiter: 'Sarah Chen',
    stage: 1,
    subject: 'Following up on Distributed Systems Engineer role at Anthropic',
    body: 'Hi Sarah, I wanted to quickly follow up on my application for the Distributed Systems Engineer role. Given Anthropic\'s recent focus on cluster fault-tolerance and high-throughput model serving, I\'m particularly excited to bring my experience scaling distributed consensus systems to the team. Let me know if you need any additional portfolio artifacts or details.',
    source: 'gemma',
  },
  {
    company: 'Stripe',
    role: 'Staff Infrastructure Architect',
    recruiter: 'Marcus Vance',
    stage: 2,
    subject: 'Checking in regarding Staff Infrastructure Architect at Stripe',
    body: 'Hi Marcus, checking in on my application for the Staff Infrastructure role. In the interim, I recently published an architectural post on temporal workflow durability and zero-loss failovers which aligns closely with Stripe\'s high-availability payment pipeline standards. Looking forward to discussing how this background can support your infrastructure initiatives.',
    source: 'gemma',
  },
  {
    company: 'Apple',
    role: 'CoreOS Platform Engineer',
    recruiter: 'Elena Rostova',
    stage: 3,
    subject: 'Final follow-up on CoreOS Platform Engineer opening at Apple',
    body: 'Hi Elena, I hope your week is going smoothly. I\'m circling back one last time regarding the CoreOS Platform Engineer opening. If the headcount is filled or priorities have pivoted, no problem at all. I will stay tuned for future opportunities. Thank you again for your time and consideration.',
    source: 'gemma',
  },
];

export function InteractiveDraftSimulator() {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const current = PRESETS[selectedPresetIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(`${current.subject}\n\n${current.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = current.body.trim().split(/\s+/).length;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-ink/10 bg-surface relative">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink text-paper text-xs font-mono uppercase tracking-widest border border-ink shadow-hard mb-4">
            <span>Live Interactive Simulator</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase tracking-tight leading-none mb-4">
            Test Local Gemma Synthesis
          </h2>
          <p className="text-ash text-base sm:text-lg font-sans leading-relaxed">
            Experience how Ghost-Hunter generates tailored, high-converting
            outreach without generic AI cliches or hallucinated claims.
          </p>
        </div>

        {/* Preset Selector Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="font-mono text-xs text-ash uppercase tracking-wider mr-2">
            Select Role Preset:
          </span>
          {PRESETS.map((preset, idx) => (
            <button
              key={preset.company}
              onClick={() => setSelectedPresetIndex(idx)}
              className={`px-4 py-2 border font-mono text-xs uppercase font-bold transition-all ${
                selectedPresetIndex === idx
                  ? 'bg-ink text-paper border-ink shadow-hard'
                  : 'bg-paper text-ink border-ink/20 hover:border-ink'
              }`}
            >
              {preset.company} · Stage {preset.stage}
            </button>
          ))}
        </div>

        {/* Simulator Card */}
        <div className="bg-paper border-2 border-ink shadow-hard-lg overflow-hidden">
          {/* Header */}
          <div className="bg-ink text-paper p-4 border-b border-ink flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-signal" />
              <span className="font-mono text-xs uppercase tracking-wider font-bold">
                Local Gemma 2B Inference Preview
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-phantom text-ink font-mono text-[10px] font-bold uppercase">
                <ShieldCheck className="w-3 h-3 text-signal" />
                Air-Gapped (0 Bytes Sent)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-signal text-paper font-mono text-[10px] font-bold uppercase">
                {wordCount} / 120 Words
              </span>
            </div>
          </div>

          {/* Context Parameters */}
          <div className="p-6 border-b border-ink/10 bg-surface/50 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <span className="text-ash text-[10px] uppercase block">
                Target Company &amp; Role
              </span>
              <strong className="text-ink">
                {current.role} at {current.company}
              </strong>
            </div>
            <div>
              <span className="text-ash text-[10px] uppercase block">
                Recruiter Contact
              </span>
              <strong className="text-ink">{current.recruiter}</strong>
            </div>
            <div>
              <span className="text-ash text-[10px] uppercase block">
                Cadence Milestone
              </span>
              <strong className="text-signal">
                Stage {current.stage} Follow-Up
              </strong>
            </div>
          </div>

          {/* Draft Body Preview */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="font-mono text-xs text-ash uppercase tracking-wider block mb-1">
                Subject Line
              </span>
              <div className="p-3 bg-surface border border-ink/20 font-mono text-sm font-bold text-ink">
                {current.subject}
              </div>
            </div>

            <div>
              <span className="font-mono text-xs text-ash uppercase tracking-wider block mb-1">
                Synthesized Body
              </span>
              <div className="p-4 sm:p-6 bg-surface border-2 border-ink font-sans text-base text-ink leading-relaxed min-h-[140px]">
                <StreamText text={current.body} speed={8} />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-ink/10">
              <div className="flex items-center gap-2 font-mono text-xs text-ash">
                <Zap className="w-3.5 h-3.5 text-signal" />
                <span>Synthesis latency: ~410ms on local CPU/Metal</span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2 border border-ink font-mono text-xs uppercase"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-signal" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Draft</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
