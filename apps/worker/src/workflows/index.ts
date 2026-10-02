import { defineQuery, setHandler, sleep } from '@temporalio/workflow';
import { ApplicationStatus } from '@ghost-hunter/shared';

export const getStateQuery = defineQuery<ApplicationStatus>('getState');

export async function ghostHunterWorkflow(): Promise<void> {
  let status: ApplicationStatus = 'HUNTING';
  setHandler(getStateQuery, () => status);

  await sleep(100);
  status = 'COMPLETED';
}
