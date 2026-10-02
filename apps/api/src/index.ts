import { buildApp } from './app.js';
import { runMigrations } from './db/index.js';

const port = Number(process.env.API_PORT) || 3001;

async function start() {
  try {
    // Run DB migrations before starting server
    runMigrations();

    const app = await buildApp({ logger: true });

    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Ghost-Hunter API server listening on http://localhost:${port}`);
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { buildApp };
