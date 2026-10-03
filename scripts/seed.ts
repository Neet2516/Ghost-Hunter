import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Database = require('../apps/api/node_modules/better-sqlite3');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(prefix: string, message: string, color = COLORS.cyan) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`${COLORS.dim}[${timestamp}]${COLORS.reset} ${color}${COLORS.bright}[${prefix}]${COLORS.reset} ${message}`);
}

function success(prefix: string, message: string) {
  log(prefix, `${COLORS.green}✔ ${message}${COLORS.reset}`, COLORS.green);
}

function warn(prefix: string, message: string) {
  log(prefix, `${COLORS.yellow}⚠ ${message}${COLORS.reset}`, COLORS.yellow);
}

export async function runSeed(options: { reset?: boolean; dbPath?: string } = {}) {
  const isReset = options.reset ?? process.argv.includes('--reset') ?? process.argv.includes('-r');
  const dbFile = options.dbPath || process.env.DATABASE_URL?.replace(/^file:/, '') || path.resolve(rootDir, 'sqlite.db');

  log('SEED', `Connecting to SQLite database: ${dbFile}`);
  const db = new Database(dbFile);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Verify tables exist, or run migration schema directly
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='applications'").get();
  if (!tableCheck) {
    log('SEED', 'Applications table not found, initializing schema...');
    const migrationSqlPath = path.resolve(rootDir, 'apps/api/drizzle/0000_faulty_richard_fisk.sql');
    if (fs.existsSync(migrationSqlPath)) {
      const sql = fs.readFileSync(migrationSqlPath, 'utf8');
      db.exec(sql);
      success('SEED', 'Initialized database tables from drizzle migration.');
    } else {
      throw new Error(`Migration SQL not found at ${migrationSqlPath}`);
    }
  }

  if (isReset) {
    warn('SEED', 'Reset flag detected. Purging all existing records...');
    db.prepare('DELETE FROM notifications').run();
    db.prepare('DELETE FROM events').run();
    db.prepare('DELETE FROM followups').run();
    db.prepare('DELETE FROM applications').run();
    success('SEED', 'Database cleared.');
  }

  const now = new Date();
  const isoNow = now.toISOString();

  // Helper date offset generator
  const offsetSecs = (secs: number) => new Date(now.getTime() + secs * 1000).toISOString();
  const offsetDays = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();

  log('SEED', 'Seeding 6 realistic job outreach threads...');

  const insertApp = db.prepare(`
    INSERT OR REPLACE INTO applications (
      id, company, role, recruiter_name, recruiter_contact, outreach_channel,
      outreach_context, outreach_sent_at, delay_ms, max_follow_ups,
      status, sub_status, next_action_at, workflow_id, created_at, updated_at
    ) VALUES (
      @id, @company, @role, @recruiterName, @recruiterContact, @outreachChannel,
      @outreachContext, @outreachSentAt, @delayMs, @maxFollowUps,
      @status, @subStatus, @nextActionAt, @workflowId, @createdAt, @updatedAt
    )
  `);

  const insertFollowUp = db.prepare(`
    INSERT OR REPLACE INTO followups (
      id, application_id, stage, subject, body, source, status, edited_body, created_at, decided_at
    ) VALUES (
      @id, @applicationId, @stage, @subject, @body, @source, @status, @editedBody, @createdAt, @decidedAt
    )
  `);

  const insertEvent = db.prepare(`
    INSERT OR REPLACE INTO events (
      id, application_id, type, payload, at
    ) VALUES (
      @id, @applicationId, @type, @payload, @at
    )
  `);

  const insertNotification = db.prepare(`
    INSERT OR REPLACE INTO notifications (
      id, application_id, kind, message, read_at, created_at
    ) VALUES (
      @id, @applicationId, @kind, @message, @readAt, @createdAt
    )
  `);

  const seedTransaction = db.transaction(() => {
    // -------------------------------------------------------------------------
    // 1. Anthropic: HUNTING / WAITING (Demo countdown: 18s remaining)
    // -------------------------------------------------------------------------
    const app1Id = '11111111-1111-4111-8111-111111111111';
    insertApp.run({
      id: app1Id,
      company: 'Anthropic',
      role: 'Staff Systems Engineer (Distributed Training)',
      recruiterName: 'Sarah Lin',
      recruiterContact: 'slin@anthropic.com',
      outreachChannel: 'email',
      outreachContext: 'Sent tailored outreach covering deep experience optimizing NCCL collectives and ring all-reduce communication primitives across 4,096 H100 clusters. Mentioned reading their recent interpretability research on monosemantic neurons.',
      outreachSentAt: offsetDays(-2),
      delayMs: 20000,
      maxFollowUps: 3,
      status: 'HUNTING',
      subStatus: 'WAITING',
      nextActionAt: offsetSecs(18),
      workflowId: 'gh-seed-anthropic-01',
      createdAt: offsetDays(-2),
      updatedAt: isoNow,
    });

    insertEvent.run({
      id: '11111111-1111-4111-8111-000000000001',
      applicationId: app1Id,
      type: 'CREATED',
      payload: JSON.stringify({ company: 'Anthropic', role: 'Staff Systems Engineer', channel: 'email' }),
      at: offsetDays(-2),
    });

    insertEvent.run({
      id: '11111111-1111-4111-8111-000000000002',
      applicationId: app1Id,
      type: 'HUNT_STARTED',
      payload: JSON.stringify({ workflowId: 'gh-seed-anthropic-01', cadenceSchedule: [20, 20, 20], maxFollowUps: 3 }),
      at: offsetSecs(-2),
    });

    insertEvent.run({
      id: '11111111-1111-4111-8111-000000000003',
      applicationId: app1Id,
      type: 'TIMER_FIRED',
      payload: JSON.stringify({ stage: 1, delayDurationMs: 20000, nextActionAt: offsetSecs(18) }),
      at: offsetSecs(-2),
    });

    // -------------------------------------------------------------------------
    // 2. Stripe: HUNTING / AWAITING_REVIEW (Pending Draft + Unread Notification)
    // -------------------------------------------------------------------------
    const app2Id = '22222222-2222-4222-8222-222222222222';
    insertApp.run({
      id: app2Id,
      company: 'Stripe',
      role: 'Principal Infrastructure Architect',
      recruiterName: 'David Vance',
      recruiterContact: 'vance@stripe.com',
      outreachChannel: 'email',
      outreachContext: 'Applied for Stripe global transaction ledger reliability team. Shared my track record handling zero-downtime database sharding and idempotency key caching at high throughput.',
      outreachSentAt: offsetDays(-4),
      delayMs: 20000,
      maxFollowUps: 2,
      status: 'HUNTING',
      subStatus: 'AWAITING_REVIEW',
      nextActionAt: offsetSecs(16),
      workflowId: 'gh-seed-stripe-02',
      createdAt: offsetDays(-4),
      updatedAt: isoNow,
    });

    const fu2Id = '22222222-2222-4222-8222-000000000001';
    insertFollowUp.run({
      id: fu2Id,
      applicationId: app2Id,
      stage: 1,
      subject: 'Re: Stripe Principal Infrastructure Architect / Follow-up & High-Scale Idempotency',
      body: 'Hi David,\n\nFollowing up on my note last week regarding the Principal Infrastructure Architect opening. I wanted to share a brief note on how we eliminated tail-latency spikes during multi-datacenter consensus reconciliations in my previous role.\n\nWould you have 10 minutes next Tuesday or Wednesday for a quick introductory chat?\n\nBest regards,\nCandidate',
      source: 'gemma',
      status: 'READY',
      editedBody: null,
      createdAt: offsetSecs(-4),
      decidedAt: null,
    });

    insertEvent.run({
      id: '22222222-2222-4222-8222-000000000011',
      applicationId: app2Id,
      type: 'CREATED',
      payload: JSON.stringify({ company: 'Stripe', role: 'Principal Infrastructure Architect' }),
      at: offsetDays(-4),
    });

    insertEvent.run({
      id: '22222222-2222-4222-8222-000000000012',
      applicationId: app2Id,
      type: 'HUNT_STARTED',
      payload: JSON.stringify({ workflowId: 'gh-seed-stripe-02' }),
      at: offsetSecs(-24),
    });

    insertEvent.run({
      id: '22222222-2222-4222-8222-000000000013',
      applicationId: app2Id,
      type: 'TIMER_FIRED',
      payload: JSON.stringify({ stage: 1 }),
      at: offsetSecs(-4),
    });

    insertEvent.run({
      id: '22222222-2222-4222-8222-000000000014',
      applicationId: app2Id,
      type: 'DRAFT_READY',
      payload: JSON.stringify({ stage: 1, draftId: fu2Id, source: 'gemma' }),
      at: offsetSecs(-3),
    });

    insertNotification.run({
      id: '22222222-2222-4222-8222-000000000021',
      applicationId: app2Id,
      kind: 'DRAFT_READY',
      message: 'Follow-up draft ready for Principal Infrastructure Architect at Stripe (Stage 1)',
      readAt: null, // Unread notification
      createdAt: offsetSecs(-3),
    });

    // -------------------------------------------------------------------------
    // 3. Apple: REPLIED (Recruiter scheduled technical interview)
    // -------------------------------------------------------------------------
    const app3Id = '33333333-3333-4333-8333-333333333333';
    insertApp.run({
      id: app3Id,
      company: 'Apple',
      role: 'CoreOS Kernel Engineer',
      recruiterName: 'Elena Rostova',
      recruiterContact: 'https://linkedin.com/in/elena-rostova',
      outreachChannel: 'linkedin',
      outreachContext: 'Reached out directly regarding Darwin XNU virtual memory subsystem enhancements and low-latency IPC optimizations on Apple Silicon M-series chips.',
      outreachSentAt: offsetDays(-6),
      delayMs: 20000,
      maxFollowUps: 3,
      status: 'REPLIED',
      subStatus: null,
      nextActionAt: null,
      workflowId: 'gh-seed-apple-03',
      createdAt: offsetDays(-6),
      updatedAt: offsetDays(-1),
    });

    insertEvent.run({
      id: '33333333-3333-4333-8333-000000000001',
      applicationId: app3Id,
      type: 'CREATED',
      payload: JSON.stringify({ company: 'Apple', role: 'CoreOS Kernel Engineer', channel: 'linkedin' }),
      at: offsetDays(-6),
    });

    insertEvent.run({
      id: '33333333-3333-4333-8333-000000000002',
      applicationId: app3Id,
      type: 'HUNT_STARTED',
      payload: JSON.stringify({ workflowId: 'gh-seed-apple-03' }),
      at: offsetDays(-5),
    });

    insertEvent.run({
      id: '33333333-3333-4333-8333-000000000003',
      applicationId: app3Id,
      type: 'REPLY_SIGNAL',
      payload: JSON.stringify({
        stage: 1,
        note: 'Hi! Thanks for reaching out. We would love to schedule an initial 45-minute technical screen with our kernel architecture team next Thursday at 2 PM PST.',
        repliedAt: offsetDays(-1),
      }),
      at: offsetDays(-1),
    });

    insertNotification.run({
      id: '33333333-3333-4333-8333-000000000011',
      applicationId: app3Id,
      kind: 'REPLY_RECEIVED',
      message: 'Recruiter replied for CoreOS Kernel Engineer at Apple!',
      readAt: offsetDays(-1),
      createdAt: offsetDays(-1),
    });

    // -------------------------------------------------------------------------
    // 4. Figma: COMPLETED (All follow-up stages sent)
    // -------------------------------------------------------------------------
    const app4Id = '44444444-4444-4444-8444-444444444444';
    insertApp.run({
      id: app4Id,
      company: 'Figma',
      role: 'Senior Design Systems Engineer',
      recruiterName: 'Marcus Sterling',
      recruiterContact: 'msterling@figma.com',
      outreachChannel: 'email',
      outreachContext: 'Shared my portfolio and open-source headless component primitive contributions. Emphasized accessible focus traps and sub-millisecond WebAssembly canvas rendering.',
      outreachSentAt: offsetDays(-10),
      delayMs: 20000,
      maxFollowUps: 2,
      status: 'COMPLETED',
      subStatus: null,
      nextActionAt: null,
      workflowId: 'gh-seed-figma-04',
      createdAt: offsetDays(-10),
      updatedAt: offsetDays(-2),
    });

    insertFollowUp.run({
      id: '44444444-4444-4444-8444-000000000001',
      applicationId: app4Id,
      stage: 1,
      subject: 'Re: Senior Design Systems Engineer role / headless accessibility primitives',
      body: 'Hi Marcus,\n\nChecking in on my previous note. I recently published benchmarks comparing our token evaluation pipeline against standard CSS-in-JS runtimes.\n\nBest,\nCandidate',
      source: 'gemma',
      status: 'SENT',
      editedBody: null,
      createdAt: offsetDays(-7),
      decidedAt: offsetDays(-7),
    });

    insertFollowUp.run({
      id: '44444444-4444-4444-8444-000000000002',
      applicationId: app4Id,
      stage: 2,
      subject: 'Re: Figma Design Systems / Final check-in',
      body: 'Hi Marcus,\n\nFollowing up one last time regarding the Design Systems team. If the position is closed or on hold, no worries at all!\n\nBest,\nCandidate',
      source: 'gemma',
      status: 'SENT',
      editedBody: null,
      createdAt: offsetDays(-2),
      decidedAt: offsetDays(-2),
    });

    insertEvent.run({
      id: '44444444-4444-4444-8444-000000000011',
      applicationId: app4Id,
      type: 'CREATED',
      payload: JSON.stringify({ company: 'Figma', role: 'Senior Design Systems Engineer' }),
      at: offsetDays(-10),
    });

    insertEvent.run({
      id: '44444444-4444-4444-8444-000000000012',
      applicationId: app4Id,
      type: 'HUNT_STARTED',
      payload: JSON.stringify({ workflowId: 'gh-seed-figma-04' }),
      at: offsetDays(-9),
    });

    insertEvent.run({
      id: '44444444-4444-4444-8444-000000000013',
      applicationId: app4Id,
      type: 'DRAFT_APPROVED',
      payload: JSON.stringify({ stage: 1, draftId: '44444444-4444-4444-8444-000000000001' }),
      at: offsetDays(-7),
    });

    insertEvent.run({
      id: '44444444-4444-4444-8444-000000000014',
      applicationId: app4Id,
      type: 'DRAFT_APPROVED',
      payload: JSON.stringify({ stage: 2, draftId: '44444444-4444-4444-8444-000000000002' }),
      at: offsetDays(-2),
    });

    insertEvent.run({
      id: '44444444-4444-4444-8444-000000000015',
      applicationId: app4Id,
      type: 'COMPLETED',
      payload: JSON.stringify({ stagesCompleted: 2, reason: 'MAX_STAGES_REACHED' }),
      at: offsetDays(-2),
    });

    insertNotification.run({
      id: '44444444-4444-4444-8444-000000000021',
      applicationId: app4Id,
      kind: 'HUNT_COMPLETED',
      message: 'All 2 follow-up stages completed for Senior Design Systems Engineer at Figma',
      readAt: offsetDays(-2),
      createdAt: offsetDays(-2),
    });

    // -------------------------------------------------------------------------
    // 5. Vercel: CANCELLED (User accepted competing offer)
    // -------------------------------------------------------------------------
    const app5Id = '55555555-5555-4555-8555-555555555555';
    insertApp.run({
      id: app5Id,
      company: 'Vercel',
      role: 'Edge Compute Platform Engineer',
      recruiterName: 'Chloe Zhang',
      recruiterContact: 'chloe@vercel.com',
      outreachChannel: 'email',
      outreachContext: 'Reached out regarding Turbopack rust extensions and Edge Runtime V8 isolate isolation sandboxes.',
      outreachSentAt: offsetDays(-5),
      delayMs: 20000,
      maxFollowUps: 3,
      status: 'CANCELLED',
      subStatus: null,
      nextActionAt: null,
      workflowId: 'gh-seed-vercel-05',
      createdAt: offsetDays(-5),
      updatedAt: offsetDays(-3),
    });

    insertEvent.run({
      id: '55555555-5555-4555-8555-000000000001',
      applicationId: app5Id,
      type: 'CREATED',
      payload: JSON.stringify({ company: 'Vercel', role: 'Edge Compute Platform Engineer' }),
      at: offsetDays(-5),
    });

    insertEvent.run({
      id: '55555555-5555-4555-8555-000000000002',
      applicationId: app5Id,
      type: 'HUNT_STARTED',
      payload: JSON.stringify({ workflowId: 'gh-seed-vercel-05' }),
      at: offsetDays(-4),
    });

    insertEvent.run({
      id: '55555555-5555-4555-8555-000000000003',
      applicationId: app5Id,
      type: 'CANCELLED',
      payload: JSON.stringify({ reason: 'Accepted another offer at competing infrastructure firm', stage: 1 }),
      at: offsetDays(-3),
    });

    insertNotification.run({
      id: '55555555-5555-4555-8555-000000000011',
      applicationId: app5Id,
      kind: 'HUNT_CANCELLED',
      message: 'Cadence cancelled for Edge Compute Platform Engineer at Vercel',
      readAt: offsetDays(-3),
      createdAt: offsetDays(-3),
    });

    // -------------------------------------------------------------------------
    // 6. Netflix: DRAFT (Ready for live demonstration "Arm Sentinel" demo)
    // -------------------------------------------------------------------------
    const app6Id = '66666666-6666-4666-8666-666666666666';
    insertApp.run({
      id: app6Id,
      company: 'Netflix',
      role: 'Senior Streaming Protocols Engineer',
      recruiterName: 'Julian Thorne',
      recruiterContact: 'jthorne@netflix.com',
      outreachChannel: 'email',
      outreachContext: 'Pitched custom QUIC congestion control algorithm tuning for 4K AV1 live streaming under high-jitter wireless cellular connections.',
      outreachSentAt: offsetDays(-1),
      delayMs: 20000, // Pre-configured in 20s Demo Mode
      maxFollowUps: 3,
      status: 'DRAFT',
      subStatus: null,
      nextActionAt: null,
      workflowId: null,
      createdAt: offsetDays(-1),
      updatedAt: offsetDays(-1),
    });

    insertEvent.run({
      id: '66666666-6666-4666-8666-000000000001',
      applicationId: app6Id,
      type: 'CREATED',
      payload: JSON.stringify({ company: 'Netflix', role: 'Senior Streaming Protocols Engineer', channel: 'email' }),
      at: offsetDays(-1),
    });
  });

  seedTransaction();

  const counts = {
    applications: (db.prepare('SELECT count(*) as count FROM applications').get() as { count: number }).count,
    followups: (db.prepare('SELECT count(*) as count FROM followups').get() as { count: number }).count,
    events: (db.prepare('SELECT count(*) as count FROM events').get() as { count: number }).count,
    notifications: (db.prepare('SELECT count(*) as count FROM notifications').get() as { count: number }).count,
  };

  success('SEED', `Database seeded successfully!`);
  console.log(`\n${COLORS.bright}Database Records Summary:${COLORS.reset}`);
  console.log(`  • Applications:  ${counts.applications} (Anthropic, Stripe, Apple, Figma, Vercel, Netflix)`);
  console.log(`  • Follow-Up Drafts: ${counts.followups}`);
  console.log(`  • Audit Events:    ${counts.events}`);
  console.log(`  • Notifications:   ${counts.notifications}`);
  console.log(`\n${COLORS.green}Ready for demo and interactive review workflow!${COLORS.reset}\n`);

  db.close();
}

// Direct execution
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runSeed().catch((err) => {
    console.error('Seed script failed:', err);
    process.exit(1);
  });
}
