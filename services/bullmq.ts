import { Queue } from 'bullmq';
import redis from '../config/redis.js';

export const sonarQueue = new Queue('sonar', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

export const addNotificationJob = (name: string, data: Record<string, unknown>) =>
  sonarQueue.add(name, data);

export const addUploadJob = (name: string, data: Record<string, unknown>) =>
  sonarQueue.add(name, data);
