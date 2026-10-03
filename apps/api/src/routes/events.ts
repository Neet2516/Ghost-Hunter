import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { EventBus, globalEventBus, ServerEvent } from '../events/bus.js';

export function registerEventRoutes(eventBus: EventBus = globalEventBus): FastifyPluginAsync {
  return async function (app: FastifyInstance) {
    const handleSse = (request: any, reply: any) => {
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
      reply.raw.setHeader('Connection', 'keep-alive');
      reply.raw.setHeader('X-Accel-Buffering', 'no');
      reply.raw.setHeader('Access-Control-Allow-Origin', '*');

      // Send initial connection event
      reply.raw.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', at: new Date().toISOString() })}\n\n`);

      if (request.query?.test === 'true') {
        reply.raw.end();
        return;
      }

      // Heartbeat ping every 15s to keep connection alive
      const pingInterval = setInterval(() => {
        if (!reply.raw.destroyed) {
          reply.raw.write(': ping\n\n');
        }
      }, 15000);

      const onServerEvent = (event: ServerEvent) => {
        if (!reply.raw.destroyed) {
          reply.raw.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
        }
      };

      eventBus.on('event', onServerEvent);

      request.raw.on('close', () => {
        clearInterval(pingInterval);
        eventBus.off('event', onServerEvent);
      });
    };

    app.get('/', handleSse);
    app.get('/stream', handleSse);
  };
}
