import {
  defineQuery,
  defineSignal,
  setHandler,
  condition,
  proxyActivities,
} from '@temporalio/workflow';
import {
  ApplicationStatus,
  SubStatus,
  WorkflowStateResponse,
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
}

const { updateApplicationStatus, persistEvent } = proxyActivities<WorkflowActivities>({
  startToCloseTimeout: '10s',
  retry: {
    initialInterval: '1s',
    maximumAttempts: 5,
    backoffCoefficient: 2,
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

export const recruiterRepliedSignal =
  defineSignal<[RecruiterRepliedSignalPayload | undefined]>('recruiterReplied');
export const cancelHuntSignal =
  defineSignal<[CancelHuntSignalPayload | undefined]>('cancelHunt');

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
  const cadence = input.cadenceSchedule && input.cadenceSchedule.length > 0
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

    // RACE GUARD: Check if reply or cancel signal arrived right as/after timer fired
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
