import fs from 'node:fs';
import { Worker, NativeConnection } from '@temporalio/worker';
import { GHOST_HUNTER_TASK_QUEUE } from '@ghost-hunter/shared';
import * as activities from './activities/index.js';

export async function createWorker(customConnection?: NativeConnection): Promise<Worker> {
  const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
  const taskQueue = process.env.TASK_QUEUE || GHOST_HUNTER_TASK_QUEUE;

  const connection =
    customConnection ||
    (await NativeConnection.connect({
      address,
    }));

  let workflowsPath = new URL('./workflows/index.ts', import.meta.url).pathname;
  if (!fs.existsSync(workflowsPath)) {
    workflowsPath = new URL('./workflows/index.js', import.meta.url).pathname;
  }

  const worker = await Worker.create({
    connection,
    namespace,
    workflowsPath,
    activities,
    taskQueue,
  });

  return worker;
}

export async function run(): Promise<void> {
  const taskQueue = process.env.TASK_QUEUE || GHOST_HUNTER_TASK_QUEUE;
  const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';

  console.log(`Starting Ghost-Hunter worker at ${address}, listening on queue: ${taskQueue}`);

  let worker: Worker | null = null;
  while (!worker) {
    try {
      worker = await createWorker();
    } catch (err: any) {
      console.log(`Temporal server not ready at ${address} (${err.message}), retrying in 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`Ghost-Hunter worker successfully connected to Temporal at ${address}`);

  const shutdown = () => {
    console.log('Shutting down Ghost-Hunter worker...');
    worker?.shutdown();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await worker.run();
  console.log('Ghost-Hunter worker exited cleanly');
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  run().catch((err) => {
    console.error('Worker failed to run', err);
    process.exit(1);
  });
}
