import { Router } from "express";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { generationRateLimit, pollingRateLimit } from "../middleware/rateLimit.js";
import { Generation } from "../models/Generation.js";
import { refundCredits, reserveCredits } from "../services/credit.service.js";
import { deleteImage } from "../services/cloudinary.service.js";
import { generationQueue } from "../queue/generation.queue.js";
import { booleanPatchSchema, generateImageSchema, listGenerationsSchema } from "../validators/generation.schema.js";
import { assertFound, HttpError } from "../utils/httpError.js";

export const generationRouter = Router();

function serializeGeneration(g: any) {
  return {
    id: String(g._id),
    prompt: g.prompt,
    negative_prompt: g.negativePrompt,
    model: g.model,
    aspect_ratio: g.aspectRatio,
    seed: g.seed,
    cfg: g.cfg,
    nsfw: g.nsfw,
    image_url: g.imageUrl,
    is_favorite: g.isFavorite,
    is_public: g.isPublic,
    credits_spent: g.creditsSpent,
    status: g.status,
    failure_reason: g.failureReason,
    job_id: g.jobId,
    created_at: g.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

generationRouter.use(requireAuth);

generationRouter.get("/", async (req, res, next) => {
  try {
    const { user } = req as AuthedRequest;
    const query = listGenerationsSchema.parse(req.query);
    const filter: Record<string, unknown> = { userId: user.objectId };
    if (query.favoritesOnly) filter.isFavorite = true;
    if (query.cursor) filter.createdAt = { $lt: new Date(query.cursor) };
    const rows = await Generation.find(filter).sort({ createdAt: -1 }).limit(query.limit + 1).lean();
    const hasMore = rows.length > query.limit;
    const items = rows.slice(0, query.limit);
    res.json({ items: items.map(serializeGeneration), next_cursor: hasMore ? items.at(-1)?.createdAt?.toISOString() ?? null : null });
  } catch (error) {
    next(error);
  }
});

generationRouter.post("/", generationRateLimit, async (req, res, next) => {
  try {
    const { user } = req as AuthedRequest;
    const data = generateImageSchema.parse(req.body);
    const idempotencyKey = req.get("Idempotency-Key")?.trim().slice(0, 128) || null;
    if (idempotencyKey) {
      const existing = await Generation.findOne({ userId: user.objectId, idempotencyKey }).lean();
      if (existing) return res.status(202).json(serializeGeneration(existing));
    }
    const jobId = idempotencyKey ? `${user.id}:${idempotencyKey}` : randomUUID();
    const doc = await Generation.create({
      userId: user.objectId,
      prompt: data.prompt,
      negativePrompt: data.negative_prompt ?? null,
      model: data.model,
      aspectRatio: data.aspect_ratio,
      seed: data.seed ?? null,
      cfg: data.cfg ?? null,
      nsfw: data.nsfw,
      imageUrl: null,
      cloudinaryPublicId: null,
      isPublic: data.is_public,
      creditsSpent: env.CREDITS_PER_IMAGE,
      jobId: jobId ?? undefined,
      idempotencyKey,
      status: "queued",
    });
    try {
      await reserveCredits({ userId: user.objectId, amount: env.CREDITS_PER_IMAGE, generationId: doc._id });
      await generationQueue.add("generate" as never, { generationId: String(doc._id), userId: user.id, prompt: data.prompt, negativePrompt: data.negative_prompt, model: data.model, aspectRatio: data.aspect_ratio, seed: data.seed, cfg: data.cfg }, { jobId: doc.jobId.replace(/:/g, "-") });
    } catch (error) {
      await Generation.deleteOne({ _id: doc._id });
      await refundCredits({ userId: user.objectId, amount: env.CREDITS_PER_IMAGE, generationId: doc._id }).catch(() => undefined);
      throw error;
    }
    res.status(202).json(serializeGeneration(doc));
  } catch (error) {
    if (error instanceof Error && (error as { code?: number }).code === 11000 && req.get("Idempotency-Key")) {
      const existing = await Generation.findOne({ userId: (req as AuthedRequest).user.objectId, idempotencyKey: req.get("Idempotency-Key") }).lean();
      if (existing) return res.status(202).json(serializeGeneration(existing));
    }
    next(error);
  }
});

generationRouter.get("/:id", pollingRateLimit, async (req, res, next) => {
  try {
    const { user } = req as AuthedRequest;
    const doc = assertFound(await Generation.findOne({ _id: req.params.id, userId: user.objectId }).lean(), "Generation not found");
    res.json(serializeGeneration(doc));
  } catch (error) {
    next(error);
  }
});

generationRouter.patch("/:id/favorite", async (req, res, next) => {
  try {
    const { user } = req as AuthedRequest;
    const data = booleanPatchSchema.parse(req.body);
    const doc = assertFound(
      await Generation.findOneAndUpdate(
        { _id: req.params.id, userId: user.objectId },
        { isFavorite: data.value },
        { new: true },
      ),
      "Generation not found",
    );
    res.json(serializeGeneration(doc));
  } catch (error) {
    next(error);
  }
});

generationRouter.patch("/:id/public", async (req, res, next) => {
  try {
    const { user } = req as AuthedRequest;
    const data = booleanPatchSchema.parse(req.body);
    const doc = assertFound(
      await Generation.findOneAndUpdate(
        { _id: req.params.id, userId: user.objectId },
        { isPublic: data.value },
        { new: true },
      ),
      "Generation not found",
    );
    res.json(serializeGeneration(doc));
  } catch (error) {
    next(error);
  }
});

generationRouter.delete("/:id", async (req, res, next) => {
  try {
    const { user } = req as AuthedRequest;
    const doc = assertFound(await Generation.findOneAndDelete({ _id: req.params.id, userId: user.objectId }), "Generation not found");
    await deleteImage(doc.cloudinaryPublicId);
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === "CastError") return next(new HttpError(404, "Generation not found"));
    next(error);
  }
});
