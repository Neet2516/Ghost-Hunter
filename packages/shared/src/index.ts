import { z } from 'zod';

// Shared Enums & Statuses
export const ApplicationStatus = z.enum([
  'DRAFT',
  'HUNTING',
  'REPLIED',
  'CANCELLED',
  'COMPLETED',
  'FAILED'
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatus>;

export const SubStatus = z.enum([
  'WAITING',
  'GENERATING',
  'AWAITING_REVIEW',
  'DEGRADED'
]);
export type SubStatus = z.infer<typeof SubStatus>;

export const FollowUpStatus = z.enum([
  'GENERATING',
  'READY',
  'SENT',
  'SKIPPED',
  'SNOOZED',
  'DISCARDED_REPLY'
]);
export type FollowUpStatus = z.infer<typeof FollowUpStatus>;

export const OutreachChannel = z.enum([
  'email',
  'linkedin',
  'other'
]);
export type OutreachChannel = z.infer<typeof OutreachChannel>;

export const EventType = z.enum([
  'CREATED',
  'HUNT_STARTED',
  'TIMER_FIRED',
  'REPLY_SIGNAL',
  'DRAFT_READY',
  'DRAFT_APPROVED',
  'DRAFT_SKIPPED',
  'RETRY',
  'DEGRADED',
  'CANCELLED',
  'COMPLETED',
  'ERROR'
]);
export type EventType = z.infer<typeof EventType>;

// Task Queue name constant
export const GHOST_HUNTER_TASK_QUEUE = 'ghost-hunter';
