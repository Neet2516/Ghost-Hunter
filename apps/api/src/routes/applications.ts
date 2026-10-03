import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { Client } from '@temporalio/client';
import {
  CreateApplicationSchema,
  UpdateApplicationSchema,
  ApplicationStatus,
} from '@ghost-hunter/shared';
import { DatabaseRepository } from '../db/index.js';
import {
  startGhostHunterWorkflow,
  signalRecruiterReplied,
  signalCancelHunt,
  signalDraftDecision,
  queryWorkflowState,
  WorkflowConflictError,
} from '../temporal-client/index.js';
import { EventBus, globalEventBus } from '../events/bus.js';

const ApplicationIdParamSchema = z.object({
  id: z.string().uuid('Application ID must be a valid UUID'),
});

const ListApplicationsQuerySchema = z.object({
  status: ApplicationStatus.optional(),
});

const StartHuntBodySchema = z.object({
  cadenceSchedule: z.array(z.number().positive()).optional(),
  maxFollowUps: z.number().int().min(1).max(3).optional(),
  isDemoMode: z.boolean().optional(),
}).optional();

const RecruiterRepliedBodySchema = z.object({
  repliedAt: z.string().datetime().optional(),
  note: z.string().optional(),
}).optional();

const CancelHuntBodySchema = z.object({
  reason: z.string().optional(),
}).optional();

const DraftDecisionBodySchema = z.object({
  action: z.enum(['approve', 'skip', 'snooze']),
  editedBody: z.string().optional(),
  snoozeDurationMs: z.number().int().positive().optional(),
});

