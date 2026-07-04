import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(here, "../../.env"), quiet: true });

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  HF_TOKEN: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  DAILY_CREDIT_ALLOWANCE: z.coerce.number().int().positive().default(50),
  CREDITS_PER_IMAGE: z.coerce.number().int().positive().default(10),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid backend environment:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
