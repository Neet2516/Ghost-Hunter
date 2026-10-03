import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseRepository } from '../db/crud.js';
import { EventBus, globalEventBus } from '../events/bus.js';

const ListNotificationsQuerySchema = z.object({
  unreadOnly: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

const MarkReadBodySchema = z.object({
  notificationIds: z.array(z.string().uuid()).optional(),
  all: z.boolean().optional(),
});

export function registerNotificationRoutes(
  repo: DatabaseRepository,
  eventBus: EventBus = globalEventBus
): FastifyPluginAsync {
  return async function (app: FastifyInstance) {
    // 1. List Notifications
    app.get('/', async (request, reply) => {
      const query = ListNotificationsQuerySchema.parse(request.query);
      const notifications = await repo.listNotifications({
        unreadOnly: query.unreadOnly,
      });
      return reply.status(200).send(notifications);
    });

    // 2. Mark Notifications as Read (POST /read and PATCH /read)
    const handleMarkRead = async (request: any, reply: any) => {
      const body = MarkReadBodySchema.parse(request.body || {});
      const count = await repo.markNotificationsAsRead(
        body.notificationIds,
        body.all
      );

      eventBus.broadcast({
        type: 'NOTIFICATIONS_READ',
        data: {
          notificationIds: body.notificationIds,
          all: body.all,
          count,
        },
      });

      return reply.status(200).send({
        success: true,
        count,
      });
    };

    app.post('/read', handleMarkRead);
    app.patch('/read', handleMarkRead);
  };
}
