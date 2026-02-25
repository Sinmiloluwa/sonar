import { Queue } from 'bullmq';
import redis from '../config/redis.js';

export const sonarQueue = new Queue('sonar', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});


export const addNotificationJob = (name, data) =>
  sonarQueue.add(name, data);

export const addUploadJob = (name, data) =>
  sonarQueue.add(name, data);


