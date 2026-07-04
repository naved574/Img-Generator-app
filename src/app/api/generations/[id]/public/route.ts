import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "../../../_lib/auth";
import { ensureMongo } from "../../../_lib/db";
import { jsonError } from "../../../_lib/errors";
import { serializeGeneration } from "../../../_lib/serializers";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    await ensureMongo();
    const [{ id }, user] = await Promise.all([context.params, requireAuth(request)]);
    const [{ Generation }, { booleanPatchSchema }, { assertFound }] = await Promise.all([
      import("../../../../../../backend/dist/models/Generation.js"),
      import("../../../../../../backend/dist/validators/generation.schema.js"),
      import("../../../../../../backend/dist/utils/httpError.js"),
    ]);
    const data = booleanPatchSchema.parse(await request.json());
    const doc = assertFound(
      await Generation.findOneAndUpdate({ _id: id, userId: user.objectId }, { isPublic: data.value }, { new: true }),
      "Generation not found",
    );
    return NextResponse.json(serializeGeneration(doc));
  } catch (error) {
    return jsonError(error);
  }
}
