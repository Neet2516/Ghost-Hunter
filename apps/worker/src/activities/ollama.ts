import { randomUUID } from 'node:crypto';
import { Context } from '@temporalio/activity';
import {
  FollowUpSource,
  ValidationConfigError,
} from '@ghost-hunter/shared';
import { getDatabase } from '../db/connection.js';
import { followups } from '../db/schema.js';
import { persistEvent } from './index.js';
import {
  buildPrompt,
  generateFallbackTemplate,
} from '../ollama/prompt.js';
import {
  OllamaClient,
  ModelHealthResult,
} from '../ollama/client.js';

export interface GenerateFollowUpDraftInput {
  applicationId: string;
  stage: number;
  company: string;
  role: string;
  recruiterName: string;
  outreachContext: string;
  outreachChannel?: string;
  daysSince?: number;
  // Optional testing / override parameters
  maxRetries?: number;
  testAttempt?: number;
  client?: OllamaClient;
}

export interface GenerateFollowUpDraftResult {
  draftId: string;
  stage: number;
  subject: string;
  body: string;
  source: FollowUpSource;
  isDegraded: boolean;
  degradedReason?: string;
}

function getCurrentAttempt(testAttempt?: number): number {
  if (typeof testAttempt === 'number') {
    return testAttempt;
  }
  try {
    return Context.current().info.attempt;
  } catch {
    return 1;
  }
}

/**
 * Temporal Activity: generateFollowUpDraft
 * Generates an AI follow-up draft using local Gemma (Ollama).
 * Handles retries, logs RETRY events, and on exhausted attempts enters DEGRADED
 * status and falls back to a deterministic, high-quality template.
 */
export async function generateFollowUpDraft(
  input: GenerateFollowUpDraftInput
): Promise<GenerateFollowUpDraftResult> {
  // Input validation: non-retryable configuration errors
  if (
    !input.applicationId ||
    !input.company ||
    !input.role ||
    !input.recruiterName ||
    !input.stage ||
    input.stage <= 0
  ) {
    throw new ValidationConfigError(
      'Invalid application configuration: missing required fields or invalid stage'
    );
  }

  const { db } = getDatabase();
  const maxAttempts = input.maxRetries ?? 3;
  const currentAttempt = getCurrentAttempt(input.testAttempt);
  const client = input.client ?? new OllamaClient();

  const prompt = buildPrompt({
    company: input.company,
    role: input.role,
    recruiterName: input.recruiterName,
    outreachContext: input.outreachContext || '',
    stage: input.stage,
    daysSince: input.daysSince,
    outreachChannel: input.outreachChannel,
  });

  try {
    const draft = await client.generateDraft(prompt);

    const draftId = randomUUID();
    const now = new Date().toISOString();

    db.insert(followups)
      .values({
        id: draftId,
        applicationId: input.applicationId,
        stage: input.stage,
        subject: draft.subject,
        body: draft.body,
        source: 'gemma',
        status: 'READY',
        createdAt: now,
      })
      .run();

    await persistEvent({
      applicationId: input.applicationId,
      type: 'DRAFT_READY',
      payload: {
        draftId,
        stage: input.stage,
        source: 'gemma',
        subject: draft.subject,
      },
    });

    return {
      draftId,
      stage: input.stage,
      subject: draft.subject,
      body: draft.body,
      source: 'gemma',
      isDegraded: false,
    };
  } catch (err) {
    const errorMsg = (err as Error).message;

    // If we have remaining retry attempts, record a RETRY event and rethrow to trigger Temporal activity retry
    if (currentAttempt < maxAttempts) {
      await persistEvent({
        applicationId: input.applicationId,
        type: 'RETRY',
        payload: {
          stage: input.stage,
          attempt: currentAttempt,
          maxAttempts,
          error: errorMsg,
        },
      });

      throw err;
    }

    // Retries exhausted -> enter DEGRADED mode, record event, and generate dependable template fallback
    await persistEvent({
      applicationId: input.applicationId,
      type: 'DEGRADED',
      payload: {
        stage: input.stage,
        attempt: currentAttempt,
        reason: errorMsg,
        fallbackUsed: true,
      },
    });

    const fallbackDraft = generateFallbackTemplate({
      company: input.company,
      role: input.role,
      recruiterName: input.recruiterName,
      outreachContext: input.outreachContext || '',
      stage: input.stage,
      daysSince: input.daysSince,
      outreachChannel: input.outreachChannel,
    });

    const draftId = randomUUID();
    const now = new Date().toISOString();

    db.insert(followups)
      .values({
        id: draftId,
        applicationId: input.applicationId,
        stage: input.stage,
        subject: fallbackDraft.subject,
        body: fallbackDraft.body,
        source: 'template',
        status: 'READY',
        createdAt: now,
      })
      .run();

    await persistEvent({
      applicationId: input.applicationId,
      type: 'DRAFT_READY',
      payload: {
        draftId,
        stage: input.stage,
        source: 'template',
        subject: fallbackDraft.subject,
        isDegraded: true,
        degradedReason: errorMsg,
      },
    });

    return {
      draftId,
      stage: input.stage,
      subject: fallbackDraft.subject,
      body: fallbackDraft.body,
      source: 'template',
      isDegraded: true,
      degradedReason: errorMsg,
    };
  }
}

/**
 * Temporal Activity: checkModelHealth
 * Checks if Ollama is running and whether the required Gemma model is downloaded.
 */
export async function checkModelHealth(client?: OllamaClient): Promise<ModelHealthResult> {
  const ollama = client ?? new OllamaClient();
  return await ollama.checkHealth();
}
