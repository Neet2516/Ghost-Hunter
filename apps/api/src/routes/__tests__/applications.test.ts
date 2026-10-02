import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FastifyInstance } from 'fastify';
import * as schema from '../../db/schema.js';
import { DatabaseRepository } from '../../db/crud.js';
import { buildApp } from '../../app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Application API Endpoints (CRUD)', () => {
  let sqlite: Database.Database;
  let app: FastifyInstance;
  let repo: DatabaseRepository;

  beforeEach(async () => {
    sqlite = new Database(':memory:');
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    const db = drizzle(sqlite, { schema });
    repo = new DatabaseRepository(db);

    const migrationsFolder = path.resolve(__dirname, '../../../drizzle');
    migrate(db, { migrationsFolder });

    app = await buildApp({ repo, logger: false });
  });

  afterEach(async () => {
    await app.close();
    sqlite.close();
  });

  describe('POST /api/applications', () => {
    it('should create an application when input is valid', async () => {
      const payload = {
        company: 'Cloudflare',
        role: 'Systems Engineer Intern',
        recruiterName: 'Matthew Prince',
        recruiterContact: 'matthew@cloudflare.com',
        outreachChannel: 'email',
        outreachContext: 'Follow-up regarding edge workers runtime performance.',
        delayMs: 172800000,
        maxFollowUps: 2,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/applications',
        payload,
      });

      expect(response.statusCode).toBe(201);
      const json = response.json();
      expect(json.id).toBeDefined();
      expect(json.company).toBe('Cloudflare');
      expect(json.status).toBe('DRAFT');
      expect(json.delayMs).toBe(172800000);
      expect(json.maxFollowUps).toBe(2);
    });

    it('should return 400 with VALIDATION_ERROR and field details on missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/applications',
        payload: {
          company: '',
          role: '',
          // recruiterName missing
          outreachContext: 'Hi', // too short (<5 chars)
          maxFollowUps: 10, // exceeds max 3
        },
      });

      expect(response.statusCode).toBe(400);
      const json = response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.fields).toBeDefined();
      expect(json.error.fields.company).toBeDefined();
      expect(json.error.fields.role).toBeDefined();
      expect(json.error.fields.recruiterName).toBeDefined();
      expect(json.error.fields.outreachContext).toBeDefined();
      expect(json.error.fields.maxFollowUps).toBeDefined();
    });
  });

  describe('GET /api/applications', () => {
    it('should list all applications or filter by status', async () => {
      const app1 = await repo.createApplication({
        company: 'Vercel',
        role: 'SWE',
        recruiterName: 'Alice',
        outreachChannel: 'email',
        outreachContext: 'Sent note about Next.js',
        delayMs: 5000,
        maxFollowUps: 2,
      });

      await repo.createApplication({
        company: 'Netlify',
        role: 'SWE',
        recruiterName: 'Bob',
        outreachChannel: 'email',
        outreachContext: 'Sent note about Jamstack',
        delayMs: 5000,
        maxFollowUps: 2,
      });

      await repo.updateApplication(app1.id, { status: 'HUNTING' });

      // List all
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/applications',
      });
      expect(listRes.statusCode).toBe(200);
      expect(listRes.json().length).toBe(2);

      // Filter status
      const filterRes = await app.inject({
        method: 'GET',
        url: '/api/applications?status=HUNTING',
      });
      expect(filterRes.statusCode).toBe(200);
      const filtered = filterRes.json();
      expect(filtered.length).toBe(1);
      expect(filtered[0].company).toBe('Vercel');
    });
  });

  describe('GET /api/applications/:id', () => {
    it('should return application if exists', async () => {
      const created = await repo.createApplication({
        company: 'Datadog',
        role: 'Observability Engineer',
        recruiterName: 'Charlie',
        outreachChannel: 'linkedin',
        outreachContext: 'Observability agent experience.',
        delayMs: 10000,
        maxFollowUps: 1,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/applications/${created.id}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().id).toBe(created.id);
      expect(response.json().company).toBe('Datadog');
    });

    it('should return 404 for non-existent UUID', async () => {
      const nonExistent = '00000000-0000-0000-0000-000000000000';
      const response = await app.inject({
        method: 'GET',
        url: `/api/applications/${nonExistent}`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for malformed non-UUID id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/applications/invalid-uuid-format',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/applications/:id', () => {
    it('should update specified fields on an application', async () => {
      const created = await repo.createApplication({
        company: 'Supabase',
        role: 'Database Engineer',
        recruiterName: 'Paul Copplestone',
        outreachChannel: 'email',
        outreachContext: 'Postgres extensions outreach.',
        delayMs: 86400000,
        maxFollowUps: 2,
      });

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/applications/${created.id}`,
        payload: {
          role: 'Staff Database Engineer',
          recruiterContact: 'paul@supabase.com',
        },
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json.role).toBe('Staff Database Engineer');
      expect(json.recruiterContact).toBe('paul@supabase.com');
      expect(json.company).toBe('Supabase');
    });

    it('should return 404 when patching non-existent application', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/applications/11111111-1111-1111-1111-111111111111',
        payload: { company: 'Nowhere' },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/applications/:id', () => {
    it('should delete application and return 200', async () => {
      const created = await repo.createApplication({
        company: 'Postman',
        role: 'API Engineer',
        recruiterName: 'Abhinav Asthana',
        outreachChannel: 'email',
        outreachContext: 'API tooling discussions.',
        delayMs: 5000,
        maxFollowUps: 1,
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/applications/${created.id}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().success).toBe(true);

      const check = await repo.getApplicationById(created.id);
      expect(check).toBeUndefined();
    });

    it('should return 404 when deleting non-existent application', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/applications/22222222-2222-2222-2222-222222222222',
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/applications/:id/events', () => {
    it('should return chronological event trail for application', async () => {
      const created = await repo.createApplication({
        company: 'Tailscale',
        role: 'WireGuard Networking Intern',
        recruiterName: 'Avery Pennarun',
        outreachChannel: 'email',
        outreachContext: 'Mesh networking experience.',
        delayMs: 5000,
        maxFollowUps: 1,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/applications/${created.id}/events`,
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(1);
      expect(json[0].type).toBe('CREATED');
    });
  });
});
