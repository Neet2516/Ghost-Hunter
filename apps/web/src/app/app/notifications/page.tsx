'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Display,
  Text,
  Button,
  StatusChip,
  Hairline,
} from '@/components/primitives';
import { EmptyState, ErrorState } from '@/components/domain';
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Inbox,
  CheckCircle2,
} from 'lucide-react';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const {
    data: notifications,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', { unreadOnly }],
    queryFn: () => api.getNotifications(unreadOnly),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.markNotificationsRead({ all: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markSingleMutation = useMutation({
    mutationFn: (id: string) =>
      api.markNotificationsRead({ notificationIds: [id] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const hasUnread = notifications?.some((n) => !n.readAt);

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      await Notification.requestPermission();
    }
  };

  const getKindBadge = (kind: string) => {
    switch (kind) {
      case 'STAGE_DRAFT_READY':
        return (
          <span className="font-mono text-xs font-bold uppercase tracking-wider bg-paper text-signal px-2 py-0.5 hairline flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-signal" />
            <span>Draft Ready</span>
          </span>
        );
      case 'CADENCE_TRIGGERED':
        return (
          <span className="font-mono text-xs font-bold uppercase tracking-wider bg-paper text-ash px-2 py-0.5 hairline flex items-center gap-1">
            <Clock className="w-3 h-3 text-ash" />
            <span>Cadence Due</span>
          </span>
        );
      case 'RECRUITER_REPLIED':
        return (
          <span className="font-mono text-xs font-bold uppercase tracking-wider bg-emerald-50 text-moss px-2 py-0.5 hairline border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-moss" />
            <span>Reply Detected</span>
          </span>
        );
      default:
        return (
          <span className="font-mono text-xs font-bold uppercase tracking-wider bg-paper text-ash px-2 py-0.5 hairline">
            {kind}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 hairline-b">
        <div className="space-y-1">
          <span className="font-mono text-xs uppercase tracking-widest text-ash font-extrabold block">
            Audit &amp; Dispatch Feed
          </span>
          <Display variant="xl" className="uppercase leading-none">
            Notifications
          </Display>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission !== 'granted' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={requestPermission}
                leftIcon={<Bell className="w-3.5 h-3.5" />}
              >
                Enable Desktop Alerts
              </Button>
            )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            isLoading={markAllMutation.isPending}
            disabled={!hasUnread}
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setUnreadOnly(false)}
          className={`font-mono text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 transition-all ${
            !unreadOnly
              ? 'bg-ink text-paper shadow-sm'
              : 'bg-paper hairline text-ash hover:text-ink'
          }`}
        >
          All Events
        </button>
        <button
          type="button"
          onClick={() => setUnreadOnly(true)}
          className={`font-mono text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 transition-all ${
            unreadOnly
              ? 'bg-ink text-paper shadow-sm'
              : 'bg-paper hairline text-ash hover:text-ink'
          }`}
        >
          Unread Only
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-bone rounded hairline animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Error Loading Notifications"
          message={(error as Error)?.message || 'Failed to fetch notifications.'}
          onRetry={() => refetch()}
        />
      ) : !notifications || notifications.length === 0 ? (
        <EmptyState
          title="No Notifications Found"
          description={
            unreadOnly
              ? 'You have caught up with all outreach activities.'
              : 'No sentinel actions or review alerts recorded yet.'
          }
          icon={Inbox}
          actionLabel="View Applications"
          actionHref="/app/applications"
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isRead = !!n.readAt;

            return (
              <div
                key={n.id}
                className={`p-6 hairline bg-paper shadow-hard transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !isRead ? 'border-l-4 border-l-signal bg-signal/5' : 'opacity-85'
                }`}
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {getKindBadge(n.kind)}
                    <span className="font-mono text-xs text-ash">
                      {new Date(n.createdAt).toLocaleTimeString()} &bull;{' '}
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-signal inline-block" />
                    )}
                  </div>

                  <p className="font-sans font-medium text-ink text-sm sm:text-base leading-snug">
                    {n.message}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                  {!isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markSingleMutation.mutate(n.id)}
                      disabled={markSingleMutation.isPending}
                    >
                      Mark read
                    </Button>
                  )}

                  <Link href={`/app/applications/${n.applicationId}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      View Hunt
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
