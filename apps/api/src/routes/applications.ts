import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  CreateApplicationSchema,
  UpdateApplicationSchema,
  ApplicationStatus,
} from '@ghost-hunter/shared';
import { DatabaseRepository } from '../db/index.js';

const ApplicationIdParamSchema = z.object({
  id: z.string().uuid('Application ID must be a valid UUID'),
});

const ListApplicationsQuerySchema = z.object({
  status: ApplicationStatus.optional(),
});

export function registerApplicationRoutes(repo: DatabaseRepository): FastifyPluginAsync {
  return async function (app: FastifyInstance) {
    // 1. Create Application
    app.post('/', async (request, reply) => {
      const validatedBody = CreateApplicationSchema.parse(request.body);
      const application = await repo.createApplication(validatedBody);
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
  };
}
