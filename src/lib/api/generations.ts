import { api } from "./client";
import type { Generation, GenerationPage } from "./types";
import type { AspectRatio } from "@/utils/aspectRatio";

export function generateImage(input: {
  prompt: string;
  negative_prompt?: string | null;
  aspect_ratio: AspectRatio;
  seed?: number | null;
  cfg?: number | null;
  nsfw?: boolean;
  is_public?: boolean;
  model?: string;
}) {
  return api<Generation>("/api/generations", {
    method: "POST",
    body: input,
    timeoutMs: 20_000,
    headers: { "Idempotency-Key": crypto.randomUUID() },
  });
}

export async function waitForGeneration(id: string) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const generation = await api<Generation>(`/api/generations/${id}`, { timeoutMs: 10_000 });
    if (generation.status === "completed") return generation;
    if (generation.status === "failed" || generation.status === "cancelled") throw new Error(generation.failure_reason ?? "Generation failed.");
    await new Promise((resolve) => window.setTimeout(resolve, Math.min(3000, 800 + attempt * 50)));
  }
  throw new Error("Generation is taking longer than expected. Check your gallery shortly.");
}

export async function generateAndWait(input: Parameters<typeof generateImage>[0]) {
  const queued = await generateImage(input);
  return waitForGeneration(queued.id);
}

export function listMyGenerations(input: { limit?: number; favoritesOnly?: boolean } = {}) {
  const params = new URLSearchParams();
  if (input.limit) params.set("limit", String(input.limit));
  if (input.favoritesOnly) params.set("favoritesOnly", "true");
  const suffix = params.toString() ? `?${params}` : "";
  return api<GenerationPage>(`/api/generations${suffix}`).then((page) => page.items);
}

export function toggleFavorite(input: { id: string; value: boolean }) {
  return api<Generation>(`/api/generations/${input.id}/favorite`, {
    method: "PATCH",
    body: { value: input.value },
  });
}

export function togglePublic(input: { id: string; value: boolean }) {
  return api<Generation>(`/api/generations/${input.id}/public`, {
    method: "PATCH",
    body: { value: input.value },
  });
}

export function deleteGeneration(input: { id: string }) {
  return api<{ ok: true }>(`/api/generations/${input.id}`, { method: "DELETE" });
}
