import { z } from 'zod';

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

export const FollowUpSource = z.enum([
  'gemma',
  'template'
]);
export type FollowUpSource = z.infer<typeof FollowUpSource>;

export const FollowUpDecisionAction = z.enum([
  'approve',
  'skip',
  'snooze'
]);
export type FollowUpDecisionAction = z.infer<typeof FollowUpDecisionAction>;

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

export const NotificationKind = z.enum([
  'DRAFT_READY',
  'MODEL_DEGRADED',
  'HUNT_COMPLETED',
  'HUNT_CANCELLED',
  'REPLY_RECEIVED',
  'REMINDER',
  'ERROR',
  'INFO'
]);
export type NotificationKind = z.infer<typeof NotificationKind>;
