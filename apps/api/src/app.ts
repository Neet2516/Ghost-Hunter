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

  // System & Model Status
  app.get('/api/system/model-status', async () => {
    const ollamaUrl = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
    const targetModel = process.env.OLLAMA_MODEL || 'gemma3:4b';
    const start = Date.now();
    try {
      const res = await fetch(`${ollamaUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      const latencyMs = Date.now() - start;
      if (!res.ok) {
        return {
          status: 'offline' as const,
          model: targetModel,
          baseUrl: ollamaUrl,
          latencyMs,
          error: `Ollama returned HTTP ${res.status}`,
        };
      }
      const data = (await res.json()) as { models?: Array<{ name?: string }> };
      const installedModels = data.models?.map((m) => m.name || '') || [];
      const hasModel = installedModels.some(
        (name) => name.toLowerCase().includes('gemma') || name.toLowerCase() === targetModel.toLowerCase()
      );
      return {
        status: hasModel ? ('ok' as const) : ('degraded' as const),
        model: targetModel,
        baseUrl: ollamaUrl,
        latencyMs,
        installedModels,
      };
    } catch (err: any) {
      return {
        status: 'offline' as const,
        model: targetModel,
        baseUrl: ollamaUrl,
        latencyMs: null,
        error: err.message || 'Connection refused',
      };
    }
  });

  app.post('/api/system/test-generate', async () => {
    const ollamaUrl = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
    const targetModel = process.env.OLLAMA_MODEL || 'gemma3:4b';
    const start = Date.now();
    try {
      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            {
              role: 'user',
              content: 'Return JSON: {"status": "ok", "message": "Sentinel local inference test successful."}',
            },
          ],
          stream: false,
          options: { temperature: 0.1 },
        }),
        signal: AbortSignal.timeout(10000),
      });
      const latencyMs = Date.now() - start;
      if (!res.ok) {
        return {
          success: false,
          source: 'template',
          latencyMs,
          message: 'Local Ollama returned an error. Deterministic fallback templates are active.',
        };
      }
      const data = (await res.json()) as any;
      return {
        success: true,
        source: 'gemma',
        latencyMs,
        response: data.message?.content || 'Model responded successfully.',
      };
    } catch (err: any) {
      return {
        success: false,
        source: 'template',
        latencyMs: Date.now() - start,
        message: 'Could not connect to Ollama. Deterministic fallback templates will be used automatically.',
      };
    }
  });

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
