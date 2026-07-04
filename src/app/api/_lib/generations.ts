import type { NextAuthUser } from "./auth";
import { serializeGeneration } from "./serializers";

export async function createGeneration(user: NextAuthUser, body: unknown) {
  const [
    { env },
    { Generation },
    { generateImageSchema },
    { assertCanSpend, spendCredits },
    { deleteImage, uploadImageBuffer },
    { generateImageWithHuggingFace },
  ] = await Promise.all([
    import("../../../../backend/dist/config/env.js"),
    import("../../../../backend/dist/models/Generation.js"),
    import("../../../../backend/dist/validators/generation.schema.js"),
    import("../../../../backend/dist/services/credit.service.js"),
    import("../../../../backend/dist/services/cloudinary.service.js"),
    import("../../../../backend/dist/services/huggingface.service.js"),
  ]);
  const data = generateImageSchema.parse(body);
  await assertCanSpend(user.objectId, env.CREDITS_PER_IMAGE);
  const generated = await generateImageWithHuggingFace({
    prompt: data.prompt,
    negativePrompt: data.negative_prompt,
    model: data.model,
    aspectRatio: data.aspect_ratio,
    seed: data.seed,
    cfg: data.cfg,
  });
  const uploaded = await uploadImageBuffer(generated.buffer, `lumen/generations/${user.id}`);
  const doc = await Generation.create({
    userId: user.objectId,
    prompt: data.prompt,
    negativePrompt: data.negative_prompt ?? null,
    model: data.model,
    aspectRatio: data.aspect_ratio,
    seed: data.seed ?? null,
    cfg: data.cfg ?? null,
    nsfw: data.nsfw,
    imageUrl: uploaded.secure_url,
    cloudinaryPublicId: uploaded.public_id,
    isPublic: data.is_public,
    creditsSpent: env.CREDITS_PER_IMAGE,
  });
  try {
    await spendCredits({ userId: user.objectId, amount: env.CREDITS_PER_IMAGE, generationId: doc._id });
  } catch (error) {
    await Promise.all([Generation.deleteOne({ _id: doc._id }), deleteImage(uploaded.public_id)]);
    throw error;
  }
  return serializeGeneration(doc);
}
