import React from 'react';
import { Display, Text, Button } from '@/components/primitives';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorState({
  title = 'Service Temporarily Disconnected',
  message,
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <div className="hairline p-10 md:p-14 bg-paper shadow-hard border-l-4 border-l-status-failed max-w-2xl">
      <div className="flex items-center gap-3 mb-4 text-status-failed">
        <AlertCircle className="w-6 h-6" />
        <span className="font-mono text-xs uppercase tracking-widest font-bold">
          System Signal Interrupted
        </span>
      </div>
      <Display variant="h2" className="uppercase mb-3">
        {title}
      </Display>
      <Text variant="body" className="text-ash mb-8 leading-relaxed">
        {message}
      </Text>
      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          isLoading={isRetrying}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
}
