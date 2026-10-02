import React from 'react';
import { cn } from '@/lib/utils';
import { ApplicationStatus, SubStatus } from '@ghost-hunter/shared';

export interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: ApplicationStatus;
  subStatus?: SubStatus | null;
  size?: 'sm' | 'md';
}

export function StatusChip({
  status,
  subStatus,
  size = 'md',
  className,
  ...props
}: StatusChipProps) {
  // If HUNTING and subStatus is present, display subStatus as primary visual cue
  const activeStatusKey = status === 'HUNTING' && subStatus ? subStatus : status;

  const configMap: Record<
    string,
    { label: string; bg: string; text: string; dot: string; pulse?: boolean }
  > = {
    DRAFT: {
      label: 'DRAFT',
      bg: 'bg-bone',
      text: 'text-ink',
      dot: 'bg-ash',
    },
    HUNTING: {
      label: 'HUNTING',
      bg: 'bg-phantom',
      text: 'text-ink',
      dot: 'bg-signal',
      pulse: true,
    },
    WAITING: {
      label: 'WAITING',
      bg: 'bg-phantom',
      text: 'text-ink',
      dot: 'bg-signal',
      pulse: true,
    },
    GENERATING: {
      label: 'GENERATING DRAFT',
      bg: 'bg-signal',
      text: 'text-paper',
      dot: 'bg-paper',
      pulse: true,
    },
    AWAITING_REVIEW: {
      label: 'AWAITING REVIEW',
      bg: 'bg-status-review',
      text: 'text-ink',
      dot: 'bg-ink',
    },
    DEGRADED: {
      label: 'DEGRADED (OLLAMA OFFLINE)',
      bg: 'bg-status-review',
      text: 'text-ink',
      dot: 'bg-status-failed',
    },
    REPLIED: {
      label: 'REPLIED — HUNT OVER',
      bg: 'bg-moss',
      text: 'text-paper',
      dot: 'bg-phantom',
    },
    CANCELLED: {
      label: 'CANCELLED',
      bg: 'bg-ash',
      text: 'text-paper',
      dot: 'bg-bone',
    },
    COMPLETED: {
      label: 'COMPLETED',
      bg: 'bg-moss',
      text: 'text-paper',
      dot: 'bg-phantom',
    },
    FAILED: {
      label: 'FAILED',
      bg: 'bg-status-failed',
      text: 'text-paper',
      dot: 'bg-paper',
    },
  };

  const current = configMap[activeStatusKey] || {
    label: status,
    bg: 'bg-bone',
    text: 'text-ink',
    dot: 'bg-ink',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3.5 py-1 gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-bold tracking-wider uppercase rounded-full hairline shadow-sm select-none',
        current.bg,
        current.text,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full inline-block',
          current.dot,
          current.pulse && 'animate-pulse'
        )}
      />
      <span>{current.label}</span>
    </span>
  );
}
