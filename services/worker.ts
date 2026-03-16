import { Worker, Job } from 'bullmq';
import redis from '../config/redis.js';
import { dispatch, DispatchParams } from './notificationService.js';

const notifyHandler = (data: Record<string, unknown>) => dispatch(data as unknown as DispatchParams);

const handlers: Record<string, (data: Record<string, unknown>) => unknown> = {
  notifyReaction:       notifyHandler,
  notifyNewFollower:    notifyHandler,
  notifyUploadComplete: notifyHandler,
  notifyLogin:          notifyHandler,
  notifyNewPost:        notifyHandler,
};

export const startWorker = (): Worker => {
  const worker = new Worker('sonar', async (job: Job) => {
    return handlers[job.name]?.(job.data as Record<string, unknown>);
  }, { connection: redis });

  worker.on('completed', (job: Job) => console.log(`${job.name} ${job.id} completed`));
  worker.on('failed', (job: Job | undefined, err: Error) => console.error(`${job?.name} ${job?.id} failed:`, err.message));

  return worker;
};
