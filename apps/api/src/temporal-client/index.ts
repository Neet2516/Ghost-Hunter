import { Connection, Client, WorkflowExecutionAlreadyStartedError } from '@temporalio/client';
import { GHOST_HUNTER_TASK_QUEUE, WorkflowStateResponse } from '@ghost-hunter/shared';

export interface TemporalConfig {
  address?: string;
  namespace?: string;
  taskQueue?: string;
}

let clientInstance: Client | null = null;
let connectionInstance: Connection | null = null;

export function getTemporalConfig(): Required<TemporalConfig> {
  return {
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    taskQueue: process.env.TASK_QUEUE || GHOST_HUNTER_TASK_QUEUE,
  };
}

export async function getTemporalConnection(): Promise<Connection> {
  if (connectionInstance) {
    return connectionInstance;
  }
  const config = getTemporalConfig();
  connectionInstance = await Connection.connect({
    address: config.address,
  });
  return connectionInstance;
}

export async function getTemporalClient(customClient?: Client): Promise<Client> {
  if (customClient) {
    clientInstance = customClient;
    return clientInstance;
  }
  if (clientInstance) {
    return clientInstance;
  }
  const connection = await getTemporalConnection();
  const config = getTemporalConfig();
  clientInstance = new Client({
    connection,
    namespace: config.namespace,
  });
  return clientInstance;
}

export function setTemporalClient(client: Client | null): void {
  clientInstance = client;
}

export function getWorkflowId(applicationId: string): string {
  return `gh-${applicationId}`;
}

export class TemporalServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 503,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'TemporalServiceError';
  }
}

export class WorkflowConflictError extends Error {
  constructor(message: string, public applicationId: string) {
    super(message);
    this.name = 'WorkflowConflictError';
  }
}

export async function startGhostHunterWorkflow(params: {
  applicationId: string;
  company: string;
  role: string;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  cadenceSchedule?: number[];
  maxFollowUps?: number;
  outreachContext?: string | null;
  isDemoMode?: boolean;
  customClient?: Client;
}): Promise<{ workflowId: string; runId: string }> {
  try {
    const client = await getTemporalClient(params.customClient);
    const config = getTemporalConfig();
    const workflowId = getWorkflowId(params.applicationId);

    const handle = await client.workflow.start('ghostHunterWorkflow', {
      taskQueue: config.taskQueue,
      workflowId,
      args: [
        {
          applicationId: params.applicationId,
          company: params.company,
          role: params.role,
          recruiterName: params.recruiterName || undefined,
          recruiterEmail: params.recruiterEmail || undefined,
          cadenceSchedule: params.cadenceSchedule || [3, 7, 14],
          maxFollowUps: params.maxFollowUps || 3,
          outreachContext: params.outreachContext || undefined,
          isDemoMode: params.isDemoMode,
        },
      ],
    });

    return {
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId || '',
    };
  } catch (err: unknown) {
    if (err instanceof WorkflowExecutionAlreadyStartedError) {
      throw new WorkflowConflictError(
        `Workflow for application ${params.applicationId} is already running`,
        params.applicationId
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new TemporalServiceError(
      `Failed to start Temporal workflow: ${message}`,
      503,
      err
    );
  }
}

export async function signalRecruiterReplied(
  applicationId: string,
  payload?: Record<string, unknown>,
  customClient?: Client
): Promise<void> {
  try {
    const client = await getTemporalClient(customClient);
    const handle = client.workflow.getHandle(getWorkflowId(applicationId));
    await handle.signal('recruiterReplied', payload || {});
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new TemporalServiceError(
      `Failed to signal recruiterReplied: ${message}`,
      503,
      err
    );
  }
}

export async function signalCancelHunt(
  applicationId: string,
  reason: string = 'User requested cancellation',
  customClient?: Client
): Promise<void> {
  try {
    const client = await getTemporalClient(customClient);
    const handle = client.workflow.getHandle(getWorkflowId(applicationId));
    await handle.signal('cancelHunt', { reason });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new TemporalServiceError(
      `Failed to signal cancelHunt: ${message}`,
      503,
      err
    );
  }
}

export async function signalDraftDecision(
  applicationId: string,
  decision: {
    action: 'approve' | 'skip' | 'snooze';
    editedBody?: string;
    snoozeDurationMs?: number;
  },
  customClient?: Client
): Promise<void> {
  try {
    const client = await getTemporalClient(customClient);
    const handle = client.workflow.getHandle(getWorkflowId(applicationId));
    await handle.signal('draftDecision', decision);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new TemporalServiceError(
      `Failed to signal draftDecision: ${message}`,
      503,
      err
    );
  }
}

export async function queryWorkflowState(
  applicationId: string,
  customClient?: Client
): Promise<WorkflowStateResponse> {
  try {
    const client = await getTemporalClient(customClient);
    const handle = client.workflow.getHandle(getWorkflowId(applicationId));
    const state = await handle.query<WorkflowStateResponse>('getState');
    return state;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new TemporalServiceError(
      `Failed to query workflow state: ${message}`,
      503,
      err
    );
  }
}
