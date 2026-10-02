import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const applications = sqliteTable(
  'applications',
  {
    id: text('id').primaryKey(),
    company: text('company').notNull(),
    role: text('role').notNull(),
    recruiterName: text('recruiter_name').notNull(),
    recruiterContact: text('recruiter_contact'),
    outreachChannel: text('outreach_channel').notNull(),
    outreachContext: text('outreach_context').notNull(),
    outreachSentAt: text('outreach_sent_at').notNull(),
    delayMs: integer('delay_ms').notNull(),
    maxFollowUps: integer('max_follow_ups').notNull(),
    status: text('status').notNull().default('DRAFT'),
    subStatus: text('sub_status'),
    nextActionAt: text('next_action_at'),
    workflowId: text('workflow_id').unique(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    statusIdx: index('applications_status_idx').on(table.status),
  })
);

export const followups = sqliteTable(
  'followups',
  {
    id: text('id').primaryKey(),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    stage: integer('stage').notNull(),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    source: text('source').notNull(),
    status: text('status').notNull().default('GENERATING'),
    editedBody: text('edited_body'),
    createdAt: text('created_at').notNull(),
    decidedAt: text('decided_at'),
  },
  (table) => ({
    appIdx: index('followups_application_id_idx').on(table.applicationId),
  })
);

export const events = sqliteTable(
  'events',
  {
    id: text('id').primaryKey(),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    payload: text('payload').notNull(),
    at: text('at').notNull(),
  },
  (table) => ({
    appAtIdx: index('events_application_at_idx').on(table.applicationId, table.at),
  })
);

export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    message: text('message').notNull(),
    readAt: text('read_at'),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    appCreatedIdx: index('notifications_application_created_idx').on(table.applicationId, table.createdAt),
  })
);

export type ApplicationRow = typeof applications.$inferSelect;
export type InsertApplicationRow = typeof applications.$inferInsert;

export type FollowUpRow = typeof followups.$inferSelect;
export type InsertFollowUpRow = typeof followups.$inferInsert;

export type EventRow = typeof events.$inferSelect;
export type InsertEventRow = typeof events.$inferInsert;

export type NotificationRow = typeof notifications.$inferSelect;
export type InsertNotificationRow = typeof notifications.$inferInsert;
