'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Display,
  Text,
  Button,
  StatusChip,
  MonoData,
  Hairline,
} from '@/components/primitives';
import {
  ErrorState,
  DraftReviewPanel,
  WorkflowPanel,
  TrailTimeline,
} from '@/components/domain';
import {
  ArrowLeft,
  Clock,
  User,
  Mail,
  Linkedin,
  Radio,
  CheckCircle2,
  XCircle,
  Trash2,
  Play,
  Calendar,
} from 'lucide-react';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const {
    data: application,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.getApplication(id),
  });

  const { data: events } = useQuery({
    queryKey: ['application', id, 'events'],
    queryFn: () => api.getApplicationEvents(id),
    enabled: !!application,
  });

  const { data: followups } = useQuery({
    queryKey: ['application', id, 'followups'],
    queryFn: () => api.getApplicationFollowUps(id),
    enabled: !!application,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      router.push('/app/applications');
    },
  });

  const startMutation = useMutation({
    mutationFn: (options?: { isDemoMode?: boolean }) => api.startHunt(id, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['application', id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['application', id, 'followups'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: () => api.replyHunt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['application', id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['application', id, 'followups'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.cancelHunt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['application', id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['application', id, 'followups'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const decisionMutation = useMutation({
    mutationFn: (payload: { action: 'approve' | 'skip' | 'snooze'; editedBody?: string; snoozeDurationMs?: number }) =>
      api.submitDecision(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['application', id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['application', id, 'followups'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const pendingDraft = followups?.find((f) => f.status === 'READY');

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="w-32 h-6 bg-bone rounded" />
        <div className="w-3/4 h-16 bg-bone rounded" />
        <div className="h-64 bg-bone rounded hairline" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="max-w-3xl mx-auto pt-8">
        <ErrorState
          title="Application Not Found"
          message={(error as Error)?.message || 'The specified outreach thread could not be located.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/app/applications"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-ash hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications Ledger</span>
        </Link>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 hairline-b">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <StatusChip status={application.status} subStatus={application.subStatus} />
            {application.workflowId && (
              <span className="font-mono text-xs bg-bone px-2 py-0.5 hairline text-ash">
                {application.workflowId}
              </span>
            )}
          </div>
          <Display variant="xl" className="leading-none uppercase">
            {application.company}
          </Display>
          <Display variant="h2" className="text-xl md:text-2xl text-ash uppercase">
            {application.role}
          </Display>
        </div>

        {/* Delete button */}
        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm(`Delete application for ${application.company}?`)) {
                deleteMutation.mutate();
              }
            }}
            isLoading={deleteMutation.isPending}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Temporal Sentinel Orbit Telemetry & Controls */}
      <WorkflowPanel
        application={application}
        onStartHunt={(options) => startMutation.mutate(options)}
        onMarkReplied={() => replyMutation.mutate()}
        onCancelHunt={() => cancelMutation.mutate()}
        isStarting={startMutation.isPending}
        isReplying={replyMutation.isPending}
        isCancelling={cancelMutation.isPending}
      />

      {/* Draft Review Panel (when awaiting review or pending draft exists) */}
      {pendingDraft && (
        <DraftReviewPanel
          followUp={pendingDraft}
          onApprove={async (editedBody) => {
            await decisionMutation.mutateAsync({
              action: 'approve',
              editedBody,
            });
          }}
          onSkip={async () => {
            await decisionMutation.mutateAsync({
              action: 'skip',
            });
          }}
          onSnooze={async (durationMs) => {
            await decisionMutation.mutateAsync({
              action: 'snooze',
              snoozeDurationMs: durationMs || 24 * 60 * 60 * 1000,
            });
          }}
          isSubmitting={decisionMutation.isPending}
        />
      )}

      {/* Grid: Left Context details, Right Cadence Status */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Outreach Context (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="hairline p-8 bg-paper shadow-hard space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-ash font-bold block">
              Outreach Talking Points &amp; Context
            </span>
            <Text variant="body" className="whitespace-pre-wrap leading-relaxed">
              {application.outreachContext}
            </Text>

            <Hairline color="ash" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="font-mono text-xs uppercase text-ash block">Recruiter Contact</span>
                <div className="flex items-center gap-2 font-medium text-sm">
                  <User className="w-4 h-4 text-signal" />
                  <span>{application.recruiterName}</span>
                </div>
                {application.recruiterContact && (
                  <span className="font-mono text-xs text-ash block truncate">
                    {application.recruiterContact}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-mono text-xs uppercase text-ash block">Channel &amp; Sent Date</span>
                <div className="flex items-center gap-2 font-medium text-sm">
                  {application.outreachChannel === 'linkedin' ? (
                    <Linkedin className="w-4 h-4 text-signal" />
                  ) : (
                    <Mail className="w-4 h-4 text-signal" />
                  )}
                  <span className="font-mono text-xs uppercase">{application.outreachChannel}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ash font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(application.outreachSentAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Cadence Status & Timers (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="hairline p-8 bg-paper shadow-hard space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-ash font-bold block">
              Cadence Parameters
            </span>
            <div className="space-y-3">
              <MonoData
                label="Cadence Delay"
                value={`${Math.round(application.delayMs / (application.delayMs < 60000 ? 1000 : 86400000))} ${
                  application.delayMs < 60000 ? 'Seconds' : 'Days'
                }`}
                secondaryValue={application.delayMs < 60000 ? '(Demo Time-Skip)' : ''}
                highlight="signal"
              />
              <MonoData
                label="Maximum Stages"
                value={`${application.maxFollowUps} Stages`}
              />
              <MonoData
                label="Created At"
                value={new Date(application.createdAt).toLocaleString()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Stage Cadence Trail Timeline */}
      <TrailTimeline
        application={application}
        followups={followups}
        events={events}
      />

      {/* Event Timeline Trail */}
      <div className="hairline p-8 bg-paper shadow-hard space-y-6">
        <div className="flex items-center justify-between">
          <Display variant="h2" className="uppercase text-xl">
            Outreach Event Trail
          </Display>
          <span className="font-mono text-xs uppercase text-ash">
            {events?.length || 0} Events Recorded
          </span>
        </div>

        {events && events.length > 0 ? (
          <div className="space-y-4 border-l-2 border-ink pl-6 ml-2">
            {events.map((ev) => (
              <div key={ev.id} className="relative space-y-1">
                <span className="absolute -left-[31px] top-1.5 w-3 h-3 bg-paper border-2 border-ink rounded-full" />
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold uppercase text-signal">
                    {ev.type}
                  </span>
                  <span className="font-mono text-xs text-ash">
                    {new Date(ev.at).toLocaleTimeString()} &bull; {new Date(ev.at).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-mono text-xs text-ash bg-bone/40 p-2 hairline whitespace-pre-wrap">
                  {JSON.stringify(ev.payload, null, 2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Text variant="muted">No events recorded yet.</Text>
        )}
      </div>
    </div>
  );
}
