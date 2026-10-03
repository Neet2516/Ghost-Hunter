'use client';

import React, { useState } from 'react';
import { FollowUp, countWords, MAX_DRAFT_WORDS } from '@ghost-hunter/shared';
import { Display, Text, Button, StatusChip, MonoData, Hairline } from '@/components/primitives';
import { StreamText } from '@/components/animation';
import {
  Check,
  Copy,
  Edit3,
  Eye,
  Send,
  SkipForward,
  Clock,
  Sparkles,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export interface DraftReviewPanelProps {
  followUp: FollowUp;
  onApprove: (editedBody?: string) => Promise<void>;
  onSkip: () => Promise<void>;
  onSnooze: (durationMs?: number) => Promise<void>;
  isSubmitting?: boolean;
}

export function DraftReviewPanel({
  followUp,
  onApprove,
  onSkip,
  onSnooze,
  isSubmitting = false,
}: DraftReviewPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(followUp.editedBody || followUp.body);
  const [copied, setCopied] = useState(false);

  const currentBody = isEditing ? editedBody : (followUp.editedBody || followUp.body);
  const wordCount = countWords(currentBody);
  const isOverWordLimit = wordCount > MAX_DRAFT_WORDS;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${followUp.subject}\n\n${currentBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTemplate = followUp.source === 'template';

  return (
    <div className="hairline bg-paper shadow-hard overflow-hidden border-t-4 border-t-signal">
      {/* Header bar */}
      <div className="p-6 bg-bone hairline-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-signal bg-paper px-2 py-0.5 hairline">
              Stage {followUp.stage} Draft Ready
            </span>
            <span
              className={`font-mono text-xs px-2 py-0.5 hairline flex items-center gap-1.5 ${
                isTemplate
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-50 text-moss border-emerald-300'
              }`}
            >
              {isTemplate ? (
                <>
                  <FileText className="w-3 h-3 text-amber-700" />
                  <span>Fallback Template</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-signal" />
                  <span>Gemma 3:4b (Local)</span>
                </>
              )}
            </span>
          </div>
          <Display variant="h3" className="text-lg md:text-xl uppercase">
            Review Follow-Up Draft
          </Display>
        </div>

        {/* View Mode Toggle & Copy */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            aria-label={isEditing ? 'Switch to stream view' : 'Switch to edit text view'}
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase px-3 py-1.5 bg-paper hairline hover:bg-bone transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          >
            {isEditing ? (
              <>
                <Eye className="w-3.5 h-3.5 text-signal" aria-hidden="true" />
                <span>Stream View</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-ash" aria-hidden="true" />
                <span>Edit Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy subject and draft text to clipboard"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase px-3 py-1.5 bg-paper hairline hover:bg-bone transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-moss" aria-hidden="true" />
                <span className="text-moss">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-ash" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Degraded Alert Banner if Template used */}
      {isTemplate && (
        <div className="p-4 bg-amber-50 hairline-b border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs text-amber-900">
            <span className="font-bold block uppercase tracking-wider font-mono">
              Ollama Offline / Degraded
            </span>
            <p>
              Local model generation was unavailable or timed out after retries. A dependable fallback template was generated using the candidate context.
            </p>
          </div>
        </div>
      )}

      {/* Draft Content Container */}
      <div className="p-8 space-y-6">
        {/* Subject */}
        <div className="space-y-1.5 pb-4 hairline-b">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-ash block">
            Email Subject Line
          </span>
          <p className="font-sans font-semibold text-ink text-base md:text-lg">
            {followUp.subject}
          </p>
        </div>

        {/* Body View or Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-ash block">
              Message Body
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-ash">Word count:</span>
              <span
                className={`font-bold ${
                  isOverWordLimit
                    ? 'text-signal-orange underline'
                    : wordCount > 100
                    ? 'text-signal-orange'
                    : 'text-ink'
                }`}
              >
                {wordCount} / {MAX_DRAFT_WORDS}
              </span>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={8}
                aria-label="Edit follow-up body text"
                className="w-full p-4 font-sans text-sm md:text-base leading-relaxed bg-bone hairline focus:outline-none focus:ring-2 focus:ring-signal transition-all resize-y"
                placeholder="Edit follow-up body..."
              />
              <span className="font-mono text-[11px] text-ash block">
                Edits made here will be sent as the approved message.
              </span>
            </div>
          ) : (
            <div className="p-6 bg-bone hairline min-h-[160px] font-sans text-sm md:text-base leading-relaxed text-ink">
              <StreamText text={currentBody} speed={12} cursor={false} />
            </div>
          )}
        </div>
      </div>

      {/* Actions footer */}
      <div className="p-6 bg-bone hairline-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-ash font-mono">
          <Clock className="w-3.5 h-3.5 text-signal" />
          <span>Human review gate active • Auto-skips on timeout (48h)</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSnooze(24 * 60 * 60 * 1000)}
            disabled={isSubmitting}
            leftIcon={<Clock className="w-3.5 h-3.5" />}
          >
            Snooze 24h
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSkip()}
            disabled={isSubmitting}
            leftIcon={<SkipForward className="w-3.5 h-3.5" />}
          >
            Skip Stage
          </Button>

          <Button
            variant="signal"
            size="sm"
            onClick={() => onApprove(isEditing ? editedBody : undefined)}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Approve &amp; Send
          </Button>
        </div>
      </div>
    </div>
  );
}
