import {
  defineQuery,
  defineSignal,
  setHandler,
  condition,
  proxyActivities,
  log,
} from '@temporalio/workflow';
import {
  ApplicationStatus,
  SubStatus,
  FollowUpStatus,
  FollowUpSource,
  FollowUpDecisionAction,
  WorkflowStateResponse,
  DEFAULT_REVIEW_TIMEOUT_MS,
} from '@ghost-hunter/shared';

export interface WorkflowActivities {
  updateApplicationStatus(input: {
    applicationId: string;
    status: ApplicationStatus;
    subStatus?: SubStatus | null;
    nextActionAt?: string | null;
  }): Promise<void>;

  persistEvent(input: {
    applicationId: string;
    type: string;
    payload: Record<string, unknown>;
  }): Promise<{ id: string }>;

  notifyUser(input: {
    applicationId: string;
    title: string;
    message: string;
  }): Promise<{ id: string }>;

  generateFollowUpDraft(input: {
    applicationId: string;
    stage: number;
    company: string;
    role: string;
    recruiterName: string;
    outreachContext: string;
    outreachChannel?: string;
    daysSince?: number;
  }): Promise<{
    draftId: string;
    stage: number;
    subject: string;
    body: string;
    source: FollowUpSource;
    isDegraded: boolean;
    degradedReason?: string;
  }>;

  updateFollowUp(input: {
    followUpId: string;
    status: FollowUpStatus;
    editedBody?: string | null;
    decidedAt?: string | null;
  }): Promise<void>;
}

const {
  updateApplicationStatus,
  persistEvent,
  notifyUser,
  updateFollowUp,
} = proxyActivities<WorkflowActivities>({
  startToCloseTimeout: '10s',
  retry: {
    initialInterval: '1s',
    maximumAttempts: 5,
    backoffCoefficient: 2,
  },
});

const { generateFollowUpDraft } = proxyActivities<WorkflowActivities>({
  startToCloseTimeout: '90s',
  retry: {
    initialInterval: '2s',
    maximumAttempts: 3,
    backoffCoefficient: 2,
    nonRetryableErrorTypes: ['ValidationConfigError'],
  },
});

export const getStateQuery = defineQuery<WorkflowStateResponse>('getState');

export interface RecruiterRepliedSignalPayload {
  note?: string;
  repliedAt?: string;
}

export interface CancelHuntSignalPayload {
  reason?: string;
}

export interface DraftDecisionSignalPayload {
  action: FollowUpDecisionAction;
  editedBody?: string;
  snoozeDurationMs?: number;
}

export const recruiterRepliedSignal =
  defineSignal<[RecruiterRepliedSignalPayload | undefined]>('recruiterReplied');
export const cancelHuntSignal =
  defineSignal<[CancelHuntSignalPayload | undefined]>('cancelHunt');
export const draftDecisionSignal =
  defineSignal<[DraftDecisionSignalPayload]>('draftDecision');

export interface GhostHunterWorkflowInput {
  applicationId: string;
  company: string;
  role: string;
  recruiterName?: string;
  recruiterEmail?: string;
  cadenceSchedule?: number[];
  maxFollowUps?: number;
  outreachContext?: string;
  reviewTimeoutMs?: number;
  isDemoMode?: boolean;
}

function getDelayMs(cadenceValue: number, isDemoMode?: boolean): number {
  if (isDemoMode) {
    return cadenceValue * 1000;
  }
  if (cadenceValue < 100) {
    return cadenceValue * 24 * 60 * 60 * 1000;
  }
  return cadenceValue;
}

