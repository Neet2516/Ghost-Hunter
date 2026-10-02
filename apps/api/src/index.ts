import Fastify from 'fastify';
import cors from '@fastify/cors';
import { GHOST_HUNTER_TASK_QUEUE } from '@ghost-hunter/shared';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.WEB_ORIGIN || 'http://localhost:3000'
});

app.get('/health', async () => {
  return { status: 'ok', taskQueue: GHOST_HUNTER_TASK_QUEUE };
});

const port = Number(process.env.API_PORT) || 3001;

if (process.env.NODE_ENV !== 'test') {
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Ghost-Hunter API listening on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

export default app;
