import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import {
  GHOST_HUNTER_TASK_QUEUE,
  ApplicationStatus,
  SubStatus,
  FollowUpStatus,
} from '@ghost-hunter/shared';
import {
  getStateQuery,
  recruiterRepliedSignal,
  cancelHuntSignal,
  draftDecisionSignal,
} from '../workflows/ghostHunterWorkflow.js';

describe('GhostHunterWorkflow (TASK-010, TASK-011 & TASK-014)', () => {
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
    statusUpdates: Array<{
      status: ApplicationStatus;
      subStatus?: SubStatus | null;
      nextActionAt?: string | null;
    }>,
    recordedEvents: Array<{ type: string; payload: Record<string, unknown> }>,
    followUpStatuses: Array<{ followUpId: string; status: FollowUpStatus; editedBody?: string | null }> = []
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

    async generateFollowUpDraft(input: {
      applicationId: string;
      stage: number;
      company: string;
      role: string;
      recruiterName: string;
      outreachContext: string;
    }) {
      return {
        draftId: `draft-stage-${input.stage}`,
        stage: input.stage,
        subject: `Following up on ${input.role} at ${input.company}`,
        body: `Hi ${input.recruiterName}, following up on my application.`,
        source: 'gemma' as const,
        isDegraded: false,
      };
    },

    async updateFollowUp(input: {
      followUpId: string;
      status: FollowUpStatus;
      editedBody?: string | null;
    }) {
      followUpStatuses.push(input);
    },
  });

  it('Scenario 1 & 2: initializes HUNTING, time-skips cadence and auto-skips on review timeout to COMPLETED', async () => {
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
            reviewTimeoutMs: 1000,
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
    });

    expect(statusUpdates.length).toBeGreaterThan(0);
    expect(statusUpdates[statusUpdates.length - 1].status).toBe('COMPLETED');

    const completedEvent = recordedEvents.find((e) => e.type === 'WORKFLOW_COMPLETED');
    expect(completedEvent).toBeDefined();
    expect(completedEvent?.payload.totalStages).toBe(2);

    const autoSkippedEvents = recordedEvents.filter(
      (e) => e.type === 'DRAFT_SKIPPED' && e.payload.reason === 'review_timeout'
    );
    expect(autoSkippedEvents.length).toBe(2);
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
      const handle = await testEnv.client.workflow.start('ghostHunterWorkflow', {
        taskQueue: GHOST_HUNTER_TASK_QUEUE,
        workflowId: 'gh-app-test-reply',
        args: [
          {
            applicationId: 'app-test-reply',
            company: 'Figma',
            role: 'Product Designer',
            cadenceSchedule: [100000],
            maxFollowUps: 3,
          },
        ],
      });

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

  // -------------------------------------------------------------------------
  // TASK-014: Human Review Gate & Draft Decision Flow
  // -------------------------------------------------------------------------
  describe('TASK-014: Draft Decision Flow', () => {
    it('approves draft with editedBody, marks SENT, and proceeds to next stage', async () => {
      const statusUpdates: Array<{ status: ApplicationStatus; subStatus?: SubStatus | null; nextActionAt?: string | null }> = [];
      const recordedEvents: Array<{ type: string; payload: Record<string, unknown> }> = [];
      const followUpStatuses: Array<{ followUpId: string; status: FollowUpStatus; editedBody?: string | null }> = [];

      const worker = await Worker.create({
        connection: testEnv.nativeConnection,
        taskQueue: GHOST_HUNTER_TASK_QUEUE,
        workflowsPath: new URL('../workflows/index.ts', import.meta.url).pathname,
        activities: createMockActivities(statusUpdates, recordedEvents, followUpStatuses),
      });

      await worker.runUntil(async () => {
        const handle = await testEnv.client.workflow.start('ghostHunterWorkflow', {
          taskQueue: GHOST_HUNTER_TASK_QUEUE,
          workflowId: 'gh-app-test-approve',
          args: [
            {
              applicationId: 'app-test-approve',
              company: 'Apple',
              role: 'iOS Engineer',
              cadenceSchedule: [0],
              maxFollowUps: 1,
              reviewTimeoutMs: 100000,
            },
          ],
        });

        // Send approve signal
        await handle.signal(draftDecisionSignal, {
          action: 'approve',
          editedBody: 'Hi Hiring Team, I wanted to follow up with an updated portfolio link.',
        });

        const result = await handle.result();
        expect(result).toBe('COMPLETED');
      });

      const approvedEvent = recordedEvents.find((e) => e.type === 'DRAFT_APPROVED');
      expect(approvedEvent).toBeDefined();
      expect(approvedEvent?.payload.edited).toBe(true);

      const sentFollowUp = followUpStatuses.find((f) => f.status === 'SENT');
      expect(sentFollowUp).toBeDefined();
      expect(sentFollowUp?.editedBody).toContain('updated portfolio link');
    });

    it('skips draft, marks SKIPPED, and advances workflow', async () => {
      const statusUpdates: Array<{ status: ApplicationStatus; subStatus?: SubStatus | null; nextActionAt?: string | null }> = [];
      const recordedEvents: Array<{ type: string; payload: Record<string, unknown> }> = [];
      const followUpStatuses: Array<{ followUpId: string; status: FollowUpStatus; editedBody?: string | null }> = [];

      const worker = await Worker.create({
        connection: testEnv.nativeConnection,
        taskQueue: GHOST_HUNTER_TASK_QUEUE,
        workflowsPath: new URL('../workflows/index.ts', import.meta.url).pathname,
        activities: createMockActivities(statusUpdates, recordedEvents, followUpStatuses),
      });

      await worker.runUntil(async () => {
        const handle = await testEnv.client.workflow.start('ghostHunterWorkflow', {
          taskQueue: GHOST_HUNTER_TASK_QUEUE,
          workflowId: 'gh-app-test-skip',
          args: [
            {
              applicationId: 'app-test-skip',
              company: 'Airbnb',
              role: 'Backend Engineer',
              cadenceSchedule: [0],
              maxFollowUps: 1,
              reviewTimeoutMs: 100000,
            },
          ],
        });

        await handle.signal(draftDecisionSignal, {
          action: 'skip',
        });

        const result = await handle.result();
        expect(result).toBe('COMPLETED');
      });

      const skippedEvent = recordedEvents.find((e) => e.type === 'DRAFT_SKIPPED');
      expect(skippedEvent).toBeDefined();
      expect(skippedEvent?.payload.reason).toBe('user_skipped');

      const skippedFollowUp = followUpStatuses.find((f) => f.status === 'SKIPPED');
      expect(skippedFollowUp).toBeDefined();
    });

    it('snoozes draft, pauses for snooze duration, and then auto-skips on timeout', async () => {
      const statusUpdates: Array<{ status: ApplicationStatus; subStatus?: SubStatus | null; nextActionAt?: string | null }> = [];
      const recordedEvents: Array<{ type: string; payload: Record<string, unknown> }> = [];
      const followUpStatuses: Array<{ followUpId: string; status: FollowUpStatus; editedBody?: string | null }> = [];

      const worker = await Worker.create({
        connection: testEnv.nativeConnection,
        taskQueue: GHOST_HUNTER_TASK_QUEUE,
        workflowsPath: new URL('../workflows/index.ts', import.meta.url).pathname,
        activities: createMockActivities(statusUpdates, recordedEvents, followUpStatuses),
      });

      await worker.runUntil(async () => {
        const handle = await testEnv.client.workflow.start('ghostHunterWorkflow', {
          taskQueue: GHOST_HUNTER_TASK_QUEUE,
          workflowId: 'gh-app-test-snooze',
          args: [
            {
              applicationId: 'app-test-snooze',
              company: 'Netflix',
              role: 'Senior Core Systems Engineer',
              cadenceSchedule: [0],
              maxFollowUps: 1,
              reviewTimeoutMs: 1000,
            },
          ],
        });

        // Wait until draft is ready and awaiting review
        let state = await handle.query(getStateQuery);
        while (state.subStatus !== 'AWAITING_REVIEW') {
          await new Promise((r) => setTimeout(r, 20));
          state = await handle.query(getStateQuery);
        }

        // Snooze for 2000ms
        await handle.signal(draftDecisionSignal, {
          action: 'snooze',
          snoozeDurationMs: 2000,
        });

        const result = await handle.result();
        expect(result).toBe('COMPLETED');
      });

      const snoozedFollowUp = followUpStatuses.find((f) => f.status === 'SNOOZED');
      expect(snoozedFollowUp).toBeDefined();

      const snoozeEvent = recordedEvents.find((e) => e.type === 'RETRY' && e.payload.action === 'snooze');
      expect(snoozeEvent).toBeDefined();
    });

    it('discards draft with DISCARDED_REPLY if recruiter replies while awaiting review', async () => {
      const statusUpdates: Array<{ status: ApplicationStatus; subStatus?: SubStatus | null; nextActionAt?: string | null }> = [];
      const recordedEvents: Array<{ type: string; payload: Record<string, unknown> }> = [];
      const followUpStatuses: Array<{ followUpId: string; status: FollowUpStatus; editedBody?: string | null }> = [];

      const worker = await Worker.create({
        connection: testEnv.nativeConnection,
        taskQueue: GHOST_HUNTER_TASK_QUEUE,
        workflowsPath: new URL('../workflows/index.ts', import.meta.url).pathname,
        activities: createMockActivities(statusUpdates, recordedEvents, followUpStatuses),
      });

      await worker.runUntil(async () => {
        const handle = await testEnv.client.workflow.start('ghostHunterWorkflow', {
          taskQueue: GHOST_HUNTER_TASK_QUEUE,
          workflowId: 'gh-app-test-review-reply',
          args: [
            {
              applicationId: 'app-test-review-reply',
              company: 'Google',
              role: 'Staff Site Reliability Engineer',
              cadenceSchedule: [0],
              maxFollowUps: 1,
              reviewTimeoutMs: 100000,
            },
          ],
        });

        // Wait until draft is ready and awaiting review
        let state = await handle.query(getStateQuery);
        while (state.subStatus !== 'AWAITING_REVIEW') {
          await new Promise((r) => setTimeout(r, 20));
          state = await handle.query(getStateQuery);
        }

        // Signal recruiter reply during review
        await handle.signal(recruiterRepliedSignal, {
          note: 'Recruiter replied before candidate sent draft',
        });

        const result = await handle.result();
        expect(result).toBe('REPLIED');
      });

      const discardedFollowUp = followUpStatuses.find((f) => f.status === 'DISCARDED_REPLY');
      expect(discardedFollowUp).toBeDefined();

      const replyEvent = recordedEvents.find((e) => e.type === 'RECRUITER_REPLIED');
      expect(replyEvent).toBeDefined();
      expect(replyEvent?.payload.draftDiscarded).toBe(true);
    });
  });
});
