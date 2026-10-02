import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { GHOST_HUNTER_TASK_QUEUE } from '@ghost-hunter/shared';
import { errorHandler } from './middleware/errors.js';
import { DatabaseRepository, getDatabase } from './db/index.js';
import { registerApplicationRoutes } from './routes/applications.js';

export interface AppOptions {
  repo?: DatabaseRepository;
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

  // Database Repository
  const repo = options.repo || new DatabaseRepository(getDatabase().db);

  // Health checks
  const healthHandler = async () => ({
    status: 'ok',
    taskQueue: GHOST_HUNTER_TASK_QUEUE,
    timestamp: new Date().toISOString(),
  });

  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // Application CRUD routes
  await app.register(registerApplicationRoutes(repo), { prefix: '/api/applications' });

  return app;
}
