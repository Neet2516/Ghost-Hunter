import { z } from 'zod';
import {
  ApplicationStatus,
  SubStatus,
  FollowUpStatus,
  FollowUpSource,
  OutreachChannel,
  EventType,
  NotificationKind
} from './enums';
import {
  MIN_FOLLOWUPS,
  MAX_FOLLOWUPS,
  DEFAULT_FOLLOWUP_DELAY_MS,
  MAX_DRAFT_WORDS
} from './constants';

// Regex detecting placeholder tokens like [Name], [Company], <Name>, {Company}
export const PLACEHOLDER_TOKEN_REGEX = /\[[a-zA-Z0-9_\s-]+\]|\<[a-zA-Z0-9_\s-]+\>|\{[a-zA-Z0-9_\s-]+\}/;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Full Application model schema
export const ApplicationSchema = z.object({
  id: z.string().uuid(),
  company: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  recruiterName: z.string().min(1).max(100),
  recruiterContact: z.string().max(255).nullable().optional(),
  outreachChannel: OutreachChannel,
  outreachContext: z.string().min(1).max(3000),
  outreachSentAt: z.string().datetime(),
  delayMs: z.number().int().positive(),
  maxFollowUps: z.number().int().min(MIN_FOLLOWUPS).max(MAX_FOLLOWUPS),
  status: ApplicationStatus,
  subStatus: SubStatus.nullable().optional(),
  nextActionAt: z.string().datetime().nullable().optional(),
  workflowId: z.string().max(128).nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type Application = z.infer<typeof ApplicationSchema>;

// Create Application payload schema
export const CreateApplicationSchema = z.object({
  company: z.string().trim().min(1, 'Company name is required').max(100),
  role: z.string().trim().min(1, 'Role title is required').max(100),
  recruiterName: z.string().trim().min(1, 'Recruiter name is required').max(100),
  recruiterContact: z.string().trim().max(255).optional(),
  outreachChannel: OutreachChannel.default('email'),
  outreachContext: z.string().trim().min(5, 'Outreach context must be at least 5 characters').max(3000),
  outreachSentAt: z.string().datetime().optional(),
  delayMs: z.number().int().positive().default(DEFAULT_FOLLOWUP_DELAY_MS),
  maxFollowUps: z.number().int().min(MIN_FOLLOWUPS, 'At least 1 follow-up required').max(MAX_FOLLOWUPS, `Maximum ${MAX_FOLLOWUPS} follow-ups allowed`).default(2)
});
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;

// Update Application payload schema
export const UpdateApplicationSchema = z.object({
  company: z.string().trim().min(1).max(100).optional(),
  role: z.string().trim().min(1).max(100).optional(),
  recruiterName: z.string().trim().min(1).max(100).optional(),
  recruiterContact: z.string().trim().max(255).nullable().optional(),
  outreachChannel: OutreachChannel.optional(),
  outreachContext: z.string().trim().min(5).max(3000).optional(),
  outreachSentAt: z.string().datetime().optional(),
  delayMs: z.number().int().positive().optional(),
  maxFollowUps: z.number().int().min(MIN_FOLLOWUPS).max(MAX_FOLLOWUPS).optional()
});
export type UpdateApplicationInput = z.infer<typeof UpdateApplicationSchema>;

// FollowUp model schema
export const FollowUpSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  stage: z.number().int().min(1).max(MAX_FOLLOWUPS),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  source: FollowUpSource,
  status: FollowUpStatus,
  editedBody: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  decidedAt: z.string().datetime().nullable().optional()
});
export type FollowUp = z.infer<typeof FollowUpSchema>;

// Event model schema
export const EventSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  type: EventType,
  payload: z.record(z.unknown()),
  at: z.string().datetime()
});
export type Event = z.infer<typeof EventSchema>;

// Notification model schema
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  kind: NotificationKind,
  message: z.string().min(1).max(500),
  readAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime()
});
export type Notification = z.infer<typeof NotificationSchema>;

// AI Draft validation schema per PRD §15 and GUIDE §15
export const AIDraftOutputSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required').max(200),
  body: z.string().trim().min(1, 'Body is required')
}).superRefine((data, ctx) => {
  const words = countWords(data.body);
  if (words > MAX_DRAFT_WORDS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Follow-up body exceeds maximum ${MAX_DRAFT_WORDS} words (got ${words} words)`,
      path: ['body']
    });
  }

  if (PLACEHOLDER_TOKEN_REGEX.test(data.body) || PLACEHOLDER_TOKEN_REGEX.test(data.subject)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Draft contains placeholder tokens like [Name] or [Company]',
      path: ['body']
    });
  }
});
export type AIDraftOutput = z.infer<typeof AIDraftOutputSchema>;

export class ValidationConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationConfigError';
    Object.setPrototypeOf(this, ValidationConfigError.prototype);
  }
}
