import mongoose, { Schema, model, Types, type InferSchemaType } from "mongoose";

const generationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    prompt: { type: String, required: true, maxlength: 2000 },
    negativePrompt: { type: String, default: null, maxlength: 1000 },
    model: { type: String, required: true },
    aspectRatio: { type: String, required: true },
    seed: { type: Number, default: null },
    cfg: { type: Number, default: null },
    nsfw: { type: Boolean, default: false },
    imageUrl: { type: String, default: null },
    cloudinaryPublicId: { type: String, default: null },
    isFavorite: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    creditsSpent: { type: Number, required: true },
    jobId: { type: String, required: true, unique: true, index: true },
    idempotencyKey: { type: String, default: null },
    status: { type: String, enum: ["queued", "processing", "completed", "failed", "cancelled"], default: "queued", index: true },
    failureReason: { type: String, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

generationSchema.index({ userId: 1, createdAt: -1 });
generationSchema.index({ userId: 1, isFavorite: 1, createdAt: -1 });
generationSchema.index({ isPublic: 1, createdAt: -1 });
generationSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

export type GenerationDocument = InferSchemaType<typeof generationSchema> & {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
};

export const Generation = mongoose.models.Generation || model("Generation", generationSchema);
