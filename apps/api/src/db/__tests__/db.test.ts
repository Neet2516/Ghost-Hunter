import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from '../schema.js';
import { DatabaseRepository } from '../crud.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Database Schema, Migrations, and CRUD Operations', () => {
  let sqlite: Database.Database;
  let repo: DatabaseRepository;

  beforeEach(() => {
    // In-memory SQLite database for isolated test execution
    sqlite = new Database(':memory:');
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    const db = drizzle(sqlite, { schema });
    repo = new DatabaseRepository(db);

    // Run migrations from drizzle folder
    const migrationsFolder = path.resolve(__dirname, '../../../drizzle');
    migrate(db, { migrationsFolder });
  });

  afterEach(() => {
    sqlite.close();
  });

  it('should run migrations and establish all 4 tables with correct indexes', () => {
    const tables = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain('applications');
    expect(tableNames).toContain('followups');
    expect(tableNames).toContain('events');
    expect(tableNames).toContain('notifications');
  });

  describe('Application CRUD', () => {
    it('should create an application and automatically log CREATED event', async () => {
      const app = await repo.createApplication({
        company: 'Vercel',
        role: 'Frontend Infrastructure Intern',
        recruiterName: 'Guillermo Rauch',
        recruiterContact: 'guillermo@vercel.com',
        outreachChannel: 'email',
        outreachContext: 'Followed up regarding Next.js turbopack benchmarks.',
        delayMs: 172800000,
        maxFollowUps: 2,
      });

      expect(app.id).toBeDefined();
      expect(app.company).toBe('Vercel');
      expect(app.status).toBe('DRAFT');
      expect(app.subStatus).toBeNull();
      expect(app.workflowId).toBeNull();

      // Check CREATED event was automatically recorded
      const events = await repo.getEventsByApplicationId(app.id);
      expect(events.length).toBe(1);
      expect(events[0]?.type).toBe('CREATED');
      const payload = JSON.parse(events[0]?.payload || '{}');
      expect(payload.company).toBe('Vercel');
    });

    it('should update application status and workflowId', async () => {
      const app = await repo.createApplication({
        company: 'Retool',
        role: 'Full Stack Engineer',
        recruiterName: 'David Hsu',
        outreachChannel: 'linkedin',
        outreachContext: 'Sent note about custom internal tooling experiences.',
        delayMs: 86400000,
        maxFollowUps: 3,
      });

      const updated = await repo.updateApplication(app.id, {
        status: 'HUNTING',
        subStatus: 'WAITING',
        workflowId: `gh-${app.id}`,
      });

      expect(updated?.status).toBe('HUNTING');
      expect(updated?.subStatus).toBe('WAITING');
      expect(updated?.workflowId).toBe(`gh-${app.id}`);
    });

    it('should list applications with optional status filter', async () => {
      const app1 = await repo.createApplication({
        company: 'Linear',
        role: 'SWE',
        recruiterName: 'Karri',
        outreachChannel: 'email',
        outreachContext: 'Sent message 1',
        delayMs: 1000,
        maxFollowUps: 1,
      });

      await repo.createApplication({
        company: 'Notion',
        role: 'SWE',
        recruiterName: 'Ivan',
        outreachChannel: 'email',
        outreachContext: 'Sent message 2',
        delayMs: 1000,
        maxFollowUps: 1,
      });

      await repo.updateApplication(app1.id, { status: 'HUNTING' });

      const all = await repo.listApplications();
      expect(all.length).toBe(2);

      const hunting = await repo.listApplications({ status: 'HUNTING' });
      expect(hunting.length).toBe(1);
      expect(hunting[0]?.id).toBe(app1.id);
    });

    it('should cascade delete followups, events, and notifications when application is deleted', async () => {
      const app = await repo.createApplication({
        company: 'Figma',
        role: 'C++ Systems Engineer',
        recruiterName: 'Dylan Field',
        outreachChannel: 'email',
        outreachContext: 'Followed up on WebAssembly canvas rendering.',
        delayMs: 5000,
        maxFollowUps: 1,
      });

      await repo.createFollowUp({
        applicationId: app.id,
        stage: 1,
        subject: 'Quick follow-up on Figma role',
        body: 'Hi Dylan, wanted to check in on the systems role.',
        source: 'gemma',
        status: 'READY',
      });

      await repo.createNotification(app.id, 'DRAFT_READY', 'Follow-up draft ready for review');

      const deleted = await repo.deleteApplication(app.id);
      expect(deleted).toBe(true);

      const followups = await repo.getFollowUpsByApplicationId(app.id);
      expect(followups.length).toBe(0);

      const events = await repo.getEventsByApplicationId(app.id);
      expect(events.length).toBe(0);
    });
  });

  describe('Notifications', () => {
    it('should create notifications, filter unread, and mark as read', async () => {
      const app = await repo.createApplication({
        company: 'Stripe',
        role: 'Backend Engineer',
        recruiterName: 'Collison',
        outreachChannel: 'email',
        outreachContext: 'Payments infrastructure outreach.',
        delayMs: 10000,
        maxFollowUps: 2,
      });

      const notif1 = await repo.createNotification(app.id, 'DRAFT_READY', 'Draft ready for review');
      const notif2 = await repo.createNotification(app.id, 'INFO', 'Workflow started');

      const unread = await repo.listNotifications({ unreadOnly: true });
      expect(unread.length).toBe(2);

      // Mark single notification read
      const changed = await repo.markNotificationsAsRead([notif1.id]);
      expect(changed).toBe(1);

      const remainingUnread = await repo.listNotifications({ unreadOnly: true });
      expect(remainingUnread.length).toBe(1);
      expect(remainingUnread[0]?.id).toBe(notif2.id);

      // Mark all read
      await repo.markNotificationsAsRead(undefined, true);
      const noneUnread = await repo.listNotifications({ unreadOnly: true });
      expect(noneUnread.length).toBe(0);
    });
  });
});
