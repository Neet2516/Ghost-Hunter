import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FastifyInstance } from 'fastify';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { GHOST_HUNTER_TASK_QUEUE } from '@ghost-hunter/shared';
import * as schema from '../../db/schema.js';
import { DatabaseRepository } from '../../db/crud.js';
import { buildApp } from '../../app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Application Workflow Endpoints (TASK-012)', () => {
  let testEnv: TestWorkflowEnvironment;
  let sqlite: Database.Database;
  let app: FastifyInstance;
  let repo: DatabaseRepository;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createTimeSkipping();
  }, 30000);

  afterAll(async () => {
    if (testEnv) {
      await testEnv.teardown();
    }
  });

  beforeEach(async () => {
    sqlite = new Database(':memory:');
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    const db = drizzle(sqlite, { schema });
    repo = new DatabaseRepository(db);

    const migrationsFolder = path.resolve(__dirname, '../../../drizzle');
    migrate(db, { migrationsFolder });

    app = await buildApp({
      repo,
      temporalClient: testEnv.client,
      logger: false,
    });
  });

  afterEach(async () => {
    await app.close();
    sqlite.close();
  });

  const createTestApp = async (id?: string) => {
    return repo.createApplication({
      company: 'Datadog',
      role: 'Backend Engineer',
      recruiterName: 'Alexis Le-Quoc',
      recruiterContact: 'alexis@datadog.com',
      outreachChannel: 'email',
      outreachContext: 'Follow up on distributed tracing pipeline interview.',
      delayMs: 86400000,
      maxFollowUps: 3,
    });
  };

  it('Scenario 1 & 12: starts workflow gh-id with status HUNTING, and rejects second start with 409', async () => {
    const worker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: GHOST_HUNTER_TASK_QUEUE,
      workflowsPath: new URL('../../../../worker/src/workflows/index.ts', import.meta.url).pathname,
      activities: {
        async updateApplicationStatus() {},
        async persistEvent() {
          return { id: 'evt-1' };
        },
      },
    });

    await worker.runUntil(async () => {
      const created = await createTestApp();

      // 1. Start workflow
      const startRes = await app.inject({
        method: 'POST',
        url: `/api/applications/${created.id}/start`,
        payload: {
          cadenceSchedule: [100000],
          maxFollowUps: 2,
        },
      });

      expect(startRes.statusCode).toBe(200);
      const startJson = startRes.json();
      expect(startJson.success).toBe(true);
      expect(startJson.workflowId).toBe(`gh-${created.id}`);
      expect(startJson.status).toBe('HUNTING');

      // Verify DB application was updated
      const updated = await repo.getApplicationById(created.id);
      expect(updated?.status).toBe('HUNTING');
      expect(updated?.workflowId).toBe(`gh-${created.id}`);

      // Verify audit event was recorded
      const events = await repo.getEventsByApplicationId(created.id);
      expect(events.some((e) => e.type === 'HUNT_STARTED')).toBe(true);

      // Scenario 12: Duplicate start rejected with 409
      const dupRes = await app.inject({
        method: 'POST',
        url: `/api/applications/${created.id}/start`,
      });

      expect(dupRes.statusCode).toBe(409);
      const dupJson = dupRes.json();
      expect(dupJson.error.code).toBe('WORKFLOW_ALREADY_RUNNING');
    });
  });

  it('delivers recruiterReplied signal via POST /:id/reply and updates application', async () => {
    const worker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: GHOST_HUNTER_TASK_QUEUE,
      workflowsPath: new URL('../../../../worker/src/workflows/index.ts', import.meta.url).pathname,
      activities: {
        async updateApplicationStatus() {},
        async persistEvent() {
          return { id: 'evt-reply' };
        },
      },
    });

    await worker.runUntil(async () => {
      const created = await createTestApp();

      // Start
      await app.inject({
        method: 'POST',
        url: `/api/applications/${created.id}/start`,
        payload: { cadenceSchedule: [100000] },
      });

      // Signal Reply
      const replyRes = await app.inject({
        method: 'POST',
        url: `/api/applications/${created.id}/reply`,
        payload: { note: 'Recruiter replied on LinkedIn' },
      });

      expect(replyRes.statusCode).toBe(200);
      const replyJson = replyRes.json();
      expect(replyJson.success).toBe(true);
      expect(replyJson.status).toBe('REPLIED');

      const appInDb = await repo.getApplicationById(created.id);
      expect(appInDb?.status).toBe('REPLIED');

      const events = await repo.getEventsByApplicationId(created.id);
      expect(events.some((e) => e.type === 'REPLY_SIGNAL')).toBe(true);
    });
  });

  it('delivers cancelHunt signal via POST /:id/cancel and updates application', async () => {
    const worker = await Worker.create({
      connection: testEnv.nativeConnection,
      taskQueue: GHOST_HUNTER_TASK_QUEUE,
      workflowsPath: new URL('../../../../worker/src/workflows/index.ts', import.meta.url).pathname,
      activities: {
        async updateApplicationStatus() {},
        async persistEvent() {
          return { id: 'evt-cancel' };
        },
      },
    });

    await worker.runUntil(async () => {
      const created = await createTestApp();

      // Start
      await app.inject({
        method: 'POST',
        url: `/api/applications/${created.id}/start`,
        payload: { cadenceSchedule: [100000] },
      });

      // Signal Cancel
      const cancelRes = await app.inject({
        method: 'POST',
        url: `/api/applications/${created.id}/cancel`,
        payload: { reason: 'Position filled' },
      });

      expect(cancelRes.statusCode).toBe(200);
      const cancelJson = cancelRes.json();
      expect(cancelJson.success).toBe(true);
      expect(cancelJson.status).toBe('CANCELLED');

      const appInDb = await repo.getApplicationById(created.id);
      expect(appInDb?.status).toBe('CANCELLED');

      const events = await repo.getEventsByApplicationId(created.id);
      expect(events.some((e) => e.type === 'CANCELLED')).toBe(true);
    });
  });

  it('queries workflow state via GET /:id/state', async () => {
    const created = await createTestApp();

    // Query state before workflow start (returns DB fallback)
    const stateRes = await app.inject({
      method: 'GET',
      url: `/api/applications/${created.id}/state`,
    });

    expect(stateRes.statusCode).toBe(200);
    const stateJson = stateRes.json();
    expect(stateJson.workflowId).toBe(`gh-${created.id}`);
    expect(stateJson.status).toBe('DRAFT');
  });

  it('returns 404 when attempting workflow operations on non-existent application', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const startRes = await app.inject({
      method: 'POST',
      url: `/api/applications/${fakeId}/start`,
    });
    expect(startRes.statusCode).toBe(404);

    const replyRes = await app.inject({
      method: 'POST',
      url: `/api/applications/${fakeId}/reply`,
    });
    expect(replyRes.statusCode).toBe(404);

    const cancelRes = await app.inject({
      method: 'POST',
      url: `/api/applications/${fakeId}/cancel`,
    });
    expect(cancelRes.statusCode).toBe(404);

    const stateRes = await app.inject({
      method: 'GET',
      url: `/api/applications/${fakeId}/state`,
    });
    expect(stateRes.statusCode).toBe(404);
  });
});
