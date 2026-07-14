import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { corsOptions } from "./config/cors.js";
import { authRouter } from "./routes/auth.routes.js";
import { creditRouter, dashboardRouter } from "./routes/credit.routes.js";
import { generationRouter } from "./routes/generation.routes.js";
import { profileRouter } from "./routes/profile.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { randomUUID } from "node:crypto";
import { redisConnection } from "./queue/generation.queue.js";
import mongoose from "mongoose";

export const app = express();

app.use((req, res, next) => {
  const requestId = req.get("x-request-id") || randomUUID();
  res.setHeader("x-request-id", requestId);
  const startedAt = Date.now();
  res.on("finish", () => console.log(JSON.stringify({ event: "http_request", requestId, method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - startedAt })));
  next();
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "256kb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/ready", async (_req, res) => {
  try {
    await redisConnection.ping();
    res.json({ ok: true, mongo: mongoose.connection.readyState === 1, redis: true });
  } catch {
    res.status(503).json({ ok: false, mongo: mongoose.connection.readyState === 1, redis: false });
  }
});
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/generations", generationRouter);
app.use("/api/credits", creditRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);
