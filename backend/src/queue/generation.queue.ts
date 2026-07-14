import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { env } from "../config/env.js";

export type GenerationJobData = {
  generationId: string;
  userId: string;
  prompt: string;
  negativePrompt?: string | null;
  model: string;
  aspectRatio: string;
  seed?: number | null;
  cfg?: number | null;
};

export const redisConnection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false });
export const bullmqConnection = (() => {
  const url = new URL(env.REDIS_URL);
  return { host: url.hostname, port: Number(url.port || 6379), password: url.password || undefined, db: Number(url.pathname.slice(1) || 0) };
})();
export const generationQueue = new Queue<GenerationJobData>("generation", {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5_000 },
    removeOnComplete: { age: 86_400, count: 10_000 },
    removeOnFail: { age: 604_800, count: 10_000 },
  },
});
