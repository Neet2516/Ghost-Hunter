import { Worker } from '@temporalio/worker';
import { GHOST_HUNTER_TASK_QUEUE } from '@ghost-hunter/shared';
import * as activities from './activities/index.js';

export async function run(): Promise<void> {
  const worker = await Worker.create({
    workflowsPath: new URL('./workflows/index.js', import.meta.url).pathname,
    activities,
    taskQueue: process.env.TASK_QUEUE || GHOST_HUNTER_TASK_QUEUE,
  });

  console.log(`Ghost-Hunter worker started on task queue: ${process.env.TASK_QUEUE || GHOST_HUNTER_TASK_QUEUE}`);
  await worker.run();
}

if (process.env.NODE_ENV !== 'test') {
  run().catch((err) => {
    console.error('Worker failed to run', err);
    process.exit(1);
  });
}
