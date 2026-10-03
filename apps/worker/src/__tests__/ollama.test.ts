import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { ValidationConfigError } from '@ghost-hunter/shared';
import * as schema from '../db/schema.js';
import { setDatabaseInstance } from '../db/connection.js';
import {
  extractFirstName,
  buildPrompt,
  validateAndParseDraft,
  generateFallbackTemplate,
} from '../ollama/prompt.js';
import { OllamaClient } from '../ollama/client.js';
import {
  generateFollowUpDraft,
  checkModelHealth,
} from '../activities/ollama.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Ollama Client, Prompt Builder & Activities (TASK-013)', () => {
  let sqlite: Database.Database;
  let server: http.Server;
  let serverPort: number;
  let serverHandler: (req: http.IncomingMessage, res: http.ServerResponse) => void;

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      if (serverHandler) {
        serverHandler(req, res);
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (typeof addr === 'object' && addr) {
          serverPort = addr.port;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  beforeEach(() => {
    sqlite = new Database(':memory:');
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    const db = drizzle(sqlite, { schema });
    const migrationsFolder = path.resolve(__dirname, '../../../api/drizzle');
    migrate(db, { migrationsFolder });

    setDatabaseInstance({ sqlite, db });
  });

  afterEach(() => {
    setDatabaseInstance(null);
    sqlite.close();
  });

  const createTestApplication = (appId: string) => {
    const { db } = { db: drizzle(sqlite, { schema }) };
    const now = new Date().toISOString();
    db.insert(schema.applications)
      .values({
        id: appId,
        company: 'Stripe',
        role: 'Staff Infrastructure Engineer',
        recruiterName: 'Dr. Jane Smith',
        recruiterContact: 'jane@stripe.com',
        outreachChannel: 'email',
        outreachContext: 'Sent cold email highlighting distributed systems background and interest in payments platform.',
        outreachSentAt: now,
        delayMs: 259200000,
        maxFollowUps: 3,
        status: 'HUNTING',
        createdAt: now,
        updatedAt: now,
      })
      .run();
  };

  // -------------------------------------------------------------------------
  // UNIT TESTS: Prompt Builder, JSON Validation, Fallback Template
  // -------------------------------------------------------------------------
  describe('Prompt Builder & Sanitization', () => {
    it('extracts recruiter first name and handles honorifics', () => {
      expect(extractFirstName('Dr. Jane Smith')).toBe('Jane');
      expect(extractFirstName('Mr. Alex Miller')).toBe('Alex');
      expect(extractFirstName('Sarah Connor')).toBe('Sarah');
      expect(extractFirstName('Madonna')).toBe('Madonna');
      expect(extractFirstName('')).toBe('there');
    });

    it('builds prompts with quarantined DATA tags and anti-hallucination rules', () => {
      const prompt = buildPrompt({
        company: 'Figma',
        role: 'Design Technologist',
        recruiterName: 'Amanda Vance',
        outreachContext: 'Expressed excitement about WebAssembly canvas rendering.',
        stage: 1,
        daysSince: 3,
        outreachChannel: 'linkedin',
      });

      expect(prompt.system).toContain('Output MUST be ONLY valid JSON');
      expect(prompt.system).toContain('NEVER use placeholder tokens like [Name]');
      expect(prompt.system).toContain('Do NOT hallucinate past interviews');

      expect(prompt.user).toContain('<DATA>');
      expect(prompt.user).toContain('Company: """Figma"""');
      expect(prompt.user).toContain('Role: """Design Technologist"""');
      expect(prompt.user).toContain('Recruiter First Name: """Amanda"""');
      expect(prompt.user).toContain('Expressed excitement about WebAssembly canvas rendering.');
      expect(prompt.user).toContain('</DATA>');
    });

    it('validates and parses clean JSON drafts', () => {
      const raw = JSON.stringify({
        subject: 'Following up on Design Technologist role - Figma',
        body: 'Hi Amanda,\n\nI wanted to quickly follow up on my note regarding the Design Technologist role at Figma. I remain very enthusiastic about the work your team is doing.\n\nBest,\nCandidate',
      });

      const parsed = validateAndParseDraft(raw);
      expect(parsed.subject).toBe('Following up on Design Technologist role - Figma');
      expect(parsed.body).toContain('Hi Amanda');
    });

    it('strips markdown code blocks from JSON drafts', () => {
      const raw = `\`\`\`json
{
  "subject": "Quick check-in on Stripe application",
  "body": "Hi Jane, I wanted to follow up on my recent message. Looking forward to connecting."
}
\`\`\``;

      const parsed = validateAndParseDraft(raw);
      expect(parsed.subject).toBe('Quick check-in on Stripe application');
      expect(parsed.body).toContain('Hi Jane');
    });

    it('Scenario #9: rejects malformed JSON and placeholder tokens', () => {
      // 1. Broken JSON
      expect(() => validateAndParseDraft('{ broken json...')).toThrow(/Malformed AI JSON/);

      // 2. Missing fields
      expect(() => validateAndParseDraft(JSON.stringify({ subject: 'Test' }))).toThrow(
        /AI Draft validation failed/
      );

      // 3. Placeholder tokens [Name]
      expect(() =>
        validateAndParseDraft(
          JSON.stringify({
            subject: 'Follow-up for [Role] position',
            body: 'Hi [Name], following up on [Company].',
          })
        )
      ).toThrow(/placeholder tokens/);

      // 4. Over 120 words
      const longBody = Array(130).fill('word').join(' ');
      expect(() =>
        validateAndParseDraft(
          JSON.stringify({
            subject: 'Valid subject',
            body: longBody,
          })
        )
      ).toThrow(/exceeds maximum 120 words/);
    });

    it('generates dependable fallback templates for all stages', () => {
      for (const stage of [1, 2, 3]) {
        const fallback = generateFallbackTemplate({
          company: 'Acme Corp',
          role: 'Site Reliability Engineer',
          recruiterName: 'Robert Vance',
          outreachContext: 'Initial outreach note',
          stage,
        });

        expect(fallback.subject).toContain('Acme Corp');
        expect(fallback.body).toContain('Hi Robert');
        expect(fallback.body).not.toMatch(/\[.*\]/);
      }
    });

    it('throws non-retryable ValidationConfigError on invalid input', async () => {
      await expect(
        generateFollowUpDraft({
          applicationId: '',
          stage: 1,
          company: 'Test',
          role: 'Dev',
          recruiterName: 'Recruiter',
          outreachContext: 'Context',
        })
      ).rejects.toThrow(ValidationConfigError);

      await expect(
        generateFollowUpDraft({
          applicationId: 'app-1',
          stage: 0,
          company: 'Test',
          role: 'Dev',
          recruiterName: 'Recruiter',
          outreachContext: 'Context',
        })
      ).rejects.toThrow(ValidationConfigError);
    });
  });

  // -------------------------------------------------------------------------
  // SCENARIO #7: Ollama unavailable -> Retries, DEGRADED, template offered
  // -------------------------------------------------------------------------
  describe('Scenario #7: Ollama unavailable', () => {
    it('reports offline status when Ollama server is unreachable', async () => {
      const client = new OllamaClient({
        baseUrl: 'http://127.0.0.1:19999', // Port with no server
        timeoutMs: 1000,
      });

      const health = await checkModelHealth(client);
      expect(health.status).toBe('offline');
      expect(health.error).toContain('Ollama is unreachable');
    });

    it('retries on intermediate attempts and falls back to template on final attempt', async () => {
      const appId = 'app-scenario-7';
      createTestApplication(appId);

      const client = new OllamaClient({
        baseUrl: 'http://127.0.0.1:19999',
        timeoutMs: 1000,
      });

      // Attempt 1: throws retryable error and records RETRY event
      await expect(
        generateFollowUpDraft({
          applicationId: appId,
          stage: 1,
          company: 'Stripe',
          role: 'Staff Infrastructure Engineer',
          recruiterName: 'Dr. Jane Smith',
          outreachContext: 'Initial message',
          client,
          testAttempt: 1,
          maxRetries: 3,
        })
      ).rejects.toThrow(/Failed to connect to Ollama/);

      const db = drizzle(sqlite, { schema });
      const eventsAfterAttempt1 = db
        .select()
        .from(schema.events)
        .where(eq(schema.events.applicationId, appId))
        .all();
      expect(eventsAfterAttempt1).toHaveLength(1);
      expect(eventsAfterAttempt1[0].type).toBe('RETRY');

      // Attempt 2: throws retryable error and records second RETRY event
      await expect(
        generateFollowUpDraft({
          applicationId: appId,
          stage: 1,
          company: 'Stripe',
          role: 'Staff Infrastructure Engineer',
          recruiterName: 'Dr. Jane Smith',
          outreachContext: 'Initial message',
          client,
          testAttempt: 2,
          maxRetries: 3,
        })
      ).rejects.toThrow(/Failed to connect to Ollama/);

      const eventsAfterAttempt2 = db
        .select()
        .from(schema.events)
        .where(eq(schema.events.applicationId, appId))
        .all();
      expect(eventsAfterAttempt2).toHaveLength(2);
      expect(eventsAfterAttempt2[1].type).toBe('RETRY');

      // Attempt 3 (final attempt): catches error, enters DEGRADED, records DEGRADED event and generates template
      const result = await generateFollowUpDraft({
        applicationId: appId,
        stage: 1,
        company: 'Stripe',
        role: 'Staff Infrastructure Engineer',
        recruiterName: 'Dr. Jane Smith',
        outreachContext: 'Initial message',
        client,
        testAttempt: 3,
        maxRetries: 3,
      });

      expect(result.source).toBe('template');
      expect(result.isDegraded).toBe(true);
      expect(result.subject).toContain('Staff Infrastructure Engineer');
      expect(result.body).toContain('Hi Jane');

      // Verify DB records
      const allEvents = db
        .select()
        .from(schema.events)
        .where(eq(schema.events.applicationId, appId))
        .all();
      const eventTypes = allEvents.map((e) => e.type);
      expect(eventTypes).toContain('RETRY');
      expect(eventTypes).toContain('DEGRADED');
      expect(eventTypes).toContain('DRAFT_READY');

      const followups = db
        .select()
        .from(schema.followups)
        .where(eq(schema.followups.applicationId, appId))
        .all();
      expect(followups).toHaveLength(1);
      expect(followups[0].source).toBe('template');
      expect(followups[0].status).toBe('READY');
    });
  });

  // -------------------------------------------------------------------------
  // SCENARIO #8: Gemma missing -> Stub 404 model + clear model-status error
  // -------------------------------------------------------------------------
  describe('Scenario #8: Gemma missing (404 model)', () => {
    it('detects missing model via tags endpoint and clear status error', async () => {
      serverHandler = (req, res) => {
        if (req.url === '/api/tags') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ models: [{ name: 'llama3:8b' }, { name: 'mistral:latest' }] }));
          return;
        }
        res.writeHead(404);
        res.end();
      };

      const client = new OllamaClient({
        baseUrl: `http://127.0.0.1:${serverPort}`,
        model: 'gemma3:4b',
      });

      const health = await checkModelHealth(client);
      expect(health.status).toBe('missing_model');
      expect(health.model).toBe('gemma3:4b');
      expect(health.error).toContain("Model \"gemma3:4b\" is not installed. Run 'ollama pull gemma3:4b'");
    });

    it('handles 404 model not found on chat endpoint and degrades to template', async () => {
      serverHandler = (req, res) => {
        if (req.url === '/api/chat') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "model 'gemma3:4b' not found, try pulling it first" }));
          return;
        }
        res.writeHead(404);
        res.end();
      };

      const appId = 'app-scenario-8';
      createTestApplication(appId);

      const client = new OllamaClient({
        baseUrl: `http://127.0.0.1:${serverPort}`,
        model: 'gemma3:4b',
      });

      // Attempt 1: throws model not found
      await expect(
        generateFollowUpDraft({
          applicationId: appId,
          stage: 1,
          company: 'Stripe',
          role: 'Staff Infrastructure Engineer',
          recruiterName: 'Dr. Jane Smith',
          outreachContext: 'Initial message',
          client,
          testAttempt: 1,
          maxRetries: 3,
        })
      ).rejects.toThrow(/Model "gemma3:4b" not found \(404\)/);

      // Attempt 3: degrades and returns template
      const result = await generateFollowUpDraft({
        applicationId: appId,
        stage: 1,
        company: 'Stripe',
        role: 'Staff Infrastructure Engineer',
        recruiterName: 'Dr. Jane Smith',
        outreachContext: 'Initial message',
        client,
        testAttempt: 3,
        maxRetries: 3,
      });

      expect(result.source).toBe('template');
      expect(result.isDegraded).toBe(true);
      expect(result.degradedReason).toContain('Model "gemma3:4b" not found');
    });
  });

  // -------------------------------------------------------------------------
  // SCENARIO #9: Malformed AI JSON -> Retry then fallback; never shown raw
  // -------------------------------------------------------------------------
  describe('Scenario #9: Malformed AI JSON', () => {
    it('retries malformed JSON from model, falls back to template, and never persists raw bad output', async () => {
      serverHandler = (req, res) => {
        if (req.url === '/api/chat') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              message: {
                content: 'I am not returning JSON! Hi [Name], please reply to me.',
              },
            })
          );
          return;
        }
        res.writeHead(404);
        res.end();
      };

      const appId = 'app-scenario-9';
      createTestApplication(appId);

      const client = new OllamaClient({
        baseUrl: `http://127.0.0.1:${serverPort}`,
      });

      // Attempt 1 fails JSON parsing/validation
      await expect(
        generateFollowUpDraft({
          applicationId: appId,
          stage: 1,
          company: 'Stripe',
          role: 'Staff Infrastructure Engineer',
          recruiterName: 'Dr. Jane Smith',
          outreachContext: 'Initial message',
          client,
          testAttempt: 1,
          maxRetries: 3,
        })
      ).rejects.toThrow(/Malformed AI JSON/);

      // Final attempt falls back to template
      const result = await generateFollowUpDraft({
        applicationId: appId,
        stage: 1,
        company: 'Stripe',
        role: 'Staff Infrastructure Engineer',
        recruiterName: 'Dr. Jane Smith',
        outreachContext: 'Initial message',
        client,
        testAttempt: 3,
        maxRetries: 3,
      });

      expect(result.source).toBe('template');
      expect(result.isDegraded).toBe(true);
      expect(result.body).not.toContain('I am not returning JSON');
      expect(result.body).not.toContain('[Name]');
      expect(result.body).toContain('Hi Jane');

      const db = drizzle(sqlite, { schema });
      const draftInDb = db
        .select()
        .from(schema.followups)
        .where(eq(schema.followups.applicationId, appId))
        .get();
      expect(draftInDb?.body).not.toContain('I am not returning JSON');
      expect(draftInDb?.body).not.toContain('[Name]');
      expect(draftInDb?.source).toBe('template');
    });
  });

  // -------------------------------------------------------------------------
  // SCENARIO #10: Activity retry -> Stub fails 2x then OK; Success on 3rd with RETRY events
  // -------------------------------------------------------------------------
  describe('Scenario #10: Activity retry (fails 2x then OK)', () => {
    it('records RETRY events on attempts 1 and 2, then succeeds on attempt 3 with gemma output', async () => {
      let callCount = 0;

      serverHandler = (req, res) => {
        if (req.url === '/api/chat') {
          callCount++;
          if (callCount <= 2) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`Internal Server Error simulation #${callCount}`);
            return;
          }

          // Call #3 succeeds!
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              message: {
                content: JSON.stringify({
                  subject: 'Following up on Staff Infrastructure Engineer role - Stripe',
                  body: 'Hi Jane,\n\nI wanted to follow up on my recent note regarding the Staff Infrastructure Engineer position. I look forward to any updates.\n\nBest,\nCandidate',
                }),
              },
            })
          );
          return;
        }
        res.writeHead(404);
        res.end();
      };

      const appId = 'app-scenario-10';
      createTestApplication(appId);

      const client = new OllamaClient({
        baseUrl: `http://127.0.0.1:${serverPort}`,
      });

      // Attempt 1: fails, records RETRY
      await expect(
        generateFollowUpDraft({
          applicationId: appId,
          stage: 1,
          company: 'Stripe',
          role: 'Staff Infrastructure Engineer',
          recruiterName: 'Dr. Jane Smith',
          outreachContext: 'Initial message',
          client,
          testAttempt: 1,
          maxRetries: 3,
        })
      ).rejects.toThrow(/HTTP 500/);

      // Attempt 2: fails, records RETRY
      await expect(
        generateFollowUpDraft({
          applicationId: appId,
          stage: 1,
          company: 'Stripe',
          role: 'Staff Infrastructure Engineer',
          recruiterName: 'Dr. Jane Smith',
          outreachContext: 'Initial message',
          client,
          testAttempt: 2,
          maxRetries: 3,
        })
      ).rejects.toThrow(/HTTP 500/);

      // Attempt 3: succeeds!
      const result = await generateFollowUpDraft({
        applicationId: appId,
        stage: 1,
        company: 'Stripe',
        role: 'Staff Infrastructure Engineer',
        recruiterName: 'Dr. Jane Smith',
        outreachContext: 'Initial message',
        client,
        testAttempt: 3,
        maxRetries: 3,
      });

      expect(result.source).toBe('gemma');
      expect(result.isDegraded).toBe(false);
      expect(result.subject).toBe('Following up on Staff Infrastructure Engineer role - Stripe');
      expect(result.body).toContain('Hi Jane');

      // Verify events in SQLite
      const db = drizzle(sqlite, { schema });
      const events = db
        .select()
        .from(schema.events)
        .where(eq(schema.events.applicationId, appId))
        .all();

      const retryEvents = events.filter((e) => e.type === 'RETRY');
      const draftReadyEvents = events.filter((e) => e.type === 'DRAFT_READY');

      expect(retryEvents).toHaveLength(2);
      expect(JSON.parse(retryEvents[0].payload).attempt).toBe(1);
      expect(JSON.parse(retryEvents[1].payload).attempt).toBe(2);

      expect(draftReadyEvents).toHaveLength(1);
      expect(JSON.parse(draftReadyEvents[0].payload).source).toBe('gemma');

      // Verify draft in SQLite
      const draft = db
        .select()
        .from(schema.followups)
        .where(eq(schema.followups.applicationId, appId))
        .get();
      expect(draft?.source).toBe('gemma');
      expect(draft?.status).toBe('READY');
      expect(draft?.subject).toBe('Following up on Staff Infrastructure Engineer role - Stripe');
    });
  });
});
