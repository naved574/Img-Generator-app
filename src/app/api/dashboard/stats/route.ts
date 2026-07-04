import { NextResponse, type NextRequest } from "next/server";

import { requireAuth } from "../../_lib/auth";
import { ensureMongo } from "../../_lib/db";
import { jsonError } from "../../_lib/errors";
import { serializeCredits } from "../../_lib/serializers";

export async function GET(request: NextRequest) {
  try {
    await ensureMongo();
    const user = await requireAuth(request);
    const [{ Generation }, { getCreditBalance }] = await Promise.all([
      import("../../../../../backend/dist/models/Generation.js"),
      import("../../../../../backend/dist/services/credit.service.js"),
    ]);
    const since = new Date(Date.now() - 7 * 86400_000);
    const [totalImages, recent, credits] = await Promise.all([
      Generation.countDocuments({ userId: user.objectId }),
      Generation.find({ userId: user.objectId, createdAt: { $gte: since } }).select("creditsSpent"),
      getCreditBalance(user.objectId),
    ]);
    const spent7d = recent.reduce((sum: number, item: any) => sum + (item.creditsSpent ?? 0), 0);
    return NextResponse.json({ totalImages, spent7d, images7d: recent.length, credits: serializeCredits(credits) });
  } catch (error) {
    return jsonError(error);
  }
}
