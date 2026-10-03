'use client';

import React, { useState } from 'react';
import { Application } from '@ghost-hunter/shared';
import { Display, Text, Button, StatusChip, MonoData } from '@/components/primitives';
import { CountdownMono } from './CountdownMono';
import {
  Play,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Radio,
  Server,
  Layers,
  Timer,
  Zap,
} from 'lucide-react';

export interface WorkflowPanelProps {
  application: Application;
  onStartHunt?: (options?: { isDemoMode?: boolean }) => void;
  onMarkReplied?: () => void;
  onCancelHunt?: () => void;
  isStarting?: boolean;
  isReplying?: boolean;
  isCancelling?: boolean;
}

export function WorkflowPanel({
  application,
  onStartHunt,
  onMarkReplied,
  onCancelHunt,
  isStarting = false,
  isReplying = false,
  isCancelling = false,
}: WorkflowPanelProps) {
  const [copied, setCopied] = useState(false);
  const [demoMode, setDemoMode] = useState(application.delayMs < 60000);

  const workflowId = application.workflowId || `gh-${application.id}`;

  const handleCopyWorkflowId = () => {
    navigator.clipboard.writeText(workflowId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="hairline bg-paper shadow-hard overflow-hidden">
      {/* Top Banner */}
      <div className="p-6 bg-bone hairline-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-signal animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest font-extrabold text-signal">
              Temporal Sentinel Orbit
            </span>
          </div>
          <Display variant="h3" className="text-lg md:text-xl uppercase">
            Workflow Telemetry &amp; Controls
          </Display>
        </div>

        {/* Orbit Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {application.status === 'DRAFT' && onStartHunt && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDemoMode(!demoMode)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs font-bold uppercase transition-all hairline ${
                  demoMode
                    ? 'bg-signal/15 text-signal border-signal shadow-sm'
                    : 'bg-paper text-ash border-ash/40 hover:text-ink'
                }`}
                title={demoMode ? 'Demo Mode Active: 20s delays' : 'Click to enable 20s Demo Mode'}
              >
                <Zap className={`w-3.5 h-3.5 ${demoMode ? 'text-signal fill-signal/30' : 'text-ash'}`} />
                <span>Demo Mode (20s)</span>
              </button>
              <Button
                variant="signal"
                size="sm"
                onClick={() => onStartHunt({ isDemoMode: demoMode })}
                isLoading={isStarting}
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                Arm Sentinel
              </Button>
            </div>
          )}

          {application.status === 'HUNTING' && (
            <>
              {onMarkReplied && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onMarkReplied}
                  isLoading={isReplying}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-moss" />}
                >
                  Mark Replied
                </Button>
              )}
              {onCancelHunt && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelHunt}
                  isLoading={isCancelling}
                  leftIcon={<XCircle className="w-3.5 h-3.5 text-ash" />}
                >
                  Cancel Hunt
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-paper hairline-b">
        {/* Workflow ID */}
        <div className="p-4 bg-bone/30 hairline space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-ash font-bold">
              Workflow ID
            </span>
            <button
              type="button"
              onClick={handleCopyWorkflowId}
              className="text-ash hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal p-0.5 rounded-sm"
              title="Copy Workflow ID"
              aria-label="Copy Workflow ID to clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-moss" aria-hidden="true" />
              ) : (
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
          <p className="font-mono text-xs font-bold text-ink truncate select-all">
            {workflowId}
          </p>
        </div>

        {/* Task Queue */}
        <div className="p-4 bg-bone/30 hairline space-y-1.5">
          <span className="font-mono text-xs uppercase text-ash font-bold block">
            Temporal Task Queue
          </span>
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-ink">
            <Server className="w-3.5 h-3.5 text-signal" />
            <span>ghost-hunter</span>
          </div>
        </div>

        {/* Status & SubStatus */}
        <div className="p-4 bg-bone/30 hairline space-y-1.5">
          <span className="font-mono text-xs uppercase text-ash font-bold block">
            Workflow State
          </span>
          <StatusChip
            status={application.status}
            subStatus={application.subStatus}
          />
        </div>

        {/* Cadence Delay */}
        <div className="p-4 bg-bone/30 hairline space-y-1.5">
          <span className="font-mono text-xs uppercase text-ash font-bold block">
            Cadence Delay
          </span>
          <p className="font-mono text-xs font-bold text-ink">
            {Math.round(
              application.delayMs /
                (application.delayMs < 60000 ? 1000 : 86400000)
            )}{' '}
            {application.delayMs < 60000 ? 'Seconds (Demo)' : 'Days'}
          </p>
        </div>
      </div>

      {/* Cadence Countdown Bar (when HUNTING and waiting) */}
      {application.status === 'HUNTING' && application.nextActionAt && (
        <div className="p-4 bg-bone/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-signal" />
            <span className="font-mono text-xs uppercase text-ash font-bold">
              Cadence Sentinel Sleep:
            </span>
          </div>

          <CountdownMono
            targetISO={application.nextActionAt}
            label=""
            size="md"
          />
        </div>
      )}
    </div>
  );
}
