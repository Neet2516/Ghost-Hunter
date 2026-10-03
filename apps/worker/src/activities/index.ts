import { eq } from 'drizzle-orm';
import { ApplicationStatus, SubStatus, FollowUpStatus } from '@ghost-hunter/shared';
import { getDatabase } from '../db/connection.js';
import { applications, events, notifications, followups } from '../db/schema.js';
import { randomUUID } from 'node:crypto';

export interface UpdateApplicationStatusInput {
  applicationId: string;
  status: ApplicationStatus;
  subStatus?: SubStatus | null;
  nextActionAt?: string | null;
}

export async function updateApplicationStatus(
  input: UpdateApplicationStatusInput
): Promise<void> {
  const { db } = getDatabase();
  const now = new Date().toISOString();

  db.update(applications)
    .set({
      status: input.status,
      subStatus: input.subStatus ?? null,
      nextActionAt: input.nextActionAt ?? null,
      updatedAt: now,
    })
    .where(eq(applications.id, input.applicationId))
    .run();
}

export interface PersistEventInput {
  applicationId: string;
  type: string;
  payload: Record<string, unknown>;
}

export async function persistEvent(input: PersistEventInput): Promise<{ id: string }> {
  const { db } = getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.insert(events)
    .values({
      id,
      applicationId: input.applicationId,
      type: input.type,
      payload: JSON.stringify(input.payload),
      at: now,
    })
    .run();

  return { id };
}

export interface NotifyUserInput {
  applicationId: string;
  title: string;
  message: string;
}

export async function notifyUser(input: NotifyUserInput): Promise<{ id: string }> {
  const { db } = getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.insert(notifications)
    .values({
      id,
      applicationId: input.applicationId,
      title: input.title,
      message: input.message,
      read: false,
      createdAt: now,
    })
    .run();

  return { id };
}

export interface UpdateFollowUpInput {
  followUpId: string;
  status: FollowUpStatus;
  editedBody?: string | null;
  decidedAt?: string | null;
}

export async function updateFollowUp(input: UpdateFollowUpInput): Promise<void> {
  const { db } = getDatabase();
  const now = new Date().toISOString();

  db.update(followups)
    .set({
      status: input.status,
      editedBody: input.editedBody ?? null,
      decidedAt: input.decidedAt ?? now,
    })
    .where(eq(followups.id, input.followUpId))
    .run();
}

export * from './ollama.js';
