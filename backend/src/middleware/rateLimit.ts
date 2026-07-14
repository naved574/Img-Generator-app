import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisConnection } from "../queue/generation.queue.js";

const store = new RedisStore({ sendCommand: (...args: string[]) => (redisConnection.call as (...command: string[]) => Promise<number>)(...args) });

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: true,
  legacyHeaders: false,
  store,
});

export const generationRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store,
});

export const pollingRateLimit = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false, store });
