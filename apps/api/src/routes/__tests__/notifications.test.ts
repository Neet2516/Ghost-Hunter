import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FastifyInstance } from 'fastify';
import * as schema from '../../db/schema.js';
import { DatabaseRepository } from '../../db/crud.js';
import { EventBus } from '../../events/bus.js';
import { buildApp } from '../../app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Notifications & SSE API Endpoints (TASK-016)', () => {
  let sqlite: Database.Database;
  let app: FastifyInstance;
  let repo: DatabaseRepository;
  let eventBus: EventBus;
  let testAppId: string;

  beforeEach(async () => {
    sqlite = new Database(':memory:');
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    const db = drizzle(sqlite, { schema });
    repo = new DatabaseRepository(db);
    eventBus = new EventBus();

    const migrationsFolder = path.resolve(__dirname, '../../../drizzle');
    migrate(db, { migrationsFolder });

    app = await buildApp({ repo, eventBus, logger: false });

    // Seed a test application for foreign key
    const appRecord = await repo.createApplication({
      company: 'Linear',
      role: 'Staff Engineer',
      recruiterName: 'Karri Saarinen',
      outreachChannel: 'email',
      outreachContext: 'Follow up on architecture role conversation.',
      delayMs: 86400000,
      maxFollowUps: 2,
    });
    testAppId = appRecord.id;
  });

  afterEach(async () => {
    await app.close();
    sqlite.close();
  });

  describe('GET /api/notifications', () => {
    it('should return empty list when no notifications exist', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/notifications',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(Array.isArray(json)).toBe(true);
      expect(json).toHaveLength(0);
    });

    it('should return created notifications in reverse chronological order', async () => {
      await repo.createNotification(
        testAppId,
        'DRAFT_READY',
        'Stage 1 draft ready',
        '2026-10-01T10:00:00.000Z'
      );
      await repo.createNotification(
        testAppId,
        'REMINDER',
        'Cadence delay reached',
        '2026-10-01T11:00:00.000Z'
      );

      const res = await app.inject({
        method: 'GET',
        url: '/api/notifications',
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json).toHaveLength(2);
      expect(json[0].message).toBe('Cadence delay reached');
      expect(json[1].message).toBe('Stage 1 draft ready');
    });

    it('should filter unread notifications when unreadOnly=true', async () => {
      const n1 = await repo.createNotification(testAppId, 'DRAFT_READY', 'Unread draft');
      const n2 = await repo.createNotification(testAppId, 'HUNT_COMPLETED', 'Read completed');

      // Mark n2 as read
      await repo.markNotificationsAsRead([n2.id]);

      const resAll = await app.inject({
        method: 'GET',
        url: '/api/notifications',
      });
      expect(JSON.parse(resAll.payload)).toHaveLength(2);

      const resUnread = await app.inject({
        method: 'GET',
        url: '/api/notifications?unreadOnly=true',
      });
      expect(resUnread.statusCode).toBe(200);
      const unreadList = JSON.parse(resUnread.payload);
      expect(unreadList).toHaveLength(1);
      expect(unreadList[0].id).toBe(n1.id);
    });
  });

  describe('POST /api/notifications/read and PATCH /api/notifications/read', () => {
    it('should mark specific notification IDs as read and broadcast event', async () => {
      const n1 = await repo.createNotification(testAppId, 'DRAFT_READY', 'Draft ready');
      let broadcasted: any = null;
      eventBus.on('event', (ev) => {
        if (ev.type === 'NOTIFICATIONS_READ') {
          broadcasted = ev;
        }
      });

      const res = await app.inject({
        method: 'POST',
        url: '/api/notifications/read',
        payload: {
          notificationIds: [n1.id],
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.count).toBe(1);

      expect(broadcasted).toBeDefined();
      expect(broadcasted.type).toBe('NOTIFICATIONS_READ');

      // Verify unread list is now 0
      const unreadRes = await app.inject({
        method: 'GET',
        url: '/api/notifications?unreadOnly=true',
      });
      expect(JSON.parse(unreadRes.payload)).toHaveLength(0);
    });

    it('should mark all notifications as read when all: true via PATCH', async () => {
      await repo.createNotification(testAppId, 'DRAFT_READY', 'Draft 1');
      await repo.createNotification(testAppId, 'DRAFT_READY', 'Draft 2');

      const res = await app.inject({
        method: 'PATCH',
        url: '/api/notifications/read',
        payload: {
          all: true,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.count).toBe(2);

      const unreadRes = await app.inject({
        method: 'GET',
        url: '/api/notifications?unreadOnly=true',
      });
      expect(JSON.parse(unreadRes.payload)).toHaveLength(0);
    });
  });

  describe('GET /api/events (SSE Stream)', () => {
    it('should respond with text/event-stream headers and connected event', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/events?test=true',
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.payload).toContain('event: connected');
      expect(res.payload).toContain('"status":"connected"');
    });
  });
});
