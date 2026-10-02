import React from 'react';
import Link from 'next/link';
import {
  Display,
  Text,
  Button,
  Counter,
  MonoData,
  StatusChip,
  Hairline,
} from '@/components/primitives';
import { DegradedBanner } from '@/components/domain';
import { Plus, ArrowRight, Clock, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  // Mock initial dashboard state for App Shell verification
  const mockStats = {
    awaitingReview: 1,
    activeHunts: 3,
    repliedTotal: 2,
    nextWakeup: '01d 14h 22m',
  };

  const mockActiveHunts = [
    {
      id: 'mock-1',
      company: 'Stripe',
      role: 'Backend Infrastructure Intern',
      recruiter: 'Sarah Connor',
      status: 'HUNTING' as const,
      subStatus: 'AWAITING_REVIEW' as const,
      stage: 1,
      nextAction: 'Action required: Review drafted follow-up',
    },
    {
      id: 'mock-2',
      company: 'Linear',
      role: 'Product Engineer',
      recruiter: 'Karri Saarinen',
      status: 'HUNTING' as const,
      subStatus: 'WAITING' as const,
      stage: 2,
      nextAction: 'Durable sleep: 02d 08h remaining',
    },
    {
      id: 'mock-3',
      company: 'Vercel',
      role: 'Next.js Runtime Engineer',
      recruiter: 'Guillermo Rauch',
      status: 'REPLIED' as const,
      subStatus: null,
      stage: 1,
      nextAction: 'Recruiter replied — hunt finalized',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 hairline-b">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-signal font-bold">
            Sentinel Radar &bull; Active Orbit
          </span>
          <Display variant="h1" className="uppercase mt-1">
            Outreach Dashboard
          </Display>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app/applications/new">
            <Button variant="signal" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Start New Hunt
            </Button>
          </Link>
        </div>
      </div>

      {/* Optional Degraded Banner preview */}
      {/* <DegradedBanner /> */}

      {/* Top Metrics Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 bg-paper hairline shadow-hard">
        <Counter
          value={mockStats.awaitingReview}
          unit="DRAFTS"
          label="Requires your review"
          size="lg"
          highlight="signal"
        />
        <Counter
          value={mockStats.activeHunts}
          unit="ACTIVE"
          label="Temporal workflows hunting"
          size="lg"
          highlight="default"
        />
        <Counter
          value={mockStats.repliedTotal}
          unit="REPLIED"
          label="Recruiter responses captured"
          size="lg"
          highlight="moss"
        />
      </div>

      {/* Asymmetrical Grid: Left Sentinel Status, Right Hunt List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (4 cols): Sentinel Quick Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="hairline p-6 bg-bone shadow-hard space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-ash font-bold block">
              Temporal Engine Status
            </span>
            <div className="space-y-3">
              <MonoData
                label="Earliest Timer Fire"
                value={mockStats.nextWakeup}
                highlight="signal"
              />
              <MonoData
                label="Task Queue"
                value="ghost-hunter"
                highlight="default"
              />
              <MonoData
                label="Orchestrator"
                value="Temporal v1.24"
                secondaryValue="(Local dev)"
              />
            </div>
            <Hairline color="ash" className="my-2" />
            <a
              href="http://localhost:8233"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-ink hover:text-signal transition-colors"
            >
              <span>Temporal Web Console (:8233)</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="hairline p-6 bg-paper shadow-sm">
            <span className="font-mono text-xs uppercase tracking-widest text-ash font-bold block mb-2">
              Silence is Data
            </span>
            <Text variant="body" className="text-sm text-ash leading-relaxed">
              When a recruiter doesn’t reply, the agent wakes up at the exact configured delay and drafts a polite follow-up. You always retain final approval.
            </Text>
          </div>
        </div>

        {/* Right Column (8 cols): Active Outreach Threads */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <Display variant="h2" className="text-xl md:text-2xl uppercase">
              Active Outreach Sentinels
            </Display>
            <Link
              href="/app/applications"
              className="font-mono text-xs font-bold uppercase underline underline-offset-4 hover:text-signal"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {mockActiveHunts.map((hunt) => (
              <div
                key={hunt.id}
                className="hairline p-6 bg-paper shadow-hard hover:translate-x-1 transition-transform flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-extrabold text-2xl uppercase tracking-tight">
                      {hunt.company}
                    </span>
                    <StatusChip status={hunt.status} subStatus={hunt.subStatus} size="sm" />
                  </div>
                  <Text variant="body" className="font-medium text-sm">
                    {hunt.role} &bull; <span className="text-ash">{hunt.recruiter}</span>
                  </Text>
                  <div className="flex items-center gap-2 pt-2 text-xs font-mono text-ash">
                    <Clock className="w-3.5 h-3.5 text-signal" />
                    <span>{hunt.nextAction}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <Link href={`/app/applications/${hunt.id}`}>
                    <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Inspect Hunt
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
