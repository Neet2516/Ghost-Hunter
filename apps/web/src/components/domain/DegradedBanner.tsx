import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface DegradedBannerProps {
  message?: string;
  settingsHref?: string;
}

export function DegradedBanner({
  message = 'Local Ollama is currently unreachable. Ghost-Hunter is operating in DEGRADED mode using pre-crafted fallback templates.',
  settingsHref = '/app/settings',
}: DegradedBannerProps) {
  return (
    <div className="w-full bg-status-review/20 border hairline border-status-review/80 p-4 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-1.5 bg-status-review text-ink rounded-full hairline">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs uppercase font-extrabold tracking-wider text-ink block sm:inline sm:mr-2">
              DEGRADED STATUS:
            </span>
            <span className="text-sm text-ink">{message}</span>
          </div>
        </div>
        {settingsHref && (
          <Link
            href={settingsHref}
            className="group font-mono text-xs font-bold uppercase underline underline-offset-4 flex items-center gap-1 hover:text-signal shrink-0"
          >
            <span>Model Health</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
