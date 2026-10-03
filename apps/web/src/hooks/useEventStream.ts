'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useEventStream() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ type: string; data: any } | null>(null);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          // Attempt reconnection after 3 seconds
          reconnectTimer = setTimeout(connect, 3000);
        };

        eventSource.addEventListener('connected', () => {
          setIsConnected(true);
        });

        const handleGenericEvent = (type: string, data: any) => {
          setLastEvent({ type, data });

          // Invalidate notifications query
          queryClient.invalidateQueries({ queryKey: ['notifications'] });

          // Invalidate applications list
          queryClient.invalidateQueries({ queryKey: ['applications'] });

          // If event has applicationId, invalidate specific application queries
          const appId = data?.applicationId || data?.id;
          if (appId) {
            queryClient.invalidateQueries({ queryKey: ['application', appId] });
            queryClient.invalidateQueries({ queryKey: ['application', appId, 'events'] });
            queryClient.invalidateQueries({ queryKey: ['application', appId, 'followups'] });
          }

          // Trigger browser notification if available
          if ('Notification' in window && Notification.permission === 'granted') {
            if (type === 'HUNT_STARTED') {
              new Notification('Ghost-Hunter Sentinel Active', {
                body: `Cadence sentinel running for application.`,
              });
            } else if (type === 'REPLY_SIGNAL') {
              new Notification('Recruiter Replied!', {
                body: `A response was detected from the recruiter.`,
              });
            } else if (type === 'DRAFT_DECISION') {
              new Notification('Draft Decision Processed', {
                body: `Action: ${data?.action}`,
              });
            }
          }
        };

        const eventTypes = [
          'APPLICATION_CREATED',
          'APPLICATION_UPDATED',
          'APPLICATION_DELETED',
          'HUNT_STARTED',
          'REPLY_SIGNAL',
          'CANCELLED',
          'DRAFT_DECISION',
          'NOTIFICATIONS_READ',
        ];

        eventTypes.forEach((type) => {
          eventSource?.addEventListener(type, (e: MessageEvent) => {
            try {
              const data = JSON.parse(e.data);
              handleGenericEvent(type, data);
            } catch {
              handleGenericEvent(type, e.data);
            }
          });
        });
      } catch {
        setIsConnected(false);
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [queryClient]);

  return {
    isConnected,
    lastEvent,
    requestNotificationPermission,
  };
}
