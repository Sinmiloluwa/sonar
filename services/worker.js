import { Worker } from 'bullmq';
import redis from '../config/redis.js';
import { dispatch } from './notificationService.js';

const notifyHandler = (data) => dispatch(data);

const handlers = {
  notifyReaction:        notifyHandler,
  notifyNewFollower:     notifyHandler,
  notifyUploadComplete:  notifyHandler,
  notifyLogin:           notifyHandler,
  notifyNewPost:         notifyHandler,
  upload:                (data) => processUpload(data),
};

export const startWorker = () => {
  const worker = new Worker('sonar', async (job) => {
    return handlers[job.name]?.(job.data);
  }, { connection: redis });

  worker.on('completed', (job) => console.log(`${job.name} ${job.id} completed`));
  worker.on('failed', (job, err) => console.error(`${job.name} ${job.id} failed:`, err.message));

  return worker;
};
