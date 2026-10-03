import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { GHOST_HUNTER_TASK_QUEUE } from '@ghost-hunter/shared';
import { Client } from '@temporalio/client';
import { errorHandler } from './middleware/errors.js';
import { DatabaseRepository, getDatabase } from './db/index.js';
import { registerApplicationRoutes } from './routes/applications.js';
import { registerNotificationRoutes } from './routes/notifications.js';
import { registerEventRoutes } from './routes/events.js';
import { EventBus, globalEventBus } from './events/bus.js';

export interface AppOptions {
  repo?: DatabaseRepository;
  temporalClient?: Client;
  eventBus?: EventBus;
  logger?: boolean;
}

export async function buildApp(options: AppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? false,
  });

  // Global Error Handler
  app.setErrorHandler(errorHandler);

  // CORS
  await app.register(cors, {
    origin: process.env.WEB_ORIGIN || 'http://localhost:3000',
  });

  // Database Repository & EventBus
  const repo = options.repo || new DatabaseRepository(getDatabase().db);
  const eventBus = options.eventBus || globalEventBus;

  // Health checks
  const healthHandler = async () => ({
    status: 'ok',
    taskQueue: GHOST_HUNTER_TASK_QUEUE,
    timestamp: new Date().toISOString(),
  });

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Application CRUD & Workflow routes
  await app.register(registerApplicationRoutes(repo, options.temporalClient, eventBus), {
    prefix: '/api/applications',
  });

  // Notifications routes
  await app.register(registerNotificationRoutes(repo, eventBus), {
    prefix: '/api/notifications',
  });

  // Server-Sent Events (SSE) routes
  await app.register(registerEventRoutes(eventBus), {
    prefix: '/api/events',
  });

  return app;
}
