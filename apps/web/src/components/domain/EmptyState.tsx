import React from 'react';
import { Display, Text, Button } from '@/components/primitives';
import { LucideIcon, Plus } from 'lucide-react';
import Link from 'next/link';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export function EmptyState({
  title,
  description,
  actionLabel = 'New Application',
  actionHref,
  onAction,
  icon: Icon = Plus,
}: EmptyStateProps) {
  return (
    <div className="hairline p-12 md:p-16 bg-paper shadow-hard flex flex-col items-start max-w-2xl">
      <div className="w-12 h-12 hairline bg-bone flex items-center justify-center mb-6 shadow-sm">
        <Icon className="w-6 h-6 text-ink" />
      </div>
      <Display variant="h2" className="uppercase mb-3">
        {title}
      </Display>
      <Text variant="lead" className="text-ash mb-8 max-w-lg">
        {description}
      </Text>
      {actionHref ? (
        <Link href={actionHref}>
          <Button variant="signal" size="lg" leftIcon={<Plus className="w-4 h-4" />}>
            {actionLabel}
          </Button>
        </Link>
      ) : onAction ? (
        <Button variant="signal" size="lg" onClick={onAction} leftIcon={<Plus className="w-4 h-4" />}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
