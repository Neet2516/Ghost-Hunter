import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { GHOST_HUNTER_TASK_QUEUE, ApplicationStatus, SubStatus } from '@ghost-hunter/shared';
import {
  getStateQuery,
  recruiterRepliedSignal,
  cancelHuntSignal,
} from '../workflows/ghostHunterWorkflow.js';

describe('GhostHunterWorkflow (TASK-010 & TASK-011)', () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createTimeSkipping();
  }, 30000);

  afterAll(async () => {
    if (testEnv) {
      await testEnv.teardown();
    }
  });

  const createMockActivities = (
    statusUpdates: Array<{ status: ApplicationStatus; subStatus?: SubStatus | null; nextActionAt?: string | null }>,
    recordedEvents: Array<{ type: string; payload: Record<string, unknown> }>
  ) => ({
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
  });

  it('Scenario 1 & 2: initializes HUNTING, queries state, time-skips through durable cadence, and finalizes COMPLETED', async () => {
    const statusUpdates: Array<{ status: ApplicationStatus; subStatus?: SubStatus | null; nextActionAt?: string | null }> = [];
    const recordedEvents: Array<{ type: string; payload: Record<string, unknown> }> = [];

    const worker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: GHOST_HUNTER_TASK_QUEUE,
      workflowsPath: new URL('../workflows/index.ts', import.meta.url).pathname,
      activities: createMockActivities(statusUpdates, recordedEvents),
    });

    await worker.runUntil(async () => {
      const handle = await testEnv.client.workflow.start('ghostHunterWorkflow', {
        taskQueue: GHOST_HUNTER_TASK_QUEUE,
        workflowId: 'gh-app-test-scen-1-2',
        args: [
          {
            applicationId: 'app-test-scen-1-2',
            company: 'Stripe',
            role: 'Staff Infrastructure Engineer',
            cadenceSchedule: [5000, 5000],
            maxFollowUps: 2,
            outreachContext: 'Sent outreach message via LinkedIn to tech lead',
          },
        ],
      });

      const initialState = await handle.query(getStateQuery);
      expect(initialState.workflowId).toBe('gh-app-test-scen-1-2');
      expect(initialState.status).toBe('HUNTING');
      expect(initialState.stage).toBe(1);

      const result = await handle.result();
      expect(result).toBe('COMPLETED');

      const finalState = await handle.query(getStateQuery);
      expect(finalState.status).toBe('COMPLETED');
      expect(finalState.stage).toBe(2);
    });

    expect(statusUpdates[0].status).toBe('HUNTING');
    expect(statusUpdates[statusUpdates.length - 1].status).toBe('COMPLETED');

    const eventTypes = recordedEvents.map((e) => e.type);
    expect(eventTypes).toContain('WORKFLOW_STARTED');
    expect(eventTypes).toContain('STAGE_WAIT_STARTED');
    expect(eventTypes).toContain('STAGE_TIMER_FIRED');
    expect(eventTypes).toContain('WORKFLOW_COMPLETED');
  });

  it('Scenario 3: recruiterReplied signal interrupts wait loop and finalizes REPLIED immediately', async () => {
    const statusUpdates: Array<{ status: ApplicationStatus; subStatus?: SubStatus | null; nextActionAt?: string | null }> = [];
    const recordedEvents: Array<{ type: string; payload: Record<string, unknown> }> = [];

    const worker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: GHOST_HUNTER_TASK_QUEUE,
      workflowsPath: new URL('../workflows/index.ts', import.meta.url).pathname,
      activities: createMockActivities(statusUpdates, recordedEvents),
    });

    await worker.runUntil(async () => {
      // 100 seconds wait
      const handle = await testEnv.client.workflow.start('ghostHunterWorkflow', {
        taskQueue: GHOST_HUNTER_TASK_QUEUE,
        workflowId: 'gh-app-test-reply',
        args: [
          {
            applicationId: 'app-test-reply',
            company: 'Linear',
            role: 'Senior Product Engineer',
            cadenceSchedule: [100000],
            maxFollowUps: 1,
          },
        ],
      });

      // Send recruiterReplied signal while workflow is waiting
      await handle.signal(recruiterRepliedSignal, {
        note: 'Recruiter reached out on LinkedIn offering interview slot',
      });

      const result = await handle.result();
      expect(result).toBe('REPLIED');

      const finalState = await handle.query(getStateQuery);
      expect(finalState.status).toBe('REPLIED');
      expect(finalState.repliedAt).toBeDefined();
    });

    expect(statusUpdates[statusUpdates.length - 1].status).toBe('REPLIED');
    const replyEvent = recordedEvents.find((e) => e.type === 'RECRUITER_REPLIED');
    expect(replyEvent).toBeDefined();
    expect(replyEvent?.payload.note).toBe('Recruiter reached out on LinkedIn offering interview slot');
  });

  it('Scenario 4: cancelHunt signal interrupts wait loop and finalizes CANCELLED immediately', async () => {
    const statusUpdates: Array<{ status: ApplicationStatus; subStatus?: SubStatus | null; nextActionAt?: string | null }> = [];
    const recordedEvents: Array<{ type: string; payload: Record<string, unknown> }> = [];

    const worker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: GHOST_HUNTER_TASK_QUEUE,
      workflowsPath: new URL('../workflows/index.ts', import.meta.url).pathname,
      activities: createMockActivities(statusUpdates, recordedEvents),
    });

    await worker.runUntil(async () => {
      const handle = await testEnv.client.workflow.start('ghostHunterWorkflow', {
        taskQueue: GHOST_HUNTER_TASK_QUEUE,
        workflowId: 'gh-app-test-cancel',
        args: [
          {
            applicationId: 'app-test-cancel',
            company: 'Vercel',
            role: 'Platform Engineer',
            cadenceSchedule: [100000],
            maxFollowUps: 1,
          },
        ],
      });

      // Signal cancellation
      await handle.signal(cancelHuntSignal, {
        reason: 'Accepted offer from another company',
      });

      const result = await handle.result();
      expect(result).toBe('CANCELLED');

      const finalState = await handle.query(getStateQuery);
      expect(finalState.status).toBe('CANCELLED');
    });

    expect(statusUpdates[statusUpdates.length - 1].status).toBe('CANCELLED');
    const cancelEvent = recordedEvents.find((e) => e.type === 'HUNT_CANCELLED');
    expect(cancelEvent).toBeDefined();
    expect(cancelEvent?.payload.reason).toBe('Accepted offer from another company');
  });

  it('Scenario 14: race guard discards draft and resolves REPLIED if reply signal sent during transition', async () => {
    const statusUpdates: Array<{ status: ApplicationStatus; subStatus?: SubStatus | null; nextActionAt?: string | null }> = [];
    const recordedEvents: Array<{ type: string; payload: Record<string, unknown> }> = [];

    const worker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: GHOST_HUNTER_TASK_QUEUE,
      workflowsPath: new URL('../workflows/index.ts', import.meta.url).pathname,
      activities: createMockActivities(statusUpdates, recordedEvents),
    });

    await worker.runUntil(async () => {
      // 0ms delay immediately enters generation
      const handle = await testEnv.client.workflow.start('ghostHunterWorkflow', {
        taskQueue: GHOST_HUNTER_TASK_QUEUE,
        workflowId: 'gh-app-test-race-guard',
        args: [
          {
            applicationId: 'app-test-race-guard',
            company: 'GitHub',
            role: 'Staff Systems Engineer',
            cadenceSchedule: [0],
            maxFollowUps: 1,
          },
        ],
      });

      // Signal recruiterReplied immediately
      await handle.signal(recruiterRepliedSignal, {
        note: 'Replied at instant timer elapsed',
      });

      const result = await handle.result();
      expect(result).toBe('REPLIED');

      const finalState = await handle.query(getStateQuery);
      expect(finalState.status).toBe('REPLIED');
    });

    expect(statusUpdates[statusUpdates.length - 1].status).toBe('REPLIED');
    const replyEvent = recordedEvents.find((e) => e.type === 'RECRUITER_REPLIED');
    expect(replyEvent).toBeDefined();
  });
});
