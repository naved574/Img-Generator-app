import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "../_lib/auth";
import { ensureMongo } from "../_lib/db";
import { jsonError } from "../_lib/errors";
import { createGeneration } from "../_lib/generations";
import { serializeGeneration } from "../_lib/serializers";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    await ensureMongo();
    const user = await requireAuth(request);
    const [{ Generation }, { listGenerationsSchema }] = await Promise.all([
      import("../../../../backend/dist/models/Generation.js"),
      import("../../../../backend/dist/validators/generation.schema.js"),
    ]);
    const query = listGenerationsSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const filter: Record<string, unknown> = { userId: user.objectId };
    if (query.favoritesOnly) filter.isFavorite = true;
    const rows = await Generation.find(filter).sort({ createdAt: -1 }).limit(query.limit);
    return NextResponse.json(rows.map(serializeGeneration));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureMongo();
    const user = await requireAuth(request);
    return NextResponse.json(await createGeneration(user, await request.json()), { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
