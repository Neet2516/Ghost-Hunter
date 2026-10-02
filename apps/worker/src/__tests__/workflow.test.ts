import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { GHOST_HUNTER_TASK_QUEUE, ApplicationStatus, SubStatus } from '@ghost-hunter/shared';
import { getStateQuery } from '../workflows/ghostHunterWorkflow.js';

describe('GhostHunterWorkflow v1 (TASK-010)', () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createTimeSkipping();
  }, 30000);

  afterAll(async () => {
    if (testEnv) {
      await testEnv.teardown();
    }
  });

  it('Scenario 1 & 2: initializes HUNTING, queries state, time-skips through durable cadence, and finalizes COMPLETED', async () => {
    const statusUpdates: Array<{ status: ApplicationStatus; subStatus?: SubStatus | null; nextActionAt?: string | null }> = [];
    const recordedEvents: Array<{ type: string; payload: Record<string, unknown> }> = [];

    const mockActivities = {
      async updateApplicationStatus(input: {
        applicationId: string;
        status: ApplicationStatus;
        subStatus?: SubStatus | null;
        nextActionAt?: string | null;
      }) {
        statusUpdates.push({
          status: input.status,
          subStatus: input.subStatus,
          nextActionAt: input.nextActionAt,
        });
      },

      async persistEvent(input: {
        applicationId: string;
        type: string;
        payload: Record<string, unknown>;
      }) {
        recordedEvents.push({
          type: input.type,
          payload: input.payload,
        });
        return { id: 'evt-' + recordedEvents.length };
      },

      async notifyUser() {
        return { id: 'notif-1' };
      },
    };

    const worker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: GHOST_HUNTER_TASK_QUEUE,
      workflowsPath: new URL('../workflows/index.ts', import.meta.url).pathname,
      activities: mockActivities,
    });

    await worker.runUntil(async () => {
      // 2 stages with 5000ms delay each (tested with time-skipping)
      const handle = await testEnv.client.workflow.start('ghostHunterWorkflow', {
        taskQueue: GHOST_HUNTER_TASK_QUEUE,
        workflowId: 'gh-app-task010-test',
        args: [
          {
            applicationId: 'app-task010-test',
            company: 'Stripe',
            role: 'Staff Infrastructure Engineer',
            cadenceSchedule: [5000, 5000],
            maxFollowUps: 2,
            outreachContext: 'Sent outreach message via LinkedIn to tech lead',
          },
        ],
      });

      // Initial query before time passes
      const initialState = await handle.query(getStateQuery);
      expect(initialState.workflowId).toBe('gh-app-task010-test');
      expect(initialState.status).toBe('HUNTING');
      expect(initialState.stage).toBe(1);

      // Await complete result with time-skipping
      const result = await handle.result();
      expect(result).toBe('COMPLETED');

      // Final query verification
      const finalState = await handle.query(getStateQuery);
      expect(finalState.status).toBe('COMPLETED');
      expect(finalState.stage).toBe(2);
    });

    // Verify activity updates were called in sequence
    expect(statusUpdates.length).toBeGreaterThanOrEqual(4);
    expect(statusUpdates[0].status).toBe('HUNTING');
    expect(statusUpdates[statusUpdates.length - 1].status).toBe('COMPLETED');

    // Verify events were persisted in sequence
    const eventTypes = recordedEvents.map((e) => e.type);
    expect(eventTypes).toContain('WORKFLOW_STARTED');
    expect(eventTypes).toContain('STAGE_WAIT_STARTED');
    expect(eventTypes).toContain('STAGE_TIMER_FIRED');
    expect(eventTypes).toContain('WORKFLOW_COMPLETED');
  });
});
