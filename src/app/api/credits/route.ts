import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "../_lib/auth";
import { ensureMongo } from "../_lib/db";
import { jsonError } from "../_lib/errors";
import { serializeCredits } from "../_lib/serializers";

export async function GET(request: NextRequest) {
  try {
    await ensureMongo();
    const user = await requireAuth(request);
    const { getCreditBalance } = await import("../../../../backend/dist/services/credit.service.js");
    return NextResponse.json(serializeCredits(await getCreditBalance(user.objectId)));
  } catch (error) {
    return jsonError(error);
  }
}