export function registerApplicationRoutes(
  repo: DatabaseRepository,
  temporalClient?: Client,
  eventBus: EventBus = globalEventBus
): FastifyPluginAsync {
  return async function (app: FastifyInstance) {
    // 1. Create Application
    app.post('/', async (request, reply) => {
      const validatedBody = CreateApplicationSchema.parse(request.body);
      const application = await repo.createApplication(validatedBody);
      eventBus.broadcast({ type: 'APPLICATION_CREATED', data: application });
      return reply.status(201).send(application);
    });

    // 2. List Applications
    app.get('/', async (request, reply) => {
      const query = ListApplicationsQuerySchema.parse(request.query);
      const applications = await repo.listApplications(query);
      return reply.status(200).send(applications);
    });

    // 3. Get Application by ID
    app.get('/:id', async (request, reply) => {
      const { id } = ApplicationIdParamSchema.parse(request.params);
      const application = await repo.getApplicationById(id);

      if (!application) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Application with ID ${id} not found`,
          },
        });
      }

      return reply.status(200).send(application);
    });

    // 4. Update Application
    app.patch('/:id', async (request, reply) => {
      const { id } = ApplicationIdParamSchema.parse(request.params);
      const validatedBody = UpdateApplicationSchema.parse(request.body);

      const existing = await repo.getApplicationById(id);
      if (!existing) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Application with ID ${id} not found`,
          },
        });
      }

      const updated = await repo.updateApplication(id, validatedBody);
      eventBus.broadcast({ type: 'APPLICATION_UPDATED', data: updated });
      return reply.status(200).send(updated);
    });

    // 5. Delete Application
    app.delete('/:id', async (request, reply) => {
      const { id } = ApplicationIdParamSchema.parse(request.params);

      const existing = await repo.getApplicationById(id);
      if (!existing) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Application with ID ${id} not found`,
          },
        });
      }

      await repo.deleteApplication(id);
      eventBus.broadcast({ type: 'APPLICATION_DELETED', data: { id } });
      return reply.status(200).send({ success: true, id });
    });

    // 6. Get Application Events
    app.get('/:id/events', async (request, reply) => {
      const { id } = ApplicationIdParamSchema.parse(request.params);

      const existing = await repo.getApplicationById(id);
      if (!existing) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Application with ID ${id} not found`,
          },
        });
      }

      const events = await repo.getEventsByApplicationId(id);
      return reply.status(200).send(events);
    });

    // 7. Get Application FollowUps
    app.get('/:id/followups', async (request, reply) => {
      const { id } = ApplicationIdParamSchema.parse(request.params);

      const existing = await repo.getApplicationById(id);
      if (!existing) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Application with ID ${id} not found`,
          },
        });
      }

      const followups = await repo.getFollowUpsByApplicationId(id);
      return reply.status(200).send(followups);
    });

    // 8. Start Application Hunt Workflow (POST /:id/start)
    app.post('/:id/start', async (request, reply) => {
      const { id } = ApplicationIdParamSchema.parse(request.params);
      const body = StartHuntBodySchema.parse(request.body);

      const application = await repo.getApplicationById(id);
      if (!application) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Application with ID ${id} not found`,
          },
        });
      }

      // Check if already running in DB
      if (application.status === 'HUNTING') {
        return reply.status(409).send({
          error: {
            code: 'WORKFLOW_ALREADY_RUNNING',
            message: `Workflow for application ${id} is already running`,
          },
        });
      }

      try {
        const result = await startGhostHunterWorkflow({
          applicationId: id,
          company: application.company,
          role: application.role,
          recruiterName: application.recruiterName,
          recruiterEmail: application.recruiterContact,
          cadenceSchedule: body?.cadenceSchedule,
          maxFollowUps: body?.maxFollowUps ?? application.maxFollowUps,
          outreachContext: application.outreachContext,
          isDemoMode: body?.isDemoMode,
          customClient: temporalClient,
        });

        // Update DB application status
        await repo.updateApplication(id, {
          status: 'HUNTING',
          subStatus: 'WAITING',
          workflowId: result.workflowId,
        });

        // Persist audit event
        await repo.logEvent(id, 'HUNT_STARTED', {
          workflowId: result.workflowId,
          startedAt: new Date().toISOString(),
        });

        eventBus.broadcast({
          type: 'HUNT_STARTED',
          data: { applicationId: id, workflowId: result.workflowId },
        });

        return reply.status(200).send({
          success: true,
          workflowId: result.workflowId,
          status: 'HUNTING',
        });
      } catch (err: unknown) {
        if (err instanceof WorkflowConflictError) {
          return reply.status(409).send({
            error: {
              code: 'WORKFLOW_ALREADY_RUNNING',
              message: err.message,
            },
          });
        }
        throw err;
      }
    });

    // 9. Mark Recruiter Replied (POST /:id/reply)
    app.post('/:id/reply', async (request, reply) => {
      const { id } = ApplicationIdParamSchema.parse(request.params);
      const body = RecruiterRepliedBodySchema.parse(request.body);

      const application = await repo.getApplicationById(id);
      if (!application) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Application with ID ${id} not found`,
          },
        });
      }

      const repliedAt = body?.repliedAt || new Date().toISOString();

      // Send signal to Temporal workflow (if workflow was started)
      try {
        await signalRecruiterReplied(
          id,
          { repliedAt, note: body?.note },
          temporalClient
        );
      } catch (err: unknown) {
        // If workflow is not running, we still record reply in DB
        app.log.warn(`Signal recruiterReplied for ${id} caught non-fatal error: ${err}`);
      }

      // Update DB application status
      await repo.updateApplication(id, {
        status: 'REPLIED',
        subStatus: null,
      });

      // Persist event
      await repo.logEvent(id, 'REPLY_SIGNAL', {
        repliedAt,
        note: body?.note,
      });

      eventBus.broadcast({
        type: 'REPLY_SIGNAL',
        data: { applicationId: id, repliedAt },
      });

      return reply.status(200).send({
        success: true,
        status: 'REPLIED',
      });
    });

    // 10. Cancel Hunt (POST /:id/cancel)
    app.post('/:id/cancel', async (request, reply) => {
      const { id } = ApplicationIdParamSchema.parse(request.params);
      const body = CancelHuntBodySchema.parse(request.body);

      const application = await repo.getApplicationById(id);
      if (!application) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Application with ID ${id} not found`,
          },
        });
      }

      const reason = body?.reason || 'User cancelled hunt';

      // Send signal to Temporal workflow
      try {
        await signalCancelHunt(id, reason, temporalClient);
      } catch (err: unknown) {
        app.log.warn(`Signal cancelHunt for ${id} caught non-fatal error: ${err}`);
      }

      // Update DB application status
      await repo.updateApplication(id, {
        status: 'CANCELLED',
        subStatus: null,
      });

      // Persist event
      await repo.logEvent(id, 'CANCELLED', { reason });

      eventBus.broadcast({
        type: 'CANCELLED',
        data: { applicationId: id, reason },
      });

      return reply.status(200).send({
        success: true,
        status: 'CANCELLED',
      });
    });

    // 11. Get Workflow State (GET /:id/state)
    app.get('/:id/state', async (request, reply) => {
      const { id } = ApplicationIdParamSchema.parse(request.params);

      const application = await repo.getApplicationById(id);
      if (!application) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Application with ID ${id} not found`,
          },
        });
      }

      try {
        const state = await queryWorkflowState(id, temporalClient);
        return reply.status(200).send(state);
      } catch {
        // Fallback to DB state representation if Temporal workflow not started or unreachable
        return reply.status(200).send({
          workflowId: application.workflowId || `gh-${id}`,
          status: application.status,
          subStatus: application.subStatus,
          stage: 1,
          nextActionAt: application.nextActionAt,
          repliedAt: null,
        });
      }
    });

    // 12. Submit Draft Decision (POST /:id/decision)
    app.post('/:id/decision', async (request, reply) => {
      const { id } = ApplicationIdParamSchema.parse(request.params);
      const body = DraftDecisionBodySchema.parse(request.body);

      const application = await repo.getApplicationById(id);
      if (!application) {
        return reply.status(404).send({
          error: {
            code: 'NOT_FOUND',
            message: `Application with ID ${id} not found`,
          },
        });
      }

      await signalDraftDecision(
        id,
        {
          action: body.action,
          editedBody: body.editedBody,
          snoozeDurationMs: body.snoozeDurationMs,
        },
        temporalClient
      );

      eventBus.broadcast({
        type: 'DRAFT_DECISION',
        data: { applicationId: id, action: body.action },
      });

      return reply.status(200).send({
        success: true,
        action: body.action,
      });
    });
  };
}
