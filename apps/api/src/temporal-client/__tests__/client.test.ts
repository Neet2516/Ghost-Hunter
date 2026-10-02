import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { GHOST_HUNTER_TASK_QUEUE } from '@ghost-hunter/shared';
import {
  getWorkflowId,
  startGhostHunterWorkflow,
  queryWorkflowState,
  signalCancelHunt,
  signalRecruiterReplied,
  WorkflowConflictError,
  TemporalServiceError,
} from '../index.js';

describe('API Temporal Client (TASK-009)', () => {
  let testEnv: TestWorkflowEnvironment;
  let worker: Worker;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createTimeSkipping();
    worker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: GHOST_HUNTER_TASK_QUEUE,
      workflowsPath: new URL('../../../../worker/src/workflows/index.ts', import.meta.url).pathname,
      activities: {
        async checkModelHealth() {
          return { status: 'healthy' };
        },
      },
    });
  }, 30000);

  afterAll(async () => {
    if (worker && worker.getState() === 'RUNNING') {
      worker.shutdown();
    }
    if (testEnv) {
      await testEnv.teardown();
    }
  });

  it('correctly formats workflow ID with gh- prefix', () => {
    expect(getWorkflowId('app-999')).toBe('gh-app-999');
  });

  it('starts a workflow execution and queries state using customClient', async () => {
    const runWorker = worker.run();

    const result = await startGhostHunterWorkflow({
      applicationId: 'app-test-start',
      company: 'Acme Corp',
      role: 'Staff Engineer',
      customClient: testEnv.client,
    });

    expect(result.workflowId).toBe('gh-app-test-start');

    // Query workflow state
    const state = await queryWorkflowState('app-test-start', testEnv.client);
    expect(state).toBeDefined();

    worker.shutdown();
    await runWorker;
  });

  it('throws WorkflowConflictError when workflow is already started', async () => {
    // Re-create a fresh worker for next test block
    const testWorker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: GHOST_HUNTER_TASK_QUEUE,
      workflowsPath: new URL('../../../../worker/src/workflows/index.ts', import.meta.url).pathname,
      activities: {},
    });

    const runWorker = testWorker.run();

    await startGhostHunterWorkflow({
      applicationId: 'app-duplicate',
      company: 'Acme Corp',
      role: 'Engineer',
      customClient: testEnv.client,
    });

    await expect(
      startGhostHunterWorkflow({
        applicationId: 'app-duplicate',
        company: 'Acme Corp',
        role: 'Engineer',
        customClient: testEnv.client,
      })
    ).rejects.toThrow(WorkflowConflictError);

    testWorker.shutdown();
    await runWorker;
  });
});
