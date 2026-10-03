import { z } from 'zod';
import { ApplicationStatus, SubStatus, FollowUpDecisionAction } from './enums';

// Standard API Error format: { error: { code, message, fields? } }
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.array(z.string())).optional()
  })
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Draft decision request payload
export const DraftDecisionRequestSchema = z.object({
  action: FollowUpDecisionAction,
  editedBody: z.string().trim().min(1).optional()
});
export type DraftDecisionRequest = z.infer<typeof DraftDecisionRequestSchema>;

// Workflow State (via Query + DB merge)
export const WorkflowStateResponseSchema = z.object({
  workflowId: z.string(),
  status: ApplicationStatus,
  subStatus: SubStatus.nullable().optional(),
  stage: z.number().int().min(1),
  nextActionAt: z.string().datetime().nullable().optional(),
  draftId: z.string().uuid().nullable().optional(),
  repliedAt: z.string().datetime().nullable().optional()
});
export type WorkflowStateResponse = z.infer<typeof WorkflowStateResponseSchema>;

// Model Health Response
export const ModelHealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'offline']),
  reachable: z.boolean(),
  modelInstalled: z.boolean(),
  modelName: z.string(),
  latencyMs: z.number().nullable().optional(),
  message: z.string().optional()
});
export type ModelHealthResponse = z.infer<typeof ModelHealthResponseSchema>;

// Notifications read request
export const MarkNotificationsReadRequestSchema = z.object({
  notificationIds: z.array(z.string().uuid()).optional(),
  all: z.boolean().optional()
});
export type MarkNotificationsReadRequest = z.infer<typeof MarkNotificationsReadRequestSchema>;
