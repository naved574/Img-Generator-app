import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "../../_lib/auth";
import { ensureMongo } from "../../_lib/db";
import { jsonError } from "../../_lib/errors";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: Context) {
  try {
    await ensureMongo();
    const [{ id }, user] = await Promise.all([context.params, requireAuth(request)]);
    const [{ Generation }, { deleteImage }, { assertFound }] = await Promise.all([
      import("../../../../../backend/dist/models/Generation.js"),
      import("../../../../../backend/dist/services/cloudinary.service.js"),
      import("../../../../../backend/dist/utils/httpError.js"),
    ]);
    const doc = assertFound(
      await Generation.findOneAndDelete({ _id: id, userId: user.objectId }),
      "Generation not found",
    );
    await deleteImage(doc.cloudinaryPublicId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
