import { NextResponse, type NextRequest } from "next/server";

import { optionalAuth } from "../../_lib/auth";
import { clearRefreshCookie } from "../../_lib/cookies";
import { ensureMongo } from "../../_lib/db";
import { jsonError } from "../../_lib/errors";

export async function POST(request: NextRequest) {
  try {
    await ensureMongo();
    const [{ logout }, user] = await Promise.all([
      import("../../../../../backend/dist/services/auth.service.js"),
      optionalAuth(request),
    ]);
    await logout(user?.id ?? null);
    const response = NextResponse.json({ ok: true });
    clearRefreshCookie(response);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
