import { Worker } from "bullmq";
import { Types } from "mongoose";
import { env } from "../config/env.js";
import { connectMongo } from "../db/mongoose.js";
import { Generation } from "../models/Generation.js";
import { deleteImage, uploadImageBuffer } from "../services/cloudinary.service.js";
import { generateImageWithHuggingFace } from "../services/huggingface.service.js";
import { refundCredits } from "../services/credit.service.js";
import { bullmqConnection, redisConnection, type GenerationJobData } from "./generation.queue.js";

await connectMongo();

const worker = new Worker<GenerationJobData>("generation", async (job) => {
  const generationId = new Types.ObjectId(job.data.generationId);
  const generation = await Generation.findOneAndUpdate({ _id: generationId, status: "queued" }, { status: "processing", startedAt: new Date() }, { new: true });
  if (!generation) return;

  let publicId: string | undefined;
  try {
    const generated = await generateImageWithHuggingFace({
      prompt: job.data.prompt,
      negativePrompt: job.data.negativePrompt,
      model: job.data.model,
      aspectRatio: job.data.aspectRatio as never,
      seed: job.data.seed,
      cfg: job.data.cfg,
      timeoutMs: env.GENERATION_JOB_TIMEOUT_MS,
    });
    const uploaded = await uploadImageBuffer(generated.buffer, `zenivra/generations/${job.data.userId}`);
    publicId = uploaded.public_id;
    await Generation.updateOne({ _id: generationId }, { status: "completed", imageUrl: uploaded.secure_url, cloudinaryPublicId: uploaded.public_id, completedAt: new Date() });
  } catch (error) {
    if (publicId) await deleteImage(publicId);
    const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
    if (!isFinalAttempt) {
      await Generation.updateOne({ _id: generationId }, { status: "queued", startedAt: null });
      throw error;
    }
    await Generation.updateOne({ _id: generationId }, { status: "failed", failureReason: error instanceof Error ? error.message.slice(0, 500) : "Generation failed", completedAt: new Date() });
    await refundCredits({ userId: new Types.ObjectId(job.data.userId), amount: generation.creditsSpent, generationId });
    throw error;
  }
}, { connection: bullmqConnection, concurrency: 4, lockDuration: env.GENERATION_JOB_TIMEOUT_MS + 30_000 });

worker.on("failed", (job, error) => console.error(JSON.stringify({ event: "generation_job_failed", jobId: job?.id, error: error.message })));
worker.on("error", (error) => console.error(JSON.stringify({ event: "generation_worker_error", error: error.message })));

const shutdown = async () => { await worker.close(); await redisConnection.quit(); process.exit(0); };
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
