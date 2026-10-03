'use client';

import React from 'react';
import { Application, FollowUp, Event } from '@ghost-hunter/shared';
import { Display, Text, StatusChip, MonoData } from '@/components/primitives';
import {
  CheckCircle2,
  Clock,
  Send,
  SkipForward,
  Sparkles,
  AlertCircle,
  FileText,
  Calendar,
  User,
  Mail,
  Linkedin,
  Radio,
} from 'lucide-react';

export interface TrailTimelineProps {
  application: Application;
  followups?: FollowUp[];
  events?: Event[];
  onSelectDraft?: (followUp: FollowUp) => void;
}

export function TrailTimeline({
  application,
  followups = [],
  events = [],
  onSelectDraft,
}: TrailTimelineProps) {
  const maxStages = application.maxFollowUps;
  const stages = Array.from({ length: maxStages }, (_, i) => i + 1);

  // Group followups by stage
  const followupsByStage = new Map<number, FollowUp>();
  followups.forEach((f) => followupsByStage.set(f.stage, f));

  return (
    <div className="hairline p-8 bg-paper shadow-hard space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 hairline-b">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-ash font-bold block">
            Cadence Orchestration Trail
          </span>
          <Display variant="h2" className="text-xl md:text-2xl uppercase">
            Outreach Progression ({followups.length} / {maxStages} Stages)
          </Display>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-ash uppercase">Current Orbit:</span>
          <StatusChip
            status={application.status}
            subStatus={application.subStatus}
          />
        </div>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-bone hairline-l">
        {/* Node 0: Initial Outreach Sent */}
        <div className="relative group">
          {/* Node marker */}
          <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-paper border-2 border-ink flex items-center justify-center shadow-sm">
            {application.outreachChannel === 'linkedin' ? (
              <Linkedin className="w-3.5 h-3.5 text-ink" />
            ) : (
              <Mail className="w-3.5 h-3.5 text-ink" />
            )}
          </div>

          <div className="p-4 bg-bone/40 hairline space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-ink">
                Initial Outreach Sent
              </span>
              <span className="font-mono text-xs text-ash">
                {new Date(application.outreachSentAt).toLocaleString()}
              </span>
            </div>

            <p className="font-sans text-xs text-ash line-clamp-2">
              {application.outreachContext}
            </p>
          </div>
        </div>

        {/* Multi-stage nodes */}
        {stages.map((stageNum) => {
          const followUp = followupsByStage.get(stageNum);
          const isPendingReview =
            followUp?.status === 'READY' ||
            (application.subStatus === 'AWAITING_REVIEW' &&
              !followUp &&
              stageNum === 1);
          const isSent = followUp?.status === 'SENT';
          const isSkipped = followUp?.status === 'SKIPPED';
          const isSnoozed = followUp?.status === 'SNOOZED';
          const isGenerating = followUp?.status === 'GENERATING';
          const isWaiting = !followUp && application.status === 'HUNTING';
          const isTemplate = followUp?.source === 'template';

          return (
            <div key={stageNum} className="relative group">
              {/* Node indicator marker */}
              <div
                className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-all ${
                  isSent
                    ? 'bg-moss text-paper border-2 border-moss'
                    : isPendingReview
                    ? 'bg-signal text-paper border-2 border-signal animate-pulse'
                    : isSkipped
                    ? 'bg-ash/20 text-ash border-2 border-ash line-through'
                    : 'bg-paper text-ash border-2 border-ash'
                }`}
              >
                {isSent ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isPendingReview ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : isSkipped ? (
                  <SkipForward className="w-3.5 h-3.5" />
                ) : (
                  <span className="font-mono text-[10px] font-bold">
                    {stageNum}
                  </span>
                )}
              </div>

              <div
                className={`p-5 hairline transition-all ${
                  isPendingReview
                    ? 'bg-paper border-2 border-signal shadow-hard'
                    : isSent
                    ? 'bg-paper shadow-sm'
                    : 'bg-bone/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 hairline-b">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black uppercase tracking-wider text-ink">
                      Stage {stageNum} Follow-Up
                    </span>

                    {followUp && (
                      <span
                        className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 hairline ${
                          isSent
                            ? 'bg-emerald-50 text-moss border-emerald-300'
                            : isPendingReview
                            ? 'bg-signal text-paper'
                            : isSkipped
                            ? 'bg-bone text-ash'
                            : 'bg-bone text-ink'
                        }`}
                      >
                        {followUp.status}
                      </span>
                    )}

                    {isTemplate && (
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 hairline bg-amber-50 text-amber-800 border-amber-300 flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" />
                        <span>Template</span>
                      </span>
                    )}

                    {!isTemplate && followUp && (
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 hairline bg-emerald-50 text-moss border-emerald-300 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Gemma</span>
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-xs text-ash">
                    {followUp?.decidedAt
                      ? new Date(followUp.decidedAt).toLocaleString()
                      : followUp?.createdAt
                      ? new Date(followUp.createdAt).toLocaleString()
                      : isWaiting && application.nextActionAt
                      ? `Due ${new Date(application.nextActionAt).toLocaleString()}`
                      : 'Upcoming in cadence orbit'}
                  </span>
                </div>

                {followUp ? (
                  <div className="space-y-2 pt-3">
                    <div className="font-sans font-semibold text-xs md:text-sm text-ink">
                      {followUp.subject}
                    </div>
                    <p className="font-sans text-xs text-ash line-clamp-2 leading-relaxed">
                      {followUp.editedBody || followUp.body}
                    </p>
                  </div>
                ) : (
                  <div className="pt-2 text-xs font-mono text-ash">
                    {isWaiting ? (
                      <span className="text-signal">
                        Temporal durable sleep active. Awaiting cadence interval.
                      </span>
                    ) : (
                      <span>Pending previous stage outcomes.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