export async function ghostHunterWorkflow(
  input: GhostHunterWorkflowInput
): Promise<ApplicationStatus> {
  const maxStages = input.maxFollowUps || 3;
  const cadence =
    input.cadenceSchedule && input.cadenceSchedule.length > 0
      ? input.cadenceSchedule
      : [3, 7, 14];

  let currentStatus: ApplicationStatus = 'HUNTING';
  let currentSubStatus: SubStatus | null = 'WAITING';
  let currentStage = 1;
  let nextActionAt: string | null = null;
  let draftId: string | null = null;
  let repliedAt: string | null = null;

  // Signal state
  let isReplied = false;
  let replyNote: string | undefined = undefined;
  let isCancelled = false;
  let cancelReason: string = 'User cancelled hunt';

  let hasDecision = false;
  let latestDecision: DraftDecisionSignalPayload | null = null;

  setHandler(getStateQuery, (): WorkflowStateResponse => ({
    workflowId: `gh-${input.applicationId}`,
    status: currentStatus,
    subStatus: currentSubStatus,
    stage: currentStage,
    nextActionAt,
    draftId,
    repliedAt,
  }));

  setHandler(recruiterRepliedSignal, (payload) => {
    isReplied = true;
    if (payload?.note) {
      replyNote = payload.note;
    }
    repliedAt = payload?.repliedAt || new Date().toISOString();
  });

  setHandler(cancelHuntSignal, (payload) => {
    isCancelled = true;
    if (payload?.reason) {
      cancelReason = payload.reason;
    }
  });

  setHandler(draftDecisionSignal, (payload) => {
    latestDecision = payload;
    hasDecision = true;
  });

  // Initial persist
  await updateApplicationStatus({
    applicationId: input.applicationId,
    status: 'HUNTING',
    subStatus: 'WAITING',
  });

  await persistEvent({
    applicationId: input.applicationId,
    type: 'WORKFLOW_STARTED',
    payload: {
      maxFollowUps: maxStages,
      cadence,
      company: input.company,
      role: input.role,
    },
  });

  for (let stage = 1; stage <= maxStages; stage++) {
    currentStage = stage;
    currentSubStatus = 'WAITING';

    const rawCadenceVal = cadence[stage - 1] ?? cadence[cadence.length - 1];
    const delayDuration = getDelayMs(rawCadenceVal, input.isDemoMode);
    nextActionAt = new Date(Date.now() + delayDuration).toISOString();

    await updateApplicationStatus({
      applicationId: input.applicationId,
      status: 'HUNTING',
      subStatus: 'WAITING',
      nextActionAt,
    });

    await persistEvent({
      applicationId: input.applicationId,
      type: 'STAGE_WAIT_STARTED',
      payload: { stage, delayDurationMs: delayDuration, nextActionAt },
    });

    // Durable wait for cadence delay or until interrupted by signal
    await condition(() => isReplied || isCancelled, delayDuration);

    // Check if interrupted by recruiter reply
    if (isReplied) {
      currentStatus = 'REPLIED';
      currentSubStatus = null;
      nextActionAt = null;

      await updateApplicationStatus({
        applicationId: input.applicationId,
        status: 'REPLIED',
        subStatus: null,
        nextActionAt: null,
      });

      await persistEvent({
        applicationId: input.applicationId,
        type: 'RECRUITER_REPLIED',
        payload: {
          stage,
          repliedAt,
          note: replyNote,
        },
      });

      return 'REPLIED';
    }

    // Check if interrupted by cancellation
    if (isCancelled) {
      currentStatus = 'CANCELLED';
      currentSubStatus = null;
      nextActionAt = null;

      await updateApplicationStatus({
        applicationId: input.applicationId,
        status: 'CANCELLED',
        subStatus: null,
        nextActionAt: null,
      });

      await persistEvent({
        applicationId: input.applicationId,
        type: 'HUNT_CANCELLED',
        payload: {
          stage,
          reason: cancelReason,
        },
      });

      return 'CANCELLED';
    }

    // Timer elapsed without interruption
    currentSubStatus = 'GENERATING';
    nextActionAt = null;

    await updateApplicationStatus({
      applicationId: input.applicationId,
      status: 'HUNTING',
      subStatus: 'GENERATING',
      nextActionAt: null,
    });

    await persistEvent({
      applicationId: input.applicationId,
      type: 'STAGE_TIMER_FIRED',
      payload: { stage },
    });

    // RACE GUARD 1: Check if reply or cancel signal arrived right as timer fired
    if (isReplied) {
      currentStatus = 'REPLIED';
      currentSubStatus = null;

      await updateApplicationStatus({
        applicationId: input.applicationId,
        status: 'REPLIED',
        subStatus: null,
        nextActionAt: null,
      });

      await persistEvent({
        applicationId: input.applicationId,
        type: 'RECRUITER_REPLIED',
        payload: {
          stage,
          draftDiscarded: true,
          reason: 'DISCARDED_REPLY',
          repliedAt,
        },
      });

      return 'REPLIED';
    }

    if (isCancelled) {
      currentStatus = 'CANCELLED';
      currentSubStatus = null;

      await updateApplicationStatus({
        applicationId: input.applicationId,
        status: 'CANCELLED',
        subStatus: null,
        nextActionAt: null,
      });

      await persistEvent({
        applicationId: input.applicationId,
        type: 'HUNT_CANCELLED',
        payload: {
          stage,
          draftDiscarded: true,
          reason: cancelReason,
        },
      });

      return 'CANCELLED';
    }

    // Call generateFollowUpDraft activity
    const daysSince = cadence.slice(0, stage).reduce((sum, d) => sum + d, 0);
    const draftResult = await generateFollowUpDraft({
      applicationId: input.applicationId,
      stage,
      company: input.company,
      role: input.role,
      recruiterName: input.recruiterName || 'Hiring Team',
      outreachContext: input.outreachContext || '',
      daysSince,
    });

    draftId = draftResult.draftId;

    // RACE GUARD 2: Check if reply or cancel signal arrived during draft generation
    if (isReplied) {
      if (draftId) {
        await updateFollowUp({
          followUpId: draftId,
          status: 'DISCARDED_REPLY',
        });
      }

      currentStatus = 'REPLIED';
      currentSubStatus = null;
      nextActionAt = null;

      await updateApplicationStatus({
        applicationId: input.applicationId,
        status: 'REPLIED',
        subStatus: null,
        nextActionAt: null,
      });

      await persistEvent({
        applicationId: input.applicationId,
        type: 'RECRUITER_REPLIED',
        payload: {
          stage,
          draftId,
          draftDiscarded: true,
          reason: 'DISCARDED_REPLY',
          repliedAt,
        },
      });

      return 'REPLIED';
    }

    if (isCancelled) {
      if (draftId) {
        await updateFollowUp({
          followUpId: draftId,
          status: 'DISCARDED_REPLY',
        });
      }

      currentStatus = 'CANCELLED';
      currentSubStatus = null;
      nextActionAt = null;

      await updateApplicationStatus({
        applicationId: input.applicationId,
        status: 'CANCELLED',
        subStatus: null,
        nextActionAt: null,
      });

      await persistEvent({
        applicationId: input.applicationId,
        type: 'HUNT_CANCELLED',
        payload: {
          stage,
          draftId,
          draftDiscarded: true,
          reason: cancelReason,
        },
      });

      return 'CANCELLED';
    }

    // HUMAN REVIEW GATE (FR-007):
    currentSubStatus = 'AWAITING_REVIEW';
    const reviewTimeout =
      input.reviewTimeoutMs ||
      (input.isDemoMode ? 20 * 1000 : DEFAULT_REVIEW_TIMEOUT_MS);
    nextActionAt = new Date(Date.now() + reviewTimeout).toISOString();

    await updateApplicationStatus({
      applicationId: input.applicationId,
      status: 'HUNTING',
      subStatus: 'AWAITING_REVIEW',
      nextActionAt,
    });

    try {
      await notifyUser({
        applicationId: input.applicationId,
        title: 'Follow-Up Draft Ready',
        message: `Follow-up draft ready for ${input.role} at ${input.company} (Stage ${stage})`,
      });
    } catch (err: unknown) {
      log.warn(`notifyUser failed (non-fatal, continuing workflow): ${err}`);
    }

    let reviewResolved = false;
    while (!reviewResolved) {
      await condition(
        () => hasDecision || isReplied || isCancelled,
        reviewTimeout
      );

      // Check if interrupted by recruiter reply
      if (isReplied) {
        if (draftId) {
          await updateFollowUp({
            followUpId: draftId,
            status: 'DISCARDED_REPLY',
          });
        }

        currentStatus = 'REPLIED';
        currentSubStatus = null;
        nextActionAt = null;

        await updateApplicationStatus({
          applicationId: input.applicationId,
          status: 'REPLIED',
          subStatus: null,
          nextActionAt: null,
        });

        await persistEvent({
          applicationId: input.applicationId,
          type: 'RECRUITER_REPLIED',
          payload: {
            stage,
            draftId,
            draftDiscarded: true,
            repliedAt,
          },
        });

        return 'REPLIED';
      }

      // Check if interrupted by cancellation
      if (isCancelled) {
        if (draftId) {
          await updateFollowUp({
            followUpId: draftId,
            status: 'DISCARDED_REPLY',
          });
        }

        currentStatus = 'CANCELLED';
        currentSubStatus = null;
        nextActionAt = null;

        await updateApplicationStatus({
          applicationId: input.applicationId,
          status: 'CANCELLED',
          subStatus: null,
          nextActionAt: null,
        });

        await persistEvent({
          applicationId: input.applicationId,
          type: 'HUNT_CANCELLED',
          payload: {
            stage,
            draftId,
            draftDiscarded: true,
            reason: cancelReason,
          },
        });

        return 'CANCELLED';
      }

      // Handle user decision
      if (hasDecision && latestDecision) {
        const decision = latestDecision as DraftDecisionSignalPayload;

        if (decision.action === 'approve') {
          if (draftId) {
            await updateFollowUp({
              followUpId: draftId,
              status: 'SENT',
              editedBody: decision.editedBody,
            });
          }

          await persistEvent({
            applicationId: input.applicationId,
            type: 'DRAFT_APPROVED',
            payload: {
              stage,
              draftId,
              edited: !!decision.editedBody,
            },
          });

          hasDecision = false;
          latestDecision = null;
          reviewResolved = true;
        } else if (decision.action === 'skip') {
          if (draftId) {
            await updateFollowUp({
              followUpId: draftId,
              status: 'SKIPPED',
            });
          }

          await persistEvent({
            applicationId: input.applicationId,
            type: 'DRAFT_SKIPPED',
            payload: {
              stage,
              draftId,
              reason: 'user_skipped',
            },
          });

          hasDecision = false;
          latestDecision = null;
          reviewResolved = true;
        } else if (decision.action === 'snooze') {
          const snoozeMs =
            decision.snoozeDurationMs ||
            (input.isDemoMode ? 10 * 1000 : 24 * 60 * 60 * 1000);

          if (draftId) {
            await updateFollowUp({
              followUpId: draftId,
              status: 'SNOOZED',
            });
          }

          await persistEvent({
            applicationId: input.applicationId,
            type: 'RETRY',
            payload: {
              stage,
              draftId,
              action: 'snooze',
              snoozeDurationMs: snoozeMs,
            },
          });

          hasDecision = false;
          latestDecision = null;

          nextActionAt = new Date(Date.now() + snoozeMs).toISOString();

          await updateApplicationStatus({
            applicationId: input.applicationId,
            status: 'HUNTING',
            subStatus: 'AWAITING_REVIEW',
            nextActionAt,
          });

          // Wait for snooze duration or signal
          await condition(() => isReplied || isCancelled, snoozeMs);

          if (isReplied || isCancelled) {
            continue;
          }

          // Snooze expired, re-enter review condition
          nextActionAt = new Date(Date.now() + reviewTimeout).toISOString();
          await updateApplicationStatus({
            applicationId: input.applicationId,
            status: 'HUNTING',
            subStatus: 'AWAITING_REVIEW',
            nextActionAt,
          });
        }
      } else {
        // Review timeout expired without user decision -> auto-skip per FR-011
        if (draftId) {
          await updateFollowUp({
            followUpId: draftId,
            status: 'SKIPPED',
          });
        }

        await persistEvent({
          applicationId: input.applicationId,
          type: 'DRAFT_SKIPPED',
          payload: {
            stage,
            draftId,
            reason: 'review_timeout',
          },
        });

        hasDecision = false;
        latestDecision = null;
        reviewResolved = true;
      }
    }

    draftId = null;
  }

  // All follow-up stages completed without recruiter response
  currentStatus = 'COMPLETED';
  currentSubStatus = null;
  nextActionAt = null;

  await updateApplicationStatus({
    applicationId: input.applicationId,
    status: 'COMPLETED',
    subStatus: null,
    nextActionAt: null,
  });

  await persistEvent({
    applicationId: input.applicationId,
    type: 'WORKFLOW_COMPLETED',
    payload: { totalStages: maxStages },
  });

  return 'COMPLETED';
}
