import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { GHOST_HUNTER_TASK_QUEUE } from '@ghost-hunter/shared';
import * as activities from '../activities/index.js';

describe('Temporal Worker & Environment (TASK-009)', () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createTimeSkipping();
  }, 30000);

  afterAll(async () => {
    if (testEnv) {
      await testEnv.teardown();
    }
  });

  it('successfully boots worker, connects to test server, and executes a workflow run', async () => {
    const worker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: GHOST_HUNTER_TASK_QUEUE,
      workflowsPath: new URL('../workflows/index.ts', import.meta.url).pathname,
      activities,
    });

    await worker.runUntil(async () => {
      const handle = await testEnv.client.workflow.start('ghostHunterWorkflow', {
        taskQueue: GHOST_HUNTER_TASK_QUEUE,
        workflowId: 'test-wf-009',
      });
      await handle.result();
    });
  });
});
