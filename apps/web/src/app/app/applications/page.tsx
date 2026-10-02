'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Display,
  Text,
  Button,
  StatusChip,
  MonoData,
  Hairline,
} from '@/components/primitives';
import { EmptyState, ErrorState } from '@/components/domain';
import { Plus, Search, ArrowRight, Clock, Building2, User, Mail, Linkedin } from 'lucide-react';
import { ApplicationStatus } from '@ghost-hunter/shared';

export default function ApplicationsListPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    data: applications,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['applications', selectedStatus],
    queryFn: () => api.listApplications(selectedStatus),
  });

  const filterTabs = [
    { label: 'All Hunts', value: 'ALL' },
    { label: 'Hunting', value: 'HUNTING' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Replied', value: 'REPLIED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const filteredApplications = (applications || []).filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.company.toLowerCase().includes(q) ||
      app.role.toLowerCase().includes(q) ||
      app.recruiterName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 hairline-b">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-signal font-bold">
            Cadence Ledger
          </span>
          <Display variant="h1" className="uppercase mt-1">
            Applications
          </Display>
        </div>
        <Link href="/app/applications/new">
          <Button variant="signal" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            New Application
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-bone hairline">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`font-mono text-xs font-bold uppercase tracking-wider px-3 py-1.5 transition-all ${
                selectedStatus === tab.value
                  ? 'bg-ink text-paper shadow-sm'
                  : 'text-ash hover:text-ink hover:bg-paper'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-ash absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search company, role, recruiter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-paper hairline pl-9 pr-4 py-2 font-mono text-xs uppercase tracking-wider outline-none focus:border-signal"
          />
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="hairline p-6 bg-paper shadow-sm animate-pulse flex justify-between items-center">
              <div className="space-y-2">
                <div className="w-48 h-6 bg-bone rounded" />
                <div className="w-72 h-4 bg-bone rounded" />
              </div>
              <div className="w-24 h-8 bg-bone rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could Not Connect to API"
          message={(error as Error)?.message || 'Make sure the Fastify API server is running on port 3001.'}
          onRetry={() => refetch()}
        />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No Matching Sentinels' : 'Nothing to hunt yet'}
          description={
            searchQuery
              ? `No applications found matching "${searchQuery}". Try clearing search filters.`
              : 'Add your first job or internship outreach message to launch an autonomous follow-up sentinel.'
          }
          actionLabel="Add Application"
          actionHref="/app/applications/new"
        />
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="hairline p-6 bg-paper shadow-hard hover:translate-x-1 transition-transform flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display font-extrabold text-2xl uppercase tracking-tight">
                    {app.company}
                  </span>
                  <StatusChip status={app.status} subStatus={app.subStatus} size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-ink font-medium">
                  <span>{app.role}</span>
                  <span className="text-ash">&bull;</span>
                  <div className="flex items-center gap-1.5 text-ash">
                    <User className="w-3.5 h-3.5" />
                    <span>{app.recruiterName}</span>
                  </div>
                  <span className="text-ash">&bull;</span>
                  <div className="flex items-center gap-1.5 text-ash font-mono text-xs uppercase">
                    {app.outreachChannel === 'linkedin' ? (
                      <Linkedin className="w-3.5 h-3.5 text-signal" />
                    ) : (
                      <Mail className="w-3.5 h-3.5 text-signal" />
                    )}
                    <span>{app.outreachChannel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-ash pt-1">
                  <span className="tabular-nums">
                    Max stages: {app.maxFollowUps}
                  </span>
                  <span>&bull;</span>
                  <span>
                    Delay: {Math.round(app.delayMs / (app.delayMs < 60000 ? 1000 : 86400000))}
                    {app.delayMs < 60000 ? 's (demo)' : 'd'}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <Link href={`/app/applications/${app.id}`}>
                  <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Sentinel
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
