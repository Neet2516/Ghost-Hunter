import { eq, desc, and, inArray, isNull } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import {
  applications,
  followups,
  events,
  notifications,
  ApplicationRow,
  InsertApplicationRow,
  FollowUpRow,
  InsertFollowUpRow,
  EventRow,
  InsertEventRow,
  NotificationRow,
  InsertNotificationRow,
} from './schema.js';
import { AppDatabase } from './connection.js';
import {
  ApplicationStatus,
  EventType,
  NotificationKind,
  CreateApplicationInput,
} from '@ghost-hunter/shared';

export class DatabaseRepository {
  constructor(private db: AppDatabase) {}

  // --- Applications ---

  async createApplication(input: CreateApplicationInput & { id?: string }): Promise<ApplicationRow> {
    const now = new Date().toISOString();
    const id = input.id || randomUUID();

    const newRow: InsertApplicationRow = {
      id,
      company: input.company,
      role: input.role,
      recruiterName: input.recruiterName,
      recruiterContact: input.recruiterContact || null,
      outreachChannel: input.outreachChannel,
      outreachContext: input.outreachContext,
      outreachSentAt: input.outreachSentAt || now,
      delayMs: input.delayMs,
      maxFollowUps: input.maxFollowUps,
      status: 'DRAFT',
      subStatus: null,
      nextActionAt: null,
      workflowId: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(applications).values(newRow);

    // Automatically record CREATED event
    await this.logEvent(id, 'CREATED', {
      company: input.company,
      role: input.role,
      channel: input.outreachChannel,
    });

    const created = await this.getApplicationById(id);
    if (!created) {
      throw new Error(`Failed to retrieve newly created application ${id}`);
    }
    return created;
  }

  async getApplicationById(id: string): Promise<ApplicationRow | undefined> {
    const rows = await this.db
      .select()
      .from(applications)
      .where(eq(applications.id, id))
      .limit(1);
    return rows[0];
  }

  async listApplications(options?: { status?: ApplicationStatus }): Promise<ApplicationRow[]> {
    if (options?.status) {
      return this.db
        .select()
        .from(applications)
        .where(eq(applications.status, options.status))
        .orderBy(desc(applications.updatedAt));
    }
    return this.db
      .select()
      .from(applications)
      .orderBy(desc(applications.updatedAt));
  }

  async updateApplication(id: string, updates: Partial<InsertApplicationRow>): Promise<ApplicationRow | undefined> {
    const now = new Date().toISOString();
    await this.db
      .update(applications)
      .set({
        ...updates,
        updatedAt: now,
      })
      .where(eq(applications.id, id));

    return this.getApplicationById(id);
  }

  async deleteApplication(id: string): Promise<boolean> {
    const result = await this.db.delete(applications).where(eq(applications.id, id));
    return result.changes > 0;
  }

  // --- Follow-ups ---

  async createFollowUp(input: Omit<InsertFollowUpRow, 'id' | 'createdAt'> & { id?: string }): Promise<FollowUpRow> {
    const now = new Date().toISOString();
    const id = input.id || randomUUID();

    const row: InsertFollowUpRow = {
      ...input,
      id,
      createdAt: now,
    };

    await this.db.insert(followups).values(row);

    const created = await this.getFollowUpById(id);
    if (!created) {
      throw new Error(`Failed to retrieve created follow-up ${id}`);
    }
    return created;
  }

  async getFollowUpById(id: string): Promise<FollowUpRow | undefined> {
    const rows = await this.db.select().from(followups).where(eq(followups.id, id)).limit(1);
    return rows[0];
  }

  async getFollowUpsByApplicationId(applicationId: string): Promise<FollowUpRow[]> {
    return this.db
      .select()
      .from(followups)
      .where(eq(followups.applicationId, applicationId))
      .orderBy(desc(followups.stage));
  }

  async updateFollowUp(id: string, updates: Partial<InsertFollowUpRow>): Promise<FollowUpRow | undefined> {
    await this.db.update(followups).set(updates).where(eq(followups.id, id));
    return this.getFollowUpById(id);
  }

  // --- Events ---

  async logEvent(
    applicationId: string,
    type: EventType,
    payload: Record<string, unknown> = {}
  ): Promise<EventRow> {
    const now = new Date().toISOString();
    const id = randomUUID();

    const row: InsertEventRow = {
      id,
      applicationId,
      type,
      payload: JSON.stringify(payload),
      at: now,
    };

    await this.db.insert(events).values(row);
    const logged = await this.db.select().from(events).where(eq(events.id, id)).limit(1);
    return logged[0]!;
  }

  async getEventsByApplicationId(applicationId: string): Promise<EventRow[]> {
    return this.db
      .select()
      .from(events)
      .where(eq(events.applicationId, applicationId))
      .orderBy(events.at);
  }

  // --- Notifications ---

  async createNotification(
    applicationId: string,
    kind: NotificationKind,
    message: string,
    createdAt?: string
  ): Promise<NotificationRow> {
    const now = createdAt || new Date().toISOString();
    const id = randomUUID();

    const row: InsertNotificationRow = {
      id,
      applicationId,
      kind,
      message,
      readAt: null,
      createdAt: now,
    };

    await this.db.insert(notifications).values(row);
    const created = await this.db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
    return created[0]!;
  }

  async listNotifications(options?: { unreadOnly?: boolean }): Promise<NotificationRow[]> {
    if (options?.unreadOnly) {
      return this.db
        .select()
        .from(notifications)
        .where(isNull(notifications.readAt))
        .orderBy(desc(notifications.createdAt));
    }
    return this.db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async markNotificationsAsRead(ids?: string[], all?: boolean): Promise<number> {
    const now = new Date().toISOString();
    if (all) {
      const res = await this.db
        .update(notifications)
        .set({ readAt: now })
        .where(isNull(notifications.readAt));
      return res.changes;
    }

    if (ids && ids.length > 0) {
      const res = await this.db
        .update(notifications)
        .set({ readAt: now })
        .where(inArray(notifications.id, ids));
      return res.changes;
    }

    return 0;
  }
}
